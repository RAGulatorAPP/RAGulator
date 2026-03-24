namespace RAGulator.API.Configuration;

/// <summary>
/// Configuración de Azure AI Foundry (Reemplaza uso directo de OpenAI).
/// ApiKey se carga desde Azure Key Vault en runtime (secreto: AzureAIFoundry--ApiKey).
/// </summary>
public class AzureAIFoundryConfig
{
    public const string Section = "AzureAIFoundry";
    public string Endpoint { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string DeploymentName { get; set; } = "gpt-4o";
}

/// <summary>
/// Azure AI Search configuration.
/// ApiKey is loaded at runtime from Azure Key Vault (secret: AzureAISearch--ApiKey).
/// </summary>
public class AzureAISearchConfig
{
    public const string Section = "AzureAISearch";
    public string Endpoint { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string IndexName { get; set; } = "rag-index";
}

/// <summary>
/// Azure AI Document Intelligence configuration.
/// ApiKey is loaded at runtime from Azure Key Vault (secret: AzureDocumentIntelligence--ApiKey).
/// </summary>
public class AzureDocumentIntelligenceConfig
{
    public const string Section = "AzureDocumentIntelligence";
    public string Endpoint { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
}

public class AzureBlobStorageConfig
{
    public const string Section = "RAGStorage";
    public string SecretConn { get; set; } = string.Empty;
    public string Bucket { get; set; } = "documents";
}

/// <summary>
/// Azure Cosmos DB configuration.
/// ConnectionString is loaded at runtime from Azure Key Vault (secret: CosmosDB--ConnectionString).
/// </summary>
public class CosmosDBConfig
{
    public const string Section = "CosmosDB";
    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = "ragulator-db";
}

/// <summary>
/// Azure AI Content Safety configuration.
/// ApiKey and Endpoint loaded at runtime from Azure Key Vault / User Secrets.
/// </summary>
public class ContentSafetyConfig
{
    public const string Section = "AzureContentSafety";
    public string Endpoint { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
}
