-- Tag users with the tenant that owns them.
-- 'income-academy' = direct Income Academy customer (default).
-- 'kickstart'      = customer who came in via the Kick Start CRM SSO.
-- Future tenants can be added without schema changes.

ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'income-academy';
ALTER TABLE users ADD COLUMN IF NOT EXISTS external_id TEXT;  -- Optional: their ID in the originating system

CREATE INDEX IF NOT EXISTS users_tenant_idx ON users(tenant_id);
CREATE INDEX IF NOT EXISTS users_external_idx ON users(tenant_id, external_id);
