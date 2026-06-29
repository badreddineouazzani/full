import { FormattedMessage, useIntl } from 'react-intl'

interface AuthFieldProps {
  labelId: string
  placeholderId: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  autoComplete?: string
}

/** One labelled text input shared by the login / register forms. */
function AuthField({ labelId, placeholderId, type = 'text', value, onChange, autoComplete }: AuthFieldProps) {
  const intl = useIntl()
  return (
    <label className="login-field">
      <span><FormattedMessage id={labelId} /></span>
      <input
        type={type}
        placeholder={intl.formatMessage({ id: placeholderId })}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />
    </label>
  )
}

export default AuthField
