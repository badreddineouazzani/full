import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { ROLE_DEFAULTS, type Permission, type Role } from '../../services/auth/roles'

export interface AdminUser {
  id: number
  name: string
  email: string
  role: Role
  permissions: Record<Permission, boolean>
}

interface AdminState {
  users: AdminUser[]
  search: string
  loading: boolean
  error: string | null
}

const initialState: AdminState = {
  users: [],
  search: '',
  loading: false,
  error: null,
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    fetchRequest(state) {
      state.loading = true
      state.error = null
    },
    fetchSuccess(state, action: PayloadAction<AdminUser[]>) {
      state.loading = false
      state.users = action.payload
    },
    fetchFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },

    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
    },

    // Role change: optimistic update in the reducer, persisted by the saga.
    changeRoleRequest(state, action: PayloadAction<{ id: number; role: Role }>) {
      state.error = null
      const user = state.users.find((u) => u.id === action.payload.id)
      if (user) {
        user.role = action.payload.role
        user.permissions = { ...ROLE_DEFAULTS[action.payload.role] }
      }
    },
    changeRoleFailure(state, action: PayloadAction<string>) {
      state.error = action.payload
    },

    // Permission toggle: optimistic update in the reducer, persisted by the saga.
    togglePermissionRequest(state, action: PayloadAction<{ id: number; perm: Permission }>) {
      state.error = null
      const user = state.users.find((u) => u.id === action.payload.id)
      if (user) user.permissions[action.payload.perm] = !user.permissions[action.payload.perm]
    },
    togglePermissionFailure(state, action: PayloadAction<string>) {
      state.error = action.payload
    },
  },
})

export const {
  fetchRequest, fetchSuccess, fetchFailure,
  setSearch,
  changeRoleRequest, changeRoleFailure,
  togglePermissionRequest, togglePermissionFailure,
} = adminSlice.actions

export default adminSlice.reducer
