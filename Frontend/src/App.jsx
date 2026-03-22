import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react'
import { PublicClientApplication, EventType } from '@azure/msal-browser'
import { msalConfig } from './authConfig'
import ChatPage from './pages/ChatPage'
import AdminDashboard from './pages/AdminDashboard'
import DocumentsPage from './pages/DocumentsPage'
import QualityPage from './pages/QualityPage'
import SecurityPage from './pages/SecurityPage'
import AuditPage from './pages/AuditPage'
import UsersPage from './pages/UsersPage'
import ConfigPage from './pages/ConfigPage'
import AdminLayout from './components/AdminLayout'
import LoginPage from './pages/LoginPage'

const msalInstance = new PublicClientApplication(msalConfig);

// Set default active account if one is logged in
msalInstance.initialize().then(() => {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
    }
    
    msalInstance.addEventCallback((event) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
            msalInstance.setActiveAccount(event.payload.account);
        }
    });
});

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthenticatedTemplate>
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
      </AuthenticatedTemplate>
      
      <UnauthenticatedTemplate>
        <LoginPage />
      </UnauthenticatedTemplate>
    </MsalProvider>
  )
}

export default App
