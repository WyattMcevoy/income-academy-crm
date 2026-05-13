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
