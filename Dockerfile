# Build Stage
FROM node:20.10.0-alpine AS builder

WORKDIR /app

# Copy only what's needed for install & build
COPY package.json package-lock.json ./
COPY next.config.ts ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Runtime Stage
FROM node:20.10.0-alpine

WORKDIR /app

# Copy only runtime dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps --omit=dev

# Copy build output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "run", "start"]