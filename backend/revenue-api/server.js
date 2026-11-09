import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pg from "pg";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { pathToFileURL } from "node:url";

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 3000);
const databaseUrl = process.env.DATABASE_URL;

app.disable("x-powered-by");
// Do not trust forwarded client-IP headers until the exact Railway proxy chain is verified.
app.set("trust proxy", false);
app.use(helmet());
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",").map((value) => value.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    // Permit same-origin/server requests without an Origin header; browsers must match the allowlist.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed"));
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json({ limit: "16kb" }));
app.use("/api/", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false }));

const pool = databaseUrl ? new Pool({
  connectionString: databaseUrl,
  ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: true },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
}) : null;

const enquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  service: z.string().trim().min(2).max(120),
  brief: z.string().trim().min(10).max(5000),
  consent: z.literal(true)
}).strict();

async function verifySchema() {
  if (!pool) throw new Error("DATABASE_URL is not configured");
  await pool.query(
    "SELECT id, name, email, service, brief, consent, consent_version, consent_at, status, created_at FROM customer_enquiries LIMIT 0"
  );
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "shirmani-revenue-api" });
});

app.get("/ready", async (_req, res) => {
  if (!pool) return res.status(503).json({ status: "not_ready", reason: "DATABASE_URL is not configured" });
  try {
    await verifySchema();
    return res.json({ status: "ready", database: "connected" });
  } catch {
    return res.status(503).json({ status: "not_ready", database: "unavailable" });
  }
});

app.post("/api/enquiries", async (req, res) => {
  const parsed = enquirySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid enquiry", fields: parsed.error.issues.map((issue) => issue.path.join(".")) });
  }
  if (process.env.PUBLIC_ENQUIRIES_ENABLED !== "true") {
    return res.status(503).json({ error: "Public enquiry intake is disabled until launch prerequisites are approved" });
  }
  if (!pool) return res.status(503).json({ error: "Enquiry service is not configured yet" });

  try {
    const id = randomUUID();
    const { name, email, service, brief, consent } = parsed.data;
    await pool.query(
      "INSERT INTO customer_enquiries (id, name, email, service, brief, consent, consent_version, consent_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())",
      [id, name, email, service, brief, consent, "enquiry-consent-v1"]
    );
    return res.status(201).json({
      accepted: true,
      enquiry_id: id,
      message: "Enquiry received for human review. This is not an order or payment confirmation."
    });
  } catch (error) {
    console.error("Enquiry persistence failed:", error.message);
    return res.status(503).json({ error: "Enquiry could not be saved. Please try again later." });
  }
});

app.use((error, _req, res, _next) => {
  if (error?.message === "Origin not allowed") {
    return res.status(403).json({ error: "Origin not allowed" });
  }
  if (error?.type === "entity.too.large" || error?.status === 413) {
    return res.status(413).json({ error: "Request body too large" });
  }
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  console.error("Request handling failed:", error?.message || "Unknown error");
  return res.status(500).json({ error: "Internal server error" });
});

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

export { app };

async function shutdown(server) {
  server.close(async () => {
    if (pool) await pool.end();
    process.exit(0);
  });
}

function start() {
  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`Shirmani Revenue API listening on ${port}`);
  });
  process.on("SIGTERM", () => shutdown(server));
  process.on("SIGINT", () => shutdown(server));
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  start();
}
