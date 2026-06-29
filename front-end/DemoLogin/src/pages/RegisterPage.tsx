import { useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { registerRequest, clearError } from '../features/auth/authSlice'
import { useNav } from '../hooks/useNav'

function RegisterPage() {
  const dispatch = useAppDispatch()
  const intl = useIntl()
  const nav = useNav()
  const { loading, error } = useAppSelector((s) => s.auth)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const passwordsMatch = password === confirmPassword
  const canSubmit = username.length > 0 && password.length > 0 && passwordsMatch

  useEffect(() => () => { dispatch(clearError()) }, [dispatch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordsMatch) {
      setLocalError(intl.formatMessage({ id: 'auth.register.passwordMismatch' }))
      return
    }
    setLocalError(null)
    dispatch(registerRequest({ username, password }))
  }

  return (
    <div className="login-wrapper">
      <form className="login-box" onSubmit={handleSubmit}>
        <div className="login-header">
          <span className="login-icon">📝</span>
          <h1><FormattedMessage id="auth.register.title" /></h1>
          <p className="login-subtitle"><FormattedMessage id="auth.register.subtitle" /></p>
        </div>

        <label className="login-field">
          <span><FormattedMessage id="auth.register.username" /></span>
          <input
            type="text"
            placeholder={intl.formatMessage({ id: 'auth.register.usernamePlaceholder' })}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>

        <label className="login-field">
          <span><FormattedMessage id="auth.register.password" /></span>
          <input
            type="password"
            placeholder={intl.formatMessage({ id: 'auth.register.passwordPlaceholder' })}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        <label className="login-field">
          <span><FormattedMessage id="auth.register.confirmPassword" /></span>
          <input
            type="password"
            placeholder={intl.formatMessage({ id: 'auth.register.confirmPasswordPlaceholder' })}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        {(localError || error) && <p className="login-error">{localError ?? error}</p>}

        <button type="submit" className="login-button" disabled={loading || !canSubmit}>
          {loading
            ? <FormattedMessage id="auth.register.submitting" />
            : <FormattedMessage id="auth.register.submit" />}
        </button>

        <p className="auth-switch">
          <FormattedMessage id="auth.register.haveAccount" />{' '}
          <button type="button" className="auth-switch-link" onClick={nav.login}>
            <FormattedMessage id="auth.register.signIn" />
          </button>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage
