"""MCP tool definitions for todo operations."""

from mcp.types import Tool, ArgumentsSchema
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from .schemas import (
    CreateTaskInput,
    UpdateTaskInput,
    DeleteTaskInput,
    ListTasksInput,
    SearchTasksInput,
    MarkCompleteInput,
    SetPriorityInput,
    AddTagsInput,
    SetDueDateInput,
    GetStatisticsInput
)


# Define all the tools for the MCP server
def create_task_tool() -> Tool:
    """Create task tool definition."""
    return Tool(
        name="create_task",
        description="Create a new task with title, description, priority, due date, and tags",
        input_schema=CreateTaskInput
    )


def update_task_tool() -> Tool:
    """Update task tool definition."""
    return Tool(
        name="update_task",
        description="Update an existing task with new information",
        input_schema=UpdateTaskInput
    )


def delete_task_tool() -> Tool:
    """Delete task tool definition."""
    return Tool(
        name="delete_task",
        description="Delete a task by ID",
        input_schema=DeleteTaskInput
    )


def list_tasks_tool() -> Tool:
    """List tasks tool definition."""
    return Tool(
        name="list_tasks",
        description="List tasks with optional filters",
        input_schema=ListTasksInput
    )


def search_tasks_tool() -> Tool:
    """Search tasks tool definition."""
    return Tool(
        name="search_tasks",
        description="Search tasks by content",
        input_schema=SearchTasksInput
    )


def mark_complete_tool() -> Tool:
    """Mark complete tool definition."""
    return Tool(
        name="mark_complete",
        description="Mark a task as complete or incomplete",
        input_schema=MarkCompleteInput
    )


def set_priority_tool() -> Tool:
    """Set priority tool definition."""
    return Tool(
        name="set_priority",
        description="Set priority level of a task",
        input_schema=SetPriorityInput
    )


def add_tags_tool() -> Tool:
    """Add tags tool definition."""
    return Tool(
        name="add_tags",
        description="Add tags to a task",
        input_schema=AddTagsInput
    )


def set_due_date_tool() -> Tool:
    """Set due date tool definition."""
    return Tool(
        name="set_due_date",
        description="Set or update the due date of a task",
        input_schema=SetDueDateInput
    )


def get_statistics_tool() -> Tool:
    """Get statistics tool definition."""
    return Tool(
        name="get_statistics",
        description="Get user task statistics and productivity metrics",
        input_schema=GetStatisticsInput
    )


# List of all tools for easy registration
ALL_TOOLS = [
    create_task_tool(),
    update_task_tool(),
    delete_task_tool(),
    list_tasks_tool(),
    search_tasks_tool(),
    mark_complete_tool(),
    set_priority_tool(),
    add_tags_tool(),
    set_due_date_tool(),
    get_statistics_tool()
]