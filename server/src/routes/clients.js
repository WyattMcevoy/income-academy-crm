import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM leads
     WHERE user_id = $1 AND is_client = TRUE
     ORDER BY became_client_at DESC NULLS LAST, updated_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

export default router;
