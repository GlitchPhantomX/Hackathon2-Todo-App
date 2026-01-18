#!/usr/bin/env python3
"""
Test script to reproduce the task creation issue
"""

import requests
import json
from datetime import datetime

def test_task_creation():
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
        # Try to create a task without authentication first to see if it's auth issue
        response = requests.post(
            "http://localhost:8000/api/v1/users/me/tasks",
            json=payload,
            headers={"Content-Type": "application/json"}
        )

        print(f"Response Status: {response.status_code}")
        print(f"Response Text: {response.text}")

        if response.status_code != 201:
            print("X Failed to create task without auth")

            # Now try with a dummy auth header to see if it's an auth issue
            response_with_auth = requests.post(
                "http://localhost:8000/api/v1/users/me/tasks",
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": "Bearer dummy-token"
                }
            )

            print(f"Response with dummy auth Status: {response_with_auth.status_code}")
            print(f"Response with dummy auth Text: {response_with_auth.text}")

    except requests.exceptions.ConnectionError:
        print("X Cannot connect to the server. Is it running?")
        print("Please start the server with: uvicorn main:app --reload")
    except Exception as e:
        print(f"X Error occurred: {e}")

def test_with_auth_token():
    """Try to get a valid token first, then create task"""
    print("\n" + "="*50)
    print("Trying to register/login to get a valid token...")

    # Try to register a test user
    register_payload = {
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpassword123"
    }

    try:
        register_response = requests.post(
            "http://localhost:8000/api/v1/auth/register",
            json=register_payload,
            headers={"Content-Type": "application/json"}
        )

        print(f"Registration Status: {register_response.status_code}")
        print(f"Registration Response: {register_response.text}")

        if register_response.status_code == 200:
            # Login to get token
            login_payload = {
                "email": "test@example.com",
                "password": "testpassword123"
            }

            login_response = requests.post(
                "http://localhost:8000/api/v1/auth/login",
                json=login_payload,
                headers={"Content-Type": "application/json"}
            )

            print(f"Login Status: {login_response.status_code}")
            print(f"Login Response: {login_response.text}")

            if login_response.status_code == 200:
                token_data = login_response.json()
                access_token = token_data.get("access_token")

                if access_token:
                    print("V Got access token, trying to create task...")

                    # Now create task with valid token
                    task_payload = {
                        "title": "Research New Framework",
                        "description": "Research and evaluate new frontend framework options",
                        "priority": "low",
                        "due_date": "2025-01-30T00:00:00",
                        "project_id": None,
                        "tag_ids": [],
                    }

                    task_response = requests.post(
                        "http://localhost:8000/api/v1/users/me/tasks",
                        json=task_payload,
                        headers={
                            "Content-Type": "application/json",
                            "Authorization": f"Bearer {access_token}"
                        }
                    )

                    print(f"Task Creation Status: {task_response.status_code}")
                    print(f"Task Creation Response: {task_response.text}")

    except Exception as e:
        print(f"X Error in auth flow: {e}")

if __name__ == "__main__":
    print("Testing task creation endpoint...")
    print("="*50)

    test_task_creation()
    test_with_auth_token()