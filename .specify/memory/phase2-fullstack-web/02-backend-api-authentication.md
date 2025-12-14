# Constitution 2: Backend API & Authentication

## Project Context
Phase II of Hackathon Todo App - Building FastAPI REST API endpoints with JWT-based authentication using Better Auth, securing user registration/login, and implementing CRUD operations for tasks with proper authorization.

---

## Mission Statement
Develop a secure, production-ready REST API using **FastAPI** with **Better Auth** authentication that enables user registration, login, and protected task management operations with proper data isolation and security controls.

---

## Core Objectives

### Primary Goals
1. Set up FastAPI application structure with proper routing
2. Integrate Better Auth for JWT-based authentication
3. Implement user registration and login endpoints
4. Create protected task CRUD endpoints (Create, Read, Update, Delete)
5. Add middleware for token verification and user context
6. Implement proper error handling and validation
7. Test all API endpoints with sample data
8. Document API with automatic OpenAPI/Swagger docs

### Success Criteria
- ✅ FastAPI server runs without errors
- ✅ User can register with email/password
- ✅ User can login and receive JWT token
- ✅ Protected endpoints require valid JWT token
- ✅ Users can only access their own tasks
- ✅ All CRUD operations work correctly
- ✅ Proper error messages for invalid requests
- ✅ API documentation is auto-generated and accessible
- ✅ CORS is configured for frontend integration
- ✅ Password hashing works correctly

---

## Technical Requirements

### Framework & Libraries
- **API Framework:** FastAPI 0.104+
- **Authentication:** Better Auth (PyJWT wrapper)
- **Password Hashing:** bcrypt or passlib[bcrypt]
- **Validation:** Pydantic V2 (built into FastAPI)
- **CORS:** FastAPI CORS middleware
- **API Testing:** httpx (for testing)

### Python Dependencies
```toml
[project]
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "python-jose[cryptography]>=3.3.0",
    "passlib[bcrypt]>=1.7.4",
    "python-multipart>=0.0.6",
    "sqlmodel>=0.0.14",
    "psycopg2-binary>=2.9.9",
    "python-dotenv>=1.0.0"
]

[project.optional-dependencies]
dev = [
    "httpx>=0.25.0",
    "pytest>=7.4.3",
    "pytest-asyncio>=0.21.1"
]
```

---

## API Architecture

### Endpoint Structure
```
/api/v1/
├── /auth
│   ├── POST /register        # User registration
│   ├── POST /login          # User login (returns JWT)
│   └── GET /me              # Get current user info (protected)
│
└── /tasks
    ├── GET /                # Get all tasks for current user
    ├── POST /               # Create new task
    ├── GET /{task_id}       # Get specific task
    ├── PUT /{task_id}       # Update task
    └── DELETE /{task_id}    # Delete task
```

### Authentication Flow
```
1. User Registration → POST /api/v1/auth/register
   - Validates email format
   - Checks if email already exists
   - Hashes password with bcrypt
   - Creates user in database
   - Returns user info (no password)

2. User Login → POST /api/v1/auth/login
   - Validates credentials
   - Verifies hashed password
   - Generates JWT token (24h expiry)
   - Returns access_token and token_type

3. Protected Requests → Authorization: Bearer <token>
   - Middleware extracts token from header
   - Verifies JWT signature and expiry
   - Extracts user_id from token payload
   - Attaches user to request context
   - Routes can access current_user
```

---

## Data Transfer Objects (DTOs)

### Authentication DTOs
```python
# Request Models
class UserRegister(BaseModel):
    email: EmailStr
    name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=8, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Response Models
class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
```

### Task DTOs
```python
# Request Models
class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=1000)

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    completed: Optional[bool] = None

# Response Models
class TaskResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

---

## Security Implementation

### JWT Configuration
```python
# Environment Variables Required
SECRET_KEY=your-secret-key-min-32-chars-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours
```

### Password Hashing
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

### JWT Token Creation
```python
from datetime import datetime, timedelta
from jose import jwt

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

### Authorization Dependency
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = session.get(User, user_id)
    if user is None:
        raise credentials_exception
    return user
```

---

## File Structure & Organization
```
hackathon2-todo-app/
├── backend/
│   ├── .env                          # Environment variables (from Constitution 1)
│   ├── .env.example                  # Updated with new variables
│   ├── pyproject.toml                # Updated dependencies
│   ├── uv.lock                       # Updated lock file
│   │
│   ├── main.py                       # ⭐ FastAPI app initialization & CORS
│   ├── models.py                     # ✅ SQLModel models (from Constitution 1)
│   ├── db.py                         # ✅ Database connection (from Constitution 1)
│   │
│   ├── schemas.py                    # ⭐ Pydantic DTOs for request/response
│   ├── auth.py                       # ⭐ JWT utilities & password hashing
│   ├── dependencies.py               # ⭐ FastAPI dependencies (get_current_user)
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py                   # ⭐ Authentication routes
│   │   └── tasks.py                  # ⭐ Task CRUD routes
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_auth.py              # ⭐ Auth endpoint tests
│   │   └── test_tasks.py             # ⭐ Task endpoint tests
│   │
│   └── README.md                     # Updated with API documentation
│
└── C:\hackathon2-todo-app\specs\phase2-fullstack-web\02-backend-api-auth/
    ├── constitution.md               # This document
    ├── specs.md                      # Detailed technical specifications
    ├── clarify.md                    # Questions and clarifications
    ├── plan.md                       # Step-by-step implementation plan
    ├── tasks.md                      # Actionable task checklist
    ├── research.md                   # Research notes and references
    └── implementation-notes.md       # Post-implementation learnings
```

---

## API Endpoint Specifications

### 1. User Registration
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123"
}

# Success Response (201 Created)
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2025-12-09T10:30:00Z"
}

# Error Response (400 Bad Request)
{
  "detail": "Email already registered"
}
```

### 2. User Login
```http
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=SecurePass123

# Success Response (200 OK)
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}

# Error Response (401 Unauthorized)
{
  "detail": "Incorrect email or password"
}
```

### 3. Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Success Response (200 OK)
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2025-12-09T10:30:00Z"
}
```

### 4. Create Task
```http
POST /api/v1/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the todo app hackathon"
}

# Success Response (201 Created)
{
  "id": 1,
  "user_id": 1,
  "title": "Complete project",
  "description": "Finish the todo app hackathon",
  "completed": false,
  "created_at": "2025-12-09T11:00:00Z",
  "updated_at": "2025-12-09T11:00:00Z"
}
```

### 5. Get All User Tasks
```http
GET /api/v1/tasks
Authorization: Bearer <token>

# Success Response (200 OK)
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Complete project",
    "description": "Finish the todo app hackathon",
    "completed": false,
    "created_at": "2025-12-09T11:00:00Z",
    "updated_at": "2025-12-09T11:00:00Z"
  }
]
```

### 6. Get Single Task
```http
GET /api/v1/tasks/1
Authorization: Bearer <token>

# Success Response (200 OK)
{
  "id": 1,
  "user_id": 1,
  "title": "Complete project",
  "description": "Finish the todo app hackathon",
  "completed": false,
  "created_at": "2025-12-09T11:00:00Z",
  "updated_at": "2025-12-09T11:00:00Z"
}

# Error Response (404 Not Found)
{
  "detail": "Task not found"
}
```

### 7. Update Task
```http
PUT /api/v1/tasks/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "completed": true
}

# Success Response (200 OK)
{
  "id": 1,
  "user_id": 1,
  "title": "Complete project",
  "description": "Finish the todo app hackathon",
  "completed": true,
  "created_at": "2025-12-09T11:00:00Z",
  "updated_at": "2025-12-09T11:15:00Z"
}
```

### 8. Delete Task
```http
DELETE /api/v1/tasks/1
Authorization: Bearer <token>

# Success Response (204 No Content)
# No response body
```

---

## Error Handling Strategy

### Standard Error Responses
```python
# 400 Bad Request - Validation errors
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}

# 401 Unauthorized - Invalid/missing token
{
  "detail": "Could not validate credentials"
}

# 403 Forbidden - User doesn't own resource
{
  "detail": "Not authorized to access this resource"
}

# 404 Not Found - Resource doesn't exist
{
  "detail": "Task not found"
}

# 409 Conflict - Duplicate resource
{
  "detail": "Email already registered"
}

# 500 Internal Server Error - Unexpected errors
{
  "detail": "Internal server error"
}
```

### Custom Exception Handlers
```python
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc)}
    )
```

---

## CORS Configuration

### Development CORS Settings
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # React dev server
        "http://localhost:5173",      # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Production CORS Settings
```python
# Update for production deployment
allow_origins=[
    "https://yourdomain.com",
    "https://www.yourdomain.com"
]
```

---

## Implementation Scope (This Iteration)

### In Scope ✅
- Create FastAPI application with routing structure
- Install FastAPI and authentication dependencies
- Implement JWT token generation and verification
- Create user registration endpoint with password hashing
- Create user login endpoint with token response
- Implement get_current_user dependency for protected routes
- Create all 5 task CRUD endpoints (GET, POST, PUT, DELETE)
- Add proper error handling and validation
- Configure CORS for frontend access
- Write tests for auth and task endpoints
- Update .env.example with new variables
- Document API with Swagger/OpenAPI

### Out of Scope ❌
- Frontend UI development (Constitution 3)
- Email verification (future enhancement)
- Password reset functionality (future enhancement)
- Refresh token mechanism (future enhancement)
- Rate limiting (future enhancement)
- Advanced filtering/sorting (future enhancement)
- File upload for tasks (future enhancement)
- Deployment configuration (Constitution 4)

---

## Testing Strategy

### Unit Tests
- ✅ Password hashing works correctly
- ✅ JWT token generation includes correct claims
- ✅ JWT token verification catches invalid tokens
- ✅ User validation catches invalid emails
- ✅ Task validation enforces title requirements

### Integration Tests
```python
# Test user registration
def test_register_user():
    response = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "name": "Test User",
        "password": "TestPass123"
    })
    assert response.status_code == 201
    assert "id" in response.json()

# Test user login
def test_login_user():
    response = client.post("/api/v1/auth/login", data={
        "username": "test@example.com",
        "password": "TestPass123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

# Test protected endpoint without token
def test_get_tasks_unauthorized():
    response = client.get("/api/v1/tasks")
    assert response.status_code == 401

# Test create task with token
def test_create_task():
    token = login_and_get_token()
    response = client.post(
        "/api/v1/tasks",
        json={"title": "Test Task"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201

# Test user isolation (user cannot access other user's tasks)
def test_task_isolation():
    user1_token = create_user_and_login("user1@test.com")
    user2_token = create_user_and_login("user2@test.com")

    # User 1 creates task
    task = create_task(user1_token, "User 1 Task")

    # User 2 tries to access User 1's task
    response = client.get(
        f"/api/v1/tasks/{task['id']}",
        headers={"Authorization": f"Bearer {user2_token}"}
    )
    assert response.status_code == 404
```

---

## Environment Variables

### Required Variables (.env)
```env
# Database (from Constitution 1)
DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require

# JWT Authentication (NEW)
SECRET_KEY=your-super-secret-key-min-32-characters-random-string-use-openssl
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS (NEW)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Server (NEW)
API_V1_PREFIX=/api/v1
DEBUG=true
```

### Generate Secret Key
```bash
# Use OpenSSL to generate secure secret key
openssl rand -hex 32

# Or Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Running the API

### Development Mode
```bash
# Navigate to backend folder
cd backend

# Install dependencies
uv sync

# Run development server with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# API will be available at:
# - API: http://localhost:8000
# - Swagger Docs: http://localhost:8000/docs
# - ReDoc: http://localhost:8000/redoc
```

### Testing the API
```bash
# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=. --cov-report=html

# Run specific test file
uv run pytest tests/test_auth.py -v
```

### Manual Testing with cURL
```bash
# Register user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"TestPass123"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=TestPass123"

# Create task (replace TOKEN)
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","description":"Task details"}'

# Get tasks
curl http://localhost:8000/api/v1/tasks \
  -H "Authorization: Bearer TOKEN"
```

---

## Validation Checklist

Before moving to Constitution 3, verify:

- [ ] FastAPI server starts without errors
- [ ] Swagger docs accessible at /docs
- [ ] User can register with valid email/password
- [ ] Duplicate email registration is rejected
- [ ] User can login and receives JWT token
- [ ] Invalid credentials return 401 error
- [ ] Token is validated on protected endpoints
- [ ] Expired/invalid tokens are rejected
- [ ] Current user info is returned from /auth/me
- [ ] User can create tasks (POST /tasks)
- [ ] User can view their tasks (GET /tasks)
- [ ] User can view single task (GET /tasks/{id})
- [ ] User can update task (PUT /tasks/{id})
- [ ] User can delete task (DELETE /tasks/{id})
- [ ] User cannot access other users' tasks
- [ ] CORS headers are present in responses
- [ ] Passwords are hashed in database (never plain text)
- [ ] All tests pass successfully
- [ ] API returns proper error messages
- [ ] .env file has all required variables

---

## Security Checklist

Critical security requirements:

- [ ] SECRET_KEY is strong (32+ characters) and unique
- [ ] SECRET_KEY is never committed to Git
- [ ] Passwords are hashed with bcrypt before storage
- [ ] JWT tokens have expiration time
- [ ] Token validation happens on every protected request
- [ ] User ID is extracted from verified token (not request body)
- [ ] Database queries filter by authenticated user_id
- [ ] SQL injection is prevented (SQLModel parameterized queries)
- [ ] CORS origins are explicitly listed (not "*" in production)
- [ ] Error messages don't leak sensitive information
- [ ] Password requirements enforced (min length)
- [ ] Database uses SSL connection (sslmode=require)

---

## Common Issues & Solutions

### Issue: Token validation fails
**Solution:** Check SECRET_KEY matches between token creation and verification

### Issue: CORS errors in browser
**Solution:** Ensure frontend URL is in allow_origins list

### Issue: "Table not found" errors
**Solution:** Run Constitution 1's test_db.py to create tables first

### Issue: Password validation always fails
**Solution:** Verify bcrypt is installed: `uv add passlib[bcrypt]`

### Issue: 422 Validation Error on login
**Solution:** Use x-www-form-urlencoded, not JSON, with username/password fields

### Issue: Cannot access other user's tasks (404)
**Solution:** This is correct behavior! Tasks are isolated by user_id

---

## Learning Outcomes

By completing this iteration, you will understand:
- FastAPI application structure and routing
- JWT token-based authentication flow
- Password hashing and security best practices
- Protected route implementation with dependencies
- REST API design principles
- Request/response validation with Pydantic
- Error handling and HTTP status codes
- CORS configuration for frontend integration
- User authorization and data isolation
- API testing strategies

---

## Next Steps (Constitution 3 Preview)

After completing this backend API:
1. Set up React + TypeScript frontend project
2. Create authentication context and protected routes
3. Build login and registration forms
4. Implement task list UI with CRUD operations
5. Add API client with axios/fetch
6. Handle loading and error states
7. Style with Tailwind CSS or Chakra UI
8. Test frontend-backend integration

---

## Performance Considerations

### Database Connection Pooling
```python
# In db.py, configure engine with connection pool
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Set False in production
    pool_size=5,
    max_overflow=10
)
```

### Query Optimization
```python
# Avoid N+1 queries by using selectinload
from sqlalchemy.orm import selectinload

statement = select(User).options(selectinload(User.tasks))
results = session.exec(statement).all()
```

### Response Optimization
```python
# Use response_model to exclude unnecessary fields
@app.get("/tasks", response_model=list[TaskResponse])
async def get_tasks(...):
    # Only returns fields defined in TaskResponse
    pass
```

---

## API Documentation Standards

### Swagger/OpenAPI Enhancements
```python
@app.post(
    "/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
    description="Create a new task for the authenticated user",
    responses={
        201: {"description": "Task created successfully"},
        401: {"description": "Not authenticated"},
        422: {"description": "Validation error"}
    },
    tags=["tasks"]
)
async def create_task(...):
    pass
```

### API Versioning
```python
# Current: /api/v1/tasks
# Future: /api/v2/tasks (with breaking changes)

API_V1_PREFIX = "/api/v1"
app.include_router(auth_router, prefix=API_V1_PREFIX)
app.include_router(tasks_router, prefix=API_V1_PREFIX)
```

---

## Monitoring & Logging

### Basic Logging Setup
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# Use in routes
logger.info(f"User {user.id} created task {task.id}")
logger.error(f"Failed to authenticate user: {email}")
```

### Request/Response Logging Middleware
```python
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Status: {response.status_code}")
    return response
```

---

## References & Resources

### Documentation
- FastAPI Docs: https://fastapi.tiangolo.com/
- JWT.io: https://jwt.io/introduction
- Passlib Docs: https://passlib.readthedocs.io/
- Python-JOSE: https://python-jose.readthedocs.io/
- OAuth2 with Password Flow: https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/

### Tutorials
- FastAPI Security: https://fastapi.tiangolo.com/tutorial/security/
- JWT Authentication: https://testdriven.io/blog/fastapi-jwt-auth/
- REST API Best Practices: https://restfulapi.net/

### Tools
- Swagger Editor: https://editor.swagger.io/
- Postman: https://www.postman.com/
- Thunder Client (VS Code): Extension for API testing
- HTTPie: https://httpie.io/ (CLI HTTP client)

---

## Version History

- **v1.0** - Initial constitution (Dec 9, 2025)
- Backend API structure defined
- Authentication flow documented
- CRUD endpoints specified
- Security requirements outlined

---

**Status:** 🟡 Ready for Implementation
**Next Action:** Create `specs.md` with detailed code implementation
**Estimated Time:** 6-8 hours
**Dependencies:** Constitution 1 (Database + Models) must be completed
**Due Date:** December 10, 2025 (End of Day)

---

*Constitution authored following Spec-Driven Development principles for Hackathon II Phase II - Backend API & Authentication Layer*