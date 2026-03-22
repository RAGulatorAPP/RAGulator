using RAGulator.API.Models.Telemetry;

namespace RAGulator.API.Services;

public interface ITelemetryService
{
    Task LogInteractionAsync(ChatInteractionTelemetry telemetry);
    Task<object> GetMetricsSnapshotAsync(int totalDocuments);
    Task<List<object>> GetGroundednessHistoryAsync();
    Task<List<object>> GetRecentAlertsAsync();
    Task<object> GetQualityMetricsAsync();
    Task<object> GetSecurityMetricsAsync();
}
