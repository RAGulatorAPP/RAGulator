import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageSquare, Send, Clock, ExternalLink, ThumbsUp, ThumbsDown,
  Shield, Sparkles, Search, Plus, LogOut, Trash2
} from 'lucide-react'
import { useMsal } from '@azure/msal-react'
import { loginRequest } from '../authConfig'
import { authFetch } from '../authFetch'
import DashboardLoader from './DashboardLoader'
import './ChatPage.css'

export default function ChatPage() {
  const navigate = useNavigate()
  const { instance, accounts } = useMsal()
  
  const account = accounts[0] || instance.getActiveAccount()
  const roles = account?.idTokenClaims?.roles || []
  const isAdmin = roles.includes('Admin')
  const username = account?.name || 'Usuario'

  const [inputValue, setInputValue] = useState('')
  const [activeCitation, setActiveCitation] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  
  // Cloud-persisted chat sessions
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  // Load sessions from Cosmos DB on mount
  useEffect(() => {
    authFetch(instance, 'http://localhost:5165/api/chat/sessions')
      .then(res => res.json())
      .then(async (data) => {
        if (data && data.length > 0) {
          setSessions(data)
          setActiveSessionId(data[0].id)
        } else {
          // Auto-crear primera sesión si no existe ninguna
          const res = await authFetch(instance, 'http://localhost:5165/api/chat/sessions', { method: 'POST' })
          const newSession = await res.json()
          setSessions([{ id: newSession.id, title: newSession.title, updatedAt: newSession.updatedAt }])
          setActiveSessionId(newSession.id)
          setMessages(newSession.messages || [])
        }
      })
      .catch(err => console.error("Error loading sessions:", err))
      .finally(() => setIsLoadingSessions(false))
  }, [])

  // Load messages when active session changes
  useEffect(() => {
    if (!activeSessionId) return
    setIsLoadingMessages(true)
    authFetch(instance, `http://localhost:5165/api/chat/sessions/${activeSessionId}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data.messages || [])
      })
      .catch(err => console.error("Error loading messages:", err))
      .finally(() => setIsLoadingMessages(false))
  }, [activeSessionId])

  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')

  const renderMessageWithCitations = (messageObj) => {
    if (!messageObj.content) return null
    if (!messageObj.citations || messageObj.citations.length === 0) return <span>{messageObj.content}</span>

    return messageObj.content.split(/(\[\d+\])/).map((part, i) => {
      const match = part.match(/\[(\d+)\]/)
      if (match) {
        const citNum = parseInt(match[1])
        const citation = messageObj.citations.find(c => c.id === citNum)
        return (
          <sup
            key={i}
            className="chat-citation-ref"
            onClick={() => citation && setActiveCitation(citation)}
          >
            [{citNum}]
          </sup>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Si no hay sesión activa, crear una antes de enviar
    let currentSessionId = activeSessionId
    if (!currentSessionId) {
      try {
        const res = await authFetch(instance, 'http://localhost:5165/api/chat/sessions', { method: 'POST' })
        const newSession = await res.json()
        setSessions(prev => [{ id: newSession.id, title: newSession.title, updatedAt: newSession.updatedAt }, ...prev])
        setActiveSessionId(newSession.id)
        setMessages(newSession.messages || [])
        currentSessionId = newSession.id
      } catch (err) {
        console.error("Error creating session:", err)
        return
      }
    }

    const userText = inputValue
    setInputValue('')
    
    // Optimistic UI: show user message immediately
    const tempUserMsg = { id: Date.now(), role: 'user', content: userText }
    setMessages(prev => [...prev, tempUserMsg])
    
    // Auto-title: update sidebar title optimistically
    if (messages.length <= 1) {
      const newTitle = userText.length > 25 ? userText.substring(0, 25) + '...' : userText
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, title: newTitle } : s))
    }

    setIsTyping(true)

    try {
      let tokenResponse
      try {
        tokenResponse = await instance.acquireTokenSilent({
            ...loginRequest,
            account: account
        })
      } catch (err) {
        console.warn("Silent token failed, acquiring popup", err)
        tokenResponse = await instance.acquireTokenPopup(loginRequest)
      }

      const response = await fetch('http://localhost:5165/api/chat/message', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenResponse.accessToken}`
        },
        body: JSON.stringify({ message: userText, sessionId: currentSessionId })
      })
      
      if (!response.ok) throw new Error('API Error')
      
      const data = await response.json()
      const newBotMsg = data.botMessage || data.assistantMessage || data.responseMessage || {
         id: Date.now() + 1,
         role: 'assistant',
         content: "**Error**: Formato de respuesta no reconocido"
      }

      setMessages(prev => [...prev, newBotMsg])
    } catch (err) {
      console.error("Chat API fetch error:", err)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "⚠️ Hubo un error al comunicarse con el Backend. Verifica que el servidor C# esté ejecutándose."
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleNewChat = async () => {
    try {
      const res = await authFetch(instance, 'http://localhost:5165/api/chat/sessions', { method: 'POST' })
      const newSession = await res.json()
      setSessions(prev => [{ id: newSession.id, title: newSession.title, updatedAt: newSession.updatedAt }, ...prev])
      setActiveSessionId(newSession.id)
      setMessages(newSession.messages || [])
      setActiveCitation(null)
    } catch (err) {
      console.error("Error creating session:", err)
    }
  }

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation()
    try {
      await authFetch(instance, `http://localhost:5165/api/chat/sessions/${sessionId}`, { method: 'DELETE' })
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      if (activeSessionId === sessionId) {
        const remaining = sessions.filter(s => s.id !== sessionId)
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id)
        } else {
          handleNewChat()
        }
      }
    } catch (err) {
      console.error("Error deleting session:", err)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="chat-layout">
      {/* Left Sidebar — Chat History */}
      <aside className="chat-sidebar">
        <div className="chat-sidebar__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} />
            <span style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sesiones</span>
          </div>
          <button 
            onClick={handleNewChat}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}
          >
            <Plus size={14} />
            Nuevo Chat
          </button>
        </div>
        <div className="chat-sidebar__list" style={{ overflowY: 'auto', flex: 1 }}>
          {isLoadingSessions ? (
            <div style={{padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px'}}>
              Cargando sesiones...
            </div>
          ) : sessions.length === 0 ? (
            <div style={{padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px'}}>
              No hay sesiones. Crea un nuevo chat.
            </div>
          ) : (
            sessions.map((item) => (
              <div 
                key={item.id} 
                className={`chat-sidebar__item ${item.id === activeSessionId ? 'chat-sidebar__item--active' : ''}`}
                onClick={() => { setActiveSessionId(item.id); setActiveCitation(null); }}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flex: 1 }}>
                  <MessageSquare size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
                  <span className="chat-sidebar__item-text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginLeft: '10px' }}>{item.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(e, item.id)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', borderRadius: '4px', opacity: 0, transition: 'opacity 0.15s' }}
                  className="session-delete-btn"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* User Identity Footer */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(0, 0, 0, 0.12)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} alt="avatar" style={{width: '42px', height: '42px', borderRadius: '50%', background: 'var(--surface)', border: '2px solid rgba(255, 255, 255, 0.1)'}} />
            <div style={{overflow: 'hidden'}}>
              <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', lineHeight: '1.2'}}>{username}</div>
              <div style={{fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px'}}>{isAdmin ? "Administrador" : "Usuario"}</div>
            </div>
          </div>
          
          <button 
            onClick={() => { instance.logoutRedirect().catch(e => console.error(e)); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '10px', background: 'rgba(239, 68, 68, 0.05)', color: 'rgba(239, 68, 68, 0.8)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.15s ease-out' }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; e.currentTarget.style.color = 'rgba(239, 68, 68, 0.8)'; e.currentTarget.style.transform = 'none'; }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Header */}
        <header className="chat-header">
          <div className="chat-header__left">
            <h1 className="chat-header__title">Asistente Inteligente de Comercio Internacional</h1>
            <span className="badge badge-success">
              <Shield size={12} />
              Gobernado y Trazable
            </span>
          </div>
          <div className="chat-header__right">
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)', transition: 'transform 0.1s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Shield size={16} />
                Panel de Administración
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="chat-messages">
          <div className="chat-messages__container">
            {isLoadingMessages ? (
              <div style={{display: 'flex', justifyContent: 'center', padding: '48px 0', color: '#64748b'}}>
                <div className="dashboard-loader__spinner" style={{width: 32, height: 32}} />
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`chat-message chat-message--${msg.role} animate-fade-in`}
                >
                  <div className={`chat-message__bubble chat-message__bubble--${msg.role}`}>
                    {msg.role === 'assistant' ? renderMessageWithCitations(msg) : msg.content}
                  </div>
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="chat-message chat-message--assistant animate-fade-in">
                <div className="chat-message__bubble chat-message__bubble--assistant chat-message__bubble--typing">
                  Escribiendo<span className="typing-dots">...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <input
              type="text"
              className="chat-input"
              placeholder="Escribe tu consulta sobre comercio internacional..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="chat-send-btn" onClick={handleSendMessage} disabled={isTyping || !inputValue.trim()}>
              <Send size={18} />
            </button>
          </div>
          <div className="chat-status-bar">
            <div />
            <div className="chat-status-bar__right">
              <span className="chat-status-dot" />
              <span>Conectado a Azure OpenAI · RAG Pipeline Activo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Source Fragments */}
      <aside className="chat-sources">
        <div className="chat-sources__header">
          <Search size={15} />
          <span>Fragmentos de Fuente Relacionados</span>
        </div>

        {activeCitation && (
          <div className="chat-sources__card animate-fade-in">
            <div className="chat-sources__citation-badge">
              {activeCitation.title}
            </div>
            <div className="chat-sources__source-name">{activeCitation.source}</div>
            <div className="chat-sources__text">{activeCitation.text}</div>
            <a 
              href={`http://localhost:5165/api/documents/${activeCitation.source}/download`} 
              target="_blank" 
              rel="noreferrer" 
              className="chat-sources__link"
            >
              <ExternalLink size={13} />
              Ver documento original (PDF)
            </a>
          </div>
        )}

        <div className="chat-sources__feedback">
          <span className="chat-sources__feedback-label">¿Esta información fue útil?</span>
          <div className="chat-sources__feedback-btns">
            <button className="btn btn-outline">
              <ThumbsUp size={14} />
              Útil
            </button>
            <button className="btn btn-outline">
              <ThumbsDown size={14} />
              No útil
            </button>
          </div>
        </div>

        <div className="chat-sources__groundedness">
          <div className="chat-sources__groundedness-header">
            <span>Groundedness Score:</span>
            <span className="chat-sources__groundedness-value">{lastAssistantMessage?.groundedness || 0}</span>
          </div>
          <div className="chat-sources__groundedness-bar">
            <div
              className="chat-sources__groundedness-fill"
              style={{ width: `${(lastAssistantMessage?.groundedness || 0) * 100}%` }}
            />
          </div>
          <span className="chat-sources__groundedness-desc">
            Alta confiabilidad — Respuesta bien fundamentada en fuentes verificadas
          </span>
        </div>
      </aside>
    </div>
  )
}
