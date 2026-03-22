import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, Zap, ShieldOff, Server } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import './QualityPage.css' // We can reuse standard dashboard CSS logic

const categoryColors = {
  Hate: '#ef4444',
  Violence: '#f97316',
  Sexual: '#eab308',
  SelfHarm: '#b91c1c',
  Unknown: '#64748b'
}

export default function SecurityPage() {
  const [data, setData] = useState({
    totalBlocks: 0,
    distribution: [],
    recentIncidents: []
  });

  useEffect(() => {
    fetch('http://localhost:5165/api/security/metrics')
      .then(res => res.json())
      .then(json => {
         setData(json);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page__topbar">
        <div className="admin-page__breadcrumb">
          <span className="admin-page__breadcrumb-parent">Admin</span>
          <span className="admin-page__breadcrumb-sep">›</span>
          <span className="admin-page__breadcrumb-current">Gobernanza de Seguridad</span>
        </div>
        <div className="admin-page__topbar-right">
          <Zap size={14} className="topbar-icon--connected" />
          <span className="topbar-status">Azure AI Content Safety Activado</span>
        </div>
      </div>
      <div className="admin-page__content">
        <div className="quality-header">
          <h2 className="quality-header__title"><Shield size={24} style={{display:'inline', marginRight:'8px', verticalAlign:'middle'}}/> Content Safety & Firewall</h2>
          <p className="quality-header__desc">
            Monitoreo en tiempo real de amenazas mitigadas por el cortafuegos cognitivo pre-LLM.
          </p>
        </div>

        <div className="quality-metrics stagger-children">
            <div className="quality-metric-card" style={{ '--metric-color': '#ef4444' }}>
              <div className="quality-metric-card__header">
                <span className="quality-metric-card__dot" style={{ background: '#ef4444' }} />
                <span className="quality-metric-card__label">Mensajes Bloqueados (Safety)</span>
              </div>
              <div className="quality-metric-card__value">{data.totalBlocks}</div>
              <div className="quality-metric-card__footer">
                <span className="quality-metric-card__status badge" style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444'}}>Interceptados Exitosamente</span>
              </div>
            </div>

            <div className="quality-metric-card" style={{ '--metric-color': '#00d4aa' }}>
              <div className="quality-metric-card__header">
                <span className="quality-metric-card__dot" style={{ background: '#00d4aa' }} />
                <span className="quality-metric-card__label">Filtros Activos</span>
              </div>
              <div className="quality-metric-card__value">4 / 4</div>
              <div className="quality-metric-card__footer">
                <span className="quality-metric-card__status badge badge-success">✓ Violencia, Odio, Sexual y Autolesión</span>
              </div>
            </div>

             <div className="quality-metric-card" style={{ '--metric-color': '#3b82f6' }}>
              <div className="quality-metric-card__header">
                <span className="quality-metric-card__dot" style={{ background: '#3b82f6' }} />
                <span className="quality-metric-card__label">Umbral de Severidad (RBAC)</span>
              </div>
              <div className="quality-metric-card__value">Nivel 2</div>
              <div className="quality-metric-card__footer">
                <span className="quality-metric-card__status badge" style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6'}}>Medio-Bajo (Restricción Alta)</span>
              </div>
            </div>
        </div>

        <div className="quality-charts-row" style={{ marginTop: '24px' }}>
          <div className="quality-chart card" style={{flex: 1}}>
            <h3 className="quality-chart__title">
              <Server size={16} />
              Distribución de Intercepciones
            </h3>
            <div className="quality-chart__container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              {data.distribution.length === 0 ? (
                 <div style={{opacity: 0.5, fontSize: '0.9rem'}}>No se han detectado incidentes de seguridad aún.</div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.distribution}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={categoryColors[entry.name] || categoryColors.Unknown} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1f35', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="quality-chart card" style={{flex: 2}}>
             <h3 className="quality-chart__title">
              <AlertTriangle size={16} />
              Últimos Incidentes Detectados (Azure Log)
            </h3>
            <div className="quality-chart__container" style={{overflowY: 'auto', maxHeight: '250px'}}>
              {data.recentIncidents.length === 0 ? (
                 <div style={{opacity: 0.5, fontSize: '0.9rem', padding: '16px'}}>El registro de bloqueos está limpio.</div>
              ) : (
                 <table style={{width: '100%', fontSize: '0.9rem', textAlign: 'left', borderCollapse: 'collapse'}}>
                   <thead>
                     <tr style={{borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                       <th style={{padding: '8px', color: '#94a3b8'}}>Fecha/Hora</th>
                       <th style={{padding: '8px', color: '#94a3b8'}}>Categoría Infringida</th>
                       <th style={{padding: '8px', color: '#94a3b8'}}>Severidad (0-7)</th>
                     </tr>
                   </thead>
                   <tbody>
                     {data.recentIncidents.map(inc => (
                       <tr key={inc.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                         <td style={{padding: '8px'}}>{inc.time}</td>
                         <td style={{padding: '8px', color: categoryColors[inc.category] || categoryColors.Unknown, fontWeight: 500}}>
                            <ShieldOff size={12} style={{marginRight: '6px', verticalAlign: 'middle'}}/>
                            {inc.category}
                         </td>
                         <td style={{padding: '8px'}}>Nivel {inc.severity}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
