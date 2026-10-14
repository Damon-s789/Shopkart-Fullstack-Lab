import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const navigate = useNavigate();
  const { totalUnits } = useCart();
  const [wishlistCount, setWishlistCount] = useState(null);
  useEffect(() => {
    const loadCount = () => api.get('/wishlist').then((response) => setWishlistCount(response.data.count)).catch(() => setWishlistCount(null));
    loadCount();
    window.addEventListener('wishlist-changed', loadCount);
    return () => window.removeEventListener('wishlist-changed', loadCount);
  }, []);
  async function logout() {
    try { await api.post('/customers/logout'); } finally { navigate('/login', { replace: true }); }
  }
  return <header className="navbar"><Link className="brand" to="/home">ShopKart</Link><nav className="nav-links" aria-label="Main navigation"><Link to="/products">Products</Link><Link to="/wishlist">Wishlist{wishlistCount === null ? '' : ` (${wishlistCount})`}</Link><Link to="/cart">Cart ({totalUnits})</Link><Link to="/orders">Orders</Link><button className="secondary-button" onClick={logout}>Log out</button></nav></header>;
}
