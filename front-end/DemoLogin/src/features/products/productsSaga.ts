import { call, put, takeLatest, all } from 'redux-saga/effects'
import {
  fetchRequest, fetchSuccess, fetchFailure,
  addRequest, addSuccess, addFailure,
  editRequest, editSuccess, editFailure,
  deleteRequest, deleteSuccess, deleteFailure,
  deleteManyRequest, deleteManySuccess, deleteManyFailure,
  type Produit,
} from './productsSlice'
import { logout } from '../auth/authSlice'

const API = 'http://localhost:8080'

function getToken() {
  return localStorage.getItem('token') ?? ''
}

async function apiFetch(): Promise<Produit[]> {
  const res = await fetch(`${API}/products`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (res.status === 401) {
    localStorage.removeItem('token')
    throw new Error('__401__')
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function apiAdd(namePr: string, categoryId: number): Promise<void> {
  const res = await fetch(`${API}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ namePr, category: { id: categoryId } }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

async function apiEdit(id: number, namePr: string, categoryId: number): Promise<void> {
  const res = await fetch(`${API}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ namePr, category: { id: categoryId } }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

async function apiDelete(id: number): Promise<void> {
  const res = await fetch(`${API}/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

function* handleFetch() {
  try {
    const items: Produit[] = yield call(apiFetch)
    yield put(fetchSuccess(items))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch'
    if (msg === '__401__') yield put(logout())
    else yield put(fetchFailure(msg))
  }
}

function* handleAdd(action: ReturnType<typeof addRequest>) {
  try {
    yield call(apiAdd, action.payload.namePr, action.payload.categoryId)
    yield put(addSuccess())
    yield put(fetchRequest())
  } catch (err) {
    yield put(addFailure(err instanceof Error ? err.message : 'Failed to add'))
  }
}

function* handleEdit(action: ReturnType<typeof editRequest>) {
  try {
    yield call(apiEdit, action.payload.id, action.payload.namePr, action.payload.categoryId)
    yield put(editSuccess())
    yield put(fetchRequest())
  } catch (err) {
    yield put(editFailure(err instanceof Error ? err.message : 'Failed to update'))
  }
}

function* handleDelete(action: ReturnType<typeof deleteRequest>) {
  try {
    yield call(apiDelete, action.payload)
    yield put(deleteSuccess(action.payload))
  } catch (err) {
    yield put(deleteFailure(err instanceof Error ? err.message : 'Failed to delete'))
  }
}

function* handleDeleteMany(action: ReturnType<typeof deleteManyRequest>) {
  try {
    yield all(action.payload.map((id) => call(apiDelete, id)))
    yield put(deleteManySuccess(action.payload))
  } catch (err) {
    yield put(deleteManyFailure(err instanceof Error ? err.message : 'Failed to delete'))
  }
}

export function* watchProducts() {
  yield takeLatest(fetchRequest.type, handleFetch)
  yield takeLatest(addRequest.type, handleAdd)
  yield takeLatest(editRequest.type, handleEdit)
  yield takeLatest(deleteRequest.type, handleDelete)
  yield takeLatest(deleteManyRequest.type, handleDeleteMany)
}
