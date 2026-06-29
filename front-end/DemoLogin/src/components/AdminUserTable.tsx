import { FormattedMessage, useIntl } from 'react-intl'
import { useAppDispatch } from '../store/hooks'
import { setSearch } from '../features/admin/adminSlice'
import { useAdminUsers } from '../hooks/useAdminUsers'
import { usePagination } from '../hooks/usePagination'
import AdminUserRow from './AdminUserRow'
import Pagination from './Pagination'

const USERS_PER_PAGE = 8

/** Searchable, paginated table of admin users with loading/error/empty states. */
function AdminUserTable() {
  const dispatch = useAppDispatch()
  const intl = useIntl()
  const { filtered, search, loading, error } = useAdminUsers()
  const { page, pageCount, pageItems, setPage } = usePagination(filtered, USERS_PER_PAGE, search)

  return (
    <>
      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="text"
          placeholder={intl.formatMessage({ id: 'admin.searchPlaceholder' })}
          value={search}
          onChange={(e) => dispatch(setSearch(e.target.value))}
        />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th><FormattedMessage id="admin.col.user" /></th>
              <th><FormattedMessage id="admin.col.role" /></th>
              <th><FormattedMessage id="admin.col.permissions" /></th>
              <th><FormattedMessage id="admin.col.actions" defaultMessage="Actions" /></th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((u) => <AdminUserRow key={u.id} user={u} />)}
          </tbody>
        </table>
        {loading && (
          <p className="empty-state"><FormattedMessage id="admin.loading" defaultMessage="Loading users…" /></p>
        )}
        {!loading && error && <p className="empty-state">⚠️ {error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="empty-state"><FormattedMessage id="admin.noResults" /> 🤷</p>
        )}
        {!loading && !error && (
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
        )}
      </div>
    </>
  )
}

export default AdminUserTable
