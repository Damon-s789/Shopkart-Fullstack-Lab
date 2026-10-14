import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingProductIds, setPendingProductIds] = useState(new Set());

  const loadCart = useCallback(async () => {
    setLoading(true); setError('');
    try { const response = await api.get('/cart'); setCartItems(response.data.cart); }
    catch (requestError) { setError(requestError.response?.status === 401 ? '' : 'Unable to load your cart.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCart(); }, [loadCart]);

  const mutate = useCallback(async (productId, request) => {
    setPendingProductIds((ids) => new Set(ids).add(productId));
    setError('');
    try { const response = await request(); setCartItems(response.data.cart); return response.data; }
    catch (requestError) { const message = requestError.response?.data?.message || 'Unable to update your cart. Please try again.'; setError(message); throw requestError; }
    finally { setPendingProductIds((ids) => { const next = new Set(ids); next.delete(productId); return next; }); }
  }, []);

  const addToCart = useCallback((productId) => mutate(productId, () => api.post(`/cart/${productId}`)), [mutate]);
  const updateQuantity = useCallback((productId, quantity) => mutate(productId, () => api.patch(`/cart/${productId}`, { quantity })), [mutate]);
  const removeFromCart = useCallback((productId) => mutate(productId, () => api.delete(`/cart/${productId}`)), [mutate]);
  const clearCartState = useCallback(() => { setCartItems([]); setError(''); }, []);
  const totalUnits = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems]);
  const subtotal = useMemo(() => cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0), [cartItems]);

  const value = useMemo(() => ({ cartItems, loading, error, pendingProductIds, totalUnits, subtotal, loadCart, addToCart, updateQuantity, removeFromCart, clearCartState }), [cartItems, loading, error, pendingProductIds, totalUnits, subtotal, loadCart, addToCart, updateQuantity, removeFromCart, clearCartState]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
