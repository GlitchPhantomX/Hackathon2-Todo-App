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

# Copy and make startup script executable
COPY start.sh .
RUN chmod +x start.sh

# Create non-root user and setup permissions
RUN groupadd -r appuser && \
    useradd -r -g appuser -m appuser && \
    mkdir -p /home/appuser/.cache/uv && \
    chown -R appuser:appuser /app /home/appuser

# Switch to non-root user
USER appuser

# Set Python path to include uv's virtual environment
ENV PATH="/app/.venv/bin:$PATH"

# Expose port
EXPOSE 8000

# Run startup script
CMD ["./start.sh"]