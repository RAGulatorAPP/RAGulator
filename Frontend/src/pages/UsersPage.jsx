import { Users, Zap } from 'lucide-react'
import './PlaceholderPage.css'

export default function UsersPage() {
  return (
    <div className="admin-page">
      <div className="admin-page__topbar">
        <div className="admin-page__breadcrumb">
          <span className="admin-page__breadcrumb-parent">Admin</span>
          <span className="admin-page__breadcrumb-sep">›</span>
          <span className="admin-page__breadcrumb-current">Usuarios & Roles</span>
        </div>
        <div className="admin-page__topbar-right">
          <Zap size={14} className="topbar-icon--connected" />
          <span className="topbar-status">Azure AI Search Conectado</span>
        </div>
      </div>
      <div className="admin-page__content">
        <div className="placeholder-page">
          <div className="placeholder-page__icon">
            <Users size={48} />
          </div>
          <h2>Usuarios y Roles</h2>
          <p>Gestión de usuarios con Microsoft Entra ID, asignación de roles RBAC y control de acceso.</p>
        </div>
      </div>
    </div>
  )
}
