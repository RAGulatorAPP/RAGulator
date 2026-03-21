import { useState } from 'react'
import {
  FileText, Upload, Search, Download, Eye, RefreshCw, Trash2, Zap, Filter
} from 'lucide-react'
import { documentsStats, documents } from '../data/mockData'
import './DocumentsPage.css'

const statusColors = {
  'Procesado': { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981' },
  'Indexando': { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' },
  'Error': { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' },
}

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDocs = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="admin-page">
      <div className="admin-page__topbar">
        <div className="admin-page__breadcrumb">
          <span className="admin-page__breadcrumb-parent">Admin</span>
          <span className="admin-page__breadcrumb-sep">›</span>
          <span className="admin-page__breadcrumb-current">Gestión de Documentos</span>
        </div>
        <div className="admin-page__topbar-right">
          <Zap size={14} className="topbar-icon--connected" />
          <span className="topbar-status">Azure AI Search Conectado</span>
        </div>
      </div>

      <div className="admin-page__content">
        {/* Page Header */}
        <div className="docs-header">
          <div>
            <h2 className="docs-header__title">Gestión de Documentos</h2>
            <p className="docs-header__desc">
              Ingesta, indexación y control de fuentes de conocimiento en Azure Blob Storage
            </p>
          </div>
          <button className="btn btn-primary">
            <Upload size={16} />
            Subir Documento
          </button>
        </div>

        {/* Stats Cards */}
        <div className="docs-stats stagger-children">
          <div className="docs-stat-card">
            <div className="docs-stat-card__value">{documentsStats.totalDocs}</div>
            <div className="docs-stat-card__label">Total Docs</div>
          </div>
          <div className="docs-stat-card docs-stat-card--success">
            <div className="docs-stat-card__value">{documentsStats.processed}</div>
            <div className="docs-stat-card__label">Procesados</div>
          </div>
          <div className="docs-stat-card docs-stat-card--info">
            <div className="docs-stat-card__value">{documentsStats.indexing}</div>
            <div className="docs-stat-card__label">Indexando</div>
          </div>
          <div className="docs-stat-card docs-stat-card--danger">
            <div className="docs-stat-card__value">{documentsStats.error}</div>
            <div className="docs-stat-card__label">Con Error</div>
          </div>
          <div className="docs-stat-card docs-stat-card--purple">
            <div className="docs-stat-card__value">{documentsStats.totalFragments}</div>
            <div className="docs-stat-card__label">Fragmentos Totales</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="docs-toolbar">
          <div className="docs-search">
            <Search size={16} className="docs-search__icon" />
            <input
              type="text"
              className="input"
              placeholder="Buscar por nombre o contenido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>
          <div className="docs-toolbar__right">
            <button className="btn btn-outline">
              <Filter size={14} />
              Todos los estados
            </button>
            <button className="btn btn-outline">
              <Filter size={14} />
              Todos los contenedores
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="docs-table-wrapper card">
          <div className="docs-table-header">
            <div className="docs-table-header__left">
              <FileText size={16} />
              <span className="docs-table-header__title">Índice de Documentos</span>
              <span className="badge badge-accent">{filteredDocs.length} documentos</span>
            </div>
            <button className="btn btn-outline btn-sm">
              <Download size={14} />
              Exportar CSV
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Contenedor Blob</th>
                <th>Estado</th>
                <th>Fragmentos</th>
                <th>Tamaño</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div className="docs-cell-doc">
                      <FileText size={15} className="docs-cell-doc__icon" />
                      <div>
                        <div className="docs-cell-doc__name">{doc.name}</div>
                        <div className="docs-cell-doc__user">{doc.user}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code className="docs-cell-container">{doc.container}</code>
                  </td>
                  <td>
                    <span
                      className="docs-status-badge"
                      style={{
                        background: statusColors[doc.status]?.bg,
                        color: statusColors[doc.status]?.color,
                      }}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="docs-cell-fragments">
                    {doc.fragments != null ? doc.fragments : '—'}
                  </td>
                  <td>{doc.size}</td>
                  <td>{doc.date}</td>
                  <td>
                    <div className="docs-cell-actions">
                      <button className="docs-action-btn" title="Ver"><Eye size={14} /></button>
                      <button className="docs-action-btn" title="Re-indexar"><RefreshCw size={14} /></button>
                      <button className="docs-action-btn docs-action-btn--danger" title="Eliminar"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
