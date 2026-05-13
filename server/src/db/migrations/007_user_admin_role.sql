ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Flag the owner account so they can access /admin from day one.
-- Adjust the email below if the owner email changes.
UPDATE users SET is_admin = TRUE WHERE email = 'whbm08@yahoo.com';
