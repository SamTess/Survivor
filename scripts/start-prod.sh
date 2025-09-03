#!/bin/sh

echo "Waiting for database to be ready..."
while ! nc -z db 5432; do
  sleep 1
done
echo "Database is ready!"

if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "Running Prisma migrations..."
  npx prisma migrate deploy
else
  echo "No migrations found, pushing schema..."
  npx prisma db push
fi

echo "Starting production server..."
npm start
