"""
Data models for the Todo Application

This module contains the Task data model as specified in the requirements.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Task:
    """
    Task data model representing a todo item.

    Attributes:
        id: Unique identifier for each task (auto-incrementing starting from 1)
        title: Task title/description in short form (required, 1-200 characters)
        description: Detailed description of the task (optional)
        completed: Task completion status (boolean, default false)
        created_at: Timestamp of when the task was created (ISO 8601 format)
    """
    id: int
    title: str
    description: Optional[str] = None
    completed: bool = False
    created_at: datetime = None

    def __post_init__(self):
        """Set the created_at timestamp if not provided."""
        if self.created_at is None:
            self.created_at = datetime.now()

    def format_timestamp(self) -> str:
        """Format the created_at timestamp in ISO 8601 format (YYYY-MM-DD HH:MM:SS)."""
        return self.created_at.strftime("%Y-%m-%d %H:%M:%S")

    def __str__(self):
        """String representation of the task for display purposes."""
        status = "✓" if self.completed else "✗"
        timestamp = self.format_timestamp()
        return f"[{self.id}] {status} {self.title} (Created: {timestamp})"