#!/bin/bash
set -e

# Wait for database
echo "Waiting for database to be ready..."
python << END
import sys
import socket
import time
import os
from urllib.parse import urlparse

db_url = os.getenv('DATABASE_URL', 'postgres://salon_user:salon_password@localhost:5432/salon')
url = urlparse(db_url)
host = url.hostname
port = url.port or 5432

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
while True:
    try:
        s.connect((host, port))
        s.close()
        break
    except socket.error as ex:
        time.sleep(1)
END
echo "Database is ready!"

# Create migrations for apps
echo "Creating migrations for apps..."
python manage.py makemigrations users authentication_app businesses services_app bookings --noinput

# Run normal makemigrations for any other potential changes
python manage.py makemigrations --noinput

# Apply migrations
echo "Applying migrations..."
python manage.py migrate --noinput

# Create superuser if it doesn't exist
echo "Creating superuser if it doesn't exist..."
python manage.py create_admin

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start the main command
exec "$@"
