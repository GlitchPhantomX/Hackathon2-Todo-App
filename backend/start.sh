#!/bin/bash
set -e

# Get port from environment or use default
PORT=${PORT:-8000}

echo "Starting server on port $PORT"
uv run uvicorn main:app --host 0.0.0.0 --port $PORT