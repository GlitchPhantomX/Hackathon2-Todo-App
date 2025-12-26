from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timedelta
import logging

from models import Task, User, Project
from schemas import StatsResponse
from db import get_session
from dependencies import get_current_user

logger = logging.getLogger(__name__)

# ✅ Remove prefix (main.py already adds /tasks)
router = APIRouter(tags=["Statistics"])


# ✅ Add /stats endpoint
@router.get("/stats", response_model=StatsResponse)  
def get_task_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Get comprehensive task statistics for the current user.
    Final endpoint: GET /api/v1/tasks/stats
    
    Calculation:
    - main.py adds: /api/v1/tasks
    - This router adds: /stats
    - Result: /api/v1/tasks/stats ✅
    """
    try:
        # Get all tasks for the user
        all_tasks = db.query(Task).filter(Task.user_id == current_user.id).all()

        total = len(all_tasks)
        completed = sum(1 for task in all_tasks if task.completed)
        pending = total - completed

        # Count overdue tasks
        now = datetime.utcnow()
        overdue = sum(1 for task in all_tasks if not task.completed and task.due_date and task.due_date < now)

        # Count by priority
        by_priority = {
            "high": sum(1 for task in all_tasks if task.priority == "high"),
            "medium": sum(1 for task in all_tasks if task.priority == "medium"),
            "low": sum(1 for task in all_tasks if task.priority == "low")
        }

        # Count by project
        projects = db.query(Project).filter(Project.user_id == current_user.id).all()
        by_project = []
        for project in projects:
            project_task_count = sum(1 for task in all_tasks if task.project_id == project.id)
            if project_task_count > 0:
                by_project.append({
                    "id": project.id,
                    "name": project.name,
                    "count": project_task_count
                })

        # Calculate completion rate
        completion_rate = (completed / total * 100) if total > 0 else 0.0

        # Generate productivity trend (last 7 days)
        productivity_trend = []
        for i in range(7):
            day = now - timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)

            created_today = sum(1 for task in all_tasks if day_start <= task.created_at < day_end)
            completed_today = sum(1 for task in all_tasks if task.completed and task.updated_at and day_start <= task.updated_at < day_end)
            score = ((completed_today / max(created_today, 1)) * 100) if created_today > 0 else 0

            productivity_trend.append({
                "date": day.strftime("%Y-%m-%d"),
                "created": created_today,
                "completed": completed_today,
                "score": round(score, 2)
            })

        productivity_trend.reverse()

        logger.info(f"Statistics retrieved for user {current_user.id}")

        return StatsResponse(
            total=total,
            completed=completed,
            pending=pending,
            overdue=overdue,
            by_priority=by_priority,
            by_project=by_project,
            completion_rate=round(completion_rate, 2),
            productivity_trend=productivity_trend
        )
    except SQLAlchemyError as e:
        logger.error(f"Database error retrieving statistics for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while retrieving statistics"
        )
    except Exception as e:
        logger.error(f"Unexpected error retrieving statistics for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while retrieving statistics"
        )