import { FormattedMessage } from 'react-intl'

interface AuthCardProps {
  icon: string
  titleId: string
  subtitleId: string
  onSubmit: (e: React.FormEvent) => void
  children: React.ReactNode
}

/** Shared shell for the auth pages: a centered card with an icon/title header. */
function AuthCard({ icon, titleId, subtitleId, onSubmit, children }: AuthCardProps) {
  return (
    <div className="login-wrapper">
      <form className="login-box" onSubmit={onSubmit}>
        <div className="login-header">
          <span className="login-icon">{icon}</span>
          <h1><FormattedMessage id={titleId} /></h1>
          <p className="login-subtitle"><FormattedMessage id={subtitleId} /></p>
        </div>
        {children}
      </form>
    </div>
  )
}

export default AuthCard
