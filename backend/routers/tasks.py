from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
import logging
from datetime import datetime

from models import Task, User, Project, Tag, TaskTagLink
from schemas import TaskResponse, TaskCreate, TaskUpdate, TaskFilter
from db import get_session
from dependencies import get_current_user
from utils.input_sanitizer import sanitize_input

# Configure logger
logger = logging.getLogger(__name__)

# 🆕 Remove trailing slash from prefix
router = APIRouter(prefix="/users/{user_id}/tasks", tags=["Tasks"])


def verify_user_access(user_id: str, current_user: User):
    """
    Ensure that the user_id in the path matches the current authenticated user.
    """
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's tasks"
        )


def verify_tag_access(tag_ids: List[int], current_user_id: int, db: Session) -> List[Tag]:
    """
    Verify that all provided tag IDs belong to the current user.
    """
    if not tag_ids:
        return []

    tags = db.query(Tag).filter(
        Tag.id.in_(tag_ids),
        Tag.user_id == current_user_id
    ).all()

    # Check if all requested tags were found
    found_tag_ids = [tag.id for tag in tags]
    missing_tag_ids = set(tag_ids) - set(found_tag_ids)

    if missing_tag_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tags not found or don't belong to user: {list(missing_tag_ids)}"
        )

    return tags


def assign_tags_to_task(task: Task, tag_ids: List[int], current_user_id: int, db: Session):
    """
    Assign tags to a task by creating TaskTagLink records.
    """
    if not tag_ids:
        return

    # Verify tag access
    tags = verify_tag_access(tag_ids, current_user_id, db)

    # Remove existing tag links for this task
    db.query(TaskTagLink).filter(TaskTagLink.task_id == task.id).delete()

    # Create new tag links
    for tag in tags:
        tag_link = TaskTagLink(task_id=task.id, tag_id=tag.id)
        db.add(tag_link)


def verify_project_access(project_id: int, current_user_id: int, db: Session):
    """
    Ensure that the project belongs to the current user.
    """
    if project_id is not None:
        project = db.query(Project).filter(
            Project.id == project_id,
            Project.user_id == current_user_id
        ).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found or doesn't belong to user"
            )


# 🆕 Changed from "/" to "" (empty string)
@router.get("", response_model=List[TaskResponse])
def get_all_tasks(
    user_id: str,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    project_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Get all tasks for the specified user (only if current_user matches user_id).
    Supports filtering by status, priority, date range, and project.
    """
    verify_user_access(user_id, current_user)

    try:
        # Start with base query
        query = db.query(Task).filter(Task.user_id == current_user.id)

        # Apply filters
        if status:
            if status.lower() == "completed":
                query = query.filter(Task.completed == True)
            elif status.lower() == "pending":
                query = query.filter(Task.completed == False)

        if priority:
            query = query.filter(Task.priority == priority.lower())

        if start_date:
            query = query.filter(Task.due_date >= start_date)

        if end_date:
            query = query.filter(Task.due_date <= end_date)

        if project_id:
            query = query.filter(Task.project_id == project_id)

        tasks = query.all()
        logger.info(f"Retrieved {len(tasks)} tasks with filters - user_id: {current_user.id}, operation: task.get_all")
        return tasks
    except Exception as e:
        logger.error(f"Error retrieving tasks: {str(e)} - user_id: {current_user.id}, operation: task.get_all.error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while retrieving tasks"
        )


# 🆕 Changed from "/" to "" (empty string)
@router.post("", response_model=TaskResponse)
def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Create a new task for the specified user (only if current_user matches user_id).
    """
    verify_user_access(user_id, current_user)

    # Verify project access if project_id is provided
    if task_data.project_id:
        verify_project_access(task_data.project_id, current_user.id, db)

    try:
        # Sanitize title and description to prevent XSS
        sanitized_title = sanitize_input(task_data.title, context="general")
        sanitized_description = sanitize_input(task_data.description, context="general")

        task = Task(
            title=sanitized_title,
            description=sanitized_description,
            due_date=task_data.due_date,
            priority=task_data.priority,
            project_id=task_data.project_id,
            user_id=current_user.id
        )

        db.add(task)
        db.flush()  # Get the task ID before assigning tags

        # Assign tags if provided
        if task_data.tag_ids:
            assign_tags_to_task(task, task_data.tag_ids, current_user.id, db)

        db.commit()
        db.refresh(task)

        logger.info(f"Task created successfully - user_id: {current_user.id}, task_id: {task.id}, operation: task.create")

        return task
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Error creating task: {str(e)} - user_id: {current_user.id}, operation: task.create.error")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error creating task due to data integrity constraint"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error creating task: {str(e)} - user_id: {current_user.id}, operation: task.create.error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating the task"
        )


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    user_id: str,
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Get a specific task by ID for the specified user.
    """
    verify_user_access(user_id, current_user)

    try:
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
        if not task:
            logger.warning(f"Task not found - user_id: {current_user.id}, task_id: {task_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        logger.info(f"Task retrieved successfully - user_id: {current_user.id}, task_id: {task.id}, operation: task.get")
        return task
    except Exception as e:
        logger.error(f"Error retrieving task: {str(e)} - user_id: {current_user.id}, task_id: {task_id}, operation: task.get.error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while retrieving the task"
        )


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Update a specific task by ID for the specified user.
    """
    verify_user_access(user_id, current_user)

    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        logger.warning(f"Task not found for update - user_id: {current_user.id}, task_id: {task_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Verify project access if project_id is provided in update
    if task_data.project_id is not None:
        verify_project_access(task_data.project_id, current_user.id, db)

    try:
        update_data = task_data.model_dump(exclude_unset=True)

        # Handle tag_ids separately since it's not a direct attribute of Task
        tag_ids = update_data.pop('tag_ids', None)

        # Sanitize title and description if they are being updated
        if 'title' in update_data:
            update_data['title'] = sanitize_input(update_data['title'], context="general")
        if 'description' in update_data:
            update_data['description'] = sanitize_input(update_data['description'], context="general")

        # Update other attributes
        for field, value in update_data.items():
            setattr(task, field, value)

        # Update tags if provided
        if tag_ids is not None:
            assign_tags_to_task(task, tag_ids, current_user.id, db)

        db.commit()
        db.refresh(task)

        logger.info(f"Task updated successfully - user_id: {current_user.id}, task_id: {task.id}, operation: task.update")

        return task
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Error updating task: {str(e)} - user_id: {current_user.id}, task_id: {task_id}, operation: task.update.error")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error updating task due to data integrity constraint"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error updating task: {str(e)} - user_id: {current_user.id}, task_id: {task_id}, operation: task.update.error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while updating the task"
        )


@router.delete("/{task_id}")
def delete_task(
    user_id: str,
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Delete a specific task by ID for the specified user.
    """
    verify_user_access(user_id, current_user)

    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        logger.warning(f"Task not found for deletion - user_id: {current_user.id}, task_id: {task_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    try:
        db.delete(task)
        db.commit()

        logger.info(f"Task deleted successfully - user_id: {current_user.id}, task_id: {task.id}, operation: task.delete")

        return {"message": "Task deleted successfully"}
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Error deleting task: {str(e)} - user_id: {current_user.id}, task_id: {task_id}, operation: task.delete.error")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error deleting task due to data integrity constraint"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error deleting task: {str(e)} - user_id: {current_user.id}, task_id: {task_id}, operation: task.delete.error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while deleting the task"
        )