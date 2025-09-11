#!/bin/bash


echo "Testing email server..."

if ! docker-compose ps | grep -q "email-server"; then
    echo "❌ Email server is not running. Start it with: docker-compose up -d"
    exit 1
fi

echo "Testing health endpoint..."
curl -f http://localhost:4000/health
if [ $? -eq 0 ]; then
    echo "✓ Health check passed"
else
    echo "✗ Health check failed"
    exit 1
fi

echo "Testing send-email endpoint..."
curl -X POST http://localhost:4000/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "text": "This is a test email from the email server",
    "customParam": "test value"
  }'

if [ $? -eq 0 ]; then
    echo "✓ Send email request sent successfully"
else
    echo "✗ Send email request failed"
fi

echo "Test completed."
