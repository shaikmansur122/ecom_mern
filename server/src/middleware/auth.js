import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please log in' });

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Session expired, please log in again' });
  }

  const user = await User.findById(payload.id).select('-password');
  if (!user) return res.status(401).json({ message: 'Account not found' });
  req.user = user;
  next();
}

// Use after requireAuth. isAdmin is read from the database on every request, not from the token.
export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ message: 'Admins only' });
  next();
}
