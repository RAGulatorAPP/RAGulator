using RAGulator.API.Models;

namespace RAGulator.API.Services;

public class MockDataService
{
    // ========== Chat Data ==========
    public List<ChatHistoryItem> GetChatHistory() =>
    [
        new(1, "¿Cuáles son los requisitos de aranceles para importar Paneles...", "Hace 2h"),
        new(2, "Procedimiento de importación de maquinaria industrial", "Hace 5h"),
        new(3, "Regulaciones aduaneras para productos electrónicos", "Ayer"),
        new(4, "Documentos necesarios para exportar a la UE", "Ayer"),
    ];

    public List<ChatMessage> GetChatMessages() =>
    [
        new(1, "user", "¿Cuáles son los requisitos de aranceles para importar Paneles Solares desde China?"),
        new(2, "assistant",
            "Para importar paneles solares desde China, debes considerar los siguientes requisitos arancelarios:\n\nLos paneles solares están sujetos a un arancel estándar del 15% sobre el valor CIF [1]. Sin embargo, existe un acuerdo preferencial que puede reducir el arancel al 8% si se cumple la certificación de origen chino verificada [2].\n\nAdicionalmente, se requiere una certificación de calidad emitida por un organismo reconocido internacionalmente [1], y documentación que acredite el cumplimiento de normas IEC 61215 e IEC 61730 [3]. El plazo de procesamiento en aduana es de 3-5 días hábiles [2].",
            [
                new(1, "Cita [1]", "Fragmento de SOP_Importación_2024 - Pág 5, Párrafo 3",
                    "\"Los paneles solares importados desde China están sujetos a un arancel del 15% sobre el valor CIF (Costo, Seguro y Flete). Además, se requiere una certificación de calidad emitida por un organismo reconocido internacionalmente.\"", "#"),
                new(2, "Cita [2]", "Tratado Comercial Asia-Pacífico 2023 - Art. 47",
                    "\"Bajo el acuerdo preferencial, los productos con certificación de origen verificada pueden acceder a una reducción arancelaria del 8%. El procesamiento aduanero estándar tiene un plazo de 3-5 días hábiles.\"", "#"),
                new(3, "Cita [3]", "Regulaciones IEC para Paneles Solares - Sección 12",
                    "\"Todos los paneles solares importados deben cumplir las normas IEC 61215 (diseño) e IEC 61730 (seguridad) para su comercialización.\"", "#"),
            ],
            0.94
        ),
    ];

    public SendMessageResponse ProcessMessage(string message) => new(
        new ChatMessage(3, "user", message),
        new ChatMessage(4, "assistant",
            "Gracias por tu consulta. Estoy procesando tu solicitud con el pipeline RAG gobernado. Los resultados están siendo validados por Azure AI Content Safety y evaluados por groundedness.",
            [
                new(1, "Cita [1]", "Base de conocimiento interna", "\"Referencia de ejemplo generada por el sistema mock.\"", "#")
            ],
            0.91
        )
    );

    // ========== Dashboard Data ==========
    public DashboardData GetDashboardData() => new(
        new DashboardMetrics(
            new MetricValue("0.93", "↑ 3% desde la semana pasada", "good"),
            new MetricValue("1.4s", "↓ 0.2s desde ayer", "good"),
            new MetricValue("247", "+12 este mes", "good"),
            new MetricValue("2", "Última semana", "warning")
        ),
        [
            new("Mar 14", 0.91), new("Mar 15", 0.92), new("Mar 16", 0.90),
            new("Mar 17", 0.93), new("Mar 18", 0.94), new("Mar 19", 0.93), new("Mar 20", 0.93),
        ],
        [
            new(1, "danger", "Consulta bloqueada por Content Safety (Hate)", "Hace 2h"),
            new(2, "info", "Documento Normas Fitosanitarias en indexación", "Hace 3h"),
            new(3, "warning", "Groundedness bajo umbral en 1 consulta (0.71)", "Hace 5h"),
            new(4, "danger", "Nuevo usuario externo ext_user_091 bloqueado", "Hace 6h"),
        ]
    );

    // ========== Documents Data ==========
    public DocumentsData GetDocumentsData() => new(
        new DocumentStats(12, 9, 2, 1, 507),
        [
            new(1, "SOP_Importacion_2024_v3.pdf", "admin@empresa.com", "az-blob-compliance/sops/", "Procesado", 48, "2.4 MB", "2026-03-19"),
            new(2, "Regulaciones_Comercio_Intl.pdf", "admin@empresa.com", "az-blob-compliance/regulations/", "Procesado", 112, "5.1 MB", "2026-03-17"),
            new(3, "Tratados_Asia_Pacifico.pdf", "admin@empresa.com", "az-blob-compliance/treaties/", "Procesado", 76, "3.3 MB", "2026-03-15"),
            new(4, "Contrato_Proveedor_China_2024.pdf", "lgarcia@empresa.com", "az-blob-contracts/active/", "Indexando", null, "1.2 MB", "2026-03-20"),
            new(5, "Certificaciones_ISO_Panel_Solar.pdf", "admin@empresa.com", "az-blob-certifications/", "Procesado", 21, "890 KB", "2026-03-12"),
            new(6, "Politica_Aduanera_UE_2025.pdf", "lgarcia@empresa.com", "az-blob-compliance/regulations/", "Procesado", 95, "4.3 MB", "2026-03-10"),
        ]
    );

    // ========== Quality Data ==========
    public QualityData GetQualityData() => new(
        new QualityMetrics(
            new QualityMetric(0.93, 0.85, "+0.05 vs semana pasada", "OK", "Respuestas basadas en fuentes verificadas"),
            new QualityMetric(0.91, 0.80, "+0.02 vs semana pasada", "OK", "Adecuación de la respuesta a la consulta"),
            new QualityMetric(0.94, 0.85, "-0.01 vs semana pasada", "OK", "Cohesión lógica y estructura de la respuesta"),
            new QualityMetric(0.96, 0.90, "+0.01 vs semana pasada", "OK", "Calidad lingüística y gramática"),
            new QualityMetric(0.88, 0.80, "-0.01 vs semana pasada", "OK", "Recuperación de contexto relevante del índice")
        ),
        [
            new("Mar 14", 0.91, 0.89, 0.93, 0.95),
            new("Mar 15", 0.92, 0.90, 0.93, 0.95),
            new("Mar 16", 0.90, 0.88, 0.92, 0.96),
            new("Mar 17", 0.93, 0.91, 0.94, 0.96),
            new("Mar 18", 0.93, 0.90, 0.93, 0.95),
            new("Mar 19", 0.93, 0.91, 0.94, 0.96),
            new("Mar 20", 0.93, 0.91, 0.94, 0.96),
        ],
        [
            new("Groundedness", 0.93), new("Relevance", 0.91),
            new("Context Recall", 0.88), new("Coherence", 0.94), new("Fluency", 0.96),
        ]
    );
}
