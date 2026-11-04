import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

const sendSession = (res, user, status = 200) =>
  res.status(status).json({
    user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    token: jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' }),
  });

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (!/^\S+@\S+\.\S+$/.test(String(email))) return res.status(400).json({ message: 'Enter a valid email' });
  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  const normalizedEmail = String(email).toLowerCase().trim();
  if (await User.exists({ email: normalizedEmail })) {
    return res.status(409).json({ message: 'That email is already registered' });
  }
  const user = await User.create({ name: String(name), email: normalizedEmail, password: String(password) });
  sendSession(res, user, 201);
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = email ? await User.findOne({ email: String(email).toLowerCase().trim() }) : null;
  if (!user || !(await user.matchPassword(String(password ?? '')))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  sendSession(res, user);
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

export default router;
