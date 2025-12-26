from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models import Project, User, Task
from schemas import ProjectResponse, ProjectCreate, ProjectUpdate
from db import get_session
from dependencies import get_current_user

router = APIRouter(prefix="/users/{user_id}/projects", tags=["Projects"])


def verify_user_access(user_id: str, current_user: User):
    """
    Ensure that the user_id in the path matches the current authenticated user.
    """
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's projects"
        )


@router.get("", response_model=List[ProjectResponse])
def get_all_projects(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Get all projects for the specified user (only if current_user matches user_id).
    """
    verify_user_access(user_id, current_user)
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    return projects


@router.post("", response_model=ProjectResponse)
def create_project(
    user_id: str,
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Create a new project for the specified user (only if current_user matches user_id).
    """
    verify_user_access(user_id, current_user)

    project = Project(
        name=project_data.name,
        description=project_data.description,
        color=project_data.color,
        icon=project_data.icon,
        user_id=current_user.id
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return project


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    user_id: str,
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Get a specific project by ID for the specified user.
    """
    verify_user_access(user_id, current_user)

    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    user_id: str,
    project_id: int,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Update a specific project by ID for the specified user.
    """
    verify_user_access(user_id, current_user)

    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)

    return project


@router.delete("/{project_id}")
def delete_project(
    user_id: str,
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Delete a specific project by ID for the specified user.
    Projects cascade delete, so all associated tasks will also be deleted.
    """
    verify_user_access(user_id, current_user)

    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    db.delete(project)
    db.commit()

    return {"message": "Project deleted successfully"}