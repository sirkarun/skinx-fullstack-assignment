#!/bin/sh
set -e

echo "[entrypoint] Applying database migrations..."
npx prisma migrate deploy

echo "[entrypoint] Seeding database (default user + posts.json)..."
npm run seed || echo "[entrypoint] WARNING: seed failed (continuing anyway)"

echo "[entrypoint] Starting backend: $@"
exec "$@"
