import React, { useState, useEffect } from 'react'
import { ClipboardList, Zap, ChevronDown, ChevronUp, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { useMsal } from '@azure/msal-react'
import { authFetch } from '../authFetch'
import './PlaceholderPage.css'

export default function AuditPage() {
  const { instance } = useMsal()
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    authFetch(instance, 'http://localhost:5165/api/audit/logs?limit=50')
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al obtener logs de auditoría:", err);
        setLoading(false);
      });
  }, []);

  const toggleRow = (id) => {
    if (expandedRow === id) setExpandedRow(null);
    else setExpandedRow(id);
  };

  const getSeverityBadge = (hasAlert, severity) => {
    if (!hasAlert) return <span style={{color: '#10b981', display:'flex', alignItems:'center', gap:'4px'}}><CheckCircle2 size={14}/> Seguro</span>;
    if (severity >= 6) return <span style={{color: '#ef4444', display:'flex', alignItems:'center', gap:'4px'}}><ShieldAlert size={14}/> Crítico</span>;
    if (severity >= 4) return <span style={{color: '#f97316', display:'flex', alignItems:'center', gap:'4px'}}><ShieldAlert size={14}/> Alto</span>;
    return <span style={{color: '#eab308', display:'flex', alignItems:'center', gap:'4px'}}><ShieldAlert size={14}/> Moderado</span>;
  };

  return (
    <div className="admin-page">
      <div className="admin-page__topbar">
        <div className="admin-page__breadcrumb">
          <span className="admin-page__breadcrumb-parent">Admin</span>
          <span className="admin-page__breadcrumb-sep">›</span>
          <span className="admin-page__breadcrumb-current">Auditoría & Trazabilidad</span>
        </div>
        <div className="admin-page__topbar-right">
          <Zap size={14} className="topbar-icon--connected" />
          <span className="topbar-status">Azure Cosmos DB Online</span>
        </div>
      </div>
      
      <div className="admin-page__content" style={{padding: '24px'}}>
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '24px'}}>
            <div className="placeholder-page__icon" style={{margin: '0 16px 0 0', width: '50px', height: '50px'}}>
              <ClipboardList size={26} />
            </div>
            <div>
                <h2 style={{margin: '0 0 4px 0', fontSize: '1.4rem', color: '#f8fafc'}}>Historial Forense RAG</h2>
                <p style={{margin: 0, color: '#94a3b8', fontSize: '0.9rem'}}>Registro inmutable end-to-end de consultas, respuestas, seguridad y evaluación de MLOps.</p>
            </div>
        </div>

        <div style={{background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden'}}>
            {loading ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}>Cargando transacciones desde Nube...</div>
            ) : (
                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                    <thead>
                        <tr style={{background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                            <th style={{padding: '16px', color: '#cbd5e1', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Timestamp</th>
                            <th style={{padding: '16px', color: '#cbd5e1', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Validación de Seguridad</th>
                            <th style={{padding: '16px', color: '#cbd5e1', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Groundedness</th>
                            <th style={{padding: '16px', color: '#cbd5e1', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Latencia</th>
                            <th style={{padding: '16px', color: '#cbd5e1', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Inspección Raw</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <React.Fragment key={log.id}>
                                <tr style={{borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s'}} className="audit-row">
                                    <td style={{padding: '16px', color: '#94a3b8', fontSize: '0.9rem'}}>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td style={{padding: '16px', fontSize: '0.9rem'}}>{getSeverityBadge(log.hasContentSafetyAlert, log.safetyAlertSeverity)}</td>
                                    <td style={{padding: '16px', color: log.groundednessScore >= 0.85 ? '#10b981' : '#f59e0b', fontWeight: 600, fontSize: '0.9rem'}}>{(log.groundednessScore * 100).toFixed(0)}%</td>
                                    <td style={{padding: '16px', color: '#94a3b8', fontSize: '0.9rem'}}>{log.responseTimeMs} ms</td>
                                    <td style={{padding: '16px'}}>
                                        <button 
                                            onClick={() => toggleRow(log.id)}
                                            style={{background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600}}
                                        >
                                            {expandedRow === log.id ? "Ocultar Payload" : "Analizar Payload"}
                                            {expandedRow === log.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                        </button>
                                    </td>
                                </tr>
                                {expandedRow === log.id && (
                                    <tr style={{background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                                        <td colSpan="5" style={{padding: '24px'}}>
                                            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                                                <div>
                                                    <h4 style={{margin: '0 0 8px 0', color: '#cbd5e1', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Prompt del Usuario</h4>
                                                    <div style={{background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', color: '#f8fafc', fontSize: '0.95rem', borderLeft: '3px solid #3b82f6', fontStyle: 'italic'}}>{log.userPrompt || "N/A"}</div>
                                                </div>
                                                <div>
                                                    <h4 style={{margin: '0 0 8px 0', color: '#cbd5e1', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Respuesta del RAG</h4>
                                                    <div style={{background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.95rem', borderLeft: '3px solid #10b981', whiteSpace: 'pre-wrap'}}>{log.aiResponse || "N/A"}</div>
                                                </div>
                                                <div>
                                                    <h4 style={{margin: '0 0 8px 0', color: '#cbd5e1', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Archivos PDF Base Utilizados (Citas)</h4>
                                                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                                                        {log.citations && log.citations.length > 0 ? log.citations.map((cit, idx) => (
                                                            <span key={idx} style={{background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', padding: '4px 10px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 500, border: '1px solid rgba(168, 85, 247, 0.3)'}}>{cit}</span>
                                                        )) : (
                                                            <span style={{color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic'}}>Generado sin citas del vectorial.</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{padding: '32px', textAlign: 'center', color: '#64748b'}}>No se han registrado transacciones aún. Envía un mensaje desde la página de Chat.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </div>
  )
}
