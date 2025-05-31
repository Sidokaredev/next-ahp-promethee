# dependencies layer
FROM node:20.10.0-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps

# code layer
FROM node:20.10.0-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build

# runtime
FROM node:20.10.0-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD [ "node", "server.js" ]