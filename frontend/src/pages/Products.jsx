import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import ProductCard from '../components/ProductCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import api from '../services/api.js';

export default function Products() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [products, setProducts] = useState([]);
  const [savedProductIds, setSavedProductIds] = useState(new Set());
  const [state, setState] = useState({ loading: true, error: '' });

  useEffect(() => {
    const controller = new AbortController();
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (category) params.category = category;
    if (sort) params.sort = sort;
    setState({ loading: true, error: '' });
    api.get('/products', { params, signal: controller.signal })
      .then((response) => { setProducts(response.data.products); setState({ loading: false, error: '' }); })
      .catch((error) => { if (error.code !== 'ERR_CANCELED') setState({ loading: false, error: 'Something went wrong while loading products.' }); });
    return () => controller.abort();
  }, [search, category, sort]);

  useEffect(() => {
    let active = true;
    api.get('/wishlist').then((response) => { if (active) setSavedProductIds(new Set(response.data.wishlist.map((product) => product._id))); }).catch(() => {});
    return () => { active = false; };
  }, []);

  return <><Navbar /><main className="catalog-layout"><p className="eyebrow">SHOPKART CATALOGUE</p><h1>Find your next favourite.</h1><p className="muted">Search products, explore categories, and view every item’s details.</p><SearchBar search={search} category={category} sort={sort} onSearchChange={setSearch} onCategoryChange={setCategory} onSortChange={setSort} />{state.loading ? <p className="status-message">Loading products...</p> : state.error ? <p className="status-message form-error" role="alert">{state.error}</p> : products.length === 0 ? <p className="status-message">No products found.</p> : <section className="product-grid" aria-label="Products">{products.map((product) => <ProductCard key={product._id} product={product} initiallySaved={savedProductIds.has(product._id)} />)}</section>}</main></>;
}
