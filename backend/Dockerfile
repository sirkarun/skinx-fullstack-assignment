# syntax=docker/dockerfile:1.7
# Build context is the REPO ROOT (not backend/), so we can also COPY posts.json.

# ---- builder ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY backend/package.json backend/package-lock.json* ./
COPY backend/prisma ./prisma
RUN npm ci

COPY backend/tsconfig.json backend/tsconfig.build.json ./
COPY backend/src ./src

RUN npx prisma generate
RUN npm run build

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl wget

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# posts.json sits at the repo root so the seed script can find it
COPY posts.json ./posts.json

COPY backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
