"""MCP tool handlers for todo operations."""

from typing import Dict, Any, List
from datetime import datetime
from sqlmodel import Session, select
from models import Task, User, Tag, TaskTagLink
from db import engine
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


def create_task_handler(input_data: CreateTaskInput) -> Dict[str, Any]:
    """Create a new task."""
    with Session(engine) as session:
        try:
            # Create the task
            new_task = Task(
                title=input_data.title,
                description=input_data.description,
                priority=input_data.priority,
                due_date=datetime.fromisoformat(input_data.due_date) if input_data.due_date else None,
                user_id=1  # In a real implementation, get from context
            )

            session.add(new_task)
            session.commit()
            session.refresh(new_task)

            # Add tags if provided
            if input_data.tags:
                for tag_name in input_data.tags:
                    # Get or create tag
                    tag = session.exec(
                        select(Tag).where(
                            Tag.name == tag_name,
                            Tag.user_id == new_task.user_id
                        )
                    ).first()

                    if not tag:
                        tag = Tag(name=tag_name, user_id=new_task.user_id)
                        session.add(tag)
                        session.commit()
                        session.refresh(tag)

                    # Link task and tag
                    task_tag_link = TaskTagLink(task_id=new_task.id, tag_id=tag.id)
                    session.add(task_tag_link)

                session.commit()

            return {
                "success": True,
                "task_id": new_task.id,
                "message": f"Task '{new_task.title}' created successfully"
            }
        except Exception as e:
            session.rollback()
            return {
                "success": False,
                "error": str(e)
            }


def update_task_handler(input_data: UpdateTaskInput) -> Dict[str, Any]:
    """Update an existing task."""
    with Session(engine) as session:
        try:
            # Get the task
            task = session.get(Task, input_data.task_id)
            if not task:
                return {
                    "success": False,
                    "error": f"Task with ID {input_data.task_id} not found"
                }

            # Update fields if provided
            if input_data.title is not None:
                task.title = input_data.title
            if input_data.description is not None:
                task.description = input_data.description
            if input_data.priority is not None:
                task.priority = input_data.priority
            if input_data.due_date is not None:
                task.due_date = datetime.fromisoformat(input_data.due_date)
            if input_data.completed is not None:
                task.completed = input_data.completed

            session.add(task)
            session.commit()
            session.refresh(task)

            return {
                "success": True,
                "task_id": task.id,
                "message": f"Task '{task.title}' updated successfully"
            }
        except Exception as e:
            session.rollback()
            return {
                "success": False,
                "error": str(e)
            }


def delete_task_handler(input_data: DeleteTaskInput) -> Dict[str, Any]:
    """Delete a task."""
    with Session(engine) as session:
        try:
            task = session.get(Task, input_data.task_id)
            if not task:
                return {
                    "success": False,
                    "error": f"Task with ID {input_data.task_id} not found"
                }

            session.delete(task)
            session.commit()

            return {
                "success": True,
                "message": f"Task '{task.title}' deleted successfully"
            }
        except Exception as e:
            session.rollback()
            return {
                "success": False,
                "error": str(e)
            }


def list_tasks_handler(input_data: ListTasksInput) -> Dict[str, Any]:
    """List tasks with filters."""
    with Session(engine) as session:
        try:
            query = select(Task)

            # Apply filters
            if input_data.status == "completed":
                query = query.where(Task.completed == True)
            elif input_data.status == "pending":
                query = query.where(Task.completed == False)

            if input_data.priority:
                query = query.where(Task.priority == input_data.priority)

            # Apply limit
            query = query.limit(input_data.limit)

            tasks = session.exec(query).all()

            task_list = []
            for task in tasks:
                task_dict = {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "priority": task.priority,
                    "due_date": task.due_date.isoformat() if task.due_date else None
                }
                task_list.append(task_dict)

            return {
                "success": True,
                "tasks": task_list,
                "count": len(task_list)
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


def search_tasks_handler(input_data: SearchTasksInput) -> Dict[str, Any]:
    """Search tasks by content."""
    with Session(engine) as session:
        try:
            query = select(Task).where(
                (Task.title.contains(input_data.query)) |
                (Task.description.contains(input_data.query))
            )

            query = query.limit(input_data.limit)

            tasks = session.exec(query).all()

            task_list = []
            for task in tasks:
                task_dict = {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "priority": task.priority,
                    "due_date": task.due_date.isoformat() if task.due_date else None
                }
                task_list.append(task_dict)

            return {
                "success": True,
                "tasks": task_list,
                "count": len(task_list),
                "query": input_data.query
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


def mark_complete_handler(input_data: MarkCompleteInput) -> Dict[str, Any]:
    """Mark a task as complete."""
    with Session(engine) as session:
        try:
            task = session.get(Task, input_data.task_id)
            if not task:
                return {
                    "success": False,
                    "error": f"Task with ID {input_data.task_id} not found"
                }

            task.completed = input_data.completed
            session.add(task)
            session.commit()
            session.refresh(task)

            status = "completed" if task.completed else "marked as incomplete"
            return {
                "success": True,
                "task_id": task.id,
                "message": f"Task '{task.title}' {status} successfully"
            }
        except Exception as e:
            session.rollback()
            return {
                "success": False,
                "error": str(e)
            }


def set_priority_handler(input_data: SetPriorityInput) -> Dict[str, Any]:
    """Set task priority."""
    with Session(engine) as session:
        try:
            task = session.get(Task, input_data.task_id)
            if not task:
                return {
                    "success": False,
                    "error": f"Task with ID {input_data.task_id} not found"
                }

            task.priority = input_data.priority
            session.add(task)
            session.commit()
            session.refresh(task)

            return {
                "success": True,
                "task_id": task.id,
                "message": f"Priority of task '{task.title}' set to {input_data.priority} successfully"
            }
        except Exception as e:
            session.rollback()
            return {
                "success": False,
                "error": str(e)
            }


def add_tags_handler(input_data: AddTagsInput) -> Dict[str, Any]:
    """Add tags to a task."""
    with Session(engine) as session:
        try:
            task = session.get(Task, input_data.task_id)
            if not task:
                return {
                    "success": False,
                    "error": f"Task with ID {input_data.task_id} not found"
                }

            for tag_name in input_data.tags:
                # Get or create tag
                tag = session.exec(
                    select(Tag).where(
                        Tag.name == tag_name,
                        Tag.user_id == task.user_id
                    )
                ).first()

                if not tag:
                    tag = Tag(name=tag_name, user_id=task.user_id)
                    session.add(tag)
                    session.commit()
                    session.refresh(tag)

                # Check if link already exists
                existing_link = session.exec(
                    select(TaskTagLink).where(
                        TaskTagLink.task_id == task.id,
                        TaskTagLink.tag_id == tag.id
                    )
                ).first()

                if not existing_link:
                    task_tag_link = TaskTagLink(task_id=task.id, tag_id=tag.id)
                    session.add(task_tag_link)

            session.commit()

            return {
                "success": True,
                "task_id": task.id,
                "message": f"Tags added to task '{task.title}' successfully"
            }
        except Exception as e:
            session.rollback()
            return {
                "success": False,
                "error": str(e)
            }


def set_due_date_handler(input_data: SetDueDateInput) -> Dict[str, Any]:
    """Set task due date."""
    with Session(engine) as session:
        try:
            task = session.get(Task, input_data.task_id)
            if not task:
                return {
                    "success": False,
                    "error": f"Task with ID {input_data.task_id} not found"
                }

            task.due_date = datetime.fromisoformat(input_data.due_date)
            session.add(task)
            session.commit()
            session.refresh(task)

            return {
                "success": True,
                "task_id": task.id,
                "message": f"Due date of task '{task.title}' set to {input_data.due_date} successfully"
            }
        except Exception as e:
            session.rollback()
            return {
                "success": False,
                "error": str(e)
            }


def get_statistics_handler(input_data: GetStatisticsInput) -> Dict[str, Any]:
    """Get user task statistics."""
    with Session(engine) as session:
        try:
            # Get all tasks for the user (in a real implementation, get user from context)
            all_tasks = session.exec(select(Task)).all()

            total_tasks = len(all_tasks)
            completed_tasks = sum(1 for task in all_tasks if task.completed)
            pending_tasks = total_tasks - completed_tasks

            # Count by priority
            priority_counts = {"low": 0, "medium": 0, "high": 0}
            for task in all_tasks:
                if task.priority in priority_counts:
                    priority_counts[task.priority] += 1

            # Find overdue tasks
            now = datetime.now()
            overdue_tasks = sum(1 for task in all_tasks
                              if task.due_date and task.due_date < now and not task.completed)

            completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

            return {
                "success": True,
                "statistics": {
                    "total_tasks": total_tasks,
                    "completed_tasks": completed_tasks,
                    "pending_tasks": pending_tasks,
                    "overdue_tasks": overdue_tasks,
                    "completion_rate": round(completion_rate, 2),
                    "by_priority": priority_counts
                }
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


def list_tasks_handler(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """List tasks with filters."""
    with Session(engine) as session:
        try:
            query = select(Task)

            # Apply filters
            status = input_data.get("status")
            if status == "completed":
                query = query.where(Task.completed == True)
            elif status == "pending":
                query = query.where(Task.completed == False)

            priority = input_data.get("priority")
            if priority:
                query = query.where(Task.priority == priority)

            # Apply limit
            limit = input_data.get("limit", 10)
            query = query.limit(limit)

            tasks = session.exec(query).all()

            task_list = []
            for task in tasks:
                task_dict = {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "priority": task.priority,
                    "due_date": task.due_date.isoformat() if task.due_date else None
                }
                task_list.append(task_dict)

            return {
                "success": True,
                "tasks": task_list,
                "count": len(task_list)
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


def search_tasks_handler(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Search tasks by content."""
    with Session(engine) as session:
        try:
            query = select(Task).where(
                (Task.title.contains(input_data["query"])) |
                (Task.description.contains(input_data["query"]))
            )

            limit = input_data.get("limit", 10)
            query = query.limit(limit)

            tasks = session.exec(query).all()

            task_list = []
            for task in tasks:
                task_dict = {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "priority": task.priority,
                    "due_date": task.due_date.isoformat() if task.due_date else None
                }
                task_list.append(task_dict)

            return {
                "success": True,
                "tasks": task_list,
                "count": len(task_list),
                "query": input_data["query"]
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


def mark_complete_handler(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Mark a task as complete."""
    with Session(engine) as session:
        try:
            task = session.get(Task, input_data["task_id"])
            if not task:
                return {
                    "success": False,
                    "error": f"Task with ID {input_data['task_id']} not found"
                }

            task.completed = input_data.get("completed", True)
            session.add(task)
            session.commit()
            session.refresh(task)

            status = "completed" if task.completed else "marked as incomplete"
            return {
                "success": True,
                "task_id": task.id,
                "message": f"Task '{task.title}' {status} successfully"
            }
        except Exception as e:
            session.rollback()
            return {
                "success": False,
                "error": str(e)
            }


def set_priority_handler(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Set task priority."""
    with Session(engine) as session:
        try:
            task = session.get(Task, input_data["task_id"])
            if not task:
                return {
                    "success": False,
                    "error": f"Task with ID {input_data['task_id']} not found"
                }

            task.priority = input_data["priority"]
            session.add(task)
            session.commit()
            session.refresh(task)

            return {
                "success": True,
                "task_id": task.id,
                "message": f"Priority of task '{task.title}' set to {input_data['priority']} successfully"
            }
        except Exception as e:
            session.rollback()
            return {
                "success": False,
                "error": str(e)
            }


def add_tags_handler(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Add tags to a task."""
    with Session(engine) as session:
        try:
            task = session.get(Task, input_data["task_id"])
            if not task:
                return {
                    "success": False,
                    "error": f"Task with ID {input_data['task_id']} not found"
                }

            for tag_name in input_data["tags"]:
                # Get or create tag
                tag = session.exec(
                    select(Tag).where(
                        Tag.name == tag_name,
                        Tag.user_id == task.user_id
                    )
                ).first()

                if not tag:
                    tag = Tag(name=tag_name, user_id=task.user_id)
                    session.add(tag)
                    session.commit()
                    session.refresh(tag)

                # Check if link already exists
                existing_link = session.exec(
                    select(TaskTagLink).where(
                        TaskTagLink.task_id == task.id,
                        TaskTagLink.tag_id == tag.id
                    )
                ).first()

                if not existing_link:
                    task_tag_link = TaskTagLink(task_id=task.id, tag_id=tag.id)
                    session.add(task_tag_link)

            session.commit()

            return {
                "success": True,
                "task_id": task.id,
                "message": f"Tags added to task '{task.title}' successfully"
            }
        except Exception as e:
            session.rollback()
            return {
                "success": False,
                "error": str(e)
            }


def set_due_date_handler(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Set task due date."""
    with Session(engine) as session:
        try:
            task = session.get(Task, input_data["task_id"])
            if not task:
                return {
                    "success": False,
                    "error": f"Task with ID {input_data['task_id']} not found"
                }

            task.due_date = datetime.fromisoformat(input_data["due_date"])
            session.add(task)
            session.commit()
            session.refresh(task)

            return {
                "success": True,
                "task_id": task.id,
                "message": f"Due date of task '{task.title}' set to {input_data['due_date']} successfully"
            }
        except Exception as e:
            session.rollback()
            return {
                "success": False,
                "error": str(e)
            }


def get_statistics_handler(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Get user task statistics."""
    with Session(engine) as session:
        try:
            # Get all tasks for the user (in a real implementation, get user from context)
            all_tasks = session.exec(select(Task)).all()

            total_tasks = len(all_tasks)
            completed_tasks = sum(1 for task in all_tasks if task.completed)
            pending_tasks = total_tasks - completed_tasks

            # Count by priority
            priority_counts = {"low": 0, "medium": 0, "high": 0}
            for task in all_tasks:
                if task.priority in priority_counts:
                    priority_counts[task.priority] += 1

            # Find overdue tasks
            from datetime import datetime
            now = datetime.now()
            overdue_tasks = sum(1 for task in all_tasks
                              if task.due_date and task.due_date < now and not task.completed)

            completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

            return {
                "success": True,
                "statistics": {
                    "total_tasks": total_tasks,
                    "completed_tasks": completed_tasks,
                    "pending_tasks": pending_tasks,
                    "overdue_tasks": overdue_tasks,
                    "completion_rate": round(completion_rate, 2),
                    "by_priority": priority_counts
                }
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }