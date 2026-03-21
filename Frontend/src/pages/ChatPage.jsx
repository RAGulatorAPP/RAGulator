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
  const [activeCitation, setActiveCitation] = useState(chatMessages[1]?.citations?.[0] || null)

  const currentMessage = chatMessages[1]

  const renderMessageWithCitations = (text) => {
    return text.split(/(\[\d+\])/).map((part, i) => {
      const match = part.match(/\[(\d+)\]/)
      if (match) {
        const citNum = parseInt(match[1])
        const citation = currentMessage.citations.find(c => c.id === citNum)
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
            {/* User Message */}
            <div className="chat-message chat-message--user animate-fade-in">
              <div className="chat-message__bubble chat-message__bubble--user">
                {chatMessages[0].content}
              </div>
            </div>

            {/* Assistant Message */}
            <div className="chat-message chat-message--assistant animate-fade-in">
              <div className="chat-message__bubble chat-message__bubble--assistant">
                {renderMessageWithCitations(currentMessage.content)}
              </div>
            </div>
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
            />
            <button className="chat-send-btn">
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
            <a href={activeCitation.link} className="chat-sources__link">
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
