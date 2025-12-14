"""
Comprehensive authentication tests using pytest fixtures
"""
import pytest


def test_registration_success_cases(client):
    """T042: Test registration success cases"""
    user_data = {
        "email": "success@example.com",
        "name": "Success User",
        "password": "SecurePassword123"
    }

    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200

    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["name"] == user_data["name"]
    assert "id" in data
    assert "created_at" in data


def test_registration_failure_cases(client):
    """T042: Test registration failure cases"""
    # Test with invalid email
    invalid_user_data = {
        "email": "invalid_email",
        "name": "Test User",
        "password": "SecurePassword123"
    }

    response = client.post("/api/v1/auth/register", json=invalid_user_data)
    assert response.status_code == 422  # Validation error

    # Test with short password
    invalid_user_data = {
        "email": "test2@example.com",
        "name": "Test User",
        "password": "short"
    }

    response = client.post("/api/v1/auth/register", json=invalid_user_data)
    assert response.status_code == 422  # Validation error

    # Test with short name
    invalid_user_data = {
        "email": "test3@example.com",
        "name": "T",  # Too short
        "password": "SecurePassword123"
    }

    response = client.post("/api/v1/auth/register", json=invalid_user_data)
    assert response.status_code == 422  # Validation error

    # Test duplicate email
    user_data = {
        "email": "duplicate@example.com",
        "name": "User 1",
        "password": "SecurePassword123"
    }

    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200

    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400  # User already exists


def test_login_success_cases(client):
    """T043: Test login success cases"""
    # Register a user first
    user_data = {
        "email": "login_success@example.com",
        "name": "Login Success User",
        "password": "SecurePassword123"
    }

    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200

    # Now try to login with correct credentials
    login_data = {
        "username": "login_success@example.com",
        "password": "SecurePassword123"
    }

    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200

    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_failure_cases(client):
    """T043: Test login failure cases"""
    # Register a user first
    user_data = {
        "email": "login_fail@example.com",
        "name": "Login Fail User",
        "password": "SecurePassword123"
    }

    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200

    # Try to login with wrong password
    login_data = {
        "username": "login_fail@example.com",
        "password": "WrongPassword123"
    }

    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 401  # Unauthorized

    # Try to login with non-existent email
    login_data = {
        "username": "nonexistent@example.com",
        "password": "SecurePassword123"
    }

    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 401  # Unauthorized


def test_all_task_crud_operations(client, auth_headers):
    """T044: Test all task CRUD operations"""
    # Test creating a task
    task_data = {
        "title": "Test Task CRUD",
        "description": "Testing CRUD operations"
    }

    response = client.post("/api/v1/tasks/", json=task_data, headers=auth_headers)
    assert response.status_code == 200
    task_id = response.json()["id"]

    # Test getting the created task
    response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 200
    task = response.json()
    assert task["id"] == task_id
    assert task["title"] == task_data["title"]

    # Test getting all tasks
    response = client.get("/api/v1/tasks/", headers=auth_headers)
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) >= 1

    # Test updating the task
    update_data = {
        "title": "Updated Task CRUD",
        "description": "Updated description",
        "completed": True
    }

    response = client.put(f"/api/v1/tasks/{task_id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    updated_task = response.json()
    assert updated_task["title"] == update_data["title"]
    assert updated_task["completed"] == update_data["completed"]

    # Test deleting the task
    response = client.delete(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 200

    # Verify the task is deleted
    response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 404


def test_authorization_and_user_isolation(client, auth_headers):
    """T045: Test authorization and user isolation"""
    # Create a task with the first user
    task_data = {
        "title": "User Isolation Test",
        "description": "Testing user isolation"
    }

    response = client.post("/api/v1/tasks/", json=task_data, headers=auth_headers)
    assert response.status_code == 200
    task_id = response.json()["id"]

    # Register a second user
    user_data = {
        "email": "second_user@example.com",
        "name": "Second User",
        "password": "SecurePassword123"
    }

    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200

    # Login as second user
    login_data = {
        "username": "second_user@example.com",
        "password": "SecurePassword123"
    }

    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    second_token = response.json()["access_token"]
    second_auth_headers = {"Authorization": f"Bearer {second_token}"}

    # Second user should not be able to access first user's task
    response = client.get(f"/api/v1/tasks/{task_id}", headers=second_auth_headers)
    assert response.status_code == 404  # Task not found (due to user isolation)

    # Second user should not be able to update first user's task
    update_data = {"title": "Hacked Task"}
    response = client.put(f"/api/v1/tasks/{task_id}", json=update_data, headers=second_auth_headers)
    assert response.status_code == 404  # Task not found (due to user isolation)

    # Second user should not be able to delete first user's task
    response = client.delete(f"/api/v1/tasks/{task_id}", headers=second_auth_headers)
    assert response.status_code == 404  # Task not found (due to user isolation)

    # First user should still be able to access their task
    response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 200

    # Test unauthorized access
    response = client.get(f"/api/v1/tasks/{task_id}")
    assert response.status_code == 401  # Unauthorized (no token)

    response = client.get("/api/v1/tasks/")
    assert response.status_code == 401  # Unauthorized (no token)

    response = client.post("/api/v1/tasks/", json=task_data)
    assert response.status_code == 401  # Unauthorized (no token)


def test_error_cases(client):
    """Test various error cases"""
    # Test accessing non-existent task
    response = client.get("/api/v1/tasks/999999", headers={"Authorization": "Bearer invalid_token"})
    assert response.status_code == 401  # Unauthorized (invalid token)

    # Test creating task without authentication
    task_data = {"title": "No Auth Task", "description": "Should fail"}
    response = client.post("/api/v1/tasks/", json=task_data)
    assert response.status_code == 401  # Unauthorized

    # Test invalid data for task creation
    invalid_task_data = {"title": "", "description": "Invalid task with empty title"}
    response = client.post("/api/v1/tasks/", json=invalid_task_data, headers={"Authorization": "Bearer invalid_token"})
    assert response.status_code == 401  # Unauthorized (invalid token)