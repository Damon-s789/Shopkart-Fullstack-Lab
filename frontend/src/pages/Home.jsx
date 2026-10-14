import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import api from '../services/api.js';

export default function Home() {
  const [customer, setCustomer] = useState(null); const navigate = useNavigate();
  useEffect(() => { let active = true; api.get('/customers/me').then((response) => { if (active) setCustomer(response.data); }).catch(() => navigate('/login', { replace: true })); return () => { active = false; }; }, [navigate]);
  if (!customer) return <main className="loading">Checking your account…</main>;
  return <><Navbar /><main className="home-layout"><p className="eyebrow">YOUR SHOPKART ACCOUNT</p><h1>Welcome, {customer.fullName.split(' ')[0]}.</h1><p className="muted">You are logged in securely with an HttpOnly cookie. Browse the latest products whenever you are ready.</p><Link className="primary-link" to="/products">Browse products</Link><section className="profile-card"><h2>Customer profile</h2><dl><div><dt>Full name</dt><dd>{customer.fullName}</dd></div><div><dt>Email</dt><dd>{customer.email}</dd></div><div><dt>Phone number</dt><dd>{customer.phone}</dd></div></dl></section></main></>;
}
