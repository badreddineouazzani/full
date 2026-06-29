import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useAppDispatch } from '../store/hooks'
import { registerRequest } from '../features/auth/authSlice'
import { useAuthForm } from '../hooks/useAuthForm'
import { useNav } from '../hooks/useNav'
import AuthCard from '../components/AuthCard'
import AuthField from '../components/AuthField'
import AuthSwitch from '../components/AuthSwitch'

/** Sign-up page: username + password with confirmation, via the auth saga. */
function RegisterPage() {
  const dispatch = useAppDispatch()
  const intl = useIntl()
  const nav = useNav()
  const { values, setField, loading, error } = useAuthForm({
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [localError, setLocalError] = useState<string | null>(null)

  const passwordsMatch = values.password === values.confirmPassword
  const canSubmit = values.username.length > 0 && values.password.length > 0 && passwordsMatch

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordsMatch) {
      setLocalError(intl.formatMessage({ id: 'auth.register.passwordMismatch' }))
      return
    }
    setLocalError(null)
    dispatch(registerRequest({ username: values.username, password: values.password }))
  }

  return (
    <AuthCard
      icon="📝"
      titleId="auth.register.title"
      subtitleId="auth.register.subtitle"
      onSubmit={handleSubmit}
    >
      <AuthField
        labelId="auth.register.username"
        placeholderId="auth.register.usernamePlaceholder"
        value={values.username}
        onChange={setField('username')}
        autoComplete="username"
      />
      <AuthField
        labelId="auth.register.password"
        placeholderId="auth.register.passwordPlaceholder"
        type="password"
        value={values.password}
        onChange={setField('password')}
        autoComplete="new-password"
      />
      <AuthField
        labelId="auth.register.confirmPassword"
        placeholderId="auth.register.confirmPasswordPlaceholder"
        type="password"
        value={values.confirmPassword}
        onChange={setField('confirmPassword')}
        autoComplete="new-password"
      />

      {(localError || error) && <p className="login-error">{localError ?? error}</p>}

      <button type="submit" className="login-button" disabled={loading || !canSubmit}>
        {loading
          ? <FormattedMessage id="auth.register.submitting" />
          : <FormattedMessage id="auth.register.submit" />}
      </button>

      <AuthSwitch promptId="auth.register.haveAccount" linkId="auth.register.signIn" onClick={nav.login} />
    </AuthCard>
  )
}

export default RegisterPage
