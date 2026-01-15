#!/bin/bash
set -e

# Railway provides PORT environment variable
PORT=${PORT:-8000}

echo "🚀 Starting server on port $PORT"
echo "📍 DATABASE_URL available: ${DATABASE_URL:+YES}"

# Start uvicorn with Railway's PORT
exec uv run uvicorn main:app --host 0.0.0.0 --port $PORT --log-level info --access-log