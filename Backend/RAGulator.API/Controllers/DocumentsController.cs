using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RAGulator.API.Models;
using RAGulator.API.Services;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System;

namespace RAGulator.API.Controllers;

[Authorize]
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

    [Authorize(Roles = "Admin")]
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

    [Authorize(Roles = "Admin")]
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

    [Authorize(Roles = "Admin")]
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

    [HttpGet("download/{*fileName}")]
    public async Task<IActionResult> DownloadDocument(string fileName)
    {
        Console.WriteLine($"[DocumentsController] Solicitud de descarga para: {fileName}");
        if (string.IsNullOrWhiteSpace(fileName))
            return BadRequest("El nombre del archivo no puede estar vacío.");

        var stream = await _ingestionService.DownloadDocumentAsync(fileName);
        if (stream == null)
        {
            Console.WriteLine($"[DocumentsController] ERROR: No se encontró el stream para {fileName}");
            return NotFound($"El documento '{fileName}' no se encontró en el Storage seguro.");
        }

        return File(stream, "application/pdf");
    }
}
