import { useState, useEffect } from 'react'
import { Settings, Zap, Save, CheckCircle2 } from 'lucide-react'
import './PlaceholderPage.css' // Mantenemos el CSS estructural

export default function ConfigPage() {
  const [config, setConfig] = useState({
    systemPersona: 'Cargando...',
    responseGuidelines: 'Cargando...',
    companyPolicies: 'Cargando...'
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5165/api/settings')
      .then(res => res.json())
      .then(json => {
         setConfig({
           systemPersona: json.systemPersona || '',
           responseGuidelines: json.responseGuidelines || '',
           companyPolicies: json.companyPolicies || ''
         });
      })
      .catch(err => console.error("Error al cargar config", err));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const response = await fetch('http://localhost:5165/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000); // Hide success after 3s
      }
    } catch (err) {
      console.error("Error al guardar:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page__topbar">
        <div className="admin-page__breadcrumb">
          <span className="admin-page__breadcrumb-parent">Admin</span>
          <span className="admin-page__breadcrumb-sep">›</span>
          <span className="admin-page__breadcrumb-current">Configuración Maestra</span>
        </div>
        <div className="admin-page__topbar-right">
          <Zap size={14} className="topbar-icon--connected" />
          <span className="topbar-status">Azure Cosmos DB Online</span>
        </div>
      </div>
      
      <div className="admin-page__content" style={{maxWidth: '800px', margin: '0 auto'}}>
        <div className="placeholder-page" style={{textAlign: 'left', padding: '32px', alignItems: 'flex-start'}}>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: '24px', width: '100%'}}>
              <div className="placeholder-page__icon" style={{margin: '0 16px 0 0', width: '60px', height: '60px', flexShrink: 0}}>
                <Settings size={32} />
              </div>
              <div style={{flexGrow: 1}}>
                  <h2 style={{margin: '0 0 8px 0', fontSize: '1.5rem', color: '#f8fafc'}}>Identidad & Reglas del LLM</h2>
                  <p style={{margin: 0, color: '#94a3b8'}}>El RAG está diseñado para ser de Dominio-Agnóstico. Moldea su personalidad, formato de respuesta y restricciones corporativas directamente inyectando valores al <b>Prompt del Sistema</b> aquí.</p>
              </div>
          </div>
          
          <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '20px'}}>
             <div className="setting-group">
                <label style={{display:'block', marginBottom:'8px', fontWeight:600, color:'#cbd5e1'}}>1. Rol Categórico (System Persona)</label>
                <textarea 
                  value={config.systemPersona}
                  onChange={(e) => setConfig({...config, systemPersona: e.target.value})}
                  rows={3}
                  style={{width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontFamily: 'inherit', resize: 'vertical'}}
                  placeholder="Ej: Eres un abogado corporativo experto en leyes europeas..."
                />
             </div>

             <div className="setting-group">
                <label style={{display:'block', marginBottom:'8px', fontWeight:600, color:'#cbd5e1'}}>2. Directrices de Respuesta (Formato)</label>
                <textarea 
                  value={config.responseGuidelines}
                  onChange={(e) => setConfig({...config, responseGuidelines: e.target.value})}
                  rows={4}
                  style={{width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontFamily: 'inherit', resize: 'vertical'}}
                  placeholder="Ej: Responde en viñetas siempre que sea posible. Usa tono formal y asertivo."
                />
             </div>

             <div className="setting-group">
                <label style={{display:'block', marginBottom:'8px', fontWeight:600, color:'#cbd5e1'}}>3. Políticas Corporativas & Restricciones</label>
                <textarea 
                  value={config.companyPolicies}
                  onChange={(e) => setConfig({...config, companyPolicies: e.target.value})}
                  rows={4}
                  style={{width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#ef4444', fontFamily: 'inherit', resize: 'vertical'}}
                  placeholder="Ej: Bajo NINGUNA circunstancia recomiendes inversión. Si no sabes, responde 'No me consta en el manual'."
                />
             </div>

             <div style={{display: 'flex', alignItems: 'center', marginTop: '16px', gap: '16px'}}>
                 <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  style={{padding: '12px 24px', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 600, cursor: isSaving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}
                 >
                   <Save size={18} />
                   {isSaving ? 'Aplicando Inyección...' : 'Guardar y Orquestar Agente'}
                 </button>

                 {saveSuccess && (
                    <span style={{color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500}}>
                       <CheckCircle2 size={18} />
                       Sistema Re-entrenado Instantáneamente
                    </span>
                 )}
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
