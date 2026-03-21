using Microsoft.AspNetCore.Mvc;
using RAGulator.API.Models;
using RAGulator.API.Services;

namespace RAGulator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController(MockDataService dataService) : ControllerBase
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
    public ActionResult<SendMessageResponse> SendMessage([FromBody] SendMessageRequest request)
    {
        var response = dataService.ProcessMessage(request.Message);
        return Ok(response);
    }
}
