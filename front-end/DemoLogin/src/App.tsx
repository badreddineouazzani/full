import { Navigate, Route, Routes } from 'react-router-dom'
import { useLocale } from './services/i18n'
import PrivateRoute from './components/PrivateRoute'
import PublicRoute from './components/PublicRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import SuperAdminPage from './pages/SuperAdminPage'

function App() {
  const { locale } = useLocale()
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${locale}/login`} replace />} />
      <Route path="/:locale" element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/:locale/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/:locale/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/:locale/admin" element={<PrivateRoute roles={['superadmin']}><SuperAdminPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to={`/${locale}/login`} replace />} />
    </Routes>
  )
}

export default App
