import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageSquare, Send, Clock, ExternalLink, ThumbsUp, ThumbsDown,
  Shield, Sparkles, ChevronRight, Search
} from 'lucide-react'
import { chatHistory, chatMessages } from '../data/mockData'
import './ChatPage.css'

export default function ChatPage() {
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState('')
  const [activeCitation, setActiveCitation] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  
  // Estado local para los mensajes dinámicos
  // Empezamos con el mensaje de bienvenida simulado (Mock Data ID=1)
  const [messages, setMessages] = useState([
    chatMessages[0] 
  ])

  // Obtener el último mensaje del asistente para mostrar sus citaciones si las tiene
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')
  const currentMessage = lastAssistantMessage || chatMessages[1]

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
    
    // Add user message to UI immediately
    const newUserMsg = { id: Date.now(), role: 'user', content: userText }
    setMessages(prev => [...prev, newUserMsg])
    setIsTyping(true)

    try {
      const response = await fetch('http://localhost:5165/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      })
      
      if (!response.ok) throw new Error('API Error')
      
      const data = await response.json()
      // data returns SendMessageResponse which has:
      // data.userMessage and data.botMessage (or similar based on your DTO)
      // En FoundryChatService devolvimos UserMessage y BotMessage
      setMessages(prev => [...prev, data.botMessage || data.assistantMessage || data.responseMessage || {
         id: Date.now() + 1,
         role: 'assistant',
         content: data.botMessage?.content || data.assistantMessage?.content || "**Error**: Formato de respuesta no reconocido"
      }])
    } catch (err) {
      console.error("Chat API fetch error:", err)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "⚠️ Hubo un error al comunicarse con Azure AI Foundry. Verifica que el backend esté ejecutándose."
      }])
    } finally {
      setIsTyping(false)
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
        <div className="chat-sidebar__header">
          <Clock size={16} />
          <span>Historial de Consultas Recientes</span>
        </div>
        <div className="chat-sidebar__list">
          {chatHistory.map((item) => (
            <button key={item.id} className={`chat-sidebar__item ${item.id === 1 ? 'chat-sidebar__item--active' : ''}`}>
              <MessageSquare size={14} />
              <span className="chat-sidebar__item-text">{item.title}</span>
            </button>
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
            <span className="chat-sources__groundedness-value">{currentMessage.groundedness}</span>
          </div>
          <div className="chat-sources__groundedness-bar">
            <div
              className="chat-sources__groundedness-fill"
              style={{ width: `${currentMessage.groundedness * 100}%` }}
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
