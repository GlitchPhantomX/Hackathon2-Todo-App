#!/bin/bash

# Exit on error
set -e

echo "Starting Todo App Backend on Hugging Face Spaces..."

# Run database migrations if needed
if [ -f "migrate_add_recurring_fields.py" ]; then
    echo "Running database migrations..."
    python migrate_add_recurring_fields.py || echo "Migration skipped or already done"
fi

# Create data directory if it doesn't exist
mkdir -p /app/data

# Start the FastAPI application on port 7860 (Hugging Face requirement)
echo "Starting Uvicorn server on port 7860..."
exec uvicorn main:app --host 0.0.0.0 --port 7860 --workers 1
