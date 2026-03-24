import { useMsal } from '@azure/msal-react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ArrowLeft, Shield } from 'lucide-react'
import './UserSection.css'

export default function UserSection({ showChatLink = false, showAdminLink = false, showLogout = true }) {
  const { instance, accounts } = useMsal()
  const navigate = useNavigate()
  
  const account = accounts[0] || instance.getActiveAccount()
  const username = account?.name || 'Usuario'
  const roles = account?.idTokenClaims?.roles || []
  const isAdmin = roles.includes('Admin')

  const handleLogout = () => {
    localStorage.removeItem('rag_chat_config')
    instance.logoutRedirect().catch(e => console.error(e));
  }

  return (
    <div className="user-section">
      <div className="user-section__profile">
        <img 
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} 
          alt="avatar" 
          className="user-section__avatar" 
        />
        <div className="user-section__info">
          <div className="user-section__name">{username}</div>
          <div className="user-section__role">
            {isAdmin ? "Administrador" : "Usuario Estándar"}
          </div>
        </div>
      </div>
      
      <div className="user-section__actions">
        {showAdminLink && isAdmin && (
          <button className="user-section__btn user-section__btn--admin" onClick={() => navigate('/admin')}>
            <Shield size={14} />
            <span>Panel de Administrador</span>
          </button>
        )}
        {showChatLink && (
          <button className="user-section__btn user-section__btn--alt" onClick={() => navigate('/')}>
            <ArrowLeft size={14} />
            <span>Volver al Chat</span>
          </button>
        )}
        {showLogout && (
          <button className="user-section__btn user-section__btn--logout" onClick={handleLogout}>
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        )}
      </div>
    </div>
  )
}
