import { useState, useEffect } from 'react'
import {
  Zap, TrendingUp, Activity
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend
} from 'recharts'
import { useMsal } from '@azure/msal-react'
import { authFetch } from '../authFetch'
import './QualityPage.css'

const metricColors = {
  groundedness: { color: '#00d4aa', label: 'Groundedness Score' },
  relevance: { color: '#06b6d4', label: 'Relevance Score' },
  coherence: { color: '#f59e0b', label: 'Coherence Score' },
  fluency: { color: '#a78bfa', label: 'Fluency Score' },
  contextRecall: { color: '#f97316', label: 'Context Recall' },
}

export default function QualityPage() {
  const { instance } = useMsal()
  const [data, setData] = useState({
    metrics: {},
    chartData: [],
    radarData: []
  });

  useEffect(() => {
    authFetch(instance, 'http://localhost:5165/api/quality/metrics')
      .then(res => res.json())
      .then(json => {
        setData({
          metrics: json.metrics || {},
          chartData: json.lineChart || [],
          radarData: json.radarChart || []
        });
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page__topbar">
        <div className="admin-page__breadcrumb">
          <span className="admin-page__breadcrumb-parent">Admin</span>
          <span className="admin-page__breadcrumb-sep">›</span>
          <span className="admin-page__breadcrumb-current">Evaluación de Calidad RAG</span>
        </div>
        <div className="admin-page__topbar-right">
          <Zap size={14} className="topbar-icon--connected" />
          <span className="topbar-status">Azure AI Search Conectado</span>
        </div>
      </div>

      <div className="admin-page__content">
        {/* Header */}
        <div className="quality-header">
          <h2 className="quality-header__title">Evaluación de Calidad RAG</h2>
          <p className="quality-header__desc">
            Métricas de evaluación continua con Azure AI Evaluation — basadas en Azure PromptFlow Evaluators
          </p>
        </div>

        {/* Metric Cards */}
        <div className="quality-metrics stagger-children">
          {Object.entries(data.metrics).map(([key, metric]) => {
            const meta = metricColors[key] || { color: '#94a3b8', label: key }
            return (
              <div key={key} className="quality-metric-card" style={{ '--metric-color': meta.color }}>
                <div className="quality-metric-card__header">
                  <span className="quality-metric-card__dot" style={{ background: meta.color }} />
                  <span className="quality-metric-card__label">{meta.label}</span>
                </div>
                <div className="quality-metric-card__value">{metric.value}</div>
                <div className="quality-metric-card__trend">{metric.trend}</div>
                <div className="quality-metric-card__footer">
                  <span className="quality-metric-card__threshold">Umbral: {metric.threshold}</span>
                  <span className="quality-metric-card__status badge badge-success">✓ {metric.status}</span>
                </div>
                <div className="quality-metric-card__desc">{metric.description}</div>
              </div>
            )
          })}
        </div>

        {/* Charts Row */}
        <div className="quality-charts-row">
          {/* Line Chart */}
          <div className="quality-chart card">
            <h3 className="quality-chart__title">
              <Activity size={16} />
              Evolución de Métricas (Últimos 7 días)
            </h3>
            <div className="quality-chart__container">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0.75, 1]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1a1f35',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Line type="monotone" dataKey="groundedness" stroke="#00d4aa" strokeWidth={2} dot={false} name="Groundedness" />
                  <Line type="monotone" dataKey="relevance" stroke="#06b6d4" strokeWidth={2} dot={false} name="Relevance" />
                  <Line type="monotone" dataKey="coherence" stroke="#f59e0b" strokeWidth={2} dot={false} name="Coherence" />
                  <Line type="monotone" dataKey="fluency" stroke="#a78bfa" strokeWidth={2} dot={false} name="Fluency" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="quality-chart card">
            <h3 className="quality-chart__title">
              <TrendingUp size={16} />
              Perfil de Calidad (Radar)
            </h3>
            <div className="quality-chart__container">
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={data.radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0.5, 1]}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={false}
                  />
                  <Radar
                    name="Calidad"
                    dataKey="value"
                    stroke="#00d4aa"
                    fill="#00d4aa"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Model Comparison Section (teaser) */}
        <div className="quality-model-section card">
          <div className="quality-model-section__header">
            <h3 className="quality-chart__title" style={{ marginBottom: 0 }}>
              <Activity size={16} />
              Comparación de Modelos (Azure OpenAI)
            </h3>
            <button className="btn btn-primary btn-sm">
              Benchmark Interno
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
