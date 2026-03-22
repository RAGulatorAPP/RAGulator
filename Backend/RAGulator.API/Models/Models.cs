namespace RAGulator.API.Models;

// ========== Chat Models ==========
public record ChatHistoryItem(int Id, string Title, string Timestamp);

public record Citation(int Id, string Title, string Source, string Text, string Link);

public record ChatMessage(int Id, string Role, string Content, List<Citation>? Citations = null, double? Groundedness = null);

public record SendMessageRequest(string Message, int? ConversationId = null, string? SessionId = null);

public record SendMessageResponse(ChatMessage UserMessage, ChatMessage AssistantMessage);

// ========== Dashboard Models ==========
public record MetricValue(string Value, string Trend, string Status);

public record DashboardMetrics(
    MetricValue GroundednessScore,
    MetricValue ResponseTime,
    MetricValue DocumentsIngested,
    MetricValue ContentSafetyAlerts
);

public record ChartDataPoint(string Date, double Value);

public record AlertItem(int Id, string Type, string Message, string Time);

public record DashboardData(DashboardMetrics Metrics, List<ChartDataPoint> ChartData, List<AlertItem> Alerts);

// ========== Documents Models ==========
public record DocumentStats(int TotalDocs, int Processed, int Indexing, int Error, int TotalFragments);

public record DocumentItem(
    int Id, string Name, string User, string Container,
    string Status, int? Fragments, string Size, string Date
);

public record DocumentsData(DocumentStats Stats, List<DocumentItem> Documents);

// ========== Quality Models ==========
public record QualityMetric(double Value, double Threshold, string Trend, string Status, string Description);

public record QualityMetrics(
    QualityMetric Groundedness,
    QualityMetric Relevance,
    QualityMetric Coherence,
    QualityMetric Fluency,
    QualityMetric ContextRecall
);

public record QualityChartPoint(string Date, double Groundedness, double Relevance, double Coherence, double Fluency);

public record RadarDataPoint(string Metric, double Value);

public record QualityData(QualityMetrics Metrics, List<QualityChartPoint> ChartData, List<RadarDataPoint> RadarData);
