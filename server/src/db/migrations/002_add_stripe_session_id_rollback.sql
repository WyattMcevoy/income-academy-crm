-- Rollback for migration 002.
-- WARNING: drops the column. Any leads created via Stripe webhook will
-- lose their session id reference.

DROP INDEX IF EXISTS leads_stripe_session_id_uniq;
ALTER TABLE leads DROP COLUMN IF EXISTS stripe_session_id;

DELETE FROM _migrations WHERE name = '002_add_stripe_session_id.sql';
