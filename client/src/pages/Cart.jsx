import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../api.js';
import ProductThumb from '../components/ProductThumb.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Cart() {
  const { items, setQty, remove, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="empty">
        <p>Your cart is empty.</p>
        <Link to="/" className="btn btn-primary">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <section>
        <h1>Shopping cart</h1>
        {items.map((item) => (
          <div className="cart-row" key={item._id}>
            <ProductThumb product={item} size="sm" />
            <div className="grow">
              <Link to={`/product/${item._id}`} className="card-title">
                {item.name}
              </Link>
              <div className="muted small">{formatPrice(item.price)} each</div>
            </div>
            <div className="qty">
              <button onClick={() => setQty(item._id, item.qty - 1)} disabled={item.qty <= 1} aria-label="Decrease">
                −
              </button>
              <span>{item.qty}</span>
              <button onClick={() => setQty(item._id, item.qty + 1)} disabled={item.qty >= item.stock} aria-label="Increase">
                +
              </button>
            </div>
            <strong className="line-total">{formatPrice(item.price * item.qty)}</strong>
            <button className="link-btn" onClick={() => remove(item._id)}>
              Remove
            </button>
          </div>
        ))}
      </section>
      <aside className="summary">
        <h2>Order summary</h2>
        <div className="summary-row">
          <span>Subtotal</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="summary-row">
          <span>Delivery</span>
          <span>Free</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
          Proceed to checkout
        </button>
      </aside>
    </div>
  );
}
