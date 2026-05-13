import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

// Recent activity feed
router.get('/activity', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const offset = parseInt(req.query.offset) || 0;
  const userId = req.query.user_id;

  let query = `
    SELECT a.id, a.user_id, u.email, u.name, a.event_type, a.metadata, a.ip_address, a.created_at
    FROM user_activity a
    LEFT JOIN users u ON u.id = a.user_id
  `;
  const params = [];

  if (userId) {
    params.push(userId);
    query += ` WHERE a.user_id = $${params.length}`;
  }

  query += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const { rows } = await pool.query(query, params);
  res.json(rows);
});

// User summary stats
router.get('/users', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT
      u.id, u.email, u.name, u.created_at,
      (SELECT MAX(created_at) FROM user_activity WHERE user_id = u.id AND event_type = 'login') AS last_login,
      (SELECT COUNT(*) FROM user_activity WHERE user_id = u.id) AS total_events,
      (SELECT COUNT(*) FROM credit_builder_progress WHERE user_id = u.id AND completed = true) AS cb_completed,
      (SELECT COUNT(*) FROM credit_builder_vendors WHERE user_id = u.id AND completed = true) AS vendors_reporting
    FROM users u
    ORDER BY u.created_at DESC
  `);
  res.json(rows);
});

// Dashboard KPIs
router.get('/stats', async (req, res) => {
  const [users, logins7d, cbActive, vendorsReporting] = await Promise.all([
    pool.query('SELECT COUNT(*) AS count FROM users'),
    pool.query("SELECT COUNT(DISTINCT user_id) AS count FROM user_activity WHERE event_type = 'login' AND created_at > NOW() - INTERVAL '7 days'"),
    pool.query('SELECT COUNT(DISTINCT user_id) AS count FROM credit_builder_progress'),
    pool.query('SELECT COUNT(*) AS count FROM credit_builder_vendors WHERE completed = true'),
  ]);

  res.json({
    total_users: parseInt(users.rows[0].count),
    active_users_7d: parseInt(logins7d.rows[0].count),
    cb_active_users: parseInt(cbActive.rows[0].count),
    vendors_reporting: parseInt(vendorsReporting.rows[0].count),
  });
});

// Link health check results
router.get('/link-health', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT DISTINCT ON (url) url, resource_name, sub_item, status_code, ok, error_message, checked_at
    FROM link_health_checks
    ORDER BY url, checked_at DESC
  `);
  res.json(rows);
});

// Trigger a link health check
router.post('/link-health/run', async (req, res) => {
  // Import dynamically to avoid circular deps
  const { runLinkHealthCheck } = await import('../link-checker.js');
  const results = await runLinkHealthCheck();
  res.json({ checked: results.length, broken: results.filter(r => !r.ok).length, results });
});

export default router;
