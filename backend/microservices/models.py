from enum import Enum
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel
from sqlmodel import Field, SQLModel


class RecurrencePattern(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class TaskEvent(BaseModel):
    """
    Model for task events representing task lifecycle changes
    """
    event_id: str
    event_type: str  # 'task-completed', 'task-created', etc.
    task_id: int
    user_id: int
    timestamp: datetime
    payload: Dict[str, Any]


class NotificationEvent(BaseModel):
    """
    Model for notification events representing notifications to be delivered
    """
    event_id: str
    event_type: str  # 'reminder-sent', 'notification-delivered', etc.
    task_id: int
    user_id: int
    timestamp: datetime
    message: str
    delivery_status: str  # 'pending', 'delivered', 'failed'


class ProcessedEvent(SQLModel, table=True):
    """
    Model for tracking processed events to ensure idempotency
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    event_id: str
    service_name: str  # Which service processed it
    processed_at: datetime = Field(default_factory=datetime.now)
    result: str  # 'success', 'failure'


class NotificationQueue(SQLModel, table=True):
    """
    Model for temporary queue of pending notifications
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    queue_id: str
    task_id: int
    user_id: int
    scheduled_time: datetime
    priority: str  # 'high', 'normal', 'low'
    created_at: datetime = Field(default_factory=datetime.now)
    processed: bool = False


class TaskRecurrence(BaseModel):
    """
    Model for recurrence pattern and calculation
    """
    pattern: RecurrencePattern
    original_due_date: datetime
    next_due_date: datetime
    user_id: int
    task_title: str
    task_description: Optional[str] = None