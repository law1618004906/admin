#!/usr/bin/env sh
set -e

# Ensure prisma data directory exists
mkdir -p /app/prisma-data

# Default DATABASE_URL if not provided - always use persistent directory
: "${DATABASE_URL:=file:/app/prisma-data/production.db}"
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

# Check if database exists and has data before seeding
DB_FILE="/app/prisma-data/production.db"
if [ ! -f "$DB_FILE" ] || [ ! -s "$DB_FILE" ]; then
  echo "[entrypoint] Database file doesn't exist or is empty, running seed..."
  npx tsx prisma/seed.ts || echo "[entrypoint] Seed failed, continuing..."
else
  echo "[entrypoint] Database exists, checking if admin user exists..."
  # Try to query for admin user - if fails, run seed
  if ! npx tsx -e "
    import { PrismaClient } from '@prisma/client';
    const prisma = new PrismaClient();
    prisma.user.findFirst({ where: { email: 'admin@hamidawi.com' } }).then(user => {
      if (!user) process.exit(1);
      console.log('Admin user exists');
      process.exit(0);
    }).catch(() => process.exit(1));
  " 2>/dev/null; then
    echo "[entrypoint] Admin user not found, running seed..."
    npx tsx prisma/seed.ts || echo "[entrypoint] Seed failed, continuing..."
  else
    echo "[entrypoint] Admin user exists, skipping seed"
  fi
fi

echo "[entrypoint] Starting the server..."
# Start the server
exec npm run start
