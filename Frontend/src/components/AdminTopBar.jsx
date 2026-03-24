import { useMsal } from '@azure/msal-react'
import { LogOut, Zap } from 'lucide-react'
import './AdminTopBar.css'

export default function AdminTopBar({ pageTitle, statusText = "Azure Online", statusIcon: StatusIcon = Zap }) {
  const { instance } = useMsal()

  const handleLogout = () => {
    instance.logoutRedirect().catch(e => console.error(e));
  }

  return (
    <div className="admin-page__topbar">
      <div className="admin-page__breadcrumb">
        <span className="admin-page__breadcrumb-parent">Admin</span>
        <span className="admin-page__breadcrumb-sep">›</span>
        <span className="admin-page__breadcrumb-current">{pageTitle}</span>
      </div>
      <div className="admin-page__topbar-right">
        <div className="admin-page__status">
          <StatusIcon size={14} className="topbar-icon--connected" />
          <span className="topbar-status">{statusText}</span>
        </div>
        
        <button
          onClick={handleLogout}
          className="admin-topbar__logout-btn"
        >
          <LogOut size={14} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}
