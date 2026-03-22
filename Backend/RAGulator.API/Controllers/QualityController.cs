using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RAGulator.API.Models;
using RAGulator.API.Services;

namespace RAGulator.API.Controllers;

[Authorize(Roles = "Admin")]
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
