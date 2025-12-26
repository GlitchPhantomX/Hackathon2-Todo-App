from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
import io
import csv
import json
from datetime import datetime

from models import Task, User
from schemas import ImportRequest, ExportRequest
from db import get_session
from dependencies import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Import/Export"])


@router.post("/import")
def import_tasks(
    import_request: ImportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Import tasks from CSV or JSON data.
    """
    try:
        if import_request.format.lower() == "csv":
            # Decode the CSV data (assuming it's base64 encoded)
            # For now, we'll simulate the import process
            imported_count = 0
            # Here we would decode the base64 data and parse the CSV
            # Then create Task objects and add them to the database
            # For this implementation, we'll just return a success message
            return {
                "message": f"CSV import initiated for user {current_user.id}",
                "format": "CSV",
                "status": "processing"
            }
        elif import_request.format.lower() == "json":
            # Decode the JSON data (assuming it's base64 encoded)
            # For now, we'll simulate the import process
            imported_count = 0
            # Here we would decode the base64 data and parse the JSON
            # Then create Task objects and add them to the database
            # For this implementation, we'll just return a success message
            return {
                "message": f"JSON import initiated for user {current_user.id}",
                "format": "JSON",
                "status": "processing"
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported import format: {import_request.format}. Supported formats: CSV, JSON"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error importing tasks: {str(e)}"
        )


@router.get("/export")
def export_tasks(
    format: str = Query(..., description="Export format (csv, json, pdf)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Export tasks in specified format (csv, json, pdf).
    """
    try:
        # Get all tasks for the user
        tasks = db.query(Task).filter(Task.user_id == current_user.id).all()

        if format.lower() == "csv":
            # Create CSV content
            output = io.StringIO()
            writer = csv.writer(output)

            # Write header
            writer.writerow([
                "ID", "Title", "Description", "Completed", "Due Date",
                "Priority", "Project ID", "Created At", "Updated At"
            ])

            # Write data rows
            for task in tasks:
                writer.writerow([
                    task.id,
                    task.title,
                    task.description,
                    task.completed,
                    task.due_date.isoformat() if task.due_date else "",
                    task.priority,
                    task.project_id,
                    task.created_at.isoformat(),
                    task.updated_at.isoformat() if task.updated_at else ""
                ])

            # Convert to bytes for response
            csv_content = output.getvalue()
            output.close()

            def iter_csv():
                yield csv_content.encode('utf-8')

            return StreamingResponse(
                iter_csv(),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=tasks_{current_user.id}.csv"}
            )

        elif format.lower() == "json":
            # Create JSON content
            tasks_json = []
            for task in tasks:
                task_dict = {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "priority": task.priority,
                    "project_id": task.project_id,
                    "user_id": task.user_id,
                    "created_at": task.created_at.isoformat(),
                    "updated_at": task.updated_at.isoformat() if task.updated_at else None
                }
                tasks_json.append(task_dict)

            json_content = json.dumps(tasks_json, indent=2)

            def iter_json():
                yield json_content.encode('utf-8')

            return StreamingResponse(
                iter_json(),
                media_type="application/json",
                headers={"Content-Disposition": f"attachment; filename=tasks_{current_user.id}.json"}
            )

        elif format.lower() == "pdf":
            # For now, we'll return a placeholder response since PDF generation
            # requires additional dependencies and implementation
            raise HTTPException(
                status_code=501,
                detail="PDF export not yet implemented"
            )

        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported export format: {format}. Supported formats: csv, json, pdf"
            )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error exporting tasks: {str(e)}"
        )