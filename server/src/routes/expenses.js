import { Router } from 'express';
import { pool } from '../db/pool.js';
import { cleanString, isIsoDate, isInt, oneOf } from '../validate.js';

const router = Router();
const STATUSES = ['Pending', 'Submitted', 'Reimbursed', 'Denied'];

function validateExpenseFields(body, { partial = false } = {}) {
  const out = {};
  const errors = [];

  if ('description' in body || !partial) {
    const d = cleanString(body.description, { max: 300 });
    if (!d) errors.push('description required');
    else out.description = d;
  }
  if ('amount_cents' in body || !partial) {
    if (!isInt(body.amount_cents, { min: -100000000, max: 100000000 })) errors.push('invalid amount_cents');
    else out.amount_cents = body.amount_cents;
  }
  if ('incurred_on' in body || !partial) {
    if (!isIsoDate(body.incurred_on)) errors.push('invalid incurred_on');
    else out.incurred_on = body.incurred_on;
  }
  if ('category' in body) out.category = body.category ? cleanString(body.category, { max: 100 }) : null;
  if ('notes' in body) out.notes = body.notes ? cleanString(body.notes, { max: 2000 }) : null;
  if ('reimbursement_status' in body) {
    if (body.reimbursement_status != null && !oneOf(body.reimbursement_status, STATUSES)) {
      errors.push('invalid reimbursement_status');
    } else if (body.reimbursement_status) {
      out.reimbursement_status = body.reimbursement_status;
    }
  }
  return { out, errors };
}

router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM expenses WHERE user_id = $1 ORDER BY incurred_on DESC',
    [req.user.id]
  );
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { out, errors } = validateExpenseFields(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors.join(', ') });
  const { rows } = await pool.query(
    `INSERT INTO expenses (user_id, description, amount_cents, category, incurred_on, reimbursement_status, notes)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'Pending'), $7) RETURNING *`,
    [req.user.id, out.description, out.amount_cents, out.category || null, out.incurred_on, out.reimbursement_status || null, out.notes || null]
  );
  res.status(201).json(rows[0]);
});

router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
  const { out, errors } = validateExpenseFields(req.body || {}, { partial: true });
  if (errors.length) return res.status(400).json({ error: errors.join(', ') });
  const keys = Object.keys(out);
  if (!keys.length) return res.status(400).json({ error: 'No fields to update' });
  const updates = [];
  const values = [];
  for (const k of keys) {
    values.push(out[k]);
    updates.push(`${k} = $${values.length}`);
  }
  values.push(id, req.user.id);
  const { rows } = await pool.query(
    `UPDATE expenses SET ${updates.join(', ')}
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
    'DELETE FROM expenses WHERE id = $1 AND user_id = $2',
    [id, req.user.id]
  );
  if (!rowCount) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

export default router;
