-- Migration 002: Add stripe_session_id for dedup on webhook-created leads.
-- A unique index allows multiple NULLs (existing rows) while guaranteeing
-- no two webhook-created leads share a Stripe checkout session id.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS leads_stripe_session_id_uniq
  ON leads(stripe_session_id);
