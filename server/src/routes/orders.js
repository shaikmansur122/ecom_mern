import { Router } from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import Order, { ORDER_STATUSES } from '../models/Order.js';
import Product from '../models/Product.js';

const router = Router();
router.use(requireAuth);

// items: [{ product: <product id>, qty }] — the same shape as order.items.
const releaseStock = (items) =>
  Promise.all(items.map(({ product, qty }) => Product.updateOne({ _id: product }, { $inc: { stock: qty } })));

router.post('/', async (req, res) => {
  const { items, shipping } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Your cart is empty' });
  }

  // Prices come from the database, never from the client.
  const lines = [];
  for (const item of items) {
    const qty = Math.floor(Number(item?.qty));
    const product = await Product.findById(String(item?.productId)).catch(() => null);
    if (!product || !(qty >= 1)) {
      return res.status(400).json({ message: 'Your cart has an invalid item, please refresh it' });
    }
    lines.push({ product, qty });
  }

  const order = new Order({
    user: req.user._id,
    items: lines.map(({ product, qty }) => ({
      product: product._id,
      name: product.name,
      emoji: product.emoji,
      price: product.price,
      qty,
    })),
    shipping,
    total: lines.reduce((sum, { product, qty }) => sum + product.price * qty, 0),
  });
  await order.validate();

  // Reserve stock line by line and undo on failure (a standalone MongoDB has no transactions).
  const reserved = [];
  for (const { product, qty } of lines) {
    const { modifiedCount } = await Product.updateOne(
      { _id: product._id, stock: { $gte: qty } },
      { $inc: { stock: -qty } }
    );
    if (!modifiedCount) {
      await releaseStock(reserved);
      return res.status(409).json({ message: `Not enough stock for "${product.name}"` });
    }
    reserved.push({ product: product._id, qty });
  }

  try {
    await order.save();
  } catch (err) {
    await releaseStock(reserved);
    throw err;
  }
  res.status(201).json(order);
});

router.get('/mine', async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
});

router.get('/', requireAdmin, async (req, res) => {
  res.json(await Order.find().sort({ createdAt: -1 }).populate('user', 'name email'));
});

router.patch('/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body || {};
  if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ message: 'Unknown order status' });

  // Cancelled is final; the filter makes the cancel-and-restock step happen at most once.
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, status: { $ne: 'Cancelled' } },
    { status },
    { new: true }
  ).populate('user', 'name email');
  if (!order) return res.status(400).json({ message: 'Order not found or already cancelled' });
  if (status === 'Cancelled') await releaseStock(order.items);
  res.json(order);
});

export default router;
