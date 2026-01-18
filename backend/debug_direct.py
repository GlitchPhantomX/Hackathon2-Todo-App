#!/usr/bin/env python3
"""
Debug the exact issue by importing and testing the task creation logic directly
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

# Import the relevant modules
from utils.input_sanitizer import sanitize_input
from schemas import TaskCreate
from models import Task
from datetime import datetime
from utils.task_validation import validate_task_creation

def debug_task_creation():
    print("Debugging task creation step by step...")

    # Create a TaskCreate object like FastAPI would
    task_data = TaskCreate(
        title="Test Task",
        description="Test description",  # Let's test with a description
        priority="low",
        due_date=datetime.fromisoformat("2025-01-30T00:00:00"),
        project_id=None,
        tag_ids=[],
        reminder_enabled=False
    )

    print(f"Task data created: title='{task_data.title}', description='{task_data.description}'")

    # Step 1: Validate task creation (this should work based on our previous test)
    print("\nStep 1: Running validation...")
    try:
        is_valid, validation_error = validate_task_creation(
            title=task_data.title,
            is_recurring=task_data.is_recurring or False,
            frequency=task_data.frequency,
            recurrence_end_date=task_data.recurrence_end_date,
            recurrence_pattern=task_data.recurrence_pattern,
            reminder_enabled=task_data.reminder_enabled or False,
            reminder_timing=task_data.reminder_timing or "1hr",
            due_date=task_data.due_date
        )
        print(f"Validation result: is_valid={is_valid}, error='{validation_error}'")

        if not is_valid:
            print(f"Validation failed: {validation_error}")
            return
    except Exception as e:
        print(f"Validation error: {e}")
        import traceback
        traceback.print_exc()
        return

    # Step 2: Sanitize inputs
    print("\nStep 2: Sanitizing inputs...")
    try:
        sanitized_title = sanitize_input(task_data.title, context="general")
        sanitized_description = sanitize_input(task_data.description, context="general") if task_data.description else None

        print(f"After sanitization: title='{sanitized_title}', description='{sanitized_description}'")
    except Exception as e:
        print(f"Sanitization error: {e}")
        import traceback
        traceback.print_exc()
        return

    # Step 3: Create Task object (this might be where the issue is)
    print("\nStep 3: Creating Task object...")
    try:
        # Simulate creating a Task object with the sanitized data
        task_obj = Task(
            title=sanitized_title,
            description=sanitized_description,
            due_date=task_data.due_date,
            priority=task_data.priority,
            project_id=task_data.project_id,
            user_id=1,  # Dummy user ID
            # Recurring task fields
            is_recurring=task_data.is_recurring or False,
            frequency=task_data.frequency,
            recurrence_end_date=task_data.recurrence_end_date,
            parent_task_id=None,
            recurrence_pattern=task_data.recurrence_pattern,
            # Reminder fields
            reminder_enabled=task_data.reminder_enabled or False,
            reminder_timing=task_data.reminder_timing or "1hr",
            reminder_sent=False,
            # Timezone field
            timezone=task_data.timezone or "UTC"
        )

        print(f"Task object created successfully: id={getattr(task_obj, 'id', 'N/A')}, title='{task_obj.title}'")
        print("SUCCESS: All steps completed without error!")

    except Exception as e:
        print(f"Task creation error: {e}")
        import traceback
        traceback.print_exc()
        return

def debug_with_none_description():
    print("\n" + "="*50)
    print("Testing with None description...")

    # Create a TaskCreate object with None description
    task_data = TaskCreate(
        title="Test Task",
        description=None,  # This is the problematic case
        priority="low",
        due_date=datetime.fromisoformat("2025-01-30T00:00:00"),
        project_id=None,
        tag_ids=[],
        reminder_enabled=False
    )

    print(f"Task data created: title='{task_data.title}', description={task_data.description}")

    # Sanitize inputs - this is where the original bug was
    print("\nSanitizing with None description...")
    try:
        sanitized_title = sanitize_input(task_data.title, context="general")
        sanitized_description = sanitize_input(task_data.description, context="general") if task_data.description else None

        print(f"After sanitization: title='{sanitized_title}', description={sanitized_description}")
        print("Sanitization with None description worked!")
    except Exception as e:
        print(f"Sanitization error with None: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_task_creation()
    debug_with_none_description()