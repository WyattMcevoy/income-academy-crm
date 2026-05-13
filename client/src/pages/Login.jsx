import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await login(email, password);
      nav('/');
    } catch (e) {
      setErr(e.message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form-block">
        <p className="auth-eyebrow">Welcome back</p>
        <h2 className="auth-form-title">
          Sign in to <em>continue</em>.
        </h2>

        <form onSubmit={submit} className="auth-form" noValidate>
          <div className="auth-field">
            <label htmlFor="email" className="auth-label">Email</label>
            <input
              id="email"
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password" className="auth-label">Password</label>
            <input
              id="password"
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {err && <p className="auth-error">— {err}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            <span>{loading ? 'Signing in…' : 'Sign in'}</span>
            <span className="auth-submit-arrow" aria-hidden="true">→</span>
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/register" className="auth-link">Create an account</Link>.
        </p>
      </div>
    </AuthLayout>
  );
}
