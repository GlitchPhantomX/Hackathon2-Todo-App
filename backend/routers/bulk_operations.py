from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from models import Task, User
from schemas import BulkUpdateRequest, BulkDeleteRequest
from db import get_session
from dependencies import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Bulk Operations"])


@router.post("/bulk-update")
def bulk_update_tasks(
    request: BulkUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Bulk update multiple tasks with the same data.
    """
    # Verify all tasks belong to the current user
    tasks = db.query(Task).filter(
        Task.id.in_(request.task_ids),
        Task.user_id == current_user.id
    ).all()

    if len(tasks) != len(request.task_ids):
        # Some tasks don't belong to the user
        found_task_ids = [task.id for task in tasks]
        invalid_task_ids = [tid for tid in request.task_ids if tid not in found_task_ids]
        raise HTTPException(
            status_code=404,
            detail=f"Some tasks not found or don't belong to user: {invalid_task_ids}"
        )

    # Update the tasks
    for task in tasks:
        for field, value in request.update_data.items():
            if hasattr(task, field):
                setattr(task, field, value)

    db.commit()

    # Return the updated tasks
    updated_tasks = db.query(Task).filter(Task.id.in_(request.task_ids)).all()
    return {"updated_tasks": len(updated_tasks), "tasks": updated_tasks}


@router.post("/bulk-delete")
def bulk_delete_tasks(
    request: BulkDeleteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Bulk delete multiple tasks.
    """
    # Verify all tasks belong to the current user
    tasks = db.query(Task).filter(
        Task.id.in_(request.task_ids),
        Task.user_id == current_user.id
    ).all()

    if len(tasks) != len(request.task_ids):
        # Some tasks don't belong to the user
        found_task_ids = [task.id for task in tasks]
        invalid_task_ids = [tid for tid in request.task_ids if tid not in found_task_ids]
        raise HTTPException(
            status_code=404,
            detail=f"Some tasks not found or don't belong to user: {invalid_task_ids}"
        )

    # Delete the tasks
    for task in tasks:
        db.delete(task)

    db.commit()

    return {"deleted_tasks": len(tasks), "task_ids": request.task_ids}