#!/bin/sh
set -euo pipefail

echo "[start-prod] Launching production bootstrap..."

if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "[start-prod] Running Prisma migrations..."
  npx prisma migrate deploy
else
  echo "[start-prod] No migrations found, pushing schema..."
  npx prisma db push
fi

echo "[start-prod] Generating initial API documentation..."
npx tsx scripts/generate-swagger-docs.ts || echo "[start-prod] Swagger generation failed (non-blocking)"

echo "[start-prod] Starting documentation watcher and static server in background..."
if [ -f scripts/docs-watch.sh ]; then
  sh scripts/docs-watch.sh &
else
  echo "[start-prod] docs-watch.sh not found, skipping watcher"
fi
if [ -d docs/api ]; then
  npx http-server docs/api -p 8080 --cors -c-1 &
else
  echo "[start-prod] docs/api directory missing, skipping http-server"
fi

echo "[start-prod] Starting Next.js production server..."
npm start