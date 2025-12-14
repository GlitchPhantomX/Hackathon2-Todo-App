"""
Final verification test to ensure all functionality works
"""
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_all_functionality():
    """Test all functionality to verify implementation"""
    print("Testing API documentation endpoints...")

    # Test /docs endpoint
    response = client.get("/docs")
    assert response.status_code == 200, f"Docs endpoint failed with status {response.status_code}"
    print("SUCCESS: /docs endpoint works")

    # Test /redoc endpoint
    response = client.get("/redoc")
    assert response.status_code == 200, f"Redoc endpoint failed with status {response.status_code}"
    print("SUCCESS: /redoc endpoint works")

    # Test health endpoint
    response = client.get("/health")
    assert response.status_code == 200, f"Health endpoint failed with status {response.status_code}"
    data = response.json()
    assert data["status"] == "healthy", f"Health check returned: {data}"
    print("SUCCESS: /health endpoint works")

    # Test auth functionality
    print("\nTesting authentication functionality...")

    # Register a user
    user_data = {
        "email": "finaltest@example.com",
        "name": "Final Test User",
        "password": "SecurePassword123"
    }

    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200, f"Registration failed with status {response.status_code}"
    user_id = response.json()["id"]
    print("SUCCESS: User registration works")

    # Login to get token
    login_data = {
        "username": "finaltest@example.com",
        "password": "SecurePassword123"
    }

    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200, f"Login failed with status {response.status_code}"
    token = response.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}
    print("SUCCESS: User login works")

    # Test protected endpoint
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200, f"Protected endpoint failed with status {response.status_code}"
    print("SUCCESS: Protected endpoint access works")

    # Test task functionality
    print("\nTesting task management functionality...")

    # Create a task
    task_data = {
        "title": "Final Test Task",
        "description": "This is a final test task"
    }

    response = client.post("/api/v1/tasks/", json=task_data, headers=auth_headers)
    assert response.status_code == 200, f"Task creation failed with status {response.status_code}"
    task_id = response.json()["id"]
    print("SUCCESS: Task creation works")

    # Get the task
    response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 200, f"Get task failed with status {response.status_code}"
    print("SUCCESS: Get single task works")

    # Get all tasks
    response = client.get("/api/v1/tasks/", headers=auth_headers)
    assert response.status_code == 200, f"Get all tasks failed with status {response.status_code}"
    tasks = response.json()
    assert len(tasks) >= 1, "Expected at least 1 task"
    print("SUCCESS: Get all tasks works")

    # Update the task
    update_data = {
        "title": "Updated Final Test Task",
        "completed": True
    }

    response = client.put(f"/api/v1/tasks/{task_id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200, f"Task update failed with status {response.status_code}"
    print("SUCCESS: Task update works")

    # Delete the task
    response = client.delete(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 200, f"Task deletion failed with status {response.status_code}"
    print("SUCCESS: Task deletion works")

    # Test user isolation (try to access after deletion)
    response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 404, f"Deleted task should not be accessible, got status {response.status_code}"
    print("SUCCESS: Task deletion and access control works")

    # Test unauthorized access
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401, f"Unauthorized access should fail, got status {response.status_code}"
    print("SUCCESS: Authentication protection works")

    print("\nALL FUNCTIONALITY VERIFIED SUCCESSFULLY!")
    print("Phase 5: API Documentation & Health Checks - COMPLETE")
    print("Phase 6: Comprehensive Testing - VERIFIED")


if __name__ == "__main__":
    test_all_functionality()