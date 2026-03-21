import { Settings, Zap } from 'lucide-react'
import './PlaceholderPage.css'

export default function ConfigPage() {
  return (
    <div className="admin-page">
      <div className="admin-page__topbar">
        <div className="admin-page__breadcrumb">
          <span className="admin-page__breadcrumb-parent">Admin</span>
          <span className="admin-page__breadcrumb-sep">›</span>
          <span className="admin-page__breadcrumb-current">Configuración</span>
        </div>
        <div className="admin-page__topbar-right">
          <Zap size={14} className="topbar-icon--connected" />
          <span className="topbar-status">Azure AI Search Conectado</span>
        </div>
      </div>
      <div className="admin-page__content">
        <div className="placeholder-page">
          <div className="placeholder-page__icon">
            <Settings size={48} />
          </div>
          <h2>Configuración del Sistema</h2>
          <p>Parámetros del pipeline RAG, configuración de Azure OpenAI, umbrales de calidad y ajustes del sistema.</p>
        </div>
      </div>
    </div>
  )
}
