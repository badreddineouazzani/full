import { FormattedMessage } from 'react-intl'
import { useAdminUsers } from '../hooks/useAdminUsers'

/** Summary cards: total users plus counts per role group. */
function AdminStats() {
  const { stats } = useAdminUsers()

  return (
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
  )
}

export default AdminStats
