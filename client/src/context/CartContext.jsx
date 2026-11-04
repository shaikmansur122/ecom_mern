import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'shopnest.cart';

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors; the cart still works for this visit.
    }
  }, [items]);

  const add = (product, qty = 1) =>
    setItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, stock: product.stock, qty: Math.min(item.qty + qty, product.stock) }
            : item
        );
      }
      const { _id, name, price, emoji, category, stock } = product;
      return [...prev, { _id, name, price, emoji, category, stock, qty: Math.min(qty, stock) }];
    });

  const setQty = (id, qty) =>
    setItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, qty: Math.max(1, Math.min(qty, item.stock)) } : item))
    );

  const remove = (id) => setItems((prev) => prev.filter((item) => item._id !== id));
  const clear = () => setItems([]);

  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  return (
    <CartContext.Provider value={{ items, add, setQty, remove, clear, count, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
