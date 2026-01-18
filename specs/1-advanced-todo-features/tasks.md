# Development Tasks: Advanced Todo App Features

**Feature**: Advanced Todo App Features (Recurring Tasks, Due Dates, Reminders, Kafka, Dapr)
**Branch**: 1-advanced-todo-features
**Date**: 2026-01-16
**Input**: All design documents from `/specs/1-advanced-todo-features/`

## Feature Overview

Implement advanced todo app features including recurring tasks (daily, weekly, monthly), due dates with timezone support, smart reminders (15min, 1hr, 1day before), event-driven architecture using Kafka for real-time notifications, and Dapr integration for microservices. The system will maintain individual user access control with sharing capabilities, use PostgreSQL as the primary database, and implement graceful degradation when external services are unavailable.

## User Stories Prioritized

1. **[US1] Creating a recurring task**: As a user, I want to create a task that repeats daily/weekly/monthly so that I don't have to manually recreate routine tasks.
2. **[US2] Managing due dates and reminders**: As a user, I want to set due dates with customizable reminders so that I'm notified before tasks are due.
3. **[US3] Receiving real-time notifications**: As a user, I want to receive instant notifications for task events (creation, completion, reminders) so that I stay informed.
4. **[US4] Viewing recurring task series**: As a user, I want to view all instances of a recurring task series so that I can track my recurring commitments.

---

## Phase 1: Setup Tasks

**Goal**: Prepare project infrastructure and dependencies for advanced features

- [ ] T001 Set up Kafka development environment with Docker Compose
- [ ] T002 Initialize Dapr components (pubsub and statestore) in backend/dapr/components/
- [ ] T003 Update backend dependencies in pyproject.toml to include Kafka and Dapr libraries
- [ ] T004 Create backend/microservices directory for notification services
- [ ] T005 [P] Create frontend/src/components directory structure for new components
- [ ] T006 [P] Create frontend/src/services directory structure for new services
- [ ] T007 [P] Create frontend/src/types directory structure for new types
- [ ] T008 Update database migration files to include recurring task fields

## Phase 2: Foundational Tasks

**Goal**: Implement core infrastructure required by all user stories

- [ ] T009 Extend Task model in backend/models.py with recurring task fields
- [ ] T010 Update Task schema in backend/schemas.py with recurring task fields
- [ ] T011 Create timezone utilities module in backend/utils/timezone_utils.py
- [ ] T012 [P] Create event producer service in backend/services/event_producer.py
- [ ] T013 [P] Create Dapr service wrapper in backend/services/dapr_service.py
- [ ] T014 [P] Create notification service in backend/services/notification_service.py
- [ ] T015 [P] Create notification consumer in backend/microservices/notification_consumer.py
- [ ] T016 [P] Update main.py to initialize Kafka/Dapr connections
- [ ] T017 [P] Create task types in frontend/src/types/task.types.ts with recurring fields
- [ ] T018 [P] Create dapr service in frontend/src/services/daprService.ts

## Phase 3: [US1] Creating a Recurring Task

**Goal**: Enable users to create tasks that repeat daily/weekly/monthly

**Independent Test Criteria**: User can create a recurring task through the UI and it's saved with recurrence configuration in the database.

**Tasks**:

- [ ] T019 [US1] Create recurring_tasks router in backend/routers/recurring_tasks.py
- [ ] T020 [US1] Implement POST /users/me/tasks endpoint with recurring task logic
- [ ] T021 [US1] Implement PUT /users/me/tasks/{task_id}/complete to handle recurring task completion
- [ ] T022 [US1] Create function to calculate next occurrence based on frequency
- [ ] T023 [US1] Add validation for recurring task configurations
- [ ] T024 [P] [US1] Create RecurringTaskModal component in frontend/src/components/RecurringTaskModal.tsx
- [ ] T025 [P] [US1] Create RecurringTaskBadge component in frontend/src/components/RecurringTaskBadge.tsx
- [ ] T026 [P] [US1] Update task creation form to include recurring task options
- [ ] T027 [US1] Test recurring task creation functionality
- [ ] T028 [US1] Test recurring task completion creates next instance

## Phase 4: [US2] Managing Due Dates and Reminders

**Goal**: Allow users to set due dates with customizable reminders

**Independent Test Criteria**: User can set due dates and reminder timing, and reminders are triggered appropriately.

**Tasks**:

- [ ] T029 [US2] Update Task model with due date and reminder fields
- [ ] T030 [US2] Update Task schema with due date and reminder validation
- [ ] T031 [US2] Implement reminder settings endpoint in backend/routers/reminders.py
- [ ] T032 [US2] Create GET /users/me/reminders endpoint
- [ ] T033 [US2] Create PUT /users/me/reminders/{task_id} endpoint
- [ ] T034 [US2] Create POST /users/me/reminders/{task_id}/dismiss endpoint
- [ ] T035 [P] [US2] Create ReminderSettings component in frontend/src/components/ReminderSettings.tsx
- [ ] T036 [P] [US2] Create DueDateIndicator component in frontend/src/components/DueDateIndicator.tsx
- [ ] T037 [P] [US2] Update task form to include due date and reminder settings
- [ ] T038 [US2] Implement reminder scheduling logic in notification service
- [ ] T039 [US2] Test reminder creation and dismissal functionality
- [ ] T040 [US2] Test reminder timing (15min, 1hr, 1day) works correctly

## Phase 5: [US3] Receiving Real-Time Notifications

**Goal**: Deliver instant notifications for task events using WebSocket and Kafka

**Independent Test Criteria**: User receives real-time notifications for task events without refreshing the page.

**Tasks**:

- [ ] T041 [US3] Implement WebSocket endpoint for notifications in backend/main.py
- [ ] T042 [US3] Update notification service to send WebSocket messages
- [ ] T043 [US3] Implement Kafka event publishing for task operations
- [ ] T044 [US3] Implement Kafka event consumption for notifications
- [ ] T045 [P] [US3] Create WebSocketNotificationListener component in frontend/src/components/WebSocketNotificationListener.tsx
- [ ] T046 [P] [US3] Create notification UI components for different event types
- [ ] T047 [US3] Test real-time notification delivery via WebSocket
- [ ] T048 [US3] Test Kafka event publishing and consumption
- [ ] T049 [US3] Test notification delivery for all event types (creation, completion, reminders)

## Phase 6: [US4] Viewing Recurring Task Series

**Goal**: Allow users to view all instances of a recurring task series

**Independent Test Criteria**: User can view all instances of a recurring task series and understand the recurrence pattern.

**Tasks**:

- [ ] T050 [US4] Create endpoint to get recurring task series in backend/routers/recurring_tasks.py
- [ ] T051 [US4] Implement logic to retrieve all instances of a recurring task series
- [ ] T052 [US4] Add GET /users/me/recurring-tasks endpoint
- [ ] T053 [P] [US4] Create component to display recurring task series
- [ ] T054 [P] [US4] Update task list UI to show recurring task indicators
- [ ] T055 [US4] Test viewing recurring task series functionality
- [ ] T056 [US4] Test navigation between recurring task instances

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Complete integration, testing, and polish for all features

- [ ] T057 Implement graceful degradation for Kafka/Notification service outages
- [ ] T058 Add comprehensive error handling for all new endpoints
- [ ] T059 Update frontend to handle service degradation gracefully
- [ ] T060 Add logging for all new functionality
- [ ] T061 Create comprehensive integration tests
- [ ] T062 Performance test for task creation and retrieval under load
- [ ] T063 Test timezone handling across different user preferences
- [ ] T064 Update documentation with new API endpoints
- [ ] T065 Conduct end-to-end testing of all user stories
- [ ] T066 Finalize UI/UX for all new components

---

## Dependencies Between User Stories

- **US1** → **US2**: Recurring tasks need due date functionality
- **US2** → **US3**: Reminders require notification system
- **US1** → **US4**: Creating recurring tasks enables viewing series

## Parallel Execution Opportunities

- **Components**: RecurringTaskModal, ReminderSettings, DueDateIndicator, WebSocketNotificationListener can be developed in parallel
- **Services**: Event producer, Dapr service, Notification service can be developed in parallel
- **Frontend/Backend**: UI components and API endpoints can be developed in parallel with agreed contracts

## Implementation Strategy

1. **MVP Scope**: Complete US1 (creating recurring tasks) with basic reminder functionality for US2
2. **Incremental Delivery**: Each user story builds on the foundational tasks and can be tested independently
3. **Integration Points**: All services connect through Kafka and Dapr as designed
4. **Testing Strategy**: Unit tests for individual components, integration tests for service interactions, E2E tests for user workflows