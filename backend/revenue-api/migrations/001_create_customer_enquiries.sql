-- 001: consent-backed customer enquiry intake
-- Apply through a reviewed migration before enabling the public enquiry form.

CREATE TABLE IF NOT EXISTS customer_enquiries (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT NOT NULL,
  brief TEXT NOT NULL,
  consent BOOLEAN NOT NULL CHECK (consent = TRUE),
  consent_version TEXT NOT NULL DEFAULT 'enquiry-consent-v1',
  consent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewing', 'proposal_sent', 'accepted', 'declined', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe additive upgrades if an earlier pilot table already exists.
ALTER TABLE customer_enquiries
  ADD COLUMN IF NOT EXISTS consent_version TEXT NOT NULL DEFAULT 'enquiry-consent-v1';
ALTER TABLE customer_enquiries
  ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS customer_enquiries_created_at_idx
  ON customer_enquiries (created_at DESC);
