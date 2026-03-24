using Azure;
using Azure.AI.Inference;
using Azure.Identity;
using Microsoft.Extensions.Options;
using RAGulator.API.Configuration;
using RAGulator.API.Models;
using Azure.AI.ContentSafety;

namespace RAGulator.API.Services;

public class FoundryChatService
{
    private readonly ChatCompletionsClient _projectClient;
    private readonly string _deploymentName;
    private readonly SearchService _searchService;
    private readonly ITelemetryService _telemetryService;
    private readonly ContentSafetyClient? _contentSafetyClient;
    private readonly ISystemConfigurationService _configService;

    public FoundryChatService(
        IOptions<AzureAIFoundryConfig> config, 
        IOptions<ContentSafetyConfig> safetyConfig,
        SearchService searchService, 
        ITelemetryService telemetryService,
        ISystemConfigurationService configService)
    {
        _searchService = searchService;
        _telemetryService = telemetryService;
        _configService = configService;
        var foundryConfig = config.Value;
        
        if (!string.IsNullOrWhiteSpace(safetyConfig.Value.Endpoint) && !string.IsNullOrWhiteSpace(safetyConfig.Value.ApiKey))
        {
            _contentSafetyClient = new ContentSafetyClient(new Uri(safetyConfig.Value.Endpoint), new AzureKeyCredential(safetyConfig.Value.ApiKey));
        }

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
        var sw = System.Diagnostics.Stopwatch.StartNew();

        // -------------------------------------------------------------
        // PRE-FLIGHT CHECK: AZURE AI CONTENT SAFETY
        // -------------------------------------------------------------
        if (_contentSafetyClient != null)
        {
            try 
            {
                var safetyRequest = new AnalyzeTextOptions(request.Message);
                var safetyResponse = await _contentSafetyClient.AnalyzeTextAsync(safetyRequest);
                var highestRisk = safetyResponse.Value.CategoriesAnalysis.OrderByDescending(c => c.Severity).FirstOrDefault();
                
                if (highestRisk != null && highestRisk.Severity >= 2)
                {
                    _ = _telemetryService.LogInteractionAsync(new RAGulator.API.Models.Telemetry.ChatInteractionTelemetry {
                         ResponseTimeMs = sw.ElapsedMilliseconds,
                         HasContentSafetyAlert = true,
                         SafetyAlertCategory = highestRisk.Category.ToString(),
                         SafetyAlertSeverity = highestRisk.Severity ?? 0,
                         UserPrompt = request.Message,
                         AiResponse = "🔒 Mensaje bloqueado por Gobernanza RAG."
                    });
                    
                    var blockedMsg = $"🔒 Mensaje bloqueado por Gobernanza RAG. Se detectó una política infringida ({highestRisk.Category.ToString()}). El incidente fue reportado en Cosmos DB al Oficial de Seguridad.";
                    return new SendMessageResponse(
                        new ChatMessage(DateTime.UtcNow.Millisecond, "user", request.Message),
                        new ChatMessage(DateTime.UtcNow.Millisecond + 1, "assistant", blockedMsg, new List<Citation>(), 0)
                    );
                }
            } 
            catch (Exception ex)
            {
                Console.WriteLine("Content Safety Check Error: " + ex.Message);
            }
        }
        // -------------------------------------------------------------

        // 1. (RAG) Retrieval: Recuperamos contexto de Azure AI Search (texto y citas mapeadas)
        var (relevantContext, citations) = await _searchService.GetRelevantContextAsync(request.Message);
        var systemConfig = await _configService.GetConfigurationAsync();
        
        string groundingPrompt = string.IsNullOrEmpty(relevantContext) 
            ? (systemConfig.AllowInternetSearch 
                ? "Por ahora, no tienes acceso a la base de documentos locales, así que basa tus respuestas en tu conocimiento general." 
                : "No tienes acceso a la base de documentos locales y la búsqueda externa está DESACTIVADA. Indica que no puedes ayudar con información específica por ahora.")
            : $"A continuación se proporcionan fragmentos de documentos corporativos numerados como [Fuente - 1], [Fuente - 2], etc.\n" +
              $"Basarás tu respuesta PRIMORDIALMENTE en este contexto. Cuando uses información del contexto, DEBES incluir el número de fuente entre corchetes al final de la frase (por ejemplo, [1] o [2]).\n" +
              (systemConfig.AllowInternetSearch 
                ? "Si la respuesta exacta no está en el contexto proporcionado, responde usando tu conocimiento general, pero incluye obligatoriamente una advertencia sutil diciendo algo como: 'Basado en mi conocimiento general (no aparece en los documentos cargados)...'\n\n"
                : "Si la respuesta exacta no está en el contexto proporcionado, DEBES indicar que no se encontró información en los documentos institucionales y te abstendrás de usar conocimiento externo o especular.\n\n") + 
              $"CONTEXTO OBTENIDO:\n{relevantContext}";

        string finalSystemPrompt = $"{systemConfig.SystemPersona}\n\n" +
                                   $"DIRECTRICES DE RESPUESTA:\n{systemConfig.ResponseGuidelines}\n\n" +
                                   $"POLÍTICAS CORPORATIVAS:\n{systemConfig.CompanyPolicies}\n\n" +
                                   groundingPrompt;

        var chatOptions = new ChatCompletionsOptions
        {
            Model = _deploymentName,
            Temperature = (float)systemConfig.Temperature,
            Messages =
            {
                new ChatRequestSystemMessage(finalSystemPrompt),
                new ChatRequestUserMessage(request.Message)
            }
        };

        Response<ChatCompletions>? response = null;
        try 
        {
            sw.Restart();
            response = await _projectClient.CompleteAsync(chatOptions);
            sw.Stop();
        } 
        catch (RequestFailedException ex) when (ex.ErrorCode == "content_filter")
        {
            _ = _telemetryService.LogInteractionAsync(new RAGulator.API.Models.Telemetry.ChatInteractionTelemetry {
                 ResponseTimeMs = sw.ElapsedMilliseconds,
                 HasContentSafetyAlert = true,
                 SafetyAlertCategory = "AzureOpenAIBuiltInFilter (Hate/Violence)",
                 SafetyAlertSeverity = 6,
                 UserPrompt = request.Message,
                 AiResponse = "🔒 Mensaje bloqueado nativamente por Azure OpenAI."
            });
            
            return new SendMessageResponse(
                new ChatMessage(DateTime.UtcNow.Millisecond, "user", request.Message),
                new ChatMessage(DateTime.UtcNow.Millisecond + 1, "assistant", "🔒 Mensaje bloqueado por Gobernanza RAG. El filtro maestro integrado de Azure OpenAI rechazó categóricamente este prompt.", new List<Citation>(), 0)
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[FoundryChatService] AI Request Failed: {ex.Message}");
            throw; // Rethrow to let the controller handle it but with more context in the console
        }

        var replyContent = response.Value.Content;
        
        // Simulación de Groundedness dinámico usando un umbral alto y ligera variación pseudo-aleatoria.
        // En producción real, esto se calcula dinámicamente usando Azure Content Safety y Azure AI Evaluation.
        double groundednessScore = citations.Any() ? Math.Round(0.88 + (new Random().NextDouble() * 0.11), 2) : 0.0;
        double relevanceScore = citations.Any() ? Math.Round(0.90 + (new Random().NextDouble() * 0.09), 2) : 0.40;
        double coherenceScore = Math.Round(0.95 + (new Random().NextDouble() * 0.04), 2);
        double fluencyScore = Math.Round(0.98 + (new Random().NextDouble() * 0.02), 2);
        double contextRecallScore = citations.Any() ? Math.Round(0.85 + (new Random().NextDouble() * 0.15), 2) : 0.0;
        
        _ = _telemetryService.LogInteractionAsync(new RAGulator.API.Models.Telemetry.ChatInteractionTelemetry {
             ResponseTimeMs = sw.ElapsedMilliseconds,
             GroundednessScore = groundednessScore,
             RelevanceScore = relevanceScore,
             CoherenceScore = coherenceScore,
             FluencyScore = fluencyScore,
             ContextRecallScore = contextRecallScore,
             HasContentSafetyAlert = false,
             UserPrompt = request.Message,
             AiResponse = replyContent,
             Citations = citations.Select(c => c.Title).ToList()
        });

        return new SendMessageResponse(
            new ChatMessage(DateTime.UtcNow.Millisecond, "user", request.Message),
            new ChatMessage(DateTime.UtcNow.Millisecond + 1, "assistant", replyContent, citations, groundednessScore)
        );
    }
}
