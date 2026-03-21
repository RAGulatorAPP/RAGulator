import { ClipboardList, Zap } from 'lucide-react'
import './PlaceholderPage.css'

export default function AuditPage() {
  return (
    <div className="admin-page">
      <div className="admin-page__topbar">
        <div className="admin-page__breadcrumb">
          <span className="admin-page__breadcrumb-parent">Admin</span>
          <span className="admin-page__breadcrumb-sep">›</span>
          <span className="admin-page__breadcrumb-current">Auditoría</span>
        </div>
        <div className="admin-page__topbar-right">
          <Zap size={14} className="topbar-icon--connected" />
          <span className="topbar-status">Azure AI Search Conectado</span>
        </div>
      </div>
      <div className="admin-page__content">
        <div className="placeholder-page">
          <div className="placeholder-page__icon">
            <ClipboardList size={48} />
          </div>
          <h2>Auditoría y Trazabilidad</h2>
          <p>Registro completo de consultas, respuestas, citas y evaluaciones con trazabilidad end-to-end.</p>
        </div>
      </div>
    </div>
  )
}
