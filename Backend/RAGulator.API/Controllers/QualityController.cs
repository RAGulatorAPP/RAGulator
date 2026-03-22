using Microsoft.AspNetCore.Mvc;
using RAGulator.API.Models;
using RAGulator.API.Services;

namespace RAGulator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QualityController(ITelemetryService telemetryService) : ControllerBase
{
    [HttpGet("metrics")]
    public async Task<IActionResult> GetQualityMetrics()
    {
        return Ok(await telemetryService.GetQualityMetricsAsync());
    }
}
