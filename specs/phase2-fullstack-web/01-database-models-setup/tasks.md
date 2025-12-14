# Database Foundation & SQLModel Setup - Task Checklist

## Phase 1: Project Setup
**Duration**: 30-45 minutes

### Task 1.1: Create Backend Directory Structure
- [ ] Create `backend/` directory
- [ ] Create `backend/.env` (git-ignored)
- [ ] Create `backend/.env.example` with template
- [ ] Create `backend/pyproject.toml` with project configuration
- [ ] Update root `.gitignore` to exclude .env files

### Task 1.2: Configure Dependencies
- [ ] Initialize UV project in backend directory
- [ ] Add dependencies: sqlmodel, psycopg2-binary, python-dotenv
- [ ] Generate lock file using `uv lock`
- [ ] Verify dependencies can be imported with test script

## Phase 2: Data Model Implementation
**Duration**: 45-60 minutes

### Task 2.1: Implement User Model
- [X] Create `backend/models.py` file
- [X] Define User class inheriting from SQLModel with table=True
- [X] Add id field: Optional[int], primary_key=True, auto-increment
- [X] Add email field: str, max_length=255, unique=True, index=True
- [X] Add name field: str, max_length=100, not null
- [X] Add hashed_password field: str, max_length=255, not null
- [X] Add created_at field: datetime, default_factory=datetime.utcnow
- [X] Add updated_at field: datetime, default_factory=datetime.utcnow
- [X] Add tasks relationship: List["Task"], back_populates="user"

### Task 2.2: Implement Task Model
- [X] Define Task class inheriting from SQLModel with table=True
- [X] Add id field: Optional[int], primary_key=True, auto-increment
- [X] Add user_id field: int, foreign_key="user.id", index=True
- [X] Add title field: str, max_length=200, not null
- [X] Add description field: str, default="", max_length=1000
- [X] Add completed field: bool, default=False
- [X] Add created_at field: datetime, default_factory=datetime.utcnow
- [X] Add updated_at field: datetime, default_factory=datetime.utcnow
- [X] Add user relationship: Optional[User], back_populates="tasks"

## Phase 3: Database Connection Management
**Duration**: 30-45 minutes

### Task 3.1: Create Database Connection Module
- [X] Create `backend/db.py` file
- [X] Import necessary modules (SQLModel, create_engine, Session, os, dotenv)
- [X] Load DATABASE_URL from environment variables using python-dotenv
- [X] Create SQLModel engine with DATABASE_URL and echo=True
- [X] Implement get_session() function that yields database session
- [X] Implement create_tables() function that creates all tables from SQLModel metadata
- [X] Add proper error handling for connection issues

## Phase 4: Testing & Validation
**Duration**: 30-45 minutes

### Task 4.1: Create Test Script
- [X] Create `backend/test_db.py` file
- [X] Import necessary modules (SQLModel, Session, models, db)
- [X] Implement database connectivity test function
- [X] Implement table creation test function
- [X] Implement User CRUD operations test function
- [X] Implement Task CRUD operations test function
- [X] Implement relationship validation test function
- [X] Implement foreign key constraint test function
- [X] Add proper output messages for each test step

### Task 4.2: Execute Tests
- [ ] Run test script to validate all functionality
- [ ] Verify database connectivity works
- [ ] Verify tables are created automatically
- [ ] Verify User CRUD operations work correctly
- [ ] Verify Task CRUD operations work correctly
- [ ] Verify User-Task relationships work correctly
- [ ] Verify foreign key constraints are enforced
- [ ] Document test results and any issues found

## Phase 5: Documentation
**Duration**: 30-45 minutes

### Task 5.1: Create Backend README
- [ ] Create `backend/README.md` file
- [ ] Document overview of backend functionality
- [ ] Document prerequisites (Python 3.13+, UV package manager)
- [ ] Document installation steps with UV commands
- [ ] Document configuration steps (setting up .env)
- [ ] Document how to run tests
- [ ] Document database schema with tables and relationships
- [ ] Document troubleshooting guide with common issues

### Task 5.2: Create Backend Instructions
- [ ] Create `backend/CLAUDE.md` file with backend-specific instructions
- [ ] Document code standards and conventions for backend
- [ ] Document testing procedures and best practices
- [ ] Document deployment considerations

## Phase 6: Validation & Completion
**Duration**: 15-30 minutes

### Task 6.1: Final Validation Checklist
- [ ] Verify Neon database is accessible remotely
- [ ] Verify tables are created automatically via SQLModel
- [ ] Verify User-Task relationship is functioning (One-to-Many)
- [ ] Verify CRUD operations are working correctly
- [ ] Verify data persists between application restarts
- [ ] Verify no hardcoded credentials exist in code
- [ ] Verify all files have proper imports and type hints
- [ ] Verify .env file exists with valid DATABASE_URL
- [ ] Verify .env.example is properly documented
- [ ] Verify .gitignore excludes .env files
- [ ] Verify pyproject.toml has correct dependencies
- [ ] Verify test script runs without errors
- [ ] Verify user can be created successfully
- [ ] Verify task can be created for user
- [ ] Verify tasks can be queried by user
- [ ] Verify task can be updated
- [ ] Verify task can be deleted
- [ ] Verify foreign key constraint works correctly

### Task 6.2: Security Validation
- [ ] Verify no hardcoded credentials in source code
- [ ] Verify passwords are hashed (not plain text)
- [ ] Verify SSL is enforced for database connections
- [ ] Verify .env is not committed to git
- [ ] Verify user data is isolated by user_id

## Acceptance Criteria Verification

### Database Setup:
- [ ] Neon account created and accessible
- [ ] Database created and accessible
- [ ] Connection string obtained with SSL mode
- [ ] SSL connection working properly

### Code Implementation:
- [ ] backend/models.py contains User and Task models with all required fields
- [ ] backend/db.py contains engine and get_session function
- [ ] backend/test_db.py runs without errors and validates all functionality
- [ ] All files have proper imports and type hints

### Configuration:
- [ ] .env file exists with valid DATABASE_URL format
- [ ] .env.example is properly documented with setup instructions
- [ ] .gitignore excludes .env files while including .env.example
- [ ] pyproject.toml has correct dependencies (sqlmodel, psycopg2-binary, python-dotenv)

### Testing:
- [ ] Test script runs successfully with all tests passing
- [ ] User can be created with all required fields
- [ ] Task can be created for user with proper relationship
- [ ] Tasks can be queried by user_id
- [ ] Task can be updated (especially completion status)
- [ ] Task can be deleted successfully
- [ ] Foreign key constraint prevents orphaned tasks

### Documentation:
- [ ] README.md in backend folder with complete setup guide
- [ ] Setup instructions are clear and comprehensive
- [ ] Code has appropriate docstrings
- [ ] Comments explain complex logic where needed

### Security:
- [ ] No hardcoded credentials in any code files
- [ ] Passwords are properly hashed before database storage
- [ ] SSL mode is enforced for all database connections
- [ ] .env file is properly git-ignored