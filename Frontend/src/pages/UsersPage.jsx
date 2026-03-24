import { useState, useEffect, useMemo } from 'react'
import {
  Users, Zap, Search, Shield, UserCheck, Eye,
  ShieldCheck, X, Plus, Trash2, CheckCircle2, AlertCircle
} from 'lucide-react'
import { useMsal } from '@azure/msal-react'
import { authFetch, getApiUrl } from '../authFetch'
import DashboardLoader from './DashboardLoader'
import './UsersPage.css'

const roleBadgeClass = (roleName) => {
  const lower = (roleName || '').toLowerCase()
  if (lower === 'admin') return 'role-badge role-badge--admin'
  if (lower === 'user') return 'role-badge role-badge--user'
  if (lower === 'auditor') return 'role-badge role-badge--auditor'
  return 'role-badge role-badge--default'
}

export default function UsersPage() {
  const { instance } = useMsal()
  const [users, setUsers] = useState([])
  const [availableRoles, setAvailableRoles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [modalUser, setModalUser] = useState(null)
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [toast, setToast] = useState(null)

  const fetchUsers = () => {
    authFetch(instance, getApiUrl('/api/users'))
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(json => {
        setUsers(json.users || [])
        setAvailableRoles(json.availableRoles || [])
      })
      .catch(err => console.error('Error fetching users:', err))
      .finally(() => setIsLoading(false))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUsers() }, [])

  const showToast = (message, isError = false) => {
    setToast({ message, isError })
    setTimeout(() => setToast(null), 3000)
  }

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const q = searchQuery.toLowerCase()
    return users.filter(u =>
      (u.displayName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    )
  }, [users, searchQuery])

  const totalUsers = users.length
  const adminCount = users.filter(u => u.roles?.some(r => (r.roleName || '').toLowerCase() === 'admin')).length
  const assignedCount = users.filter(u => u.roles?.length > 0).length

  const handleAssignRole = async () => {
    if (!selectedRoleId || !modalUser) return
    setAssigning(true)
    try {
      const res = await authFetch(instance, getApiUrl(`/api/users/${modalUser.id}/roles`), {
        method: 'POST',
        body: JSON.stringify({ roleId: selectedRoleId })
      })
      const data = await res.json()
      if (data.success) {
        showToast('Rol asignado exitosamente')
        // Optimistic update for the modal
        const newRole = availableRoles.find(r => r.id === selectedRoleId)
        if (newRole && modalUser) {
          setModalUser(prev => ({
            ...prev,
            roles: [...(prev.roles || []), { 
              assignmentId: data.assignmentId || 'new', 
              roleId: selectedRoleId, 
              roleName: newRole.value, 
              roleDisplayName: newRole.displayName 
            }]
          }))
        }
        setSelectedRoleId('')
        fetchUsers()
      } else {
        showToast(data.error || 'Error al asignar rol', true)
      }
    } catch (err) {
      showToast('Error de conexión', true)
      console.error(err)
    } finally {
      setAssigning(false)
    }
  }

  const handleRemoveRole = async (userId, assignmentId, roleName) => {
    try {
      const res = await authFetch(instance, getApiUrl(`/api/users/${userId}/roles/${assignmentId}`), {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        showToast(`Rol "${roleName}" revocado`)
        fetchUsers()
        if (modalUser?.id === userId) {
          setModalUser(prev => ({
            ...prev,
            roles: prev.roles.filter(r => r.assignmentId !== assignmentId)
          }))
        }
      } else {
        showToast(data.error || 'Error al revocar rol', true)
      }
    } catch {
      showToast('Error de conexión', true)
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  // Filter available roles to exclude those already assigned to the modal user
  const assignableRoles = useMemo(() => {
    if (!modalUser) return availableRoles
    const assignedIds = new Set((modalUser.roles || []).map(r => r.roleId))
    return availableRoles.filter(r => !assignedIds.has(r.id))
  }, [modalUser, availableRoles])

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
          <span className="topbar-status">Microsoft Entra ID Conectado</span>
        </div>
      </div>

      <div className="admin-page__content">
        {isLoading ? (
          <DashboardLoader message="Cargando usuarios desde Microsoft Entra ID" />
        ) : (
        <div className="dashboard-content-loaded">

          {/* Header */}
          <div className="users-header">
            <h2 className="users-header__title">
              <Shield size={22} style={{display:'inline', marginRight:'8px', verticalAlign:'middle'}} />
              Gestión de Usuarios y Roles RBAC
            </h2>
            <p className="users-header__desc">
              Control de acceso basado en roles integrado con Microsoft Entra ID — los cambios se propagan inmediatamente al token JWT.
            </p>
          </div>

          {/* KPI Cards */}
          <div className="users-kpis stagger-children">
            <div className="users-kpi">
              <div className="users-kpi__icon users-kpi__icon--teal">
                <Users size={22} />
              </div>
              <div className="users-kpi__info">
                <div className="users-kpi__value">{totalUsers}</div>
                <div className="users-kpi__label">Usuarios en Tenant</div>
              </div>
            </div>

            <div className="users-kpi">
              <div className="users-kpi__icon users-kpi__icon--purple">
                <ShieldCheck size={22} />
              </div>
              <div className="users-kpi__info">
                <div className="users-kpi__value">{adminCount}</div>
                <div className="users-kpi__label">Administradores</div>
              </div>
            </div>

            <div className="users-kpi">
              <div className="users-kpi__icon users-kpi__icon--blue">
                <UserCheck size={22} />
              </div>
              <div className="users-kpi__info">
                <div className="users-kpi__value">{assignedCount}</div>
                <div className="users-kpi__label">Con Rol Asignado</div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="users-table-wrapper">
            <div className="users-table-header">
              <div className="users-table-header__title">
                <Users size={16} />
                Directorio de Usuarios (Entra ID)
              </div>
              <div className="users-search">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="users-table-body">
              {filteredUsers.length === 0 ? (
                <div className="users-empty">
                  <Users size={32} />
                  <p>No se encontraron usuarios</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Email</th>
                      <th>Estado</th>
                      <th>Roles</th>
                      <th>Registrado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, idx) => (
                      <tr key={user.id || `user-${idx}`}>
                        <td style={{fontWeight: 600, color: 'var(--text-primary)'}}>
                          {user.displayName}
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className="user-status">
                            <span className={`user-status__dot ${user.enabled ? 'user-status__dot--active' : 'user-status__dot--disabled'}`} />
                            {user.enabled ? 'Activo' : 'Deshabilitado'}
                          </span>
                        </td>
                        <td>
                          {(user.roles || []).length === 0 ? (
                            <span className="no-role-pill">Sin rol</span>
                          ) : (
                            user.roles.map(r => (
                              <span key={r.assignmentId} className={roleBadgeClass(r.roleName)}>
                                {r.roleDisplayName || r.roleName}
                              </span>
                            ))
                          )}
                        </td>
                        <td style={{fontSize: '0.8rem'}}>{user.createdAt}</td>
                        <td>
                          <button
                            className="users-action-btn"
                            onClick={() => { setModalUser(user); setSelectedRoleId(''); }}
                          >
                            <Eye size={13} />
                            Gestionar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Role Management Modal */}
      {modalUser && (
        <div className="modal-overlay" onClick={() => setModalUser(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card__header">
              <div className="modal-card__title">Gestionar Roles</div>
              <button className="modal-card__close" onClick={() => setModalUser(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-card__user-info">
              <div className="modal-card__avatar">
                {getInitials(modalUser.displayName)}
              </div>
              <div>
                <div className="modal-card__name">{modalUser.displayName}</div>
                <div className="modal-card__email">{modalUser.email}</div>
              </div>
            </div>

            {/* Current Roles */}
            <div className="modal-roles-section">
              <div className="modal-roles-section__label">Roles Asignados</div>
              {(modalUser.roles || []).length === 0 ? (
                <div style={{color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem 0'}}>
                  Este usuario no tiene roles asignados.
                </div>
              ) : (
                modalUser.roles.map(r => (
                  <div key={r.assignmentId} className="modal-role-item">
                    <span className={roleBadgeClass(r.roleName)}>
                      {r.roleDisplayName || r.roleName}
                    </span>
                    <button
                      className="modal-role-remove"
                      onClick={() => handleRemoveRole(modalUser.id, r.assignmentId, r.roleName)}
                    >
                      <Trash2 size={12} style={{marginRight:'3px', verticalAlign:'middle'}} />
                      Revocar
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Assign New Role */}
            {assignableRoles.length > 0 && (
              <div className="modal-roles-section">
                <div className="modal-roles-section__label">Asignar Nuevo Rol</div>
                <div className="modal-add-role">
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                  >
                    <option value="">Seleccionar rol...</option>
                    {assignableRoles.map(r => (
                      <option key={r.id} value={r.id}>{r.displayName}</option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleAssignRole}
                    disabled={!selectedRoleId || assigning}
                    style={{padding: '0.55rem 1rem'}}
                  >
                    <Plus size={14} />
                    {assigning ? 'Asignando...' : 'Asignar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <div className={`users-toast ${toast.isError ? 'users-toast--error' : ''}`}>
          {toast.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  )
}
