import {
  Sparkles, Clock, FileText, AlertTriangle, TrendingUp, Zap, Search as SearchIcon
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import { dashboardMetrics, groundednessChartData, recentAlerts } from '../data/mockData'
import './AdminDashboard.css'

const alertTypeMap = {
  danger: { dot: '#ef4444' },
  warning: { dot: '#f59e0b' },
  info: { dot: '#3b82f6' },
  success: { dot: '#10b981' },
}

export default function AdminDashboard() {
  return (
    <div className="admin-page">
      {/* Breadcrumb & Status */}
      <div className="admin-page__topbar">
        <div className="admin-page__breadcrumb">
          <span className="admin-page__breadcrumb-parent">Admin</span>
          <span className="admin-page__breadcrumb-sep">›</span>
          <span className="admin-page__breadcrumb-current">Panel de Administración y Gobernanza RAG</span>
        </div>
        <div className="admin-page__topbar-right">
          <Zap size={14} className="topbar-icon--connected" />
          <span className="topbar-status">Azure AI Search Conectado</span>
        </div>
      </div>

      <div className="admin-page__content">
        {/* Welcome */}
        <div className="dashboard-welcome card">
          <div className="dashboard-welcome__left">
            <h2 className="dashboard-welcome__title">Bienvenido al Panel de Gobernanza RAG</h2>
            <p className="dashboard-welcome__subtitle">
              Viernes, 20 de marzo de 2026 · Sistema operando con normalidad · Azure AI Search Conectado
            </p>
          </div>
          <div className="dashboard-welcome__right badge badge-success">
            <span className="chat-status-dot" style={{ width: 6, height: 6 }} />
            Todos los servicios activos
          </div>
        </div>

        {/* KPI Cards */}
        <div className="dashboard-kpis stagger-children">
          <div className="kpi-card kpi-card--teal">
            <div className="kpi-card__header">
              <Sparkles size={15} />
              <span>Groundedness Score Medio</span>
            </div>
            <div className="kpi-card__value">{dashboardMetrics.groundednessScore.value}</div>
            <div className="kpi-card__label">Alucinación Mitigada</div>
            <div className="kpi-card__progress">
              <div className="kpi-card__progress-bar" style={{ width: '93%' }} />
            </div>
            <div className="kpi-card__trend">{dashboardMetrics.groundednessScore.trend}</div>
          </div>

          <div className="kpi-card kpi-card--purple">
            <div className="kpi-card__header">
              <Clock size={15} />
              <span>Tiempo de Respuesta Promedio</span>
            </div>
            <div className="kpi-card__value">{dashboardMetrics.responseTime.value}</div>
            <div className="kpi-card__label">Rendimiento Óptimo</div>
            <div className="kpi-card__progress">
              <div className="kpi-card__progress-bar kpi-card__progress-bar--purple" style={{ width: '70%' }} />
            </div>
            <div className="kpi-card__trend">{dashboardMetrics.responseTime.trend}</div>
          </div>

          <div className="kpi-card kpi-card--green">
            <div className="kpi-card__header">
              <FileText size={15} />
              <span>Documentos Ingestados</span>
            </div>
            <div className="kpi-card__value">{dashboardMetrics.documentsIngested.value}</div>
            <div className="kpi-card__label">En Azure AI Search</div>
            <div className="kpi-card__progress">
              <div className="kpi-card__progress-bar kpi-card__progress-bar--green" style={{ width: '80%' }} />
            </div>
            <div className="kpi-card__trend">{dashboardMetrics.documentsIngested.trend}</div>
          </div>

          <div className="kpi-card kpi-card--orange">
            <div className="kpi-card__header">
              <AlertTriangle size={15} />
              <span>Alertas de Content Safety</span>
            </div>
            <div className="kpi-card__value">{dashboardMetrics.contentSafetyAlerts.value}</div>
            <div className="kpi-card__label">Última semana</div>
            <div className="kpi-card__progress">
              <div className="kpi-card__progress-bar kpi-card__progress-bar--orange" style={{ width: '20%' }} />
            </div>
            <div className="kpi-card__trend">Todos resueltos</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="dashboard-charts-row">
          {/* Groundedness Chart */}
          <div className="dashboard-chart card">
            <h3 className="dashboard-chart__title">
              <TrendingUp size={16} />
              Métricas de Evaluación Continua — Groundedness
            </h3>
            <div className="dashboard-chart__container">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={groundednessChartData}>
                  <defs>
                    <linearGradient id="gradientGroundedness" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0.85, 1]}
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
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#00d4aa"
                    strokeWidth={2}
                    fill="url(#gradientGroundedness)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="dashboard-alerts card">
            <h3 className="dashboard-chart__title">
              <AlertTriangle size={16} />
              Alertas Recientes
            </h3>
            <div className="dashboard-alerts__list">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="dashboard-alert-item">
                  <span
                    className="dashboard-alert-item__dot"
                    style={{ background: alertTypeMap[alert.type]?.dot }}
                  />
                  <div className="dashboard-alert-item__content">
                    <span className="dashboard-alert-item__msg">{alert.message}</span>
                    <span className="dashboard-alert-item__time">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
