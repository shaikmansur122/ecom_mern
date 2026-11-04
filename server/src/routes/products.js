import { Router } from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import Product from '../models/Product.js';

const router = Router();

const EDITABLE_FIELDS = ['name', 'description', 'category', 'emoji', 'price', 'stock', 'rating'];
const pickEditable = (body = {}) =>
  Object.fromEntries(EDITABLE_FIELDS.filter((key) => key in body).map((key) => [key, body[key]]));

const SORTS = {
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  rating: { rating: -1 },
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/', async (req, res) => {
  const { q, category, sort } = req.query;
  const filter = {};
  if (q) filter.name = { $regex: escapeRegex(String(q)), $options: 'i' };
  if (category) filter.category = String(category);
  res.json(await Product.find(filter).sort(SORTS[sort] || { _id: 1 }));
});

router.get('/categories', async (req, res) => {
  res.json(await Product.distinct('category'));
});

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  res.status(201).json(await Product.create(pickEditable(req.body)));
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, pickEditable(req.body), {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.status(204).end();
});

export default router;
