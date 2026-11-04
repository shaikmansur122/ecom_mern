import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, formatPrice } from '../api.js';
import ProductThumb from '../components/ProductThumb.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function ProductPage() {
  const { id } = useParams();
  const { add } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/products/${id}`).then(setProduct).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <p className="alert">{error}</p>;
  if (!product) return <p className="empty">Loading…</p>;

  const soldOut = product.stock === 0;

  return (
    <div className="product-page">
      <ProductThumb product={product} size="lg" />
      <div className="product-info">
        <Link to="/" className="back-link">
          ← Back to shop
        </Link>
        <span className="eyebrow">{product.category}</span>
        <h1>{product.name}</h1>
        <span className="rating">★ {product.rating.toFixed(1)} rating</span>
        <p className="price big">{formatPrice(product.price)}</p>
        <p className="description">{product.description}</p>
        <p className={`stock${soldOut ? ' out' : ''}`}>
          {soldOut ? 'Out of stock' : `In stock · ${product.stock} left`}
        </p>
        {!soldOut && (
          <div className="buy-row">
            <select value={qty} onChange={(e) => setQty(Number(e.target.value))} aria-label="Quantity">
              {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Qty {i + 1}
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary"
              onClick={() => {
                add(product, qty);
                navigate('/cart');
              }}
            >
              Add to cart
            </button>
          </div>
        )}
        <ul className="perks">
          <li>🚚 Free delivery across India</li>
          <li>↩️ 7-day easy returns</li>
          <li>💵 Cash on Delivery available</li>
        </ul>
      </div>
    </div>
  );
}
