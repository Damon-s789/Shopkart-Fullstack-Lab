import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import api from '../services/api.js';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export default function Orders() {
  const [orders, setOrders] = useState([]); const [state, setState] = useState({ loading: true, error: '' }); const navigate = useNavigate();
  const loadOrders = useCallback(() => { setState({ loading: true, error: '' }); api.get('/orders').then((response) => { setOrders(response.data.orders); setState({ loading: false, error: '' }); }).catch((error) => { if (error.response?.status === 401) navigate('/login', { replace: true }); else setState({ loading: false, error: 'Unable to load your orders.' }); }); }, [navigate]);
  useEffect(() => { loadOrders(); }, [loadOrders]);
  return <><Navbar /><main className="catalog-layout"><p className="eyebrow">ORDER HISTORY</p><h1>My Orders</h1>{state.loading ? <p className="status-message">Loading your orders...</p> : state.error ? <section className="wishlist-state"><h2>Unable to load your orders.</h2><button className="primary-button" onClick={loadOrders}>Try again</button></section> : orders.length === 0 ? <section className="wishlist-state"><h2>You have not placed any orders yet.</h2><Link className="primary-link" to="/products">Start Shopping</Link></section> : <section className="orders-list">{orders.map((order) => <article className="order-card" key={order._id}><div><p className="product-category">Order #{order._id.slice(-8)}</p><h2>{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</h2><p>{order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</p></div><div className="order-card-side"><strong>{currency.format(order.totalAmount)}</strong><span className="order-status">{order.status}</span><Link to={`/order-success/${order._id}`}>View details</Link></div></article>)}</section>}</main></>;
}
