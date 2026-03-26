using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RAGulator.API.Services;
using System.Threading.Tasks;

namespace RAGulator.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class OneDriveController : ControllerBase
{
    private readonly IOneDriveService _oneDriveService;

    public OneDriveController(IOneDriveService oneDriveService)
    {
        _oneDriveService = oneDriveService;
    }

    [HttpGet("drives")]
    public async Task<IActionResult> GetDrives()
    {
        var drives = await _oneDriveService.GetDrivesAsync();
        return Ok(drives);
    }

    [HttpGet("resolve")]
    public async Task<IActionResult> ResolveShare([FromQuery] string url)
    {
        if (string.IsNullOrEmpty(url)) return BadRequest("URL is required.");
        var result = await _oneDriveService.ResolveSharingLinkAsync(url);
        if (result == null) return NotFound("Could not resolve sharing link.");
        return Ok(result);
    }

    [HttpGet("items/{driveId}/{itemId}")]
    public async Task<IActionResult> GetItems(string driveId, string itemId)
    {
        var items = await _oneDriveService.GetDriveItemsAsync(driveId, itemId);
        return Ok(items);
    }

    [HttpPost("sync")]
    public async Task<IActionResult> SyncFolder([FromBody] SyncRequest request)
    {
        if (string.IsNullOrEmpty(request.DriveId) || string.IsNullOrEmpty(request.FolderId))
            return BadRequest("DriveId and FolderId are required.");

        var result = await _oneDriveService.SyncFolderAsync(request.DriveId, request.FolderId);
        return Ok(new { message = result });
    }
}

public class SyncRequest
{
    public string DriveId { get; set; } = string.Empty;
    public string FolderId { get; set; } = string.Empty;
}
