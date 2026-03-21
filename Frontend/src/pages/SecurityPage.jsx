import { Shield, AlertTriangle, Zap } from 'lucide-react'
import './PlaceholderPage.css'

export default function SecurityPage() {
  return (
    <div className="admin-page">
      <div className="admin-page__topbar">
        <div className="admin-page__breadcrumb">
          <span className="admin-page__breadcrumb-parent">Admin</span>
          <span className="admin-page__breadcrumb-sep">›</span>
          <span className="admin-page__breadcrumb-current">Seguridad</span>
        </div>
        <div className="admin-page__topbar-right">
          <Zap size={14} className="topbar-icon--connected" />
          <span className="topbar-status">Azure AI Search Conectado</span>
        </div>
      </div>
      <div className="admin-page__content">
        <div className="placeholder-page">
          <div className="placeholder-page__icon">
            <Shield size={48} />
          </div>
          <h2>Seguridad & Content Safety</h2>
          <p>Configuración de Azure AI Content Safety, filtros de entrada/salida y políticas de seguridad.</p>
          <div className="placeholder-page__features">
            <div className="placeholder-feature card">
              <AlertTriangle size={20} />
              <span>Filtros de Content Safety</span>
            </div>
            <div className="placeholder-feature card">
              <Shield size={20} />
              <span>Políticas de Inyección</span>
            </div>
            <div className="placeholder-feature card">
              <Zap size={20} />
              <span>Reglas RBAC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
