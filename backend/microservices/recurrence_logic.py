from datetime import datetime, timedelta
from typing import Optional
import calendar
from .models import RecurrencePattern
from .utils import calculate_next_due_date


class RecurrenceProcessor:
    """
    Processor for handling task recurrence logic
    """

    @staticmethod
    def calculate_next_due_date(current_due_date: datetime, pattern: RecurrencePattern) -> datetime:
        """
        Calculate the next due date based on the recurrence pattern
        """
        return calculate_next_due_date(current_due_date, pattern)

    @staticmethod
    def validate_recurrence_pattern(pattern: str) -> bool:
        """
        Validate if the recurrence pattern is one of the allowed values
        """
        try:
            RecurrencePattern(pattern.lower())
            return True
        except ValueError:
            return False

    @staticmethod
    def get_next_occurrence(task_due_date: datetime, pattern: str) -> Optional[datetime]:
        """
        Get the next occurrence date for a recurring task
        """
        if not RecurrenceProcessor.validate_recurrence_pattern(pattern):
            return None

        pattern_enum = RecurrencePattern(pattern.lower())
        return RecurrenceProcessor.calculate_next_due_date(task_due_date, pattern_enum)

    @staticmethod
    def handle_edge_cases(original_date: datetime, next_date: datetime, pattern: str) -> datetime:
        """
        Handle edge cases like February 29th in leap years vs. non-leap years
        """
        if pattern.lower() == "monthly":
            # If we're going from Jan 31 to Feb, the day might not exist
            # Our calculate_next_due_date function already handles this
            return next_date

        return next_date

    @staticmethod
    def get_recurrence_interval_days(pattern: str) -> int:
        """
        Get the interval in days for the recurrence pattern
        """
        pattern_lower = pattern.lower()
        if pattern_lower == "daily":
            return 1
        elif pattern_lower == "weekly":
            return 7
        elif pattern_lower == "monthly":
            # Approximate - actual days vary by month
            return 30
        else:
            raise ValueError(f"Invalid recurrence pattern: {pattern}")