from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
import logging

from models import Tag, User
from schemas import TagResponse, TagCreate, TagUpdate
from db import get_session
from dependencies import get_current_user

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users/{user_id}/tags", tags=["Tags"])


def verify_user_access(user_id: str, current_user: User):
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )


@router.get("", response_model=List[TagResponse])
def get_tags(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    verify_user_access(user_id, current_user)

    try:
        tags = db.query(Tag).filter(Tag.user_id == current_user.id).all()
        logger.info(f"Retrieved {len(tags)} tags for user {current_user.id}")
        return tags
    except Exception as e:
        logger.error(f"Error retrieving tags: {str(e)} - user_id: {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while retrieving tags"
        )


@router.post("", response_model=TagResponse)
def create_tag(
    user_id: str,
    tag_data: TagCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    verify_user_access(user_id, current_user)

    try:
        tag = Tag(
            name=tag_data.name,
            color=tag_data.color or "#3B82F6",
            user_id=current_user.id
        )

        db.add(tag)
        db.commit()
        db.refresh(tag)

        logger.info(f"Tag created successfully - user_id: {current_user.id}, tag_id: {tag.id}")
        return tag
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Error creating tag: {str(e)} - user_id: {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error creating tag due to data integrity constraint"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error creating tag: {str(e)} - user_id: {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating the tag"
        )


@router.put("/{tag_id}", response_model=TagResponse)
def update_tag(
    user_id: str,
    tag_id: int,
    tag_data: TagUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    verify_user_access(user_id, current_user)

    tag = db.query(Tag).filter(Tag.id == tag_id, Tag.user_id == current_user.id).first()
    if not tag:
        logger.warning(f"Tag not found for update - user_id: {current_user.id}, tag_id: {tag_id}")
        raise HTTPException(status_code=404, detail="Tag not found")

    try:
        update_data = tag_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(tag, field, value)

        db.commit()
        db.refresh(tag)

        logger.info(f"Tag updated successfully - user_id: {current_user.id}, tag_id: {tag.id}")
        return tag
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Error updating tag: {str(e)} - user_id: {current_user.id}, tag_id: {tag_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error updating tag due to data integrity constraint"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error updating tag: {str(e)} - user_id: {current_user.id}, tag_id: {tag_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while updating the tag"
        )


@router.delete("/{tag_id}")
def delete_tag(
    user_id: str,
    tag_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    verify_user_access(user_id, current_user)

    tag = db.query(Tag).filter(Tag.id == tag_id, Tag.user_id == current_user.id).first()
    if not tag:
        logger.warning(f"Tag not found for deletion - user_id: {current_user.id}, tag_id: {tag_id}")
        raise HTTPException(status_code=404, detail="Tag not found")

    try:
        db.delete(tag)
        db.commit()

        logger.info(f"Tag deleted successfully - user_id: {current_user.id}, tag_id: {tag.id}")
        return {"message": "Tag deleted"}
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Error deleting tag: {str(e)} - user_id: {current_user.id}, tag_id: {tag_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error deleting tag due to data integrity constraint"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error deleting tag: {str(e)} - user_id: {current_user.id}, tag_id: {tag_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while deleting the tag"
        )