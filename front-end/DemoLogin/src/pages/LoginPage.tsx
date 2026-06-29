import { FormattedMessage } from 'react-intl'
import { useAppDispatch } from '../store/hooks'
import { loginRequest } from '../features/auth/authSlice'
import { useAuthForm } from '../hooks/useAuthForm'
import { useNav } from '../hooks/useNav'
import AuthCard from '../components/AuthCard'
import AuthField from '../components/AuthField'
import AuthSwitch from '../components/AuthSwitch'

/** Sign-in page: username + password, delegated to the auth saga via Redux. */
function LoginPage() {
  const dispatch = useAppDispatch()
  const nav = useNav()
  const { values, setField, loading, error } = useAuthForm({ username: '', password: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(loginRequest(values))
  }

  return (
    <AuthCard
      icon="🔐"
      titleId="auth.login.title"
      subtitleId="auth.login.subtitle"
      onSubmit={handleSubmit}
    >
      <AuthField
        labelId="auth.login.username"
        placeholderId="auth.login.usernamePlaceholder"
        value={values.username}
        onChange={setField('username')}
        autoComplete="username"
      />
      <AuthField
        labelId="auth.login.password"
        placeholderId="auth.login.passwordPlaceholder"
        type="password"
        value={values.password}
        onChange={setField('password')}
        autoComplete="current-password"
      />

      {error && <p className="login-error">{error}</p>}

      <button type="submit" className="login-button" disabled={loading}>
        {loading
          ? <FormattedMessage id="auth.login.submitting" />
          : <FormattedMessage id="auth.login.submit" />}
      </button>

      <AuthSwitch promptId="auth.login.noAccount" linkId="auth.login.signUp" onClick={nav.register} />
    </AuthCard>
  )
}

export default LoginPage
