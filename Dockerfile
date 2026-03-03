# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy standalone server (includes all needed node_modules)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy email backend
COPY --from=builder /app/src/lib/email.js ./src/lib/email.js

# Install only concurrently for running both processes
RUN npm install --no-save concurrently

# Create content directory for blog posts
RUN mkdir -p content/blog

EXPOSE 3000 4000

CMD ["npx", "concurrently", "node server.js", "node src/lib/email.js"]
