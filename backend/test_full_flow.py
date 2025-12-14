"""
Test script for full authentication flow: register → login → use token → operations
"""
from fastapi.testclient import TestClient
from main import app


def test_full_authentication_flow():
    """T049: Test full authentication flow (register → login → use token → operations)"""
    client = TestClient(app)

    print("Testing full authentication flow...")

    # Step 1: Register a new user
    print("Step 1: Registering user...")
    user_data = {
        "email": "fullflow@test.com",
        "name": "Full Flow Test User",
        "password": "SecurePassword123"
    }

    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200, f"Registration failed: {response.status_code}, {response.text}"

    user_info = response.json()
    user_id = user_info["id"]
    print(f"✓ User registered successfully with ID: {user_id}")

    # Step 2: Login to get JWT token
    print("Step 2: Logging in to get JWT token...")
    login_data = {
        "username": "fullflow@test.com",
        "password": "SecurePassword123"
    }

    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200, f"Login failed: {response.status_code}, {response.text}"

    token_data = response.json()
    assert "access_token" in token_data, "No access token in response"
    token = token_data["access_token"]
    token_type = token_data["token_type"]

    print(f"✓ Login successful, received {token_type} token")

    # Step 3: Use token to access protected endpoint (get current user)
    print("Step 3: Using token to access protected endpoint...")
    auth_headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200, f"Protected endpoint access failed: {response.status_code}, {response.text}"

    current_user = response.json()
    assert current_user["id"] == user_id, "User ID mismatch"
    assert current_user["email"] == "fullflow@test.com", "Email mismatch"

    print("✓ Protected endpoint accessed successfully")

    # Step 4: Use token to perform operations (create, read, update, delete tasks)
    print("Step 4: Performing task operations with token...")

    # Create a task
    task_data = {
        "title": "Full Flow Test Task",
        "description": "Task created during full flow test"
    }

    response = client.post("/api/v1/tasks/", json=task_data, headers=auth_headers)
    assert response.status_code == 200, f"Task creation failed: {response.status_code}, {response.text}"

    task_info = response.json()
    task_id = task_info["id"]
    print(f"✓ Task created successfully with ID: {task_id}")

    # Get the specific task
    response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 200, f"Get task failed: {response.status_code}, {response.text}"
    print("✓ Task retrieved successfully")

    # Update the task
    update_data = {
        "title": "Updated Full Flow Test Task",
        "description": "Updated description for full flow test",
        "completed": True
    }

    response = client.put(f"/api/v1/tasks/{task_id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200, f"Task update failed: {response.status_code}, {response.text}"

    updated_task = response.json()
    assert updated_task["title"] == update_data["title"], "Task title not updated"
    assert updated_task["completed"] == update_data["completed"], "Task completion status not updated"
    print("✓ Task updated successfully")

    # Get all tasks
    response = client.get("/api/v1/tasks/", headers=auth_headers)
    assert response.status_code == 200, f"Get all tasks failed: {response.status_code}, {response.text}"
    tasks = response.json()
    assert len(tasks) >= 1, "No tasks returned"
    print(f"✓ Retrieved {len(tasks)} task(s) successfully")

    # Delete the task
    response = client.delete(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 200, f"Task deletion failed: {response.status_code}, {response.text}"
    print("✓ Task deleted successfully")

    # Verify task is deleted
    response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 404, f"Deleted task should not be accessible: {response.status_code}"
    print("✓ Deleted task properly inaccessible")

    # Step 5: Test that operations fail without token
    print("Step 5: Testing operations without token...")

    # Try to access protected endpoint without token
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401, f"Protected endpoint should require token: {response.status_code}"
    print("✓ Protected endpoint properly requires authentication")

    # Try to create task without token
    response = client.post("/api/v1/tasks/", json=task_data)
    assert response.status_code == 401, f"Task creation should require token: {response.status_code}"
    print("✓ Task creation properly requires authentication")

    print("\n🎉 Full authentication flow test completed successfully!")
    print("✓ Register → Login → Use Token → Operations all work correctly")
    print("✓ Authentication protection works when token is missing")


if __name__ == "__main__":
    test_full_authentication_flow()
    print("\nSUCCESS: Full authentication flow test passed!")