using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace RAGulator.API.Services;

/// <summary>
/// Provee acceso a Microsoft Graph API usando 'curl' en lugar de HttpClient
/// debido a restricciones de firewall/red en esta máquina que bloquean el SDK de .NET.
/// </summary>
public class GraphUsersService
{
    private readonly string _tenantId;
    private readonly string _clientId;
    private readonly string _clientSecret;
    private string? _accessToken;
    private DateTime _tokenExpiry = DateTime.MinValue;

    public GraphUsersService(IConfiguration config)
    {
        _tenantId = config["AzureAd:TenantId"] ?? "";
        _clientId = config["AzureAd:ClientId"] ?? "";
        _clientSecret = config["AzureAd:ClientSecret"] ?? "";
    }

    private string RunCurl(string url, string method = "GET", string? body = null, string? bearerToken = null, string contentType = "application/json")
    {
        // -g deshabilita globbing (evita problemas con [] {} en la URL)
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

        if (string.IsNullOrWhiteSpace(_tenantId) || string.IsNullOrWhiteSpace(_clientId) || string.IsNullOrWhiteSpace(_clientSecret))
        {
            Console.WriteLine("[Graph API] Error: Faltan credenciales (TenantId, ClientId or ClientSecret).");
            return null;
        }

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
            else 
            {
                Console.WriteLine($"[Graph API] Error en respuesta de token: {output}");
                return null;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Graph API] Excepción obteniendo token: {ex.Message}");
            return null;
        }
    }

    public async Task<List<object>> GetUsersWithRolesAsync()
    {
        var token = await GetAccessTokenAsync();
        if (token == null) return new List<object>();

        var result = new List<object>();
        JsonDocument? usersDoc = null;
        JsonDocument? spDoc = null;
        JsonDocument? assignmentsDoc = null;

        try
        {
            // 1. Obtener Usuarios
            Console.WriteLine("[Graph API] [CURL] Fetching users...");
            var usersJson = RunCurl("https://graph.microsoft.com/v1.0/users?$select=id,displayName,mail,userPrincipalName,accountEnabled,createdDateTime&$top=100", "GET", null, token);
            Console.WriteLine($"[Graph API] [DEBUG] Users Raw Length: {usersJson?.Length ?? 0}");
            
            if (string.IsNullOrWhiteSpace(usersJson) || !usersJson.TrimStart().StartsWith("{")) {
                Console.WriteLine($"[Graph API] Error: Respuesta de usuarios no es JSON: {usersJson}");
                return result;
            }

            usersDoc = JsonDocument.Parse(usersJson);
            if (!usersDoc.RootElement.TryGetProperty("value", out var usersValue)) {
                Console.WriteLine($"[Graph API] Error en respuesta de usuarios: {usersJson}");
                return result;
            }
            var users = usersValue.EnumerateArray().ToList();

            // 2. Obtener Service Principal de esta App
            Console.WriteLine("[Graph API] [CURL] Fetching Service Principal (Attempt 1)...");
            var spJson = RunCurl($"https://graph.microsoft.com/v1.0/servicePrincipals?$filter=appId%20eq%20'{_clientId}'&$select=id,appId,appRoles", "GET", null, token);
            Console.WriteLine($"[Graph API] [DEBUG] SP Raw Length: {spJson?.Length ?? 0}");
            
            if (string.IsNullOrWhiteSpace(spJson) || !spJson.TrimStart().StartsWith("{")) {
                 Console.WriteLine("[Graph API] Attempt 1 failed. Trying Attempt 2 (No filter)...");
                 spJson = RunCurl("https://graph.microsoft.com/v1.0/servicePrincipals?$select=id,appId,appRoles", "GET", null, token);
            }

            spDoc = JsonDocument.Parse(spJson);
            if (!spDoc.RootElement.TryGetProperty("value", out var spValue)) {
                Console.WriteLine($"[Graph API] Error: No 'value' in SP response: {spJson}");
                return result;
            }

            var spNodes = spValue.EnumerateArray();
            var sp = spNodes.FirstOrDefault(s => {
                string? aid = null;
                if (s.TryGetProperty("appId", out var a)) aid = a.GetString();
                else if (s.TryGetProperty("AppId", out var aP)) aid = aP.GetString();
                return aid == _clientId;
            });

            if (sp.ValueKind == JsonValueKind.Undefined)
            {
                Console.WriteLine("[Graph API] Error: No se encontró el Service Principal en la lista.");
                return users.Select(u => (object)new {
                    id = (u.TryGetProperty("id", out var id)) ? id.GetString() : "N/A",
                    displayName = (u.TryGetProperty("displayName", out var dn)) ? dn.GetString() : "N/A",
                    email = u.TryGetProperty("mail", out var m) ? m.GetString() : (u.TryGetProperty("userPrincipalName", out var upn) ? upn.GetString() : "N/A"),
                    enabled = (u.TryGetProperty("accountEnabled", out var en)) ? en.GetBoolean() : false,
                    createdAt = u.TryGetProperty("createdDateTime", out var c) ? c.GetDateTime().ToString("yyyy-MM-dd") : "N/A",
                    roles = new List<object>()
                }).ToList();
            }

            string? spId = null;
            if (sp.TryGetProperty("id", out var spIdProp)) spId = spIdProp.GetString();
            else if (sp.TryGetProperty("Id", out var spIdPropP)) spId = spIdPropP.GetString();

            if (spId == null) {
                Console.WriteLine("[Graph API] Error: SP no tiene ID.");
                return result;
            }

            List<JsonElement> appRoles = new List<JsonElement>();
            if (sp.TryGetProperty("appRoles", out var rolesProp)) appRoles = rolesProp.EnumerateArray().ToList();
            else if (sp.TryGetProperty("AppRoles", out var rolesPropP)) appRoles = rolesPropP.EnumerateArray().ToList();

            // 3. Obtener Asignaciones de Roles
            Console.WriteLine($"[Graph API] [CURL] Fetching role assignments for SP {spId}...");
            var assignmentsJson = RunCurl($"https://graph.microsoft.com/v1.0/servicePrincipals/{spId}/appRoleAssignedTo?$top=999", "GET", null, token);
            Console.WriteLine($"[Graph API] [DEBUG] Assignments Raw Length: {assignmentsJson?.Length ?? 0}");
            
            List<JsonElement> assignmentsList = new List<JsonElement>();
            if (!string.IsNullOrWhiteSpace(assignmentsJson) && assignmentsJson.TrimStart().StartsWith("{")) {
                assignmentsDoc = JsonDocument.Parse(assignmentsJson);
                if (assignmentsDoc.RootElement.TryGetProperty("value", out var assignmentsValue)) {
                    assignmentsList = assignmentsValue.EnumerateArray().ToList();
                    Console.WriteLine($"[Graph API] [DEBUG] Found {assignmentsList.Count} total assignments.");
                    if (assignmentsList.Any()) {
                        Console.WriteLine($"[Graph API] [DEBUG] Sample Assignment: {assignmentsList.First()}");
                    }
                }
            }

            foreach (var user in users)
            {
                string? userId = null;
                if (user.TryGetProperty("id", out var idProp)) userId = idProp.GetString();
                if (userId == null) continue;

                var userAssignments = assignmentsList.Where(a => 
                {
                    string? pid = null;
                    if (a.TryGetProperty("principalId", out var p)) pid = p.GetString();
                    else if (a.TryGetProperty("PrincipalId", out var pP)) pid = pP.GetString();
                    return string.Equals(pid, userId, StringComparison.OrdinalIgnoreCase);
                });

                var roles = userAssignments.Select(a =>
                {
                    string? roleId = null;
                    if (a.TryGetProperty("appRoleId", out var rid)) roleId = rid.GetString();
                    else if (a.TryGetProperty("AppRoleId", out var ridP)) roleId = ridP.GetString();

                    string? assignId = null;
                    if (a.TryGetProperty("id", out var aid)) assignId = aid.GetString();
                    else if (a.TryGetProperty("Id", out var aidP)) assignId = aidP.GetString();

                    var roleDef = appRoles.FirstOrDefault(r => 
                        (r.TryGetProperty("id", out var rId) && rId.GetString() == roleId)
                    );

                    return new
                    {
                        assignmentId = assignId ?? "Unknown",
                        roleId = roleId ?? "Unknown",
                        roleName = (roleDef.ValueKind != JsonValueKind.Undefined && roleDef.TryGetProperty("value", out var v)) ? v.GetString() : "Unknown",
                        roleDisplayName = (roleDef.ValueKind != JsonValueKind.Undefined && roleDef.TryGetProperty("displayName", out var d)) ? d.GetString() : "Unknown"
                    };
                }).ToList();

                result.Add(new
                {
                    id = userId,
                    displayName = (user.TryGetProperty("displayName", out var dn)) ? dn.GetString() : "N/A",
                    email = (user.TryGetProperty("mail", out var m) && !string.IsNullOrEmpty(m.GetString())) ? m.GetString() : 
                            (user.TryGetProperty("userPrincipalName", out var upn) ? upn.GetString() : "N/A"),
                    enabled = (user.TryGetProperty("accountEnabled", out var en)) ? en.GetBoolean() : false,
                    createdAt = user.TryGetProperty("createdDateTime", out var c) ? c.GetDateTime().ToString("yyyy-MM-dd") : "N/A",
                    roles = roles
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Graph API] Error en GetUsersWithRoles: {ex.Message}");
        }
        finally
        {
            usersDoc?.Dispose();
            spDoc?.Dispose();
            assignmentsDoc?.Dispose();
        }

        return result;
    }

    public async Task<List<object>> GetAvailableRolesAsync()
    {
        var token = await GetAccessTokenAsync();
        if (token == null) return new List<object>();

        try
        {
            var spJson = RunCurl($"https://graph.microsoft.com/v1.0/servicePrincipals?$filter=appId%20eq%20'{_clientId}'&$select=id,appId,appRoles", "GET", null, token);
            
            if (string.IsNullOrWhiteSpace(spJson) || !spJson.TrimStart().StartsWith("{")) {
                return new List<object>();
            }

            using var spDoc = JsonDocument.Parse(spJson);
            if (!spDoc.RootElement.TryGetProperty("value", out var spValue)) return new List<object>();
            
            var sp = spValue.EnumerateArray().FirstOrDefault(s => {
                string? aid = null;
                if (s.TryGetProperty("appId", out var a)) aid = a.GetString();
                else if (s.TryGetProperty("AppId", out var aP)) aid = aP.GetString();
                return aid == _clientId;
            });
            
            if (sp.ValueKind == JsonValueKind.Undefined) return new List<object>();

            List<JsonElement> appRoles = new List<JsonElement>();
            if (sp.TryGetProperty("appRoles", out var rProp)) appRoles = rProp.EnumerateArray().ToList();
            else if (sp.TryGetProperty("AppRoles", out var rPropP)) appRoles = rPropP.EnumerateArray().ToList();

            return appRoles
                .Where(r => {
                    bool enabled = false;
                    if (r.TryGetProperty("isEnabled", out var e)) enabled = e.GetBoolean();
                    else if (r.TryGetProperty("IsEnabled", out var eP)) enabled = eP.GetBoolean();
                    
                    if (!enabled) return false;

                    JsonElement memberTypes = default;
                    if (r.TryGetProperty("allowedMemberTypes", out var amt)) memberTypes = amt;
                    else if (r.TryGetProperty("AllowedMemberTypes", out var amtP)) memberTypes = amtP;

                    return memberTypes.ValueKind == JsonValueKind.Array && 
                           memberTypes.EnumerateArray().Any(t => t.GetString() == "User");
                })
                .Select(r => {
                    string? id = null;
                    if (r.TryGetProperty("id", out var i)) id = i.GetString();
                    else if (r.TryGetProperty("Id", out var iP)) id = iP.GetString();

                    string? val = null;
                    if (r.TryGetProperty("value", out var v)) val = v.GetString();
                    else if (r.TryGetProperty("Value", out var vP)) val = vP.GetString();

                    string? dn = null;
                    if (r.TryGetProperty("displayName", out var d)) dn = d.GetString();
                    else if (r.TryGetProperty("DisplayName", out var dP)) dn = dP.GetString();

                    return (object)new { 
                        id = id ?? "Unknown", 
                        value = val ?? "Unknown", 
                        displayName = dn ?? "Unknown", 
                        description = (r.TryGetProperty("description", out var desc) ? desc.GetString() : "") 
                    };
                })
                .ToList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Graph API] Error en GetAvailableRoles: {ex.Message}");
            return new List<object>();
        }
    }

    public async Task<object> AssignRoleAsync(string userId, string roleId)
    {
        var token = await GetAccessTokenAsync();
        if (token == null) return new { error = "No access token" };

        try
        {
            // 1. Obtener ID del Service Principal (robusto)
            var spJson = RunCurl($"https://graph.microsoft.com/v1.0/servicePrincipals?$filter=appId%20eq%20'{_clientId}'&$select=id,appId", "GET", null, token);
            if (string.IsNullOrWhiteSpace(spJson) || !spJson.TrimStart().StartsWith("{")) {
                 spJson = RunCurl($"https://graph.microsoft.com/v1.0/servicePrincipals?$select=id,appId", "GET", null, token);
            }

            using var spDoc = JsonDocument.Parse(spJson);
            if (!spDoc.RootElement.TryGetProperty("value", out var spValue)) return new { error = "No SP value found" };
            
            var sp = spValue.EnumerateArray().FirstOrDefault(s => {
                string? aid = null;
                if (s.TryGetProperty("appId", out var a)) aid = a.GetString();
                else if (s.TryGetProperty("AppId", out var aP)) aid = aP.GetString();
                return aid == _clientId;
            });

            if (sp.ValueKind == JsonValueKind.Undefined) return new { error = "SP not found" };
            
            string? spId = null;
            if (sp.TryGetProperty("id", out var idProp)) spId = idProp.GetString();
            else if (sp.TryGetProperty("Id", out var idPropP)) spId = idPropP.GetString();

            if (spId == null) return new { error = "SP has no ID" };

            // 2. Realizar la asignación
            var body = JsonSerializer.Serialize(new
            {
                principalId = userId,
                resourceId = spId,
                appRoleId = roleId
            });

            var url = $"https://graph.microsoft.com/v1.0/servicePrincipals/{spId}/appRoleAssignedTo";
            var response = RunCurl(url, "POST", body, token);
            
            if (string.IsNullOrWhiteSpace(response)) return new { success = true }; // A veces Graph devuelve 201 sin body

            if (response.TrimStart().StartsWith("{")) {
                using var resDoc = JsonDocument.Parse(response);
                if (resDoc.RootElement.TryGetProperty("id", out var idPropRes))
                    return new { success = true, assignmentId = idPropRes.GetString() };
            }
            
            return new { success = true, details = response };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Graph API] Error en AssignRole: {ex.Message}");
            return new { error = ex.Message };
        }
    }

    public async Task<object> RemoveRoleAsync(string assignmentId)
    {
        var token = await GetAccessTokenAsync();
        if (token == null) return new { error = "No access token" };

        try
        {
            var spJson = RunCurl($"https://graph.microsoft.com/v1.0/servicePrincipals?$filter=appId%20eq%20'{_clientId}'&$select=id,appId", "GET", null, token);
            if (string.IsNullOrWhiteSpace(spJson) || !spJson.TrimStart().StartsWith("{")) {
                spJson = RunCurl($"https://graph.microsoft.com/v1.0/servicePrincipals?$select=id,appId", "GET", null, token);
            }
            using var spDoc = JsonDocument.Parse(spJson);
            if (!spDoc.RootElement.TryGetProperty("value", out var spValue)) return new { error = "No SP value" };

            var sp = spValue.EnumerateArray().FirstOrDefault(s => {
                string? aid = null;
                if (s.TryGetProperty("appId", out var a)) aid = a.GetString();
                else if (s.TryGetProperty("AppId", out var aP)) aid = aP.GetString();
                return aid == _clientId;
            });

            if (sp.ValueKind == JsonValueKind.Undefined) return new { error = "SP not found" };

            string? spId = null;
            if (sp.TryGetProperty("id", out var idProp)) spId = idProp.GetString();
            else if (sp.TryGetProperty("Id", out var idPropP)) spId = idPropP.GetString();

            if (spId == null) return new { error = "SP has no ID" };

            var url = $"https://graph.microsoft.com/v1.0/servicePrincipals/{spId}/appRoleAssignedTo/{assignmentId}";
            RunCurl(url, "DELETE", null, token);
            return new { success = true };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Graph API] Error en RemoveRole: {ex.Message}");
            return new { error = ex.Message };
        }
    }
}
