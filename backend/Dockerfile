# Backend Dockerfile for Todo AI Chatbot
FROM python:3.13-slim

# Install system dependencies including curl for health checks
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install UV package manager
RUN pip install uv

# Set working directory
WORKDIR /app

# Copy dependency files first for layer caching
COPY pyproject.toml uv.lock ./

# Install dependencies using UV
RUN uv sync --frozen

# Copy the rest of the application
COPY . .

# Create non-root user and setup permissions
RUN groupadd -r appuser && \
    useradd -r -g appuser -m appuser && \
    mkdir -p /home/appuser/.cache/uv && \
    chown -R appuser:appuser /app /home/appuser

# Switch to non-root user
USER appuser

# Expose port (Railway will use $PORT)
EXPOSE 8000

# Health check (comment out for Railway as port is dynamic)
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#     CMD curl -f http://localhost:8000/health || exit 1

# Run with environment variable PORT support
CMD uv run uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}