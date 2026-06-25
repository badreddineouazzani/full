import { call, put, takeLatest } from 'redux-saga/effects'
import {
  loginRequest, loginSuccess, loginFailure,
  registerRequest, registerSuccess, registerFailure,
} from './authSlice'

const API = 'http://localhost:8080'

// Decode JWT and cache the role in localStorage so useCurrentUser
// survives a page refresh even when the JWT carries no explicit role claim.
function cacheRoleFromToken(token: string): void {
  try {
    const payload = JSON.parse(
      decodeURIComponent(escape(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))))
    )
    // Handle role / roles / authorities (Spring style)
    let rawRole: string | null = null
    if (typeof payload.role === 'string') {
      rawRole = payload.role
    } else {
      const list = payload.roles ?? payload.authorities
      if (Array.isArray(list)) {
        for (const item of list) {
          const v = typeof item === 'string' ? item : item?.authority
          if (typeof v === 'string') { rawRole = v; break }
        }
      }
    }
    if (!rawRole) return
    const normalized = rawRole.replace(/^ROLE_/i, '').toLowerCase()
    const role = normalized === 'superadmin' ? 'superadmin'
      : normalized === 'admin' ? 'admin'
      : normalized === 'editor' ? 'editor'
      : 'viewer'
    localStorage.setItem('userRole', role)
  } catch {
    // malformed token — leave cache untouched
  }
}

async function apiLogin(username: string, password: string): Promise<string> {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error('Invalid username or password')
  const data: { token: string } = await res.json()
  return data.token
}

async function apiRegister(username: string, password: string): Promise<string> {
  const res = await fetch(`${API}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error('Registration failed')
  const data: { token: string } = await res.json()
  return data.token
}

function* handleLogin(action: ReturnType<typeof loginRequest>) {
  try {
    const token: string = yield call(apiLogin, action.payload.username, action.payload.password)
    cacheRoleFromToken(token)
    yield put(loginSuccess(token))
  } catch (err) {
    yield put(loginFailure(err instanceof Error ? err.message : 'Something went wrong'))
  }
}

function* handleRegister(action: ReturnType<typeof registerRequest>) {
  try {
    const token: string = yield call(apiRegister, action.payload.username, action.payload.password)
    cacheRoleFromToken(token)
    yield put(registerSuccess(token))
  } catch (err) {
    yield put(registerFailure(err instanceof Error ? err.message : 'Something went wrong'))
  }
}

export function* watchAuth() {
  yield takeLatest(loginRequest.type, handleLogin)
  yield takeLatest(registerRequest.type, handleRegister)
}
