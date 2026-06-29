import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useLocale } from '../services/i18n'
import { useAppSelector } from '../store/hooks'

interface PublicRouteProps {
  children: ReactNode
}

/**
 * Inverse of PrivateRoute: keeps already-authenticated users out of the
 * auth-only pages (login / register) by redirecting them to the home page.
 */
function PublicRoute({ children }: PublicRouteProps) {
  const { locale } = useLocale()
  const { token } = useAppSelector((s) => s.auth)

  if (token) return <Navigate to={`/${locale}`} replace />

  return <>{children}</>
}

export default PublicRoute
