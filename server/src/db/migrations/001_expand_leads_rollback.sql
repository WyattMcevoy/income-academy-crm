-- Rollback for migration 001_expand_leads.
-- WARNING: This drops columns. Any data stored in those columns is lost.
-- Run manually in Neon's SQL editor only if you want to revert the schema.
-- The migration runner does NOT execute this automatically.

DROP INDEX IF EXISTS leads_is_active_idx;
DROP INDEX IF EXISTS leads_is_client_idx;

ALTER TABLE leads DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE leads DROP COLUMN IF EXISTS contract_status;
ALTER TABLE leads DROP COLUMN IF EXISTS company_website;
ALTER TABLE leads DROP COLUMN IF EXISTS company_name;
ALTER TABLE leads DROP COLUMN IF EXISTS became_client_at;
ALTER TABLE leads DROP COLUMN IF EXISTS is_client;
ALTER TABLE leads DROP COLUMN IF EXISTS is_active;
ALTER TABLE leads DROP COLUMN IF EXISTS is_us_citizen;
ALTER TABLE leads DROP COLUMN IF EXISTS client_type;
ALTER TABLE leads DROP COLUMN IF EXISTS preferred_contact;
ALTER TABLE leads DROP COLUMN IF EXISTS dob;
ALTER TABLE leads DROP COLUMN IF EXISTS phone_work;
ALTER TABLE leads DROP COLUMN IF EXISTS phone_home;
ALTER TABLE leads DROP COLUMN IF EXISTS last_name;
ALTER TABLE leads DROP COLUMN IF EXISTS middle_initial;
ALTER TABLE leads DROP COLUMN IF EXISTS first_name;

-- Also clean up the migration tracking row so re-running would re-apply.
DELETE FROM _migrations WHERE name = '001_expand_leads.sql';
