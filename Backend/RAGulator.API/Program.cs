using Azure.Identity;
using Azure.Extensions.AspNetCore.Configuration.Secrets;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using RAGulator.API.Configuration;
using RAGulator.API.Services;

var builder = WebApplication.CreateBuilder(args);

// =====================================================
// AUTENTICACIÓN (Microsoft Entra ID)
// =====================================================
var tenantId = builder.Configuration["AzureAd:TenantId"]!;
var clientId = builder.Configuration["AzureAd:ClientId"]!;

// Pre-descargar las llaves de firma (JWKS) al arranque usando curl
// (dotnet HttpClient tiene problemas de firewall en esta máquina, pero curl funciona)
Microsoft.IdentityModel.Tokens.JsonWebKeySet? jwks = null;
try
{
    string RunCurl(string url)
    {
        var psi = new System.Diagnostics.ProcessStartInfo("curl", $"-s \"{url}\"")
        {
            RedirectStandardOutput = true,
            UseShellExecute = false,
            CreateNoWindow = true,
        };
        using var proc = System.Diagnostics.Process.Start(psi)!;
        var output = proc.StandardOutput.ReadToEnd();
        proc.WaitForExit(15000);
        return output;
    }

    var openIdConfigUrl = $"https://login.microsoftonline.com/{tenantId}/v2.0/.well-known/openid-configuration";
    var configJson = RunCurl(openIdConfigUrl);
    var openIdConfig = System.Text.Json.JsonDocument.Parse(configJson);
    var jwksUri = openIdConfig.RootElement.GetProperty("jwks_uri").GetString()!;
    var jwksJson = RunCurl(jwksUri);
    jwks = new Microsoft.IdentityModel.Tokens.JsonWebKeySet(jwksJson);
    Console.WriteLine($"[AUTH BOOT] JWKS cargadas exitosamente: {jwks.Keys.Count} llaves de firma descargadas.");
}
catch (Exception ex)
{
    Console.WriteLine($"[AUTH BOOT] ADVERTENCIA: No se pudieron pre-descargar las JWKS: {ex.Message}");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://login.microsoftonline.com/{tenantId}/v2.0";
        
        // CRÍTICO: No remapear los claims del JWT a nombres XML largos de .NET
        options.MapInboundClaims = false;
        
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            // Audience: aceptar ambos formatos
            ValidAudiences = new[] { clientId, $"api://{clientId}" },
            
            // Issuers: tenant + cuentas personales Microsoft
            ValidIssuers = new[]
            {
                $"https://login.microsoftonline.com/{tenantId}/v2.0",
                "https://login.microsoftonline.com/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0",
            },
            
            // Mapear claims directamente desde el JWT v2.0
            NameClaimType = "name",
            RoleClaimType = "roles",
            
            // Inyectar las llaves de firma pre-descargadas
            ValidateIssuerSigningKey = true,
        };

        // Si logramos pre-descargar las JWKS, inyectar las llaves estáticas
        if (jwks != null)
        {
            options.TokenValidationParameters.IssuerSigningKeys = jwks.Keys;
            // Desactivar el auto-descubrimiento para evitar timeouts
            options.Configuration = new Microsoft.IdentityModel.Protocols.OpenIdConnect.OpenIdConnectConfiguration
            {
                Issuer = $"https://login.microsoftonline.com/{tenantId}/v2.0",
            };
            foreach (var key in jwks.Keys)
                options.Configuration.SigningKeys.Add(key);
        }
        
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = context =>
            {
                var name = context.Principal?.Identity?.Name ?? "Unknown";
                var roles = context.Principal?.FindAll("roles").Select(c => c.Value) ?? Array.Empty<string>();
                Console.WriteLine($"[AUTH OK] User: {name} | Roles: {string.Join(", ", roles)}");
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"[AUTH FAIL] {context.Exception.Message}");
                return Task.CompletedTask;
            }
        };
    });

// =====================================================
// FASE 1: ZERO-SECRETS POLICY — Azure Key Vault
// =====================================================
// Lee la URI del Key Vault desde appsettings.json (no es un secreto).
// DefaultAzureCredential funciona:
//   - Local:  con tu cuenta de `az login`
//   - Azure:  con la Managed Identity del App Service (sin contraseñas)
var keyVaultUri = builder.Configuration["KeyVault:Uri"];

if (!string.IsNullOrWhiteSpace(keyVaultUri))
{
    // DefaultAzureCredential evalúa las credenciales en orden:
    // 1. EnvironmentCredential (CI/CD env vars)
    // 2. WorkloadIdentityCredential (AKS)
    // 3. ManagedIdentityCredential (Azure App Service — producción)
    // 4. VisualStudioCredential / AzureCliCredential (desarrollo local)
    var credential = new DefaultAzureCredential(new DefaultAzureCredentialOptions
    {
        ExcludeInteractiveBrowserCredential = true, // No abrir ventana de browser
    });

    builder.Configuration.AddAzureKeyVault(new Uri(keyVaultUri), credential);
}

// =====================================================
// STRONGLY-TYPED CONFIG — IOptions<T>
// Los ApiKeys se inyectan aquí desde Key Vault automáticamente.
// Convención: secreto "AzureOpenAI--ApiKey" → config["AzureOpenAI:ApiKey"]
// =====================================================
builder.Services
    .Configure<AzureAIFoundryConfig>(builder.Configuration.GetSection(AzureAIFoundryConfig.Section))
    .Configure<AzureAISearchConfig>(builder.Configuration.GetSection(AzureAISearchConfig.Section))
    .Configure<AzureDocumentIntelligenceConfig>(builder.Configuration.GetSection(AzureDocumentIntelligenceConfig.Section))
    .Configure<CosmosDBConfig>(builder.Configuration.GetSection(CosmosDBConfig.Section))
    .Configure<AzureBlobStorageConfig>(builder.Configuration.GetSection(AzureBlobStorageConfig.Section))
    .Configure<ContentSafetyConfig>(builder.Configuration.GetSection(ContentSafetyConfig.Section));

// =====================================================
// SERVICIOS
// =====================================================
builder.Services.AddControllers();
builder.Services.AddSingleton<MockDataService>();
builder.Services.AddSingleton<SearchService>(); // Añadido RAG
builder.Services.AddSingleton<DocumentIngestionService>(); // Añadido Ingesta RAG
builder.Services.AddSingleton<ISystemConfigurationService, CosmosSystemConfigurationService>();
builder.Services.AddSingleton<FoundryChatService>();
builder.Services.AddSingleton<ITelemetryService, CosmosTelemetryService>();
builder.Services.AddSingleton<ChatHistoryService>();

// =====================================================
// CORS
// =====================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin => true) // Permite localhost:5173, 5174, etc.
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Opcional, por si en el futuro envías cookies/tokens
    });
});

var app = builder.Build();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
