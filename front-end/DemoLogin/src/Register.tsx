import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from "react-router-dom";

interface RegisterProps {
  onRegisterSuccess: () => void;   // callback: notify App when account is created
  onSwitchToLogin: () => void;     // callback: go back to the login view
}

function Register({ onRegisterSuccess, onSwitchToLogin }: RegisterProps) {
  const intl = useIntl();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Derive validation state during render instead of mirroring it into state.
  const passwordsMatch = password === confirmPassword;
  const canSubmit = username.length > 0 && password.length > 0 && passwordsMatch;
  const navigate = useNavigate();


  const handleRegister = async () => {
    // Cheap synchronous check before doing any async work.
    if (!passwordsMatch) {
      setError(intl.formatMessage({ id: 'auth.register.passwordMismatch' }));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error(intl.formatMessage({ id: 'auth.register.error' }));
      }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      navigate("/en/");
      onRegisterSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : intl.formatMessage({ id: 'auth.register.error' })
      );
    } finally {
      setLoading(false);
    }
  };
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRegister();
  };

  return (
    <div className="login-wrapper">
      <form className="login-box" onSubmit={handleSubmit}>
        <div className="login-header">
          <span className="login-icon">📝</span>
          <h1><FormattedMessage id="auth.register.title" /></h1>
          <p className="login-subtitle">
            <FormattedMessage id="auth.register.subtitle" />
          </p>
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

        {error && <p className="login-error">{error}</p>}

        <button type="submit" className="login-button" disabled={loading || !canSubmit}>
          {loading
            ? <FormattedMessage id="auth.register.submitting" />
            : <FormattedMessage id="auth.register.submit" />}
        </button>

        <p className="auth-switch">
          <FormattedMessage id="auth.register.haveAccount" />{' '}
          <button type="button" className="auth-switch-link" onClick={onSwitchToLogin}>
            <FormattedMessage id="auth.register.signIn" />
          </button>
        </p>
      </form>
    </div>
  );
}

export default Register;