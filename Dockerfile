# Use glibc-based Node.js image to support 'deno' package
FROM node:18

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
ENV NODE_ENV=production
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

# Build Next.js project
RUN npm run build

# Expose ports for Next.js and Express server
EXPOSE 3000 4000

# Start both frontend and backend in production
CMD npx concurrently "npm run start" "node ./src/lib/email.js"
