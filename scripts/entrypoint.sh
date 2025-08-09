#!/usr/bin/env sh
set -e

# Default DATABASE_URL if not provided
: "${DATABASE_URL:=file:/app/prisma-data/dev.db}"
export DATABASE_URL

# Show environment info (redacted)
echo "[entrypoint] NODE_ENV=$NODE_ENV PORT=$PORT"
echo "[entrypoint] Using DATABASE_URL=$DATABASE_URL"

# Generate Prisma client (idempotent)
echo "[entrypoint] Generating Prisma client..."
npx prisma generate

# Apply database schema
if [ -d "/app/prisma/migrations" ] && [ "$(ls -A /app/prisma/migrations | wc -l)" -gt 0 ]; then
  echo "[entrypoint] Running prisma migrate deploy"
  npx prisma migrate deploy || echo "[entrypoint] Migration failed, continuing..."
else
  echo "[entrypoint] No migrations found, running prisma db push"
  npx prisma db push || echo "[entrypoint] DB push failed, continuing..."
fi

echo "[entrypoint] Starting the server..."
# Start the server
exec npm run start
