using System.Text.Json;
using RAGulator.API.Models.Telemetry;

namespace RAGulator.API.Services;

public class LocalTelemetryService : ITelemetryService
{
    private readonly string _filePath = "telemetry_db.json";
    private List<ChatInteractionTelemetry> _interactions = new();
    private readonly object _lock = new();

    public LocalTelemetryService()
    {
        LoadData();
    }

    private void LoadData()
    {
        if (File.Exists(_filePath))
        {
            try
            {
                var json = File.ReadAllText(_filePath);
                _interactions = JsonSerializer.Deserialize<List<ChatInteractionTelemetry>>(json) ?? new();
            }
            catch { }
        }
    }

    private void SaveData()
    {
        lock (_lock)
        {
            var json = JsonSerializer.Serialize(_interactions);
            File.WriteAllText(_filePath, json);
        }
    }

    public Task LogInteractionAsync(ChatInteractionTelemetry telemetry)
    {
        lock (_lock)
        {
            _interactions.Add(telemetry);
            SaveData();
        }
        return Task.CompletedTask;
    }

    public Task<object> GetMetricsSnapshotAsync(int totalDocuments)
    {
        lock (_lock)
        {
            var evaluable = _interactions.Where(i => !i.HasContentSafetyAlert).ToList();
            int totalInteractions = evaluable.Count;
            double avgGroundedness = totalInteractions > 0 ? evaluable.Average(i => i.GroundednessScore) : 0.98;
            double avgLatency = totalInteractions > 0 ? evaluable.Average(i => i.ResponseTimeMs) : 1200;
            int totalAlerts = _interactions.Count(i => i.HasContentSafetyAlert);

            return Task.FromResult<object>(new
            {
                groundednessScore = new { value = avgGroundedness.ToString("0.00"), trend = "+0%" },
                responseTime = new { value = $"{Math.Round(avgLatency)}ms", trend = "-0%" },
                documentsIngested = new { value = totalDocuments, trend = "Local Sync" },
                contentSafetyAlerts = new { value = totalAlerts, trend = "Safe" }
            });
        }
    }

    public Task<List<object>> GetGroundednessHistoryAsync()
    {
        lock (_lock)
        {
            var recent = _interactions.Where(i => !i.HasContentSafetyAlert).OrderBy(i => i.Timestamp).TakeLast(20).ToList();
            var result = new List<object>();
            
            if (recent.Count == 0)
            {
                result.Add(new { date = DateTime.Now.ToString("HH:mm"), value = 0.95 });
            }

            foreach(var item in recent)
            {
                result.Add(new { date = item.Timestamp.ToLocalTime().ToString("HH:mm"), value = Math.Round(item.GroundednessScore, 2) });
            }
            return Task.FromResult<List<object>>(result);
        }
    }

    public Task<List<object>> GetRecentAlertsAsync()
    {
        lock (_lock)
        {
            var result = new List<object>();
            var recent = _interactions.OrderByDescending(i => i.Timestamp).Take(5).ToList();
            
            foreach(var item in recent)
            {
                bool isSafetyAlert = item.HasContentSafetyAlert;
                double latency = item.ResponseTimeMs;
                
                if (isSafetyAlert)
                {
                    result.Add(new { id = item.Id, type = "danger", message = "Detección de Violencia mitigada localmente.", time = item.Timestamp.ToLocalTime().ToString("HH:mm") });
                }
                else if (latency > 4000)
                {
                     result.Add(new { id = item.Id, type = "warning", message = $"Latencia local elevada ({Math.Round(latency)}ms).", time = item.Timestamp.ToLocalTime().ToString("HH:mm") });
                }
            }

            if (result.Count == 0)
            {
                 result.Add(new { id = Guid.NewGuid().ToString(), type = "success", message = "Los sistemas operan en estado fluido y seguro (Local).", time = DateTime.Now.ToString("HH:mm") });
            }
            return Task.FromResult(result);
        }
    }

    public Task<object> GetQualityMetricsAsync()
    {
        return Task.FromResult<object>(new { 
            metrics = new { groundedness = new { value="0.98", trend="+0%", threshold="0.85", status="Óptimo", description="N/A" } }, 
            radarChart = new List<object>(), 
            lineChart = new List<object>() 
        });
    }

    public Task<object> GetSecurityMetricsAsync()
    {
        return Task.FromResult<object>(new {
             totalBlocks = 0,
             distribution = new List<object>(),
             recentIncidents = new List<object>()
        });
    }

    public Task<List<ChatInteractionTelemetry>> GetAuditLogsAsync(int limit = 50)
    {
        lock (_lock)
        {
            return Task.FromResult(_interactions.OrderByDescending(x => x.Timestamp).Take(limit).ToList());
        }
    }
}
