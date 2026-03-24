# RAGulator 🔍

> **"Transforma la incertidumbre en confianza absoluta."**

Sistema **Governed RAG (Retrieval-Augmented Generation)** de grado empresarial para el sector de Comercio Internacional. RAGulator permite a los equipos de importación y exportación consultar normativas, aranceles y procesos complejos, obteniendo respuestas precisas respaldadas por documentos corporativos reales con **citas bibliográficas verificables y trazabilidad completa**.

---

## 📸 Funcionalidades Clave

- **Chat Inteligente RAG**: Generación de respuestas basadas exclusivamente en la base de conocimientos interna.
- **Citas de Fuente Exactas**: Cada afirmación incluye una referencia al parrafo y documento original.
- **Groundedness Scoring**: Evaluación en tiempo real de la fidelidad de la respuesta frente a la fuente.
- **Panel de Gobernanza**: Control total sobre la ingesta de documentos, métricas de calidad y alertas de seguridad.
- **Content Safety Integrado**: Filtros automáticos contra lenguaje inapropiado y fuga de información sensible.

---

## 🏗️ Arquitectura de Producción (Azure Native)

RAGulator ha sido diseñado para escalar y operar de forma segura en la nube de Microsoft, utilizando un stack 100% nativo de Azure:

| Componente | Servicio Azure | Propósito |
|---|---|---|
| **Frontend** | Azure Static Web Apps | Aplicación React 19 de alto rendimiento. |
| **Backend API** | Azure App Service | Microservicio en .NET 10 con orquestación de IA. |
| **Base de Datos** | Azure Cosmos DB | Persistencia global de sesiones, chats y auditoría. |
| **Motor de Búsqueda** | Azure AI Search | Indexación vectorial e híbrida para Retrieval de precisión. |
| **Motor de IA** | Azure OpenAI (GPT-4o) | Generación de lenguaje natural y razonamiento complejo. |
| **Ingesta de Docs** | AI Document Intelligence | Extracción de texto y estructura de PDFs complejos. |
| **Almacenamiento** | Azure Blob Storage | Repositorio seguro para archivos fuente originales. |
| **Identidad** | Microsoft Entra ID | Autenticación y RBAC (Control de Acceso Basado en Roles). |
| **Seguridad de IA** | Azure AI Content Safety | Auditoría y bloqueo de prompts/respuestas inseguras. |
| **Secretos** | Azure Key Vault | Gestión 
---

## 📁 Estructura del Proyecto

```
RAGulator/
├── Frontend/                  # React 19 + Vite 8
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ChatPage.jsx          # Interfaz de chat con citas y fuentes
│   │   │   ├── AdminDashboard.jsx    # KPIs estratégicos y telemetría
│   │   │   ├── DocumentsPage.jsx     # Gestión del ciclo de vida de documentos
│   │   │   ├── QualityPage.jsx       # Métricas RAG (Coherencia, Relevancia)
│   │   │   ├── SecurityPage.jsx      # Monitor de Content Safety
│   │   │   ├── AuditPage.jsx         # Trazabilidad y auditoría de logs
│   │   │   └── UsersPage.jsx         # Gestión de acceso y roles
│   │   └── index.css                 # Sistema de diseño premium
│
└── Backend/                   # .NET 10 (C#)
    └── RAGulator.API/
        ├── Controllers/       # Endpoints REST protegidos por Entra ID
        ├── Services/          # Lógica de negocio, RAG Pipeline y Telemetría
        └── Configuration/     # Modelos de configuración de Azure Services
```

---

## 🚀 Despliegue y Configuración

### 1. Variables de Entorno (Producción)
Para operar en Azure, el App Service requiere las siguientes configuraciones clave:
- `CosmosDB__ConnectionString`: Persistencia de sesiones y telemetría.
- `AzureAIFoundry__Endpoint` & `ApiKey`: Orquestación del modelo GPT-4o.
- `AzureAISearch__Endpoint` & `ApiKey`: Recuperación de documentos relevantes.
- `AzureAd__TenantId` & `ClientId`: Autenticación corporativa segura.

### 2. Ejecución Local (Desarrollo)
```bash
# Frontend
cd Frontend && npm install && npm run dev

# Backend
cd Backend/RAGulator.API && dotnet build && dotnet run
```

---

## 📡 Capacidades de la API

| Endpoint | Descripción |
|---|---|
| `POST /api/chat/message` | Envía un prompt al pipeline RAG, ejecuta búsqueda y genera respuesta con citas. |
| `GET /api/chat/sessions` | Recupera el historial de chat persistido en Cosmos DB. |
| `POST /api/documents/upload` | Ingesta documentos: los analiza con Doc Intelligence y los indexa en AI Search. |
| `GET /api/quality/metrics` | Obtiene el radar chart de las métricas de calidad RAG (Groundedness, Recall, etc). |

---

## 🎨 Design System
RAGulator utiliza una estética **Premium Dark Mode** diseñada para entornos de decisión:
- **Navy Deep**: `#0a0e1a` para la base estructural.
- **Teal / Cyan High-Contrast**: Para acentos de IA y visualización de datos.
- **Glassmorphism**: Efectos de transparencia en capas para una sensación de profundidad.
- **Gráficos Dinámicos**: Integración con Recharts para visualización de telemetría en tiempo real.

---

## 🏆 Objetivo del Proyecto
RAGulator no es solo un chat; es una herramienta de **Gobernanza de IA**. Asegura que el modelo no alucine ("Hallucination-free") forzándolo a utilizar únicamente fuentes oficiales cargadas por el administrador, reportando cada interacción a una bitácora de auditoría inmutable en Azure para cumplimiento normativo total.
