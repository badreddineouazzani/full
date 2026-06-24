import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useLocale } from './services/i18n'
import { useAppSelector } from './store/hooks'
import { useCurrentUser } from './services/auth/useCurrentUser'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import SuperAdminPage from './pages/SuperAdminPage'

// Flip to true once the backend JWT carries a role claim.
const ENFORCE_ADMIN_ROLE = false

function LoginRoute() {
  const navigate = useNavigate()
  const { locale } = useLocale()
  const { token } = useAppSelector((s) => s.auth)
  if (token) return <Navigate to={`/${locale}`} replace />
  return (
    <LoginPage
      onLoginSuccess={() => navigate(`/${locale}`)}
      onSwitchToRegister={() => navigate(`/${locale}/register`)}
    />
  )
}

function RegisterRoute() {
  const navigate = useNavigate()
  const { locale } = useLocale()
  const { token } = useAppSelector((s) => s.auth)
  if (token) return <Navigate to={`/${locale}`} replace />
  return (
    <RegisterPage
      onRegisterSuccess={() => navigate(`/${locale}/login`)}
      onSwitchToLogin={() => navigate(`/${locale}/login`)}
    />
  )
}

function HomeRoute() {
  const navigate = useNavigate()
  const { locale } = useLocale()
  const { token } = useAppSelector((s) => s.auth)
  if (!token) return <Navigate to={`/${locale}/login`} replace />
  return (
    <HomePage
      onLoggedOut={() => navigate(`/${locale}/login`)}
      onOpenAdmin={() => navigate(`/${locale}/admin`)}
    />
  )
}

function AdminRoute() {
  const navigate = useNavigate()
  const { locale } = useLocale()
  const { isAuthenticated, hasRole } = useCurrentUser()
  if (!isAuthenticated) return <Navigate to={`/${locale}/login`} replace />
  if (ENFORCE_ADMIN_ROLE && !hasRole('superadmin')) return <Navigate to={`/${locale}`} replace />
  return (
    <SuperAdminPage
      onBack={() => navigate(`/${locale}`)}
      onLoggedOut={() => navigate(`/${locale}/login`)}
    />
  )
}

function App() {
  const { locale } = useLocale()
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${locale}/login`} replace />} />
      <Route path="/:locale" element={<HomeRoute />} />
      <Route path="/:locale/login" element={<LoginRoute />} />
      <Route path="/:locale/register" element={<RegisterRoute />} />
      <Route path="/:locale/admin" element={<AdminRoute />} />
      <Route path="*" element={<Navigate to={`/${locale}/login`} replace />} />
    </Routes>
  )
}

export default App
