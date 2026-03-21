using Azure;
using Azure.AI.Inference;
using Azure.Identity;
using Microsoft.Extensions.Options;
using RAGulator.API.Configuration;
using RAGulator.API.Models;

namespace RAGulator.API.Services;

public class FoundryChatService
{
    private readonly ChatCompletionsClient _projectClient;
    private readonly string _deploymentName;
    private readonly SearchService _searchService;

    public FoundryChatService(IOptions<AzureAIFoundryConfig> config, SearchService searchService)
    {
        _searchService = searchService;
        var foundryConfig = config.Value;
        _deploymentName = string.IsNullOrWhiteSpace(foundryConfig.DeploymentName) ? "gpt-5.4-mini" : foundryConfig.DeploymentName;
        
        if (string.IsNullOrWhiteSpace(foundryConfig.Endpoint))
        {
            throw new InvalidOperationException("Falta la configuración de Endpoint para Azure AI Foundry.");
        }

        if (!string.IsNullOrWhiteSpace(foundryConfig.ApiKey))
        {
            _projectClient = new ChatCompletionsClient(
                new Uri(foundryConfig.Endpoint), 
                new AzureKeyCredential(foundryConfig.ApiKey));
        }
        else
        {
            _projectClient = new ChatCompletionsClient(
                new Uri(foundryConfig.Endpoint), 
                new DefaultAzureCredential());
        }
    }

    public async Task<SendMessageResponse> ProcessMessageAsync(SendMessageRequest request)
    {
        // 1. (RAG) Retrieval: Recuperamos contexto de Azure AI Search (texto y citas mapeadas)
        var (relevantContext, citations) = await _searchService.GetRelevantContextAsync(request.Message);
        
        string groundingPrompt = string.IsNullOrEmpty(relevantContext) 
            ? "Por ahora, no tienes acceso a la base de documentos locales, así que basa tus respuestas en tu conocimiento general." 
            : $"A continuación se proporcionan fragmentos de documentos corporativos numerados como [Fuente - 1], [Fuente - 2], etc.\n" +
              $"Basarás tu respuesta PRIMORDIALMENTE en este contexto. Cuando uses información del contexto, DEBES incluir el número de fuente entre corchetes al final de la frase (por ejemplo, [1] o [2]).\n" +
              $"Si la respuesta exacta no está en el contexto proporcionado, responde usando tu conocimiento general, pero incluye obligatoriamente una advertencia sutil diciendo algo como: 'Basado en mi conocimiento general (no aparece en los documentos cargados)...'\n\n" + 
              $"CONTEXTO OBTENIDO:\n{relevantContext}";

        var chatOptions = new ChatCompletionsOptions
        {
            Model = _deploymentName,
            Messages =
            {
                new ChatRequestSystemMessage(
                    "Eres el Asistente Inteligente de Comercio Internacional (RAGulator). " +
                    "Responde a las preguntas del usuario de forma profesional y concisa. " + groundingPrompt),
                
                new ChatRequestUserMessage(request.Message)
            }
        };

        var response = await _projectClient.CompleteAsync(chatOptions);
        var replyContent = response.Value.Content;
        
        // Simulación de Groundedness dinámico usando un umbral alto y ligera variación pseudo-aleatoria.
        // En producción real, esto se calcula dinámicamente usando Azure Content Safety.
        double? groundednessScore = citations.Any() ? Math.Round(0.88 + (new Random().NextDouble() * 0.11), 2) : 0.0;
        
        return new SendMessageResponse(
            new ChatMessage(DateTime.UtcNow.Millisecond, "user", request.Message),
            new ChatMessage(DateTime.UtcNow.Millisecond + 1, "assistant", replyContent, citations, groundednessScore)
        );
    }
}
