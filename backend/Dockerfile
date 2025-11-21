FROM python:3.11-slim
WORKDIR /app
COPY ./app /app
RUN pip install --no-cache-dir fastapi uvicorn[standard]
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
# backend/Dockerfile
# Use official lightweight Node image
FROM node:18-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Install build deps
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --only=production || npm install --production

# Copy source
COPY backend/ .

# If any build steps (transpile) needed, run here (none for simple node)
# RUN npm run build

# Use a smaller runtime image
FROM node:18-alpine

WORKDIR /usr/src/app

# Create non-root user for better security
RUN addgroup -S omnigroup && adduser -S omniuser -G omnigroup

# Copy production node_modules and app source from builder
COPY --from=builder /usr/src/app /usr/src/app

# Ensure proper ownership
RUN chown -R omniuser:omnigroup /usr/src/app

# Switch to non-root user
USER omniuser

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start the server
CMD ["import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import routes from "./src/routes/index.js";
import { connectDB } from "./src/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: true })); // refine origin in production
app.use(express.json({ limit: "1mb" }));
app.use(compression());
app.use(morgan("combined"));

// Connect DB
connectDB();

// API routes
app.use("/api", routes);

// simple healthcheck
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// generic 404
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// graceful shutdown
const server = app.listen(PORT, () => console.log(`꙰ Backend running on port ${PORT}`));
process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
", "server.js"]
