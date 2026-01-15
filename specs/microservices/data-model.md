# Data Model: Advanced Task Logic & Notification Services

## Overview

This document defines the data structures and entities used by the recurring task and notification services. The services interact with the existing task data model while introducing new concepts for event processing and notification delivery.

## Core Entities

### Task (Existing)
**Source**: Existing `todo_app.db` schema
**Fields**:
- `id`: Integer (Primary Key)
- `title`: String (Required)
- `description`: String (Optional)
- `due_date`: DateTime (Optional)
- `status`: String ('pending', 'completed', 'in-progress')
- `recurrence_pattern`: String ('daily', 'weekly', 'monthly', null)
- `user_id`: Integer (Foreign Key to users table)

### RecurringTask (Logical Extension)
**Definition**: A task with recurrence pattern that generates subsequent instances
**Characteristics**:
- Inherits all fields from Task entity
- Identified by non-null `recurrence_pattern` field
- When completed, triggers creation of next instance

### TaskEvent (Event Stream)
**Definition**: Events representing task lifecycle changes
**Structure**:
- `event_id`: String (Unique identifier for the event)
- `event_type`: String ('task-completed', 'task-created', etc.)
- `task_id`: Integer (Reference to the task)
- `user_id`: Integer (User associated with the task)
- `timestamp`: DateTime (When the event occurred)
- `payload`: JSON (Additional event-specific data)

### NotificationEvent (Event Stream)
**Definition**: Events representing notifications to be delivered
**Structure**:
- `event_id`: String (Unique identifier for the event)
- `event_type`: String ('reminder-sent', 'notification-delivered', etc.)
- `task_id`: Integer (Reference to the task)
- `user_id`: Integer (User to receive notification)
- `timestamp`: DateTime (When the event occurred)
- `message`: String (Notification message content)
- `delivery_status`: String ('pending', 'delivered', 'failed')

## Service-Specific Data

### ProcessedEvents (State Tracking)
**Purpose**: Track processed events to ensure idempotency
**Location**: Dapr state store
**Fields**:
- `event_id`: String (Primary identifier)
- `service_name`: String (Which service processed it)
- `processed_at`: DateTime (When it was processed)
- `result`: String ('success', 'failure') (Outcome of processing)

### NotificationQueue (Processing Queue)
**Purpose**: Temporary queue for pending notifications
**Location**: In-memory or Dapr state store
**Fields**:
- `queue_id`: String (Unique queue identifier)
- `task_id`: Integer (Task that triggered notification)
- `user_id`: Integer (Recipient of notification)
- `scheduled_time`: DateTime (When to deliver notification)
- `priority`: String ('high', 'normal', 'low') (Delivery priority)

## Validation Rules

### Task Validation
- Recurrence pattern must be one of ['daily', 'weekly', 'monthly'] if specified
- Due date must be a valid date/time in the future for recurring tasks
- Status transition from 'completed' to other statuses should trigger appropriate events

### Event Validation
- Event ID must be unique within the system
- Timestamp must be current or past (not future)
- Payload must conform to expected schema for event type

### Recurrence Logic
- Daily: Next occurrence is 24 hours after current due date
- Weekly: Next occurrence is 7 days after current due date
- Monthly: Next occurrence is 1 month after current due date (with adjustment for months with fewer days)
- Handle edge cases like February 29th in leap years vs. non-leap years

## Relationships

### Task to TaskEvent
- One Task can generate multiple TaskEvents over its lifecycle
- TaskEvents are immutable records of state changes

### Task to NotificationEvent
- One Task can trigger multiple NotificationEvents (based on due date proximity)
- NotificationEvents represent the notification delivery aspect

### User to All Entities
- All entities are associated with a user through `user_id`
- User isolation ensures notifications are delivered only to relevant users

## State Transitions

### Task Lifecycle
```
pending → in-progress → completed → [automatic creation of new instance if recurring]
```

### Notification Event Lifecycle
```
pending → scheduled → delivered/failed
```

### Event Processing State
```
received → processing → processed (success/failed) → acknowledged
```

## Indexing Strategy

### Database Indices
- `idx_tasks_user_id`: For user-specific queries
- `idx_tasks_due_date`: For due date monitoring
- `idx_tasks_recurrence_pattern`: For recurring task identification
- `idx_tasks_status`: For status-based queries

### Event Store Indices
- `idx_events_event_type_timestamp`: For chronological event processing
- `idx_events_task_id`: For task-centric event queries
- `idx_events_user_id`: For user-specific event filtering

## Serialization Format

### JSON Schema for Task Events
```json
{
  "event_id": "uuid-string",
  "event_type": "task-completed",
  "task_id": 123,
  "user_id": 456,
  "timestamp": "2026-01-14T10:00:00Z",
  "payload": {
    "previous_status": "pending",
    "new_status": "completed",
    "recurrence_pattern": "daily"
  }
}
```

### JSON Schema for Notification Events
```json
{
  "event_id": "uuid-string",
  "event_type": "reminder-sent",
  "task_id": 123,
  "user_id": 456,
  "timestamp": "2026-01-14T10:00:00Z",
  "message": "Task 'Morning workout' is due in 30 minutes",
  "delivery_status": "pending"
}
```