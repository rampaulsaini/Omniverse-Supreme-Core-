# Shirmani Revenue API (pilot)

A deliberately small Node.js API for the first real revenue workflow: customer enquiry intake with explicit consent and PostgreSQL persistence.

## Runtime

- Node.js 22+
- Railway service root directory: `/backend/revenue-api`
- Start command: `npm start`
- Health check path: `/health`
- Readiness check path: `/ready`

## Required environment

- `DATABASE_URL`: Neon PostgreSQL connection string (store as a Railway secret; never commit it).
- `PUBLIC_ENQUIRIES_ENABLED`: must be set to the exact string `true` only after launch prerequisites are approved; otherwise `POST /api/enquiries` remains disabled and returns HTTP 503.
- `ALLOWED_ORIGINS`: comma-separated exact public showroom origins. Browser requests are rejected unless their `Origin` matches this allowlist. Set this before connecting the public form. Requests without an `Origin` header (for example, server-side health checks) remain permitted.
- `PGSSLMODE=disable`: local development only. TLS verification is enabled by default.

## Local verification

Run `npm install` and `npm run check`. The test suite uses an isolated HTTP client and deliberately runs without a database secret; it verifies health/readiness separation, consent validation, rejection of unconfigured enquiries, route handling, and the configured browser-origin policy. The migration SQL has been applied and checked on an isolated temporary Neon branch, including a successful consented insert and a rejected `consent = false` insert; that temporary branch was then discarded. This does not prove the production database has been migrated or that the deployed API can connect to it.

## Database migration

Apply `migrations/001_create_customer_enquiries.sql` through a reviewed migration workflow before enabling the public enquiry form. Test it on an isolated Neon branch first. The API intentionally does not create or alter tables at runtime; `/ready` only verifies the schema and enquiry writes fail closed if the migration has not been applied.

Historical rows are deliberately not assigned today's consent evidence: the migration marks their consent text version as `legacy-unknown` and leaves `consent_at` NULL. New rows receive `enquiry-consent-v1` and a server timestamp. This prevents migration time from being misrepresented as the time a person consented.

## Endpoints

- `GET /health`: process health only; does not claim database connectivity.
- `GET /ready`: verifies PostgreSQL connectivity and confirms the expected enquiry table/columns already exist. It never changes the database schema.
- `POST /api/enquiries`: validates and stores a consented enquiry; returns a reference ID.

Example request:

```json
{
  "name": "Customer name",
  "email": "customer@example.com",
  "service": "Research summary",
  "brief": "A short description of the requested work.",
  "consent": true
}
```

## Public endpoint abuse boundary

CORS is a browser-origin policy, not authentication: non-browser clients can omit or forge an `Origin` header and may still call the public endpoint. The app explicitly keeps Express `trust proxy` disabled until the exact Railway proxy-hop chain is verified; forwarded client-IP headers are therefore not blindly trusted. Behind Railway this conservative setting may group requests under the proxy IP and cause shared rate-limit pressure, so verify the real proxy chain and test spoof resistance before tuning it. The current 30-requests-per-15-minutes rate limit is a basic safeguard, not bot protection or a guarantee against distributed abuse. Public intake is disabled by default through `PUBLIC_ENQUIRIES_ENABLED`; do not set it to `true` until the consent notice, migration, abuse controls, and monitoring are approved. Before public launch, add an appropriate anti-automation control (for example, a server-verified challenge or equivalent), request monitoring, and an operational process for abuse reports. Do not describe the endpoint as private or abuse-proof.

## Public consent notice status

The bilingual consent/privacy notice is currently a **draft only**, not approved or published: [`PUBLIC-CONSENT-DRAFT.md`](./PUBLIC-CONSENT-DRAFT.md). It contains placeholders for the responsible entity, retention period, processors, and privacy contact. Do not collect real customer information or connect the public form until those details are completed, reviewed, published, and the displayed wording is aligned with the API consent version (`enquiry-consent-v1`).

## Evidence and limitations

A successful response from `POST /api/enquiries` proves only that an enquiry record was accepted by this API. New records store the server-side consent timestamp and fixed consent text version (`enquiry-consent-v1`); historical rows remain explicitly marked `legacy-unknown` with no fabricated consent timestamp. The public form must display the matching, reviewed consent wording before sending `consent: true`. Do not connect the public form until that wording and a privacy/retention notice are published. It does not prove a proposal was sent, an order was accepted, payment was received, or delivery was completed. Those stages must be implemented and recorded separately with auditable evidence.

This pilot does not include customer login, automated outreach, payment processing, payment webhooks, or automatic order acceptance. Define and publish a lawful data-retention period and a contact for privacy requests before collecting real customer details. Enquiries require human review. Do not put secrets or payment credentials in source control.
