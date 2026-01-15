#!/bin/sh

# Set environment variable at runtime
export NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://backend-service:8000}

# Start the Next.js app (standalone)
exec node server.js
