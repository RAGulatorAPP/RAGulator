using Microsoft.AspNetCore.Mvc;
using RAGulator.API.Models;
using RAGulator.API.Services;

namespace RAGulator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QualityController(MockDataService dataService) : ControllerBase
{
    [HttpGet]
    public ActionResult<QualityData> GetQuality()
    {
        return Ok(dataService.GetQualityData());
    }
}
