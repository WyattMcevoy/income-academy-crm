import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Admin gate. JWTs don't carry is_admin (and existing tokens predate the column),
// so we look it up fresh per request. Cheap; the admin panel is low-traffic.
export async function requireAdmin(req, res, next) {
  if (!req.user?.id) return res.status(401).json({ error: 'Missing token' });
  try {
    const { rows } = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]?.is_admin) return res.status(403).json({ error: 'Forbidden' });
    next();
  } catch (e) {
    console.error('admin check failed:', e.code || 'unknown');
    res.status(500).json({ error: 'Server error' });
  }
}
