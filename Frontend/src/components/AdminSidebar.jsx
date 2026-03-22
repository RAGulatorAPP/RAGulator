import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, ShieldCheck, Activity, Users, Settings,
  Lock, ArrowLeft, Sparkles
} from 'lucide-react'
import './AdminSidebar.css'

import { useMsal } from '@azure/msal-react'

export default function AdminSidebar() {
  const navigate = useNavigate()
  const { instance, accounts } = useMsal()
  
  const account = accounts[0] || instance.getActiveAccount()
  const roles = account?.idTokenClaims?.roles || []
  const isAdmin = roles.includes('Admin')
  
  const username = account?.name || 'Usuario Padrón'
  const useremail = account?.username || 'usuario@empresa.com'

  const adminNav = [
    { label: 'ADMINISTRACIÓN', type: 'section', adminOnly: false },
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true, adminOnly: false },
    { to: '/admin/documents', icon: FileText, label: 'Documentos', adminOnly: false },
    { to: '/admin/quality', icon: Activity, label: 'Calidad RAG', adminOnly: true },
    { to: '/admin/security', icon: Lock, label: 'Seguridad', dot: 'warning', adminOnly: true },
    { to: '/admin/audit', icon: ShieldCheck, label: 'Auditoría', adminOnly: true },
    { label: 'SISTEMA', type: 'section', adminOnly: true },
    { to: '/admin/users', icon: Users, label: 'Usuarios & Roles', adminOnly: true },
    { to: '/admin/settings', icon: Settings, label: 'Configuración', adminOnly: true },
  ]

  const handleLogout = () => {
    instance.logoutRedirect().catch(e => console.error(e));
  }

  return (
    <aside className="admin-sidebar">
      {/* Header */}
      <div className="admin-sidebar__header">
        <div className="admin-sidebar__logo">
          <div className="admin-sidebar__logo-icon">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="admin-sidebar__title">Panel de Admin</div>
            <div className="admin-sidebar__subtitle">Gobernanza RAG</div>
          </div>
        </div>
        <div className="admin-sidebar__resource-tag">
          <span className="resource-tag__name">az-rag-governance</span>
          <span className="resource-tag__info">East US 2 · GPT-4o</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="admin-sidebar__nav">
        {adminNav.filter(item => !item.adminOnly || isAdmin).map((item, i) => {
          if (item.type === 'section') {
            return (
              <div key={i} className="admin-sidebar__section-title">
                {item.label}
              </div>
            )
          }
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
              }
            >
              <Icon size={17} />
              <span>{item.label}</span>
              {item.dot && <span className={`admin-sidebar__dot admin-sidebar__dot--${item.dot}`} />}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="admin-sidebar__footer">
        <div className="admin-sidebar__user">
          <div className="admin-sidebar__avatar">{username.charAt(0)}</div>
          <div style={{overflow: 'hidden'}}>
            <div className="admin-sidebar__user-email" style={{textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{useremail}</div>
            <div className="admin-sidebar__user-role">{isAdmin ? 'Administrador Superior' : 'Asesor Aduanero (Base)'}</div>
          </div>
        </div>
        
        <div style={{display: 'flex', gap: '8px', marginTop: '16px'}}>
            <button className="admin-sidebar__back-btn" style={{flex: 1}} onClick={() => navigate('/')}>
              <ArrowLeft size={16} />
              <span>Chat</span>
            </button>
            <button className="admin-sidebar__back-btn" style={{flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)'}} onClick={handleLogout}>
              <Lock size={16} />
              <span>Cerrar Sesión</span>
            </button>
        </div>
      </div>
    </aside>
  )
}
