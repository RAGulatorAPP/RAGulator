using Microsoft.AspNetCore.Mvc;
using RAGulator.API.Models;
using RAGulator.API.Services;

namespace RAGulator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentsController(MockDataService dataService) : ControllerBase
{
    [HttpGet]
    public ActionResult<DocumentsData> GetDocuments()
    {
        return Ok(dataService.GetDocumentsData());
    }

    [HttpPost("upload")]
    public ActionResult Upload()
    {
        return Ok(new { message = "Documento recibido correctamente (mock)" });
    }
}
