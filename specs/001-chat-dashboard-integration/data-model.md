# Data Model: Chat-Dashboard Integration

## Overview
This document defines the data models and relationships for the chat-dashboard integration feature, including entities for real-time synchronization, chat history, and state management.

## Core Entities

### Task (Enhanced)
**Source**: Existing model from `backend/models.py`
**Purpose**: Represents user tasks with synchronization capabilities

**Fields**:
- `id`: UUID (primary key)
- `title`: string (required, max 255 chars)
- `description`: string (optional, max 1000 chars)
- `status`: enum (pending, in_progress, completed)
- `priority`: enum (low, medium, high, urgent)
- `due_date`: datetime (optional)
- `created_at`: datetime (auto-generated)
- `updated_at`: datetime (auto-generated, updated on change)
- `user_id`: UUID (foreign key to user)

**Relationships**:
- One-to-many with User
- Used across dashboard and chat interfaces

**Validation Rules**:
- Title must not be empty
- Status must be one of allowed values
- Due date must be in the future (if provided)

### ChatSession
**Source**: New model to be added to `backend/models.py`
**Purpose**: Represents chat conversation sessions

**Fields**:
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to user)
- `title`: string (auto-generated from first message or custom)
- `created_at`: datetime (auto-generated)
- `updated_at`: datetime (auto-generated, updated on change)
- `is_active`: boolean (default: true)

**Relationships**:
- One-to-many with User
- One-to-many with ChatMessage

**Validation Rules**:
- Title must not be empty
- User_id must reference existing user

### ChatMessage
**Source**: New model to be added to `backend/models.py`
**Purpose**: Represents individual messages in chat sessions

**Fields**:
- `id`: UUID (primary key)
- `session_id`: UUID (foreign key to ChatSession)
- `role`: string (user or assistant)
- `content`: string (message content, max 4000 chars)
- `created_at`: datetime (auto-generated)
- `message_type`: string (text, command, response - default: text)

**Relationships**:
- One-to-many with ChatSession
- Used for chat history persistence

**Validation Rules**:
- Content must not be empty
- Role must be 'user' or 'assistant'
- Session_id must reference existing session

### SyncEvent
**Source**: Internal model for WebSocket events
**Purpose**: Represents synchronization events for real-time updates

**Fields**:
- `type`: string (task_created, task_updated, task_deleted, task_status_changed)
- `data`: object (task data or metadata)
- `user_id`: UUID (identifies target user)
- `timestamp`: datetime (when event occurred)

**Validation Rules**:
- Type must be one of allowed event types
- Data must be valid according to event type
- User_id must be valid

## State Management Models

### TaskSyncState
**Source**: Frontend type definition
**Purpose**: Represents synchronized task state across interfaces

**Fields**:
- `tasks`: Task[] (array of all tasks)
- `isLoading`: boolean (loading state indicator)
- `error`: string (error message if any)

**Operations**:
- `addTask(task: Task)`: Add new task and broadcast
- `updateTask(id: string, updates: Partial<Task>)`: Update task and broadcast
- `deleteTask(id: string)`: Delete task and broadcast
- `syncTasks()`: Synchronize with backend

## API Contract Models

### WebSocket Event Structure
**Purpose**: Standardized format for WebSocket synchronization events

**Structure**:
```
{
  "type": "task_created" | "task_updated" | "task_deleted" | "task_status_changed",
  "data": {
    "task": Task,
    "userId": string,
    "timestamp": ISO8601
  }
}
```

## Database Schema Changes

### New Tables
1. `chat_sessions` - Stores chat session metadata
2. `chat_messages` - Stores individual chat messages

### Modified Tables
1. `tasks` - No schema changes (use existing structure)

## Validation Rules

### Business Rules
1. Users can only access their own chat sessions and messages
2. Task synchronization respects user ownership
3. Chat messages are immutable after creation
4. WebSocket events are authenticated per user

### Data Integrity
1. Foreign key constraints enforced at database level
2. Required fields validated at application level
3. Character limits enforced for text fields
4. Timestamps automatically managed