#!/bin/bash
set -x
set -e

# Pre-create logs dir
mkdir -p /logs

# Wait for Postgres
# Uses POSTGRES_HOST env variable to match docker-compose service name
POSTGRES_HOST=${POSTGRES_HOST:-postgres}
while ! nc -z $POSTGRES_HOST 5432; do
  echo "Waiting for Postgres at $POSTGRES_HOST..."
  sleep 2
done

# Django migrations (slowest step)
echo "Running migrations..."
python manage.py migrate --noinput

# Collect static
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start Gunicorn
if [ $# -gt 0 ]; then
    exec "$@"
else
    echo "Starting Gunicorn..."
    # 120s timeout to handle slow initial requests/migrations if they overlap
    exec gunicorn saudapakka.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120
fi