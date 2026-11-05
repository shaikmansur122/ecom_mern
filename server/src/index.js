import express from 'express';
import mongoose from 'mongoose';
import path from 'node:path';
import { MONGO_URI, PORT, PUBLIC_DIR } from './config.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import productRoutes from './routes/products.js';
import { seed } from './seed.js';

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

if (PUBLIC_DIR) {
  app.use('/assets', express.static(path.join(PUBLIC_DIR, 'assets'), { immutable: true, maxAge: '1y', fallthrough: false }));
  app.use(express.static(PUBLIC_DIR, { index: false }));
  // Single-page app: any other GET outside /api gets index.html so React Router can handle it.
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  });
}

app.use((req, res) => res.status(404).json({ message: 'Not found' }));

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
  }
  if (err.name === 'CastError') {
    return err.path === '_id'
      ? res.status(404).json({ message: 'Not found' })
      : res.status(400).json({ message: `Invalid value for ${err.path}` });
  }
  if (err.code === 11000) return res.status(409).json({ message: 'Already exists' });
  if (!err.status) console.error(err);
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Something went wrong' });
});

async function connectWithRetry(retries = 15) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    } catch (err) {
      if (attempt >= retries) throw err;
      console.log(`MongoDB not reachable yet (attempt ${attempt}/${retries}), retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

await connectWithRetry();
await seed();
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
