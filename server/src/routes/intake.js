// Public lead-intake endpoint for pre-purchase leads.
// Used by Meta Lead Ads webhooks, MailerLite forms, Zapier, manual curl,
// or any external source that needs to push a lead into the CRM.
//
// Auth: X-Intake-Token header must match the INTAKE_TOKEN env var. No JWT,
// no per-user login — the token IS the auth. Keep it private.
//
// Rate limit: 60 req/min per IP to prevent spam.

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { pool } from '../db/pool.js';
import { cleanString, isIsoDate, oneOf, ENUMS, computeName } from '../validate.js';

const router = Router();

const INTAKE_TOKEN = process.env.INTAKE_TOKEN;
const OWNER_USER_ID = Number(process.env.OWNER_USER_ID || '1');

// Rate limit: 60 requests per minute per IP.
const intakeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Try again shortly.' },
});

router.post('/', intakeLimiter, async (req, res) => {
  // Reject immediately if the intake token isn't configured on this server.
  if (!INTAKE_TOKEN) {
    console.error('intake endpoint hit but INTAKE_TOKEN is not set');
    return res.status(503).json({ error: 'Intake not configured' });
  }

  const provided = req.headers['x-intake-token'];
  if (!provided || provided !== INTAKE_TOKEN) {
    return res.status(401).json({ error: 'Invalid or missing X-Intake-Token header' });
  }

  const body = req.body || {};

  // Minimal required fields: must have at least first_name or last_name or email.
  const firstName = cleanString(body.first_name, { max: 100 });
  const lastName = cleanString(body.last_name, { max: 100 });
  const email = cleanString(body.email, { max: 254 });
  if (!firstName && !lastName && !email) {
    return res.status(400).json({
      error: 'At least one of first_name, last_name, email is required',
    });
  }

  // Optional fields.
  const phone = cleanString(body.phone, { max: 40 });
  const source = cleanString(body.source, { max: 100 }) || 'External Intake';
  const stage = body.stage && oneOf(body.stage, ENUMS.STAGE) ? body.stage : 'New Lead';

  let followUpDate = null;
  if (body.follow_up_date) {
    if (!isIsoDate(body.follow_up_date)) {
      return res.status(400).json({ error: 'Invalid follow_up_date (YYYY-MM-DD)' });
    }
    followUpDate = body.follow_up_date;
  }

  const name =
    computeName({ first_name: firstName, last_name: lastName }) ||
    email ||
    'Unknown';

  try {
    const { rows } = await pool.query(
      `INSERT INTO leads (
        user_id, name, first_name, last_name, email, phone,
        source, stage, follow_up_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      ) RETURNING *`,
      [
        OWNER_USER_ID,
        name,
        firstName,
        lastName,
        email,
        phone,
        source,
        stage,
        followUpDate,
      ]
    );

    const lead = rows[0];

    // Optional: accept a note in the initial payload and save it.
    const noteBody = cleanString(body.notes, { max: 5000 });
    if (noteBody) {
      await pool.query(
        `INSERT INTO lead_notes (lead_id, user_id, body) VALUES ($1, $2, $3)`,
        [lead.id, OWNER_USER_ID, noteBody]
      );
    }

    res.status(201).json({ ok: true, lead });
  } catch (err) {
    console.error('intake insert failed:', err.code || 'unknown');
    res.status(500).json({ error: 'Insert failed' });
  }
});

// =============================================================================
// Public Fundability Score quiz lead capture.
// No X-Intake-Token required — exposed to the public landing page.
// Heavily rate-limited and restricted to a single source tag so a leaked
// endpoint can only create quiz leads, never inject arbitrary data.
// =============================================================================

const quizLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 6, // 6 submissions per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Try again shortly.' },
});

router.post('/fundability-quiz', quizLimiter, async (req, res) => {
  const body = req.body || {};
  const email = cleanString(body.email, { max: 254 });
  const firstName = cleanString(body.first_name, { max: 100 });

  if (!email || !email.includes('@') || email.length < 5) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const answers = body.answers && typeof body.answers === 'object' ? body.answers : {};
  const score = Math.max(0, Math.min(890, parseInt(body.score, 10) || 0));

  const notes = `Fundability Quiz | score: ${score}/890 | answers: ${JSON.stringify(answers).slice(0, 1500)}`;

  try {
    const { rows } = await pool.query(
      `INSERT INTO leads (
        user_id, name, first_name, email, source, stage
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        OWNER_USER_ID,
        firstName || email,
        firstName,
        email,
        'Fundability Quiz',
        'New Lead',
      ]
    );

    if (notes) {
      await pool.query(
        `INSERT INTO lead_notes (lead_id, user_id, body) VALUES ($1, $2, $3)`,
        [rows[0].id, OWNER_USER_ID, notes]
      );
    }

    res.status(201).json({ ok: true, score });
  } catch (err) {
    if (err.code === '23505') {
      // Unique-violation on email: don't duplicate, but still return the score.
      return res.status(200).json({ ok: true, score, deduplicated: true });
    }
    console.error('fundability quiz insert failed:', err.code || 'unknown');
    res.status(500).json({ error: 'Could not save your response' });
  }
});

export default router;
