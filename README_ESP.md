<div align="center">
  <img src="assets/intro%20RaG.gif" alt="RAGulator Intro Banner" width="100%"/>
</div>

<div align="center">
  <img src="assets/hackathon.png" alt="Hackathon" height="86"/>
  &nbsp;&nbsp;
  <img src="assets/cody.png" alt="Cody" height="101"/>
  &nbsp;&nbsp;
  <img src="assets/codigo%20facilito.png" alt="Código Facilito" height="60"/>
</div>

# <img src="assets/Icono_62_x_64.png" width="28" height="28" style="vertical-align:middle"/> RAGulator 🔍 (100% Producción en Azure)

> **"Transforma la incertidumbre en confianza absoluta."**

<div align="center">

[![📊 Ver Presentación](https://img.shields.io/badge/📊%20Ver%20Presentación-Canva-7B2FBE?style=for-the-badge&logo=canva&logoColor=white)](https://www.canva.com/design/DAHEz-_Hs1w/PWPA4SuTZQ6rfiLwMgRRNQ/view)

</div>

Sistema RAG (Retrieval-Augmented Generation) avanzado, gobernado y trazable para comercio internacional. RAGulator es una solución **100% funcional** que unifica el ecosistema de **puntos de inteligencia de Azure** para ofrecer respuestas fundamentadas con citas bibliográficas inmutables.

---

## 🎬 Demo

<div align="center">
  <a href="https://github.com/RAGulatorAPP/RAGulator/raw/main/slides/intro%20RaG_video.mp4">
    <img src="assets/intro%20RaG.gif" alt="▶ Clic para ver el video demo" width="90%"/>
  </a>
  <p><em>▶ Haz clic en la preview para ver el video completo</em></p>
  <br/>
  <a href="https://github.com/RAGulatorAPP/RAGulator/raw/main/slides/intro%20RaG.pptx">
    <img src="https://img.shields.io/badge/📥%20Descargar%20Presentaci%C3%B3n-PowerPoint-B7472A?style=for-the-badge&logo=microsoftpowerpoint&logoColor=white" alt="Descargar Presentación"/>
  </a>
</div>

---

## <img src="assets/Icono_62_x_64.png" width="22" height="22" style="vertical-align:middle"/> 🏗️ Arquitectura de Gobernanza AI

RAGulator no es solo un chat; es una orquestación distribuida de más de 13 servicios de Azure trabajando en armonía:

<div align="center">
  <img src="assets/aruitectura.png" alt="Arquitectura RAGulator" width="90%"/>
</div>



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
| **Documentación** | **Scalar (OpenAPI)** | API Reference moderna e interactiva integrada en el backend. |

<div align="center">
  <img src="assets/Ragulator%20api.png" alt="RAGulator API - Scalar Documentation" width="90%"/>
  <p><em>Vista de la API interactiva (Scalar / OpenAPI)</em></p>
</div>

---

## <img src="assets/Icono_62_x_64.png" width="22" height="22" style="vertical-align:middle"/> 🚀 Capacidades Core del Sistema

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

## <img src="assets/Icono_62_x_64.png" width="22" height="22" style="vertical-align:middle"/> 📁 Estructura del Proyecto

RAGulator sigue una arquitectura de microservicios y capas limpia (Clean Architecture):

- **`Frontend/`**: Aplicación Single Page (SPA) construida con **React 19** y **Vite 8**. Implementa un Design System premium con Glassmorphism y visualización de datos en tiempo real mediante Recharts.
- **`Backend/`**: Web API robusta en **.NET 10**. Utiliza el SDK oficial de Azure para la integración nativa y expone una **Documentación Técnica (Scalar)** para pruebas interactivas de endpoints.

<div align="center">
  <img src="assets/app.png" alt="RAGulator App" width="49%"/>
  <img src="assets/app2.png" alt="RAGulator App 2" width="49%"/>
</div>

---

## <img src="assets/Icono_62_x_64.png" width="22" height="22" style="vertical-align:middle"/> 🚀 Despliegue y Operación

El proyecto utiliza **GitHub Actions** para un pipeline de **CI/CD** completo:

1.  **Build & Test**: Compilación de la API y el Frontend.
2.  **Deploy**: Publicación automática en Azure App Service y Static Web Apps.
3.  **Configuración**: Gestión dinámica de secretos mediante Application Settings y variables de entorno protegidas.

---

## <img src="assets/Icono_62_x_64.png" width="22" height="22" style="vertical-align:middle"/> 🏢 Capacidades de Administración

- **Dashboard de Control**: KPIs sobre latencia, Groundedness Score y documentos procesados.
- **Ingesta Dinámica**: Interfaz para subir PDFs que se indexan automáticamente en el motor vectorial.
- **Auditoría de Seguridad**: Registro inmutable en Cosmos DB de cada interacción, incluyendo alertas de Content Safety.
- **Gestión de Calidad**: Seguimiento de métricas RAGAS (Fidelidad, Relevancia, Coherencia y Fluidez).

<div align="center">
  <img src="assets/auditory.png" alt="Auditoría RAGulator" width="49%"/>
  <img src="assets/config.png" alt="Configuración RAGulator" width="49%"/>
</div>

---

## <img src="assets/Icono_62_x_64.png" width="22" height="22" style="vertical-align:middle"/> 🎨 Design System

Interfaz diseñada para una experiencia de usuario de alto impacto:
- **Deep Dark Theme**: Estética profesional inspirada en centros de control modernos.
- **Micro-interacciones**: Transiciones fluidas y estados de carga animados para una sensación de fluidez (60 FPS).
- **Responsive**: Totalmente adaptable a dispositivos móviles para consultas en campo.

---

## <img src="assets/Icono_62_x_64.png" width="22" height="22" style="vertical-align:middle"/> 📝 Nota de Entrega Final

Este sistema representa el estado del arte en **Sistemas RAG Gobernados**, demostrando cómo la integración profunda de los servicios nativos de Azure crea una plataforma resiliente, escalable y, sobre todo, confiable para la toma de decisiones críticas en comercio exterior.
<div align="center">
  <img src="assets/banner.png" alt="RAGulator Banner" width="100%"/>
</div>
---

## <img src="assets/Icono_62_x_64.png" width="22" height="22" style="vertical-align:middle"/> � Enlaces del Proyecto

<div align="center">

[![Ver App en Producción](https://img.shields.io/badge/🌐_App_en_Producción-Azure_Static_Web_Apps-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)](https://mango-pebble-0fd224f0f.6.azurestaticapps.net/admin/documents)
&nbsp;&nbsp;
[![Dashboard Power BI](https://img.shields.io/badge/📊_Dashboard-Power_BI-F2C811?style=for-the-badge&logo=powerbi&logoColor=black)](https://app.powerbi.com/groups/me/reports/fc1d522f-1332-4c6f-a677-058a95ed0e95/0abdc7e72ae926b4a0a6?experience=power-bi)

</div>

### 🎬 Demo en Video

<div align="center">
  <a href="https://www.youtube.com/watch?v=0xex5qgugE4" target="_blank">
    <img src="https://img.youtube.com/vi/0xex5qgugE4/maxresdefault.jpg" alt="Ver Demo RAGulator en YouTube" width="70%"/>
  </a>
  <p><em>▶️ Haz clic para ver la demo completa en YouTube</em></p>
</div>

---

## <img src="assets/Icono_62_x_64.png" width="22" height="22" style="vertical-align:middle"/> �👥 Team

<div align="center">
  <img src="assets/team.png" alt="RAGulator Team" width="80%"/>
</div>

<div align="center">

| | Nombre | LinkedIn |
|:---:|:---|:---:|
| 👤 | **Jimena Fioni** | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/jimena-fioni/) |
| 👤 | **Juan Pablo Urra Jara** | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/juan-pablo-urra/) |
| 👤 | **Diego Alvarez** | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/diego-alvarez-615756104) |
| 👤 | **Fernando Pedernera** | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/fernando-pedernera) |

</div>
