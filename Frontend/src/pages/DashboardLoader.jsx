import './DashboardLoader.css'

export default function DashboardLoader({ message = 'Cargando datos de telemetría' }) {
  return (
    <div className="dashboard-loader">
      <div className="dashboard-loader__spinner" />
      <div className="dashboard-loader__text">
        <span className="dashboard-loader__title">{message}</span>
        <span className="dashboard-loader__subtitle">
          Conectando con Azure
          <span className="dashboard-loader__dot-pulse">
            <span /><span /><span />
          </span>
        </span>
      </div>
      <div className="dashboard-loader__skeletons">
        <div className="dashboard-loader__skeleton-card" />
        <div className="dashboard-loader__skeleton-card" />
        <div className="dashboard-loader__skeleton-card" />
        <div className="dashboard-loader__skeleton-card" />
      </div>
    </div>
  )
}
