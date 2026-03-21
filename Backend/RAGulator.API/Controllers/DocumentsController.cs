using Microsoft.AspNetCore.Mvc;
using RAGulator.API.Models;
using RAGulator.API.Services;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System;

namespace RAGulator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentsController : ControllerBase
{
    private readonly MockDataService _mockDataService;
    private readonly DocumentIngestionService _ingestionService;

    public DocumentsController(MockDataService mockDataService, DocumentIngestionService ingestionService)
    {
        _mockDataService = mockDataService;
        _ingestionService = ingestionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDocuments()
    {
        var realDocs = await _ingestionService.GetUploadedDocumentsAsync();
        
        // Sumar total de chunks reales
        int totalChunks = realDocs.Sum(d => (int)d.GetType().GetProperty("fragments").GetValue(d, null));

        return Ok(new { 
            stats = new {
                totalDocs = realDocs.Count,
                processed = realDocs.Count,
                indexing = 0,
                error = 0,
                totalFragments = totalChunks
            },
            documents = realDocs 
        });
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadDocument(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file provided" });
        }

        using var stream = file.OpenReadStream();
        string resultMessage = await _ingestionService.ProcessAndIndexDocumentAsync(stream, file.FileName);

        return Ok(new { message = resultMessage, documentId = Guid.NewGuid() });
    }

    [HttpDelete("{fileName}")]
    public async Task<IActionResult> DeleteDocument(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            return BadRequest(new { message = "Se requiere el nombre del archivo." });
        }

        var resultMessage = await _ingestionService.DeleteDocumentAsync(fileName);
        return Ok(new { message = resultMessage });
    }

    [HttpGet("{fileName}/download")]
    public async Task<IActionResult> DownloadDocument(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            return BadRequest("El nombre del archivo no puede estar vacío.");

        var stream = await _ingestionService.DownloadDocumentAsync(fileName);
        if (stream == null)
            return NotFound("El documento físico no se encontró en el Storage Account seguro.");

        return File(stream, "application/pdf");
    }
}
