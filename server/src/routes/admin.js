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

// =============================================================================
// Customer Evidence Package — for chargeback defense.
//
// Compiles every piece of proof that this customer received, accessed, and
// used the Credit Builder product. Returns a single structured payload that
// can be dropped into a Stripe dispute response or saved as a PDF.
//
// Lookup is by user_id, email, or stripe_session_id from a Stripe lead.
// =============================================================================
router.get('/evidence/:identifier', async (req, res) => {
  const identifier = String(req.params.identifier || '').trim();
  if (!identifier) return res.status(400).json({ error: 'identifier required' });

  // 1) Resolve to a user (by id, email, or Stripe lead's stripe_session_id)
  let userRow = null;
  let leadRow = null;

  if (/^\d+$/.test(identifier)) {
    const r = await pool.query('SELECT id, email, name, created_at FROM users WHERE id = $1', [parseInt(identifier, 10)]);
    userRow = r.rows[0] || null;
  } else if (identifier.includes('@')) {
    const r = await pool.query('SELECT id, email, name, created_at FROM users WHERE email = $1', [identifier.toLowerCase()]);
    userRow = r.rows[0] || null;
    const lr = await pool.query('SELECT id, name, email, phone, source, stage, stripe_session_id, stripe_customer_id, created_at FROM leads WHERE LOWER(email) = $1 ORDER BY created_at DESC LIMIT 1', [identifier.toLowerCase()]);
    leadRow = lr.rows[0] || null;
  } else if (identifier.startsWith('cs_') || identifier.startsWith('sub_') || identifier.startsWith('pi_')) {
    const lr = await pool.query('SELECT id, name, email, phone, source, stage, stripe_session_id, stripe_customer_id, created_at FROM leads WHERE stripe_session_id = $1 OR stripe_customer_id = $1 LIMIT 1', [identifier]);
    leadRow = lr.rows[0] || null;
    if (leadRow?.email) {
      const r = await pool.query('SELECT id, email, name, created_at FROM users WHERE email = $1', [leadRow.email.toLowerCase()]);
      userRow = r.rows[0] || null;
    }
  }

  if (!userRow && !leadRow) {
    return res.status(404).json({ error: 'No user or lead found for that identifier' });
  }

  const userId = userRow?.id;

  // 2) Full activity log
  const activity = userId
    ? (await pool.query('SELECT event_type, metadata, ip_address, user_agent, created_at FROM user_activity WHERE user_id = $1 ORDER BY created_at ASC', [userId])).rows
    : [];

  // 3) Credit builder usage
  const progress = userId
    ? (await pool.query('SELECT step, sub_item, selected_option, completed, updated_at FROM credit_builder_progress WHERE user_id = $1 ORDER BY updated_at ASC', [userId])).rows
    : [];

  const vendors = userId
    ? (await pool.query('SELECT bureau, vendor_name, tier, applied, completed, updated_at FROM credit_builder_vendors WHERE user_id = $1 ORDER BY updated_at ASC', [userId])).rows
    : [];

  const funding = userId
    ? (await pool.query('SELECT label, amount, source, approved_on, notes, created_at FROM credit_builder_funding_events WHERE user_id = $1 ORDER BY created_at ASC', [userId])).rows
    : [];

  const scores = userId
    ? (await pool.query('SELECT score, recorded_at FROM credit_builder_scores WHERE user_id = $1 ORDER BY recorded_at ASC', [userId])).rows
    : [];

  const formData = userId
    ? (await pool.query('SELECT sub_item, form_data, updated_at FROM credit_builder_form_data WHERE user_id = $1 ORDER BY updated_at ASC', [userId])).rows
    : [];

  // 4) Lead + notes (the signed agreement reference, source, Stripe IDs)
  let leadId = leadRow?.id;
  if (!leadRow && userRow?.email) {
    const lr = await pool.query('SELECT id, name, email, phone, source, stage, stripe_session_id, stripe_customer_id, created_at FROM leads WHERE LOWER(email) = $1 ORDER BY created_at DESC LIMIT 1', [userRow.email.toLowerCase()]);
    leadRow = lr.rows[0] || null;
    leadId = leadRow?.id;
  }
  const leadNotes = leadId
    ? (await pool.query('SELECT body, created_at FROM lead_notes WHERE lead_id = $1 ORDER BY created_at ASC', [leadId])).rows
    : [];

  // 5) Headline timestamps
  const firstLogin = activity.find(a => a.event_type === 'login')?.created_at || null;
  const firstAccess = activity.find(a => a.event_type === 'cb_first_access')?.created_at || null;
  const registration = activity.find(a => a.event_type === 'register')?.created_at || userRow?.created_at || null;
  const completedItems = progress.filter(p => p.completed).length;
  const reportingVendorNames = Array.from(new Set(vendors.filter(v => v.completed).map(v => v.vendor_name)));

  res.json({
    summary: {
      user: userRow,
      lead: leadRow,
      registration_at: registration,
      first_login_at: firstLogin,
      first_credit_builder_access_at: firstAccess,
      total_logins: activity.filter(a => a.event_type === 'login').length,
      total_credit_builder_actions: activity.filter(a => a.event_type?.startsWith('cb_')).length,
      completed_sub_items: completedItems,
      vendors_applied: Array.from(new Set(vendors.filter(v => v.applied).map(v => v.vendor_name))).length,
      vendors_reporting: reportingVendorNames.length,
      reporting_vendor_names: reportingVendorNames,
      funding_events_count: funding.length,
      funding_total: funding.reduce((s, f) => s + Number(f.amount || 0), 0),
      latest_score: scores.length ? scores[scores.length - 1].score : 0,
    },
    activity,
    credit_builder: { progress, vendors, funding, scores, form_data: formData },
    lead_notes: leadNotes,
  });
});

export default router;
