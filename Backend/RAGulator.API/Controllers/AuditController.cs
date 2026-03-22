using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RAGulator.API.Services;

namespace RAGulator.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class AuditController(ITelemetryService telemetryService) : ControllerBase
{
    [HttpGet("logs")]
    public async Task<IActionResult> GetLogs([FromQuery] int limit = 100)
    {
        var logs = await telemetryService.GetAuditLogsAsync(limit);
        return Ok(logs);
    }
}
