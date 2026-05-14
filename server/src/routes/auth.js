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
      'SELECT id, email, name, password_hash, is_admin, tenant_id FROM users WHERE email = $1',
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
      user: { id: user.id, email: user.email, name: user.name, is_admin: !!user.is_admin, tenant_id: user.tenant_id || 'income-academy' },
    });
  } catch (err) {
    console.error('login failed:', err.code || 'unknown');
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================================================
// SSO from external tenants (Kick Start CRM, future partners).
//
// The partner mints a short-lived HS256 JWT signed with a per-tenant shared
// secret and links the customer to:
//   https://<our-host>/credit-builder/sso?token=<JWT>
//
// JWT payload required:
//   iss   issuer name, must match a TENANT in the table below
//   aud   "income-academy-credit-builder"
//   sub   the partner's internal customer ID (string)
//   email customer's email address
//   name  (optional) customer's display name
//   iat   issued-at, must be within the last 5 minutes
//   exp   expiry, must be ≤ 15 minutes from iat
//
// On success we find-or-create a user with tenant_id = <issuer>, issue our
// own session JWT, and the client redirects them into /credit-builder.
// =============================================================================

// Per-tenant SSO config. Add new tenants here.
const SSO_TENANTS = {
  'kickstart-crm': {
    tenant_id: 'kickstart',
    secret_env: 'KICKSTART_SSO_SECRET',
  },
};

const ssoLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // generous; one click = one token
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many SSO attempts, slow down.' },
});

router.post('/sso', ssoLimiter, async (req, res) => {
  const token = typeof req.body?.token === 'string' ? req.body.token : '';
  if (!token || token.length > 4096) {
    return res.status(400).json({ error: 'Missing or oversized token' });
  }

  // Peek at the header / payload WITHOUT verifying to find the issuer.
  let decodedHeader;
  let unverifiedPayload;
  try {
    decodedHeader = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString('utf8'));
    unverifiedPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Malformed token' });
  }

  if (decodedHeader?.alg !== 'HS256') {
    return res.status(400).json({ error: 'Unsupported signing algorithm' });
  }

  const issuer = unverifiedPayload?.iss;
  const tenantCfg = SSO_TENANTS[issuer];
  if (!tenantCfg) {
    return res.status(401).json({ error: 'Unknown issuer' });
  }

  const secret = process.env[tenantCfg.secret_env];
  if (!secret || secret.length < 32) {
    console.error(`SSO secret missing or too short for ${issuer}`);
    return res.status(503).json({ error: 'SSO not configured for this issuer' });
  }

  // Verify signature + standard claims
  let payload;
  try {
    payload = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      audience: 'income-academy-credit-builder',
      issuer,
    });
  } catch (e) {
    console.error('SSO verify failed:', e.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Defense in depth: tight iat window (5 min) and exp window (15 min)
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.iat !== 'number' || payload.iat < now - 300 || payload.iat > now + 60) {
    return res.status(401).json({ error: 'Token outside acceptable issue window' });
  }
  if (typeof payload.exp !== 'number' || payload.exp - payload.iat > 900) {
    return res.status(401).json({ error: 'Token exp window too long' });
  }

  const email = String(payload.email || '').toLowerCase().trim();
  const externalId = String(payload.sub || '').trim();
  const name = cleanString(payload.name, { max: 100 }) || null;

  if (!isEmail(email)) {
    return res.status(400).json({ error: 'Token email invalid' });
  }
  if (!externalId) {
    return res.status(400).json({ error: 'Token sub required' });
  }

  try {
    // Find by (tenant_id, external_id), then by email as fallback.
    let { rows } = await pool.query(
      'SELECT id, email, name, is_admin, tenant_id FROM users WHERE tenant_id = $1 AND external_id = $2 LIMIT 1',
      [tenantCfg.tenant_id, externalId]
    );

    let user = rows[0];

    if (!user) {
      const byEmail = await pool.query(
        'SELECT id, email, name, is_admin, tenant_id FROM users WHERE email = $1 LIMIT 1',
        [email]
      );
      user = byEmail.rows[0];
      if (user) {
        // Attach external_id so future lookups are O(1) and email changes don't break us
        await pool.query(
          'UPDATE users SET external_id = $1, tenant_id = COALESCE(tenant_id, $2) WHERE id = $3',
          [externalId, tenantCfg.tenant_id, user.id]
        );
      }
    }

    if (!user) {
      // Create. No password — only SSO can authenticate this user.
      const insert = await pool.query(
        `INSERT INTO users (email, password_hash, name, tenant_id, external_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, name, is_admin, tenant_id`,
        [email, 'SSO_ONLY_NO_PASSWORD_LOGIN', name, tenantCfg.tenant_id, externalId]
      );
      user = insert.rows[0];
      logActivity(user.id, 'sso_register', { issuer, external_id: externalId }, req);
    } else {
      logActivity(user.id, 'sso_login', { issuer, external_id: externalId }, req);
    }

    res.json({
      token: signToken(user),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: !!user.is_admin,
        tenant_id: user.tenant_id,
      },
    });
  } catch (err) {
    console.error('SSO upsert failed:', err.code || 'unknown');
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
