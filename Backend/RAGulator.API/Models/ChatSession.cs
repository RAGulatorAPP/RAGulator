using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace RAGulator.API.Models;

/// <summary>
/// Representa una sesión de chat almacenada en Cosmos DB.
/// Partition key: /userId (para queries eficientes por usuario).
/// </summary>
public class ChatSession
{
    [JsonPropertyName("id")]
    [JsonProperty("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("userId")]
    [JsonProperty("userId")]
    public string UserId { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    [JsonProperty("title")]
    public string Title { get; set; } = "Nueva Consulta";

    [JsonPropertyName("messages")]
    [JsonProperty("messages")]
    public List<ChatSessionMessage> Messages { get; set; } = new();

    [JsonPropertyName("createdAt")]
    [JsonProperty("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonPropertyName("updatedAt")]
    [JsonProperty("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class ChatSessionMessage
{
    [JsonPropertyName("id")]
    [JsonProperty("id")]
    public long Id { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    [JsonPropertyName("role")]
    [JsonProperty("role")]
    public string Role { get; set; } = "user";

    [JsonPropertyName("content")]
    [JsonProperty("content")]
    public string Content { get; set; } = string.Empty;

    [JsonPropertyName("citations")]
    [JsonProperty("citations")]
    public List<Citation>? Citations { get; set; }

    [JsonPropertyName("groundedness")]
    [JsonProperty("groundedness")]
    public double? Groundedness { get; set; }
}
