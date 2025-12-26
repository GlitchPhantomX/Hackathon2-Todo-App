"""
Input sanitization utilities for the Todo App API.

This module implements input sanitization to prevent XSS and other injection attacks.
"""
import html
import re
from typing import Union, List, Dict, Any
from bleach import clean


def sanitize_input(input_data: Union[str, List, Dict, Any], context: str = "general") -> Union[str, List, Dict, Any]:
    """
    Sanitize input data to prevent XSS and injection attacks.

    Args:
        input_data: The input data to sanitize (string, list, dict, or other)
        context: The context where the data will be used (e.g., "html", "url", "sql", "general")

    Returns:
        Sanitized input data
    """
    if isinstance(input_data, str):
        return _sanitize_string(input_data, context)
    elif isinstance(input_data, list):
        return [_sanitize_item(item, context) for item in input_data]
    elif isinstance(input_data, dict):
        return {key: _sanitize_item(value, context) for key, value in input_data.items()}
    else:
        return input_data


def _sanitize_item(item: Any, context: str) -> Any:
    """Sanitize a single item."""
    if isinstance(item, str):
        return _sanitize_string(item, context)
    elif isinstance(item, list):
        return [sanitize_input(sub_item, context) for sub_item in item]
    elif isinstance(item, dict):
        return {key: sanitize_input(value, context) for key, value in item.items()}
    else:
        return item


def _sanitize_string(input_str: str, context: str = "general") -> str:
    """
    Sanitize a string based on the context.

    Args:
        input_str: The string to sanitize
        context: The context where the data will be used

    Returns:
        Sanitized string
    """
    if not input_str or not isinstance(input_str, str):
        return input_str

    # Remove null bytes (potential security risk)
    input_str = input_str.replace('\x00', '')

    if context == "html":
        # Sanitize for HTML context - allow only safe tags
        allowed_tags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
        allowed_attributes = {}
        input_str = clean(input_str, tags=allowed_tags, attributes=allowed_attributes)
    elif context == "url":
        # Sanitize for URL context
        input_str = _sanitize_url(input_str)
    elif context == "sql":
        # Sanitize for SQL context (note: use parameterized queries instead!)
        input_str = _sanitize_sql(input_str)
    else:  # general context
        # General sanitization - escape HTML characters
        input_str = html.escape(input_str, quote=True)

    # Remove potentially dangerous patterns
    input_str = _remove_dangerous_patterns(input_str)

    return input_str


def _sanitize_url(url: str) -> str:
    """
    Sanitize a URL string.

    Args:
        url: The URL to sanitize

    Returns:
        Sanitized URL
    """
    # Only allow safe URL schemes
    allowed_schemes = ['http', 'https', 'ftp', 'ftps']

    # Basic URL pattern validation
    url_pattern = re.compile(
        r'^https?://(?:[-\w.])+(?:\:[0-9]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$',
        re.IGNORECASE
    )

    if url_pattern.match(url):
        return url
    else:
        # If URL doesn't match the pattern, return an empty string or a safe default
        return ""


def _sanitize_sql(sql_input: str) -> str:
    """
    Basic SQL sanitization (WARNING: Use parameterized queries instead!).

    Args:
        sql_input: The SQL input to sanitize

    Returns:
        Sanitized SQL input
    """
    # Remove common SQL injection patterns
    dangerous_patterns = [
        r"(?i)(union\s+select)",  # UNION SELECT
        r"(?i)(drop\s+\w+)",      # DROP TABLE/DB
        r"(?i)(delete\s+from)",   # DELETE FROM
        r"(?i)(insert\s+into)",   # INSERT INTO
        r"(?i)(update\s+\w+\s+set)",  # UPDATE
        r"(?i)(exec\s*\()",       # EXEC
        r"(?i)(execute\s*\()",    # EXECUTE
        r"(?i)(sp_)",             # Stored procedure calls
        r"(?i)(xp_)",             # Extended procedure calls
        r"(?i)(;)",               # Semicolon (statement separator)
        r"(?i)(--)",              # SQL comment
        r"(?i)(/\*.*?\*/)",       # Block comment
    ]

    sanitized = sql_input
    for pattern in dangerous_patterns:
        sanitized = re.sub(pattern, "", sanitized)

    return sanitized


def _remove_dangerous_patterns(text: str) -> str:
    """
    Remove dangerous patterns from text.

    Args:
        text: The text to clean

    Returns:
        Cleaned text
    """
    # Remove JavaScript event handlers
    dangerous_patterns = [
        r'(?i)on\w+\s*=',  # Event handlers like onclick, onload, etc.
        r'(?i)javascript:',  # JavaScript protocol
        r'(?i)vbscript:',    # VBScript protocol
        r'(?i)data:',        # Data URI
        r'(?i)expression\(',  # CSS expression
    ]

    sanitized = text
    for pattern in dangerous_patterns:
        # Remove the pattern completely
        sanitized = re.sub(pattern, '', sanitized)

    return sanitized


def validate_email(email: str) -> bool:
    """
    Validate an email address format.

    Args:
        email: The email to validate

    Returns:
        True if valid, False otherwise
    """
    if not email:
        return False

    # Basic email validation pattern
    email_pattern = re.compile(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )

    return bool(email_pattern.match(email))


def validate_username(username: str) -> bool:
    """
    Validate a username format.

    Args:
        username: The username to validate

    Returns:
        True if valid, False otherwise
    """
    if not username:
        return False

    # Username should only contain alphanumeric characters, underscores, and hyphens
    username_pattern = re.compile(r'^[a-zA-Z0-9_-]{3,30}$')

    return bool(username_pattern.match(username))


def validate_password_strength(password: str) -> Dict[str, Union[bool, List[str]]]:
    """
    Validate password strength.

    Args:
        password: The password to validate

    Returns:
        Dictionary with validation results
    """
    errors = []

    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")

    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter")

    if not re.search(r'[a-z]', password):
        errors.append("Password must contain at least one lowercase letter")

    if not re.search(r'\d', password):
        errors.append("Password must contain at least one digit")

    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        errors.append("Password must contain at least one special character")

    return {
        "valid": len(errors) == 0,
        "errors": errors
    }


def sanitize_user_input(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitize user input for common fields.

    Args:
        data: Dictionary containing user input

    Returns:
        Sanitized user input
    """
    sanitized_data = {}

    for key, value in data.items():
        if key == 'email':
            # Validate email format
            if not validate_email(str(value)):
                raise ValueError(f"Invalid email format: {value}")
            sanitized_data[key] = str(value).lower().strip()
        elif key == 'username':
            # Validate username format
            if not validate_username(str(value)):
                raise ValueError(f"Invalid username format: {value}")
            sanitized_data[key] = str(value).strip()
        elif key == 'password':
            # Validate password strength
            password_validation = validate_password_strength(str(value))
            if not password_validation['valid']:
                raise ValueError(f"Password does not meet requirements: {', '.join(password_validation['errors'])}")
            sanitized_data[key] = str(value)
        elif key in ['title', 'name', 'description', 'bio', 'message', 'content']:
            # Sanitize text fields
            sanitized_data[key] = sanitize_input(str(value), context="general")
        else:
            # Sanitize other string fields
            if isinstance(value, str):
                sanitized_data[key] = sanitize_input(value, context="general")
            else:
                sanitized_data[key] = value

    return sanitized_data