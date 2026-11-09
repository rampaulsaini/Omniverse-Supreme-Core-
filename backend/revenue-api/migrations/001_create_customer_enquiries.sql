-- 001: consent-backed customer enquiry intake
-- Apply through a reviewed migration before enabling the public enquiry form.
-- Legacy rows without affirmative consent intentionally make validation fail:
-- never manufacture consent or silently migrate those records.

CREATE TABLE IF NOT EXISTS customer_enquiries (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT NOT NULL,
  brief TEXT NOT NULL,
  consent BOOLEAN NOT NULL,
  consent_version TEXT NOT NULL DEFAULT 'enquiry-consent-v1',
  consent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewing', 'proposal_sent', 'accepted', 'declined', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT customer_enquiries_consent_true_check CHECK (consent IS TRUE)
);

-- Add metadata columns for an earlier pilot table without changing historical
-- consent values or inventing consent for rows predating this migration.
ALTER TABLE customer_enquiries
  ADD COLUMN IF NOT EXISTS consent_version TEXT NOT NULL DEFAULT 'enquiry-consent-v1';
ALTER TABLE customer_enquiries
  ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Ensure an existing table also has an affirmative-consent constraint.
-- NOT VALID defers the scan; VALIDATE below must pass before migration completes.
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'customer_enquiries'::regclass
      AND conname = 'customer_enquiries_consent_true_check'
  ) THEN
    ALTER TABLE customer_enquiries
      ADD CONSTRAINT customer_enquiries_consent_true_check
      CHECK (consent IS TRUE) NOT VALID;
  END IF;
END
$migration$;

ALTER TABLE customer_enquiries
  VALIDATE CONSTRAINT customer_enquiries_consent_true_check;
ALTER TABLE customer_enquiries
  ALTER COLUMN consent SET NOT NULL;

CREATE INDEX IF NOT EXISTS customer_enquiries_created_at_idx
  ON customer_enquiries (created_at DESC);
