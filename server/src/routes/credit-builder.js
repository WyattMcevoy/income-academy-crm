import { Router } from 'express';
import { pool } from '../db/pool.js';
import { logActivity } from '../activity.js';

const router = Router();

router.get('/progress', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT step, sub_item, selected_option, completed FROM credit_builder_progress WHERE user_id = $1 ORDER BY step, sub_item',
    [req.user.id]
  );
  res.json(rows);
});

router.put('/progress', async (req, res) => {
  const { step, sub_item, selected_option } = req.body;
  if (!step || !sub_item) return res.status(400).json({ error: 'step and sub_item required' });

  const { rows } = await pool.query(
    `INSERT INTO credit_builder_progress (user_id, step, sub_item, selected_option, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (user_id, step, sub_item)
     DO UPDATE SET selected_option = $4, updated_at = NOW()
     RETURNING *`,
    [req.user.id, step, sub_item, selected_option || null]
  );
  logActivity(req.user.id, 'cb_select', { step, sub_item, selected_option }, req);
  res.json(rows[0]);
});

router.put('/progress/complete', async (req, res) => {
  const { step, sub_item, completed } = req.body;
  if (!step || !sub_item) return res.status(400).json({ error: 'step and sub_item required' });

  const { rows } = await pool.query(
    `INSERT INTO credit_builder_progress (user_id, step, sub_item, completed, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (user_id, step, sub_item)
     DO UPDATE SET completed = $4, updated_at = NOW()
     RETURNING *`,
    [req.user.id, step, sub_item, completed !== false]
  );
  logActivity(req.user.id, 'cb_complete', { step, sub_item }, req);
  res.json(rows[0]);
});

router.get('/score', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT score, approved_funding, recorded_at FROM credit_builder_scores WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 1',
    [req.user.id]
  );
  if (rows.length === 0) return res.json({ score: 0, approved_funding: 0 });
  res.json(rows[0]);
});

router.get('/score/history', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT score, approved_funding, recorded_at FROM credit_builder_scores WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 50',
    [req.user.id]
  );
  res.json(rows);
});

router.post('/score', async (req, res) => {
  const { score, approved_funding } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO credit_builder_scores (user_id, score, approved_funding) VALUES ($1, $2, $3) RETURNING *',
    [req.user.id, score || 0, approved_funding || 0]
  );
  res.json(rows[0]);
});

router.get('/vendors', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT bureau, vendor_name, tier, applied, completed FROM credit_builder_vendors WHERE user_id = $1 ORDER BY tier, bureau, vendor_name',
    [req.user.id]
  );
  res.json(rows);
});

router.put('/vendors', async (req, res) => {
  const { bureau, vendor_name, tier, applied, completed } = req.body;
  if (!bureau || !vendor_name) return res.status(400).json({ error: 'bureau and vendor_name required' });

  const { rows } = await pool.query(
    `INSERT INTO credit_builder_vendors (user_id, bureau, vendor_name, tier, applied, completed, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (user_id, bureau, vendor_name)
     DO UPDATE SET tier = $4, applied = $5, completed = $6, updated_at = NOW()
     RETURNING *`,
    [req.user.id, bureau, vendor_name, tier || 1, applied !== false, completed === true]
  );
  logActivity(req.user.id, 'cb_vendor', { bureau, vendor_name, tier, applied, completed }, req);
  res.json(rows[0]);
});

router.get('/form-data', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT sub_item, form_data, updated_at FROM credit_builder_form_data WHERE user_id = $1 ORDER BY sub_item',
    [req.user.id]
  );
  res.json(rows);
});

router.put('/form-data', async (req, res) => {
  const { sub_item, form_data } = req.body;
  if (!sub_item) return res.status(400).json({ error: 'sub_item required' });

  const { rows } = await pool.query(
    `INSERT INTO credit_builder_form_data (user_id, sub_item, form_data, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id, sub_item)
     DO UPDATE SET form_data = $3, updated_at = NOW()
     RETURNING *`,
    [req.user.id, sub_item, JSON.stringify(form_data || {})]
  );
  res.json(rows[0]);
});

export default router;
