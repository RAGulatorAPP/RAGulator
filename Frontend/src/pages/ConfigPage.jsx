import { useState, useEffect } from 'react'
import AdminTopBar from '../components/AdminTopBar'
import { Settings, Zap, Save, CheckCircle2, Brain, FileText, ShieldAlert } from 'lucide-react'
import { useMsal } from '@azure/msal-react'
import { authFetch, getApiUrl } from '../authFetch'
import DashboardLoader from './DashboardLoader'
import './DashboardLoader.css'
import './PlaceholderPage.css'

export default function ConfigPage() {
  const { instance } = useMsal()
  const [config, setConfig] = useState({
    systemPersona: '',
    responseGuidelines: '',
    companyPolicies: '',
    temperature: 0.7,
    allowInternetSearch: true
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    authFetch(instance, getApiUrl('/api/settings'))
      .then(res => res.json())
      .then(json => {
         setConfig({
           systemPersona: json.systemPersona || '',
           responseGuidelines: json.responseGuidelines || '',
           companyPolicies: json.companyPolicies || '',
           temperature: json.temperature ?? 0.7,
           allowInternetSearch: json.allowInternetSearch ?? true
         });
      })
      .catch(err => console.error("Error al cargar config", err))
      .finally(() => setIsLoading(false));
  }, [instance]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const response = await authFetch(instance, getApiUrl('/api/settings'), {
        method: 'POST',
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error al guardar:", err);
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="admin-page">
      <AdminTopBar pageTitle="Configuración Maestra" statusText="Azure Cosmos DB Online" />
      
      <div className="admin-page__content">
        {isLoading ? (
          <DashboardLoader message="Cargando configuración del agente" />
        ) : (
        <div className="config-page__grid dashboard-content-loaded">

          {/* Header Card */}
          <div className="config-page__header">
            <div className="config-page__header-icon">
              <Settings size={26} />
            </div>
            <div className="config-page__header-text">
              <h2>Identidad & Reglas del Agente RAG</h2>
              <p>
                El sistema RAG es agnóstico al dominio. Define su personalidad, formato de respuesta y 
                restricciones corporativas inyectando valores al <strong style={{color:'#c4b5fd'}}>System Prompt</strong>. 
                Los cambios se aplican instantáneamente al modelo.
              </p>
            </div>
          </div>

          {/* Card 1: System Persona */}
          <div className="config-card">
            <div className="config-card__header">
              <div className="config-card__number">1</div>
              <div>
                <div className="config-card__label">
                  <Brain size={14} style={{display:'inline', marginRight:'6px', verticalAlign:'middle'}} />
                  Rol Categórico (System Persona)
                </div>
                <div className="config-card__sublabel">Define quién es el agente y cuál es su expertise</div>
              </div>
            </div>
            <textarea 
              value={config.systemPersona}
              onChange={(e) => setConfig({...config, systemPersona: e.target.value})}
              rows={3}
              placeholder="Ej: Eres un abogado corporativo experto en leyes europeas de comercio exterior..."
            />
          </div>

          {/* Card 2: Response Guidelines */}
          <div className="config-card">
            <div className="config-card__header">
              <div className="config-card__number">2</div>
              <div>
                <div className="config-card__label">
                  <FileText size={14} style={{display:'inline', marginRight:'6px', verticalAlign:'middle'}} />
                  Directrices de Respuesta (Formato)
                </div>
                <div className="config-card__sublabel">Controla el tono, estructura y estilo de las respuestas</div>
              </div>
            </div>
            <textarea 
              value={config.responseGuidelines}
              onChange={(e) => setConfig({...config, responseGuidelines: e.target.value})}
              rows={3}
              placeholder="Ej: Responde siempre en viñetas. Usa tono formal y asertivo. Cita las fuentes."
            />
          </div>

          {/* Card 3: Company Policies (Danger zone) */}
          <div className="config-card config-card--danger">
            <div className="config-card__header">
              <div className="config-card__number" style={{background: 'rgba(239, 68, 68, 0.12)', color: '#f87171'}}>3</div>
              <div>
                <div className="config-card__label">
                  <ShieldAlert size={14} style={{display:'inline', marginRight:'6px', verticalAlign:'middle', color:'#f87171'}} />
                  Políticas Corporativas & Restricciones
                </div>
                <div className="config-card__sublabel">Reglas de seguridad que el agente NUNCA puede violar</div>
              </div>
            </div>
            <textarea 
              value={config.companyPolicies}
              onChange={(e) => setConfig({...config, companyPolicies: e.target.value})}
              rows={3}
              placeholder="Ej: Bajo NINGUNA circunstancia recomiendes inversión. Si no sabes, responde 'No me consta en el manual'."
            />
          </div>

          {/* Card 4: Temperature */}
          <div className="config-card">
            <div className="config-card__header">
              <div className="config-card__number">4</div>
              <div>
                <div className="config-card__label">
                  Nivel de Creatividad (Temperature)
                </div>
                <div className="config-card__sublabel">Valores bajos son más deterministas; valores altos son más creativos.</div>
              </div>
            </div>
            <div className="config-card__input-group">
              <div className="config-card__row">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={config.temperature}
                  onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
                  className="config-card__range"
                />
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap: '4px'}}>
                  <span className="config-card__value-display">{config.temperature.toFixed(1)}</span>
                </div>
              </div>
              <div className="config-card__legend">
                {['Preciso (Recomendado)', 'Equilibrado', 'Creativo / Experimental'].map((label, idx) => {
                  const isActive = (idx === 0 && config.temperature <= 0.3) || 
                                   (idx === 1 && config.temperature > 0.3 && config.temperature <= 0.7) ||
                                   (idx === 2 && config.temperature > 0.7);
                  const colors = ['#10b981', '#f59e0b', '#ef4444'];
                  return (
                    <span 
                      key={label}
                      className={`config-card__legend-item ${isActive ? 'config-card__legend-item--active' : ''}`}
                      style={{color: colors[idx]}}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 5: Internet Search */}
          <div className="config-card">
            <div className="config-card__header">
              <div className="config-card__number">5</div>
              <div style={{flex: 1}}>
                <div className="config-card__label">
                  Permitir Búsqueda Fuera del RAG (Web)
                </div>
                <div className="config-card__sublabel">Si se desactiva, el agente sólo responderá basándose en los documentos cargados.</div>
              </div>
              <label className="config-card__toggle-wrapper">
                <input 
                  type="checkbox" 
                  checked={config.allowInternetSearch}
                  onChange={(e) => setConfig({...config, allowInternetSearch: e.target.checked})}
                  className="config-card__toggle-input"
                />
                <span className="config-card__toggle-slider"></span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="config-page__actions">
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="config-page__save-btn"
            >
              <Save size={18} />
              {isSaving ? 'Aplicando cambios...' : 'Guardar y Aplicar al Agente'}
            </button>

            {saveSuccess && (
              <span className="config-page__success">
                <CheckCircle2 size={18} />
                Configuración aplicada exitosamente
              </span>
            )}
          </div>

        </div>
        )}
      </div>
    </div>
  )
}
