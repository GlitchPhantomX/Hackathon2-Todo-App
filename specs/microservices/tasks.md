# Tasks: Advanced Task Logic & Notification Services

**Feature**: Advanced Task Logic & Notification Services
**Branch**: 1-microservices
**Date**: 2026-01-14
**Spec**: specs/microservices/spec.md
**Plan**: specs/1-microservices/plan.md

## Implementation Strategy

This feature implements two background microservices using an event-driven architecture with Dapr. The implementation follows an incremental approach:

- **MVP**: User Story 1 (Recurring Task Generation) with basic functionality
- **Increment 2**: User Story 2 (Notifications) and User Story 3 (Reliable Event Processing)
- **Polish**: Cross-cutting concerns and optimization

Each user story is designed to be independently testable and deployable.

## Dependencies

- User Story 1 (Recurring Task Generation) requires foundational infrastructure setup
- User Story 2 (Notifications) requires foundational infrastructure setup
- User Story 3 (Reliable Event Processing) is foundational and supports both other stories
- User Story 3 must be completed before User Stories 1 and 2 can be fully functional

## Parallel Execution Examples

**Per Story**:
- US1: Event listener and recurrence logic can be developed in parallel
- US2: Background scanner and notification publisher can be developed in parallel
- US3: Dapr configuration and idempotency logic can be developed in parallel

## Phase 1: Setup

### Goal
Establish project structure and foundational infrastructure for microservices.

### Independent Test Criteria
Services can be started and basic health checks pass.

### Tasks

- [x] T001 Create backend/microservices directory structure
- [x] T002 Create backend/dapr/components directory structure
- [x] T003 Create tests/microservices directory structure
- [x] T004 Set up Python project configuration with required dependencies (FastAPI, Dapr SDK, SQLAlchemy, APScheduler)
- [ ] T005 Install Dapr runtime and initialize components
- [x] T006 Configure basic logging and error handling framework

## Phase 2: Foundational Infrastructure

### Goal
Implement foundational infrastructure required by all user stories.

### Independent Test Criteria
Event publishing, subscription, and database access work correctly.

### Tasks

- [x] T010 [P] Create Dapr pubsub configuration at backend/dapr/components/pubsub.yaml
- [x] T011 [P] Create Dapr state store configuration at backend/dapr/components/statestore.yaml
- [x] T012 [P] Implement database connection utilities using SQLAlchemy at backend/microservices/db_utils.py
- [x] T013 [P] Implement Dapr client wrapper at backend/microservices/dapr_client.py
- [x] T014 [P] Create shared models and schemas at backend/microservices/models.py
- [x] T015 [P] Create shared utilities for date/time calculations at backend/microservices/utils.py
- [x] T016 [P] Implement basic health check endpoints for microservices
- [x] T017 [P] Create base service class with common functionality at backend/microservices/base_service.py

## Phase 3: User Story 1 - Recurring Task Generation (Priority: P1)

### Goal
Implement service that listens to task completion events and automatically generates new recurring tasks based on recurrence patterns (daily, weekly, monthly).

### Independent Test Criteria
System can detect completed recurring tasks and automatically create the next instance with the appropriate due date while maintaining pending status.

### Tasks

- [x] T020 [P] [US1] Implement event listener for task-completed events in recurring_service.py
- [x] T021 [P] [US1] Create recurrence calculation logic for daily, weekly, monthly patterns at backend/microservices/recurrence_logic.py
- [x] T022 [US1] Implement new task creation functionality that preserves recurrence pattern
- [x] T023 [US1] Add validation to ensure recurrence pattern is valid (daily, weekly, monthly)
- [x] T024 [US1] Implement proper error handling for task creation failures
- [x] T025 [US1] Add logging for recurring task generation events
- [x] T026 [US1] Test daily recurrence pattern with tomorrow's due date
- [x] T027 [US1] Test weekly recurrence pattern with same day next week
- [x] T028 [US1] Test monthly recurrence pattern with same day next month
- [x] T029 [US1] Handle edge cases like February 29th and month-end dates

### Implementation Notes
- Added 'is_recurring' boolean field to Task model (default: False)
- Added 'frequency' string field to Task model (options: 'daily', 'weekly', 'monthly')
- When a recurring task is marked as completed, automatically create a new task with the same title/description
- Calculate next due date based on frequency: +1 day for daily, +7 days for weekly, +30 days for monthly

## Phase 4: User Story 2 - Task Reminders and Notifications (Priority: P1)

### Goal
Implement service that monitors upcoming tasks and sends timely notifications to users when tasks are approaching their due date (within 30 minutes).

### Independent Test Criteria
System can monitor tasks due within 30 minutes and send appropriate notifications to the user.

### Tasks

- [x] T030 [P] [US2] Create background task scheduler using APScheduler in notification_service.py
- [x] T031 [P] [US2] Implement database query to find tasks due within 30 minutes
- [x] T032 [US2] Create notification message formatting logic
- [x] T033 [US2] Implement event publishing for reminder-sent events
- [ ] T034 [US2] Add WebSocket integration for real-time notification delivery
- [x] T035 [US2] Implement proper error handling for notification delivery failures
- [x] T036 [US2] Add logging for notification events
- [ ] T037 [US2] Test single task notification within 30 minutes
- [ ] T038 [US2] Test multiple tasks notification within 30 minutes
- [x] T039 [US2] Handle timezone differences for due date calculations

## Phase 5: User Story 3 - Reliable Event Processing (Priority: P2)

### Goal
Ensure services communicate through a reliable event-driven architecture with proper idempotency and resilience patterns.

### Independent Test Criteria
System can process events reliably between services without data loss.

### Tasks

- [x] T040 [P] [US3] Implement idempotency check using Dapr state store to prevent duplicate processing
- [x] T041 [P] [US3] Create event processing state tracking in ProcessedEvents
- [x] T042 [US3] Implement retry logic with exponential backoff for transient failures
- [x] T043 [US3] Add circuit breaker pattern to prevent cascading failures
- [ ] T044 [US3] Create dead letter queue for failed events
- [x] T045 [US3] Implement event replay mechanism for missed events
- [ ] T046 [US3] Add comprehensive monitoring and alerting for event processing
- [ ] T047 [US3] Test duplicate event processing protection
- [ ] T048 [US3] Test retry mechanism with simulated failures
- [ ] T049 [US3] Test graceful degradation under high load

## Phase 6: Integration & Testing

### Goal
Integrate all components and perform end-to-end testing.

### Independent Test Criteria
Complete user stories work together as expected with proper error handling and resilience.

### Tasks

- [x] T050 [P] Create integration tests for recurring task generation workflow
- [x] T051 [P] Create integration tests for notification delivery workflow
- [ ] T052 [P] Create end-to-end tests for complete event-driven workflow
- [ ] T053 [P] Test system behavior under various failure scenarios
- [ ] T054 [P] Performance test for event processing throughput
- [ ] T055 [P] Test data integrity during concurrent operations
- [ ] T056 [P] Test system recovery after service restarts
- [ ] T057 [P] Validate that 99.9% of events are processed without loss

## Phase 7: Polish & Cross-Cutting Concerns

### Goal
Address cross-cutting concerns and finalize the implementation.

### Independent Test Criteria
System meets all quality and operational requirements.

### Tasks

- [x] T060 [P] Add comprehensive logging throughout all services
- [ ] T061 [P] Add metrics collection for monitoring and observability
- [x] T062 [P] Implement configuration management for different environments
- [x] T063 [P] Add graceful shutdown handling for services
- [ ] T064 [P] Create Docker configurations for containerized deployment
- [ ] T065 [P] Update ToastNotification.tsx to handle new notification types
- [x] T066 [P] Add security considerations and input validation
- [x] T067 [P] Optimize database queries and connection pooling
- [x] T068 [P] Document the microservices architecture and deployment
- [x] T069 [P] Create operational runbooks for monitoring and troubleshooting
- [ ] T070 [P] Final end-to-end acceptance testing