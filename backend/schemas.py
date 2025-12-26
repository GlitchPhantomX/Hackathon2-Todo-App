from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator
from typing import Optional, List
from datetime import datetime

class UserRegister(BaseModel):
    """Schema for user registration request"""
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8, max_length=100)

    model_config = {
        "populate_by_name": True,  # Accept alias in request
        "json_schema_extra": {
            "example": {
                "email": "john.doe@example.com",
                "name": "John Doe",      # Use "name" here
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
    avatar: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    timezone: Optional[str] = "UTC"
    locale: Optional[str] = "en-US"
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "email": "john.doe@example.com",
                "name": "John Doe",
                "avatar": "https://example.com/avatar.jpg",
                "bio": "Software developer",
                "phone": "+1234567890",
                "timezone": "America/New_York",
                "locale": "en-US",
                "created_at": "2025-12-09T10:30:00Z",
                "updated_at": "2025-12-09T10:30:00Z"
            }
        }
    }


class TokenResponse(BaseModel):
    """Schema for JWT token response"""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: Optional[str] = Field(None, description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")

    model_config = {
        "json_schema_extra": {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh...",
                "token_type": "bearer"
            }
        }
    }


class UserUpdate(BaseModel):
    """Schema for updating user profile information"""
    name: Optional[str] = Field(None, min_length=2, max_length=100, description="User full name")
    avatar: Optional[str] = Field(None, max_length=255, description="URL to user avatar")
    bio: Optional[str] = Field(None, max_length=500, description="User bio/description")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    timezone: Optional[str] = Field(None, max_length=50, description="User's timezone")
    locale: Optional[str] = Field(None, max_length=10, description="User's locale/language")

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "John Smith",
                "avatar": "https://example.com/new-avatar.jpg",
                "bio": "Senior software engineer",
                "phone": "+1987654321",
                "timezone": "Europe/London",
                "locale": "en-GB"
            }
        }
    }


class TaskCreate(BaseModel):
    """Schema for creating a new task"""
    title: str = Field(
        ...,
        min_length=3,
        max_length=100,
        description="Task title (3-100 characters)"
    )
    description: str = Field(
        default="",
        max_length=1000,
        description="Task description (optional, max 1000 characters)"
    )
    due_date: Optional[datetime] = Field(None, description="Task due date")
    priority: str = Field(default="medium", description="Task priority (low, medium, high)")
    project_id: Optional[int] = Field(None, description="Project ID to associate with task")
    tag_ids: Optional[List[int]] = Field(None, description="List of tag IDs to associate with the task")

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "Complete project documentation",
                "description": "Write comprehensive docs for the API",
                "due_date": "2025-12-31T23:59:59Z",
                "priority": "high",
                "project_id": 1,
                "tag_ids": [1, 2]
            }
        }
    }


class TaskUpdate(BaseModel):
    """Schema for updating an existing task (partial updates allowed)"""
    title: Optional[str] = Field(
        None,
        min_length=3,
        max_length=100,
        description="Updated task title (3-100 characters)"
    )
    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Updated task description (max 1000 characters)"
    )
    completed: Optional[bool] = Field(
        None,
        description="Task completion status"
    )
    due_date: Optional[datetime] = Field(None, description="Task due date")
    priority: Optional[str] = Field(None, description="Task priority (low, medium, high)")
    project_id: Optional[int] = Field(None, description="Project ID to associate with task")
    tag_ids: Optional[List[int]] = Field(None, description="List of tag IDs to associate with the task")

    model_config = {
        "json_schema_extra": {
            "example": {
                "completed": True,
                "priority": "high",
                "tag_ids": [1, 2, 3]
            }
        }
    }


class TaskResponse(BaseModel):
    """Schema for task information in responses"""
    id: int
    user_id: int
    project_id: Optional[int]
    title: str
    description: str
    completed: bool
    due_date: Optional[datetime]
    priority: str
    created_at: datetime
    updated_at: datetime
    tags: Optional[List["TagResponse"]] = None

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "user_id": 1,
                "project_id": 1,
                "title": "Complete project documentation",
                "description": "Write comprehensive docs for the API",
                "completed": False,
                "due_date": "2025-12-31T23:59:59Z",
                "priority": "high",
                "created_at": "2025-12-09T11:00:00Z",
                "updated_at": "2025-12-09T11:00:00Z",
                "tags": [
                    {
                        "id": 1,
                        "user_id": 1,
                        "name": "Work",
                        "color": "#3B82F6",
                        "created_at": "2025-12-09T10:00:00Z",
                        "updated_at": "2025-12-09T10:00:00Z"
                    }
                ]
            }
        }
    }


class TaskFilter(BaseModel):
    """Schema for task filtering parameters"""
    status: Optional[str] = Field(None, description="Task status filter (completed, pending)")
    priority: Optional[str] = Field(None, description="Priority filter (low, medium, high)")
    start_date: Optional[datetime] = Field(None, description="Start date for date range filter")
    end_date: Optional[datetime] = Field(None, description="End date for date range filter")
    project_id: Optional[int] = Field(None, description="Project ID filter")

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "pending",
                "priority": "high",
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-12-31T23:59:59Z",
                "project_id": 1
            }
        }
    }


class NotificationCreate(BaseModel):
    """Schema for creating a new notification"""
    type: str = Field(..., max_length=50, description="Notification type (info, warning, error, reminder, etc.)")
    title: str = Field(..., max_length=200, description="Notification title")
    message: str = Field(..., max_length=1000, description="Notification message")
    task_id: Optional[int] = Field(None, description="Associated task ID")
    task_title: Optional[str] = Field(None, max_length=200, description="Associated task title")
    icon: Optional[str] = Field(None, max_length=50, description="Icon name for the notification")
    color: Optional[str] = Field(None, max_length=20, description="Color for the notification")

    model_config = {
        "json_schema_extra": {
            "example": {
                "type": "reminder",
                "title": "Task Due Soon",
                "message": "Your task 'Complete project' is due tomorrow",
                "task_id": 1,
                "task_title": "Complete project",
                "icon": "bell",
                "color": "#ef4444"
            }
        }
    }


class NotificationUpdate(BaseModel):
    """Schema for updating a notification"""
    read: Optional[bool] = Field(None, description="Read status of the notification")

    model_config = {
        "json_schema_extra": {
            "example": {
                "read": True
            }
        }
    }


class NotificationResponse(BaseModel):
    """Schema for notification information in responses"""
    id: int
    user_id: int
    type: str
    title: str
    message: str
    task_id: Optional[int]
    task_title: Optional[str]
    read: bool
    created_at: datetime
    icon: Optional[str]
    color: Optional[str]

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "user_id": 1,
                "type": "reminder",
                "title": "Task Due Soon",
                "message": "Your task 'Complete project' is due tomorrow",
                "task_id": 1,
                "task_title": "Complete project",
                "read": False,
                "created_at": "2025-12-09T11:00:00Z",
                "icon": "bell",
                "color": "#ef4444"
            }
        }
    }


class UserPreferenceResponse(BaseModel):
    """Schema for user preferences in responses"""
    id: int
    user_id: int
    theme: str
    accent_color: str
    font_size: str
    notifications_enabled: bool
    email_notifications: bool
    default_priority: str
    default_project_id: Optional[int]
    default_view: str
    items_per_page: int
    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "user_id": 1,
                "theme": "system",
                "accent_color": "#3b82f6",
                "font_size": "M",
                "notifications_enabled": True,
                "email_notifications": True,
                "default_priority": "medium",
                "default_project_id": 1,
                "default_view": "list",
                "items_per_page": 10,
                "updated_at": "2025-12-09T11:00:00Z"
            }
        }
    }


class UserPreferenceUpdate(BaseModel):
    """Schema for updating user preferences"""
    theme: Optional[str] = Field(None, description="UI theme (light, dark, system)")
    accent_color: Optional[str] = Field(None, max_length=7, description="Hex color for accent")
    font_size: Optional[str] = Field(None, description="Font size (S, M, L)")
    notifications_enabled: Optional[bool] = Field(None, description="Enable notifications")
    email_notifications: Optional[bool] = Field(None, description="Enable email notifications")
    default_priority: Optional[str] = Field(None, description="Default task priority (low, medium, high)")
    default_project_id: Optional[int] = Field(None, description="Default project ID")
    default_view: Optional[str] = Field(None, description="Default view (list, grid)")
    items_per_page: Optional[int] = Field(None, description="Number of items per page")

    model_config = {
        "json_schema_extra": {
            "example": {
                "theme": "dark",
                "accent_color": "#8b5cf6",
                "notifications_enabled": False
            }
        }
    }


class ProjectCreate(BaseModel):
    """Schema for creating a new project"""
    name: str = Field(..., max_length=100, description="Project name")
    description: str = Field(default="", max_length=500, description="Project description")
    color: str = Field(default="#3b82f6", max_length=7, description="Hex color for project")
    icon: Optional[str] = Field(None, max_length=50, description="Icon name for the project")

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Website Redesign",
                "description": "Redesign company website",
                "color": "#ef4444",
                "icon": "palette"
            }
        }
    }


class ProjectUpdate(BaseModel):
    """Schema for updating an existing project"""
    name: Optional[str] = Field(None, max_length=100, description="Project name")
    description: Optional[str] = Field(None, max_length=500, description="Project description")
    color: Optional[str] = Field(None, max_length=7, description="Hex color for project")
    icon: Optional[str] = Field(None, max_length=50, description="Icon name for the project")

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Updated Project Name",
                "description": "Updated description"
            }
        }
    }


class ProjectResponse(BaseModel):
    """Schema for project information in responses"""
    id: int
    user_id: int
    name: str
    description: str
    color: str
    icon: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "user_id": 1,
                "name": "Website Redesign",
                "description": "Redesign company website",
                "color": "#ef4444",
                "icon": "palette",
                "created_at": "2025-12-09T11:00:00Z",
                "updated_at": "2025-12-09T11:00:00Z"
            }
        }
    }


class StatsResponse(BaseModel):
    """Schema for statistics response"""
    total: int
    completed: int
    pending: int
    overdue: int
    by_priority: dict
    by_project: List[dict]
    completion_rate: float
    productivity_trend: List[dict]

    model_config = {
        "json_schema_extra": {
            "example": {
                "total": 25,
                "completed": 15,
                "pending": 8,
                "overdue": 2,
                "by_priority": {
                    "high": 5,
                    "medium": 12,
                    "low": 8
                },
                "by_project": [
                    {"id": 1, "name": "Website Redesign", "count": 10},
                    {"id": 2, "name": "Marketing Campaign", "count": 5}
                ],
                "completion_rate": 60.0,
                "productivity_trend": [
                    {"date": "2025-12-01", "created": 5, "completed": 3, "score": 60},
                    {"date": "2025-12-02", "created": 3, "completed": 4, "score": 70}
                ]
            }
        }
    }


class BulkUpdateRequest(BaseModel):
    """Schema for bulk update request"""
    task_ids: List[int] = Field(..., description="List of task IDs to update")
    update_data: dict = Field(..., description="Data to update for all tasks")

    model_config = {
        "json_schema_extra": {
            "example": {
                "task_ids": [1, 2, 3],
                "update_data": {
                    "priority": "high",
                    "completed": True
                }
            }
        }
    }


class BulkDeleteRequest(BaseModel):
    """Schema for bulk delete request"""
    task_ids: List[int] = Field(..., description="List of task IDs to delete")

    model_config = {
        "json_schema_extra": {
            "example": {
                "task_ids": [1, 2, 3]
            }
        }
    }


class ImportRequest(BaseModel):
    """Schema for import request"""
    format: str = Field(..., description="Import format (CSV, JSON)")
    data: str = Field(..., description="Encoded file data")

    model_config = {
        "json_schema_extra": {
            "example": {
                "format": "CSV",
                "data": "base64 encoded file content"
            }
        }
    }


class ExportRequest(BaseModel):
    """Schema for export request"""
    format: str = Field(..., description="Export format (CSV, JSON, PDF)")
    filters: Optional[dict] = Field(None, description="Filters to apply to exported data")

    model_config = {
        "json_schema_extra": {
            "example": {
                "format": "CSV",
                "filters": {
                    "status": "completed",
                    "date_range": {"start": "2025-01-01", "end": "2025-12-31"}
                }
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
    
class TagCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=3,
        max_length=100,
        description="Tag name (3-100 characters)"
    )
    color: Optional[str] = Field(
        default="#3B82F6",
        max_length=7,
        description="Tag color in hex format (default: #3B82F6)"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Work",
                "color": "#3B82F6"
            }
        }
    }


class TagUpdate(BaseModel):
    name: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=100,
        description="Tag name (3-100 characters)"
    )
    color: Optional[str] = Field(
        default=None,
        max_length=7,
        description="Tag color in hex format"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Personal",
                "color": "#EF4444"
            }
        }
    }


class TagResponse(BaseModel):
    id: int
    user_id: int
    name: str
    color: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "user_id": 1,
                "name": "Work",
                "color": "#3B82F6",
                "created_at": "2025-12-25T10:00:00Z",
                "updated_at": "2025-12-25T10:00:00Z"
            }
        }
    }


class UserSettingsResponse(BaseModel):
    """Schema for user settings in responses"""
    id: int
    user_id: int

    # Appearance settings
    appearance_theme: str
    appearance_accent_color: str
    appearance_font_size: str
    appearance_language: str
    appearance_date_format: str
    appearance_time_format: str

    # Notification settings
    notifications_enabled: bool
    notifications_sound_enabled: bool
    notifications_email_notifications: bool
    notifications_push_notifications: bool
    notifications_task_reminders: bool
    notifications_daily_digest: bool

    # Task default settings
    task_defaults_default_priority: str
    task_defaults_default_project_id: Optional[int]
    task_defaults_default_view: str
    task_defaults_items_per_page: int
    task_defaults_auto_assign_today: bool

    # Privacy settings
    privacy_data_retention_days: int
    privacy_export_data_enabled: bool
    privacy_analytics_enabled: bool
    privacy_profile_visible: bool

    # Integration settings
    integrations_calendar_connected: bool
    integrations_email_connected: bool
    integrations_webhooks_enabled: bool
    integrations_connected_services: str  # JSON string

    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "user_id": 1,
                "appearance_theme": "dark",
                "appearance_accent_color": "#a855f7",
                "appearance_font_size": "M",
                "appearance_language": "en",
                "appearance_date_format": "MM/DD/YYYY",
                "appearance_time_format": "12h",
                "notifications_enabled": True,
                "notifications_sound_enabled": True,
                "notifications_email_notifications": True,
                "notifications_push_notifications": False,
                "notifications_task_reminders": True,
                "notifications_daily_digest": False,
                "task_defaults_default_priority": "medium",
                "task_defaults_default_project_id": None,
                "task_defaults_default_view": "list",
                "task_defaults_items_per_page": 20,
                "task_defaults_auto_assign_today": True,
                "privacy_data_retention_days": 90,
                "privacy_export_data_enabled": True,
                "privacy_analytics_enabled": True,
                "privacy_profile_visible": True,
                "integrations_calendar_connected": False,
                "integrations_email_connected": False,
                "integrations_webhooks_enabled": False,
                "integrations_connected_services": "[]",
                "updated_at": "2025-12-09T11:00:00Z"
            }
        }
    }


class UserSettingsUpdate(BaseModel):
    """Schema for updating user settings"""
    # Appearance settings
    appearance_theme: Optional[str] = Field(None, description="UI theme (light, dark, system)")
    appearance_accent_color: Optional[str] = Field(None, max_length=7, description="Hex color for accent")
    appearance_font_size: Optional[str] = Field(None, description="Font size (S, M, L)")
    appearance_language: Optional[str] = Field(None, max_length=10, description="Language code")
    appearance_date_format: Optional[str] = Field(None, max_length=20, description="Date format")
    appearance_time_format: Optional[str] = Field(None, description="Time format (12h, 24h)")

    # Notification settings
    notifications_enabled: Optional[bool] = Field(None, description="Enable notifications")
    notifications_sound_enabled: Optional[bool] = Field(None, description="Enable notification sounds")
    notifications_email_notifications: Optional[bool] = Field(None, description="Enable email notifications")
    notifications_push_notifications: Optional[bool] = Field(None, description="Enable push notifications")
    notifications_task_reminders: Optional[bool] = Field(None, description="Enable task reminders")
    notifications_daily_digest: Optional[bool] = Field(None, description="Enable daily digest")

    # Task default settings
    task_defaults_default_priority: Optional[str] = Field(None, description="Default task priority (low, medium, high)")
    task_defaults_default_project_id: Optional[int] = Field(None, description="Default project ID")
    task_defaults_default_view: Optional[str] = Field(None, description="Default view (list, grid)")
    task_defaults_items_per_page: Optional[int] = Field(None, description="Number of items per page")
    task_defaults_auto_assign_today: Optional[bool] = Field(None, description="Auto-assign tasks to today")

    # Privacy settings
    privacy_data_retention_days: Optional[int] = Field(None, description="Data retention days")
    privacy_export_data_enabled: Optional[bool] = Field(None, description="Enable data export")
    privacy_analytics_enabled: Optional[bool] = Field(None, description="Enable analytics")
    privacy_profile_visible: Optional[bool] = Field(None, description="Profile visibility")

    # Integration settings
    integrations_calendar_connected: Optional[bool] = Field(None, description="Calendar integration connected")
    integrations_email_connected: Optional[bool] = Field(None, description="Email integration connected")
    integrations_webhooks_enabled: Optional[bool] = Field(None, description="Webhooks enabled")
    integrations_connected_services: Optional[str] = Field(None, max_length=1000, description="Connected services (JSON string)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "appearance_theme": "dark",
                "appearance_accent_color": "#8b5cf6",
                "notifications_enabled": False
            }
        }
    }