-- 001: consent-backed customer enquiry intake
-- Apply through a reviewed migration before enabling the public enquiry form.
-- Never manufacture consent text versions or timestamps for historical rows.

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

-- Historical rows get an explicit unknown version, not today's consent version.
-- Keep their consent_at NULL: migration time is not proof of when consent occurred.
ALTER TABLE customer_enquiries
  ADD COLUMN IF NOT EXISTS consent_version TEXT;
UPDATE customer_enquiries
  SET consent_version = 'legacy-unknown'
  WHERE consent_version IS NULL;
ALTER TABLE customer_enquiries
  ALTER COLUMN consent_version SET NOT NULL;
ALTER TABLE customer_enquiries
  ALTER COLUMN consent_version SET DEFAULT 'enquiry-consent-v1';

ALTER TABLE customer_enquiries
  ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ;
ALTER TABLE customer_enquiries
  ALTER COLUMN consent_at SET DEFAULT NOW();

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
