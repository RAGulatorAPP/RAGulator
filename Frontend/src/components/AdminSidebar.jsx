import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, ShieldCheck, Activity, Users, Settings,
  Lock, ArrowLeft, Sparkles
} from 'lucide-react'
import './AdminSidebar.css'

const adminNav = [
  { label: 'ADMINISTRACIÓN', type: 'section' },
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/documents', icon: FileText, label: 'Documentos' },
  { to: '/admin/quality', icon: Activity, label: 'Calidad RAG' },
  { to: '/admin/security', icon: Lock, label: 'Seguridad', dot: 'warning' },
  { to: '/admin/audit', icon: ShieldCheck, label: 'Auditoría' },
  { label: 'SISTEMA', type: 'section' },
  { to: '/admin/users', icon: Users, label: 'Usuarios & Roles' },
  { to: '/admin/settings', icon: Settings, label: 'Configuración' },
]

export default function AdminSidebar() {
  const navigate = useNavigate()

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
        {adminNav.map((item, i) => {
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
          <div className="admin-sidebar__avatar">AD</div>
          <div>
            <div className="admin-sidebar__user-email">admin@empresa.com</div>
            <div className="admin-sidebar__user-role">Administrador</div>
          </div>
        </div>
        <button className="admin-sidebar__back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          <span>Interfaz de Usuario</span>
        </button>
      </div>
    </aside>
  )
}
