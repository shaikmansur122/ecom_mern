import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatPrice } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Orders() {
  const { authedApi } = useAuth();
  const { state } = useLocation();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    authedApi('/orders/mine').then(setOrders).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="alert">{error}</p>;
  if (!orders) return <p className="empty">Loading your orders…</p>;

  return (
    <>
      <h1>My orders</h1>
      {state?.placedOrderId && (
        <p className="alert success">🎉 Order placed! We'll deliver it soon. Pay in cash when it arrives.</p>
      )}
      {orders.length === 0 ? (
        <div className="empty">
          <p>You haven't ordered anything yet.</p>
          <Link to="/" className="btn btn-primary">
            Browse products
          </Link>
        </div>
      ) : (
        orders.map((order) => (
          <article key={order._id} className="order">
            <header className="order-head">
              <div>
                <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
                <div className="muted small">
                  {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
              <span className="status">{order.status}</span>
              <strong>{formatPrice(order.total)}</strong>
            </header>
            <ul className="order-items">
              {order.items.map((item) => (
                <li key={item._id}>
                  <span>
                    {item.emoji} {item.name} × {item.qty}
                  </span>
                  <span className="muted">{formatPrice(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <p className="muted small">
              Deliver to {order.shipping.fullName}, {order.shipping.address}, {order.shipping.city} –{' '}
              {order.shipping.postalCode} · {order.paymentMethod}
            </p>
          </article>
        ))
      )}
    </>
  );
}
