import { call, put, select, takeLatest, takeEvery } from 'redux-saga/effects'
import {
  fetchRequest, fetchSuccess, fetchFailure,
  changeRoleRequest,
  saveRoleRequest, saveRoleSuccess, saveRoleFailure,
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
  const roles: string[] = Array.isArray(raw.roles) ? raw.roles : []
  const role: Role = roles.includes('ROLE_SUPERADMIN')
    ? 'superadmin'
    : roles.includes('ROLE_ADMIN')
    ? 'admin'
    : roles.includes('ROLE_EDITOR')
    ? 'editor'
    : 'viewer'
  return {
    id: raw.id,
    name: raw.username ?? raw.name ?? '',
    email: raw.email ?? '',
    role,
    permissions: { ...ROLE_DEFAULTS[role] },
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

async function apiSaveRole(id: number, role: Role): Promise<void> {
  const res = await fetch(`${API}/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ role }),
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
    if (user) yield call(apiSaveRole, id, user.role)
    yield put(saveRoleSuccess(id))
  } catch (err) {
    yield put(saveRoleFailure({ id, message: err instanceof Error ? err.message : 'Failed to save' }))
  }
}

// Keep permission toggle in local state only (no backend column yet)
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
  yield takeEvery(changeRoleRequest.type, handleChangeRole)
  yield takeEvery(togglePermissionRequest.type, handleTogglePermission)
}
