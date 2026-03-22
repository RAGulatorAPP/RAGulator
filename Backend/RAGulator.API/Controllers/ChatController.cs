using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RAGulator.API.Models;
using RAGulator.API.Services;

namespace RAGulator.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChatController(FoundryChatService chatService, ChatHistoryService historyService) : ControllerBase
{
    private string GetUserId() => User.FindFirst("sub")?.Value ?? User.FindFirst("oid")?.Value ?? "anonymous";

    // =====================================================
    // SESSIONS — CRUD de sesiones de chat
    // =====================================================

    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions()
    {
        try 
        {
            var sessions = await historyService.GetSessionsAsync(GetUserId());
            return Ok(sessions);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ChatController] ERROR in GetSessions: {ex.Message}");
            return StatusCode(500, $"Internal Server Error: {ex.Message}");
        }
    }

    [HttpPost("sessions")]
    public async Task<IActionResult> CreateSession()
    {
        var session = await historyService.CreateSessionAsync(GetUserId());
        return Ok(session);
    }

    [HttpGet("sessions/{sessionId}")]
    public async Task<IActionResult> GetSession(string sessionId)
    {
        var session = await historyService.GetSessionAsync(GetUserId(), sessionId);
        if (session == null) return NotFound();
        return Ok(session);
    }

    [HttpDelete("sessions/{sessionId}")]
    public async Task<IActionResult> DeleteSession(string sessionId)
    {
        await historyService.DeleteSessionAsync(GetUserId(), sessionId);
        return NoContent();
    }

    // =====================================================
    // MESSAGE — Enviar mensaje y obtener respuesta del RAG
    // =====================================================

    [HttpPost("message")]
    public async Task<ActionResult<object>> SendMessage([FromBody] SendMessageRequest request)
    {
        var userId = GetUserId();
        var sessionId = request.ConversationId?.ToString();
        
        // Si viene con sessionId (string en el body), guardar el mensaje del usuario
        if (!string.IsNullOrEmpty(request.SessionId))
        {
            sessionId = request.SessionId;
            await historyService.AddMessageAsync(userId, sessionId, new ChatSessionMessage
            {
                Role = "user",
                Content = request.Message
            });
        }

        // Procesar con el RAG
        var response = await chatService.ProcessMessageAsync(request);

        // Guardar la respuesta del asistente
        if (!string.IsNullOrEmpty(sessionId))
        {
            var assistantMsg = new ChatSessionMessage
            {
                Id = response.AssistantMessage.Id,
                Role = "assistant",
                Content = response.AssistantMessage.Content,
                Citations = response.AssistantMessage.Citations,
                Groundedness = response.AssistantMessage.Groundedness
            };
            await historyService.AddMessageAsync(userId, sessionId, assistantMsg);
        }

        return Ok(new
        {
            botMessage = response.AssistantMessage
        });
    }
}
