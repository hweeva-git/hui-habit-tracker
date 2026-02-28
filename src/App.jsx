import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'

function AppContent() {
  const { user } = useAuth()
  return user ? <HomePage /> : <AuthPage />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
