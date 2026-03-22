using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RAGulator.API.Services;

namespace RAGulator.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class SecurityController(ITelemetryService telemetryService) : ControllerBase
{
    [HttpGet("metrics")]
    public async Task<IActionResult> GetSecurityMetrics()
    {
        return Ok(await telemetryService.GetSecurityMetricsAsync());
    }
}
