-- Credit Builder: stores each user's step/sub-item selections and progress.

CREATE TABLE IF NOT EXISTS credit_builder_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step INTEGER NOT NULL,               -- 1-7
  sub_item TEXT NOT NULL,              -- e.g. 'business-address', 'ein'
  selected_option TEXT,                -- e.g. 'Commercial Address', 'Yes', 'LLC'
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, step, sub_item)
);

CREATE INDEX IF NOT EXISTS cb_progress_user_idx ON credit_builder_progress(user_id);
CREATE INDEX IF NOT EXISTS cb_progress_step_idx ON credit_builder_progress(user_id, step);

-- Fundability score tracking over time.
CREATE TABLE IF NOT EXISTS credit_builder_scores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,    -- 0-890
  approved_funding INTEGER NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cb_scores_user_idx ON credit_builder_scores(user_id);

-- Trade vendor distribution tracking.
CREATE TABLE IF NOT EXISTS credit_builder_vendors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bureau TEXT NOT NULL CHECK (bureau IN ('D&B', 'Equifax', 'Experian')),
  vendor_name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bureau, vendor_name)
);

CREATE INDEX IF NOT EXISTS cb_vendors_user_idx ON credit_builder_vendors(user_id);
