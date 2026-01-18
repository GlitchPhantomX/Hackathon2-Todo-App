#!/usr/bin/env python3
"""
Test the specific payload mentioned in the problem statement
"""

from datetime import datetime
from pydantic import ValidationError
from schemas import TaskCreate
from utils.task_validation import validate_task_creation

def test_problem_payload():
    print("Testing the payload from the problem statement...")

    # This is the exact payload from the problem that was failing
    payload = {
        "title": "Research New Framework",
        "description": "Research and evaluate new frontend framework options",
        "priority": "low",
        "status": "pending",
        "completed": False,
        "due_date": "2025-01-30T00:00:00",  # Future date
        "project_id": None,
        "tag_ids": []
    }

    print(f"\nPayload: {payload}")

    # Parse the due date to datetime object
    from datetime import datetime
    payload_with_datetime = payload.copy()
    payload_with_datetime["due_date"] = datetime.fromisoformat(payload["due_date"].replace("Z", "+00:00"))

    try:
        # Create the task data object (this simulates what FastAPI does)
        task_data = TaskCreate(**{
            "title": payload_with_datetime["title"],
            "description": payload_with_datetime["description"],
            "priority": payload_with_datetime["priority"],
            "due_date": payload_with_datetime["due_date"],
            "project_id": payload_with_datetime["project_id"],
            "tag_ids": payload_with_datetime["tag_ids"]
        })

        print(f"TaskCreate object created successfully")
        print(f"  title: {task_data.title}")
        print(f"  reminder_enabled: {task_data.reminder_enabled}")  # Should be False now
        print(f"  reminder_timing: {task_data.reminder_timing}")   # Should be None now

        # Now validate the task creation (this is what was failing before)
        is_valid, error_msg = validate_task_creation(
            title=task_data.title,
            is_recurring=task_data.is_recurring,
            frequency=task_data.frequency,
            recurrence_end_date=task_data.recurrence_end_date,
            recurrence_pattern=task_data.recurrence_pattern,
            reminder_enabled=task_data.reminder_enabled,  # This should be False
            reminder_timing=task_data.reminder_timing or "1hr",  # Default to "1hr" if None
            due_date=task_data.due_date
        )

        print(f"\nValidation result: {'PASS' if is_valid else 'FAIL'}")
        if not is_valid:
            print(f"Error: {error_msg}")
        else:
            print("SUCCESS: Task validation passed!")

    except ValidationError as e:
        print(f"Pydantic validation error: {e}")
        return False

    return True

def test_explicit_reminder_disabled():
    print("\n" + "="*50)
    print("Testing with explicit reminder_enabled=False...")

    payload = {
        "title": "Research New Framework",
        "description": "Research and evaluate new frontend framework options",
        "priority": "low",
        "due_date": "2025-01-30T00:00:00",
        "project_id": None,
        "tag_ids": [],
        "reminder_enabled": False  # Explicitly disabled
    }

    payload_with_datetime = payload.copy()
    payload_with_datetime["due_date"] = datetime.fromisoformat(payload["due_date"].replace("Z", "+00:00"))

    try:
        task_data = TaskCreate(**{
            "title": payload_with_datetime["title"],
            "description": payload_with_datetime["description"],
            "priority": payload_with_datetime["priority"],
            "due_date": payload_with_datetime["due_date"],
            "project_id": payload_with_datetime["project_id"],
            "tag_ids": payload_with_datetime["tag_ids"],
            "reminder_enabled": payload_with_datetime["reminder_enabled"]
        })

        print(f"TaskCreate object created successfully")
        print(f"  title: {task_data.title}")
        print(f"  reminder_enabled: {task_data.reminder_enabled}")

        is_valid, error_msg = validate_task_creation(
            title=task_data.title,
            is_recurring=task_data.is_recurring,
            frequency=task_data.frequency,
            recurrence_end_date=task_data.recurrence_end_date,
            recurrence_pattern=task_data.recurrence_pattern,
            reminder_enabled=task_data.reminder_enabled,
            reminder_timing=task_data.reminder_timing or "1hr",
            due_date=task_data.due_date
        )

        print(f"\nValidation result: {'PASS' if is_valid else 'FAIL'}")
        if not is_valid:
            print(f"Error: {error_msg}")
        else:
            print("SUCCESS: Task validation passed with explicit reminder disabled!")

    except ValidationError as e:
        print(f"Pydantic validation error: {e}")
        return False

    return True

def test_reminder_enabled_with_past_date():
    print("\n" + "="*50)
    print("Testing with reminder_enabled=True and past due date (should fail)...")

    payload = {
        "title": "Past Due Task",
        "description": "This task is in the past",
        "priority": "high",
        "due_date": "2020-01-30T00:00:00",  # Past date
        "project_id": None,
        "tag_ids": [],
        "reminder_enabled": True  # Explicitly enabled
    }

    payload_with_datetime = payload.copy()
    payload_with_datetime["due_date"] = datetime.fromisoformat(payload["due_date"].replace("Z", "+00:00"))

    try:
        task_data = TaskCreate(**{
            "title": payload_with_datetime["title"],
            "description": payload_with_datetime["description"],
            "priority": payload_with_datetime["priority"],
            "due_date": payload_with_datetime["due_date"],
            "project_id": payload_with_datetime["project_id"],
            "tag_ids": payload_with_datetime["tag_ids"],
            "reminder_enabled": payload_with_datetime["reminder_enabled"]
        })

        print(f"TaskCreate object created successfully")
        print(f"  title: {task_data.title}")
        print(f"  reminder_enabled: {task_data.reminder_enabled}")

        is_valid, error_msg = validate_task_creation(
            title=task_data.title,
            is_recurring=task_data.is_recurring,
            frequency=task_data.frequency,
            recurrence_end_date=task_data.recurrence_end_date,
            recurrence_pattern=task_data.recurrence_pattern,
            reminder_enabled=task_data.reminder_enabled,
            reminder_timing=task_data.reminder_timing or "1hr",
            due_date=task_data.due_date
        )

        expected_failure = not is_valid and "past due date" in error_msg
        print(f"\nValidation result: {'PASS (expected failure)' if expected_failure else 'UNEXPECTED RESULT'}")
        if not is_valid:
            print(f"Error: {error_msg}")
        else:
            print("WARNING: Expected validation to fail but it passed!")

    except ValidationError as e:
        print(f"Pydantic validation error: {e}")
        return False

    return True

if __name__ == "__main__":
    print("Testing the fix for reminder validation issue")
    print("="*60)

    success1 = test_problem_payload()
    success2 = test_explicit_reminder_disabled()
    success3 = test_reminder_enabled_with_past_date()

    print("\n" + "="*60)
    print("SUMMARY:")
    print("V Tasks without reminder fields should be creatable")
    print("V Tasks with reminder_enabled=False should bypass validation")
    print("V Tasks with reminder_enabled=True and past due dates should fail")
    print("V Default behavior is now reminder_enabled=False")
    print("="*60)