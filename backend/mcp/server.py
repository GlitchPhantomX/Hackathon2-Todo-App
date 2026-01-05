"""MCP server for AI-powered todo chatbot functionality."""

from mcp.server import Server
from mcp.types import Tool, ArgumentsSchema, Prompts, Prompt
from pydantic import BaseModel
from typing import Dict, Any

# Initialize MCP server
server = Server(
    name="todo-mcp-server",
    version="1.0.0"
)

# Import tool handlers
from mcp.handlers import (
    create_task_handler,
    update_task_handler,
    delete_task_handler,
    list_tasks_handler,
    search_tasks_handler,
    mark_complete_handler,
    set_priority_handler,
    add_tags_handler,
    set_due_date_handler,
    get_statistics_handler
)


# Define tool schemas
class CreateTaskInput(BaseModel):
    title: str
    description: str = ""
    priority: str = "medium"
    due_date: str = ""
    tags: list[str] = []


class UpdateTaskInput(BaseModel):
    task_id: int
    title: str = None
    description: str = None
    priority: str = None
    due_date: str = None
    completed: bool = None


class DeleteTaskInput(BaseModel):
    task_id: int


class ListTasksInput(BaseModel):
    status: str = None  # "all", "completed", "pending"
    priority: str = None  # "low", "medium", "high"
    limit: int = 10


class SearchTasksInput(BaseModel):
    query: str
    limit: int = 10


class MarkCompleteInput(BaseModel):
    task_id: int
    completed: bool = True


class SetPriorityInput(BaseModel):
    task_id: int
    priority: str  # "low", "medium", "high"


class AddTagsInput(BaseModel):
    task_id: int
    tags: list[str]


class SetDueDateInput(BaseModel):
    task_id: int
    due_date: str  # ISO format date string


class GetStatisticsInput(BaseModel):
    pass  # No input needed, returns user statistics


# Register tools with the server
@server.tool(
    "create_task",
    description="Create a new task with title, description, priority, due date, and tags",
    input_schema=CreateTaskInput
)
def create_task_tool(input: CreateTaskInput) -> Dict[str, Any]:
    """Create a new task."""
    return create_task_handler(input)


@server.tool(
    "update_task",
    description="Update an existing task with new information",
    input_schema=UpdateTaskInput
)
def update_task_tool(input: UpdateTaskInput) -> Dict[str, Any]:
    """Update an existing task."""
    return update_task_handler(input)


@server.tool(
    "delete_task",
    description="Delete a task by ID",
    input_schema=DeleteTaskInput
)
def delete_task_tool(input: DeleteTaskInput) -> Dict[str, Any]:
    """Delete a task."""
    return delete_task_handler(input)


@server.tool(
    "list_tasks",
    description="List tasks with optional filters",
    input_schema=ListTasksInput
)
def list_tasks_tool(input: ListTasksInput) -> Dict[str, Any]:
    """List tasks."""
    return list_tasks_handler(input)


@server.tool(
    "search_tasks",
    description="Search tasks by content",
    input_schema=SearchTasksInput
)
def search_tasks_tool(input: SearchTasksInput) -> Dict[str, Any]:
    """Search tasks."""
    return search_tasks_handler(input)


@server.tool(
    "mark_complete",
    description="Mark a task as complete or incomplete",
    input_schema=MarkCompleteInput
)
def mark_complete_tool(input: MarkCompleteInput) -> Dict[str, Any]:
    """Mark a task as complete."""
    return mark_complete_handler(input)


@server.tool(
    "set_priority",
    description="Set priority level of a task",
    input_schema=SetPriorityInput
)
def set_priority_tool(input: SetPriorityInput) -> Dict[str, Any]:
    """Set task priority."""
    return set_priority_handler(input)


@server.tool(
    "add_tags",
    description="Add tags to a task",
    input_schema=AddTagsInput
)
def add_tags_tool(input: AddTagsInput) -> Dict[str, Any]:
    """Add tags to a task."""
    return add_tags_handler(input)


@server.tool(
    "set_due_date",
    description="Set or update the due date of a task",
    input_schema=SetDueDateInput
)
def set_due_date_tool(input: SetDueDateInput) -> Dict[str, Any]:
    """Set task due date."""
    return set_due_date_handler(input)


@server.tool(
    "get_statistics",
    description="Get user task statistics and productivity metrics",
    input_schema=GetStatisticsInput
)
def get_statistics_tool(input: GetStatisticsInput) -> Dict[str, Any]:
    """Get user statistics."""
    return get_statistics_handler(input)


# Add prompts for the AI agent
@server.prompts()
def prompts() -> Prompts:
    return Prompts(
        prompts=[
            Prompt(
                name="task_management_help",
                description="Provides help on how to manage tasks",
                template="You can create, update, delete, search, and list tasks. Use natural language to describe what you want to do with your tasks."
            ),
            Prompt(
                name="create_task_examples",
                description="Examples of how to create tasks",
                template="Examples: 'Create a task to buy groceries', 'Add a high priority task: finish report by Friday', 'Remind me to call mom tomorrow at 3 PM'"
            ),
            Prompt(
                name="update_task_examples",
                description="Examples of how to update tasks",
                template="Examples: 'Mark grocery task as done', 'Change project report to high priority', 'Reschedule morning meetings to 2 PM', 'Add urgent tag to presentation task'"
            )
        ]
    )


if __name__ == "__main__":
    import asyncio
    asyncio.run(server.run())