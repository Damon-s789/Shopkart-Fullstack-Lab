import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import WishlistCard from '../components/WishlistCard.jsx';
import api from '../services/api.js';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });
  const navigate = useNavigate();
  const loadWishlist = useCallback(() => {
    setState({ loading: true, error: '' });
    api.get('/wishlist').then((response) => { setWishlist(response.data.wishlist); setState({ loading: false, error: '' }); })
      .catch((error) => { if (error.response?.status === 401) navigate('/login', { replace: true }); else setState({ loading: false, error: 'Unable to load wishlist.' }); });
  }, [navigate]);
  useEffect(() => { loadWishlist(); }, [loadWishlist]);
  async function removeProduct(productId) {
    await api.delete(`/wishlist/${productId}`);
    setWishlist((items) => items.filter((product) => product._id !== productId));
    window.dispatchEvent(new Event('wishlist-changed'));
  }
  return <><Navbar /><main className="catalog-layout"><p className="eyebrow">SAVED FOR LATER</p><h1>My Wishlist</h1>{state.loading ? <p className="status-message">Loading your wishlist...</p> : state.error ? <section className="wishlist-state"><h2>Something went wrong.</h2><p>We couldn't load your wishlist.</p><button className="primary-button" onClick={loadWishlist}>Try again</button></section> : wishlist.length === 0 ? <section className="wishlist-state"><p className="empty-heart" aria-hidden="true">♥</p><h2>Your wishlist is empty</h2><p>Save products you love and find them here later.</p><Link className="primary-link" to="/products">Browse products</Link></section> : <><p className="muted">{wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved</p><section className="product-grid" aria-label="Wishlist products">{wishlist.map((product) => <WishlistCard key={product._id} product={product} onRemove={removeProduct} />)}</section></>}</main></>;
}
