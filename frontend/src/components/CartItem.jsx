import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export default function CartItem({ item }) {
  const { product, quantity } = item;
  const { updateQuantity, removeFromCart, pendingProductIds } = useCart();
  const [error, setError] = useState('');
  const busy = pendingProductIds.has(product._id);
  async function changeQuantity(nextQuantity) { setError(''); try { await updateQuantity(product._id, nextQuantity); } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to update quantity.'); } }
  async function remove() { setError(''); try { await removeFromCart(product._id); } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to remove product.'); } }
  return <article className="cart-item"><img src={product.image} alt={product.name} /><section className="cart-item-info"><p className="product-category">{product.category}</p><h2>{product.name}</h2><p className="product-price">{currency.format(product.price)}</p><p className={product.stock > 0 ? 'stock in-stock' : 'stock out-of-stock'}>{product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}</p><div className="quantity-controls" aria-label={`Quantity for ${product.name}`}><button disabled={busy || quantity <= 1} onClick={() => changeQuantity(quantity - 1)} aria-label="Decrease quantity">−</button><span>{quantity}</span><button disabled={busy || quantity >= product.stock} onClick={() => changeQuantity(quantity + 1)} aria-label="Increase quantity">+</button></div><button className="remove-button cart-remove" disabled={busy} onClick={remove}>{busy ? 'Updating...' : 'Remove'}</button>{error && <p className="card-error" role="alert">{error}</p>}</section><p className="line-total">{currency.format(product.price * quantity)}</p></article>;
}
