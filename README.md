# RAGulator 🔍 (100% Producción en Azure)

> **"Transforma la incertidumbre en confianza absoluta."**

Sistema RAG (Retrieval-Augmented Generation) avanzado, gobernado y trazable para comercio internacional. RAGulator es una solución **100% funcional** que unifica el ecosistema de **puntos de inteligencia de Azure** para ofrecer respuestas fundamentadas con citas bibliográficas inmutables.

---

## 🏗️ Arquitectura de Gobernanza AI

RAGulator no es solo un chat; es una orquestación distribuida de más de 13 servicios de Azure trabajando en armonía:

| Categoría | Servicio Azure | Rol Estratégico |
|---|---|---|
| **Cómputo Backend** | **Azure App Service** | Engine dinámico en **.NET 10** con escalado horizontal. |
| **Frontend Global** | **Azure Static Web Apps** | Hosting optimizado (Edge) para la SPA en React 19. |
| **Base de Datos** | **Azure Cosmos DB (NoSQL)** | Almacenamiento distribuido de sesiones, telemetría y auditoría. |
| **Almacenamiento** | **Azure Blob Storage** | Data Lake para documentos fuente y procesamiento de archivos. |
| **Inteligencia LLM** | **Azure AI Foundry** | Motor de razonamiento avanzado utilizando el modelo **GPT-5.4-mini**. |
| **Ingesta de Datos** | **Azure AI Document Intelligence** | Clasificación y extracción de tablas/texto de documentos legales. |
| **Vector Database** | **Azure AI Search** | Indexación semántica y búsqueda híbrida (Keywords + Vectors). |
| **Moderación AI** | **Azure AI Content Safety** | Blindaje en tiempo real contra contenido sensible o inseguro. |
| **Identidad & SSO** | **Microsoft Entra ID (Azure AD)** | Autenticación corporativa y control de acceso (RBAC). |
| **Directorio** | **Microsoft Graph API** | Integración de perfiles de usuario y estructura organizacional. |
| **Secretos** | **Azure Key Vault** | Gestión centralizada de llaves y certificados de producción. |
| **Observabilidad** | **Azure Application Insights** | Telemetría detallada de rendimiento y trazas de errores. |
| **Diagnóstico** | **Azure Monitor** | Análisis de salud de la infraestructura y alertas críticas. |
| **Rendimiento** | **Azure Cache for Redis** | Capa de caché distribuida (Cache-Aside) para carga instantánea de dashboards. |

---

## 🚀 Capacidades Core del Sistema

### 1. Motor de Razonamiento GPT-5.4-mini
El corazón del sistema utiliza la última iteración de modelos eficientes de Azure, permitiendo un razonamiento complejo con una latencia mínima de respuesta.

### 2. Ingesta Inteligente (Extraction Pipeline)
Los documentos subidos se envían a **Document Intelligence** para un OCR de alta fidelidad, se fragmentan (Chunking) y se vectorizan automáticamente para que estén disponibles en el chat en milisegundos.

### 3. Trazabilidad y Auditoría (Governed RAG)
Cada mensaje generado incluye un **Groundedness Score** calculado dinámicamente. Todas las interacciones se registran en **Cosmos DB** junto con los logs de **Application Insights**, permitiendo auditorías completas de seguridad.

### 4. Carga Instantánea con Azure Redis
La plataforma implementa una capa de caché persistente que almacena los resultados de telemetría y métricas durante 5 minutos, permitiendo que el panel de administración responda en milisegundos tras la primera consulta.

### 5. Seguridad de Grado Empresarial
- **CORS Estricto**: Solo el Frontend autorizado en Static Web Apps puede llamar a la API.
- **Entra ID Native**: Login seguro integrado con el directorio activo de la organización.
- **Content Safety**: Filtrado automático de cualquier respuesta que no cumpla con las políticas de ética AI.
- **Zero-Secrets Policy**: Autenticación sin contraseñas para Redis y Key Vault mediante Managed Identities.

---

## 📁 Estructura del Proyecto

RAGulator sigue una arquitectura de microservicios y capas limpia (Clean Architecture):

- **`Frontend/`**: Aplicación Single Page (SPA) construida con **React 19** y **Vite 8**. Implementa un Design System premium con Glassmorphism y visualización de datos en tiempo real mediante Recharts.
- **`Backend/`**: Web API robusta en **.NET 10**. Utiliza el SDK oficial de Azure para la integración nativa con todos los servicios de AI sin dependencias de terceros.

---

## 🚀 Despliegue y Operación

El proyecto utiliza **GitHub Actions** para un pipeline de **CI/CD** completo:

1.  **Build & Test**: Compilación de la API y el Frontend.
2.  **Deploy**: Publicación automática en Azure App Service y Static Web Apps.
3.  **Configuración**: Gestión dinámica de secretos mediante Application Settings y variables de entorno protegidas.

---

## 🏢 Capacidades de Administración

- **Dashboard de Control**: KPIs sobre latencia, Groundedness Score y documentos procesados.
- **Ingesta Dinámica**: Interfaz para subir PDFs que se indexan automáticamente en el motor vectorial.
- **Auditoría de Seguridad**: Registro inmutable en Cosmos DB de cada interacción, incluyendo alertas de Content Safety.
- **Gestión de Calidad**: Seguimiento de métricas RAGAS (Fidelidad, Relevancia, Coherencia y Fluidez).

---

## 🎨 Design System

Interfaz diseñada para una experiencia de usuario de alto impacto:
- **Deep Dark Theme**: Estética profesional inspirada en centros de control modernos.
- **Micro-interacciones**: Transiciones fluidas y estados de carga animados para una sensación de fluidez (60 FPS).
- **Responsive**: Totalmente adaptable a dispositivos móviles para consultas en campo.

---

## 📝 Nota de Entrega Final

Este sistema representa el estado del arte en **Sistemas RAG Gobernados**, demostrando cómo la integración profunda de los servicios nativos de Azure crea una plataforma resiliente, escalable y, sobre todo, confiable para la toma de decisiones críticas en comercio exterior.
