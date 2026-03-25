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
        // Start tasks in parallel
        var totalDocsTask = ingestionService.GetIngestedDocumentCountAsync();
        var groundHistoryTask = telemetryService.GetGroundednessHistoryAsync();
        var recentAlertsTask = telemetryService.GetRecentAlertsAsync();

        await Task.WhenAll(totalDocsTask, groundHistoryTask, recentAlertsTask);

        int totalDocs = totalDocsTask.Result;
        var groundHistory = groundHistoryTask.Result;
        var recentAlerts = recentAlertsTask.Result;

        // This one depends on totalDocs, so we call it after
        var snapshot = await telemetryService.GetMetricsSnapshotAsync(totalDocs);
        
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
