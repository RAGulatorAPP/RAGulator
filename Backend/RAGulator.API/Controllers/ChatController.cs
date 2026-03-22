using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RAGulator.API.Models;
using RAGulator.API.Services;

namespace RAGulator.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChatController(MockDataService dataService, FoundryChatService chatService) : ControllerBase
{
    [HttpGet("history")]
    public ActionResult<List<ChatHistoryItem>> GetHistory()
    {
        return Ok(dataService.GetChatHistory());
    }

    [HttpGet("messages/{conversationId}")]
    public ActionResult<List<ChatMessage>> GetMessages(int conversationId)
    {
        return Ok(dataService.GetChatMessages());
    }

    [HttpPost("message")]
    public async Task<ActionResult<SendMessageResponse>> SendMessage([FromBody] SendMessageRequest request)
    {
        var response = await chatService.ProcessMessageAsync(request);
        return Ok(response);
    }
}
