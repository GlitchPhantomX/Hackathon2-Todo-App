"""
Test script for API documentation and health check endpoints
"""
from fastapi.testclient import TestClient
from main import app

# Create a test client
client = TestClient(app)


def test_api_documentation_endpoints():
    """T037: Test API documentation endpoints"""
    # Test /docs endpoint (Swagger UI)
    response = client.get("/docs")
    assert response.status_code == 200
    print("SUCCESS: T037 - API documentation at /docs is accessible")

    # Test /redoc endpoint (ReDoc)
    response = client.get("/redoc")
    assert response.status_code == 200
    print("SUCCESS: T037 - ReDoc at /redoc is accessible")


def test_health_check_endpoint():
    """T038: Test health check endpoints"""
    # Test /health endpoint
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    print("SUCCESS: T038 - Health check endpoint /health is working")


def test_openapi_json():
    """Test OpenAPI schema endpoint"""
    response = client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "openapi" in data
    assert data["info"]["title"] == "Todo API"
    print("SUCCESS: OpenAPI JSON schema is available")


if __name__ == "__main__":
    test_api_documentation_endpoints()
    test_health_check_endpoint()
    test_openapi_json()
    print("\nSUCCESS: All documentation and health check tests passed!")