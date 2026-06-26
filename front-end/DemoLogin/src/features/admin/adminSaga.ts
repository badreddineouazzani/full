import { call, put, select, takeLatest, takeEvery } from 'redux-saga/effects'
import {
  fetchRequest, fetchSuccess, fetchFailure,
  changeRoleRequest,
  saveRoleRequest, saveRoleSuccess, saveRoleFailure,
  deleteUserRequest, deleteUserSuccess, deleteUserFailure,
  togglePermissionRequest,
  type AdminUser,
} from './adminSlice'
import { ROLE_DEFAULTS, type Role } from '../../services/auth/roles'
import { logout } from '../auth/authSlice'
import type { RootState } from '../../store'

const API = 'http://localhost:8080'

function getToken() {
  return localStorage.getItem('token') ?? ''
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeUser(raw: any): AdminUser {
  // UserResponse serializes `role` as a single authority string, e.g. "ROLE_ADMIN".
  // (Tolerate an older `roles` array shape too.)
  const authority: string =
    typeof raw.role === 'string'
      ? raw.role
      : Array.isArray(raw.roles) && typeof raw.roles[0] === 'string'
      ? raw.roles[0]
      : 'ROLE_VIEWER'
  const role: Role = authority === 'ROLE_SUPERADMIN'
    ? 'superadmin'
    : authority === 'ROLE_ADMIN'
    ? 'admin'
    : authority === 'ROLE_EDITOR'
    ? 'editor'
    : 'viewer'
  // Use the per-user permission flags from the backend; fall back to the role's
  // defaults only for older payloads that don't include them.
  const hasPerms =
    typeof raw.canAdd === 'boolean' ||
    typeof raw.canEdit === 'boolean' ||
    typeof raw.canDelete === 'boolean'
  const permissions = hasPerms
    ? { canAdd: raw.canAdd === true, canEdit: raw.canEdit === true, canDelete: raw.canDelete === true }
    : { ...ROLE_DEFAULTS[role] }
  return {
    id: raw.id,
    name: raw.username ?? raw.name ?? '',
    email: raw.email ?? '',
    role,
    permissions,
  }
}

function getCurrentUsername(): string | null {
  const token = getToken()
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}

async function apiFetch(): Promise<AdminUser[]> {
  const res = await fetch(`${API}/api/admin/users`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (res.status === 401) {
    localStorage.removeItem('token')
    throw new Error('__401__')
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const raw = await res.json()
  const currentUsername = getCurrentUsername()
  return raw
    .map(normalizeUser)
    .filter((u: AdminUser) => u.name !== currentUsername)
}

async function apiSaveUser(user: AdminUser): Promise<void> {
  // Backend: PUT /api/admin/users/{id} — persists the role and the individual
  // product permissions. Role is sent as the DB authority string, e.g. "ROLE_EDITOR".
  const res = await fetch(`${API}/api/admin/users/${user.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({
      role: `ROLE_${user.role.toUpperCase()}`,
      canAdd: user.permissions.canAdd,
      canEdit: user.permissions.canEdit,
      canDelete: user.permissions.canDelete,
    }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

async function apiDeleteUser(id: number): Promise<void> {
  const res = await fetch(`${API}/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

const selectUser = (id: number) => (state: RootState) =>
  state.admin.users.find((u) => u.id === id)

function* handleFetch() {
  try {
    const users: AdminUser[] = yield call(apiFetch)
    yield put(fetchSuccess(users))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch'
    if (msg === '__401__') yield put(logout())
    else yield put(fetchFailure(msg))
  }
}

function* handleSaveRole(action: ReturnType<typeof saveRoleRequest>) {
  const id = action.payload
  try {
    const user: AdminUser | undefined = yield select(selectUser(id))
    if (user) yield call(apiSaveUser, user)
    yield put(saveRoleSuccess(id))
  } catch (err) {
    yield put(saveRoleFailure({ id, message: err instanceof Error ? err.message : 'Failed to save' }))
  }
}

function* handleDeleteUser(action: ReturnType<typeof deleteUserRequest>) {
  const id = action.payload
  try {
    yield call(apiDeleteUser, id)
    yield put(deleteUserSuccess(id))
  } catch (err) {
    yield put(deleteUserFailure({ id, message: err instanceof Error ? err.message : 'Failed to delete' }))
  }
}

// Permissions are saved together with the role via the Save button (no separate
// backend call when toggling).
function* handleTogglePermission(_action: ReturnType<typeof togglePermissionRequest>) {
  // no-op saga: reducer already updated local state
}

// Keep role change in local state only (save is explicit via Save button)
function* handleChangeRole(_action: ReturnType<typeof changeRoleRequest>) {
  // no-op saga: reducer already updated local state
}

export function* watchAdmin() {
  yield takeLatest(fetchRequest.type, handleFetch)
  yield takeEvery(saveRoleRequest.type, handleSaveRole)
  yield takeEvery(deleteUserRequest.type, handleDeleteUser)
  yield takeEvery(changeRoleRequest.type, handleChangeRole)
  yield takeEvery(togglePermissionRequest.type, handleTogglePermission)
}
