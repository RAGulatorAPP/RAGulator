using Azure;
using Azure.Identity;
using Azure.AI.DocumentIntelligence;
using Azure.Search.Documents;
using Azure.Search.Documents.Models;
using Azure.Search.Documents.Indexes;
using Azure.Search.Documents.Indexes.Models;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Configuration;
using RAGulator.API.Configuration;

namespace RAGulator.API.Services;

public class DocumentIngestionService
{
    private readonly DocumentIntelligenceClient? _documentIntelligenceClient;
    private readonly SearchClient? _searchClient;
    private readonly SearchIndexClient? _searchIndexClient;
    private readonly BlobServiceClient? _blobServiceClient;
    
    private readonly string _indexName;
    private readonly string _containerName;

    public DocumentIngestionService(
        IOptions<AzureDocumentIntelligenceConfig> docConfig, 
        IOptions<AzureAISearchConfig> searchConfig,
        IOptions<AzureBlobStorageConfig> blobConfig,
        IConfiguration configuration)
    {
        var docIntel = docConfig.Value;
        var aiSearch = searchConfig.Value;

        if (!string.IsNullOrWhiteSpace(docIntel.Endpoint) && !docIntel.Endpoint.Contains("<"))
        {
            if (!string.IsNullOrWhiteSpace(docIntel.ApiKey))
            {
                _documentIntelligenceClient = new DocumentIntelligenceClient(new Uri(docIntel.Endpoint), new AzureKeyCredential(docIntel.ApiKey));
            }
            else
            {
                _documentIntelligenceClient = new DocumentIntelligenceClient(new Uri(docIntel.Endpoint), new DefaultAzureCredential());
            }
        }

        if (!string.IsNullOrWhiteSpace(aiSearch.Endpoint) && !aiSearch.Endpoint.Contains("<") && !aiSearch.Endpoint.Contains("placeholder"))
        {
            _indexName = aiSearch.IndexName;

            if (!string.IsNullOrWhiteSpace(aiSearch.ApiKey))
            {
                var cred = new AzureKeyCredential(aiSearch.ApiKey);
                _searchClient = new SearchClient(new Uri(aiSearch.Endpoint), aiSearch.IndexName, cred);
                _searchIndexClient = new SearchIndexClient(new Uri(aiSearch.Endpoint), cred);
            }
            else
            {
                var cred = new DefaultAzureCredential();
                _searchClient = new SearchClient(new Uri(aiSearch.Endpoint), aiSearch.IndexName, cred);
                _searchIndexClient = new SearchIndexClient(new Uri(aiSearch.Endpoint), cred);
            }
        }
        else
        {
            throw new InvalidOperationException("Las credenciales de configuración local no pasaron la validación de Entra ni de API Keys.");
        }
        
        _indexName = aiSearch.IndexName;
        _containerName = string.IsNullOrWhiteSpace(blobConfig.Value.Bucket) ? "documents" : blobConfig.Value.Bucket;
        
        var blobConnStr = blobConfig.Value.SecretConn;
        if (string.IsNullOrWhiteSpace(blobConnStr))
        {
            // Fallback: Intentar leer desde la sección "Connection Strings" estándar de Azure
            blobConnStr = configuration.GetConnectionString("AzureBlobStorage");
        }

        if (!string.IsNullOrWhiteSpace(blobConnStr))
        {
            _blobServiceClient = new BlobServiceClient(blobConnStr);
        }
    }

    public async Task<string> ProcessAndIndexDocumentAsync(Stream documentStream, string fileName)
    {
        if (_documentIntelligenceClient == null || _searchClient == null)
        {
            return $"[Simulación] Los servicios de Azure Search o Document Intelligence no están configurados. Documento {fileName} procesado simuladamente.";
        }

        try
        {
            // 1. Guardado en Almacenamiento Cíclico Físico (Azure Blob Storage)
            if (_blobServiceClient != null)
            {
                try
                {
                    var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
                    // Ahora que usamos Backend Proxy, el contenedor debe ser Privado por seguridad total.
                    await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);
                    
                    var blobClient = containerClient.GetBlobClient(fileName);
                    await blobClient.UploadAsync(documentStream, overwrite: true);
                    
                    // Rebobinar el Stream porque UploadAsync lo lee hasta el final
                    if (documentStream.CanSeek) documentStream.Position = 0;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[RAGulator Warning] El Blob Storage falló pero la Ingesta seguirá: {ex.Message}");
                }
            }

            // 2. Extraer Topología del Documento con Document Intelligence
            BinaryData fileData = await BinaryData.FromStreamAsync(documentStream);

            // Usamos WaitUntil.Completed para esperar sincrónicamente hasta que se parsee todo el PDF
            var operation = await _documentIntelligenceClient.AnalyzeDocumentAsync(WaitUntil.Completed, "prebuilt-layout", fileData);
            
            var result = operation.Value;
            string extractedText = result.Content;

            if (string.IsNullOrWhiteSpace(extractedText)) 
            {
                return "Advertencia: El documento fue procesado pero no se detectó texto.";
            }

            // 2. Estrategia de Fragmentación (Chunking) básica (1000 caracteres por fragmento)
            var chunks = ChunkText(extractedText, 1000);

            // 2.5 Verificar o Crear Índice RAG
            if (_searchIndexClient != null && !string.IsNullOrEmpty(_indexName))
            {
                await EnsureIndexExistsAsync(_searchIndexClient, _indexName);
            }

            // 3. Subir todos los fragmentos al índice RAG
            var batch = new IndexDocumentsBatch<SearchDocument>();
            int chunkId = 0;
            
            foreach (var chunk in chunks)
            {
                var doc = new SearchDocument
                {
                    ["id"] = Guid.NewGuid().ToString("N"), // Requisito de Azure Search: sin caracteres especiales
                    ["filepath"] = fileName,
                    ["title"] = fileName,
                    ["content"] = chunk
                };
                batch.Actions.Add(IndexDocumentsAction.Upload(doc));
                chunkId++;
            }

            await _searchClient.IndexDocumentsAsync(batch);

            return $"Documento '{fileName}' procesado e indexado en {chunkId} fragmentos correctamente.";
        }
        catch (RequestFailedException ex)
        {
            Console.WriteLine($"[RAGulator Ingestion Error] {ex.Message}");
            return $"Error durante la ingesta: {ex.Message}";
        }
    }

    public async Task<List<object>> GetUploadedDocumentsAsync()
    {
        if (_searchClient == null) return new List<object>();

        try
        {
            var options = new SearchOptions { Size = 1000 };
            options.Select.Add("filepath");

            var response = await _searchClient.SearchAsync<SearchDocument>("*", options);
            var allDocs = new List<string>();

            await foreach (var result in response.Value.GetResultsAsync())
            {
                if (result.Document.TryGetValue("filepath", out var filepath))
                {
                    allDocs.Add(filepath?.ToString() ?? "Desconocido");
                }
            }

            var uniqueDocs = allDocs
                .GroupBy(d => d)
                .Select(g => new
                {
                    id = Guid.NewGuid().ToString("N"),
                    name = g.Key,
                    fragments = g.Count(),
                    status = "Procesado",
                    date = DateTime.Now.ToString("dd/MM/yyyy"), // Azure Search no guarda la fecha a menos que se extienda el esquema
                    container = _indexName,
                    size = "-",
                    user = "Admin"
                }).Cast<object>().ToList();

            return uniqueDocs;
        }
        catch (RequestFailedException)
        {
            // Ocurre si el índice no existe todavía
            return new List<object>();
        }
    }

    public async Task<string> DeleteDocumentAsync(string fileName)
    {
        if (_searchClient == null) return "Servicio no configurado.";

        try
        {
            var options = new SearchOptions
            {
                Filter = $"filepath eq '{fileName}'",
                Size = 1000 // Asumiendo max 1000 fragmentos por documento
            };
            options.Select.Add("id");

            var response = await _searchClient.SearchAsync<SearchDocument>("*", options);
            var batch = new IndexDocumentsBatch<SearchDocument>();
            int deletedCount = 0;

            await foreach (var result in response.Value.GetResultsAsync())
            {
                if (result.Document.TryGetValue("id", out var docId) && docId != null)
                {
                    batch.Actions.Add(IndexDocumentsAction.Delete("id", docId.ToString()));
                    deletedCount++;
                }
            }

            if (deletedCount > 0)
            {
                await _searchClient.IndexDocumentsAsync(batch);
                return $"Documento '{fileName}' eliminado ({deletedCount} fragmentos borrados de la Base Vectorial).";
            }

            return "El documento no fue encontrado.";
        }
        catch (RequestFailedException ex)
        {
            return $"Error al eliminar de Azure AI Search: {ex.Message}";
        }
        finally
        {
            // Borrar también del almacenamiento cíclico físico
            if (_blobServiceClient != null)
            {
                try
                {
                    var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
                    var blobClient = containerClient.GetBlobClient(fileName);
                    await blobClient.DeleteIfExistsAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[RAGulator Warning] Fallo al eliminar archivo del Blob: {ex.Message}");
                }
            }
        }
    }

    public async Task<int> GetIngestedDocumentCountAsync()
    {
        if (_blobServiceClient == null) return 0;
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            int count = 0;
            await foreach (var blob in containerClient.GetBlobsAsync())
            {
                count++;
            }
            return count;
        }
        catch { return 0; }
    }

    public async Task<Stream?> DownloadDocumentAsync(string fileName)
    {
        if (_blobServiceClient == null) return null;

        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(fileName);

            if (await blobClient.ExistsAsync())
            {
                var response = await blobClient.DownloadStreamingAsync();
                return response.Value.Content;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Azure Blob Storage] Error proxy descargando archivo: {ex.Message}");
        }

        return null;
    }

    private List<string> ChunkText(string text, int maxChars)
    {
        var chunks = new List<string>();
        for (int i = 0; i < text.Length; i += maxChars)
        {
            int length = Math.Min(maxChars, text.Length - i);
            chunks.Add(text.Substring(i, length));
        }
        return chunks;
    }

    private async Task EnsureIndexExistsAsync(SearchIndexClient indexClient, string indexName)
    {
        try
        {
            await indexClient.GetIndexAsync(indexName);
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            var searchIndex = new SearchIndex(indexName)
            {
                Fields =
                {
                    new SearchField("id", SearchFieldDataType.String) { IsKey = true, IsFilterable = true },
                    new SearchField("filepath", SearchFieldDataType.String) { IsSearchable = true, IsFilterable = true },
                    new SearchField("title", SearchFieldDataType.String) { IsSearchable = true },
                    new SearchField("content", SearchFieldDataType.String) { IsSearchable = true }
                }
            };
            await indexClient.CreateIndexAsync(searchIndex);
            Console.WriteLine($"[RAGulator] Índice de búsqueda '{indexName}' fue auto-creado exitosamente.");
        }
    }
}
