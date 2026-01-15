# Quickstart Guide: Advanced Task Logic & Notification Services

## Prerequisites

- Python 3.11 or higher
- Dapr runtime installed and initialized
- Docker and Docker Compose (for local development)
- Access to existing `todo_app.db` SQLite database

## Environment Setup

### 1. Install Dapr

```bash
# Install Dapr CLI
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash

# Initialize Dapr
dapr init
```

### 2. Clone and Prepare Repository

```bash
git clone [repository-url]
cd hackathon2-todo-app

# Navigate to backend directory
cd backend
```

### 3. Install Python Dependencies

```bash
pip install fastapi dapr dapr-ext-grpc uvicorn sqlalchemy apscheduler python-multipart
```

### 4. Set Up Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=sqlite:///./todo_app.db
DAPR_APP_PORT=50001
DAPR_HTTP_PORT=3500
DAPR_GRPC_PORT=50002
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Dapr Configuration

### 1. Create Dapr Components Directory

```bash
mkdir -p dapr/components
```

### 2. Configure Pub/Sub Component

Create `dapr/components/pubsub.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```

### 3. Configure State Store Component

Create `dapr/components/statestore.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: actorStateStore
    value: "true"
```

## Service Installation

### 1. Create Microservices Directory

```bash
mkdir -p backend/microservices
```

### 2. Start Dapr Sidecar for Recurring Service

```bash
# Terminal 1: Start recurring service
cd backend
dapr run --app-id recurring-service --app-port 50001 --components-path ./dapr/components python microservices/recurring_service.py
```

### 3. Start Dapr Sidecar for Notification Service

```bash
# Terminal 2: Start notification service
cd backend
dapr run --app-id notification-service --app-port 50002 --components-path ./dapr/components python microservices/notification_service.py
```

## Running the Services

### 1. Start Individual Services

```bash
# Start recurring task service
dapr run --app-id recurring-service --app-port 50001 -- python -m microservices.recurring_service

# Start notification service
dapr run --app-id notification-service --app-port 50002 -- python -m microservices.notification_service
```

### 2. Using Docker Compose (Recommended)

Create `docker-compose.microservices.yml`:

```yaml
version: '3.8'
services:
  recurring-service:
    build:
      context: .
      dockerfile: Dockerfile
    command: >
      dapr run --app-id recurring-service
               --app-port 50001
               --dapr-http-port 3501
               -- python microservices/recurring_service.py
    volumes:
      - ./backend:/app
      - ./todo_app.db:/app/todo_app.db
    environment:
      - DATABASE_URL=sqlite:///./todo_app.db
    depends_on:
      - redis

  notification-service:
    build:
      context: .
      dockerfile: Dockerfile
    command: >
      dapr run --app-id notification-service
               --app-port 50002
               --dapr-http-port 3502
               -- python microservices/notification_service.py
    volumes:
      - ./backend:/app
      - ./todo_app.db:/app/todo_app.db
    environment:
      - DATABASE_URL=sqlite:///./todo_app.db
    depends_on:
      - redis

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

Start with:

```bash
docker-compose -f docker-compose.microservices.yml up -d
```

## Testing the Services

### 1. Test Recurring Task Service

Publish a test event:

```bash
curl -X POST http://localhost:3500/v1.0/publish/pubsub/task-events \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "test-event-1",
    "event_type": "task-completed",
    "task_id": 1,
    "user_id": 1,
    "timestamp": "2026-01-14T10:00:00Z",
    "payload": {
      "recurrence_pattern": "daily"
    }
  }'
```

### 2. Test Notification Service

Monitor the service logs for notifications:

```bash
dapr logs notification-service -n default
```

## Configuration Options

### Service Configuration

Environment variables for customization:

```env
# Recurring Service
RECURRING_SERVICE_ENABLED=true
RECURRING_CHECK_INTERVAL=30  # seconds
RECURRING_MAX_RETRY_ATTEMPTS=3

# Notification Service
NOTIFICATION_SERVICE_ENABLED=true
NOTIFICATION_CHECK_INTERVAL=60  # seconds
NOTIFICATION_WINDOW_MINUTES=30
NOTIFICATION_MAX_RETRY_ATTEMPTS=3

# Database
DATABASE_URL=sqlite:///./todo_app.db
DATABASE_POOL_SIZE=20
DATABASE_POOL_TIMEOUT=30

# Dapr
DAPR_HTTP_PORT=3500
DAPR_GRPC_PORT=50001
```

## Troubleshooting

### Common Issues

1. **Dapr Sidecar Not Starting**
   ```bash
   # Check Dapr status
   dapr status -k

   # Restart Dapr
   dapr uninstall --all
   dapr init
   ```

2. **Database Connection Issues**
   - Verify `todo_app.db` path is correct
   - Check file permissions
   - Ensure SQLite is accessible

3. **Event Not Processed**
   - Verify pubsub component is configured correctly
   - Check service logs for errors
   - Confirm event topic names match

### Service Health Checks

```bash
# Check if services are running
curl http://localhost:50001/health
curl http://localhost:50002/health

# Check Dapr sidecars
dapr list
```

## Stopping Services

```bash
# Stop individual services (Ctrl+C in each terminal)
# Or stop all Dapr services
dapr stop --all

# Stop Docker Compose services
docker-compose -f docker-compose.microservices.yml down
```