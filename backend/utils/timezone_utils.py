"""
Timezone Utilities Module

This module provides utility functions for handling timezone conversions,
timezone detection, and timezone-aware datetime operations for the
recurring tasks and reminder system.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
import pytz
from pytz import BaseTzInfo


def get_user_timezone(timezone_str: Optional[str] = None) -> BaseTzInfo:
    """
    Get timezone object from timezone string or return UTC as default.

    Args:
        timezone_str: Optional timezone string (e.g., 'America/New_York', 'Europe/London')

    Returns:
        BaseTzInfo: Timezone object for the specified timezone or UTC
    """
    if timezone_str is None or timezone_str.strip() == "":
        return pytz.UTC

    try:
        return pytz.timezone(timezone_str)
    except pytz.exceptions.UnknownTimeZoneError:
        # Fallback to UTC if invalid timezone provided
        return pytz.UTC


def convert_to_user_timezone(dt: datetime, user_timezone_str: Optional[str] = None) -> datetime:
    """
    Convert a datetime to the user's timezone.

    Args:
        dt: Datetime object to convert (assumes naive datetime is in UTC)
        user_timezone_str: Target timezone string

    Returns:
        datetime: Timezone-aware datetime in the user's timezone
    """
    user_tz = get_user_timezone(user_timezone_str)

    if dt.tzinfo is None:
        # Assume naive datetime is in UTC
        dt = dt.replace(tzinfo=pytz.UTC)

    return dt.astimezone(user_tz)


def convert_from_user_timezone(dt: datetime, target_timezone_str: Optional[str] = "UTC") -> datetime:
    """
    Convert a datetime from the user's timezone to the target timezone.

    Args:
        dt: Timezone-aware datetime object to convert
        target_timezone_str: Target timezone string (default: UTC)

    Returns:
        datetime: Timezone-aware datetime in the target timezone
    """
    target_tz = get_user_timezone(target_timezone_str)

    if dt.tzinfo is None:
        # Assume naive datetime is in UTC
        dt = dt.replace(tzinfo=pytz.UTC)

    return dt.astimezone(target_tz)


def get_current_time_in_timezone(timezone_str: Optional[str] = None) -> datetime:
    """
    Get the current time in the specified timezone.

    Args:
        timezone_str: Timezone string (e.g., 'America/New_York')

    Returns:
        datetime: Current time in the specified timezone
    """
    user_tz = get_user_timezone(timezone_str)
    return datetime.now(user_tz)


def is_dst(timezone_str: str, dt: datetime) -> bool:
    """
    Check if the given datetime is in daylight saving time for the specified timezone.

    Args:
        timezone_str: Timezone string
        dt: Datetime to check

    Returns:
        bool: True if in DST, False otherwise
    """
    tz = get_user_timezone(timezone_str)
    localized_dt = tz.localize(dt) if dt.tzinfo is None else dt.astimezone(tz)
    return bool(localized_dt.dst())


def calculate_next_occurrence(
    current_datetime: datetime,
    frequency: str,
    recurrence_end_date: Optional[datetime] = None,
    user_timezone_str: Optional[str] = None,
    recurrence_pattern: Optional[dict] = None
) -> Optional[datetime]:
    """
    Calculate the next occurrence of a recurring task based on frequency.

    Args:
        current_datetime: Current occurrence datetime
        frequency: Frequency of recurrence ('daily', 'weekly', 'monthly', 'custom')
        recurrence_end_date: Optional end date for recurrence
        user_timezone_str: User's timezone string
        recurrence_pattern: Optional custom recurrence pattern

    Returns:
        Optional[datetime]: Next occurrence datetime or None if recurrence should end
    """
    user_tz = get_user_timezone(user_timezone_str)

    # Localize the current datetime if it's naive
    if current_datetime.tzinfo is None:
        current_dt = user_tz.localize(current_datetime)
    else:
        current_dt = current_datetime.astimezone(user_tz)

    next_dt = None

    if frequency == 'daily':
        next_dt = current_dt + timedelta(days=1)
    elif frequency == 'weekly':
        next_dt = current_dt + timedelta(weeks=1)
    elif frequency == 'monthly':
        # Calculate next month considering different month lengths
        year = current_dt.year
        month = current_dt.month
        day = current_dt.day

        # Increment month
        month += 1
        if month > 12:
            month = 1
            year += 1

        # Handle month-end dates (e.g., Jan 31 -> Feb 28/29)
        import calendar
        max_day = calendar.monthrange(year, month)[1]
        if day > max_day:
            day = max_day

        next_dt = current_dt.replace(year=year, month=month, day=day)
    elif frequency == 'custom' and recurrence_pattern:
        # Handle custom recurrence patterns
        # For now, we'll just return None to indicate custom logic needed
        # In a real implementation, this would handle complex patterns
        next_dt = _handle_custom_recurrence(current_dt, recurrence_pattern)
    else:
        # Unknown frequency
        return None

    # Check if the next occurrence is beyond the recurrence end date
    if recurrence_end_date and next_dt.date() > recurrence_end_date.date():
        return None

    return next_dt


def _handle_custom_recurrence(current_dt: datetime, pattern: dict) -> Optional[datetime]:
    """
    Handle custom recurrence patterns.

    Args:
        current_dt: Current occurrence datetime
        pattern: Custom recurrence pattern dictionary

    Returns:
        Optional[datetime]: Next occurrence datetime or None
    """
    # This is a placeholder for complex custom recurrence logic
    # In a real implementation, this would parse the pattern and calculate accordingly
    # For example, patterns could include:
    # - Specific days of week
    # - Specific days of month
    # - Business days only
    # - etc.

    # For now, return None to indicate that custom logic needs to be implemented
    return None


def format_datetime_for_display(dt: datetime, user_timezone_str: Optional[str] = None,
                              format_str: str = "%Y-%m-%d %H:%M:%S %Z") -> str:
    """
    Format a datetime for display in the user's timezone.

    Args:
        dt: Datetime to format
        user_timezone_str: User's timezone string
        format_str: Format string for output

    Returns:
        str: Formatted datetime string
    """
    user_tz = get_user_timezone(user_timezone_str)

    if dt.tzinfo is None:
        # Assume naive datetime is in UTC
        dt = dt.replace(tzinfo=pytz.UTC)

    localized_dt = dt.astimezone(user_tz)
    return localized_dt.strftime(format_str)


def parse_iso_datetime(iso_string: str, user_timezone_str: Optional[str] = None) -> datetime:
    """
    Parse an ISO datetime string and convert it to user's timezone.

    Args:
        iso_string: ISO format datetime string
        user_timezone_str: User's timezone string

    Returns:
        datetime: Timezone-aware datetime in user's timezone
    """
    # Parse the ISO string to a datetime object
    parsed_dt = datetime.fromisoformat(iso_string.replace('Z', '+00:00'))

    # Convert to user's timezone
    return convert_to_user_timezone(parsed_dt, user_timezone_str)


def get_timezone_offset(timezone_str: str) -> str:
    """
    Get the UTC offset for a timezone as a string (e.g., "+05:00").

    Args:
        timezone_str: Timezone string

    Returns:
        str: UTC offset in format ±HH:MM
    """
    tz = get_user_timezone(timezone_str)
    now = datetime.now(tz)
    offset_seconds = now.utcoffset().total_seconds()

    hours = int(offset_seconds // 3600)
    minutes = int((offset_seconds % 3600) // 60)

    sign = "+" if hours >= 0 else "-"
    return f"{sign}{abs(hours):02d}:{minutes:02d}"


def validate_timezone(timezone_str: str) -> bool:
    """
    Validate if a timezone string is valid.

    Args:
        timezone_str: Timezone string to validate

    Returns:
        bool: True if valid, False otherwise
    """
    try:
        pytz.timezone(timezone_str)
        return True
    except pytz.exceptions.UnknownTimeZoneError:
        return False


def get_common_timezones() -> list:
    """
    Get a list of common timezones for user selection.

    Returns:
        list: List of common timezone strings
    """
    return [
        'UTC',
        'US/Eastern',
        'US/Central',
        'US/Mountain',
        'US/Pacific',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'Asia/Tokyo',
        'Asia/Shanghai',
        'Asia/Kolkata',
        'Australia/Sydney',
        'America/Los_Angeles',
        'America/New_York',
        'America/Chicago',
        'America/Denver'
    ]


# Example usage and testing
if __name__ == "__main__":
    # Test the timezone utilities
    print("Testing timezone utilities:")

    # Test current time in different timezones
    utc_now = get_current_time_in_timezone("UTC")
    ny_now = get_current_time_in_timezone("America/New_York")
    tokyo_now = get_current_time_in_timezone("Asia/Tokyo")

    print(f"UTC: {format_datetime_for_display(utc_now)}")
    print(f"NY: {format_datetime_for_display(ny_now, 'America/New_York')}")
    print(f"Tokyo: {format_datetime_for_display(tokyo_now, 'Asia/Tokyo')}")

    # Test conversion
    utc_time = datetime.now(pytz.UTC)
    converted_to_ny = convert_to_user_timezone(utc_time, "America/New_York")
    print(f"UTC to NY: {format_datetime_for_display(converted_to_ny, 'America/New_York')}")

    # Test next occurrence calculation
    current_time = datetime.now(pytz.UTC)
    next_daily = calculate_next_occurrence(current_time, 'daily', user_timezone_str='UTC')
    print(f"Next daily occurrence: {format_datetime_for_display(next_daily, 'UTC') if next_daily else 'None'}")

    # Test timezone validation
    print(f"Is 'America/New_York' valid? {validate_timezone('America/New_York')}")
    print(f"Is 'Invalid/Timezone' valid? {validate_timezone('Invalid/Timezone')}")