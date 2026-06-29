import { FormattedMessage, useIntl } from 'react-intl'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  changeRoleRequest, saveRoleRequest, togglePermissionRequest, deleteUserRequest,
  type AdminUser,
} from '../features/admin/adminSlice'
import { ROLES, type Permission, type Role } from '../services/auth/roles'
import { useCurrentUser } from '../services/auth/useCurrentUser'

const ALL_PERMISSIONS: { key: Permission; labelId: string }[] = [
  { key: 'canAdd',    labelId: 'admin.perm.add'    },
  { key: 'canEdit',   labelId: 'admin.perm.edit'   },
  { key: 'canDelete', labelId: 'admin.perm.delete' },
]

/** One editable user row: role dropdown, permission toggles, save and delete. */
function AdminUserRow({ user }: { user: AdminUser }) {
  const dispatch = useAppDispatch()
  const intl = useIntl()
  const { hasRole } = useCurrentUser()
  const saving = useAppSelector((s) => s.admin.saving[user.id] === true)
  const availableRoles = hasRole('superadmin') ? ROLES : ROLES.filter((r) => r !== 'superadmin')

  const handleDelete = () => {
    const msg = intl.formatMessage(
      { id: 'admin.confirmDelete', defaultMessage: 'Delete user "{name}"? This cannot be undone.' },
      { name: user.name }
    )
    if (window.confirm(msg)) dispatch(deleteUserRequest(user.id))
  }

  return (
    <tr>
      <td>
        <div className="admin-user-cell">
          <span className="admin-avatar">{user.name.charAt(0)}</span>
          <div className="admin-user-name">{user.name}</div>
        </div>
      </td>
      <td>
        <select
          className={`role-select role-${user.role}`}
          value={user.role}
          onChange={(e) => dispatch(changeRoleRequest({ id: user.id, role: e.target.value as Role }))}
        >
          {availableRoles.map((r) => (
            <option key={r} value={r}>{intl.formatMessage({ id: `admin.role.${r}` })}</option>
          ))}
        </select>
      </td>
      <td>
        <div className="perm-toggles">
          {ALL_PERMISSIONS.map((p) => (
            <label key={p.key} className="perm-toggle">
              <input
                type="checkbox"
                checked={user.permissions[p.key]}
                onChange={() => dispatch(togglePermissionRequest({ id: user.id, perm: p.key }))}
              />
              <span className="perm-track"><span className="perm-thumb" /></span>
              <span className="perm-name"><FormattedMessage id={p.labelId} /></span>
            </label>
          ))}
        </div>
      </td>
      <td>
        <div className="admin-row-actions">
          <button
            className="admin-save-btn"
            disabled={saving}
            onClick={() => dispatch(saveRoleRequest(user.id))}
          >
            {saving
              ? intl.formatMessage({ id: 'admin.saving', defaultMessage: 'Saving…' })
              : intl.formatMessage({ id: 'admin.save', defaultMessage: 'Save' })}
          </button>
          <button className="admin-delete-btn" disabled={saving} onClick={handleDelete}>
            {intl.formatMessage({ id: 'admin.delete', defaultMessage: 'Delete' })}
          </button>
        </div>
      </td>
    </tr>
  )
}

export default AdminUserRow
