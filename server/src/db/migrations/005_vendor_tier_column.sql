ALTER TABLE credit_builder_vendors ADD COLUMN IF NOT EXISTS tier INTEGER NOT NULL DEFAULT 1;
ALTER TABLE credit_builder_vendors ADD COLUMN IF NOT EXISTS applied BOOLEAN NOT NULL DEFAULT FALSE;

-- Drop the old unique constraint and recreate with tier
ALTER TABLE credit_builder_vendors DROP CONSTRAINT IF EXISTS credit_builder_vendors_user_id_bureau_vendor_name_key;
ALTER TABLE credit_builder_vendors ADD CONSTRAINT credit_builder_vendors_user_id_bureau_vendor_name_key UNIQUE(user_id, bureau, vendor_name);
