using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace RAGulator.API.Services;

public class OneDriveService : IOneDriveService
{
    private readonly string _tenantId;
    private readonly string _clientId;
    private readonly string _clientSecret;
    private readonly DocumentIngestionService _ingestionService;
    private string? _accessToken;
    private DateTime _tokenExpiry = DateTime.MinValue;

    public OneDriveService(IConfiguration config, DocumentIngestionService ingestionService)
    {
        _tenantId = config["AzureAd:TenantId"] ?? "";
        _clientId = config["AzureAd:ClientId"] ?? "";
        _clientSecret = config["AzureAd:ClientSecret"] ?? "";
        _ingestionService = ingestionService;
    }

    private string RunCurl(string url, string method = "GET", string? body = null, string? bearerToken = null, string contentType = "application/json")
    {
        var args = $"-s -g -X {method} \"{url}\"";
        if (bearerToken != null)
            args += $" -H \"Authorization: Bearer {bearerToken}\"";
        
        if (body != null)
        {
            args += $" -H \"Content-Type: {contentType}\"";
            var escapedBody = body.Replace("\"", "\\\"");
            args += $" -d \"{escapedBody}\"";
        }

        var psi = new ProcessStartInfo("curl", args)
        {
            RedirectStandardOutput = true,
            UseShellExecute = false,
            CreateNoWindow = true,
        };

        using var proc = Process.Start(psi)!;
        var output = proc.StandardOutput.ReadToEnd();
        proc.WaitForExit(15000);
        return output;
    }

    private async Task<string?> GetAccessTokenAsync()
    {
        if (_accessToken != null && DateTime.UtcNow < _tokenExpiry)
            return _accessToken;

        try
        {
            var url = $"https://login.microsoftonline.com/{_tenantId}/oauth2/v2.0/token";
            var body = $"client_id={_clientId}&scope=https://graph.microsoft.com/.default&client_secret={_clientSecret}&grant_type=client_credentials";
            
            var output = RunCurl(url, "POST", body, null, "application/x-www-form-urlencoded");

            using var doc = JsonDocument.Parse(output);
            if (doc.RootElement.TryGetProperty("access_token", out var tokenProp))
            {
                _accessToken = tokenProp.GetString();
                if (doc.RootElement.TryGetProperty("expires_in", out var expiresProp)) {
                    _tokenExpiry = DateTime.UtcNow.AddSeconds(expiresProp.GetInt32() - 60);
                }
                return _accessToken;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[OneDriveService] Error obteniendo token: {ex.Message}");
        }
        return null;
    }

    public async Task<List<object>> GetDrivesAsync()
    {
        var token = await GetAccessTokenAsync();
        if (token == null) return new List<object>();

        try
        {
            // Listar drives de todo el tenant (requiere Files.Read.All o Sites.Read.All Application permissions)
            var url = "https://graph.microsoft.com/v1.0/drives";
            var output = RunCurl(url, "GET", null, token);
            
            using var doc = JsonDocument.Parse(output);
            if (doc.RootElement.TryGetProperty("value", out var valueProp))
            {
                return valueProp.EnumerateArray().Select(d => (object)new {
                    id = d.GetProperty("id").GetString(),
                    name = d.TryGetProperty("name", out var n) ? n.GetString() : "OneDrive",
                    driveType = d.GetProperty("driveType").GetString(),
                    owner = d.TryGetProperty("owner", out var o) && o.TryGetProperty("user", out var u) ? u.GetProperty("displayName").GetString() : "System"
                }).ToList();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[OneDriveService] Error al obtener drives: {ex.Message}");
        }
        return new List<object>();
    }

    public async Task<List<object>> GetDriveItemsAsync(string driveId, string itemId = "root")
    {
        var token = await GetAccessTokenAsync();
        if (token == null) return new List<object>();

        try
        {
            var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/children";
            var output = RunCurl(url, "GET", null, token);
            
            using var doc = JsonDocument.Parse(output);
            if (doc.RootElement.TryGetProperty("value", out var valueProp))
            {
                return valueProp.EnumerateArray().Select(i => (object)new {
                    id = i.GetProperty("id").GetString(),
                    name = i.GetProperty("name").GetString(),
                    isFolder = i.TryGetProperty("folder", out _),
                    size = i.GetProperty("size").GetInt64(),
                    lastModified = i.GetProperty("lastModifiedDateTime").GetDateTime()
                }).ToList();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[OneDriveService] Error al obtener items: {ex.Message}");
        }
        return new List<object>();
    }

    public async Task<string> SyncFolderAsync(string driveId, string folderId)
    {
        var token = await GetAccessTokenAsync();
        if (token == null) return "Error: No se pudo obtener el token de acceso.";

        int count = 0;
        int errors = 0;

        try
        {
            // 1. Obtener archivos de la carpeta (filtramos solo PDFs para simplificar el RAG)
            var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{folderId}/children?$filter=endsWith(name,'.pdf')";
            var output = RunCurl(url, "GET", null, token);
            
            using var doc = JsonDocument.Parse(output);
            if (doc.RootElement.TryGetProperty("value", out var valueProp))
            {
                foreach (var item in valueProp.EnumerateArray())
                {
                    var fileId = item.GetProperty("id").GetString();
                    var fileName = item.GetProperty("name").GetString();
                    
                    try {
                        // 2. Descargar contenido del archivo usando curl -o temporal
                        var downloadUrl = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{fileId}/content";
                        var tempFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString() + ".pdf");
                        
                        var downloadArgs = $"-s -L -X GET \"{downloadUrl}\" -H \"Authorization: Bearer {token}\" -o \"{tempFile}\"";
                        var psi = new ProcessStartInfo("curl", downloadArgs) { CreateNoWindow = true, UseShellExecute = false };
                        using (var p = Process.Start(psi)) { p?.WaitForExit(20000); }

                        if (File.Exists(tempFile))
                        {
                            // 3. Procesar con el IngestionService
                            using var stream = File.OpenRead(tempFile);
                            await _ingestionService.ProcessAndIndexDocumentAsync(stream, fileName);
                            count++;
                            
                            stream.Close();
                            File.Delete(tempFile);
                        }
                    }
                    catch (Exception ex) {
                        Console.WriteLine($"[OneDriveService] Fallo al procesar {fileName}: {ex.Message}");
                        errors++;
                    }
                }
            }
            return $"Sincronización completada: {count} archivos procesados, {errors} errores.";
        }
        catch (Exception ex)
        {
            return $"Error durante la sincronización: {ex.Message}";
        }
    }
}
