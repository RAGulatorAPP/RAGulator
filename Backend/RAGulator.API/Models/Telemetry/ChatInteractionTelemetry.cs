using Newtonsoft.Json;

namespace RAGulator.API.Models.Telemetry;

public class ChatInteractionTelemetry
{
    [JsonProperty("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public double ResponseTimeMs { get; set; }
    public double GroundednessScore { get; set; }
    public double RelevanceScore { get; set; }
    public double CoherenceScore { get; set; }
    public double FluencyScore { get; set; }
    public double ContextRecallScore { get; set; }
    public bool HasContentSafetyAlert { get; set; }
    public string SafetyAlertCategory { get; set; } = "None"; // Hate, Sexual, Violence, SelfHarm
    public int SafetyAlertSeverity { get; set; } = 0; // 0, 2, 4, 6
    
    // Forensic Traceability
    public string UserPrompt { get; set; } = string.Empty;
    public string AiResponse { get; set; } = string.Empty;
    public List<string> Citations { get; set; } = new List<string>();
}
