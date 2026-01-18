#!/usr/bin/env python3
"""Direct test of the validation functions to find the issue"""

from datetime import datetime, timedelta
from utils.task_validation import validate_task_creation

def debug_validation():
    print("Testing validation function directly...")

    # Test with the exact parameters that might cause an issue
    print("\nTest 1: Future due date, reminder_enabled=False, reminder_timing=None")
    try:
        is_valid, error_msg = validate_task_creation(
            title="Test Task",
            is_recurring=False,
            frequency=None,
            recurrence_end_date=None,
            recurrence_pattern=None,
            reminder_enabled=False,
            reminder_timing=None,  # This is the potential issue
            due_date=datetime.now() + timedelta(days=30)  # Future date
        )
        print(f"Result: Valid={is_valid}, Error='{error_msg}'")
    except Exception as e:
        print(f"Exception occurred: {e}")
        import traceback
        traceback.print_exc()

    print("\nTest 2: Same with reminder_timing='1hr'")
    try:
        is_valid, error_msg = validate_task_creation(
            title="Test Task",
            is_recurring=False,
            frequency=None,
            recurrence_end_date=None,
            recurrence_pattern=None,
            reminder_enabled=False,
            reminder_timing="1hr",  # Explicit timing
            due_date=datetime.now() + timedelta(days=30)  # Future date
        )
        print(f"Result: Valid={is_valid}, Error='{error_msg}'")
    except Exception as e:
        print(f"Exception occurred: {e}")
        import traceback
        traceback.print_exc()

    print("\nTest 3: Past due date, reminder_enabled=False, reminder_timing=None")
    try:
        is_valid, error_msg = validate_task_creation(
            title="Test Task",
            is_recurring=False,
            frequency=None,
            recurrence_end_date=None,
            recurrence_pattern=None,
            reminder_enabled=False,
            reminder_timing=None,  # This should be fine when enabled=False
            due_date=datetime.now() - timedelta(days=30)  # Past date
        )
        print(f"Result: Valid={is_valid}, Error='{error_msg}'")
    except Exception as e:
        print(f"Exception occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_validation()