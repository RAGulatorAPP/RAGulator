using Azure.Identity;
using Azure.Extensions.AspNetCore.Configuration.Secrets;
using RAGulator.API.Configuration;
using RAGulator.API.Services;

var builder = WebApplication.CreateBuilder(args);

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
    .Configure<AzureBlobStorageConfig>(builder.Configuration.GetSection(AzureBlobStorageConfig.Section));

// =====================================================
// SERVICIOS
// =====================================================
builder.Services.AddControllers();
builder.Services.AddSingleton<MockDataService>();
builder.Services.AddSingleton<SearchService>(); // Añadido RAG
builder.Services.AddSingleton<DocumentIngestionService>(); // Añadido Ingesta RAG
builder.Services.AddSingleton<FoundryChatService>();

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
app.MapControllers();

app.Run();
