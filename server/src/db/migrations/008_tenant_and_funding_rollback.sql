DROP TABLE IF EXISTS credit_builder_funding_events;
ALTER TABLE credit_builder_form_data DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE credit_builder_vendors   DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE credit_builder_scores    DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE credit_builder_progress  DROP COLUMN IF EXISTS tenant_id;
