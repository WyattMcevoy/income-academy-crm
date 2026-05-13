import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await register(email, password, name);
      nav('/');
    } catch (e) {
      setErr(e.message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form-block">
        <p className="auth-eyebrow">Start free</p>
        <h2 className="auth-form-title">
          Create your <em>account</em>.
        </h2>

        <form onSubmit={submit} className="auth-form" noValidate>
          <div className="auth-field">
            <label htmlFor="name" className="auth-label">Name</label>
            <input
              id="name"
              type="text"
              className="auth-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              autoFocus
            />
          </div>

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
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password" className="auth-label">
              Password <span className="auth-hint">8+ characters</span>
            </label>
            <input
              id="password"
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {err && <p className="auth-error">— {err}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            <span>{loading ? 'Creating…' : 'Create account'}</span>
            <span className="auth-submit-arrow" aria-hidden="true">→</span>
          </button>
        </form>

        <p className="auth-switch">
          Already a member? <Link to="/login" className="auth-link">Sign in</Link>.
        </p>
      </div>
    </AuthLayout>
  );
}
