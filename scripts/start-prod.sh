#!/bin/sh

if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "Running Prisma migrations..."
  npx prisma migrate deploy
else
  echo "No migrations found, pushing schema..."
  npx prisma db push
fi

echo "Generating initial API documentation..."
npx tsx scripts/generate-swagger-docs.ts

echo "Starting documentation watcher and server in background..."
bash scripts/docs-watch.sh &
npx http-server docs/api -p 8080 --cors -c-1 &

echo "Starting production server..."
npm start