"""
Backend API Testing Script
Tests FastAPI endpoints with proper request bodies and detailed logging
"""
import requests
import json
import sys
from typing import Dict, Any, Optional
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000"
FRONTEND_ORIGIN = "http://localhost:3000"

# Test data
TEST_USER = {
    "email": "testuser@gmail.com",
    "name": "Test User",
    "password": "Test@1234"
}

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text: str):
    """Print formatted header"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}\n")

def print_test(name: str):
    """Print test name"""
    print(f"\n{Colors.OKCYAN}{Colors.BOLD}Testing: {name}{Colors.ENDC}")
    print(f"{Colors.OKCYAN}{'-'*80}{Colors.ENDC}")

def print_success(message: str):
    """Print success message"""
    print(f"{Colors.OKGREEN}[OK] {message}{Colors.ENDC}")

def print_error(message: str):
    """Print error message"""
    print(f"{Colors.FAIL}[ERROR] {message}{Colors.ENDC}")

def print_warning(message: str):
    """Print warning message"""
    print(f"{Colors.WARNING}[WARN] {message}{Colors.ENDC}")

def log_request(method: str, url: str, data: Optional[Dict] = None, headers: Optional[Dict] = None):
    """Log request details"""
    print(f"\n{Colors.OKBLUE}Request:{Colors.ENDC}")
    print(f"  Method: {method}")
    print(f"  URL: {url}")
    if headers:
        print(f"  Headers: {json.dumps(headers, indent=2)}")
    if data:
        print(f"  Body: {json.dumps(data, indent=2)}")

def log_response(response: requests.Response):
    """Log response details"""
    print(f"\n{Colors.OKBLUE}Response:{Colors.ENDC}")
    print(f"  Status Code: {response.status_code}")
    print(f"  Headers: {json.dumps(dict(response.headers), indent=2)}")

    try:
        response_data = response.json()
        print(f"  Body: {json.dumps(response_data, indent=2)}")
    except:
        print(f"  Body: {response.text}")

    return response

def test_cors_headers(response: requests.Response) -> bool:
    """Check if CORS headers are properly configured"""
    cors_origin = response.headers.get('access-control-allow-origin')
    cors_credentials = response.headers.get('access-control-allow-credentials')

    if cors_origin:
        print_success(f"CORS Origin header present: {cors_origin}")
    else:
        print_warning("CORS Origin header missing")

    if cors_credentials:
        print_success(f"CORS Credentials header present: {cors_credentials}")

    return bool(cors_origin)

def test_health_endpoint():
    """Test the /health endpoint"""
    print_test("GET /health")

    try:
        url = f"{BASE_URL}/health"
        log_request("GET", url)

        response = requests.get(url)
        log_response(response)

        if response.status_code == 200:
            print_success("Health endpoint is working")
            return True
        else:
            print_error(f"Health endpoint failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Health endpoint error: {str(e)}")
        return False

def test_metrics_endpoint():
    """Test the /metrics endpoint"""
    print_test("GET /metrics")

    try:
        url = f"{BASE_URL}/metrics"
        log_request("GET", url)

        response = requests.get(url)
        log_response(response)

        if response.status_code == 200:
            print_success("Metrics endpoint is working")
            return True
        else:
            print_error(f"Metrics endpoint failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Metrics endpoint error: {str(e)}")
        return False

def test_root_endpoint():
    """Test the / endpoint"""
    print_test("GET /")

    try:
        url = f"{BASE_URL}/"
        log_request("GET", url)

        response = requests.get(url)
        log_response(response)

        if response.status_code == 200:
            print_success("Root endpoint is working")
            return True
        else:
            print_error(f"Root endpoint failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Root endpoint error: {str(e)}")
        return False

def test_register():
    """Test user registration"""
    print_test("POST /api/v1/auth/register")

    try:
        url = f"{BASE_URL}/api/v1/auth/register"
        log_request("POST", url, data=TEST_USER)

        response = requests.post(url, json=TEST_USER)
        log_response(response)
        test_cors_headers(response)

        if response.status_code == 200:
            print_success("User registration successful")
            return True, response.json()
        elif response.status_code == 400:
            error_data = response.json()
            if "already exists" in str(error_data).lower() or "already registered" in str(error_data).lower():
                print_warning("User already exists - this is expected if running tests multiple times")
                return True, error_data
            else:
                print_error(f"Registration failed: {error_data}")
                return False, error_data
        else:
            print_error(f"Registration failed with status {response.status_code}")
            return False, response.json() if response.text else {}
    except Exception as e:
        print_error(f"Registration error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False, {}

def test_login():
    """Test user login"""
    print_test("POST /api/v1/auth/login")

    try:
        # OAuth2PasswordRequestForm expects form-urlencoded data with 'username' field
        login_data = {
            "username": TEST_USER["email"],  # OAuth2 uses 'username' field for email
            "password": TEST_USER["password"]
        }

        url = f"{BASE_URL}/api/v1/auth/login"
        log_request("POST", url, data=login_data)

        # Send as form data, not JSON
        response = requests.post(url, data=login_data)
        log_response(response)
        test_cors_headers(response)

        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "refresh_token" in data:
                print_success("Login successful - tokens received")
                return True, data
            else:
                print_error("Login response missing tokens")
                return False, data
        else:
            print_error(f"Login failed with status {response.status_code}")
            return False, response.json() if response.text else {}
    except Exception as e:
        print_error(f"Login error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False, {}

def test_refresh_token(refresh_token: str):
    """Test token refresh"""
    print_test("POST /api/v1/auth/refresh")

    try:
        # Refresh token endpoint expects token as query parameter
        url = f"{BASE_URL}/api/v1/auth/refresh?refresh_token={refresh_token}"
        log_request("POST", url)

        response = requests.post(url)
        log_response(response)
        test_cors_headers(response)

        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                print_success("Token refresh successful - new access token received")
                return True, data
            else:
                print_error("Refresh response missing access token")
                return False, data
        else:
            print_error(f"Token refresh failed with status {response.status_code}")
            return False, response.json() if response.text else {}
    except Exception as e:
        print_error(f"Token refresh error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False, {}

def test_get_me(access_token: str):
    """Test getting current user info"""
    print_test("GET /api/v1/auth/me")

    try:
        headers = {
            "Authorization": f"Bearer {access_token}"
        }

        url = f"{BASE_URL}/api/v1/auth/me"
        log_request("GET", url, headers=headers)

        response = requests.get(url, headers=headers)
        log_response(response)
        test_cors_headers(response)

        if response.status_code == 200:
            data = response.json()
            if "email" in data:
                print_success(f"User info retrieved - Email: {data.get('email')}")
                return True, data
            else:
                print_error("User info response missing email")
                return False, data
        else:
            print_error(f"Get user info failed with status {response.status_code}")
            return False, response.json() if response.text else {}
    except Exception as e:
        print_error(f"Get user info error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False, {}

def main():
    """Main test runner"""
    print_header("FastAPI Backend Testing Suite")
    print(f"Base URL: {BASE_URL}")
    print(f"Frontend Origin: {FRONTEND_ORIGIN}")
    print(f"Test User: {TEST_USER['email']}")
    print(f"Timestamp: {datetime.now().isoformat()}")

    results = {
        "passed": [],
        "failed": [],
        "warnings": []
    }

    # Test basic endpoints
    print_header("Phase 1: Basic Endpoints")

    if test_root_endpoint():
        results["passed"].append("GET /")
    else:
        results["failed"].append("GET /")

    if test_health_endpoint():
        results["passed"].append("GET /health")
    else:
        results["failed"].append("GET /health")

    if test_metrics_endpoint():
        results["passed"].append("GET /metrics")
    else:
        results["failed"].append("GET /metrics")

    # Test authentication flow
    print_header("Phase 2: Authentication Flow")

    # Register
    register_success, register_data = test_register()
    if register_success:
        results["passed"].append("POST /api/v1/auth/register")
    else:
        results["failed"].append("POST /api/v1/auth/register")
        print_error("Cannot continue with auth tests - registration failed")
        print_summary(results)
        return

    # Login
    login_success, login_data = test_login()
    if login_success:
        results["passed"].append("POST /api/v1/auth/login")
        access_token = login_data.get("access_token")
        refresh_token = login_data.get("refresh_token")
    else:
        results["failed"].append("POST /api/v1/auth/login")
        print_error("Cannot continue with auth tests - login failed")
        print_summary(results)
        return

    # Refresh token
    if refresh_token:
        refresh_success, refresh_data = test_refresh_token(refresh_token)
        if refresh_success:
            results["passed"].append("POST /api/v1/auth/refresh")
            # Use new access token for subsequent requests
            access_token = refresh_data.get("access_token", access_token)
        else:
            results["failed"].append("POST /api/v1/auth/refresh")
    else:
        print_error("No refresh token available")
        results["failed"].append("POST /api/v1/auth/refresh")

    # Get current user
    if access_token:
        me_success, me_data = test_get_me(access_token)
        if me_success:
            results["passed"].append("GET /api/v1/auth/me")
        else:
            results["failed"].append("GET /api/v1/auth/me")
    else:
        print_error("No access token available")
        results["failed"].append("GET /api/v1/auth/me")

    # Print summary
    print_summary(results)

def print_summary(results: Dict[str, list]):
    """Print test summary"""
    print_header("Test Summary")

    total = len(results["passed"]) + len(results["failed"])
    passed = len(results["passed"])
    failed = len(results["failed"])

    print(f"\nTotal Tests: {total}")
    print(f"{Colors.OKGREEN}Passed: {passed}{Colors.ENDC}")
    print(f"{Colors.FAIL}Failed: {failed}{Colors.ENDC}")

    if results["passed"]:
        print(f"\n{Colors.OKGREEN}{Colors.BOLD}[OK] Passed Tests:{Colors.ENDC}")
        for test in results["passed"]:
            print(f"  {Colors.OKGREEN}[OK]{Colors.ENDC} {test}")

    if results["failed"]:
        print(f"\n{Colors.FAIL}{Colors.BOLD}[FAIL] Failed Tests:{Colors.ENDC}")
        for test in results["failed"]:
            print(f"  {Colors.FAIL}[FAIL]{Colors.ENDC} {test}")

    # Recommendations
    print_header("Recommendations")

    if failed > 0:
        print(f"{Colors.WARNING}Issues Found:{Colors.ENDC}")
        print("1. Check backend server logs for detailed error messages")
        print("2. Verify database schema matches expected models")
        print("3. Check CORS configuration in backend main.py")
        print("4. Ensure all required environment variables are set")
        print("5. Verify authentication schemas match request bodies")
    else:
        print(f"{Colors.OKGREEN}All tests passed! Backend is functioning correctly.{Colors.ENDC}")

    # Exit with appropriate code
    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()
