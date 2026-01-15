#!/bin/sh
set -e

echo "🚀 Starting server on port ${MCP_SERVER_PORT:-8000}"

exec uvicorn main:app \
  --host 0.0.0.0 \
  --port ${MCP_SERVER_PORT:-8000}
