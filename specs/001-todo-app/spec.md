# Feature Specification: Todo In-Memory Python Console Application

**Feature Branch**: `001-todo-app`
**Created**: 2025-12-08
**Status**: Draft
**Input**: User description: "Specification – Phase I: Todo In-Memory Python Console Application"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add and Manage Tasks (Priority: P1)

A user wants to create, view, update, delete, and mark tasks as complete/incomplete using a command-line interface. The user should be able to manage their tasks efficiently without any external storage or database dependencies.

**Why this priority**: This is the core functionality that defines the entire application. Without basic task management capabilities, the application has no value.

**Independent Test**: Can be fully tested by running the console application and performing all 5 basic operations (add, view, update, delete, toggle completion) with in-memory storage. Delivers complete task management functionality.

**Acceptance Scenarios**:

1. **Given** user is at main menu, **When** user selects "Add Task", **Then** user can enter title and description, and task appears in task list with unique ID and timestamp
2. **Given** user has added tasks, **When** user selects "View Tasks", **Then** all tasks display with ID, title, completion status (✓ or ✗), and created timestamp
3. **Given** user has tasks in the system, **When** user selects "Update Task" and provides valid ID, **Then** user can modify title and/or description while maintaining validation rules
4. **Given** user has tasks in the system, **When** user selects "Delete Task" and provides valid ID, **Then** task is removed from the list and confirmation is shown
5. **Given** user has tasks in the system, **When** user selects "Mark Task Complete/Incomplete" and provides valid ID, **Then** task completion status toggles and confirmation message is shown

---

### User Story 2 - Console Navigation (Priority: P2)

A user wants to navigate the console application easily with clear menu options and proper input validation to avoid crashes or unexpected behavior.

**Why this priority**: Critical for user experience and application stability. Without proper navigation and validation, users cannot effectively use the application.

**Independent Test**: Can be tested by navigating through all menu options, entering invalid inputs, and confirming the application handles all cases gracefully without crashing.

**Acceptance Scenarios**:

1. **Given** user is at main menu, **When** user enters invalid menu option, **Then** application shows error message and returns to main menu without crashing
2. **Given** user is entering task details, **When** user provides invalid input (empty title, too long title), **Then** application shows validation error and allows re-entry

---

### User Story 3 - Data Persistence in Memory (Priority: P3)

A user wants to have their tasks available during the application session but understands they will be cleared when the application exits.

**Why this priority**: Core architectural requirement that defines the application's scope and behavior. Essential for meeting the in-memory constraint.

**Independent Test**: Can be tested by adding tasks, navigating through the application, and confirming tasks remain available until application exits.

**Acceptance Scenarios**:

1. **Given** user has added multiple tasks, **When** user navigates through different menu options, **Then** tasks remain accessible in memory
2. **Given** user has added tasks, **When** user exits and restarts the application, **Then** all tasks are cleared as expected for in-memory storage

---

### Edge Cases

- What happens when user tries to update/delete/toggle a non-existent task ID?
- How does system handle empty or overly long titles (1-200 characters validation)?
- What happens when no tasks exist and user tries to view tasks?
- How does system handle unexpected input types (e.g., letters when numbers expected)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to add tasks with title (required, 1-200 characters), optional description, auto-generated ID, completion status (default false), and created timestamp
- **FR-002**: System MUST display all tasks in a clean format showing ID, title, completion status (✓ or ✗), and created timestamp
- **FR-003**: Users MUST be able to update existing tasks by ID with new title and/or description while maintaining validation rules
- **FR-004**: Users MUST be able to delete tasks by their numeric ID
- **FR-005**: Users MUST be able to toggle task completion status by ID (completed ↔ incomplete)
- **FR-006**: System MUST validate task titles to be 1-200 characters (no empty titles, no overly long titles)
- **FR-007**: System MUST provide a main menu with options: 1. Add Task, 2. View Tasks, 3. Update Task, 4. Delete Task, 5. Mark Task Complete/Incomplete, 0. Exit
- **FR-008**: System MUST store all tasks in-memory using either list or dictionary structure (no external storage)
- **FR-009**: System MUST handle invalid user inputs gracefully without crashing
- **FR-010**: System MUST provide appropriate success/error messages for all operations
- **FR-011**: When user attempts operations (update/delete/toggle) on non-existent task IDs, system MUST display specific error message and return to main menu
- **FR-012**: When user selects "View Tasks" with empty task list, system MUST display "No tasks found." message and return to main menu automatically
- **FR-013**: System MUST allow duplicate task titles with no special handling or warnings

### Key Entities

- **Task**: Core data entity representing a todo item with id (int, auto-incrementing starting from 1), title (str), description (str, optional), completed (bool), created_at (datetime in ISO 8601 format: YYYY-MM-DD HH:MM:SS)
- **Task List**: In-memory collection (list or dictionary) storing all Task entities during application session

## Clarifications

### Session 2025-12-08

- Q: What should be the starting value for task IDs? → A: Start from 1 and increment sequentially (1, 2, 3...)
- Q: When a user attempts to update, delete, or toggle completion for a task ID that doesn't exist, what should be the system's behavior? → A: Display specific error message and return to main menu
- Q: When a user selects "View Tasks" but there are no tasks in the system, what should happen after displaying "No tasks found."? → A: Display message and return to main menu automatically
- Q: What format should be used for the created_at timestamp displayed to users? → A: ISO 8601 format (YYYY-MM-DD HH:MM:SS)
- Q: The original specification mentioned that duplicate titles should be allowed, but should the system provide any special handling for duplicate titles? → A: Allow duplicate titles with no special handling (default behavior)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can perform all 5 basic task operations (add, view, update, delete, toggle completion) without application crashes
- **SC-002**: Task validation works correctly with titles rejected if empty or exceeding 200 characters
- **SC-003**: Application handles all error scenarios gracefully (invalid IDs, empty lists, invalid inputs) without terminating unexpectedly
- **SC-004**: All user scenarios can be completed with 100% success rate during manual testing
- **SC-005**: Console interface provides clear navigation and feedback for all operations
