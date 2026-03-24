# RAGulator 🔍

> **"Transforma la incertidumbre en confianza absoluta."**

Sistema RAG (Retrieval-Augmented Generation) gobernado y trazable para comercio internacional de importación/exportación. Permite a equipos regulados consultar sobre productos/servicios y obtener respuestas instantáneas respaldadas **exclusivamente** por documentos internos reales, con citas exactas obligatorias.

---

## 📸 Vista Previa

| Interfaz de Usuario | Panel de Administración |
|---|---|
| Chat con citas bibliográficas y Groundedness Score | KPIs, gráficos de evaluación y alertas |

---

## 🏗️ Arquitectura del Sistema

```
Query → Content Safety (entrada) → Retrieval + Re-ranking (AI Search)
      → Prompt + Contexto → Generación (OpenAI)
      → Evaluación Integral (citas + groundedness)
      → Content Safety (salida) → Respuesta Validada con Citas
```

### Stack Tecnológico (Ecosistema Azure)

| Categoría | Servicio |
|---|---|
| **Alojamiento** | Azure App Service |
| **Base de datos** | Azure Cosmos DB |
| **Almacenamiento** | Azure Blob Storage |
| **Extracción de texto** | Azure AI Document Intelligence |
| **Búsqueda híbrida + Vectores** | Azure AI Search |
| **LLM principal** | Azure OpenAI (GPT-4o) |
| **Orquestación RAG** | Azure AI Studio / Prompt Flow |
| **Autenticación** | Microsoft Entra ID (RBAC) |
| **Seguridad de contenido** | Azure AI Content Safety |
| **Secretos** | Azure Key Vault |
| **Observabilidad** | Azure Monitor / Application Insights |
| **Reportes** | Power BI |

---

## 📁 Estructura del Proyecto

```
RAGulator/
├── Frontend/                  # React 19 + Vite 8
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ChatPage.jsx          # Interfaz de chat con citas
│   │   │   ├── AdminDashboard.jsx    # KPIs y métricas
│   │   │   ├── DocumentsPage.jsx     # Gestión de documentos
│   │   │   ├── QualityPage.jsx       # Calidad RAG
│   │   │   ├── SecurityPage.jsx      # Seguridad y Content Safety
│   │   │   ├── AuditPage.jsx         # Auditoría y trazabilidad
│   │   │   ├── UsersPage.jsx         # Usuarios & Roles
│   │   │   └── ConfigPage.jsx        # Configuración
│   │   ├── components/
│   │   │   ├── AdminLayout.jsx       # Layout con sidebar
│   │   │   └── AdminSidebar.jsx      # Navegación admin
│   │   ├── data/
│   │   │   └── mockData.js           # Datos de demostración
│   │   ├── App.jsx                   # Router principal
│   │   └── index.css                 # Design system (tokens CSS)
│   └── package.json
│
└── Backend/                   # .NET 10 Web API
    └── RAGulator.API/
        ├── Controllers/
        │   ├── ChatController.cs
        │   ├── DashboardController.cs
        │   ├── DocumentsController.cs
        │   └── QualityController.cs
        ├── Models/
        │   └── Models.cs
        ├── Services/
        │   └── MockDataService.cs
        └── Program.cs
```

---

## 🚀 Cómo Ejecutar

### Prerrequisitos

- [Node.js 18+](https://nodejs.org/)
- [.NET 10 SDK](https://dotnet.microsoft.com/download)

### Frontend (React)

```bash
cd Frontend
npm install
npm run dev
```

→ Disponible en **http://localhost:5173**

### Backend (.NET 10)

```bash
cd Backend/RAGulator.API
dotnet run
```

→ API disponible en **http://localhost:5000**

---

## 🗺️ Páginas y Rutas

| Ruta | Vista | Descripción |
|---|---|---|
| `/` | Chat | Interfaz de usuario con historial, citas y Groundedness |
| `/admin` | Dashboard | KPIs, gráfico de evaluación, alertas recientes |
| `/admin/documents` | Documentos | Índice de documentos en Azure Blob Storage |
| `/admin/quality` | Calidad RAG | Métricas de evaluación continua y radar chart |
| `/admin/security` | Seguridad | Content Safety y políticas |
| `/admin/audit` | Auditoría | Trazabilidad de consultas |
| `/admin/users` | Usuarios | RBAC con Microsoft Entra ID |
| `/admin/settings` | Configuración | Parámetros del pipeline RAG |

---

## 📡 API Endpoints (Backend Mock)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/chat/history` | Historial de conversaciones |
| `GET` | `/api/chat/messages/{id}` | Mensajes de una conversación |
| `POST` | `/api/chat/message` | Enviar consulta al pipeline RAG |
| `GET` | `/api/dashboard` | Métricas del dashboard |
| `GET` | `/api/documents` | Lista de documentos ingestados |
| `POST` | `/api/documents/upload` | Subir nuevo documento |
| `GET` | `/api/quality` | Métricas de calidad RAG |

---

## 🎨 Design System

Tema oscuro premium con:
- **Colores**: Dark navy (`#0a0e1a`) + Teal/Cyan (`#00d4aa`, `#06b6d4`)
- **Tipografía**: Inter (Google Fonts)
- **Efectos**: Glassmorphism, gradientes, micro-animaciones CSS
- **Gráficos**: Recharts (AreaChart, LineChart, RadarChart)
- **Iconos**: Lucide React

---

## 📝 Notas

> Este proyecto es un **mockup funcional** con datos de demostración. Para conectar con los servicios reales de Azure, es necesario configurar las credenciales correspondientes en las variables de entorno del backend.
