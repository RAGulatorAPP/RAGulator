import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageSquare, Send, Clock, ExternalLink, ThumbsUp, ThumbsDown,
  Shield, Sparkles, Search, Plus
} from 'lucide-react'
import './ChatPage.css'

export default function ChatPage() {
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState('')
  const [activeCitation, setActiveCitation] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  
  // LocalStorage Persisted Chat History
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('ragulator_chat_sessions');
    if (saved) {
       try {
         const parsed = JSON.parse(saved);
         if (parsed && parsed.length > 0) return parsed;
       } catch (error) {
         console.warn('Error parseando historial de RAGulator:', error);
       }
    }
    return [{
      id: Date.now(),
      title: 'Nueva Consulta',
      messages: [{ id: Date.now(), role: 'assistant', content: '¡Hola! Soy tu Asistente de Comercio Internacional Gobernado. ¿En qué puedo ayudarte hoy?' }]
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState(sessions[0].id);

  useEffect(() => {
    localStorage.setItem('ragulator_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Derive active session state
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession.messages || [];

  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');

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

    const userText = inputValue
    setInputValue('')
    
    const newUserMsg = { id: Date.now(), role: 'user', content: userText }
    const updatedMessages = [...messages, newUserMsg];
    
    let updatedTitle = activeSession.title;
    if (messages.length === 1 && activeSession.title === 'Nueva Consulta') {
      updatedTitle = userText.length > 25 ? userText.substring(0, 25) + '...' : userText;
    }

    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title: updatedTitle, messages: updatedMessages } : s));
    setIsTyping(true)

    try {
      const response = await fetch('http://localhost:5165/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      })
      
      if (!response.ok) throw new Error('API Error')
      
      const data = await response.json()
      const newBotMsg = data.botMessage || data.assistantMessage || data.responseMessage || {
         id: Date.now() + 1,
         role: 'assistant',
         content: "**Error**: Formato de respuesta no reconocido"
      };

      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, newBotMsg] } : s));
    } catch (err) {
      console.error("Chat API fetch error:", err)
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "⚠️ Hubo un error al comunicarse con el Backend. Verifica que el servidor C# esté ejecutándose."
      }]} : s));
    } finally {
      setIsTyping(false)
    }
  }

  const handleNewChat = () => {
    const newSession = {
      id: Date.now(),
      title: 'Nueva Consulta',
      messages: [{ id: Date.now(), role: 'assistant', content: '¡Hola! Soy tu Asistente de Comercio Internacional Gobernado. ¿En qué puedo ayudarte hoy?' }]
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setActiveCitation(null);
  };

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
          {sessions.map((item) => (
            <div 
              key={item.id} 
              className={`chat-sidebar__item ${item.id === activeSessionId ? 'chat-sidebar__item--active' : ''}`}
              onClick={() => { setActiveSessionId(item.id); setActiveCitation(null); }}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <MessageSquare size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
              <span className="chat-sidebar__item-text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginLeft: '10px' }}>{item.title}</span>
            </div>
          ))}
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
            <div className="chat-header__user">
              <div className="chat-header__user-info">
                <span className="chat-header__user-name">María González</span>
                <span className="chat-header__user-role">Entra ID Verificado</span>
              </div>
              <div className="chat-header__avatar">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maria" alt="avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="chat-messages">
          <div className="chat-messages__container">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`chat-message chat-message--${msg.role} animate-fade-in`}
              >
                <div className={`chat-message__bubble chat-message__bubble--${msg.role}`}>
                  {msg.role === 'assistant' ? renderMessageWithCitations(msg) : msg.content}
                </div>
              </div>
            ))}
            
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
            <button
              className="chat-admin-link"
              onClick={() => navigate('/admin')}
            >
              Panel de Administración
            </button>
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
