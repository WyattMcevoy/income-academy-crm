-- Store form data entered in credit builder sub-pages
CREATE TABLE IF NOT EXISTS credit_builder_form_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sub_item TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sub_item)
);

CREATE INDEX IF NOT EXISTS cb_form_data_user_idx ON credit_builder_form_data(user_id);
