# Use glibc-based Node.js image to support 'deno' package

# ---- Build Stage ----
FROM node:20 AS builder
WORKDIR /app

# Install ALL dependencies (including devDeps needed to build)
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:20 AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy built output and runtime files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/src/lib ./src/lib

# Expose ports for Next.js and Express server
EXPOSE 3000 4000

# Start both frontend and backend in production
CMD ["node_modules/.bin/concurrently", "npm run start", "node ./src/lib/email.js"]
