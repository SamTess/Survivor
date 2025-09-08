#!/bin/sh

echo "Waiting for database to be ready..."
while ! nc -z db 5432; do
  sleep 1
done
echo "Database is ready!"

echo "Generating Prisma client..."
npx prisma generate

echo "Pushing database schema..."
npx prisma db push --accept-data-loss

echo "Generating initial API documentation..."
npx apidoc -i src/app/api -o docs/api

echo "Starting documentation watcher and server in background..."
bash scripts/docs-watch.sh &
npx http-server docs/api -p 8080 --cors -c-1 &

echo "Starting development server..."
npm run dev
