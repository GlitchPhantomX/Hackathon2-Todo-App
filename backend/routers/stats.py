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
        from sqlalchemy import func, and_, or_

        # Get overall task counts efficiently
        total_query = db.query(Task).filter(Task.user_id == current_user.id)
        total = total_query.count()

        completed = db.query(Task).filter(
            Task.user_id == current_user.id,
            Task.completed == True
        ).count()

        pending = total - completed

        # Count overdue tasks efficiently
        now = datetime.utcnow()
        overdue = db.query(Task).filter(
            Task.user_id == current_user.id,
            Task.completed == False,
            Task.due_date != None,
            Task.due_date < now
        ).count()

        # Count by priority using aggregation
        priority_counts = db.query(
            Task.priority,
            func.count(Task.id).label('count')
        ).filter(
            Task.user_id == current_user.id
        ).group_by(Task.priority).all()

        by_priority = {
            "high": 0,
            "medium": 0,
            "low": 0
        }
        for priority, count in priority_counts:
            by_priority[priority] = count

        # Count by project using efficient join
        project_counts = db.query(
            Project.id,
            Project.name,
            func.count(Task.id).label('task_count')
        ).outerjoin(Task, and_(Task.project_id == Project.id, Task.user_id == current_user.id)).filter(
            Project.user_id == current_user.id
        ).group_by(Project.id, Project.name).all()

        by_project = [
            {"id": project_id, "name": name, "count": count}
            for project_id, name, count in project_counts if count > 0
        ]

        # Calculate completion rate
        completion_rate = (completed / total * 100) if total > 0 else 0.0

        # Generate productivity trend (last 7 days) using efficient queries
        productivity_trend = []
        for i in range(7):
            day = now - timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)

            # Count tasks created today
            created_today = db.query(Task).filter(
                Task.user_id == current_user.id,
                Task.created_at >= day_start,
                Task.created_at < day_end
            ).count()

            # Count tasks completed today
            completed_today = db.query(Task).filter(
                Task.user_id == current_user.id,
                Task.completed == True,
                Task.updated_at != None,
                Task.updated_at >= day_start,
                Task.updated_at < day_end
            ).count()

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