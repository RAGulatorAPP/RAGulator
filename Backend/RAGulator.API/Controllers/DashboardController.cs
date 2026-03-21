using Microsoft.AspNetCore.Mvc;
using RAGulator.API.Models;
using RAGulator.API.Services;

namespace RAGulator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController(MockDataService dataService) : ControllerBase
{
    [HttpGet]
    public ActionResult<DashboardData> GetDashboard()
    {
        return Ok(dataService.GetDashboardData());
    }
}
