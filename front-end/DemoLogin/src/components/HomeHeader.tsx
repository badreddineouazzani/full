import { FormattedMessage } from 'react-intl'
import { useAppDispatch } from '../store/hooks'
import { logout } from '../features/auth/authSlice'
import { useLocale, type Locale } from '../services/i18n'
import { useCurrentUser } from '../services/auth/useCurrentUser'
import { useNav } from '../hooks/useNav'
import { useDarkMode } from '../hooks/useDarkMode'

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
]

/** Top bar: language switch, theme toggle, admin shortcut and logout. */
function HomeHeader() {
  const dispatch = useAppDispatch()
  const nav = useNav()
  const { locale, setLocale } = useLocale()
  const { hasRole } = useCurrentUser()
  const { dark, toggle: toggleTheme } = useDarkMode()

  return (
    <div className="page-header">
      <h1><FormattedMessage id="common.appName" /> 🛒</h1>
      <div className="header-controls">
        <select
          className="locale-select"
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          aria-label="Language"
        >
          {LOCALE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {dark ? (
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
        </button>
        {hasRole('superadmin') && (
          <button className="logout-button" onClick={nav.admin}>
            <span className="logout-icon">🛡️</span>
            <FormattedMessage id="admin.title" />
          </button>
        )}
        <button className="logout-button" onClick={() => dispatch(logout())}>
          <span className="logout-icon">↩</span>
          <FormattedMessage id="common.logout" />
        </button>
      </div>
    </div>
  )
}

export default HomeHeader
