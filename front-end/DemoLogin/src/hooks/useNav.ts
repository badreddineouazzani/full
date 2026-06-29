import { useNavigate } from 'react-router-dom'
import { useLocale } from '../services/i18n'

/**
 * Locale-aware navigation helpers. Every destination keeps the active locale
 * prefix so URLs stay shareable. Pages call these directly instead of bubbling
 * navigation up to App through callback props.
 */
export function useNav() {
  const navigate = useNavigate()
  const { locale } = useLocale()
  return {
    home: () => navigate(`/${locale}`),
    login: () => navigate(`/${locale}/login`),
    register: () => navigate(`/${locale}/register`),
    admin: () => navigate(`/${locale}/admin`),
  }
}
