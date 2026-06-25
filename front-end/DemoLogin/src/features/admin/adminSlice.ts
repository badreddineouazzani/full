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
  saving: Record<number, boolean>
}

const initialState: AdminState = {
  users: [],
  search: '',
  loading: false,
  error: null,
  saving: {},
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

    changeRoleRequest(state, action: PayloadAction<{ id: number; role: Role }>) {
      state.error = null
      const user = state.users.find((u) => u.id === action.payload.id)
      if (user) {
        user.role = action.payload.role
        user.permissions = { ...ROLE_DEFAULTS[action.payload.role] }
      }
    },

    saveRoleRequest(state, action: PayloadAction<number>) {
      state.saving[action.payload] = true
      state.error = null
    },
    saveRoleSuccess(state, action: PayloadAction<number>) {
      state.saving[action.payload] = false
    },
    saveRoleFailure(state, action: PayloadAction<{ id: number; message: string }>) {
      state.saving[action.payload.id] = false
      state.error = action.payload.message
    },

    togglePermissionRequest(state, action: PayloadAction<{ id: number; perm: Permission }>) {
      state.error = null
      const user = state.users.find((u) => u.id === action.payload.id)
      if (!user) return
      user.permissions[action.payload.perm] = !user.permissions[action.payload.perm]
      // Sync role from permissions (superadmin is only set via dropdown, never by toggles)
      if (user.role !== 'superadmin') {
        const { canAdd, canEdit, canDelete } = user.permissions
        if (!canAdd && !canEdit && !canDelete) user.role = 'viewer'
        else if (canAdd && canEdit && canDelete) user.role = 'admin'
        else user.role = 'editor'
      }
    },
  },
})

export const {
  fetchRequest, fetchSuccess, fetchFailure,
  setSearch,
  changeRoleRequest,
  saveRoleRequest, saveRoleSuccess, saveRoleFailure,
  togglePermissionRequest,
} = adminSlice.actions

export default adminSlice.reducer
