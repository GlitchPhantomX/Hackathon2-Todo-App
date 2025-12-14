# Tasks: Backend API & Authentication

**Feature**: Backend API & Authentication
**Branch**: `phase2-backend-api-auth`
**Spec**: [specs.md](specs.md) | **Plan**: [plan.md](plan.md)

## Implementation Strategy

Build a secure, production-ready REST API using FastAPI with JWT-based authentication that enables user registration, login, and protected task management operations with proper data isolation and security controls. Implement in phases: setup dependencies, create foundational components, implement user stories, and add polish.

**MVP Scope**: User registration, login, and basic task CRUD with authentication (User Story 1)

## Dependencies

- Python 3.13+
- FastAPI 0.104+
- python-jose[cryptography]
- passlib[bcrypt]
- SQLModel
- Pydantic V2
- PostgreSQL (from Constitution 1)

## Phase 1: Setup (Project Initialization)

- [ ] T001 Create backend directory structure
- [ ] T002 Create pyproject.toml with required dependencies
- [ ] T003 Create .env.example with environment variables
- [ ] T004 Create __init__.py files in backend directories
- [ ] T005 Install dependencies using uv

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T006 Create config.py with application settings
- [ ] T007 Create models.py with User and Task models (from Constitution 1)
- [ ] T008 Create db.py with database connection (from Constitution 1)
- [ ] T009 Create schemas.py with Pydantic models
- [ ] T010 Create auth.py with JWT and password utilities
- [ ] T011 Create dependencies.py with FastAPI dependencies

## Phase 3: [US1] User Registration & Authentication (P1)

**Goal**: Enable users to register, login, and authenticate API requests

**Independent Test Criteria**:
- User can register with email, name, and password
- User can login with credentials and receive JWT token
- Protected endpoints require valid JWT token
- Current user information can be retrieved

**Tasks**:
- [ ] T012 [P] [US1] Create auth router with register endpoint
- [ ] T013 [P] [US1] Create auth router with login endpoint
- [ ] T014 [P] [US1] Create auth router with get current user endpoint
- [ ] T015 [P] [US1] Test user registration with valid data
- [ ] T016 [P] [US1] Test user registration with invalid data
- [ ] T017 [P] [US1] Test user login with correct credentials
- [ ] T018 [P] [US1] Test user login with incorrect credentials
- [ ] T019 [P] [US1] Test protected endpoint access with valid token
- [ ] T020 [P] [US1] Test protected endpoint access without token

## Phase 4: [US2] Task Management (P1)

**Goal**: Enable authenticated users to create, read, update, and delete their tasks

**Independent Test Criteria**:
- User can create tasks with title and description
- User can view all their tasks
- User can view a specific task
- User can update task details
- User can delete their tasks
- Users cannot access other users' tasks

**Tasks**:
- [ ] T021 [P] [US2] Create tasks router with get all tasks endpoint
- [ ] T022 [P] [US2] Create tasks router with create task endpoint
- [ ] T023 [P] [US2] Create tasks router with get single task endpoint
- [ ] T024 [P] [US2] Create tasks router with update task endpoint
- [ ] T025 [P] [US2] Create tasks router with delete task endpoint
- [ ] T026 [P] [US2] Test task creation with valid data
- [ ] T027 [P] [US2] Test task creation with invalid data
- [ ] T028 [P] [US2] Test getting all tasks for user
- [ ] T029 [P] [US2] Test getting single task by ID
- [ ] T030 [P] [US2] Test updating task details
- [ ] T031 [P] [US2] Test deleting task
- [ ] T032 [P] [US2] Test user isolation (can't access other users' tasks)

## Phase 5: [US3] API Documentation & Health Checks (P2)

**Goal**: Provide API documentation and health check endpoints

**Independent Test Criteria**:
- API documentation available at /docs
- ReDoc available at /redoc
- Health check endpoints return status information

**Tasks**:
- [ ] T033 [P] [US3] Create main.py with FastAPI application
- [ ] T034 [P] [US3] Add CORS middleware configuration
- [ ] T035 [P] [US3] Add health check endpoints
- [ ] T036 [P] [US3] Include auth and tasks routers
- [ ] T037 [P] [US3] Test API documentation endpoints
- [ ] T038 [P] [US3] Test health check endpoints

## Phase 6: [US4] Comprehensive Testing (P2)

**Goal**: Implement comprehensive test coverage for all endpoints

**Independent Test Criteria**:
- Authentication endpoints have full test coverage
- Task endpoints have full test coverage
- Error cases are tested
- Authorization is tested

**Tasks**:
- [ ] T039 [P] [US4] Create tests/conftest.py with test fixtures
- [ ] T040 [P] [US4] Create tests/test_auth.py with authentication tests
- [ ] T041 [P] [US4] Create tests/test_tasks.py with task tests
- [ ] T042 [P] [US4] Test registration success and failure cases
- [ ] T043 [P] [US4] Test login success and failure cases
- [ ] T044 [P] [US4] Test all task CRUD operations
- [ ] T045 [P] [US4] Test authorization and user isolation
- [ ] T046 [P] [US4] Run full test suite with coverage

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T047 Update README.md with API documentation
- [ ] T048 Create .env file for development
- [ ] T049 Test full authentication flow (register → login → use token → operations)
- [ ] T050 Verify all constitution requirements are met
- [ ] T051 Run complete test suite and ensure all tests pass
- [ ] T052 Verify security requirements (password hashing, token validation, etc.)
- [ ] T053 Document API usage in README

## User Story Dependencies

- US2 (Task Management) requires US1 (Authentication) - authentication must be in place to protect task endpoints
- US3 (Documentation) can be implemented in parallel with other stories
- US4 (Testing) can run in parallel with implementation

## Parallel Execution Examples

**Story 1 Parallel Tasks**:
- T012, T013, T014 (auth endpoints) can run in parallel
- T015, T016, T017, T018 (auth tests) can run in parallel

**Story 2 Parallel Tasks**:
- T021, T022, T023, T024, T025 (task endpoints) can run in parallel
- T026, T027, T028, T029, T030, T031, T032 (task tests) can run in parallel

**Story 4 Parallel Tasks**:
- T039, T040, T041 (test files) can run in parallel
- T042, T043, T044, T045, T046 (individual tests) can run in parallel