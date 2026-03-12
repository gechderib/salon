#!/bin/bash
set -e

# Wait for database
echo "Waiting for database to be ready..."
python << END
import sys
import socket
import time

arg1 = 'db'
arg2 = 5432

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
while True:
    try:
        s.connect((arg1, arg2))
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

# Start the main command
exec "$@"
