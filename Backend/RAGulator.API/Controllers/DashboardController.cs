using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RAGulator.API.Models;
using RAGulator.API.Services;

namespace RAGulator.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class DashboardController(ITelemetryService telemetryService, DocumentIngestionService ingestionService) : ControllerBase
{
    [HttpGet("metrics")]
    public async Task<IActionResult> GetDashboardMetrics()
    {
        int totalDocs = await ingestionService.GetIngestedDocumentCountAsync();
        var snapshot = await telemetryService.GetMetricsSnapshotAsync(totalDocs);
        var groundHistory = await telemetryService.GetGroundednessHistoryAsync();
        var recentAlerts = await telemetryService.GetRecentAlertsAsync();
        
        return Ok(new {
            metrics = snapshot,
            lineChart = groundHistory,
            alerts = recentAlerts
        });
    }
}
