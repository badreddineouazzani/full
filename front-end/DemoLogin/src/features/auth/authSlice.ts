import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface AuthState {
  token: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest(state, _action: PayloadAction<{ username: string; password: string }>) {
      state.loading = true
      state.error = null
    },
    loginSuccess(state, action: PayloadAction<string>) {
      state.loading = false
      state.token = action.payload
      localStorage.setItem('token', action.payload)
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },

    registerRequest(state, _action: PayloadAction<{ username: string; password: string }>) {
      state.loading = true
      state.error = null
    },
    registerSuccess(state, action: PayloadAction<string>) {
      state.loading = false
      state.token = action.payload
      localStorage.setItem('token', action.payload)
    },
    registerFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },

    logout(state) {
      state.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
    },

    clearError(state) {
      state.error = null
    },
  },
})

export const {
  loginRequest, loginSuccess, loginFailure,
  registerRequest, registerSuccess, registerFailure,
  logout, clearError,
} = authSlice.actions

export default authSlice.reducer
