import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import CartItem from '../components/CartItem.jsx';
import { useCart } from '../context/CartContext.jsx';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export default function Cart() {
  const { cartItems, loading, error, totalUnits, subtotal, loadCart } = useCart();
  const navigate = useNavigate();
  return <><Navbar /><main className="catalog-layout"><p className="eyebrow">READY WHEN YOU ARE</p><h1>My Cart</h1>{loading ? <p className="status-message">Loading your cart...</p> : error ? <section className="wishlist-state"><h2>Unable to load your cart.</h2><p>Check your connection and try again.</p><button className="primary-button" onClick={loadCart}>Try again</button></section> : cartItems.length === 0 ? <section className="wishlist-state"><p className="empty-heart" aria-hidden="true">🛒</p><h2>Your cart is empty</h2><p>Looks like you haven't added anything yet.</p><Link className="primary-link" to="/products">Browse Products</Link></section> : <section className="cart-layout"><div className="cart-items">{cartItems.map((item) => <CartItem key={item.product._id} item={item} />)}</div><aside className="order-summary"><h2>Order Summary</h2><div><span>Items</span><strong>{totalUnits}</strong></div><div><span>Subtotal</span><strong>{currency.format(subtotal)}</strong></div><hr /><button className="primary-button checkout-button" onClick={() => navigate('/checkout')}>Proceed to Checkout</button><p className="summary-note">Test payment is handled securely by Razorpay.</p></aside></section>}</main></>;
}
