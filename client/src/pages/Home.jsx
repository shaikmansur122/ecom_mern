import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

const SORTS = [
  ['', 'Featured'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['rating', 'Top rated'],
];

export default function Home() {
  const [params, setParams] = useSearchParams();
  const query = params.toString();
  const category = params.get('category') ?? '';
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/products/categories').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    api(`/products?${query}`)
      .then((data) => {
        if (ignore) return;
        setProducts(data);
        setError('');
      })
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [query]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <>
      <section className="hero">
        <h1>Everything you love, delivered.</h1>
        <p>Handpicked electronics, fashion, home and sports gear at honest prices.</p>
        <form
          className="search"
          onSubmit={(e) => {
            e.preventDefault();
            setParam('q', search.trim());
          }}
        >
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
          />
          <button className="btn btn-dark">Search</button>
        </form>
      </section>

      <div className="toolbar">
        <div className="chips">
          {['', ...categories].map((c) => (
            <button
              key={c || 'all'}
              className={`chip${category === c ? ' active' : ''}`}
              onClick={() => setParam('category', c)}
            >
              {c || 'All'}
            </button>
          ))}
        </div>
        <select value={params.get('sort') ?? ''} onChange={(e) => setParam('sort', e.target.value)} aria-label="Sort products">
          {SORTS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="alert">{error}</p>
      ) : loading && products.length === 0 ? (
        <p className="empty">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="empty">No products match your search.</p>
      ) : (
        <div className={`grid${loading ? ' is-loading' : ''}`}>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
