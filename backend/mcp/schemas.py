"""MCP tool schemas for todo operations."""

from pydantic import BaseModel, Field
from typing import List, Optional


class CreateTaskInput(BaseModel):
    """Input schema for creating a task."""
    title: str = Field(..., min_length=1, max_length=200, description="Task title")
    description: Optional[str] = Field("", max_length=2000, description="Task description")
    priority: Optional[str] = Field("medium", pattern="^(low|medium|high)$", description="Priority level")
    due_date: Optional[str] = Field("", description="Due date in ISO format")
    tags: Optional[List[str]] = Field([], max_items=10, description="List of tags for the task")


class UpdateTaskInput(BaseModel):
    """Input schema for updating a task."""
    task_id: int = Field(..., gt=0, description="ID of the task to update")
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="New task title")
    description: Optional[str] = Field(None, max_length=2000, description="New task description")
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$", description="New priority level")
    due_date: Optional[str] = Field(None, description="New due date in ISO format")
    completed: Optional[bool] = Field(None, description="New completion status")


class DeleteTaskInput(BaseModel):
    """Input schema for deleting a task."""
    task_id: int = Field(..., gt=0, description="ID of the task to delete")


class ListTasksInput(BaseModel):
    """Input schema for listing tasks."""
    status: Optional[str] = Field(None, pattern="^(all|completed|pending)$", description="Filter by status")
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$", description="Filter by priority")
    limit: Optional[int] = Field(10, ge=1, le=100, description="Maximum number of tasks to return")


class SearchTasksInput(BaseModel):
    """Input schema for searching tasks."""
    query: str = Field(..., min_length=1, max_length=200, description="Search query")
    limit: Optional[int] = Field(10, ge=1, le=100, description="Maximum number of results to return")


class MarkCompleteInput(BaseModel):
    """Input schema for marking a task as complete."""
    task_id: int = Field(..., gt=0, description="ID of the task to update")
    completed: Optional[bool] = Field(True, description="Completion status")


class SetPriorityInput(BaseModel):
    """Input schema for setting task priority."""
    task_id: int = Field(..., gt=0, description="ID of the task to update")
    priority: str = Field(..., pattern="^(low|medium|high)$", description="New priority level")


class AddTagsInput(BaseModel):
    """Input schema for adding tags to a task."""
    task_id: int = Field(..., gt=0, description="ID of the task to update")
    tags: List[str] = Field(..., min_items=1, max_items=10, description="List of tags to add")


class SetDueDateInput(BaseModel):
    """Input schema for setting task due date."""
    task_id: int = Field(..., gt=0, description="ID of the task to update")
    due_date: str = Field(..., description="New due date in ISO format")


class GetStatisticsInput(BaseModel):
    """Input schema for getting statistics (no input required)."""
    pass