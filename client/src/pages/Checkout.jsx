import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { formatPrice } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const FIELDS = [
  ['fullName', 'Full name', 'text', 'name'],
  ['phone', 'Phone number', 'tel', 'tel'],
  ['address', 'Address', 'text', 'street-address'],
  ['city', 'City', 'text', 'address-level2'],
  ['postalCode', 'PIN code', 'text', 'postal-code'],
];

export default function Checkout() {
  const { items, total, clear } = useCart();
  const { user, authedApi } = useAuth();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState({ fullName: user.name, phone: '', address: '', city: '', postalCode: '' });
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const placeOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setError('');
    try {
      const order = await authedApi('/orders', {
        method: 'POST',
        body: { items: items.map(({ _id, qty }) => ({ productId: _id, qty })), shipping },
      });
      navigate('/orders', { replace: true, state: { placedOrderId: order._id } });
      clear();
    } catch (err) {
      setError(err.message);
      setPlacing(false);
    }
  };

  return (
    <form className="cart-layout" onSubmit={placeOrder}>
      <section className="panel">
        <h1>Checkout</h1>
        <h2>Shipping address</h2>
        <div className="form-grid">
          {FIELDS.map(([name, label, type, autoComplete]) => (
            <label key={name} className={`field${name === 'address' ? ' span-2' : ''}`}>
              {label}
              <input
                name={name}
                type={type}
                autoComplete={autoComplete}
                required
                value={shipping[name]}
                onChange={(e) => setShipping({ ...shipping, [name]: e.target.value })}
              />
            </label>
          ))}
        </div>
        <h2>Payment</h2>
        <label className="payment-option">
          <input type="radio" checked readOnly /> Cash on Delivery
        </label>
      </section>
      <aside className="summary">
        <h2>Order summary</h2>
        {items.map((item) => (
          <div className="summary-row" key={item._id}>
            <span>
              {item.emoji} {item.name} × {item.qty}
            </span>
            <span>{formatPrice(item.price * item.qty)}</span>
          </div>
        ))}
        <div className="summary-row total">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        {error && <p className="alert">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={placing}>
          {placing ? 'Placing order…' : `Place order · ${formatPrice(total)}`}
        </button>
      </aside>
    </form>
  );
}
