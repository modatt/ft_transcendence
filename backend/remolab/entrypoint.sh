#!/bin/bash
set -e

# 1. Generate the Django project if it doesn't exist yet
if [ ! -f "manage.py" ]; then
    echo "manage.py not found. Initializing Django project..."
    django-admin startproject remolab .
    echo "Applying PostgreSQL settings template..."
    cp /app/settings.template /app/remolab/settings.py
    echo "Django project initialized."
fi

# 2. Run database migrations
echo "Running database migrations..."
python manage.py migrate

# 3. Start the application using Uvicorn
echo "Starting Uvicorn server..."
exec uvicorn remolab.asgi:application --host 0.0.0.0 --port 8000