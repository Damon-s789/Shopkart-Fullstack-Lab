import { useState } from 'react';
import { Link } from 'react-router-dom';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export default function WishlistCard({ product, onRemove }) {
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');
  async function remove() {
    setRemoving(true); setError('');
    try { await onRemove(product._id); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to remove this product. Please try again.'); setRemoving(false); }
  }
  const inStock = product.stock > 0;
  return <article className="product-card"><img src={product.image} alt={product.name} /><div className="product-card-body"><p className="product-category">{product.category}</p><h2>{product.name}</h2><p className="product-price">{currency.format(product.price)}</p><p className={inStock ? 'stock in-stock' : 'stock out-of-stock'}>{inStock ? `${product.stock} units left` : 'Out of stock'}</p><div className="card-actions"><Link className="primary-link card-link" to={`/products/${product._id}`}>View details</Link><button className="remove-button" disabled={removing} onClick={remove}>{removing ? 'Removing...' : 'Remove ♥'}</button></div>{error && <p className="card-error" role="alert">{error}</p>}</div></article>;
}
