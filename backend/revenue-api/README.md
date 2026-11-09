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
- `ALLOWED_ORIGINS`: comma-separated exact public showroom origins. Browser requests are rejected unless their `Origin` matches this allowlist. Set this before connecting the public form. Requests without an `Origin` header (for example, server-side health checks) remain permitted.
- `PGSSLMODE=disable`: local development only. TLS verification is enabled by default.

## Endpoints

- `GET /health`: process health only; does not claim database connectivity.
- `GET /ready`: verifies PostgreSQL connectivity and creates the minimal enquiry table if needed.
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

## Evidence and limitations

A successful response from `POST /api/enquiries` proves only that an enquiry record was accepted by this API. It does not prove a proposal was sent, an order was accepted, payment was received, or delivery was completed. Those stages must be implemented and recorded separately with auditable evidence.

This pilot does not include customer login, automated outreach, payment processing, payment webhooks, or automatic order acceptance. Enquiries require human review. Do not put secrets or payment credentials in source control.
