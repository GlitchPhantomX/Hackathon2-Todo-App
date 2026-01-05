from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
import logging
from datetime import datetime
import json

from models import Task, User, Project, Tag, TaskTagLink
from schemas import TaskResponse, TaskCreate, TaskUpdate, TaskFilter
from db import get_session
from dependencies import get_current_user
from utils.input_sanitizer import sanitize_input

# Import WebSocket manager for broadcasting
from routers.websocket import manager, WebSocketEventType

# Configure logger
logger = logging.getLogger(__name__)

# Original router for /users/{user_id}/tasks
router = APIRouter(prefix="/users/{user_id}/tasks", tags=["Tasks"])

# New router for /users/me/tasks
me_router = APIRouter(prefix="/users/me/tasks", tags=["Tasks - Me"])


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


def broadcast_task_event(event_type: str, task: Task, current_user_id: int):
    """
    Helper function to broadcast WebSocket events for task changes.
    """
    import asyncio
    import threading

    async def broadcast():
        try:
            sync_event = {
                "type": event_type,
                "data": {
                    "task": {
                        "id": str(task.id),
                        "title": task.title,
                        "description": task.description,
                        "completed": task.completed,
                        "due_date": task.due_date.isoformat() if task.due_date else None,
                        "priority": task.priority,
                        "status": task.status,
                        "project_id": task.project_id,
                        "user_id": str(task.user_id),
                        "created_at": task.created_at.isoformat(),
                        "updated_at": task.updated_at.isoformat()
                    },
                    "userId": str(current_user_id),
                    "timestamp": datetime.utcnow().isoformat()
                }
            }
            await manager.broadcast_to_user(json.dumps(sync_event), current_user_id)
        except Exception as e:
            logger.error(f"Error broadcasting task event: {str(e)}")

    try:
        loop = asyncio.get_event_loop()
        loop.create_task(broadcast())
    except RuntimeError:
        def run_broadcast():
            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                loop.run_until_complete(broadcast())
                loop.close()
            except Exception as e:
                logger.error(f"Error running broadcast in thread: {str(e)}")

        thread = threading.Thread(target=run_broadcast)
        thread.start()


# ============================================================================
# ROUTES FOR /users/me/tasks (NEW - PRIMARY ROUTES)
# ============================================================================

@me_router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_my_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Create a new task for the current authenticated user.
    """
    logger.info(f"[TASKS] Creating task for user {current_user.id}")
    
    # Verify project access if project_id is provided
    if task_data.project_id:
        verify_project_access(task_data.project_id, current_user.id, db)

    try:
        # Sanitize title and description to prevent XSS
        sanitized_title = sanitize_input(task_data.title, context="general")
        sanitized_description = sanitize_input(task_data.description, context="general") if task_data.description else None

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
        if hasattr(task_data, 'tag_ids') and task_data.tag_ids:
            assign_tags_to_task(task, task_data.tag_ids, current_user.id, db)

        db.commit()
        db.refresh(task)

        logger.info(f"✅ Task created successfully - user_id: {current_user.id}, task_id: {task.id}")

        # Broadcast WebSocket event
        broadcast_task_event(WebSocketEventType.TASK_CREATED, task, current_user.id)

        return task
        
    except IntegrityError as e:
        db.rollback()
        logger.error(f"❌ Error creating task: {str(e)} - user_id: {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error creating task due to data integrity constraint"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Unexpected error creating task: {str(e)} - user_id: {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating the task"
        )


@me_router.get("", response_model=List[TaskResponse])
def get_my_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    project_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Get all tasks for the current authenticated user.
    Supports filtering by status, priority, date range, and project.
    """
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
        logger.info(f"Retrieved {len(tasks)} tasks - user_id: {current_user.id}")
        return tasks
        
    except Exception as e:
        logger.error(f"Error retrieving tasks: {str(e)} - user_id: {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while retrieving tasks"
        )


@me_router.get("/sync", response_model=List[TaskResponse])
def sync_my_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Get all tasks for synchronization (current user).
    """
    try:
        tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
        logger.info(f"Retrieved {len(tasks)} tasks for sync - user_id: {current_user.id}")
        return tasks
        
    except Exception as e:
        logger.error(f"Error syncing tasks: {str(e)} - user_id: {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while syncing tasks"
        )


@me_router.get("/{task_id}", response_model=TaskResponse)
def get_my_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Get a specific task by ID for the current user.
    """
    try:
        task = db.query(Task).filter(
            Task.id == task_id,
            Task.user_id == current_user.id
        ).first()
        
        if not task:
            logger.warning(f"Task not found - user_id: {current_user.id}, task_id: {task_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        logger.info(f"Task retrieved - user_id: {current_user.id}, task_id: {task.id}")
        return task
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving task: {str(e)} - user_id: {current_user.id}, task_id: {task_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while retrieving the task"
        )


@me_router.put("/{task_id}", response_model=TaskResponse)
def update_my_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Update a specific task by ID for the current user.
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        logger.warning(f"Task not found for update - user_id: {current_user.id}, task_id: {task_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Verify project access if project_id is provided in update
    if hasattr(task_data, 'project_id') and task_data.project_id is not None:
        verify_project_access(task_data.project_id, current_user.id, db)

    try:
        update_data = task_data.model_dump(exclude_unset=True)

        # Handle tag_ids separately
        tag_ids = update_data.pop('tag_ids', None)

        # Sanitize title and description if being updated
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

        logger.info(f"✅ Task updated - user_id: {current_user.id}, task_id: {task.id}")

        # Broadcast WebSocket event
        broadcast_task_event(WebSocketEventType.TASK_UPDATED, task, current_user.id)

        return task
        
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Error updating task: {str(e)} - user_id: {current_user.id}, task_id: {task_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error updating task due to data integrity constraint"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error updating task: {str(e)} - user_id: {current_user.id}, task_id: {task_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while updating the task"
        )


@me_router.delete("/{task_id}")
def delete_my_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Delete a specific task by ID for the current user.
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        logger.warning(f"Task not found for deletion - user_id: {current_user.id}, task_id: {task_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    try:
        db.delete(task)
        db.commit()

        logger.info(f"✅ Task deleted - user_id: {current_user.id}, task_id: {task_id}")

        # Broadcast WebSocket event for deletion
        import asyncio
        import threading

        async def broadcast_deletion():
            try:
                sync_event = {
                    "type": WebSocketEventType.TASK_DELETED,
                    "data": {
                        "taskId": str(task_id),
                        "userId": str(current_user.id),
                        "timestamp": datetime.utcnow().isoformat()
                    }
                }
                await manager.broadcast_to_user(json.dumps(sync_event), current_user.id)
            except Exception as e:
                logger.error(f"Error broadcasting task deletion: {str(e)}")

        try:
            loop = asyncio.get_event_loop()
            loop.create_task(broadcast_deletion())
        except RuntimeError:
            def run_broadcast():
                try:
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    loop.run_until_complete(broadcast_deletion())
                    loop.close()
                except Exception as e:
                    logger.error(f"Error running broadcast in thread: {str(e)}")

            thread = threading.Thread(target=run_broadcast)
            thread.start()

        return {"message": "Task deleted successfully"}
        
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Error deleting task: {str(e)} - user_id: {current_user.id}, task_id: {task_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error deleting task due to data integrity constraint"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error deleting task: {str(e)} - user_id: {current_user.id}, task_id: {task_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while deleting the task"
        )


# ============================================================================
# ORIGINAL ROUTES FOR /users/{user_id}/tasks (KEEP FOR BACKWARD COMPATIBILITY)
# ============================================================================

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
    """Get all tasks for the specified user (only if current_user matches user_id)."""
    verify_user_access(user_id, current_user)

    try:
        query = db.query(Task).filter(Task.user_id == current_user.id)

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
        logger.info(f"Retrieved {len(tasks)} tasks - user_id: {current_user.id}")
        return tasks
    except Exception as e:
        logger.error(f"Error retrieving tasks: {str(e)} - user_id: {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while retrieving tasks"
        )


@router.post("", response_model=TaskResponse)
def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Create a new task for the specified user (only if current_user matches user_id)."""
    verify_user_access(user_id, current_user)

    if task_data.project_id:
        verify_project_access(task_data.project_id, current_user.id, db)

    try:
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
        db.flush()

        if task_data.tag_ids:
            assign_tags_to_task(task, task_data.tag_ids, current_user.id, db)

        db.commit()
        db.refresh(task)

        logger.info(f"Task created - user_id: {current_user.id}, task_id: {task.id}")
        broadcast_task_event(WebSocketEventType.TASK_CREATED, task, current_user.id)

        return task
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Error creating task: {str(e)}")
        raise HTTPException(status_code=400, detail="Error creating task")
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create task")


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    user_id: str,
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get a specific task by ID for the specified user."""
    verify_user_access(user_id, current_user)

    try:
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
    except Exception as e:
        logger.error(f"Error retrieving task: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve task")


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Update a specific task by ID for the specified user."""
    verify_user_access(user_id, current_user)

    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_data.project_id is not None:
        verify_project_access(task_data.project_id, current_user.id, db)

    try:
        update_data = task_data.model_dump(exclude_unset=True)
        tag_ids = update_data.pop('tag_ids', None)

        if 'title' in update_data:
            update_data['title'] = sanitize_input(update_data['title'], context="general")
        if 'description' in update_data:
            update_data['description'] = sanitize_input(update_data['description'], context="general")

        for field, value in update_data.items():
            setattr(task, field, value)

        if tag_ids is not None:
            assign_tags_to_task(task, tag_ids, current_user.id, db)

        db.commit()
        db.refresh(task)

        broadcast_task_event(WebSocketEventType.TASK_UPDATED, task, current_user.id)
        return task
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating task: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update task")


@router.delete("/{task_id}")
def delete_task(
    user_id: str,
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Delete a specific task by ID for the specified user."""
    verify_user_access(user_id, current_user)

    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        db.delete(task)
        db.commit()
        return {"message": "Task deleted successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting task: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete task")


@router.get("/sync", response_model=List[TaskResponse])
def get_sync_tasks(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get tasks with synchronization for real-time updates."""
    verify_user_access(user_id, current_user)

    try:
        tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
        return tasks
    except Exception as e:
        logger.error(f"Error syncing tasks: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to sync tasks")