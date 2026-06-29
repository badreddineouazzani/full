import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useLocale } from '../services/i18n'
import { useAppSelector } from '../store/hooks'
import { useCurrentUser } from '../services/auth/useCurrentUser'
import type { Role } from '../services/auth/roles'

interface PrivateRouteProps {
  children: ReactNode
  /** When set, an authenticated user must hold one of these roles or they are
   *  sent back to the home page. Omit to guard on authentication only. */
  roles?: Role[]
}

/**
 * Route guard. Redirects unauthenticated users (no token) to the
 * locale-prefixed login page. When `roles` is provided, an authenticated user
 * lacking one of those roles is redirected to the home page instead.
 */
function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { locale } = useLocale()
  const { token } = useAppSelector((s) => s.auth)
  const { hasRole } = useCurrentUser()

  if (!token) return <Navigate to={`/${locale}/login`} replace />
  if (roles && !hasRole(...roles)) return <Navigate to={`/${locale}`} replace />

  return <>{children}</>
}

export default PrivateRoute
