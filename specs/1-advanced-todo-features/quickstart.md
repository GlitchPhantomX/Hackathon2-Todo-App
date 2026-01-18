# Quickstart Guide: Advanced Todo App Features

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 12+
- Kafka 3.0+
- Dapr 1.10+

## Setup Instructions

### 1. Clone and Navigate to Project
```bash
git clone <repository-url>
cd hackathon2-todo-app
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install poetry
poetry install
```

#### Set Up PostgreSQL Database
```bash
# Update your .env file with database credentials
DATABASE_URL=postgresql://username:password@localhost:5432/todo_app
```

#### Run Database Migrations
```bash
# From backend directory
poetry run alembic upgrade head
```

#### Install and Initialize Dapr
```bash
# Install Dapr CLI
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | sh

# Initialize Dapr
dapr init
```

#### Start Kafka
```bash
# Using Docker Compose
docker-compose -f docker/kafka/docker-compose.yml up -d
```

#### Configure Dapr Components
```bash
# Create dapr components directory
mkdir -p backend/dapr/components

# Copy configuration files
cp dapr/components/pubsub.yaml backend/dapr/components/
cp dapr/components/statestore.yaml backend/dapr/components/
```

### 3. Frontend Setup

#### Install Node Dependencies
```bash
cd frontend
npm install
```

#### Configure Environment Variables
```bash
# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8000
```

### 4. Start the Applications

#### Start Dapr and Backend
```bash
# Terminal 1: Start Dapr with the backend app
cd backend
dapr run --app-id todo-backend --app-port 8000 --dapr-http-port 3500 -- python main.py

# Terminal 2: Start notification microservice
cd backend
dapr run --app-id notification-service --app-port 8001 --dapr-http-port 3501 -- python microservices/notification_service.py
```

#### Start Frontend
```bash
# Terminal 3: Start the frontend
cd frontend
npm run dev
```

## Feature Configuration

### 1. Recurring Tasks
- Enabled by default when creating a new task
- Configure frequency (daily/weekly/monthly) in task creation form
- Set recurrence end date if needed

### 2. Due Dates & Timezones
- Set due date and time in task creation/edit form
- Timezone automatically detected from browser (can be overridden in user settings)

### 3. Reminders
- Enabled by default for all tasks with due dates
- Configure reminder timing (15min/1hr/1day) in task settings
- Reminders sent via WebSocket notifications

### 4. Event-Driven Architecture
- Events automatically published to Kafka topics:
  - `task-events`: Task lifecycle events
  - `reminders`: Reminder-related events
  - `recurring-tasks`: Recurring task events

## Testing the Features

### 1. Create a Recurring Task
1. Navigate to the task creation page
2. Fill in task details
3. Enable "Recurring Task" option
4. Select frequency (daily/weekly/monthly)
5. Optionally set recurrence end date
6. Save the task

### 2. Set Up Reminders
1. Create a task with a due date
2. Configure reminder settings (15min/1hr/1day before due time)
3. Monitor WebSocket notifications for reminders

### 3. Verify Event Streaming
1. Check Kafka topics for events when creating/updating tasks
2. Monitor notification service logs for reminder events
3. Verify WebSocket notifications are received in real-time

## Troubleshooting

### Common Issues

1. **Dapr not starting**: Ensure Dapr CLI is installed and initialized
2. **Kafka connection errors**: Verify Kafka is running and broker addresses are correct
3. **Database connection issues**: Check PostgreSQL is running and credentials are correct
4. **WebSocket connection failures**: Verify backend is running and CORS settings are correct

### Useful Commands

```bash
# Check Dapr status
dapr status

# Check Kafka topics
kafka-topics.sh --bootstrap-server localhost:9092 --list

# Check PostgreSQL connection
psql postgresql://username:password@localhost:5432/todo_app

# View Dapr logs
dapr logs
```