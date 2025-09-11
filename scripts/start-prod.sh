#!/bin/sh

if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "Running Prisma migrations..."
  npx prisma migrate deploy
else
  echo "No migrations found, pushing schema..."
  npx prisma db push
fi

API_DIR="src/app/api"
if [ -d "$API_DIR" ]; then
  echo "Generating initial API documentation..."
  npx tsx scripts/generate-swagger-docs.ts || echo "Swagger generation skipped or failed." 1>&2
  echo "Starting documentation watcher and server in background..."
  bash scripts/docs-watch.sh &
else
  echo "⚠ API source directory ($API_DIR) not present in runtime image; skipping live doc generation/watch." 1>&2
fi
if [ -d "docs/api" ]; then
  npx http-server docs/api -p 8080 --cors -c-1 &
else
  echo "⚠ No pre-generated docs found to serve on 8080." 1>&2
fi

echo "Starting production server..."
npm start