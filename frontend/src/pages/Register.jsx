import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';

const initialForm = { fullName: '', email: '', password: '', phone: '' };

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function submit(event) {
    event.preventDefault(); setError('');
    if (Object.values(form).some((value) => !value.trim())) return setError('Please complete every field.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try { await api.post('/customers/register', form); navigate('/login', { state: { message: 'Account created. Please log in.' } }); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not create your account.'); }
    finally { setLoading(false); }
  }

  return <main className="auth-layout"><section className="auth-card"><p className="eyebrow">SHOPKART</p><h1>Create your account</h1><p className="muted">Start shopping with a single, secure account.</p><form onSubmit={submit} noValidate>
    <label>Full name<input name="fullName" value={form.fullName} onChange={update} autoComplete="name" /></label>
    <label>Email<input name="email" type="email" value={form.email} onChange={update} autoComplete="email" /></label>
    <label>Password<input name="password" type="password" value={form.password} onChange={update} autoComplete="new-password" /></label>
    <label>Phone number<input name="phone" type="tel" value={form.phone} onChange={update} autoComplete="tel" /></label>
    {error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
  </form><p className="footnote">Already have an account? <Link to="/login">Log in</Link></p></section></main>;
}
