using Azure;
using Azure.Identity;
using Azure.Search.Documents;
using Azure.Search.Documents.Models;
using Microsoft.Extensions.Options;
using RAGulator.API.Configuration;
using RAGulator.API.Models;

namespace RAGulator.API.Services;

public class SearchService
{
    private readonly SearchClient _searchClient;

    public SearchService(IOptions<AzureAISearchConfig> config)
    {
        var searchConfig = config.Value;

        if (string.IsNullOrWhiteSpace(searchConfig.Endpoint) || string.IsNullOrWhiteSpace(searchConfig.IndexName))
        {
            throw new InvalidOperationException("Falta la configuración de Endpoint o IndexName para Azure AI Search.");
        }

        Uri endpointUri = new Uri(searchConfig.Endpoint);

        // Soporte para Zero-Secrets (Managed Identity) o ApiKey
        if (!string.IsNullOrWhiteSpace(searchConfig.ApiKey))
        {
            _searchClient = new SearchClient(endpointUri, searchConfig.IndexName, new AzureKeyCredential(searchConfig.ApiKey));
        }
        else
        {
            _searchClient = new SearchClient(endpointUri, searchConfig.IndexName, new DefaultAzureCredential());
        }
    }

    /// <summary>
    /// Realiza una búsqueda por palabras clave (keyword search) en Azure AI Search.
    /// Recupera los fragmentos más relevantes y la lista formal de citaciones.
    /// </summary>
    public async Task<(string ContextText, List<Citation> Citations)> GetRelevantContextAsync(string queryText, int topK = 10)
    {
        try
        {
            var options = new SearchOptions
            {
                Size = topK,
                Select = { "content", "title", "filepath" } // Seleccionamos campos estándar comunes
            };

            var searchResults = await _searchClient.SearchAsync<SearchDocument>(queryText, options);
            var results = searchResults.Value.GetResultsAsync();

            var contextBuilder = new System.Text.StringBuilder();
            var citations = new List<Citation>();
            
            int count = 1;
            await foreach (var result in results)
            {
                var doc = result.Document;
                
                string content = doc.TryGetValue("content", out var c) ? c?.ToString() : "";
                if (string.IsNullOrEmpty(content) && doc.TryGetValue("text", out var t)) content = t?.ToString() ?? "";
                if (string.IsNullOrEmpty(content) && doc.TryGetValue("chunk", out var ch)) content = ch?.ToString() ?? "";

                string title = doc.TryGetValue("title", out var ti) ? ti?.ToString() : "Documento Desconocido";
                string filepath = doc.TryGetValue("filepath", out var fp) ? fp?.ToString() : "Archivo Desconocido";

                if (!string.IsNullOrEmpty(content))
                {
                    contextBuilder.AppendLine($"[Fuente - {count}] - {title}");
                    contextBuilder.AppendLine(content);
                    contextBuilder.AppendLine("---");
                    
                    citations.Add(new Citation(count, title, filepath, content, "#"));
                    count++;
                }
            }

            if (contextBuilder.Length == 0)
            {
                return ("", new List<Citation>());
            }

            return (contextBuilder.ToString(), citations);
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            Console.WriteLine($"[RAGulator Warning] Índice no encontrado o recurso no disponible. Simulando vacío. Error: {ex.Message}");
            return ("", new List<Citation>());
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[RAGulator Error] Error consultando IA Search: {ex.Message}");
            return ("", new List<Citation>()); // Fallback gracefully if search is not configured or fails
        }
    }
}
