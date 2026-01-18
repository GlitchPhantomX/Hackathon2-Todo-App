"""
Task Validation Utilities

This module provides utility functions for validating task configurations,
particularly for recurring tasks and reminder settings.
"""

from datetime import datetime
from typing import Optional
from sqlmodel import Session
from models import Task


def validate_recurring_task_config(
    is_recurring: bool,
    frequency: Optional[str],
    recurrence_end_date: Optional[datetime],
    recurrence_pattern: Optional[dict] = None
) -> tuple[bool, str]:
    """
    Validate recurring task configuration.

    Args:
        is_recurring: Whether the task is recurring
        frequency: Frequency of recurrence ('daily', 'weekly', 'monthly', 'custom')
        recurrence_end_date: Optional end date for recurrence
        recurrence_pattern: Optional custom recurrence pattern

    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    if not is_recurring:
        return True, ""

    if not frequency:
        return False, "Frequency is required for recurring tasks"

    valid_frequencies = ['daily', 'weekly', 'monthly', 'custom']
    if frequency not in valid_frequencies:
        return False, f"Invalid frequency. Must be one of: {', '.join(valid_frequencies)}"

    if frequency == 'custom' and not recurrence_pattern:
        return False, "Recurrence pattern is required for custom frequency"

    if recurrence_end_date and recurrence_end_date < datetime.utcnow():
        return False, "Recurrence end date cannot be in the past"

    return True, ""


def validate_reminder_config(
    reminder_enabled: bool,
    reminder_timing: Optional[str],
    due_date: Optional[datetime]
) -> tuple[bool, str]:
    """
    Validate reminder configuration.

    Args:
        reminder_enabled: Whether reminders are enabled
        reminder_timing: Timing for reminders ('15min', '1hr', '1day')
        due_date: Due date of the task

    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    if not reminder_enabled:
        return True, ""

    if not reminder_timing:
        return False, "Reminder timing is required when reminders are enabled"

    valid_timings = ['15min', '1hr', '1day']
    if reminder_timing not in valid_timings:
        return False, f"Invalid reminder timing. Must be one of: {', '.join(valid_timings)}"

    if due_date and due_date < datetime.utcnow():
        return False, "Cannot set reminder for a task with past due date"

    return True, ""


def validate_reminder_timing(reminder_timing: str) -> tuple[bool, str]:
    """
    Validate a single reminder timing value.

    Args:
        reminder_timing: Timing for reminders ('15min', '1hr', '1day')

    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    valid_timings = ['15min', '1hr', '1day']
    if reminder_timing not in valid_timings:
        return False, f"Invalid reminder timing. Must be one of: {', '.join(valid_timings)}"

    return True, ""


def validate_user_reminder_settings(settings_data: dict) -> tuple[bool, str]:
    """
    Validate user reminder settings.

    Args:
        settings_data: Dictionary containing reminder settings to validate

    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    # Validate default reminder timing
    default_timing = settings_data.get('reminder_default_timing')
    if default_timing:
        is_valid, error_msg = validate_reminder_timing(default_timing)
        if not is_valid:
            return False, f"Default reminder timing validation failed: {error_msg}"

    # Validate individual reminder settings
    allowed_reminders = [
        'reminder_allow_overdue',
        'reminder_allow_15min',
        'reminder_allow_1hr',
        'reminder_allow_1day'
    ]

    for setting_name in allowed_reminders:
        value = settings_data.get(setting_name)
        if value is not None and not isinstance(value, bool):
            return False, f"{setting_name} must be a boolean value"

    return True, ""


def validate_task_creation(
    title: str,
    is_recurring: bool,
    frequency: Optional[str],
    recurrence_end_date: Optional[datetime],
    recurrence_pattern: Optional[dict],
    reminder_enabled: bool,
    reminder_timing: Optional[str],
    due_date: Optional[datetime]
) -> tuple[bool, str]:
    """
    Validate complete task configuration for creation.

    Args:
        title: Task title
        is_recurring: Whether the task is recurring
        frequency: Frequency of recurrence
        recurrence_end_date: Optional end date for recurrence
        recurrence_pattern: Optional custom recurrence pattern
        reminder_enabled: Whether reminders are enabled
        reminder_timing: Timing for reminders
        due_date: Due date of the task

    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    # Validate title
    if not title or not title.strip():
        return False, "Task title is required"

    if len(title.strip()) > 200:
        return False, "Task title must be 200 characters or less"

    # Validate recurring task config
    is_valid, error_msg = validate_recurring_task_config(
        is_recurring, frequency, recurrence_end_date, recurrence_pattern
    )
    if not is_valid:
        return False, error_msg

    # Validate reminder config
    is_valid, error_msg = validate_reminder_config(
        reminder_enabled, reminder_timing, due_date
    )
    if not is_valid:
        return False, error_msg

    return True, ""


def validate_task_update(
    title: Optional[str] = None,
    is_recurring: Optional[bool] = None,
    frequency: Optional[str] = None,
    recurrence_end_date: Optional[datetime] = None,
    recurrence_pattern: Optional[dict] = None,
    reminder_enabled: Optional[bool] = None,
    reminder_timing: Optional[str] = None,
    due_date: Optional[datetime] = None
) -> tuple[bool, str]:
    """
    Validate task configuration for updates.

    Args:
        title: Task title (if being updated)
        is_recurring: Whether the task is recurring (if being updated)
        frequency: Frequency of recurrence (if being updated)
        recurrence_end_date: Optional end date for recurrence (if being updated)
        recurrence_pattern: Optional custom recurrence pattern (if being updated)
        reminder_enabled: Whether reminders are enabled (if being updated)
        reminder_timing: Timing for reminders (if being updated)
        due_date: Due date of the task (if being updated)

    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    # Prepare values for validation (use provided values or defaults)
    check_title = title if title is not None else "Default Title"
    check_is_recurring = is_recurring if is_recurring is not None else False
    check_frequency = frequency if frequency is not None else None
    check_recurrence_end_date = recurrence_end_date if recurrence_end_date is not None else None
    check_recurrence_pattern = recurrence_pattern if recurrence_pattern is not None else None
    check_reminder_enabled = reminder_enabled if reminder_enabled is not None else False
    check_reminder_timing = reminder_timing if reminder_timing is not None else "1hr"
    check_due_date = due_date if due_date is not None else None

    # If we're updating to make it recurring, validate the recurring config
    if is_recurring is not None and is_recurring:
        is_valid, error_msg = validate_recurring_task_config(
            is_recurring, check_frequency, check_recurrence_end_date, check_recurrence_pattern
        )
        if not is_valid:
            return False, error_msg

    # If we're updating reminder settings, validate them
    if reminder_enabled is not None or reminder_timing is not None:
        is_valid, error_msg = validate_reminder_config(
            check_reminder_enabled, check_reminder_timing, check_due_date
        )
        if not is_valid:
            return False, error_msg

    # Validate title if being updated
    if title is not None:
        if not title.strip():
            return False, "Task title cannot be empty"

        if len(title.strip()) > 200:
            return False, "Task title must be 200 characters or less"

    return True, ""