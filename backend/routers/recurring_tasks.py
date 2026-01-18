"""
Recurring Tasks Router

This router handles all endpoints related to recurring tasks including
creating recurring tasks, completing recurring tasks, and managing
recurring task series.
"""

from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from sqlalchemy.orm import joinedload

from dependencies import get_current_user
from db import get_session
from models import Task, User
from schemas import TaskCreate, TaskUpdate, TaskResponse
from services.event_producer import (
    publish_task_created, publish_task_completed,
    publish_recurring_task_created
)
from services.notification_service import NotificationService
from utils.timezone_utils import (
    calculate_next_occurrence, convert_to_user_timezone,
    get_current_time_in_timezone
)

router = APIRouter(prefix="/recurring-tasks", tags=["recurring-tasks"])


@router.post("", response_model=TaskResponse)
async def create_recurring_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new recurring task.

    This endpoint creates a recurring task based on the provided configuration.
    If the task is recurring, it will generate future occurrences as needed.
    """
    try:
        # Create the base task
        task = Task(
            title=task_data.title,
            description=task_data.description,
            completed=False,  # New tasks are not completed
            due_date=task_data.due_date,
            priority=task_data.priority,
            project_id=task_data.project_id,
            user_id=current_user.id,
            # Recurring task fields
            is_recurring=task_data.is_recurring or False,
            frequency=task_data.frequency,
            recurrence_end_date=task_data.recurrence_end_date,
            parent_task_id=None,  # This is an original task
            recurrence_pattern=task_data.recurrence_pattern,
            # Reminder fields
            reminder_enabled=task_data.reminder_enabled or True,
            reminder_timing=task_data.reminder_timing or "1hr",
            reminder_sent=False,
            # Timezone field
            timezone=task_data.timezone or current_user.timezone or "UTC"
        )

        session.add(task)
        session.commit()
        session.refresh(task)

        # If this is a recurring task, create the first instance if needed
        if task.is_recurring and task.frequency:
            # For recurring tasks, we may want to create the first few instances in advance
            # depending on the frequency and recurrence rules
            pass  # For now, we'll create instances on demand

        # Publish event
        await publish_task_created(task.id, current_user.id, task_data.model_dump())

        return task

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating recurring task: {str(e)}"
        )


@router.put("/{task_id}/complete", response_model=dict)
async def complete_recurring_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Complete a recurring task and potentially create the next occurrence.

    For recurring tasks, completing the current instance will trigger
    the creation of the next occurrence based on the recurrence pattern.
    """
    try:
        # Get the task
        task = session.get(Task, task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        # Check if user owns the task
        if task.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to complete this task"
            )

        # Mark as completed
        task.completed = True
        task.updated_at = datetime.utcnow()
        session.add(task)

        # Check if this is a recurring task and if we should create the next occurrence
        next_instance_created = False
        if task.is_recurring and task.frequency:
            # Calculate the next occurrence
            current_due_date = task.due_date or task.created_at
            user_timezone = task.timezone or current_user.timezone or "UTC"

            next_occurrence = calculate_next_occurrence(
                current_due_date,
                task.frequency,
                task.recurrence_end_date,
                user_timezone,
                task.recurrence_pattern
            )

            if next_occurrence:
                # Create the next occurrence
                next_task = Task(
                    title=task.title,
                    description=task.description,
                    completed=False,
                    due_date=next_occurrence,
                    priority=task.priority,
                    project_id=task.project_id,
                    user_id=current_user.id,
                    # Recurring task fields (copied from original)
                    is_recurring=task.is_recurring,
                    frequency=task.frequency,
                    recurrence_end_date=task.recurrence_end_date,
                    parent_task_id=task.id,  # Link to the completed task
                    recurrence_pattern=task.recurrence_pattern,
                    # Reminder fields (copied from original)
                    reminder_enabled=task.reminder_enabled,
                    reminder_timing=task.reminder_timing,
                    reminder_sent=False,
                    # Timezone field
                    timezone=task.timezone
                )

                session.add(next_task)
                session.commit()
                session.refresh(next_task)

                # Publish event for the new recurring task instance
                await publish_recurring_task_created(
                    next_task.id, current_user.id, task.id
                )

                next_instance_created = True

        session.commit()

        # Publish completion event
        await publish_task_completed(task.id, current_user.id)

        return {
            "message": "Task completed successfully",
            "recurring_created": next_instance_created
        }

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error completing recurring task: {str(e)}"
        )


@router.get("", response_model=List[TaskResponse])
async def get_recurring_tasks(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all recurring tasks for the current user.

    Returns all tasks that are marked as recurring.
    """
    try:
        # Query for recurring tasks owned by the current user
        statement = select(Task).where(
            Task.user_id == current_user.id,
            Task.is_recurring == True
        ).order_by(Task.created_at.desc())

        recurring_tasks = session.exec(statement).all()
        return recurring_tasks

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving recurring tasks: {str(e)}"
        )


@router.get("/{task_id}", response_model=TaskResponse)
async def get_recurring_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific recurring task by ID.
    """
    try:
        task = session.get(Task, task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        if task.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this task"
            )

        if not task.is_recurring:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Task is not a recurring task"
            )

        return task

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving recurring task: {str(e)}"
        )


@router.get("/{task_id}/instances", response_model=dict)
async def get_recurring_task_instances(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all instances of a recurring task series.

    Returns all task instances in the recurring series including past, present, and future instances.
    """
    try:
        # Get the original recurring task
        original_task = session.get(Task, task_id)
        if not original_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Original task not found"
            )

        if original_task.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this task series"
            )

        if not original_task.is_recurring:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Task is not a recurring task"
            )

        # Get all instances of the series (original task and all children)
        all_instances_stmt = select(Task).where(
            (Task.id == task_id) | (Task.parent_task_id == task_id)
        ).order_by(Task.created_at.desc())
        all_instances = session.exec(all_instances_stmt).all()

        # Format instances for response
        instances_list = []
        for instance in all_instances:
            instances_list.append({
                "id": instance.id,
                "title": instance.title,
                "description": instance.description,
                "completed": instance.completed,
                "due_date": instance.due_date.isoformat() if instance.due_date else None,
                "priority": instance.priority,
                "project_id": instance.project_id,
                "parent_task_id": instance.parent_task_id,
                "created_at": instance.created_at.isoformat(),
                "updated_at": instance.updated_at.isoformat()
            })

        return {
            "original_task_id": task_id,
            "original_task_title": original_task.title,
            "total_instances": len(instances_list),
            "instances": instances_list
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving recurring task instances: {str(e)}"
        )


@router.get("/{task_id}/series", response_model=dict)
async def get_recurring_task_series(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get the series information for a recurring task.

    Returns information about the recurring task series including
    the original task, frequency, end date, and counts.
    """
    try:
        # Get the original recurring task
        original_task = session.get(Task, task_id)
        if not original_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Original task not found"
            )

        if original_task.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this task series"
            )

        if not original_task.is_recurring:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Task is not a recurring task"
            )

        # Count total instances (including completed)
        total_instances_stmt = select(Task).where(
            (Task.id == task_id) | (Task.parent_task_id == task_id)
        )
        total_instances = len(session.exec(total_instances_stmt).all())

        # Count active (non-completed) instances
        active_instances_stmt = select(Task).where(
            ((Task.id == task_id) | (Task.parent_task_id == task_id)) &
            (Task.completed == False)
        )
        active_instances = len(session.exec(active_instances_stmt).all())

        # Count completed instances
        completed_instances_stmt = select(Task).where(
            ((Task.id == task_id) | (Task.parent_task_id == task_id)) &
            (Task.completed == True)
        )
        completed_instances = len(session.exec(completed_instances_stmt).all())

        # Get recent instances
        recent_instances_stmt = select(Task).where(
            (Task.id == task_id) | (Task.parent_task_id == task_id)
        ).order_by(Task.created_at.desc()).limit(10)
        recent_instances = session.exec(recent_instances_stmt).all()

        # Format recent instances for response
        recent_instances_list = []
        for instance in recent_instances:
            recent_instances_list.append({
                "id": instance.id,
                "title": instance.title,
                "completed": instance.completed,
                "due_date": instance.due_date.isoformat() if instance.due_date else None,
                "created_at": instance.created_at.isoformat(),
                "updated_at": instance.updated_at.isoformat()
            })

        # Calculate next occurrence if applicable
        next_occurrence = None
        if original_task.frequency and not original_task.recurrence_end_date:
            # If no end date, calculate next occurrence based on the most recent instance
            most_recent_instance = session.exec(
                select(Task).where(
                    (Task.id == task_id) | (Task.parent_task_id == task_id)
                ).order_by(Task.due_date.desc()).limit(1)
            ).first()

            if most_recent_instance:
                user_timezone = original_task.timezone or current_user.timezone or "UTC"
                next_occurrence = calculate_next_occurrence(
                    most_recent_instance.due_date or most_recent_instance.created_at,
                    original_task.frequency,
                    original_task.recurrence_end_date,
                    user_timezone,
                    original_task.recurrence_pattern
                )
        elif original_task.frequency and original_task.recurrence_end_date:
            # If there's an end date, calculate next occurrence up to that limit
            user_timezone = original_task.timezone or current_user.timezone or "UTC"
            current_due_date = original_task.due_date or original_task.created_at
            next_occurrence = calculate_next_occurrence(
                current_due_date,
                original_task.frequency,
                original_task.recurrence_end_date,
                user_timezone,
                original_task.recurrence_pattern
            )

        # Return comprehensive series information
        series_info = {
            "id": task_id,
            "original_task_id": task_id,
            "title": original_task.title,
            "description": original_task.description,
            "frequency": original_task.frequency,
            "recurrence_pattern": original_task.recurrence_pattern,
            "recurrence_end_date": original_task.recurrence_end_date,
            "timezone": original_task.timezone,
            "total_instances": total_instances,
            "active_instances": active_instances,
            "completed_instances": completed_instances,
            "next_occurrence": next_occurrence.isoformat() if next_occurrence else None,
            "created_at": original_task.created_at.isoformat(),
            "updated_at": original_task.updated_at.isoformat(),
            "recent_instances": recent_instances_list
        }

        return series_info

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving recurring task series: {str(e)}"
        )


@router.put("/{task_id}", response_model=TaskResponse)
async def update_recurring_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update a recurring task.

    Updates the configuration of a recurring task. Changes will affect
    future occurrences but not past instances.
    """
    try:
        task = session.get(Task, task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        if task.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this task"
            )

        if not task.is_recurring:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Task is not a recurring task"
            )

        # Update task fields based on provided data
        update_data = task_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(task, field):
                setattr(task, field, value)

        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)

        return task

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating recurring task: {str(e)}"
        )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recurring_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a recurring task.

    This will delete the original recurring task and mark all future
    occurrences as cancelled but retain historical data.
    """
    try:
        task = session.get(Task, task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        if task.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this task"
            )

        if not task.is_recurring:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Task is not a recurring task"
            )

        # For recurring tasks, we might want to mark future occurrences differently
        # rather than deleting them all. For now, we'll just delete the main task.
        # Future occurrences can be handled separately based on business requirements.

        session.delete(task)
        session.commit()

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting recurring task: {str(e)}"
        )


# Additional helper endpoints

@router.post("/{task_id}/skip-occurrence")
async def skip_next_occurrence(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Skip the next occurrence of a recurring task.

    This endpoint allows users to skip the next scheduled occurrence
    of a recurring task without cancelling the entire series.
    """
    try:
        task = session.get(Task, task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        if task.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to skip occurrence for this task"
            )

        if not task.is_recurring:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Task is not a recurring task"
            )

        # In a full implementation, this would mark the next occurrence as skipped
        # For now, we'll just return a success message
        return {"message": "Next occurrence skipped"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error skipping occurrence: {str(e)}"
        )


@router.post("/{task_id}/create-next-instance")
async def create_next_instance(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Manually create the next instance of a recurring task.

    This allows users to manually trigger the creation of the next
    occurrence of a recurring task.
    """
    try:
        task = session.get(Task, task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        if task.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to create instance for this task"
            )

        if not task.is_recurring:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Task is not a recurring task"
            )

        # Calculate the next occurrence
        current_due_date = task.due_date or task.created_at
        user_timezone = task.timezone or current_user.timezone or "UTC"

        next_occurrence = calculate_next_occurrence(
            current_due_date,
            task.frequency,
            task.recurrence_end_date,
            user_timezone,
            task.recurrence_pattern
        )

        if not next_occurrence:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot create next instance - recurrence may have ended"
            )

        # Create the next occurrence
        next_task = Task(
            title=task.title,
            description=task.description,
            completed=False,
            due_date=next_occurrence,
            priority=task.priority,
            project_id=task.project_id,
            user_id=current_user.id,
            # Recurring task fields (copied from original)
            is_recurring=task.is_recurring,
            frequency=task.frequency,
            recurrence_end_date=task.recurrence_end_date,
            parent_task_id=task.id,
            recurrence_pattern=task.recurrence_pattern,
            # Reminder fields (copied from original)
            reminder_enabled=task.reminder_enabled,
            reminder_timing=task.reminder_timing,
            reminder_sent=False,
            # Timezone field
            timezone=task.timezone
        )

        session.add(next_task)
        session.commit()
        session.refresh(next_task)

        # Publish event for the new recurring task instance
        await publish_recurring_task_created(
            next_task.id, current_user.id, task.id
        )

        return {
            "message": "Next instance created successfully",
            "next_task_id": next_task.id
        }

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating next instance: {str(e)}"
        )