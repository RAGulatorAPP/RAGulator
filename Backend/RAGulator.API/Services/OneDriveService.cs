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

        var result = new List<object>();
        try
        {
            // 1. Intentar Drives globales (SharePoint/Shared)
            var url = "https://graph.microsoft.com/v1.0/drives";
            var output = RunCurl(url, "GET", null, token);
            Console.WriteLine($"[OneDriveService] Drives Globales Response: {output.Length}");
            
            using var doc = JsonDocument.Parse(output);
            if (doc.RootElement.TryGetProperty("value", out var valueProp))
            {
                foreach (var d in valueProp.EnumerateArray()) {
                    result.Add(new {
                        id = d.GetProperty("id").GetString(),
                        name = d.TryGetProperty("name", out var n) ? n.GetString() : "OneDrive Shared",
                        driveType = d.GetProperty("driveType").GetString(),
                        owner = d.TryGetProperty("owner", out var o) && o.TryGetProperty("user", out var u) ? u.GetProperty("displayName").GetString() : "Shared"
                    });
                }
            }

            // 2. Si no hay nada, intentar listar los primeros 5 usuarios y sus drives personals (Opcional, pero ayuda en POCs)
            if (result.Count == 0) {
                Console.WriteLine("[OneDriveService] No se encontraron drives globales. Buscando drives de usuarios...");
                var usersUrl = "https://graph.microsoft.com/v1.0/users?$top=5&$select=id,displayName,userPrincipalName";
                var usersOutput = RunCurl(usersUrl, "GET", null, token);
                using var usersDoc = JsonDocument.Parse(usersOutput);
                if (usersDoc.RootElement.TryGetProperty("value", out var usersVal)) {
                    foreach (var u in usersVal.EnumerateArray()) {
                        var uid = u.GetProperty("id").GetString();
                        var uname = u.GetProperty("displayName").GetString();
                        var driveUrl = $"https://graph.microsoft.com/v1.0/users/{uid}/drive";
                        var driveOutput = RunCurl(driveUrl, "GET", null, token);
                        if (!string.IsNullOrEmpty(driveOutput) && driveOutput.Contains("\"id\"")) {
                            using var dDoc = JsonDocument.Parse(driveOutput);
                            result.Add(new {
                                id = dDoc.RootElement.GetProperty("id").GetString(),
                                name = $"OneDrive de {uname}",
                                driveType = "personal",
                                owner = uname
                            });
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[OneDriveService] Error al obtener drives: {ex.Message}");
        }
        return result;
    }

    public async Task<object?> ResolveSharingLinkAsync(string shareUrl)
    {
        var token = await GetAccessTokenAsync();
        if (token == null) return null;

        string finalUrl = shareUrl;
        try
        {
            // 1. Si es un link acortado (1drv.ms), expandirlo siguiendo redirecciones con curl
            if (shareUrl.Contains("1drv.ms")) {
                Console.WriteLine($"[OneDriveService] Link acortado detectado. Expandiendo: {shareUrl}");
                var expandArgs = $"-s -o /dev/null -I -w \"%{{url_effective}}\" -L \"{shareUrl}\"";
                // En Windows /dev/null no existe, usar NUL
                if (System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(System.Runtime.InteropServices.OSPlatform.Windows)) {
                     expandArgs = $"-s -o NUL -I -w \"%{{url_effective}}\" -L \"{shareUrl}\"";
                }
                
                var psi = new ProcessStartInfo("curl", expandArgs) { RedirectStandardOutput = true, UseShellExecute = false, CreateNoWindow = true };
                using (var p = Process.Start(psi)) {
                    finalUrl = p?.StandardOutput.ReadToEnd().Trim() ?? shareUrl;
                }
                Console.WriteLine($"[OneDriveService] Link expandido: {finalUrl}");
            }

            // 2. Codificar URL para Graph /shares/u!{base64url}
            string base64Value = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(finalUrl));
            string encodedUrl = "u!" + base64Value.Replace("/", "_").Replace("+", "-").TrimEnd('=');
            
            var url = $"https://graph.microsoft.com/v1.0/shares/{encodedUrl}/driveItem";
            Console.WriteLine($"[OneDriveService] Consultando Graph Shares: {url}");
            var output = RunCurl(url, "GET", null, token);
            Console.WriteLine($"[OneDriveService] Graph Response: {output}");
            
            using var doc = JsonDocument.Parse(output);
            if (doc.RootElement.TryGetProperty("id", out var idProp))
            {
                var parentRef = doc.RootElement.GetProperty("parentReference");
                var driveId = parentRef.GetProperty("driveId").GetString() ?? "";
                
                return new {
                    id = idProp.GetString(),
                    name = doc.RootElement.GetProperty("name").GetString(),
                    driveId = driveId,
                    isFolder = doc.RootElement.TryGetProperty("folder", out _)
                };
            }

            // 3. Fallback para OneDrive Personal (Consumer) si falla el share
            // Intentar extraer CID y resid del link expandido sin HttpUtility (para evitar dependencias extra)
            var uri = new Uri(finalUrl);
            var query = uri.Query.TrimStart('?');
            var parts = query.Split('&');
            var cid = parts.FirstOrDefault(p => p.StartsWith("cid="))?.Split('=')[1];
            var resid = parts.FirstOrDefault(p => p.StartsWith("resid="))?.Split('=')[1];
            
            if (!string.IsNullOrEmpty(cid) && !string.IsNullOrEmpty(resid)) {
                // Decodificar resid si tiene %21 (que es !)
                var cleanResid = Uri.UnescapeDataString(resid);
                Console.WriteLine($"[OneDriveService] Intentando acceso directo a Personal CID: {cid}, ResID: {cleanResid}");
                
                // Intentar via Graph primero
                var directUrl = $"https://graph.microsoft.com/v1.0/drives/{cid}/items/{cleanResid}";
                var directOutput = RunCurl(directUrl, "GET", null, token);
                
                if (directOutput.Contains("Tenant does not have a SPO license") || directOutput.Contains("error")) {
                    Console.WriteLine("[OneDriveService] Graph falló. Intentando via api.onedrive.com /shares/ (SIN TOKEN)...");
                    var consumerShareUrl = $"https://api.onedrive.com/v1.0/shares/u!{base64Value.Replace("/", "_").Replace("+", "-").TrimEnd('=')}/driveItem";
                    directOutput = RunCurl(consumerShareUrl, "GET", null, null);
                    Console.WriteLine($"[OneDriveService] Consumer Shares (No Token) Response: {directOutput}");
                }

                using var ddoc = JsonDocument.Parse(directOutput);
                if (ddoc.RootElement.TryGetProperty("id", out var did)) {
                    var r = new {
                        id = did.GetString(),
                        name = ddoc.RootElement.GetProperty("name").GetString(),
                        driveId = cid,
                        isFolder = ddoc.RootElement.TryGetProperty("folder", out _)
                    };
                    Console.WriteLine($"[OneDriveService] Link resuelto exitosamente para {r.name} (Drive: {r.driveId})");
                    return r;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[OneDriveService] Error resolviendo link: {ex.Message}");
        }
        return null;
    }

    public async Task<List<object>> GetDriveItemsAsync(string driveId, string itemId = "root")
    {
        var token = await GetAccessTokenAsync();
        if (token == null) return new List<object>();

        try
        {
            var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/children";
            Console.WriteLine($"[OneDriveService] GetDriveItems (Graph): {url}");
            var output = RunCurl(url, "GET", null, token);
            
            if (output.Contains("Tenant does not have a SPO license") || output.Contains("error")) {
                Console.WriteLine("[OneDriveService] GetItems (Graph) falló. Intentando via api.onedrive.com...");
                // Intentar via shares si el driveId parece un CID personal (16 hex)
                if (driveId.Length == 16) {
                     url = $"https://api.onedrive.com/v1.0/drives/{driveId}/items/{itemId}/children";
                     output = RunCurl(url, "GET", null, null);
                }
                
                if (output.Contains("error") || output.Length < 100) {
                     Console.WriteLine("[OneDriveService] Items: Intentando via consumer shares...");
                     // Si no tenemos el share link original aqui, es mas dificil. 
                     // Pero si el itemId no es 'root', podemos intentar acceso directo sin token
                     url = $"https://api.onedrive.com/v1.0/drives/{driveId}/items/{itemId}/children";
                     output = RunCurl(url, "GET", null, null);
                }
            }

            using var doc = JsonDocument.Parse(output);
            if (doc.RootElement.TryGetProperty("value", out var valueProp))
            {
                var items = valueProp.EnumerateArray().Select(i => (object)new {
                    id = i.GetProperty("id").GetString(),
                    name = i.GetProperty("name").GetString(),
                    isFolder = i.TryGetProperty("folder", out _),
                    size = i.GetProperty("size").GetInt64(),
                    lastModified = i.GetProperty("lastModifiedDateTime").GetDateTime()
                }).ToList();
                Console.WriteLine($"[OneDriveService] Retornando {items.Count} items.");
                return items;
            }
            else {
                Console.WriteLine($"[OneDriveService] No se encontraron items en la respuesta: {output}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[OneDriveService] Error al obtener items de {driveId}/{itemId}: {ex.Message}");
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
            var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{folderId}/children?$filter=endsWith(name,'.pdf')";
            var output = RunCurl(url, "GET", null, token);

            if (output.Contains("Tenant does not have a SPO license")) {
                Console.WriteLine("[OneDriveService] Sync: Graph falló por licencia. Intentando via api.onedrive.com...");
                // Nota: api.onedrive.com puede no soportar el mismo $filter de OData, probamos sin filtro si falla
                url = $"https://api.onedrive.com/v1.0/drives/{driveId}/items/{folderId}/children";
                output = RunCurl(url, "GET", null, null);
            }
            
            using var doc = JsonDocument.Parse(output);
            if (doc.RootElement.TryGetProperty("value", out var valueProp))
            {
                foreach (var item in valueProp.EnumerateArray())
                {
                    var fileId = item.GetProperty("id").GetString();
                    var fileName = item.GetProperty("name").GetString();
                    
                    // Filtrar PDF manualmente si usamos el consumer API sin $filter
                    if (!fileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase)) continue;

                    try {
                        // En personal OneDrive, la URL de descarga tambien cambia si Graph falla
                        var downloadUrl = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{fileId}/content";
                        var tempFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString() + ".pdf");
                        
                        var downloadArgs = $"-s -L -X GET \"{downloadUrl}\" -H \"Authorization: Bearer {token}\" -o \"{tempFile}\"";
                        var psi = new ProcessStartInfo("curl", downloadArgs) { CreateNoWindow = true, UseShellExecute = false };
                        using (var p = Process.Start(psi)) { p?.WaitForExit(20000); }

                        // Si la descarga de Graph falló (archivo vacío o error en el contenido), intentar con Consumer API (SIN TOKEN)
                        if (!File.Exists(tempFile) || new FileInfo(tempFile).Length < 100) {
                             downloadUrl = $"https://api.onedrive.com/v1.0/drives/{driveId}/items/{fileId}/content";
                             downloadArgs = $"-s -L -X GET \"{downloadUrl}\" -o \"{tempFile}\""; // Sin Authorization header
                             using (var p = Process.Start(new ProcessStartInfo("curl", downloadArgs) { CreateNoWindow = true, UseShellExecute = false })) { p?.WaitForExit(20000); }
                        }

                        if (File.Exists(tempFile) && new FileInfo(tempFile).Length > 0)
                        {
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
