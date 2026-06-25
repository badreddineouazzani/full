import { useEffect, useMemo, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useLocale, type Locale } from '../services/i18n'
import { ROLES, ROLE_DEFAULTS, type Permission, type Role } from '../services/auth/roles'
import './Dashboard.css'

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
];

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  permissions: Record<Permission, boolean>;
}

const PERMISSIONS: { key: Permission; labelId: string }[] = [
  { key: 'canAdd',    labelId: 'admin.perm.add'    },
  { key: 'canEdit',   labelId: 'admin.perm.edit'   },
  { key: 'canDelete', labelId: 'admin.perm.delete' },
];

const API_BASE = 'http://localhost:8080';

function normalizeUser(raw: Record<string, unknown>): AdminUser {
  // Backend sends roles as ["ROLE_ADMIN"] or ["ROLE_USER"]
  let role: Role = 'viewer';
  const roles = Array.isArray(raw.roles) ? raw.roles : [];
  if (roles.includes('ROLE_ADMIN')) role = 'admin';

  return {
    id: raw.id as number,
    name: (raw.username ?? '') as string,
    email: '',
    role,
    permissions: ROLE_DEFAULTS[role],
  };
}

interface SuperAdminDashboardProps {
  onBack: () => void;
  onLoggedOut: () => void;
}

function SuperAdminDashboard({ onBack, onLoggedOut }: SuperAdminDashboardProps) {
  const intl = useIntl();
  const { locale, setLocale } = useLocale();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) { localStorage.removeItem('token'); onLoggedOut(); throw new Error('401'); }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Record<string, unknown>[]>;
      })
      .then((data) => setUsers(data.map(normalizeUser)))
      .catch((err: Error) => { if (err.message !== '401') setError(err.message); })
      .finally(() => setLoading(false));
  }, [onLoggedOut]);

  const changeRole = (id: number, role: Role) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, role, permissions: { ...ROLE_DEFAULTS[role] } } : u
      )
    );
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role }),
    }).catch(() => {});
  };

  const togglePermission = (id: number, perm: Permission) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const permissions = { ...u.permissions, [perm]: !u.permissions[perm] };
        const token = localStorage.getItem('token');
        fetch(`${API_BASE}/api/admin/users/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ permissions }),
        }).catch(() => {});
        return { ...u, permissions };
      })
    );
  };

  const stats = useMemo(() => {
    const byRole: Record<Role, number> = { superadmin: 0, admin: 0, editor: 0, viewer: 0 };
    for (const u of users) byRole[u.role]++;
    return { total: users.length, byRole };
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

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
          <button
            className="logout-button"
            onClick={() => { localStorage.removeItem("token"); onLoggedOut(); }}
          >
            <span className="logout-icon">↩</span>
            <FormattedMessage id="common.logout" />
          </button>
        </div>
      </div>

      {/* Stat cards */}
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

      {/* Toolbar */}
      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="text"
          placeholder={intl.formatMessage({ id: 'admin.searchPlaceholder' })}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* TODO: open an invite-user modal and POST /api/admin/users */}
        <button className="admin-invite-btn" type="button">
          ＋ <FormattedMessage id="admin.inviteUser" />
        </button>
      </div>

      {/* Users table */}
      {loading && <p className="empty-state">Loading users…</p>}
      {error && <p className="empty-state" style={{ color: 'red' }}>Failed to load users: {error}</p>}
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
                    <div className="admin-user-name">{u.name}</div>
                  </div>
                </td>
                <td>
                  <select
                    className={`role-select role-${u.role}`}
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value as Role)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {intl.formatMessage({ id: `admin.role.${r}` })}
                      </option>
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
                          onChange={() => togglePermission(u.id, p.key)}
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

        {filtered.length === 0 && (
          <p className="empty-state"><FormattedMessage id="admin.noResults" /> 🤷</p>
        )}
      </div>
    </section>
  );
}

export default SuperAdminDashboard;
