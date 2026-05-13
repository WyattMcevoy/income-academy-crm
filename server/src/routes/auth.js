import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { pool } from '../db/pool.js';
import { isEmail, isStrongPassword, cleanString } from '../validate.js';
import { logActivity } from '../activity.js';

const router = Router();

// Rate limit: max 5 attempts per 15 minutes per IP on auth endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, try again later.' },
});

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
}

router.post('/register', authLimiter, async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : '';
  const password = req.body?.password;
  const name = cleanString(req.body?.name, { max: 100 });

  if (!isEmail(email)) return res.status(400).json({ error: 'Invalid email' });
  if (!isStrongPassword(password)) return res.status(400).json({ error: 'Password must be 8-200 characters' });

  try {
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hash, name]
    );
    const user = rows[0];
    logActivity(user.id, 'register', { email: user.email }, req);
    res.json({ token: signToken(user), user });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    // Generic log — no body, no credentials.
    console.error('register failed:', err.code || 'unknown');
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : '';
  const password = req.body?.password;

  if (!isEmail(email) || typeof password !== 'string' || !password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, password_hash FROM users WHERE email = $1',
      [email]
    );
    const user = rows[0];
    // Always run bcrypt.compare even on missing user to avoid timing oracle.
    const ok = user
      ? await bcrypt.compare(password, user.password_hash)
      : await bcrypt.compare(password, '$2a$12$invalidsaltinvalidsaltinvaliux.7FqCp3fcX8Nk0F9PYq5iGx2rYkG');
    if (!user || !ok) return res.status(401).json({ error: 'Invalid credentials' });
    logActivity(user.id, 'login', { email: user.email }, req);
    res.json({
      token: signToken(user),
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error('login failed:', err.code || 'unknown');
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
