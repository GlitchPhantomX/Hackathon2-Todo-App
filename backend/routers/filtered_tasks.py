from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from models import Task, User
from schemas import TaskResponse
from db import get_session
from dependencies import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Filtered Tasks"])


@router.get("/today", response_model=List[TaskResponse])
def get_today_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Get all tasks due today for the current user.
    """
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end = datetime.combine(date.today(), datetime.max.time())

    tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.due_date >= today_start,
        Task.due_date <= today_end
    ).order_by(Task.priority.desc(), Task.created_at).all()

    return tasks


@router.get("/upcoming", response_model=List[TaskResponse])
def get_upcoming_tasks(
    limit: int = Query(10, ge=1, le=100, description="Number of tasks to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Get upcoming tasks (due after today) for the current user.
    """
    today = datetime.combine(date.today(), datetime.max.time())

    tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.due_date > today
    ).order_by(Task.due_date, Task.priority.desc()).limit(limit).all()

    return tasks


@router.get("/overdue", response_model=List[TaskResponse])
def get_overdue_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Get overdue tasks (due before today and not completed) for the current user.
    """
    today = datetime.combine(date.today(), datetime.min.time())

    tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.due_date < today,
        Task.completed == False
    ).order_by(Task.due_date.asc()).all()

    return tasks