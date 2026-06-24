import { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginRequest, clearError } from '../features/auth/authSlice'

interface LoginPageProps {
  onLoginSuccess: () => void
  onSwitchToRegister: () => void
}

function LoginPage({ onLoginSuccess, onSwitchToRegister }: LoginPageProps) {
  const dispatch = useAppDispatch()
  const { loading, error, token } = useAppSelector((s) => s.auth)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (token) onLoginSuccess()
  }, [token, onLoginSuccess])

  useEffect(() => () => { dispatch(clearError()) }, [dispatch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(loginRequest({ username, password }))
  }

  return (
    <div className="login-wrapper">
      <form className="login-box" onSubmit={handleSubmit}>
        <div className="login-header">
          <span className="login-icon">🔐</span>
          <h1>Sign in</h1>
          <p className="login-subtitle">Welcome back, please enter your details</p>
        </div>

        <label className="login-field">
          <span>Username</span>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>

        <label className="login-field">
          <span>Password</span>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {error && <p className="login-error">{error}</p>}

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="auth-switch">
          <FormattedMessage id="auth.login.noAccount" />{' '}
          <button type="button" className="auth-switch-link" onClick={onSwitchToRegister}>
            <FormattedMessage id="auth.login.signUp" />
          </button>
        </p>
      </form>
    </div>
  )
}

export default LoginPage
