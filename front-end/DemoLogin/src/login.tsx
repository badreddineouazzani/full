import { useState } from 'react'
import { FormattedMessage } from 'react-intl'

interface LoginProps {
  onLoginSuccess: () => void;     // callback: notify App when login succeeds
  onSwitchToRegister: () => void; // callback: go to the register view
}

function Login({ onLoginSuccess, onSwitchToRegister }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await res.json();        // { token: "eyJ..." }
      localStorage.setItem("token", data.token);   // store token
      onLoginSuccess();                     // notify App: "logged in!"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };
  

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
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="auth-switch">
          <FormattedMessage id="auth.login.noAccount" />{' '}
          <button type="button" className="auth-switch-link" onClick={onSwitchToRegister}>
            <FormattedMessage id="auth.login.signUp" />
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;