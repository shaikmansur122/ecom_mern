import { useEffect, useState } from 'react';
import { api, formatPrice } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const EMPTY_PRODUCT = { name: '', emoji: '🛍️', category: '', price: '', stock: '', rating: '4.5', description: '' };
const ORDER_STATUSES = ['Placed', 'Shipped', 'Delivered', 'Cancelled'];
const LOW_STOCK = 5;

const formatDate = (iso) => new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function Admin() {
  const { authedApi } = useAuth();
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const reload = () =>
    Promise.all([api('/products'), authedApi('/orders')])
      .then(([productList, orderList]) => {
        setProducts(productList);
        setOrders(orderList);
        setError('');
      })
      .catch((err) => setError(err.message));

  useEffect(() => {
    reload();
  }, []);

  const revenue = orders.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter((o) => o.status === 'Placed').length;
  const lowStock = products.filter((p) => p.stock <= LOW_STOCK).length;

  return (
    <>
      <h1>Admin dashboard</h1>
      <div className="stats">
        <Stat label="Revenue" value={formatPrice(revenue)} />
        <Stat label="Orders to ship" value={`${pending} / ${orders.length}`} />
        <Stat label="Products" value={products.length} />
        <Stat label={`Low stock (≤ ${LOW_STOCK})`} value={lowStock} />
      </div>
      {error && <p className="alert">{error}</p>}
      <div className="tabs">
        {['products', 'orders'].map((name) => (
          <button key={name} className={`chip${tab === name ? ' active' : ''}`} onClick={() => setTab(name)}>
            {name === 'products' ? 'Products' : 'Orders'}
          </button>
        ))}
      </div>
      {tab === 'products' ? (
        <ProductsAdmin products={products} onChange={reload} />
      ) : (
        <OrdersAdmin orders={orders} onChange={reload} />
      )}
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ProductsAdmin({ products, onChange }) {
  const { authedApi } = useAuth();
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const categories = [...new Set(products.map((p) => p.category))];

  const reset = () => {
    setEditingId(null);
    setForm(EMPTY_PRODUCT);
    setError('');
  };

  const startEdit = (product) => {
    const { name, emoji, category, price, stock, rating, description } = product;
    setEditingId(product._id);
    setForm({ name, emoji, category, price, stock, rating, description });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const body = { ...form, price: Number(form.price), stock: Number(form.stock), rating: Number(form.rating) };
    try {
      await authedApi(editingId ? `/products/${editingId}` : '/products', {
        method: editingId ? 'PUT' : 'POST',
        body,
      });
      reset();
      await onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? Past orders keep their copy of it.`)) return;
    try {
      await authedApi(`/products/${product._id}`, { method: 'DELETE' });
      if (editingId === product._id) reset();
      await onChange();
    } catch (err) {
      setError(err.message);
    }
  };

  const field = (name) => ({
    name,
    value: form[name],
    onChange: (e) => setForm({ ...form, [name]: e.target.value }),
  });

  return (
    <div className="admin-grid">
      <form className="panel" onSubmit={save}>
        <h2>{editingId ? 'Edit product' : 'Add a product'}</h2>
        <div className="form-grid">
          <label className="field span-2">
            Name
            <input required {...field('name')} />
          </label>
          <label className="field">
            Emoji
            <input required maxLength={8} {...field('emoji')} />
          </label>
          <label className="field">
            Category
            <input required list="product-categories" {...field('category')} />
          </label>
          <label className="field">
            Price (₹)
            <input required type="number" min="0" step="1" {...field('price')} />
          </label>
          <label className="field">
            Stock
            <input required type="number" min="0" step="1" {...field('stock')} />
          </label>
          <label className="field">
            Rating
            <input type="number" min="0" max="5" step="0.1" {...field('rating')} />
          </label>
          <label className="field span-2">
            Description
            <textarea rows={3} {...field('description')} />
          </label>
        </div>
        <datalist id="product-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        {error && <p className="alert">{error}</p>}
        <div className="form-actions">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add product'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={reset}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className={editingId === p._id ? 'editing' : ''}>
                <td>
                  {p.emoji} {p.name}
                </td>
                <td>{p.category}</td>
                <td>{formatPrice(p.price)}</td>
                <td className={p.stock <= LOW_STOCK ? 'low' : ''}>{p.stock}</td>
                <td className="actions">
                  <button className="link-btn edit" onClick={() => startEdit(p)}>
                    Edit
                  </button>
                  <button className="link-btn" onClick={() => remove(p)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersAdmin({ orders, onChange }) {
  const { authedApi } = useAuth();
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const setStatus = async (order, status) => {
    if (status === 'Cancelled' && !window.confirm('Cancel this order? Its items go back into stock.')) return;
    setBusyId(order._id);
    setError('');
    try {
      await authedApi(`/orders/${order._id}/status`, { method: 'PATCH', body: { status } });
      await onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (orders.length === 0) return <p className="empty">No orders yet.</p>;

  return (
    <>
      {error && <p className="alert">{error}</p>}
      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>
                  <strong>#{o._id.slice(-6).toUpperCase()}</strong>
                  <div className="muted small">{formatDate(o.createdAt)}</div>
                </td>
                <td>
                  {o.user?.name ?? 'Deleted user'}
                  <div className="muted small">{o.user?.email}</div>
                  <div className="muted small">
                    {o.shipping.city} · {o.shipping.phone}
                  </div>
                </td>
                <td>{o.items.map((i) => `${i.emoji} ${i.name} × ${i.qty}`).join(', ')}</td>
                <td>
                  <strong>{formatPrice(o.total)}</strong>
                </td>
                <td>
                  <select
                    value={o.status}
                    disabled={o.status === 'Cancelled' || busyId === o._id}
                    onChange={(e) => setStatus(o, e.target.value)}
                    aria-label="Order status"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
