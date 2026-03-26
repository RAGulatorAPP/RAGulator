import { useState, useEffect, useCallback } from 'react'
import { X, Folder, File, ChevronRight, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react'
import { authFetch, getApiUrl } from '../authFetch'

export default function OneDriveModal({ isOpen, onClose, instance, onSyncComplete }) {
  const [currentPath, setCurrentPath] = useState([]) // Array of {id, name}
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [status, setStatus] = useState(null)


  const fetchItems = useCallback(async (driveId, itemId) => {
    setIsLoading(true)
    try {
      const res = await authFetch(instance, getApiUrl(`/api/onedrive/items/${driveId}/${itemId}`))
      const data = await res.json()
      setItems(data)
    } catch (err) {
      console.error("Error fetching items", err)
    } finally {
      setIsLoading(false)
    }
  }, [instance])

  const handleDriveSelect = useCallback(async (drive) => {
    setCurrentPath([{ id: 'root', name: drive.name, driveId: drive.id }])
    fetchItems(drive.id, 'root')
  }, [fetchItems])

  const fetchDrives = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await authFetch(instance, getApiUrl('/api/onedrive/drives'))
      const data = await res.json()
      if (data.length > 0) {
        // Auto-select first drive and fetch root
        handleDriveSelect(data[0])
      }
    } catch (err) {
      console.error("Error fetching drives", err)
    } finally {
      setIsLoading(false)
    }
  }, [handleDriveSelect, instance])

  useEffect(() => {
    if (isOpen) {
      fetchDrives()
    }
  }, [isOpen, fetchDrives])

  const handleItemClick = (item) => {
    if (item.isFolder) {
      const driveId = currentPath[0].driveId
      setCurrentPath([...currentPath, { id: item.id, name: item.name, driveId }])
      fetchItems(driveId, item.id)
      setSelectedFolder(item)
    }
  }

  const navigateBack = (index) => {
    const newPath = currentPath.slice(0, index + 1)
    setCurrentPath(newPath)
    const target = newPath[newPath.length - 1]
    fetchItems(target.driveId, target.id)
    if (target.id === 'root') setSelectedFolder(null)
    else setSelectedFolder({ id: target.id, name: target.name })
  }

  const handleSync = async () => {
    if (!selectedFolder) return
    setIsSyncing(true)
    setStatus("Iniciando sincronización...")
    try {
      const driveId = currentPath[0].driveId
      const res = await authFetch(instance, getApiUrl('/api/onedrive/sync'), {
        method: 'POST',
        body: JSON.stringify({ driveId, folderId: selectedFolder.id })
      })
      const data = await res.json()
      setStatus(data.message)
      if (onSyncComplete) onSyncComplete()
    } catch (err) {
      setStatus("Error en la sincronización")
      console.error(err)
    } finally {
      setIsSyncing(false)
    }
  }

  const [shareUrl, setShareUrl] = useState('')

  const handleResolveLink = async () => {
    if (!shareUrl) return
    setIsLoading(true)
    setStatus(null)
    try {
      const res = await authFetch(instance, getApiUrl(`/api/onedrive/resolve?url=${encodeURIComponent(shareUrl)}`))
      if (!res.ok) throw new Error("No se pudo resolver el enlace")
      const data = await res.json()
      
      const newPath = [{ id: 'root', name: 'OneDrive Compartido', driveId: data.driveId }]
      if (data.id !== 'root') {
        newPath.push({ id: data.id, name: data.name, driveId: data.driveId })
      }
      setCurrentPath(newPath)
      fetchItems(data.driveId, data.id)
      setSelectedFolder(data.isFolder ? data : null)
      setShareUrl('')
    } catch (err) {
      console.error(err)
      setStatus("Error: Asegúrate de que el enlace sea válido y compartido públicamente o con la aplicación.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '600px', width: '90%' }}>
        <div className="modal-card__header">
          <div className="modal-card__title">
            <RefreshCw size={18} style={{marginRight:'8px'}} className={isSyncing ? 'animate-spin' : ''} />
            Sincronizar desde OneDrive
          </div>
          <button className="modal-card__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          {/* Resolve Link Section */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input 
              type="text" 
              className="input" 
              placeholder="Pega un enlace compartido de OneDrive..." 
              value={shareUrl}
              onChange={(e) => setShareUrl(e.target.value)}
              style={{ flex: 1, fontSize: '0.85rem' }}
            />
            <button 
              className="btn btn-primary btn-sm" 
              onClick={handleResolveLink}
              disabled={!shareUrl || isLoading}
            >
              Resolver
            </button>
          </div>

          {/* Breadcrumbs */}
          <div className="onedrive-breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {currentPath.map((p, idx) => (
              <span key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                <button 
                  onClick={() => navigateBack(idx)}
                  style={{ background: 'none', border: 'none', color: idx === currentPath.length-1 ? '#fff' : '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  {p.name}
                </button>
                {idx < currentPath.length - 1 && <ChevronRight size={14} color="#475569" />}
              </span>
            ))}
          </div>

          {/* Items List */}
          <div className="onedrive-list" style={{ minHeight: '300px', maxHeight: '400px', overflowY: 'auto' }}>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <Loader2 className="animate-spin" size={32} color="#3b82f6" />
              </div>
            ) : items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Carpeta vacía o sin archivos PDF.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {items.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => handleItemClick(item)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      padding: '10px 12px', 
                      borderRadius: '8px', 
                      cursor: item.isFolder ? 'pointer' : 'default',
                      background: selectedFolder?.id === item.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      border: selectedFolder?.id === item.id ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                      transition: 'all 0.2s'
                    }}
                    className={item.isFolder ? 'hover:bg-white/5' : ''}
                  >
                    {item.isFolder ? <Folder size={18} color="#3b82f6" fill="#3b82f622" /> : <File size={18} color="#94a3b8" />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.isFolder ? 'Carpeta' : `${(item.size / 1024).toFixed(1)} KB`}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Message */}
          {status && (
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              borderRadius: '8px', 
              background: 'rgba(16, 185, 129, 0.1)', 
              color: '#10b981', 
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} />
              {status}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={isSyncing}>Cancelar</button>
          <button 
            className="btn btn-primary" 
            disabled={!selectedFolder || isSyncing}
            onClick={handleSync}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isSyncing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            {isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}
          </button>
        </div>
      </div>
    </div>
  )
}
