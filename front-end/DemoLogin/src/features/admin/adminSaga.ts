import { call, put, select, takeLatest, takeEvery } from 'redux-saga/effects'
import {
  fetchRequest, fetchSuccess, fetchFailure,
  changeRoleRequest, changeRoleFailure,
  togglePermissionRequest, togglePermissionFailure,
  type AdminUser,
} from './adminSlice'
import { logout } from '../auth/authSlice'
import type { RootState } from '../../store'

const API = 'http://localhost:8080'

function getToken() {
  return localStorage.getItem('token') ?? ''
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
  return res.json()
}

async function apiPatch(user: AdminUser): Promise<void> {
  const res = await fetch(`${API}/api/admin/users/${user.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ role: user.role, permissions: user.permissions }),
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

// The reducer has already applied the optimistic change, so we read the
// updated user back out of the store and persist it. On failure we refetch to
// resync with the backend.
function* handleChangeRole(action: ReturnType<typeof changeRoleRequest>) {
  try {
    const user: AdminUser | undefined = yield select(selectUser(action.payload.id))
    if (user) yield call(apiPatch, user)
  } catch (err) {
    yield put(changeRoleFailure(err instanceof Error ? err.message : 'Failed to update role'))
    yield put(fetchRequest())
  }
}

function* handleTogglePermission(action: ReturnType<typeof togglePermissionRequest>) {
  try {
    const user: AdminUser | undefined = yield select(selectUser(action.payload.id))
    if (user) yield call(apiPatch, user)
  } catch (err) {
    yield put(togglePermissionFailure(err instanceof Error ? err.message : 'Failed to update permission'))
    yield put(fetchRequest())
  }
}

export function* watchAdmin() {
  yield takeLatest(fetchRequest.type, handleFetch)
  yield takeEvery(changeRoleRequest.type, handleChangeRole)
  yield takeEvery(togglePermissionRequest.type, handleTogglePermission)
}
