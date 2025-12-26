"""
Test script for Task CRUD operations using requests.
This script demonstrates how to test the task CRUD operations with curl/Postman.
"""
import requests
import json
import os
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
TEST_USER_ID = 1  # Change this to an existing user ID in your database

# Sample test data
test_task = {
    "title": "Test Task for CRUD Operations",
    "description": "This is a test task to validate CRUD operations",
    "due_date": (datetime.now() + timedelta(days=1)).isoformat(),
    "priority": "medium"
}

def get_auth_token():
    """Get authentication token for testing"""
    # Register a test user or use an existing one
    login_data = {
        "username": os.getenv("TEST_USER_EMAIL", "test@example.com"),
        "password": os.getenv("TEST_USER_PASSWORD", "password123")
    }

    try:
        response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
        if response.status_code == 200:
            token_data = response.json()
            return token_data.get("access_token")
        else:
            print(f"Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Error getting auth token: {e}")
        return None

def test_create_task(token):
    """Test creating a task"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    print("Testing CREATE task...")
    response = requests.post(
        f"{BASE_URL}/users/{TEST_USER_ID}/tasks",
        json=test_task,
        headers=headers
    )

    print(f"CREATE Response: {response.status_code}")
    if response.status_code == 200:
        task_data = response.json()
        print(f"Created task ID: {task_data['id']}")
        return task_data['id']
    else:
        print(f"CREATE Error: {response.text}")
        return None

def test_get_task(token, task_id):
    """Test getting a specific task"""
    headers = {
        "Authorization": f"Bearer {token}"
    }

    print(f"\nTesting READ task {task_id}...")
    response = requests.get(
        f"{BASE_URL}/users/{TEST_USER_ID}/tasks/{task_id}",
        headers=headers
    )

    print(f"READ Response: {response.status_code}")
    if response.status_code == 200:
        task_data = response.json()
        print(f"Retrieved task: {task_data['title']}")
        return task_data
    else:
        print(f"READ Error: {response.text}")
        return None

def test_get_all_tasks(token):
    """Test getting all tasks for a user"""
    headers = {
        "Authorization": f"Bearer {token}"
    }

    print(f"\nTesting READ all tasks for user {TEST_USER_ID}...")
    response = requests.get(
        f"{BASE_URL}/users/{TEST_USER_ID}/tasks",
        headers=headers
    )

    print(f"READ ALL Response: {response.status_code}")
    if response.status_code == 200:
        tasks = response.json()
        print(f"Retrieved {len(tasks)} tasks")
        return tasks
    else:
        print(f"READ ALL Error: {response.text}")
        return None

def test_update_task(token, task_id):
    """Test updating a task"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    update_data = {
        "title": "Updated Test Task",
        "description": "This task has been updated",
        "completed": True
    }

    print(f"\nTesting UPDATE task {task_id}...")
    response = requests.put(
        f"{BASE_URL}/users/{TEST_USER_ID}/tasks/{task_id}",
        json=update_data,
        headers=headers
    )

    print(f"UPDATE Response: {response.status_code}")
    if response.status_code == 200:
        task_data = response.json()
        print(f"Updated task: {task_data['title']}")
        return task_data
    else:
        print(f"UPDATE Error: {response.text}")
        return None

def test_delete_task(token, task_id):
    """Test deleting a task"""
    headers = {
        "Authorization": f"Bearer {token}"
    }

    print(f"\nTesting DELETE task {task_id}...")
    response = requests.delete(
        f"{BASE_URL}/users/{TEST_USER_ID}/tasks/{task_id}",
        headers=headers
    )

    print(f"DELETE Response: {response.status_code}")
    if response.status_code == 200:
        print("Task deleted successfully")
        return True
    else:
        print(f"DELETE Error: {response.text}")
        return False

def run_crud_tests():
    """Run all CRUD tests"""
    print("Starting Task CRUD Operations Test...\n")

    # Get authentication token
    token = get_auth_token()
    if not token:
        print("Failed to get authentication token. Please ensure:")
        print("1. The API server is running on localhost:8000")
        print("2. A test user exists in the database")
        print("3. Environment variables TEST_USER_EMAIL and TEST_USER_PASSWORD are set")
        return

    print(f"Got auth token: {token[:10]}...\n")

    # Test CREATE
    task_id = test_create_task(token)
    if not task_id:
        print("CREATE test failed, stopping tests")
        return

    # Test READ (single task)
    retrieved_task = test_get_task(token, task_id)

    # Test READ (all tasks)
    all_tasks = test_get_all_tasks(token)

    # Test UPDATE
    updated_task = test_update_task(token, task_id)

    # Test DELETE
    delete_success = test_delete_task(token, task_id)

    print(f"\nCRUD Test Summary:")
    print(f"- CREATE: {'✓' if task_id else '✗'}")
    print(f"- READ (single): {'✓' if retrieved_task else '✗'}")
    print(f"- READ (all): {'✓' if all_tasks is not None else '✗'}")
    print(f"- UPDATE: {'✓' if updated_task else '✗'}")
    print(f"- DELETE: {'✓' if delete_success else '✗'}")

    print("\nTest completed!")

if __name__ == "__main__":
    run_crud_tests()