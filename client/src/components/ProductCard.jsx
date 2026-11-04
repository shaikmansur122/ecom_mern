import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import ProductThumb from './ProductThumb.jsx';

export default function ProductCard({ product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const soldOut = product.stock === 0;

  const addToCart = () => {
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article className="card">
      <Link to={`/product/${product._id}`}>
        <ProductThumb product={product} />
      </Link>
      <div className="card-body">
        <span className="eyebrow">{product.category}</span>
        <Link to={`/product/${product._id}`} className="card-title">
          {product.name}
        </Link>
        <span className="rating">★ {product.rating.toFixed(1)}</span>
        <div className="card-footer">
          <span className="price">{formatPrice(product.price)}</span>
          <button className="btn btn-primary btn-sm" disabled={soldOut} onClick={addToCart}>
            {soldOut ? 'Sold out' : added ? 'Added ✓' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  );
}
