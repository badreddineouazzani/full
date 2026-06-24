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
}

// TODO: replace with GET /api/admin/users once the backend is ready.
const MOCK_USERS: AdminUser[] = [
  { id: 1, name: 'Sara Idrissi',    email: 'sara@example.com',    role: 'superadmin', permissions: ROLE_DEFAULTS.superadmin },
  { id: 2, name: 'Youssef Alami',   email: 'youssef@example.com', role: 'admin',      permissions: ROLE_DEFAULTS.admin },
  { id: 3, name: 'Lina Benani',     email: 'lina@example.com',    role: 'editor',     permissions: ROLE_DEFAULTS.editor },
  { id: 4, name: 'Omar Fassi',      email: 'omar@example.com',    role: 'editor',     permissions: { canAdd: true, canEdit: false, canDelete: false } },
  { id: 5, name: 'Nadia Cherkaoui', email: 'nadia@example.com',   role: 'viewer',     permissions: ROLE_DEFAULTS.viewer },
]

const initialState: AdminState = {
  users: MOCK_USERS,
  search: '',
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
    },
    // TODO: dispatch these then PATCH /api/admin/users/:id when wiring the backend.
    changeRole(state, action: PayloadAction<{ id: number; role: Role }>) {
      const user = state.users.find((u) => u.id === action.payload.id)
      if (user) {
        user.role = action.payload.role
        user.permissions = { ...ROLE_DEFAULTS[action.payload.role] }
      }
    },
    togglePermission(state, action: PayloadAction<{ id: number; perm: Permission }>) {
      const user = state.users.find((u) => u.id === action.payload.id)
      if (user) user.permissions[action.payload.perm] = !user.permissions[action.payload.perm]
    },
  },
})

export const { setSearch, changeRole, togglePermission } = adminSlice.actions
export default adminSlice.reducer
