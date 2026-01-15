---
id: 1
title: advanced-task-logic
stage: spec
date_iso: 2026-01-14
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 1-microservices
user: claude
command: /sp.specify
labels: ["microservices", "event-driven", "notifications"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - specs/microservices/spec.md
  - specs/microservices/checklists/requirements.md
tests_yaml: []
---

# Specification: Advanced Task Logic & Notification Microservices (Phase V)

## 1. Overview
Implement two background microservices using an event-driven architecture powered by Dapr and Kafka (Redpanda). These services will handle recurring task generation and time-sensitive notifications.

## 2. Constraints & Safeguards
- **Zero Deletion Policy:** DO NOT delete or overwrite any existing files or folders.
- **Structural Integrity:** Maintain the current folder structure. New services must be placed in `backend/microservices/`.
- **UI Consistency:** Use existing Purple (#7C3AED) and White theme from `frontend/src/app/globals.css`.
- **Database:** Use the existing `todo_app.db` (SQLite) but ensure thread-safe access for background services.

## 3. Service A: Recurring Tasks Service
**Location:** `backend/microservices/recurring_service.py`
- **Subscription:** Listen to the `task-events` topic for `task-completed` events.
- **Logic:** - If a completed task has a `recurrence` field (Daily, Weekly, Monthly), calculate the next `due_date`.
    - Automatically trigger a POST request to the main Task API (or Dapr Service Invocation) to create the next instance of the task.
    - Status of the new task should be 'pending'.

## 4. Service B: Notification & Reminder Service
**Location:** `backend/microservices/notification_service.py`
- **Logic:**
    - A background worker that scans `todo_app.db` for tasks with `due_dates` approaching in the next 30 minutes.
    - **Event Trigger:** Publish a `reminder-sent` event to the `notifications` topic.
    - **Frontend Integration:** Integrate with the existing `ToastNotification.tsx` to show a purple-themed alert when a task is due.
    - **Real-time:** Use WebSockets or Dapr Pub/Sub to push the notification to the frontend.

## 5. Infrastructure Requirements
- Create `dapr/components/pubsub.yaml` to configure Redpanda/Kafka.
- Create `dapr/components/statestore.yaml` for handling idempotency (ensuring one event isn't processed twice).  Specification File: specs/microservices/advanced-logic-spec.md

## Response

# Feature Specification: Advanced Task Logic & Notification Services

**Feature Branch**: `1-microservices`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "Implement two background services using an event-driven architecture. These services will handle recurring task generation and time-sensitive notifications."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recurring Task Generation (Priority: P1)

As a user who creates recurring tasks, I want my completed tasks to automatically generate the next instance based on recurrence rules (daily, weekly, monthly), so that I don't have to manually recreate them each time.

**Why this priority**: This is the core functionality that reduces repetitive task creation and adds significant value to the user experience by automating recurring work.

**Independent Test**: The system can detect completed recurring tasks and automatically create the next instance with the appropriate due date while maintaining the pending status.

**Acceptance Scenarios**:

1. **Given** a user has a daily recurring task that was just marked as completed, **When** the task completion event is received, **Then** the system creates a new pending task with the due date set to tomorrow.
2. **Given** a user has a weekly recurring task that was just marked as completed, **When** the task completion event is received, **Then** the system creates a new pending task with the due date set to the same day next week.
3. **Given** a user has a monthly recurring task that was just marked as completed, **When** the task completion event is received, **Then** the system creates a new pending task with the due date set to the same day next month.

---

### User Story 2 - Task Reminders and Notifications (Priority: P1)

As a user with upcoming tasks, I want to receive timely notifications when tasks are approaching their due date (within 30 minutes), so that I don't miss important deadlines.

**Why this priority**: This ensures users stay on top of their tasks and reduces missed deadlines, which is critical for task management effectiveness.

**Independent Test**: The system can monitor tasks due within 30 minutes and send appropriate notifications to the user.

**Acceptance Scenarios**:

1. **Given** a task is due within 30 minutes, **When** the system detects this condition, **Then** a reminder notification is sent to the user.
2. **Given** multiple tasks are due within 30 minutes, **When** the system detects this condition, **Then** separate reminder notifications are sent for each task.

---

### User Story 3 - Reliable Event Processing (Priority: P2)

As a system administrator, I want the services to communicate through a reliable event-driven architecture, so that the system remains scalable and resilient.

**Why this priority**: This provides the underlying infrastructure needed for reliable communication between services and ensures system stability.

**Independent Test**: The system can process events reliably between services without data loss.

**Acceptance Scenarios**:

1. **Given** a task completion event is published to the event stream, **When** the recurring tasks service is running, **Then** the service successfully processes the event and creates a new task.

---

### Edge Cases

- What happens when the data store is temporarily unavailable during notification processing?
- How does the system handle duplicate processing of the same event (idempotency)?
- What occurs when the notification service is unavailable during the notification window?
- How does the system handle timezone differences for due date calculations?
- What happens if the recurring task calculation results in an invalid date (e.g., February 30th)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST listen to task completion events from an event stream
- **FR-002**: System MUST process completed tasks that have a recurrence pattern (Daily, Weekly, Monthly)
- **FR-003**: System MUST calculate the next due date based on the recurrence pattern when a task is completed
- **FR-004**: System MUST automatically create a new pending task when recurrence is detected
- **FR-005**: System MUST run a background process that monitors tasks with approaching due dates (within 30 minutes)
- **FR-006**: System MUST publish notification events when tasks are approaching their due time
- **FR-007**: System MUST deliver timely notifications to users when tasks are approaching their due date
- **FR-008**: System MUST provide real-time notification delivery to the user interface
- **FR-009**: System MUST ensure reliable message delivery between services to prevent data loss
- **FR-010**: System MUST prevent duplicate processing of the same event to maintain data integrity
- **FR-011**: System MUST safely access shared data resources from multiple background processes

### Key Entities

- **Task**: Represents a user task with attributes including id, title, description, due_date, status, and recurrence pattern
- **RecurringTask**: A task with a recurrence field indicating Daily, Weekly, or Monthly repetition
- **Notification**: An event sent to users when tasks are approaching their due date
- **TaskEvent**: Events representing task lifecycle changes in the system
- **ReminderEvent**: Events triggered when tasks are approaching their due time

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Recurring tasks are automatically generated within 5 seconds of task completion for 95% of cases
- **SC-002**: Users receive task reminders within 30 minutes before the due date for 99% of tasks
- **SC-003**: System processes events with 99.9% reliability without losing messages
- **SC-004**: Background services operate efficiently without degrading system performance under normal load
- **SC-005**: Notification delivery to users occurs within 1 minute of detection for 95% of cases
- **SC-006**: System handles duplicate event processing gracefully without creating duplicate tasks