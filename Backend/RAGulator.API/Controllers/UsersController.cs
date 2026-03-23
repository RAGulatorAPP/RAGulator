using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RAGulator.API.Services;

namespace RAGulator.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class UsersController(GraphUsersService graphService) : ControllerBase
{
    /// <summary>
    /// Lists all users with their assigned app roles.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await graphService.GetUsersWithRolesAsync();
        var roles = await graphService.GetAvailableRolesAsync();
        return Ok(new { users, availableRoles = roles });
    }

    /// <summary>
    /// Assigns a role to a user.
    /// </summary>
    [HttpPost("{userId}/roles")]
    public async Task<IActionResult> AssignRole(string userId, [FromBody] RoleAssignmentRequest request)
    {
        var result = await graphService.AssignRoleAsync(userId, request.RoleId);
        return Ok(result);
    }

    /// <summary>
    /// Removes a role assignment.
    /// </summary>
    [HttpDelete("{userId}/roles/{assignmentId}")]
    public async Task<IActionResult> RemoveRole(string userId, string assignmentId)
    {
        var result = await graphService.RemoveRoleAsync(assignmentId);
        return Ok(result);
    }
}

public class RoleAssignmentRequest
{
    public string RoleId { get; set; } = string.Empty;
}
