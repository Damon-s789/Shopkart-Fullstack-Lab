import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useCart } from '../context/CartContext.jsx';
import api from '../services/api.js';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const initialAddress = { fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '' };
const fields = { fullName: 'Full name', phone: 'Phone number', addressLine1: 'Address line', city: 'City', state: 'State', pincode: 'Pincode' };

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => { const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.onload = () => resolve(true); script.onerror = () => resolve(false); document.body.appendChild(script); });
}

export default function Checkout() {
  const { cartItems, totalUnits, subtotal, loading, clearCartState } = useCart();
  const [address, setAddress] = useState(initialAddress); const [errors, setErrors] = useState({}); const [submitting, setSubmitting] = useState(false); const [message, setMessage] = useState(''); const navigate = useNavigate();
  const update = (event) => setAddress({ ...address, [event.target.name]: event.target.value });
  function validate() { const next = {}; Object.entries(address).forEach(([key, value]) => { if (!value.trim()) next[key] = 'This field is required.'; }); if (address.phone.trim() && !/^\d{10}$/.test(address.phone.trim())) next.phone = 'Phone number must contain 10 digits.'; if (address.pincode.trim() && !/^\d{6}$/.test(address.pincode.trim())) next.pincode = 'Pincode must contain 6 digits.'; setErrors(next); return Object.keys(next).length === 0; }
  async function submit(event) {
    event.preventDefault(); setMessage(''); if (!validate()) return; if (!cartItems.length) { setMessage('Your cart is empty.'); return; } setSubmitting(true);
    try {
      if (!(await loadRazorpayScript())) throw new Error('Unable to load Razorpay Checkout. Please check your connection and try again.');
      const { data } = await api.post('/orders/create-payment-order', { shippingAddress: address });
      const payment = new window.Razorpay({ key: data.key, amount: data.amount, currency: data.currency, name: 'ShopKart', description: 'ShopKart order', order_id: data.razorpayOrderId, prefill: { name: address.fullName, contact: address.phone }, theme: { color: '#0f766e' }, handler: async (response) => { try { const verification = await api.post('/orders/verify-payment', { shopKartOrderId: data.shopKartOrderId, ...response }); clearCartState(); navigate(`/order-success/${verification.data.order._id}`, { replace: true, state: { order: verification.data.order } }); } catch (error) { setMessage(error.response?.data?.message || 'Payment verification failed. Your cart is still saved.'); setSubmitting(false); } }, modal: { ondismiss: () => setSubmitting(false) } });
      payment.on('payment.failed', () => { setMessage('Payment failed. Your cart has not been cleared.'); setSubmitting(false); }); payment.open();
    } catch (error) { setMessage(error.response?.data?.message || error.message || 'Unable to create payment order.'); setSubmitting(false); }
  }
  if (loading) return <><Navbar /><main className="catalog-layout"><p className="status-message">Loading your cart...</p></main></>;
  if (!cartItems.length) return <><Navbar /><main className="catalog-layout"><section className="wishlist-state"><h1>Your cart is empty</h1><p>Add a product before checking out.</p><Link className="primary-link" to="/products">Browse Products</Link></section></main></>;
  return <><Navbar /><main className="catalog-layout"><p className="eyebrow">SECURE CHECKOUT</p><h1>Checkout</h1><section className="checkout-layout"><form className="shipping-form" onSubmit={submit} noValidate><h2>Shipping details</h2>{Object.entries(fields).map(([name, label]) => <label key={name}>{label}<input name={name} value={address[name]} onChange={update} inputMode={name === 'phone' || name === 'pincode' ? 'numeric' : undefined} />{errors[name] && <span className="field-error">{errors[name]}</span>}</label>)}{message && <p className="form-error" role="alert">{message}</p>}<button className="primary-button" disabled={submitting}>{submitting ? 'Preparing payment...' : 'Place order & pay'}</button></form><aside className="order-summary"><h2>Order Summary</h2>{cartItems.map((item) => <div key={item.product._id}><span>{item.product.name} × {item.quantity}</span><strong>{currency.format(item.product.price * item.quantity)}</strong></div>)}<hr /><div><span>Items</span><strong>{totalUnits}</strong></div><div><span>Total</span><strong>{currency.format(subtotal)}</strong></div></aside></section></main></>;
}
