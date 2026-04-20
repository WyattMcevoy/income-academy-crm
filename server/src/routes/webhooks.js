// Stripe webhook handler.
// Mounted BEFORE express.json() in index.js because Stripe signature
// verification requires the raw request body.

import { Router } from 'express';
import express from 'express';
import Stripe from 'stripe';
import { pool } from '../db/pool.js';
import { upsertSubscriber } from '../integrations/mailerlite.js';

const router = Router();

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Lazy-init Stripe client so the server can still boot when these env vars
// aren't set yet (e.g. before Phase 6 go-live). Webhook requests will
// respond 503 until the env vars are configured.
const stripe = STRIPE_SECRET ? new Stripe(STRIPE_SECRET) : null;

router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!stripe || !WEBHOOK_SECRET) {
      console.error('stripe webhook not configured (missing env vars)');
      return res.status(503).json({ error: 'Stripe webhook not configured' });
    }

    const signature = req.headers['stripe-signature'];
    if (!signature) return res.status(400).json({ error: 'Missing signature' });

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, WEBHOOK_SECRET);
    } catch (err) {
      console.error('stripe webhook signature verification failed:', err.code || err.message || 'unknown');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object);
          break;
        // Add other event types here in future phases:
        // charge.refunded, customer.subscription.*, etc.
        default:
          // Acknowledge but don't process — Stripe expects a 2xx.
          break;
      }
      res.json({ received: true });
    } catch (err) {
      console.error('stripe webhook handler error:', err.code || err.name || 'unknown');
      res.status(500).json({ error: 'Handler error' });
    }
  }
);

async function handleCheckoutCompleted(session) {
  const sessionId = session.id;
  if (!sessionId) return;

  // Which CRM user owns leads created from Stripe webhooks?
  // Set OWNER_USER_ID on Render to your admin user_id. Defaults to 1.
  const ownerUserId = Number(process.env.OWNER_USER_ID || '1');
  if (!Number.isInteger(ownerUserId) || ownerUserId < 1) {
    throw new Error('invalid OWNER_USER_ID');
  }

  const email = session.customer_details?.email || session.customer_email || null;
  const fullName = session.customer_details?.name || null;
  const phone = session.customer_details?.phone || null;

  let firstName = null;
  let lastName = null;
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    firstName = parts[0];
    lastName = parts.length > 1 ? parts.slice(1).join(' ') : null;
  }

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || email || 'Unknown';

  // Dedupe by stripe_session_id. If Stripe re-delivers the same webhook
  // (which happens sometimes), ON CONFLICT makes this a no-op.
  await pool.query(
    `INSERT INTO leads (
      user_id, name, first_name, last_name, email, phone,
      source, stage, stripe_session_id
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      '$47 Front-End Buyer', 'New Lead', $7
    )
    ON CONFLICT (stripe_session_id) DO NOTHING`,
    [ownerUserId, displayName, firstName, lastName, email, phone, sessionId]
  );

  // Add to MailerLite so their welcome automation fires.
  // Non-blocking: if MailerLite is unreachable or misconfigured, we log and
  // continue. The customer's lead is already created; email can be manually
  // re-triggered later if needed.
  const mlKey = process.env.MAILERLITE_API_KEY;
  const mlGroupId = process.env.MAILERLITE_BUYER_GROUP_ID;
  if (mlKey && email) {
    try {
      await upsertSubscriber({
        apiKey: mlKey,
        email,
        firstName,
        lastName,
        phone,
        groupId: mlGroupId || undefined,
      });
    } catch (err) {
      console.error('mailerlite add failed:', err.message || 'unknown');
    }
  }
}

export default router;
