import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from db import get_session
from models import User, Task
from sqlmodel import SQLModel
from auth import get_password_hash


# Create an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Create all tables
SQLModel.metadata.create_all(bind=engine)


def override_get_session():
    """Override the get_session dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


# Override the dependency in the FastAPI app
app.dependency_overrides[get_session] = override_get_session

# Create a test client
client = TestClient(app)


def get_auth_token(email: str, password: str) -> str:
    """Helper function to get authentication token"""
    login_data = {
        "username": email,
        "password": password
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    return response.json()["access_token"]


def register_and_login_user(email: str, name: str, password: str) -> tuple:
    """Helper function to register and login a user, returns (user_id, token)"""
    # Register user
    user_data = {
        "email": email,
        "name": name,
        "password": password
    }
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200
    user_id = response.json()["id"]

    # Get token
    token = get_auth_token(email, password)
    return user_id, token


def test_task_creation_with_valid_data():
    """T026: Test task creation with valid data"""
    # Register and login user
    user_id, token = register_and_login_user("taskuser@example.com", "Task User", "testpass")

    # Create task with valid data
    task_data = {
        "title": "Test Task",
        "description": "This is a test task"
    }

    response = client.post("/api/v1/tasks/",
                          json=task_data,
                          headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

    data = response.json()
    assert data["title"] == task_data["title"]
    assert data["description"] == task_data["description"]
    assert data["user_id"] == user_id
    assert data["completed"] is False  # Default value
    print("SUCCESS: T026 - Task creation with valid data works")


def test_task_creation_with_invalid_data():
    """T027: Test task creation with invalid data"""
    # Register and login user
    _, token = register_and_login_user("taskuser2@example.com", "Task User 2", "testpass")

    # Try to create task with empty title (should fail validation)
    task_data = {
        "title": "",  # Empty title should fail
        "description": "This is a test task"
    }

    response = client.post("/api/v1/tasks/",
                          json=task_data,
                          headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 422  # Validation error

    # Try to create task with title that's too long (should fail validation)
    task_data = {
        "title": "A" * 201,  # Too long title
        "description": "This is a test task"
    }

    response = client.post("/api/v1/tasks/",
                          json=task_data,
                          headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 422  # Validation error

    print("SUCCESS: T027 - Task creation with invalid data properly rejected")


def test_getting_all_tasks_for_user():
    """T028: Test getting all tasks for user"""
    # Register and login user
    user_id, token = register_and_login_user("getall@example.com", "Get All User", "testpass")

    # Create some tasks
    task1_data = {"title": "Task 1", "description": "First task"}
    task2_data = {"title": "Task 2", "description": "Second task"}

    response = client.post("/api/v1/tasks/",
                          json=task1_data,
                          headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

    response = client.post("/api/v1/tasks/",
                          json=task2_data,
                          headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

    # Get all tasks
    response = client.get("/api/v1/tasks/",
                         headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

    tasks = response.json()
    assert len(tasks) == 2
    assert tasks[0]["title"] == task1_data["title"]
    assert tasks[1]["title"] == task2_data["title"]
    print("SUCCESS: T028 - Getting all tasks for user works")


def test_getting_single_task_by_id():
    """T029: Test getting single task by ID"""
    # Register and login user
    user_id, token = register_and_login_user("getsingle@example.com", "Get Single User", "testpass")

    # Create a task
    task_data = {"title": "Single Task", "description": "A single task"}
    response = client.post("/api/v1/tasks/",
                          json=task_data,
                          headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    task_id = response.json()["id"]

    # Get the specific task
    response = client.get(f"/api/v1/tasks/{task_id}",
                         headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

    task = response.json()
    assert task["id"] == task_id
    assert task["title"] == task_data["title"]
    assert task["description"] == task_data["description"]
    print("SUCCESS: T029 - Getting single task by ID works")


def test_updating_task_details():
    """T030: Test updating task details"""
    # Register and login user
    user_id, token = register_and_login_user("update@example.com", "Update User", "testpass")

    # Create a task
    task_data = {"title": "Original Task", "description": "Original description"}
    response = client.post("/api/v1/tasks/",
                          json=task_data,
                          headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    task_id = response.json()["id"]

    # Update the task
    update_data = {
        "title": "Updated Task",
        "description": "Updated description",
        "completed": True
    }

    response = client.put(f"/api/v1/tasks/{task_id}",
                         json=update_data,
                         headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

    updated_task = response.json()
    assert updated_task["id"] == task_id
    assert updated_task["title"] == update_data["title"]
    assert updated_task["description"] == update_data["description"]
    assert updated_task["completed"] == update_data["completed"]
    print("SUCCESS: T030 - Updating task details works")


def test_deleting_task():
    """T031: Test deleting task"""
    # Register and login user
    user_id, token = register_and_login_user("delete@example.com", "Delete User", "testpass")

    # Create a task
    task_data = {"title": "Task to Delete", "description": "This will be deleted"}
    response = client.post("/api/v1/tasks/",
                          json=task_data,
                          headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    task_id = response.json()["id"]

    # Verify task exists
    response = client.get(f"/api/v1/tasks/{task_id}",
                         headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

    # Delete the task
    response = client.delete(f"/api/v1/tasks/{task_id}",
                            headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

    # Verify task is deleted
    response = client.get(f"/api/v1/tasks/{task_id}",
                         headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404
    print("SUCCESS: T031 - Deleting task works")


def test_user_isolation():
    """T032: Test user isolation (can't access other users' tasks)"""
    # Register and login first user
    user1_id, token1 = register_and_login_user("user1@example.com", "User 1", "testpass")

    # Register and login second user
    user2_id, token2 = register_and_login_user("user2@example.com", "User 2", "testpass")

    # First user creates a task
    task_data = {"title": "User 1 Task", "description": "Task created by user 1"}
    response = client.post("/api/v1/tasks/",
                          json=task_data,
                          headers={"Authorization": f"Bearer {token1}"})
    assert response.status_code == 200
    task_id = response.json()["id"]

    # Second user tries to access first user's task (should fail)
    response = client.get(f"/api/v1/tasks/{task_id}",
                         headers={"Authorization": f"Bearer {token2}"})
    assert response.status_code == 404  # Task not found (due to user isolation)

    # Second user tries to update first user's task (should fail)
    update_data = {"title": "Hacked Task"}
    response = client.put(f"/api/v1/tasks/{task_id}",
                         json=update_data,
                         headers={"Authorization": f"Bearer {token2}"})
    assert response.status_code == 404  # Task not found (due to user isolation)

    # Second user tries to delete first user's task (should fail)
    response = client.delete(f"/api/v1/tasks/{task_id}",
                            headers={"Authorization": f"Bearer {token2}"})
    assert response.status_code == 404  # Task not found (due to user isolation)

    # Verify first user can still access their task
    response = client.get(f"/api/v1/tasks/{task_id}",
                         headers={"Authorization": f"Bearer {token1}"})
    assert response.status_code == 200

    print("SUCCESS: T032 - User isolation works correctly")


if __name__ == "__main__":
    test_task_creation_with_valid_data()
    test_task_creation_with_invalid_data()
    test_getting_all_tasks_for_user()
    test_getting_single_task_by_id()
    test_updating_task_details()
    test_deleting_task()
    test_user_isolation()
    print("\nSUCCESS: All task management functionality tests passed!")