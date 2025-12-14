# Data Model: Backend API & Authentication

## Database Schema (SQLModel Models)

### User Model
```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class UserBase(SQLModel):
    email: str = Field(unique=True, nullable=False)
    name: str = Field(min_length=2, max_length=100, nullable=False)

class User(UserBase, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, nullable=False)
    name: str = Field(min_length=2, max_length=100, nullable=False)
    hashed_password: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to tasks
    # tasks: List["Task"] = Relationship(back_populates="user")
```

### Task Model
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=200, nullable=False)
    description: str = Field(default="", max_length=1000)
    completed: bool = Field(default=False)

class Task(TaskBase, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(min_length=1, max_length=200, nullable=False)
    description: str = Field(default="", max_length=1000)
    completed: bool = Field(default=False)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to user
    # user: User = Relationship(back_populates="tasks")
```

## API Request/Response Models (Pydantic Schemas)

### Authentication Schemas

#### User Registration
```python
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class UserRegister(BaseModel):
    """Schema for user registration request"""
    email: EmailStr = Field(..., description="User email address")
    name: str = Field(..., min_length=2, max_length=100, description="User full name")
    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="User password (min 8 characters)"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "john.doe@example.com",
                "name": "John Doe",
                "password": "SecurePass123"
            }
        }
    }
```

#### User Login
```python
class UserLogin(BaseModel):
    """Schema for user login request (OAuth2 compatible)"""
    username: EmailStr = Field(..., description="User email (as username)")
    password: str = Field(..., description="User password")

    model_config = {
        "json_schema_extra": {
            "example": {
                "username": "john.doe@example.com",
                "password": "SecurePass123"
            }
        }
    }
```

#### User Response
```python
class UserResponse(BaseModel):
    """Schema for user information in responses"""
    id: int
    email: str
    name: str
    created_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "email": "john.doe@example.com",
                "name": "John Doe",
                "created_at": "2025-12-09T10:30:00Z"
            }
        }
    }
```

#### Token Response
```python
class TokenResponse(BaseModel):
    """Schema for JWT token response"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")

    model_config = {
        "json_schema_extra": {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer"
            }
        }
    }
```

### Task Schemas

#### Task Creation
```python
class TaskCreate(BaseModel):
    """Schema for creating a new task"""
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Task title"
    )
    description: str = Field(
        default="",
        max_length=1000,
        description="Task description (optional)"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "Complete project documentation",
                "description": "Write comprehensive docs for the API"
            }
        }
    }
```

#### Task Update
```python
class TaskUpdate(BaseModel):
    """Schema for updating an existing task (partial updates allowed)"""
    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=200,
        description="Updated task title"
    )
    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Updated task description"
    )
    completed: Optional[bool] = Field(
        None,
        description="Task completion status"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "completed": True
            }
        }
    }
```

#### Task Response
```python
class TaskResponse(BaseModel):
    """Schema for task information in responses"""
    id: int
    user_id: int
    title: str
    description: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "user_id": 1,
                "title": "Complete project documentation",
                "description": "Write comprehensive docs for the API",
                "completed": False,
                "created_at": "2025-12-09T11:00:00Z",
                "updated_at": "2025-12-09T11:00:00Z"
            }
        }
    }
```

## Error Response Models

### Error Detail
```python
class ErrorDetail(BaseModel):
    """Schema for error details"""
    detail: str = Field(..., description="Error message")

    model_config = {
        "json_schema_extra": {
            "example": {
                "detail": "Task not found"
            }
        }
    }
```

### Validation Error
```python
class ValidationError(BaseModel):
    """Schema for validation error details"""
    loc: list[str] = Field(..., description="Error location")
    msg: str = Field(..., description="Error message")
    type: str = Field(..., description="Error type")

    model_config = {
        "json_schema_extra": {
            "example": {
                "loc": ["body", "email"],
                "msg": "value is not a valid email address",
                "type": "value_error.email"
            }
        }
    }
```

## JWT Token Structure

### Access Token Payload
```python
# JWT token payload structure
{
    "sub": "user_id",           # Subject (user identifier)
    "exp": 1678886400,          # Expiration time (Unix timestamp)
    "iat": 1678882800,          # Issued at time (Unix timestamp)
    "type": "access"            # Token type
}
```

## Configuration Model

### Application Settings
```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Database Configuration (from Constitution 1)
    DATABASE_URL: str

    # JWT Configuration
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # CORS Configuration
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Todo API"
    DEBUG: bool = False

    # Computed Properties
    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True
    }

# Global settings instance
settings = Settings()
```

## Database Relationships

### User-Task Relationship
```
users (1) <---> (Many) tasks
users.id ←→ tasks.user_id (foreign key)
```

### Security Implications
- All task queries must filter by user_id for data isolation
- Users can only access tasks where user_id matches their ID
- No direct access to other users' tasks is possible

## Validation Rules

### User Model Validation
- Email: Must be valid email format
- Email: Must be unique across all users
- Name: Length between 2-100 characters
- Password: Hashed using bcrypt before storage

### Task Model Validation
- Title: Required, length between 1-200 characters
- Description: Optional, max length 1000 characters
- Completed: Boolean, defaults to False
- User ID: Required foreign key reference

### API Request Validation
- User registration: Email format, password strength, name length
- Task creation: Title length, description length
- Task updates: Field-specific validation for partial updates

## Indexing Strategy

### Database Indexes
- `users.email`: Unique index for fast email lookups during login
- `tasks.user_id`: Index for filtering tasks by user (critical for performance)
- `tasks.created_at`: Index for chronological sorting of tasks
- `tasks.updated_at`: Index for tracking modification times

## API Response Models

### Collection Responses
```python
# For endpoints returning multiple tasks
List[TaskResponse]

# Example response:
[
    {
        "id": 1,
        "user_id": 1,
        "title": "Task 1",
        "description": "Description of task 1",
        "completed": False,
        "created_at": "2025-12-09T10:00:00Z",
        "updated_at": "2025-12-09T10:00:00Z"
    },
    {
        "id": 2,
        "user_id": 1,
        "title": "Task 2",
        "description": "Description of task 2",
        "completed": True,
        "created_at": "2025-12-09T10:05:00Z",
        "updated_at": "2025-12-09T10:10:00Z"
    }
]
```

### Single Resource Responses
- UserResponse for user endpoints
- TaskResponse for task endpoints
- TokenResponse for authentication endpoints
- ErrorDetail for error responses

## Data Transformation

### SQLModel to Pydantic
- Use `from_attributes=True` for automatic conversion
- Exclude sensitive fields (passwords) from responses
- Convert datetime objects to ISO format
- Maintain type safety between layers

### Security Filtering
- Never return hashed_password in responses
- Validate user ownership before returning data
- Sanitize input data before database operations
- Log security-relevant events appropriately