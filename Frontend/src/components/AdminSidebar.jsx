import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FileText, ShieldCheck, Activity, Users, Settings,
  Lock, Sparkles
} from 'lucide-react'
import UserSection from './UserSection'
import './AdminSidebar.css'

import { useMsal } from '@azure/msal-react'
import { authFetch, getApiUrl } from '../authFetch'

export default function AdminSidebar() {
  const { instance, accounts } = useMsal()
  
  const account = accounts[0] || instance.getActiveAccount()
  const roles = account?.idTokenClaims?.roles || []
  const isAdmin = roles.includes('Admin')

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


  const [systemInfo, setSystemInfo] = useState({
    projectName: 'Cargando...',
    region: '...',
    model: '...'
  })

  useEffect(() => {
    authFetch(instance, getApiUrl('/api/dashboard/system-info'))
      .then(res => res.json())
      .then(data => {
        setSystemInfo(data)
      })
      .catch(err => {
        console.error('Error fetching system info:', err)
        setSystemInfo({
          projectName: 'az-rag-governance',
          region: 'East US 2',
          model: 'GPT-4o'
        })
      })
  }, [instance])

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
          <span className="resource-tag__name">{systemInfo.projectName}</span>
          <span className="resource-tag__info">{systemInfo.region} · {systemInfo.model}</span>
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

      <UserSection showChatLink={true} showLogout={false} />
    </aside>
  )
}
