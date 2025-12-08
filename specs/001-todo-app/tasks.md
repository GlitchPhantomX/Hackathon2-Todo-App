---
description: "Task list for Todo In-Memory Python Console Application implementation"
---

# Tasks: Todo In-Memory Python Console Application

**Input**: Design documents from `/specs/001-todo-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The feature specification does not explicitly request automated tests - manual testing is specified. Tests are omitted from this task list.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure with src/ directory
- [x] T002 Create src/main.py file as CLI entry point
- [x] T003 [P] Create src/models.py file for data models
- [x] T004 [P] Create src/services.py file for business logic

---
## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Implement Task data model in src/models.py with id, title, description, completed, created_at fields
- [x] T006 [P] Implement TaskService interface in src/services.py with all required methods
- [x] T007 [P] Initialize in-memory task storage in src/services.py using list or dictionary
- [x] T008 Implement basic menu display functionality in src/main.py
- [x] T009 Create main application loop in src/main.py with exit option

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---
## Phase 3: User Story 1 - Add and Manage Tasks (Priority: P1) 🎯 MVP

**Goal**: Enable users to create, view, update, delete, and mark tasks as complete/incomplete using a command-line interface

**Independent Test**: Can be fully tested by running the console application and performing all 5 basic operations (add, view, update, delete, toggle completion) with in-memory storage. Delivers complete task management functionality.

### Implementation for User Story 1

- [x] T010 [P] [US1] Implement create_task function in src/services.py with title validation and auto-ID assignment
- [x] T011 [P] [US1] Implement get_all_tasks function in src/services.py
- [x] T012 [P] [US1] Implement get_task_by_id function in src/services.py
- [x] T013 [US1] Implement update_task function in src/services.py with validation
- [x] T014 [US1] Implement delete_task function in src/services.py
- [x] T015 [US1] Implement toggle_task_completion function in src/services.py
- [x] T016 [US1] Implement add task menu option in src/main.py
- [x] T017 [US1] Implement view tasks menu option in src/main.py
- [x] T018 [US1] Implement update task menu option in src/main.py
- [x] T019 [US1] Implement delete task menu option in src/main.py
- [x] T020 [US1] Implement mark task complete/incomplete menu option in src/main.py

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---
## Phase 4: User Story 2 - Console Navigation (Priority: P2)

**Goal**: Provide easy navigation of the console application with clear menu options and proper input validation to avoid crashes or unexpected behavior

**Independent Test**: Can be tested by navigating through all menu options, entering invalid inputs, and confirming the application handles all cases gracefully without crashing.

### Implementation for User Story 2

- [x] T021 [P] [US2] Implement validate_title function in src/services.py for 1-200 character validation
- [x] T022 [US2] Add input validation for menu selection in src/main.py
- [x] T023 [US2] Add error handling for invalid task ID inputs in src/main.py
- [x] T024 [US2] Add graceful error handling for invalid input types in src/main.py
- [x] T025 [US2] Implement clear error messages that return to main menu in src/main.py
- [x] T026 [US2] Add validation for task title input (1-200 characters) in src/main.py
- [x] T027 [US2] Implement confirmation prompts where appropriate in src/main.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---
## Phase 5: User Story 3 - Data Persistence in Memory (Priority: P3)

**Goal**: Maintain tasks in memory during application session and clear them when application exits

**Independent Test**: Can be tested by adding tasks, navigating through the application, and confirming tasks remain available until application exits.

### Implementation for User Story 3

- [x] T028 [P] [US3] Ensure in-memory storage maintains state throughout application session in src/services.py
- [x] T029 [US3] Implement proper timestamp formatting in ISO 8601 format (YYYY-MM-DD HH:MM:SS) in src/models.py
- [x] T030 [US3] Add "No tasks found" message when viewing empty task list in src/main.py
- [x] T031 [US3] Ensure tasks are cleared upon application exit (verify in-memory behavior)
- [x] T032 [US3] Add proper handling for non-existent task IDs with appropriate error messages in src/main.py
- [x] T033 [US3] Implement auto-incrementing ID starting from 1 in src/services.py

**Checkpoint**: All user stories should now be independently functional

---
## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T034 [P] Add comprehensive docstrings to all functions in src/models.py and src/services.py
- [x] T035 [P] Add user-friendly messages and prompts throughout src/main.py
- [x] T036 Add proper exit confirmation in src/main.py
- [x] T037 [P] Add consistent formatting for task display in src/main.py
- [x] T038 Code cleanup and refactoring across all files
- [x] T039 Run manual testing validation per quickstart.md

---
## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---
## Parallel Example: User Story 1

```bash
# Launch all model implementations for User Story 1 together:
Task: "Implement create_task function in src/services.py with title validation and auto-ID assignment"
Task: "Implement get_all_tasks function in src/services.py"
Task: "Implement get_task_by_id function in src/services.py"

# Launch all menu options for User Story 1 together:
Task: "Implement add task menu option in src/main.py"
Task: "Implement view tasks menu option in src/main.py"
Task: "Implement update task menu option in src/main.py"
```

---
## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---
## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify implementation works with manual testing as specified
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence