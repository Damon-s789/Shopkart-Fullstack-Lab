import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import api from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [state, setState] = useState({ loading: true, error: '' });
  const [cartMessage, setCartMessage] = useState('');
  const { addToCart, pendingProductIds } = useCart();

  useEffect(() => {
    const controller = new AbortController();
    api.get(`/products/${id}`, { signal: controller.signal })
      .then((response) => { setProduct(response.data.product); setState({ loading: false, error: '' }); })
      .catch((error) => { if (error.code !== 'ERR_CANCELED') setState({ loading: false, error: error.response?.status === 404 ? 'Product not found.' : 'Something went wrong while loading this product.' }); });
    return () => controller.abort();
  }, [id]);

  async function addProductToCart() {
    setCartMessage('');
    try { await addToCart(product._id); setCartMessage('Added to your cart.'); }
    catch (error) { setCartMessage(error.response?.data?.message || 'Unable to add this product to your cart.'); }
  }

  return <><Navbar /><main className="catalog-layout">{state.loading ? <p className="status-message">Loading product...</p> : state.error ? <><p className="status-message form-error" role="alert">{state.error}</p><Link to="/products">Back to products</Link></> : <><Link className="back-link" to="/products">← Back to products</Link><article className="product-details"><img src={product.image} alt={product.name} /><section><p className="product-category">{product.category}</p><h1>{product.name}</h1><p className="product-description">{product.description}</p><p className="product-price large-price">{currency.format(product.price)}</p><p className={product.stock > 0 ? 'stock in-stock' : 'stock out-of-stock'}>{product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}</p><button className="primary-button" disabled={product.stock === 0 || pendingProductIds.has(product._id)} onClick={addProductToCart}>{pendingProductIds.has(product._id) ? 'Adding...' : 'Add to cart'}</button>{cartMessage && <p className={cartMessage === 'Added to your cart.' ? 'success-message' : 'form-error'}>{cartMessage}</p>}</section></article></>}</main></>;
}
