using Newtonsoft.Json;

namespace RAGulator.API.Models;

public class SystemConfiguration
{
    [JsonProperty("id")]
    public string Id { get; set; } = "global-config";
    
    public string SystemPersona { get; set; } = "Eres el Asistente Inteligente RAGulator, especializado en comercio internacional y aduanas.";
    public string ResponseGuidelines { get; set; } = "Responde a las preguntas del usuario de forma profesional, clara y concisa.\nSi la respuesta exacta no está en el contexto, usa tu conocimiento general pero adviértelo cortésmente.";
    public string CompanyPolicies { get; set; } = "1. No especules sobre normas aduaneras si no aparecen en los manuales.\n2. Mantén un tono formal.\n3. Si detectas malas palabras, responde indicando que infringen los valores corporativos.";
}
