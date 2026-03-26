import { useState, useRef, useEffect, useCallback } from 'react'
import AdminTopBar from '../components/AdminTopBar'
import {
  FileText, Upload, Search, Download, Eye, RefreshCw, Trash2, Zap, Filter, Loader2, CheckCircle2, AlertCircle, Cloud
} from 'lucide-react'
import { useMsal } from '@azure/msal-react'
import { authFetch, downloadAuthenticatedFile, getApiUrl } from '../authFetch'
import OneDriveModal from '../components/OneDriveModal'
import './DocumentsPage.css'

const statusColors = {
  'Procesado': { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981' },
  'Indexando': { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' },
  'Error': { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' },
}

export default function DocumentsPage() {
  const { instance } = useMsal()
  const [searchTerm, setSearchTerm] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [uploadMessage, setUploadMessage] = useState('')
  
  const [docsList, setDocsList] = useState([])
  const [stats, setStats] = useState({ totalDocs: 0, processed: 0, indexing: 0, error: 0, totalFragments: 0 })
  const [isLoadingDocs, setIsLoadingDocs] = useState(true)

  const [isOneDriveModalOpen, setIsOneDriveModalOpen] = useState(false)
  const fileInputRef = useRef(null)

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoadingDocs(true)
      const res = await authFetch(instance, getApiUrl('/api/documents'))
      const data = await res.json()
      setDocsList(data.documents || [])
      if (data.stats) setStats(data.stats)
    } catch (err) {
      console.error('Error fetching docs', err)
    } finally {
      setIsLoadingDocs(false)
    }
  }, [instance])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadStatus(null)
    setUploadMessage('Extrayendo e indexando PDF en Azure...')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await authFetch(instance, getApiUrl('/api/documents/upload'), {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al subir el documento')
      }

      setUploadStatus('success')
      setUploadMessage(data.message)
      fetchDocuments() // Refrescar la tabla con el nuevo documento
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error')
      setUploadMessage('Error conectando a Azure. ' + error.message)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (fileName) => {
    if (!window.confirm(`¿Estás seguro que deseas eliminar "${fileName}" de la Base Vectorial?\n\nLa IA dejará de tener contexto sobre este documento inmediatamente.`)) {
      return;
    }
    
    try {
      setIsLoadingDocs(true);
      const res = await authFetch(instance, getApiUrl(`/api/documents/${encodeURIComponent(fileName)}`), {
        method: 'DELETE'
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Error al eliminar");
      alert(data.message || "Documento eliminado correctamente.");
      
      fetchDocuments(); // Refresh table
    } catch (err) {
      console.error(err);
      alert("Hubo un error al intentar eliminar el documento.");
      setIsLoadingDocs(false);
    }
  }

  const filteredDocs = docsList.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="admin-page">
      <AdminTopBar pageTitle="Gestión de Documentos" statusText="Azure AI Search Conectado" />

      <div className="admin-page__content">
        {/* Page Header */}
        <div className="docs-header">
          <div>
            <h2 className="docs-header__title">Gestión de Documentos</h2>
            <p className="docs-header__desc">
              Ingesta, indexación y control de fuentes de conocimiento en Azure AI Search
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <input 
              type="file" 
              accept=".pdf" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />
            <button 
              className="btn btn-secondary" 
              onClick={() => setIsOneDriveModalOpen(true)}
              style={{ minWidth: '220px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Cloud size={16} />
              Vincular OneDrive
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleUploadClick}
              disabled={isUploading}
              style={{ minWidth: '220px', justifyContent: 'center' }}
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 2s linear infinite' }} />
                  Procesando RAG...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Subir Base Conceptual
                </>
              )}
            </button>
            
            {uploadStatus && (
              <div 
                className="upload-feedback" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  fontSize: '0.85rem',
                  color: uploadStatus === 'success' ? '#10b981' : '#ef4444',
                  maxWidth: '350px',
                  textAlign: 'right'
                }}
              >
                {uploadStatus === 'success' ? <CheckCircle2 size={16} style={{ flexShrink: 0 }} /> : <AlertCircle size={16} style={{ flexShrink: 0 }} />}
                <span>{uploadMessage}</span>
              </div>
            )}
            
            {isUploading && (
              <div className="upload-feedback" style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
                Esto puede tomar unos segundos analizando el Layout...
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="docs-stats stagger-children">
          <div className="docs-stat-card">
            <div className="docs-stat-card__value">{stats.totalDocs}</div>
            <div className="docs-stat-card__label">Total Docs</div>
          </div>
          <div className="docs-stat-card docs-stat-card--success">
            <div className="docs-stat-card__value">{stats.processed}</div>
            <div className="docs-stat-card__label">Procesados</div>
          </div>
          <div className="docs-stat-card docs-stat-card--info">
            <div className="docs-stat-card__value">{stats.indexing}</div>
            <div className="docs-stat-card__label">Indexando</div>
          </div>
          <div className="docs-stat-card docs-stat-card--danger">
            <div className="docs-stat-card__value">{stats.error}</div>
            <div className="docs-stat-card__label">Con Error</div>
          </div>
          <div className="docs-stat-card docs-stat-card--purple">
            <div className="docs-stat-card__value">{stats.totalFragments}</div>
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
              {isLoadingDocs && docsList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    <Loader2 size={24} style={{ animation: 'spin 2s linear infinite', margin: '0 auto', color: '#6366f1' }} />
                    <p style={{ marginTop: '0.5rem', color: '#a1a1aa' }}>Consultando Azure AI Search...</p>
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#a1a1aa' }}>
                    No se han inyectado documentos en la Base Vectorial.
                  </td>
                </tr>
              ) : filteredDocs.map((doc) => (
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
                      <button 
                        onClick={() => downloadAuthenticatedFile(instance, getApiUrl(`/api/documents/download/${encodeURIComponent(doc.name)}`), doc.name)}
                        className="docs-action-btn" 
                        title="Ver / Descargar" 
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Eye size={14} />
                      </button>
                      <button className="docs-action-btn" title="Re-indexar" onClick={() => alert('Para re-indexar, elimina el documento de la base y vuélvelo a subir.')}><RefreshCw size={14} /></button>
                      <button className="docs-action-btn docs-action-btn--danger" title="Eliminar" onClick={() => handleDelete(doc.name)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <OneDriveModal 
        isOpen={isOneDriveModalOpen} 
        onClose={() => setIsOneDriveModalOpen(false)} 
        instance={instance}
        onSyncComplete={fetchDocuments}
      />
    </div>
  )
}
