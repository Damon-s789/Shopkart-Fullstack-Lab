import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import api from '../services/api.js';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export default function OrderSuccess() {
  const { id } = useParams(); const location = useLocation(); const [order, setOrder] = useState(location.state?.order ?? null); const [error, setError] = useState('');
  useEffect(() => { if (order) return; api.get(`/orders/${id}`).then((response) => setOrder(response.data.order)).catch(() => setError('Unable to load this order.')); }, [id, order]);
  return <><Navbar /><main className="catalog-layout">{error ? <p className="form-error">{error}</p> : !order ? <p className="status-message">Loading order...</p> : <section className="order-success"><p className="success-icon">✓</p><p className="eyebrow">PAYMENT VERIFIED</p><h1>Order placed successfully</h1><p>Your order has been saved successfully.</p><dl><div><dt>Order ID</dt><dd>{order._id}</dd></div><div><dt>Total</dt><dd>{currency.format(order.totalAmount)}</dd></div><div><dt>Status</dt><dd>{order.status}</dd></div></dl><div className="success-actions"><Link className="primary-link" to="/orders">View My Orders</Link><Link to="/products">Continue Shopping</Link></div></section>}</main></>;
}
