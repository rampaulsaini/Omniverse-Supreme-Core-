import test, { before } from "node:test";
import assert from "node:assert/strict";

process.env.ALLOWED_ORIGINS = "https://showroom.example";
delete process.env.DATABASE_URL;

const { default: request } = await import("supertest");
const { app } = await import("../server.js");

before(() => {
  // Tests deliberately run without a database secret or a network listener.
});

test("health reports process health without claiming database readiness", async () => {
  const response = await request(app).get("/health");
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    status: "ok",
    service: "shirmani-revenue-api"
  });
});

test("readiness stays unavailable when DATABASE_URL is absent", async () => {
  const response = await request(app).get("/ready");
  assert.equal(response.status, 503);
  assert.equal(response.body.status, "not_ready");
});

test("enquiry rejects missing explicit consent", async () => {
  const response = await request(app).post("/api/enquiries").send({
    name: "Test Customer",
    email: "customer@example.com",
    service: "Research summary",
    brief: "Please prepare a short research summary for review."
  });
  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Invalid enquiry");
  assert.ok(response.body.fields.includes("consent"));
});

test("enquiry rejects false consent and unknown fields", async () => {
  const base = {
    name: "Test Customer",
    email: "customer@example.com",
    service: "Research summary",
    brief: "Please prepare a short research summary for review."
  };
  const falseConsent = await request(app).post("/api/enquiries")
    .send({ ...base, consent: false });
  assert.equal(falseConsent.status, 400);

  const extraField = await request(app).post("/api/enquiries")
    .send({ ...base, consent: true, isPaid: true });
  assert.equal(extraField.status, 400);
});

test("valid enquiry is not falsely accepted when database is not configured", async () => {
  const response = await request(app).post("/api/enquiries").send({
    name: "Test Customer",
    email: "customer@example.com",
    service: "Research summary",
    brief: "Please prepare a short research summary for review.",
    consent: true
  });
  assert.equal(response.status, 503);
  assert.equal(response.body.error, "Enquiry service is not configured yet");
});

test("unknown routes return a clear 404", async () => {
  const response = await request(app).get("/not-a-real-route");
  assert.equal(response.status, 404);
});

test("approved showroom origin receives an explicit CORS allow header", async () => {
  const response = await request(app).get("/health")
    .set("Origin", "https://showroom.example");
  assert.equal(response.status, 200);
  assert.equal(response.headers["access-control-allow-origin"], "https://showroom.example");
});

test("unapproved browser origin is not granted CORS access", async () => {
  const response = await request(app).get("/health")
    .set("Origin", "https://unapproved.example");
  assert.equal(response.status, 403);
  assert.equal(response.body.error, "Origin not allowed");
  assert.equal(response.headers["access-control-allow-origin"], undefined);
});

test("malformed JSON receives a controlled client error", async () => {
  const response = await request(app)
    .post("/api/enquiries")
    .set("Content-Type", "application/json")
    .send('{"name":');
  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Invalid JSON body");
});
