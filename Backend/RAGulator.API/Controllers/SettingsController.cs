using Microsoft.AspNetCore.Mvc;
using RAGulator.API.Models;
using RAGulator.API.Services;

namespace RAGulator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController(ISystemConfigurationService configService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetConfig()
    {
        var config = await configService.GetConfigurationAsync();
        return Ok(config);
    }

    [HttpPost]
    public async Task<IActionResult> SaveConfig([FromBody] SystemConfiguration request)
    {
        var saved = await configService.SaveConfigurationAsync(request);
        return Ok(saved);
    }
}
