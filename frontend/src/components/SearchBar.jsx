const categories = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home'];

export default function SearchBar({ search, category, sort, onSearchChange, onCategoryChange, onSortChange }) {
  return <section className="catalog-controls" aria-label="Product filters"><label className="search-field">Search products<input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search products..." /></label><label>Category<select value={category} onChange={(event) => onCategoryChange(event.target.value)}>{categories.map((item) => <option key={item} value={item === 'All Categories' ? '' : item}>{item}</option>)}</select></label><label>Sort by<select value={sort} onChange={(event) => onSortChange(event.target.value)}><option value="">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select></label></section>;
}
