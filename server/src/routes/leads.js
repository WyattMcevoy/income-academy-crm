import { Router } from 'express';
import { pool } from '../db/pool.js';
import { cleanString, isIsoDate, oneOf } from '../validate.js';

const router = Router();
const STAGES = ['New Lead', 'Contacted', 'Call Booked', 'Closed', 'Lost'];

function validateLeadFields(body, { partial = false } = {}) {
  const out = {};
  const errors = [];

  if ('name' in body || !partial) {
    const name = cleanString(body.name, { max: 200 });
    if (!name) errors.push('name required');
    else out.name = name;
  }
  if ('email' in body) out.email = body.email ? cleanString(body.email, { max: 254 }) : null;
  if ('phone' in body) out.phone = body.phone ? cleanString(body.phone, { max: 40 }) : null;
  if ('source' in body) out.source = body.source ? cleanString(body.source, { max: 100 }) : null;
  if ('stage' in body) {
    if (body.stage != null && !oneOf(body.stage, STAGES)) errors.push('invalid stage');
    else if (body.stage) out.stage = body.stage;
  }
  if ('follow_up_date' in body) {
    if (body.follow_up_date == null || body.follow_up_date === '') out.follow_up_date = null;
    else if (!isIsoDate(body.follow_up_date)) errors.push('invalid follow_up_date');
    else out.follow_up_date = body.follow_up_date;
  }
  return { out, errors };
}

router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM leads WHERE user_id = $1 ORDER BY updated_at DESC',
    [req.user.id]
  );
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { out, errors } = validateLeadFields(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors.join(', ') });
  const { rows } = await pool.query(
    `INSERT INTO leads (user_id, name, email, phone, stage, source, follow_up_date)
     VALUES ($1, $2, $3, $4, COALESCE($5, 'New Lead'), $6, $7) RETURNING *`,
    [req.user.id, out.name, out.email || null, out.phone || null, out.stage || null, out.source || null, out.follow_up_date || null]
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
