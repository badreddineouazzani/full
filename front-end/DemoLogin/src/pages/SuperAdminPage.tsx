import { useEffect, useMemo } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  fetchRequest, setSearch, changeRoleRequest, togglePermissionRequest,
} from '../features/admin/adminSlice'
import { logout } from '../features/auth/authSlice'
import { ROLES, type Permission, type Role } from '../services/auth/roles'
import { useLocale, type Locale } from '../services/i18n'
import '../admin/Dashboard.css'

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
]

const PERMISSIONS: { key: Permission; labelId: string }[] = [
  { key: 'canAdd',    labelId: 'admin.perm.add'    },
  { key: 'canEdit',   labelId: 'admin.perm.edit'   },
  { key: 'canDelete', labelId: 'admin.perm.delete' },
]

interface SuperAdminPageProps {
  onBack: () => void
  onLoggedOut: () => void
}

function SuperAdminPage({ onBack, onLoggedOut }: SuperAdminPageProps) {
  const dispatch = useAppDispatch()
  const intl = useIntl()
  const { locale, setLocale } = useLocale()
  const { users, search, loading, error } = useAppSelector((s) => s.admin)

  useEffect(() => {
    dispatch(fetchRequest())
  }, [dispatch])

  const stats = useMemo(() => {
    const byRole: Record<Role, number> = { superadmin: 0, admin: 0, editor: 0, viewer: 0 }
    for (const u of users) byRole[u.role]++
    return { total: users.length, byRole }
  }, [users])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  }, [users, search])

  const handleLogout = () => { dispatch(logout()); onLoggedOut() }

  return (
    <section id="center">
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
          <button className="logout-button" onClick={onBack}>
            <span className="logout-icon">←</span>
            <FormattedMessage id="admin.back" />
          </button>
          <button className="logout-button" onClick={handleLogout}>
            <span className="logout-icon">↩</span>
            <FormattedMessage id="common.logout" />
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label"><FormattedMessage id="admin.stat.totalUsers" /></span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.byRole.admin + stats.byRole.superadmin}</span>
          <span className="stat-label"><FormattedMessage id="admin.stat.admins" /></span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.byRole.editor}</span>
          <span className="stat-label"><FormattedMessage id="admin.stat.editors" /></span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.byRole.viewer}</span>
          <span className="stat-label"><FormattedMessage id="admin.stat.viewers" /></span>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="text"
          placeholder={intl.formatMessage({ id: 'admin.searchPlaceholder' })}
          value={search}
          onChange={(e) => dispatch(setSearch(e.target.value))}
        />
        <button className="admin-invite-btn" type="button">
          ＋ <FormattedMessage id="admin.inviteUser" />
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th><FormattedMessage id="admin.col.user" /></th>
              <th><FormattedMessage id="admin.col.role" /></th>
              <th><FormattedMessage id="admin.col.permissions" /></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="admin-user-cell">
                    <span className="admin-avatar">{u.name.charAt(0)}</span>
                    <div>
                      <div className="admin-user-name">{u.name}</div>
                      <div className="admin-user-email">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <select
                    className={`role-select role-${u.role}`}
                    value={u.role}
                    onChange={(e) => dispatch(changeRoleRequest({ id: u.id, role: e.target.value as Role }))}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{intl.formatMessage({ id: `admin.role.${r}` })}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <div className="perm-toggles">
                    {PERMISSIONS.map((p) => (
                      <label key={p.key} className="perm-toggle">
                        <input
                          type="checkbox"
                          checked={u.permissions[p.key]}
                          onChange={() => dispatch(togglePermissionRequest({ id: u.id, perm: p.key }))}
                        />
                        <span className="perm-track"><span className="perm-thumb" /></span>
                        <span className="perm-name"><FormattedMessage id={p.labelId} /></span>
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <p className="empty-state"><FormattedMessage id="admin.loading" defaultMessage="Loading users…" /></p>
        )}
        {!loading && error && (
          <p className="empty-state">⚠️ {error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="empty-state"><FormattedMessage id="admin.noResults" /> 🤷</p>
        )}
      </div>
    </section>
  )
}

export default SuperAdminPage
