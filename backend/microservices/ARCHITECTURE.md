# Microservices Architecture Documentation

## Overview
This document describes the architecture of the advanced task logic and notification microservices implemented for the Todo App.

## Services

### 1. Recurring Task Service (`recurring_service.py`)

**Purpose**: Automatically generates new tasks when recurring tasks are completed.

**Responsibilities**:
- Listen to `task-completed` events from the `task-events` topic
- Process recurring tasks based on their recurrence pattern (daily, weekly, monthly)
- Create new tasks with appropriate due dates
- Ensure idempotency to prevent duplicate processing

**Key Components**:
- Event listener for task completion events
- Recurrence calculation logic (`recurrence_logic.py`)
- Database access for task creation
- Dapr integration for event publishing

**Technology Stack**:
- Python 3.11
- Dapr SDK for event-driven communication
- SQLAlchemy for database operations
- APScheduler for background processing

### 2. Notification Service (`notification_service.py`)

**Purpose**: Monitors upcoming tasks and sends timely notifications to users.

**Responsibilities**:
- Periodically scan the database for tasks due within 30 minutes
- Format notification messages
- Publish `reminder-sent` events to the `notifications` topic
- Ensure notifications are delivered reliably

**Key Components**:
- Background scheduler using APScheduler
- Database query for upcoming tasks
- Notification message formatting
- Dapr integration for event publishing

**Technology Stack**:
- Python 3.11
- APScheduler for periodic task execution
- Dapr SDK for event-driven communication
- SQLAlchemy for database operations

## Event-Driven Architecture

### Event Topics

1. **`task-events` Topic**
   - Events: `task-completed`, `task-created`
   - Publisher: Main application and recurring service
   - Subscriber: Recurring task service

2. **`notifications` Topic**
   - Events: `reminder-sent`
   - Publisher: Notification service
   - Subscriber: Frontend notification system

### Event Structure

**Task Event Schema**:
```json
{
  "event_id": "string",
  "event_type": "string",
  "task_id": "int",
  "user_id": "int",
  "timestamp": "datetime",
  "payload": "object"
}
```

**Notification Event Schema**:
```json
{
  "event_id": "string",
  "event_type": "string",
  "task_id": "int",
  "user_id": "int",
  "timestamp": "datetime",
  "message": "string",
  "delivery_status": "string"
}
```

## Data Models

### Task Model Extensions
The services extend the existing `Task` model with:
- `recurrence_pattern` field to identify recurring tasks
- Additional validation for recurrence patterns

### Processed Events Model
Used for idempotency to prevent duplicate processing:
- `event_id`: Unique identifier for the processed event
- `service_name`: Which service processed the event
- `processed_at`: Timestamp of processing
- `result`: Success or failure status

## Reliability Features

### Idempotency
- Each event is checked against the `ProcessedEvents` store before processing
- Duplicate events are skipped to prevent duplicate task creation

### Retry Logic
- Exponential backoff retry mechanism for transient failures
- Configurable max attempts and delay parameters

### Circuit Breaker
- Prevents cascading failures during system stress
- Configurable failure threshold and timeout

### Dead Letter Queue
- Failed events are stored for later analysis and replay
- Separate storage for troubleshooting

## Configuration

### Environment Variables
- `MICROSERVICE_DAPR_HTTP_PORT`: Port for Dapr HTTP communication
- `MICROSERVICE_NOTIFICATION_WINDOW_MINUTES`: Window for notification scanning
- `MICROSERVICE_DATABASE_URL`: Database connection string
- `MICROSERVICE_LOG_LEVEL`: Logging verbosity level

### Default Values
- Notification window: 30 minutes
- Database pool size: 10 connections
- Retry attempts: 3
- Circuit breaker threshold: 5 failures

## Deployment

### Dapr Configuration
Located in `backend/dapr/components/`:
- `pubsub.yaml`: Redis-based pub/sub for event communication
- `statestore.yaml`: Redis-based state store for idempotency

### Service Startup
Both services can be started with:
```bash
dapr run --app-id <service-name> --app-port <port> -- python <service-file>.py
```

## Monitoring and Observability

### Logging
- Structured logging with timestamps and service identifiers
- Rotation of log files to prevent disk space issues
- Different log levels for different types of events

### Health Checks
- `/health` endpoint for service health status
- Dependency checks for Dapr and database connectivity
- Metrics reporting for operational insight

## Security Considerations

### Data Access
- All database access uses parameterized queries
- User isolation ensures notifications are only sent to appropriate users
- Input validation for all external data

### Communication
- All inter-service communication goes through Dapr
- Event payloads are validated before processing
- Authentication and authorization handled by main application

## Future Enhancements

### Scalability
- Horizontal scaling of services based on load
- Partitioning of event topics for high throughput
- Caching mechanisms for improved performance

### Observability
- Enhanced metrics collection
- Distributed tracing for request flows
- Advanced alerting mechanisms

### Reliability
- Advanced dead letter queue processing
- Automated failure recovery mechanisms
- Chaos engineering for resilience testing