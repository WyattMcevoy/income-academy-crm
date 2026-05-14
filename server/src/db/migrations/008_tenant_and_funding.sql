-- White-label readiness: add tenant_id to every credit builder table.
-- Default 'income-academy' keeps existing rows valid; future Kick Start
-- deployment will write 'kickstart' and we filter by tenant per request.

ALTER TABLE credit_builder_progress  ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'income-academy';
ALTER TABLE credit_builder_scores    ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'income-academy';
ALTER TABLE credit_builder_vendors   ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'income-academy';
ALTER TABLE credit_builder_form_data ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'income-academy';

CREATE INDEX IF NOT EXISTS cb_progress_tenant_idx ON credit_builder_progress(tenant_id);
CREATE INDEX IF NOT EXISTS cb_scores_tenant_idx ON credit_builder_scores(tenant_id);
CREATE INDEX IF NOT EXISTS cb_vendors_tenant_idx ON credit_builder_vendors(tenant_id);
CREATE INDEX IF NOT EXISTS cb_form_data_tenant_idx ON credit_builder_form_data(tenant_id);

-- Funding events: user-logged approvals (LOC, business card limits, vendor credit lines).
-- Replaces the dead "Approved Funding" KPI with real data.
CREATE TABLE IF NOT EXISTS credit_builder_funding_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL DEFAULT 'income-academy',
  label TEXT NOT NULL,         -- e.g. "Capital One Spark Cash Plus"
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  source TEXT,                 -- e.g. "Tier 4 card", "LOC", "Vendor credit"
  approved_on DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cb_funding_events_user_idx ON credit_builder_funding_events(user_id);
CREATE INDEX IF NOT EXISTS cb_funding_events_tenant_idx ON credit_builder_funding_events(tenant_id);
