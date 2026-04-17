-- Migration 001: Expand leads table for Client Info and Convert-to-Client flow.
-- Purely additive. All new columns are nullable or have safe defaults.
-- Idempotent: safe to run twice (no-op second time).

-- Name split columns
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS middle_initial TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Backfill first_name for existing rows from the legacy `name` column.
-- Simple strategy: put the whole name into first_name, leave last_name NULL.
-- You can manually clean up the few existing test leads after.
UPDATE leads
  SET first_name = name
  WHERE first_name IS NULL AND name IS NOT NULL;

-- Additional phones (keep existing `phone` as primary; no rename).
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone_home TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone_work TEXT;

-- Demographic / contact preferences
ALTER TABLE leads ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferred_contact TEXT
  CHECK (preferred_contact IN ('Email', 'Phone', 'SMS'));

-- Client type + status flags
ALTER TABLE leads ADD COLUMN IF NOT EXISTS client_type TEXT
  CHECK (client_type IN ('Individual', 'Business')) DEFAULT 'Individual';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_us_citizen BOOLEAN;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_client BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS became_client_at TIMESTAMPTZ;

-- Business client fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_website TEXT;

-- Placeholders for later phases (unused until Phase 5 / Phase 6)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contract_status TEXT
  CHECK (contract_status IN ('Not sent', 'Sent', 'Signed', 'Declined'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Indexes for new common filters
CREATE INDEX IF NOT EXISTS leads_is_client_idx ON leads(is_client);
CREATE INDEX IF NOT EXISTS leads_is_active_idx ON leads(is_active);
