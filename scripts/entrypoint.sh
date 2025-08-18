#!/usr/bin/env sh
set -e

# Detect Azure Web App container environment
IS_AZURE="false"
if [ -d "/home/site/wwwroot" ] || [ -n "$WEBSITE_SITE_NAME" ]; then
  IS_AZURE="true"
fi

# Decide persistent DB path
if [ "$IS_AZURE" = "true" ]; then
  PERSIST_DIR="/home/site/wwwroot/prisma-data"
else
  PERSIST_DIR="/app/prisma-data"
fi

mkdir -p "$PERSIST_DIR"

# Default DATABASE_URL if not provided
: "${DATABASE_URL:=file:$PERSIST_DIR/production.db}"
export DATABASE_URL

echo "[entrypoint] NODE_ENV=$NODE_ENV PORT=$PORT"
echo "[entrypoint] Using DATABASE_URL=$DATABASE_URL"

# If DB file missing on first run and a baked-in DB exists, copy it
BAKED_DB="/app/prisma-data/production.db"
TARGET_DB="$PERSIST_DIR/production.db"
if [ ! -f "$TARGET_DB" ] || [ ! -s "$TARGET_DB" ]; then
  if [ -f "$BAKED_DB" ] && [ -s "$BAKED_DB" ]; then
    echo "[entrypoint] Seeding persistent DB from baked image copy..."
    cp -f "$BAKED_DB" "$TARGET_DB"
  else
    echo "[entrypoint] No baked DB found; will create schema on first run."
  fi
fi

# Generate Prisma client (idempotent)
echo "[entrypoint] Generating Prisma client..."
npx prisma generate

# Apply database schema (no destructive seeds here)
if [ -d "/app/prisma/migrations" ] && [ "$(ls -A /app/prisma/migrations | wc -l)" -gt 0 ]; then
  echo "[entrypoint] Running prisma migrate deploy"
  npx prisma migrate deploy || echo "[entrypoint] Migration failed, continuing..."
else
  echo "[entrypoint] No migrations found, running prisma db push"
  npx prisma db push || echo "[entrypoint] DB push failed, continuing..."
fi

echo "[entrypoint] Starting the server..."
exec npm run start
