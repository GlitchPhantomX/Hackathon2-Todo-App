"""
Test script to verify all backend API fixes
Tests the following endpoints:
1. User settings (integrations_connected_services fix)
2. User notifications endpoints
3. User preferences endpoints
4. Tags endpoints
5. Task CRUD endpoints
"""
import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000"
TEST_USER = {
    "email": "fixtest@example.com",
    "name": "Fix Test User",
    "password": "Test@1234"
}

# Color codes for output
class Colors:
    OKGREEN = '\033[92m'
    FAIL = '\033[91m'
    WARNING = '\033[93m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_success(message):
    print(f"{Colors.OKGREEN}[OK]{Colors.ENDC} {message}")

def print_error(message):
    print(f"{Colors.FAIL}[ERROR]{Colors.ENDC} {message}")

def print_test(message):
    print(f"\n{Colors.BOLD}Testing: {message}{Colors.ENDC}")

# Test counter
tests_passed = 0
tests_failed = 0

def test_endpoint(name, method, url, expected_status, **kwargs):
    """Generic test function for endpoints"""
    global tests_passed, tests_failed
    print_test(f"{method} {url}")

    try:
        if method == "GET":
            response = requests.get(url, **kwargs)
        elif method == "POST":
            response = requests.post(url, **kwargs)
        elif method == "PUT":
            response = requests.put(url, **kwargs)
        elif method == "DELETE":
            response = requests.delete(url, **kwargs)
        else:
            print_error(f"Unknown method: {method}")
            tests_failed += 1
            return None

        if response.status_code == expected_status:
            print_success(f"Status: {response.status_code} (Expected: {expected_status})")
            tests_passed += 1
            return response
        else:
            print_error(f"Status: {response.status_code} (Expected: {expected_status})")
            print(f"Response: {response.text}")
            tests_failed += 1
            return None
    except Exception as e:
        print_error(f"Exception: {str(e)}")
        tests_failed += 1
        return None

def main():
    global tests_passed, tests_failed

    print(f"\n{Colors.BOLD}{'='*80}{Colors.ENDC}")
    print(f"{Colors.BOLD}Backend API Fixes - End-to-End Test Suite{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*80}{Colors.ENDC}\n")

    # Step 1: Register user
    print(f"\n{Colors.BOLD}=== STEP 1: User Registration ==={Colors.ENDC}")
    response = test_endpoint(
        "Register User",
        "POST",
        f"{BASE_URL}/api/v1/auth/register",
        200,
        json=TEST_USER
    )

    if not response:
        # Try to login if registration failed (user might already exist)
        print(f"{Colors.WARNING}Registration failed, trying to login instead...{Colors.ENDC}")
        login_data = {
            "username": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
        response = test_endpoint(
            "Login User",
            "POST",
            f"{BASE_URL}/api/v1/auth/login",
            200,
            data=login_data
        )

        if not response:
            print_error("Cannot proceed without authentication")
            return

        tokens = response.json()
    else:
        # After successful registration, login
        login_data = {
            "username": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
        response = test_endpoint(
            "Login User",
            "POST",
            f"{BASE_URL}/api/v1/auth/login",
            200,
            data=login_data
        )

        if not response:
            print_error("Login failed after registration")
            return

        tokens = response.json()

    access_token = tokens.get("access_token")
    if not access_token:
        print_error("No access token received")
        return

    headers = {"Authorization": f"Bearer {access_token}"}

    # Get user info to get user_id
    response = test_endpoint(
        "Get Current User",
        "GET",
        f"{BASE_URL}/api/v1/auth/me",
        200,
        headers=headers
    )

    if not response:
        print_error("Cannot get user info")
        return

    user_info = response.json()
    user_id = user_info.get("id")

    print(f"\n{Colors.OKGREEN}Authenticated as user ID: {user_id}{Colors.ENDC}")

    # Step 2: Test User Settings (integrations_connected_services fix)
    print(f"\n{Colors.BOLD}=== STEP 2: User Settings (JSON string fix) ==={Colors.ENDC}")
    test_endpoint(
        "Get User Settings",
        "GET",
        f"{BASE_URL}/api/v1/usersettings",
        200,
        headers=headers
    )

    # Step 3: Test Notifications Endpoints
    print(f"\n{Colors.BOLD}=== STEP 3: Notifications Endpoints ==={Colors.ENDC}")
    test_endpoint(
        "Get User Notifications",
        "GET",
        f"{BASE_URL}/api/v1/users/{user_id}/notifications",
        200,
        headers=headers
    )

    # Step 4: Test Preferences Endpoints
    print(f"\n{Colors.BOLD}=== STEP 4: Preferences Endpoints ==={Colors.ENDC}")
    test_endpoint(
        "Get User Preferences",
        "GET",
        f"{BASE_URL}/api/v1/users/{user_id}/preferences",
        200,
        headers=headers
    )

    # Step 5: Test Tags Endpoints
    print(f"\n{Colors.BOLD}=== STEP 5: Tags Endpoints ==={Colors.ENDC}")

    # Create a tag
    tag_data = {
        "name": "Test Tag",
        "color": "#FF5733"
    }
    tag_response = test_endpoint(
        "Create Tag",
        "POST",
        f"{BASE_URL}/api/v1/users/{user_id}/tags",
        200,
        headers=headers,
        json=tag_data
    )

    # Get all tags
    test_endpoint(
        "Get All Tags",
        "GET",
        f"{BASE_URL}/api/v1/users/{user_id}/tags",
        200,
        headers=headers
    )

    # Step 6: Test Task CRUD Endpoints
    print(f"\n{Colors.BOLD}=== STEP 6: Task CRUD Endpoints ==={Colors.ENDC}")

    # Create a task
    task_data = {
        "title": "Test Task",
        "description": "This is a test task to verify CRUD operations",
        "priority": "high",
        "due_date": datetime.utcnow().isoformat()
    }
    task_response = test_endpoint(
        "Create Task",
        "POST",
        f"{BASE_URL}/api/v1/users/{user_id}/tasks",
        200,
        headers=headers,
        json=task_data
    )

    # Get all tasks
    test_endpoint(
        "Get All Tasks",
        "GET",
        f"{BASE_URL}/api/v1/users/{user_id}/tasks",
        200,
        headers=headers
    )

    # Get task stats
    test_endpoint(
        "Get Task Stats",
        "GET",
        f"{BASE_URL}/api/v1/stats",
        200,
        headers=headers
    )

    # Print summary
    print(f"\n{Colors.BOLD}{'='*80}{Colors.ENDC}")
    print(f"{Colors.BOLD}Test Summary{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*80}{Colors.ENDC}\n")

    total_tests = tests_passed + tests_failed
    print(f"Total Tests: {total_tests}")
    print(f"{Colors.OKGREEN}Passed: {tests_passed}{Colors.ENDC}")
    print(f"{Colors.FAIL}Failed: {tests_failed}{Colors.ENDC}")

    if tests_failed == 0:
        print(f"\n{Colors.OKGREEN}{Colors.BOLD}ALL TESTS PASSED! Backend is functioning correctly.{Colors.ENDC}")
    else:
        print(f"\n{Colors.FAIL}{Colors.BOLD}Some tests failed. Please review the errors above.{Colors.ENDC}")

if __name__ == "__main__":
    main()
