from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List


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


class UserLogin(BaseModel):
    """Schema for user login request"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "john.doe@example.com",
                "password": "SecurePass123"
            }
        }
    }


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


class ValidationError(BaseModel):
    """Schema for validation error details"""
    loc: List[str] = Field(..., description="Error location")
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