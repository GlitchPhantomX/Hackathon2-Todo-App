"""
Utility functions for converting between snake_case and camelCase.
"""
import re
from typing import Any, Dict, List, Union


def snake_to_camel(snake_str: str) -> str:
    """
    Convert snake_case string to camelCase.

    Args:
        snake_str: String in snake_case format

    Returns:
        String in camelCase format
    """
    # Split on underscores and capitalize each word except the first
    components = snake_str.split('_')
    return components[0] + ''.join(word.capitalize() for word in components[1:])


def camel_to_snake(camel_str: str) -> str:
    """
    Convert camelCase string to snake_case.

    Args:
        camel_str: String in camelCase format

    Returns:
        String in snake_case format
    """
    # Insert underscores before uppercase letters that follow lowercase letters
    s1 = re.sub('([a-z0-9])([A-Z])', r'\1_\2', camel_str)
    return s1.lower()


def convert_dict_keys_to_camel(data: Union[Dict, List, Any]) -> Union[Dict, List, Any]:
    """
    Recursively convert dictionary keys from snake_case to camelCase.

    Args:
        data: Dictionary, list, or other data to convert

    Returns:
        Converted data with camelCase keys
    """
    if isinstance(data, dict):
        return {
            snake_to_camel(key): convert_dict_keys_to_camel(value)
            for key, value in data.items()
        }
    elif isinstance(data, list):
        return [convert_dict_keys_to_camel(item) for item in data]
    else:
        return data


def convert_dict_keys_to_snake(data: Union[Dict, List, Any]) -> Union[Dict, List, Any]:
    """
    Recursively convert dictionary keys from camelCase to snake_case.

    Args:
        data: Dictionary, list, or other data to convert

    Returns:
        Converted data with snake_case keys
    """
    if isinstance(data, dict):
        return {
            camel_to_snake(key): convert_dict_keys_to_snake(value)
            for key, value in data.items()
        }
    elif isinstance(data, list):
        return [convert_dict_keys_to_snake(item) for item in data]
    else:
        return data