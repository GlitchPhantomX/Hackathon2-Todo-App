# Quickstart: Backend API & Authentication

## Prerequisites

- Python 3.13+
- uv (Python package manager)
- PostgreSQL database (Neon or local instance)
- Git

## Setup Instructions

### 1. Clone and Navigate to Backend Directory
```bash
cd C:\hackathon2-todo-app
cd backend
```

### 2. Install Dependencies
```bash
# If you don't have uv installed:
pip install uv

# Install project dependencies
uv sync
```

### 3. Set Up Environment Variables
Create a `.env` file in the backend directory:

```env
# Database Configuration (from Constitution 1)
DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require

# JWT Authentication Configuration
SECRET_KEY=your-super-secret-key-at-least-32-characters-long-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000

# API Configuration
API_V1_PREFIX=/api/v1
PROJECT_NAME=Todo API
DEBUG=true
```

### 4. Generate Secret Key
```bash
# Using OpenSSL
openssl rand -hex 32

# Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 5. Create Required Files and Directory Structure
```bash
# Create the backend directory structure
mkdir -p routers tests

# Create __init__.py files to make directories Python packages
touch routers/__init__.py
touch tests/__init__.py
```

## File Creation Checklist

### Core Files
- [ ] `config.py` - Application configuration
- [ ] `schemas.py` - Pydantic models
- [ ] `auth.py` - Authentication utilities
- [ ] `dependencies.py` - FastAPI dependencies
- [ ] `main.py` - FastAPI application
- [ ] `routers/auth.py` - Authentication endpoints
- [ ] `routers/tasks.py` - Task endpoints

### Test Files
- [ ] `tests/conftest.py` - Test fixtures
- [ ] `tests/test_auth.py` - Authentication tests
- [ ] `tests/test_tasks.py` - Task tests

## Running the Application

### Development Server
```bash
# Run the development server with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# The API will be available at:
# - API: http://localhost:8000
# - Swagger Docs: http://localhost:8000/docs
# - ReDoc: http://localhost:8000/redoc
```

### Running Tests
```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=. --cov-report=html

# Run specific test file
uv run pytest tests/test_auth.py -v

# Run specific test
uv run pytest tests/test_auth.py::test_register_user_success -v
```

## API Endpoints Overview

### Authentication Endpoints
```
POST /api/v1/auth/register    # User registration
POST /api/v1/auth/login       # User login
GET  /api/v1/auth/me          # Get current user
```

### Task Endpoints
```
GET    /api/v1/tasks          # Get all tasks for current user
POST   /api/v1/tasks          # Create new task
GET    /api/v1/tasks/{id}     # Get specific task
PUT    /api/v1/tasks/{id}     # Update task
DELETE /api/v1/tasks/{id}     # Delete task
```

## Testing the API

### Using Swagger UI (Recommended)
1. Start the server: `uvicorn main:app --reload`
2. Open browser: `http://localhost:8000/docs`
3. Click "Authorize" button
4. Test endpoints interactively

### Using cURL
```bash
# Register user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"TestPass123"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=TestPass123"

# Create task (replace TOKEN with actual token from login response)
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","description":"Task details"}'

# Get all tasks
curl http://localhost:8000/api/v1/tasks \
  -H "Authorization: Bearer TOKEN"
```

## Database Setup

### Prerequisites from Constitution 1
- Ensure your PostgreSQL database is set up with the required tables
- The User and Task tables should already exist from Constitution 1
- Verify your DATABASE_URL in the .env file is correct

### Table Creation
The application will automatically create tables on startup if they don't exist:
- `users` table with email, name, hashed_password, created_at
- `tasks` table with title, description, completed, user_id, created_at, updated_at

## Development Workflow

### 1. Start Development Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Make API Requests
- Use Swagger UI at http://localhost:8000/docs
- Or use your preferred API client (Postman, Insomnia, etc.)

### 3. Run Tests Frequently
```bash
uv run pytest
```

### 4. Verify Implementation
Check that all constitution requirements are met:
- ✅ FastAPI server runs without errors
- ✅ User can register with email/password
- ✅ User can login and receive JWT token
- ✅ Protected endpoints require valid JWT token
- ✅ Users can only access their own tasks
- ✅ All CRUD operations work correctly

## Common Issues and Solutions

### Issue: ModuleNotFoundError for jose/passlib
**Solution:**
```bash
uv add python-jose[cryptography] passlib[bcrypt]
```

### Issue: Token validation fails
**Solution:** Check SECRET_KEY matches between token creation and verification

### Issue: CORS errors in browser
**Solution:** Ensure frontend URL is in ALLOWED_ORIGINS in .env

### Issue: "Table not found" errors
**Solution:** Run Constitution 1's database setup first

### Issue: 422 Validation Error on login
**Solution:** Use form-data with username/password, not JSON

### Issue: Cannot access other user's tasks (404)
**Solution:** This is correct! Tasks are isolated by user_id

### Issue: Import errors in routers
**Solution:** Add __init__.py to routers/ directory

## Next Steps

1. Complete the file implementation following the data models
2. Write comprehensive tests for all endpoints
3. Verify all constitution requirements are met
4. Update documentation as needed
5. Prepare for Constitution 3 (Frontend Development)