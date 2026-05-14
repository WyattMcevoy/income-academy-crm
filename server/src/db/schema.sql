-- Canonical schema for Income Academy CRM.
-- This reflects the CURRENT state after all migrations are applied.
-- For fresh installs: run `npm run db:init` — this file creates everything.
-- For existing installs: run `npm run db:migrate` — see ./migrations/ for incremental changes.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  tenant_id TEXT NOT NULL DEFAULT 'income-academy',
  external_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_tenant_idx ON users(tenant_id);
CREATE INDEX IF NOT EXISTS users_external_idx ON users(tenant_id, external_id);

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Legacy display name (kept for backwards compat; populated from first/last by app logic)
  name TEXT NOT NULL,

  -- Split name components
  first_name TEXT,
  middle_initial TEXT,
  last_name TEXT,

  -- Contact
  email TEXT,
  phone TEXT,        -- primary phone (typically cell)
  phone_home TEXT,
  phone_work TEXT,
  preferred_contact TEXT CHECK (preferred_contact IN ('Email', 'Phone', 'SMS')),

  -- Demographic
  dob DATE,
  is_us_citizen BOOLEAN,

  -- Pipeline
  stage TEXT NOT NULL DEFAULT 'New Lead'
    CHECK (stage IN ('New Lead', 'Contacted', 'Call Booked', 'Closed', 'Lost')),
  source TEXT,
  follow_up_date DATE,

  -- Client type + lifecycle
  client_type TEXT CHECK (client_type IN ('Individual', 'Business')) DEFAULT 'Individual',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_client BOOLEAN NOT NULL DEFAULT FALSE,
  became_client_at TIMESTAMPTZ,

  -- Business client fields
  company_name TEXT,
  company_website TEXT,

  -- Integration placeholders (populated by Phase 5 / Phase 6)
  contract_status TEXT CHECK (contract_status IN ('Not sent', 'Sent', 'Signed', 'Declined')),
  stripe_customer_id TEXT,
  stripe_session_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_user_id_idx ON leads(user_id);
CREATE INDEX IF NOT EXISTS leads_stage_idx ON leads(stage);
CREATE INDEX IF NOT EXISTS leads_follow_up_idx ON leads(follow_up_date);
CREATE INDEX IF NOT EXISTS leads_is_client_idx ON leads(is_client);
CREATE INDEX IF NOT EXISTS leads_is_active_idx ON leads(is_active);
CREATE UNIQUE INDEX IF NOT EXISTS leads_stripe_session_id_uniq ON leads(stripe_session_id);

CREATE TABLE IF NOT EXISTS lead_notes (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lead_notes_lead_id_idx ON lead_notes(lead_id);

CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  category TEXT,
  incurred_on DATE NOT NULL,
  reimbursement_status TEXT NOT NULL DEFAULT 'Pending'
    CHECK (reimbursement_status IN ('Pending', 'Submitted', 'Reimbursed', 'Denied')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_status_idx ON expenses(reimbursement_status);

-- Credit Builder: user step/sub-item selections and progress.
CREATE TABLE IF NOT EXISTS credit_builder_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step INTEGER NOT NULL,
  sub_item TEXT NOT NULL,
  selected_option TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  tenant_id TEXT NOT NULL DEFAULT 'income-academy',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, step, sub_item)
);

CREATE INDEX IF NOT EXISTS cb_progress_user_idx ON credit_builder_progress(user_id);
CREATE INDEX IF NOT EXISTS cb_progress_step_idx ON credit_builder_progress(user_id, step);
CREATE INDEX IF NOT EXISTS cb_progress_tenant_idx ON credit_builder_progress(tenant_id);

CREATE TABLE IF NOT EXISTS credit_builder_scores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  approved_funding INTEGER NOT NULL DEFAULT 0,
  tenant_id TEXT NOT NULL DEFAULT 'income-academy',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cb_scores_user_idx ON credit_builder_scores(user_id);
CREATE INDEX IF NOT EXISTS cb_scores_tenant_idx ON credit_builder_scores(tenant_id);

CREATE TABLE IF NOT EXISTS credit_builder_vendors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bureau TEXT NOT NULL CHECK (bureau IN ('D&B', 'Equifax', 'Experian')),
  vendor_name TEXT NOT NULL,
  tier INTEGER NOT NULL DEFAULT 1,
  applied BOOLEAN NOT NULL DEFAULT FALSE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  tenant_id TEXT NOT NULL DEFAULT 'income-academy',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bureau, vendor_name)
);

CREATE INDEX IF NOT EXISTS cb_vendors_user_idx ON credit_builder_vendors(user_id);
CREATE INDEX IF NOT EXISTS cb_vendors_tenant_idx ON credit_builder_vendors(tenant_id);

-- Credit Builder: form data entered in sub-pages.
CREATE TABLE IF NOT EXISTS credit_builder_form_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sub_item TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}',
  tenant_id TEXT NOT NULL DEFAULT 'income-academy',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sub_item)
);

CREATE INDEX IF NOT EXISTS cb_form_data_user_idx ON credit_builder_form_data(user_id);
CREATE INDEX IF NOT EXISTS cb_form_data_tenant_idx ON credit_builder_form_data(tenant_id);

-- User-logged funding events (LOC, business card limits, vendor credit lines).
CREATE TABLE IF NOT EXISTS credit_builder_funding_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL DEFAULT 'income-academy',
  label TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  source TEXT,
  approved_on DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cb_funding_events_user_idx ON credit_builder_funding_events(user_id);
CREATE INDEX IF NOT EXISTS cb_funding_events_tenant_idx ON credit_builder_funding_events(tenant_id);

-- User activity / event log
CREATE TABLE IF NOT EXISTS user_activity (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_activity_user_idx ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS user_activity_type_idx ON user_activity(event_type);
CREATE INDEX IF NOT EXISTS user_activity_created_idx ON user_activity(created_at DESC);

-- Link health check results
CREATE TABLE IF NOT EXISTS link_health_checks (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  sub_item TEXT NOT NULL,
  status_code INTEGER,
  ok BOOLEAN NOT NULL DEFAULT FALSE,
  error_message TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS link_health_url_idx ON link_health_checks(url);
CREATE INDEX IF NOT EXISTS link_health_checked_idx ON link_health_checks(checked_at DESC);

-- Migration tracking table (created automatically by migrate.js; included here
-- so a fresh install has it too).
CREATE TABLE IF NOT EXISTS _migrations (
  name TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
