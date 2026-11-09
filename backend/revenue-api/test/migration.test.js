import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import pg from "pg";

const { Client } = pg;
const databaseUrl = process.env.MIGRATION_TEST_DATABASE_URL || process.env.DATABASE_URL;
const migration = await readFile(new URL("../migrations/001_create_customer_enquiries.sql", import.meta.url), "utf8");

async function inIsolatedSchema(run) {
  const client = new Client({ connectionString: databaseUrl, ssl: databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1") ? false : { rejectUnauthorized: true } });
  const schema = `migration_test_${randomUUID().replaceAll("-", "")}`;
  await client.connect();
  try {
    await client.query(`CREATE SCHEMA "${schema}"`);
    await client.query(`SET search_path TO "${schema}"`);
    await run(client);
  } finally {
    await client.query("SET search_path TO public");
    await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await client.end();
  }
}

async function applyMigration(client) {
  await client.query("BEGIN");
  try {
    await client.query(migration);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

test("fresh schema migration enforces explicit true consent", { skip: !databaseUrl && "Set MIGRATION_TEST_DATABASE_URL to run PostgreSQL migration tests" }, async () => {
  await inIsolatedSchema(async (client) => {
    await applyMigration(client);
    await assert.rejects(
      client.query(
        "INSERT INTO customer_enquiries (id, name, email, service, brief, consent) VALUES ($1, 'Test User', 'test@example.com', 'Research', 'A sufficiently detailed request', FALSE)",
        [randomUUID()]
      ),
      (error) => error.code === "23514"
    );
    const accepted = await client.query(
      "INSERT INTO customer_enquiries (id, name, email, service, brief, consent) VALUES ($1, 'Test User', 'test@example.com', 'Research', 'A sufficiently detailed request', TRUE) RETURNING consent_version",
      [randomUUID()]
    );
    assert.equal(accepted.rows[0].consent_version, "enquiry-consent-v1");
  });
});

test("legacy schema with non-consenting records fails closed without rewriting them", { skip: !databaseUrl && "Set MIGRATION_TEST_DATABASE_URL to run PostgreSQL migration tests" }, async () => {
  await inIsolatedSchema(async (client) => {
    await client.query(`
      CREATE TABLE customer_enquiries (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        service TEXT NOT NULL,
        brief TEXT NOT NULL,
        consent BOOLEAN,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    const legacyId = randomUUID();
    await client.query(
      "INSERT INTO customer_enquiries (id, name, email, service, brief, consent) VALUES ($1, 'Legacy User', 'legacy@example.com', 'Research', 'Legacy record requiring review', FALSE)",
      [legacyId]
    );
    await assert.rejects(() => applyMigration(client), (error) => error.code === "23514");
    const legacy = await client.query("SELECT consent FROM customer_enquiries WHERE id = $1", [legacyId]);
    assert.equal(legacy.rows[0].consent, false);
    const columns = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'customer_enquiries'"
    );
    assert.ok(columns.rows.some((row) => row.column_name === "consent_version") === false);
  });
});

test("legacy schema with affirmative consent upgrades and rejects later false consent", { skip: !databaseUrl && "Set MIGRATION_TEST_DATABASE_URL to run PostgreSQL migration tests" }, async () => {
  await inIsolatedSchema(async (client) => {
    await client.query(`
      CREATE TABLE customer_enquiries (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        service TEXT NOT NULL,
        brief TEXT NOT NULL,
        consent BOOLEAN,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(
      "INSERT INTO customer_enquiries (id, name, email, service, brief, consent) VALUES ($1, 'Legacy User', 'legacy@example.com', 'Research', 'Previously consented record', TRUE)",
      [randomUUID()]
    );
    await applyMigration(client);
    await assert.rejects(
      client.query(
        "INSERT INTO customer_enquiries (id, name, email, service, brief, consent) VALUES ($1, 'Test User', 'test@example.com', 'Research', 'A sufficiently detailed request', FALSE)",
        [randomUUID()]
      ),
      (error) => error.code === "23514"
    );
    const upgraded = await client.query("SELECT consent_version, consent_at FROM customer_enquiries");
    assert.equal(upgraded.rows[0].consent_version, "enquiry-consent-v1");
    assert.ok(upgraded.rows[0].consent_at);
  });
});
