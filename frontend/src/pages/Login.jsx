import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); const location = useLocation();
  async function submit(event) {
    event.preventDefault(); setError(''); setLoading(true);
    try { await api.post('/customers/login', { email, password }); navigate('/home', { replace: true }); }
    catch (_requestError) { setError('Invalid credentials'); }
    finally { setLoading(false); }
  }
  return <main className="auth-layout"><section className="auth-card"><p className="eyebrow">SHOPKART</p><h1>Welcome back</h1><p className="muted">Log in to see your account details.</p>{location.state?.message && <p className="success-message">{location.state.message}</p>}<form onSubmit={submit}>
    <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
    <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
    {error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</button>
  </form><p className="footnote">New to ShopKart? <Link to="/register">Create an account</Link></p></section></main>;
}
