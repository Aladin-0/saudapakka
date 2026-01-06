#!/bin/bash
set -e

# Wait for Postgres
while ! nc -z postgres 5432; do
  echo "Waiting for Postgres..."
  sleep 2
done

echo "Postgres ready!"

# Temporarily skip Django to debug
echo "Skipping Django setup for debug - starting Gunicorn directly"
exec gunicorn saudapakka.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120 --reload
