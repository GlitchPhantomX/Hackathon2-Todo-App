from datetime import datetime, timezone
import pytz
from typing import Optional


def convert_to_utc(dt: Optional[datetime], user_timezone: str = "UTC") -> Optional[datetime]:
    """
    Convert a datetime object to UTC timezone.

    Args:
        dt: The datetime object to convert (can be naive or timezone-aware)
        user_timezone: The timezone of the input datetime (defaults to UTC)

    Returns:
        A timezone-aware datetime object in UTC, or None if input is None
    """
    if dt is None:
        return None

    # If the datetime is naive (no timezone info), assume it's in the user's timezone
    if dt.tzinfo is None:
        # Create timezone object for user's timezone
        user_tz = pytz.timezone(user_timezone)
        # Localize the naive datetime to the user's timezone
        dt = user_tz.localize(dt)

    # Convert to UTC
    utc_dt = dt.astimezone(timezone.utc)
    return utc_dt


def convert_from_utc_to_user_timezone(utc_dt: Optional[datetime], user_timezone: str = "Asia/Karachi") -> Optional[datetime]:
    """
    Convert a UTC datetime object to the user's local timezone.

    Args:
        utc_dt: The UTC datetime object to convert
        user_timezone: The target timezone (defaults to Asia/Karachi for Pakistan)

    Returns:
        A timezone-aware datetime object in the user's timezone, or None if input is None
    """
    if utc_dt is None:
        return None

    # Ensure the input is in UTC
    if utc_dt.tzinfo is None:
        utc_dt = utc_dt.replace(tzinfo=timezone.utc)
    elif utc_dt.tzinfo != timezone.utc:
        utc_dt = utc_dt.astimezone(timezone.utc)

    # Convert to user's timezone
    user_tz = pytz.timezone(user_timezone)
    user_dt = utc_dt.astimezone(user_tz)
    return user_dt


def ensure_utc_datetime(dt: Optional[datetime]) -> Optional[datetime]:
    """
    Ensure a datetime is timezone-aware and in UTC.

    Args:
        dt: The datetime object to process

    Returns:
        A timezone-aware datetime object in UTC, or None if input is None
    """
    if dt is None:
        return None

    # If the datetime is naive, treat it as UTC
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)

    # If it has timezone info, convert to UTC
    return dt.astimezone(timezone.utc)