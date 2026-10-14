import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export default function ProductCard({ product, initiallySaved = false }) {
  const inStock = product.stock > 0;
  const [saved, setSaved] = useState(initiallySaved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [cartError, setCartError] = useState('');
  const { addToCart, pendingProductIds } = useCart();
  const addingToCart = pendingProductIds.has(product._id);
  async function toggleWishlist() {
    setSaving(true); setError('');
    try { const response = await api.patch(`/wishlist/${product._id}/toggle`); setSaved(response.data.saved); window.dispatchEvent(new Event('wishlist-changed')); }
    catch (requestError) { setError(requestError.response?.status === 401 ? 'Please log in to save products.' : 'Unable to save product. Please try again.'); }
    finally { setSaving(false); }
  }
  async function addProductToCart() { setCartError(''); try { await addToCart(product._id); } catch (requestError) { setCartError(requestError.response?.data?.message || 'Unable to add product to cart.'); } }
  return <article className="product-card"><img src={product.image} alt={product.name} /><div className="product-card-body"><p className="product-category">{product.category}</p><h2>{product.name}</h2><p className="product-price">{currency.format(product.price)}</p><p className={inStock ? 'stock in-stock' : 'stock out-of-stock'}>{inStock ? `${product.stock} units left` : 'Out of stock'}</p><div className="card-actions"><Link className="primary-link card-link" to={`/products/${product._id}`}>View details</Link><button className={saved ? 'wishlist-button is-saved' : 'wishlist-button'} disabled={saving} onClick={toggleWishlist}>{saving ? 'Saving...' : saved ? '♥ Saved' : '♡ Add to Wishlist'}</button><button className="cart-button" disabled={!inStock || addingToCart} onClick={addProductToCart}>{addingToCart ? 'Adding...' : 'Add to Cart'}</button></div>{error && <p className="card-error" role="alert">{error}</p>}{cartError && <p className="card-error" role="alert">{cartError}</p>}</div></article>;
}
