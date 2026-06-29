import { FormattedMessage } from 'react-intl'
import { useAppDispatch } from '../store/hooks'
import { logout } from '../features/auth/authSlice'
import { useLocale, type Locale } from '../services/i18n'
import { useNav } from '../hooks/useNav'

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
]

/** Dashboard title plus the language switch, back-to-home and logout controls. */
function AdminHeader() {
  const dispatch = useAppDispatch()
  const nav = useNav()
  const { locale, setLocale } = useLocale()

  return (
    <div className="page-header">
      <div className="admin-title">
        <h1>🛡️ <FormattedMessage id="admin.title" /></h1>
        <p className="admin-subtitle"><FormattedMessage id="admin.subtitle" /></p>
      </div>
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
        <button className="logout-button" onClick={nav.home}>
          <span className="logout-icon">←</span>
          <FormattedMessage id="admin.back" />
        </button>
        <button className="logout-button" onClick={() => dispatch(logout())}>
          <span className="logout-icon">↩</span>
          <FormattedMessage id="common.logout" />
        </button>
      </div>
    </div>
  )
}

export default AdminHeader
