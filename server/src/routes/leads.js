import { Router } from 'express';
import { pool } from '../db/pool.js';
import { cleanString, isIsoDate, isBoolean, oneOf, ENUMS, computeName } from '../validate.js';

const router = Router();

// Fields that require special write paths (Phase 4+) and are blocked in
// public PATCH/POST requests. is_client flips via the Convert button (Phase 4),
// stripe_customer_id is set by Stripe webhooks (Phase 6), etc.
const WRITE_PROTECTED = new Set([
  'is_client',
  'became_client_at',
  'stripe_customer_id',
  'contract_status',
  'name', // never set directly; derived from first/middle/last
]);

function validateLeadFields(body, { partial = false } = {}) {
  const out = {};
  const errors = [];

  // Block write-protected fields up front
  for (const key of Object.keys(body || {})) {
    if (WRITE_PROTECTED.has(key)) {
      errors.push(`field '${key}' is not writable via this endpoint`);
    }
  }
  if (errors.length) return { out, errors };

  // Text fields
  const textFields = [
    ['first_name', 100],
    ['middle_initial', 100],
    ['last_name', 100],
    ['email', 254],
    ['phone', 40],
    ['phone_home', 40],
    ['phone_work', 40],
    ['source', 100],
    ['company_name', 200],
    ['company_website', 500],
  ];
  for (const [field, max] of textFields) {
    if (field in body) {
      out[field] = body[field] ? cleanString(body[field], { max }) : null;
    }
  }

  // Enum fields
  if ('stage' in body) {
    if (body.stage != null && !oneOf(body.stage, ENUMS.STAGE)) errors.push('invalid stage');
    else if (body.stage) out.stage = body.stage;
  }
  if ('preferred_contact' in body) {
    if (body.preferred_contact != null && !oneOf(body.preferred_contact, ENUMS.PREFERRED_CONTACT)) {
      errors.push('invalid preferred_contact');
    } else {
      out.preferred_contact = body.preferred_contact || null;
    }
  }
  if ('client_type' in body) {
    if (body.client_type != null && !oneOf(body.client_type, ENUMS.CLIENT_TYPE)) {
      errors.push('invalid client_type');
    } else if (body.client_type) {
      out.client_type = body.client_type;
    }
  }

  // Dates
  if ('follow_up_date' in body) {
    if (body.follow_up_date == null || body.follow_up_date === '') out.follow_up_date = null;
    else if (!isIsoDate(body.follow_up_date)) errors.push('invalid follow_up_date');
    else out.follow_up_date = body.follow_up_date;
  }
  if ('dob' in body) {
    if (body.dob == null || body.dob === '') out.dob = null;
    else if (!isIsoDate(body.dob)) errors.push('invalid dob');
    else out.dob = body.dob;
  }

  // Booleans
  for (const field of ['is_us_citizen', 'is_active']) {
    if (field in body) {
      if (body[field] == null) out[field] = null;
      else if (!isBoolean(body[field])) errors.push(`invalid ${field}`);
      else out[field] = body[field];
    }
  }

  // Require at least a name source on POST
  if (!partial) {
    const hasName = out.first_name || out.last_name;
    if (!hasName) errors.push('first_name or last_name required');
  }

  // Sync legacy `name` from split fields whenever any of them change
  if ('first_name' in out || 'middle_initial' in out || 'last_name' in out) {
    const computed = computeName({
      first_name: out.first_name,
      middle_initial: out.middle_initial,
      last_name: out.last_name,
    });
    if (computed) out.name = computed;
  }

  return { out, errors };
}

router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM leads WHERE user_id = $1 AND is_client = FALSE ORDER BY updated_at DESC',
    [req.user.id]
  );
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { out, errors } = validateLeadFields(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors.join(', ') });
  if (!out.name) return res.status(400).json({ error: 'name could not be computed' });

  const { rows } = await pool.query(
    `INSERT INTO leads (
       user_id, name, first_name, middle_initial, last_name,
       email, phone, phone_home, phone_work, preferred_contact,
       stage, source, follow_up_date, dob, is_us_citizen,
       client_type, is_active, company_name, company_website
     ) VALUES (
       $1, $2, $3, $4, $5,
       $6, $7, $8, $9, $10,
       COALESCE($11, 'New Lead'), $12, $13, $14, $15,
       COALESCE($16, 'Individual'), COALESCE($17, TRUE), $18, $19
     ) RETURNING *`,
    [
      req.user.id, out.name, out.first_name || null, out.middle_initial || null, out.last_name || null,
      out.email || null, out.phone || null, out.phone_home || null, out.phone_work || null, out.preferred_contact || null,
      out.stage || null, out.source || null, out.follow_up_date || null, out.dob || null, out.is_us_citizen ?? null,
      out.client_type || null, out.is_active ?? null, out.company_name || null, out.company_website || null,
    ]
  );
  res.status(201).json(rows[0]);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
  const { rows } = await pool.query(
    'SELECT * FROM leads WHERE id = $1 AND user_id = $2',
    [id, req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  const notes = await pool.query(
    'SELECT * FROM lead_notes WHERE lead_id = $1 ORDER BY created_at DESC',
    [id]
  );
  res.json({ ...rows[0], notes: notes.rows });
});

router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
  const { out, errors } = validateLeadFields(req.body || {}, { partial: true });
  if (errors.length) return res.status(400).json({ error: errors.join(', ') });
  const keys = Object.keys(out);
  if (!keys.length) return res.status(400).json({ error: 'No fields to update' });

  const updates = [];
  const values = [];
  for (const k of keys) {
    values.push(out[k]);
    updates.push(`${k} = $${values.length}`);
  }
  updates.push(`updated_at = NOW()`);
  values.push(id, req.user.id);
  const { rows } = await pool.query(
    `UPDATE leads SET ${updates.join(', ')}
     WHERE id = $${values.length - 1} AND user_id = $${values.length} RETURNING *`,
    values
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
  const { rowCount } = await pool.query(
    'DELETE FROM leads WHERE id = $1 AND user_id = $2',
    [id, req.user.id]
  );
  if (!rowCount) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

router.post('/:id/convert', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
  const current = await pool.query(
    'SELECT is_client FROM leads WHERE id = $1 AND user_id = $2',
    [id, req.user.id]
  );
  if (!current.rowCount) return res.status(404).json({ error: 'Not found' });
  if (current.rows[0].is_client) return res.status(409).json({ error: 'Already a client' });
  const { rows } = await pool.query(
    `UPDATE leads
       SET is_client = TRUE,
           became_client_at = NOW(),
           updated_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, req.user.id]
  );
  res.json(rows[0]);
});

router.post('/:id/unconvert', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
  // Keep became_client_at as history; only flip the flag.
  const { rows } = await pool.query(
    `UPDATE leads
       SET is_client = FALSE,
           updated_at = NOW()
     WHERE id = $1 AND user_id = $2 AND is_client = TRUE
     RETURNING *`,
    [id, req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found or not a client' });
  res.json(rows[0]);
});

router.post('/:id/notes', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
  const body = cleanString(req.body?.body, { max: 5000 });
  if (!body) return res.status(400).json({ error: 'Note body required' });
  const owned = await pool.query(
    'SELECT 1 FROM leads WHERE id = $1 AND user_id = $2',
    [id, req.user.id]
  );
  if (!owned.rowCount) return res.status(404).json({ error: 'Lead not found' });
  const { rows } = await pool.query(
    'INSERT INTO lead_notes (lead_id, user_id, body) VALUES ($1, $2, $3) RETURNING *',
    [id, req.user.id, body]
  );
  res.status(201).json(rows[0]);
});

export default router;
