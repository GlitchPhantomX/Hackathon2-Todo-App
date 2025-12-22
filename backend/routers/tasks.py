from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models import Task, User
from schemas import TaskResponse, TaskCreate, TaskUpdate
from db import get_session
from dependencies import get_current_user

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


# 🆕 Changed from "/" to "" (empty string)
@router.get("", response_model=List[TaskResponse])
def get_all_tasks(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Get all tasks for the specified user (only if current_user matches user_id).
    """
    verify_user_access(user_id, current_user)
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    return tasks


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

    task = Task(
        title=task_data.title,
        description=task_data.description,
        user_id=current_user.id
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


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

    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task


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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task


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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}