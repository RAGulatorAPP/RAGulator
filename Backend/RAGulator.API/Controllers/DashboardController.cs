using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using RAGulator.API.Configuration;
using RAGulator.API.Services;

namespace RAGulator.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class DashboardController(
    ITelemetryService telemetryService, 
    DocumentIngestionService ingestionService,
    IOptions<AzureAIFoundryConfig> foundryConfig) : ControllerBase
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

    [HttpGet("system-info")]
    public IActionResult GetSystemInfo()
    {
        var config = foundryConfig.Value;
        return Ok(new {
            projectName = config.ProjectName,
            region = config.Region,
            model = config.DeploymentName
        });
    }
}
