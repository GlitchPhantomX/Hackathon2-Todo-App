#!/usr/bin/env python3
"""
Test script to reproduce the task creation issue with proper authentication
"""

import requests
import json
from datetime import datetime

def test_task_creation_with_auth():
    # First, let's register a test user
    register_payload = {
        "email": "testuser@example.com",
        "name": "Test User",
        "password": "securePassword123!"
    }

    print("Registering test user...")
    try:
        register_response = requests.post(
            "http://localhost:8000/api/v1/auth/register",
            json=register_payload,
            headers={"Content-Type": "application/json"}
        )

        print(f"Registration Status: {register_response.status_code}")
        if register_response.status_code == 200:
            print("Registration successful")
        elif register_response.status_code == 400:
            print("User might already exist, trying to login...")
        else:
            print(f"Registration failed: {register_response.text}")
            return None

    except Exception as e:
        print(f"Error during registration: {e}")
        return None

    # Login to get token
    login_payload = {
        "email": "testuser@example.com",
        "password": "securePassword123!"
    }

    print("Logging in...")
    try:
        login_response = requests.post(
            "http://localhost:8000/api/v1/auth/login",
            json=login_payload,
            headers={"Content-Type": "application/json"}
        )

        print(f"Login Status: {login_response.status_code}")
        if login_response.status_code == 200:
            token_data = login_response.json()
            access_token = token_data.get("access_token")
            print("Login successful, got access token")
            return access_token
        else:
            print(f"Login failed: {login_response.text}")
            return None

    except Exception as e:
        print(f"Error during login: {e}")
        return None

def test_task_creation():
    # Get authentication token
    access_token = test_task_creation_with_auth()

    if not access_token:
        print("Failed to get authentication token")
        return

    # Test the exact payload from the frontend error
    payload = {
        "title": "Research New Framework",
        "description": "Research and evaluate new frontend framework options",
        "priority": "low",
        "due_date": "2025-01-30T00:00:00",  # ISO format
        "project_id": None,
        "tag_ids": [],
        # Note: reminder_enabled is not sent, so should default to False
    }

    print("Testing task creation with payload:")
    print(json.dumps(payload, indent=2))

    try:
        # Create task with valid authentication
        response = requests.post(
            "http://localhost:8000/api/v1/users/me/tasks",
            json=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}"
            }
        )

        print(f"Response Status: {response.status_code}")
        print(f"Response Text: {response.text}")

        if response.status_code == 201:
            print("SUCCESS: Task created successfully!")
            return True
        else:
            print(f"FAILED: Task creation failed with status {response.status_code}")
            return False

    except requests.exceptions.ConnectionError:
        print("X Cannot connect to the server. Is it running?")
        print("Please start the server with: uvicorn main:app --reload")
        return False
    except Exception as e:
        print(f"X Error occurred: {e}")
        return False

if __name__ == "__main__":
    print("Testing task creation endpoint with authentication...")
    print("="*60)

    success = test_task_creation()

    print("="*60)
    if success:
        print("V Test completed successfully!")
    else:
        print("X Test failed - there may be an issue with the backend")