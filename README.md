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

# <img src="assets/Icono_62_x_64.png" width="28" height="28" style="vertical-align:middle"/> RAGulator 🔍 (100% Production on Azure)

> **"Transform uncertainty into absolute confidence."**

<div align="center">

[![📊 View Presentation](https://img.shields.io/badge/📊%20View%20Presentation-Canva-7B2FBE?style=for-the-badge&logo=canva&logoColor=white)](https://www.canva.com/design/DAHEz-_Hs1w/PWPA4SuTZQ6rfiLwMgRRNQ/view)

</div>

Advanced, governed, and traceable RAG (Retrieval-Augmented Generation) system for international trade. RAGulator is a **100% functional** solution that unifies the **Azure intelligence ecosystem** to deliver grounded responses with immutable bibliographic citations.

---

## <img src="assets/Icono_62_x_64.png" width="22" height="22" style="vertical-align:middle"/> 🏗️ AI Governance Architecture

RAGulator is not just a chat; it is a distributed orchestration of more than 13 Azure services working in harmony:

<div align="center">
  <img src="assets/aruitectura.png" alt="RAGulator Architecture" width="90%"/>
</div>

| Category | Azure Service | Strategic Role |
|---|---|---|
| **Backend Compute** | **Azure App Service** | Dynamic engine in **.NET 10** with horizontal scaling. |
| **Global Frontend** | **Azure Static Web Apps** | Edge-optimized hosting for the React 19 SPA. |
| **Database** | **Azure Cosmos DB (NoSQL)** | Distributed storage for sessions, telemetry, and auditing. |
| **Storage** | **Azure Blob Storage** | Data Lake for source documents and file processing. |
| **LLM Intelligence** | **Azure AI Foundry** | Advanced reasoning engine using the **GPT-5.4-mini** model. |
| **Data Ingestion** | **Azure AI Document Intelligence** | Classification and extraction of tables/text from legal documents. |
| **Vector Database** | **Azure AI Search** | Semantic indexing and hybrid search (Keywords + Vectors). |
| **AI Moderation** | **Azure AI Content Safety** | Real-time shield against sensitive or unsafe content. |
| **Identity & SSO** | **Microsoft Entra ID (Azure AD)** | Corporate authentication and access control (RBAC). |
| **Directory** | **Microsoft Graph API** | Integration of user profiles and organizational structure. |
| **Secrets** | **Azure Key Vault** | Centralized management of production keys and certificates. |
| **Observability** | **Azure Application Insights** | Detailed performance telemetry and error traces. |
| **Diagnostics** | **Azure Monitor** | Infrastructure health analysis and critical alerts. |
| **Performance** | **Azure Cache for Redis** | Distributed cache layer (Cache-Aside) for instant dashboard loading. |
| **Documentation** | **Scalar (OpenAPI)** | Modern interactive API Reference integrated in the backend. |

<div align="center">
  <img src="assets/Ragulator%20api.png" alt="RAGulator API - Scalar Documentation" width="90%"/>
  <p><em>Interactive API view (Scalar / OpenAPI)</em></p>
</div>

---

## <img src="assets/Icono_62_x_64.png" width="22" height="22" style="vertical-align:middle"/> 🚀 Core System Capabilities

### 1. GPT-5.4-mini Reasoning Engine
The heart of the system uses the latest iteration of Azure efficient models, enabling complex reasoning with minimal response latency.

### 2. Smart Ingestion (Extraction Pipeline)
Uploaded documents are sent to **Document Intelligence** for high-fidelity OCR, chunked, and automatically vectorized so they are available in chat within milliseconds.

### 3. Traceability and Auditing (Governed RAG)
Every generated message includes a dynamically calculated **Groundedness Score**. All interactions are logged in **Cosmos DB** along with **Application Insights** logs, enabling full security audits.

### 4. Instant Loading with Azure Redis
The platform implements a persistent cache layer that stores telemetry and metrics results for 5 minutes, allowing the admin panel to respond in milliseconds after the first query.

### 5. Enterprise-Grade Security
- **Strict CORS**: Only the authorized Frontend on Static Web Apps can call the API.
- **Native Entra ID**: Secure login integrated with the organization's active directory.
- **Content Safety**: Automatic filtering of any response that does not comply with AI ethics policies.
- **Zero-Secrets Policy**: Passwordless authentication for Redis and Key Vault via Managed Identities.

---

## <img src="assets/Icono_62_x_64.png" width="22" height="22" style="vertical-align:middle"/> 📁 Project Structure

RAGulator follows a clean microservices and layered architecture (Clean Architecture):

- **`Frontend/`**: Single Page Application (SPA) built with **React 19** and **Vite 8**. Implements a premium Design System with Glassmorphism and real-time data visualization via Recharts.
- **`Backend/`**: Robust Web API in **.NET 10**. Uses the official Azure SDK for native integration and exposes **Technical Documentation (Scalar)** for interactive endpoint testing.

<div align="center">
  <img src="assets/app.png" alt="RAGulator App" width="49%"/>
  <img src="assets/app2.png" alt="RAGulator App 2" width="49%"/>
</div>

---

## <img src="assets/Icono_62_x_64.png" width="22" height="22" style="vertical-align:middle"/> 🚀 Deployment & Operations

The project uses **GitHub Actions** for a complete **CI/CD** pipeline:

1. **Build & Test**: Compilation of the API and Frontend.
2. **Deploy**: Automatic publishing to Azure App Service and Static Web Apps.
3. **Configuration**: Dynamic secret management via Application Settings and protected environment variables.

---

## <img src="assets/Icono_62_x_64.png" width="22" height="22" style="vertical-align:middle"/> 🏢 Administration Capabilities

- **Control Dashboard**: KPIs on latency, Groundedness Score, and processed documents.
- **Dynamic Ingestion**: Interface to upload PDFs that are automatically indexed in the vector engine.
- **Security Auditing**: Immutable logging in Cosmos DB of every interaction, including Content Safety alerts.
- **Quality Management**: Tracking of RAGAS metrics (Faithfulness, Relevance, Coherence, and Fluency).

<div align="center">
  <img src="assets/auditory.png" alt="RAGulator Auditing" width="49%"/>
  <img src="assets/config.png" alt="RAGulator Configuration" width="49%"/>
</div>

---

## <img src="assets/Icono_62_x_64.png" width="22" height="22" style="vertical-align:middle"/> 🎨 Design System

Interface designed for a high-impact user experience:
- **Deep Dark Theme**: Professional aesthetic inspired by modern control centers.
- **Micro-interactions**: Smooth transitions and animated loading states for a fluid feel (60 FPS).
- **Responsive**: Fully adaptable to mobile devices for on-the-go queries.

---

## <img src="assets/Icono_62_x_64.png" width="22" height="22" style="vertical-align:middle"/> 📝 Final Delivery Note

This system represents the state of the art in **Governed RAG Systems**, demonstrating how the deep integration of Azure's native services creates a resilient, scalable, and above all, reliable platform for critical decision-making in international trade.

<div align="center">
  <img src="assets/banner.png" alt="RAGulator Banner" width="100%"/>
</div>

---

## <img src="assets/Icono_62_x_64.png" width="22" height="22" style="vertical-align:middle"/> 🔗 Project Links

<div align="center">

[![View Production App](https://img.shields.io/badge/🌐_Production_App-Azure_Static_Web_Apps-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)](https://mango-pebble-0fd224f0f.6.azurestaticapps.net/admin/documents)
&nbsp;&nbsp;
[![Power BI Dashboard](https://img.shields.io/badge/📊_Dashboard-Power_BI-F2C811?style=for-the-badge&logo=powerbi&logoColor=black)](https://app.powerbi.com/groups/me/reports/fc1d522f-1332-4c6f-a677-058a95ed0e95/0abdc7e72ae926b4a0a6?experience=power-bi)

</div>

### 🎬 Video Demo

<div align="center">
  <a href="https://www.youtube.com/watch?v=0xex5qgugE4" target="_blank">
    <img src="https://img.youtube.com/vi/0xex5qgugE4/maxresdefault.jpg" alt="Watch RAGulator Demo on YouTube" width="70%"/>
  </a>
  <p><em>▶️ Click to watch the full demo on YouTube</em></p>
</div>

---

## <img src="assets/Icono_62_x_64.png" width="22" height="22" style="vertical-align:middle"/> 👥 Team

<div align="center">
  <img src="assets/team.png" alt="RAGulator Team" width="80%"/>
</div>

<div align="center">

| | Name | LinkedIn |
|:---:|:---|:---:|
| 👤 | **Jimena Fioni** | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/jimena-fioni/) |
| 👤 | **Juan Pablo Urra Jara** | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/juan-pablo-urra/) |
| 👤 | **Diego Alvarez** | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/diego-alvarez-615756104) |
| 👤 | **Fernando Pedernera** | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/fernando-pedernera) |

</div>
