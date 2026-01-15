from datetime import datetime, timedelta
from typing import Optional
import calendar
import sys
import os
import inspect

# Get the parent directory (backend) and add it to sys.path
currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
backenddir = os.path.dirname(parentdir)  # Go up to backend directory

# Insert the backend directory at the beginning of sys.path to ensure correct imports
if backenddir not in sys.path:
    sys.path.insert(0, backenddir)

# Also ensure that the microservices directory is in the path for relative imports within microservices
if parentdir not in sys.path:
    sys.path.append(parentdir)

# Import with fallback for both module and script execution
try:
    # Try relative import (when run as a module)
    from .models import RecurrencePattern
except ImportError:
    # Fall back to absolute import (when run as a script)
    from microservices.models import RecurrencePattern


def calculate_next_due_date(current_due_date: datetime, pattern: RecurrencePattern) -> datetime:
    """
    Calculate the next due date based on the recurrence pattern
    """
    if pattern == RecurrencePattern.DAILY:
        return current_due_date + timedelta(days=1)
    elif pattern == RecurrencePattern.WEEKLY:
        return current_due_date + timedelta(weeks=1)
    elif pattern == RecurrencePattern.MONTHLY:
        # Calculate next month, handling month-end edge cases
        year = current_due_date.year
        month = current_due_date.month

        # Move to next month
        if month == 12:
            year += 1
            month = 1
        else:
            month += 1

        # Handle month-end edge cases (e.g., Jan 31 -> Feb 28/29)
        day = current_due_date.day
        max_day_in_month = calendar.monthrange(year, month)[1]

        # If the day doesn't exist in the next month, use the last day of that month
        if day > max_day_in_month:
            day = max_day_in_month

        return current_due_date.replace(year=year, month=month, day=day)

    else:
        raise ValueError(f"Invalid recurrence pattern: {pattern}")


def is_valid_recurrence_pattern(pattern: str) -> bool:
    """
    Check if the recurrence pattern is valid
    """
    try:
        RecurrencePattern(pattern.lower())
        return True
    except ValueError:
        return False


def get_recurrence_pattern_enum(pattern: str) -> RecurrencePattern:
    """
    Convert string pattern to RecurrencePattern enum
    """
    return RecurrencePattern(pattern.lower())


def format_notification_message(task_title: str, time_until_due: int) -> str:
    """
    Format notification message for task due reminder
    """
    if time_until_due == 1:
        return f"Task '{task_title}' is due in 1 minute"
    elif time_until_due <= 60:
        return f"Task '{task_title}' is due in {time_until_due} minutes"
    elif time_until_due < 1440:  # Less than 24 hours
        hours = time_until_due // 60
        return f"Task '{task_title}' is due in {hours} hours"
    else:
        days = time_until_due // 1440
        return f"Task '{task_title}' is due in {days} days"


def get_timezone_offset() -> int:
    """
    Get the current timezone offset in minutes
    """
    import time
    return -time.timezone // 60


def normalize_datetime_to_local(dt: datetime) -> datetime:
    """
    Normalize a datetime to local timezone
    """
    # For simplicity, we'll assume the datetime is already in the correct timezone
    # In a real implementation, you'd convert from UTC to local timezone
    return dt