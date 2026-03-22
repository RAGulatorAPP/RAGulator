using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using RAGulator.API.Configuration;
using RAGulator.API.Models;

namespace RAGulator.API.Services;

public class ChatHistoryService
{
    private readonly CosmosClient? _cosmosClient;
    private readonly string _databaseName;
    private const string ContainerName = "ChatSessions";

    public ChatHistoryService(IOptions<CosmosDBConfig> config)
    {
        _databaseName = config.Value.DatabaseName;
        if (!string.IsNullOrWhiteSpace(config.Value.ConnectionString))
        {
            _cosmosClient = new CosmosClient(config.Value.ConnectionString);
        }
    }

    private async Task<Container?> GetContainerAsync()
    {
        if (_cosmosClient == null) return null;
        var db = await _cosmosClient.CreateDatabaseIfNotExistsAsync(_databaseName);
        var container = await db.Database.CreateContainerIfNotExistsAsync(ContainerName, "/userId");
        return container.Container;
    }

    /// <summary>
    /// Devuelve la lista de sesiones del usuario (sin mensajes, para la sidebar).
    /// </summary>
    public async Task<List<object>> GetSessionsAsync(string userId)
    {
        try 
        {
            var container = await GetContainerAsync();
            if (container == null) return new List<object>();

            var query = new QueryDefinition(
                "SELECT c.id, c.title, c.updatedAt FROM c WHERE c.userId = @uid ORDER BY c.updatedAt DESC"
            ).WithParameter("@uid", userId);

            var results = new List<object>();
            using var iterator = container.GetItemQueryIterator<dynamic>(query, requestOptions: new QueryRequestOptions
            {
                PartitionKey = new PartitionKey(userId)
            });

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                foreach (var item in response)
                {
                    results.Add(new
                    {
                        id = (string)(item.id ?? item.Id),
                        title = (string)(item.title ?? item.Title ?? "Sin título"),
                        updatedAt = (DateTime)(item.updatedAt ?? item.UpdatedAt ?? DateTime.UtcNow)
                    });
                }
            }
            return results;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ChatHistoryService] ERROR in GetSessionsAsync: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
            throw; // Re-throw to see the 500 but with info in console
        }
    }

    /// <summary>
    /// Devuelve una sesión completa con todos sus mensajes.
    /// </summary>
    public async Task<ChatSession?> GetSessionAsync(string userId, string sessionId)
    {
        var container = await GetContainerAsync();
        if (container == null) return null;

        try
        {
            var response = await container.ReadItemAsync<ChatSession>(sessionId, new PartitionKey(userId));
            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    /// <summary>
    /// Crea una nueva sesión de chat.
    /// </summary>
    public async Task<ChatSession> CreateSessionAsync(string userId, string? title = null)
    {
        var session = new ChatSession
        {
            UserId = userId,
            Title = title ?? "Nueva Consulta",
            Messages = new List<ChatSessionMessage>
            {
                new()
                {
                    Role = "assistant",
                    Content = "¡Hola! Soy tu Asistente de Comercio Internacional Gobernado. ¿En qué puedo ayudarte hoy?"
                }
            }
        };

        var container = await GetContainerAsync();
        if (container != null)
        {
            await container.CreateItemAsync(session, new PartitionKey(userId));
        }
        return session;
    }

    /// <summary>
    /// Agrega un mensaje a una sesión existente.
    /// </summary>
    public async Task<ChatSession?> AddMessageAsync(string userId, string sessionId, ChatSessionMessage message)
    {
        var session = await GetSessionAsync(userId, sessionId);
        if (session == null) return null;

        session.Messages.Add(message);
        session.UpdatedAt = DateTime.UtcNow;

        // Auto-titular con el primer mensaje del usuario
        if (session.Title == "Nueva Consulta" && message.Role == "user")
        {
            session.Title = message.Content.Length > 30 
                ? message.Content[..30] + "..." 
                : message.Content;
        }

        var container = await GetContainerAsync();
        if (container != null)
        {
            await container.ReplaceItemAsync(session, sessionId, new PartitionKey(userId));
        }
        return session;
    }

    /// <summary>
    /// Elimina una sesión.
    /// </summary>
    public async Task DeleteSessionAsync(string userId, string sessionId)
    {
        var container = await GetContainerAsync();
        if (container == null) return;

        try
        {
            await container.DeleteItemAsync<ChatSession>(sessionId, new PartitionKey(userId));
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            // Ya no existe, no es error
        }
    }
}
