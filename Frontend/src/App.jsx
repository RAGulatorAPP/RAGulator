import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ChatPage from './pages/ChatPage'
import AdminDashboard from './pages/AdminDashboard'
import DocumentsPage from './pages/DocumentsPage'
import QualityPage from './pages/QualityPage'
import SecurityPage from './pages/SecurityPage'
import AuditPage from './pages/AuditPage'
import UsersPage from './pages/UsersPage'
import ConfigPage from './pages/ConfigPage'
import AdminLayout from './components/AdminLayout'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="quality" element={<QualityPage />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<ConfigPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
