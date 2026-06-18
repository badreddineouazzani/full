import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useLocale } from './services/i18n'
import Login from './login'
import Register from './Register'
import Home from './Home'
import SuperAdminDashboard from './admin/SuperAdminDashboard'
import { useCurrentUser } from './services/auth/useCurrentUser'

function hasToken() {
  return !!localStorage.getItem('token');
}

// Flip to true once the backend JWT carries a role claim. Until then the
// decoded role falls back to "viewer", which would lock everyone out.
const ENFORCE_ADMIN_ROLE = false;

function LoginRoute() {
  const navigate = useNavigate();
  const { locale } = useLocale();
  if (hasToken()) return <Navigate to={`/${locale}`} replace />;
  return (
    <Login
      onLoginSuccess={() => navigate(`/${locale}`)}
      onSwitchToRegister={() => navigate(`/${locale}/register`)}
    />
  );
}

function RegisterRoute() {
  const navigate = useNavigate();
  const { locale } = useLocale();
  if (hasToken()) return <Navigate to={`/${locale}`} replace />;
  return (
    <Register
      onRegisterSuccess={() => navigate(`/${locale}/login`)}
      onSwitchToLogin={() => navigate(`/${locale}/login`)}
    />
  );
}

function HomeRoute() {
  const navigate = useNavigate();
  const { locale } = useLocale();
  if (!hasToken()) return <Navigate to={`/${locale}/login`} replace />;
  return (
    <Home
      onLoggedOut={() => navigate(`/${locale}/login`)}
      onOpenAdmin={() => navigate(`/${locale}/admin`)}
    />
  );
}

function AdminRoute() {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const { isAuthenticated, hasRole } = useCurrentUser();
  if (!isAuthenticated) return <Navigate to={`/${locale}/login`} replace />;
  // Ready to enforce: set ENFORCE_ADMIN_ROLE once the JWT includes the role.
  if (ENFORCE_ADMIN_ROLE && !hasRole('superadmin')) {
    return <Navigate to={`/${locale}`} replace />;
  }
  return (
    <SuperAdminDashboard
      onBack={() => navigate(`/${locale}`)}
      onLoggedOut={() => navigate(`/${locale}/login`)}
    />
  );
}

function App() {
  const { locale } = useLocale();
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${locale}/login`} replace />} />
      <Route path="/:locale" element={<HomeRoute />} />
      <Route path="/:locale/login" element={<LoginRoute />} />
      <Route path="/:locale/register" element={<RegisterRoute />} />
      <Route path="/:locale/admin" element={<AdminRoute />} />
      <Route path="*" element={<Navigate to={`/${locale}/login`} replace />} />
    </Routes>
  );
}

export default App;