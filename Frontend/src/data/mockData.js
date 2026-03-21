// ========== Chat Mock Data ==========
export const chatHistory = [
  { id: 1, title: '¿Cuáles son los requisitos de aranceles para importar Paneles...', timestamp: 'Hace 2h' },
  { id: 2, title: 'Procedimiento de importación de maquinaria industrial', timestamp: 'Hace 5h' },
  { id: 3, title: 'Regulaciones aduaneras para productos electrónicos', timestamp: 'Ayer' },
  { id: 4, title: 'Documentos necesarios para exportar a la UE', timestamp: 'Ayer' },
]

export const chatMessages = [
  {
    id: 1,
    role: 'user',
    content: '¿Cuáles son los requisitos de aranceles para importar Paneles Solares desde China?',
  },
  {
    id: 2,
    role: 'assistant',
    content: `Para importar paneles solares desde China, debes considerar los siguientes requisitos arancelarios:

Los paneles solares están sujetos a un arancel estándar del 15% sobre el valor CIF [1]. Sin embargo, existe un acuerdo preferencial que puede reducir el arancel al 8% si se cumple la certificación de origen chino verificada [2].

Adicionalmente, se requiere una certificación de calidad emitida por un organismo reconocido internacionalmente [1], y documentación que acredite el cumplimiento de normas IEC 61215 e IEC 61730 [3]. El plazo de procesamiento en aduana es de 3-5 días hábiles [2].`,
    citations: [
      {
        id: 1,
        title: 'Cita [1]',
        source: 'Fragmento de SOP_Importación_2024 - Pág 5, Párrafo 3',
        text: '"Los paneles solares importados desde China están sujetos a un arancel del 15% sobre el valor CIF (Costo, Seguro y Flete). Además, se requiere una certificación de calidad emitida por un organismo reconocido internacionalmente."',
        link: '#',
      },
      {
        id: 2,
        title: 'Cita [2]',
        source: 'Tratado Comercial Asia-Pacífico 2023 - Art. 47',
        text: '"Bajo el acuerdo preferencial, los productos con certificación de origen verificada pueden acceder a una reducción arancelaria del 8%. El procesamiento aduanero estándar tiene un plazo de 3-5 días hábiles."',
        link: '#',
      },
      {
        id: 3,
        title: 'Cita [3]',
        source: 'Regulaciones IEC para Paneles Solares - Sección 12',
        text: '"Todos los paneles solares importados deben cumplir las normas IEC 61215 (diseño) e IEC 61730 (seguridad) para su comercialización."',
        link: '#',
      },
    ],
    groundedness: 0.94,
  },
]

// ========== Dashboard Mock Data ==========
export const dashboardMetrics = {
  groundednessScore: { value: 0.93, trend: '↑ 3% desde la semana pasada', status: 'good' },
  responseTime: { value: '1.4s', trend: '↓ 0.2s desde ayer', status: 'good' },
  documentsIngested: { value: 247, trend: '+12 este mes', status: 'good' },
  contentSafetyAlerts: { value: 2, trend: 'Última semana', status: 'warning' },
}

export const groundednessChartData = [
  { date: 'Mar 14', value: 0.91 },
  { date: 'Mar 15', value: 0.92 },
  { date: 'Mar 16', value: 0.90 },
  { date: 'Mar 17', value: 0.93 },
  { date: 'Mar 18', value: 0.94 },
  { date: 'Mar 19', value: 0.93 },
  { date: 'Mar 20', value: 0.93 },
]

export const recentAlerts = [
  { id: 1, type: 'danger', message: 'Consulta bloqueada por Content Safety (Hate)', time: 'Hace 2h' },
  { id: 2, type: 'info', message: 'Documento Normas Fitosanitarias en indexación', time: 'Hace 3h' },
  { id: 3, type: 'warning', message: 'Groundedness bajo umbral en 1 consulta (0.71)', time: 'Hace 5h' },
  { id: 4, type: 'danger', message: 'Nuevo usuario externo ext_user_091 bloqueado', time: 'Hace 6h' },
]

// ========== Documents Mock Data ==========
export const documentsStats = {
  totalDocs: 12,
  processed: 9,
  indexing: 2,
  error: 1,
  totalFragments: 507,
}

export const documents = [
  { id: 1, name: 'SOP_Importacion_2024_v3.pdf', user: 'admin@empresa.com', container: 'az-blob-compliance/sops/', status: 'Procesado', fragments: 48, size: '2.4 MB', date: '2026-03-19' },
  { id: 2, name: 'Regulaciones_Comercio_Intl.pdf', user: 'admin@empresa.com', container: 'az-blob-compliance/regulations/', status: 'Procesado', fragments: 112, size: '5.1 MB', date: '2026-03-17' },
  { id: 3, name: 'Tratados_Asia_Pacifico.pdf', user: 'admin@empresa.com', container: 'az-blob-compliance/treaties/', status: 'Procesado', fragments: 76, size: '3.3 MB', date: '2026-03-15' },
  { id: 4, name: 'Contrato_Proveedor_China_2024.pdf', user: 'lgarcia@empresa.com', container: 'az-blob-contracts/active/', status: 'Indexando', fragments: null, size: '1.2 MB', date: '2026-03-20' },
  { id: 5, name: 'Certificaciones_ISO_Panel_Solar.pdf', user: 'admin@empresa.com', container: 'az-blob-certifications/', status: 'Procesado', fragments: 21, size: '890 KB', date: '2026-03-12' },
  { id: 6, name: 'Politica_Aduanera_UE_2025.pdf', user: 'lgarcia@empresa.com', container: 'az-blob-compliance/regulations/', status: 'Procesado', fragments: 95, size: '4.3 MB', date: '2026-03-10' },
]

// ========== Quality Mock Data ==========
export const qualityMetrics = {
  groundedness: { value: 0.93, threshold: 0.85, trend: '+0.05 vs semana pasada', status: 'OK', description: 'Respuestas basadas en fuentes verificadas' },
  relevance: { value: 0.91, threshold: 0.8, trend: '+0.02 vs semana pasada', status: 'OK', description: 'Adecuación de la respuesta a la consulta' },
  coherence: { value: 0.94, threshold: 0.85, trend: '-0.01 vs semana pasada', status: 'OK', description: 'Cohesión lógica y estructura de la respuesta' },
  fluency: { value: 0.96, threshold: 0.9, trend: '+0.01 vs semana pasada', status: 'OK', description: 'Calidad lingüística y gramática' },
  contextRecall: { value: 0.88, threshold: 0.8, trend: '-0.01 vs semana pasada', status: 'OK', description: 'Recuperación de contexto relevante del índice' },
}

export const qualityChartData = [
  { date: 'Mar 14', groundedness: 0.91, relevance: 0.89, coherence: 0.93, fluency: 0.95 },
  { date: 'Mar 15', groundedness: 0.92, relevance: 0.90, coherence: 0.93, fluency: 0.95 },
  { date: 'Mar 16', groundedness: 0.90, relevance: 0.88, coherence: 0.92, fluency: 0.96 },
  { date: 'Mar 17', groundedness: 0.93, relevance: 0.91, coherence: 0.94, fluency: 0.96 },
  { date: 'Mar 18', groundedness: 0.93, relevance: 0.90, coherence: 0.93, fluency: 0.95 },
  { date: 'Mar 19', groundedness: 0.93, relevance: 0.91, coherence: 0.94, fluency: 0.96 },
  { date: 'Mar 20', groundedness: 0.93, relevance: 0.91, coherence: 0.94, fluency: 0.96 },
]

export const radarData = [
  { metric: 'Groundedness', value: 0.93 },
  { metric: 'Relevance', value: 0.91 },
  { metric: 'Context Recall', value: 0.88 },
  { metric: 'Coherence', value: 0.94 },
  { metric: 'Fluency', value: 0.96 },
]
