import { FormattedMessage } from 'react-intl'

interface AuthSwitchProps {
  promptId: string
  linkId: string
  onClick: () => void
}

/** Bottom-of-card prompt that toggles between the login and register pages. */
function AuthSwitch({ promptId, linkId, onClick }: AuthSwitchProps) {
  return (
    <p className="auth-switch">
      <FormattedMessage id={promptId} />{' '}
      <button type="button" className="auth-switch-link" onClick={onClick}>
        <FormattedMessage id={linkId} />
      </button>
    </p>
  )
}

export default AuthSwitch
