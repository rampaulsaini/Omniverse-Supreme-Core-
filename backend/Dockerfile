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
CMD ["node", "server.js"]
