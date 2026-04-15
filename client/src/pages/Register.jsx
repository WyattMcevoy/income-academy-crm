import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await register(email, password, name);
      nav('/');
    } catch (e) { setErr(e.message); }
  };

  return (
    <div className="auth-card">
      <h1>Create account</h1>
      <form onSubmit={submit}>
        <label>Name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} /></label>
        {err && <p className="error">{err}</p>}
        <button type="submit">Register</button>
      </form>
      <p>Already have one? <Link to="/login">Log in</Link></p>
    </div>
  );
}
