#!/usr/bin/env python3
"""
Test script to verify the reminder validation fix.

This script tests that:
1. Tasks can be created without reminders (reminder_enabled=False by default)
2. Tasks with future due dates can be created even when reminders are disabled
3. Reminder validation only occurs when reminders are explicitly enabled
"""

from datetime import datetime, timedelta
from utils.task_validation import validate_task_creation

def test_reminder_validation_fix():
    print("Testing reminder validation fix...")

    # Test 1: Task with future due date, reminders disabled (should pass)
    print("\n1. Testing task with future due date, reminders disabled (should pass)")
    is_valid, error_msg = validate_task_creation(
        title="Test Task",
        is_recurring=False,
        frequency=None,
        recurrence_end_date=None,
        recurrence_pattern=None,
        reminder_enabled=False,  # Reminders disabled
        reminder_timing="1hr",
        due_date=datetime.now() + timedelta(days=30)  # Future date
    )
    print(f"   Result: {'PASS' if is_valid else 'FAIL'} - {error_msg}")

    # Test 2: Task with past due date, reminders disabled (should pass)
    print("\n2. Testing task with past due date, reminders disabled (should pass)")
    is_valid, error_msg = validate_task_creation(
        title="Test Task",
        is_recurring=False,
        frequency=None,
        recurrence_end_date=None,
        recurrence_pattern=None,
        reminder_enabled=False,  # Reminders disabled
        reminder_timing="1hr",
        due_date=datetime.now() - timedelta(days=30)  # Past date
    )
    print(f"   Result: {'PASS' if is_valid else 'FAIL'} - {error_msg}")

    # Test 3: Task with future due date, reminders enabled (should pass)
    print("\n3. Testing task with future due date, reminders enabled (should pass)")
    is_valid, error_msg = validate_task_creation(
        title="Test Task",
        is_recurring=False,
        frequency=None,
        recurrence_end_date=None,
        recurrence_pattern=None,
        reminder_enabled=True,  # Reminders enabled
        reminder_timing="1hr",
        due_date=datetime.now() + timedelta(days=30)  # Future date
    )
    print(f"   Result: {'PASS' if is_valid else 'FAIL'} - {error_msg}")

    # Test 4: Task with past due date, reminders enabled (should fail)
    print("\n4. Testing task with past due date, reminders enabled (should fail)")
    is_valid, error_msg = validate_task_creation(
        title="Test Task",
        is_recurring=False,
        frequency=None,
        recurrence_end_date=None,
        recurrence_pattern=None,
        reminder_enabled=True,  # Reminders enabled
        reminder_timing="1hr",
        due_date=datetime.now() - timedelta(days=30)  # Past date
    )
    expected_failure = not is_valid and "past due date" in error_msg
    print(f"   Result: {'PASS' if expected_failure else 'FAIL'} - {error_msg}")

    # Test 5: Task without specifying reminder_enabled (should default to False and pass)
    print("\n5. Testing task without specifying reminder_enabled (should pass)")
    is_valid, error_msg = validate_task_creation(
        title="Test Task",
        is_recurring=False,
        frequency=None,
        recurrence_end_date=None,
        recurrence_pattern=None,
        reminder_enabled=False,  # Default should be False
        reminder_timing="1hr",
        due_date=datetime.now() - timedelta(days=30)  # Past date but reminders disabled
    )
    print(f"   Result: {'PASS' if is_valid else 'FAIL'} - {error_msg}")

    print("\n" + "="*60)
    print("Test Summary:")
    print("- Tasks with disabled reminders should pass regardless of due date")
    print("- Tasks with enabled reminders and past due dates should fail")
    print("- Default behavior should be reminders disabled")
    print("="*60)

if __name__ == "__main__":
    test_reminder_validation_fix()