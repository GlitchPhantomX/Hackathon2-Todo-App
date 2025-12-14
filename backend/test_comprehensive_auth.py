"""
Comprehensive test script to verify all authentication functionality
"""
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from db import get_session
from models import User
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


def test_user_registration_with_valid_data():
    """T015: Test user registration with valid data"""
    user_data = {
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpass"
    }

    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200

    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["name"] == user_data["name"]
    assert "id" in data
    assert "created_at" in data
    print("SUCCESS: T015 - User registration with valid data works")


def test_user_registration_with_invalid_data():
    """T016: Test user registration with invalid data"""
    # Test with invalid email
    invalid_user_data = {
        "email": "invalid_email",
        "name": "Test User",
        "password": "testpass"
    }

    response = client.post("/api/v1/auth/register", json=invalid_user_data)
    assert response.status_code == 422  # Validation error

    # Test with short name
    invalid_user_data = {
        "email": "test2@example.com",
        "name": "T",  # Too short
        "password": "testpass"
    }

    response = client.post("/api/v1/auth/register", json=invalid_user_data)
    assert response.status_code == 422  # Validation error

    # Test with short password (if schema requires min length)
    invalid_user_data = {
        "email": "test3@example.com",
        "name": "Test User 3",
        "password": "ab"  # Too short
    }

    response = client.post("/api/v1/auth/register", json=invalid_user_data)
    assert response.status_code == 422  # Validation error
    print("SUCCESS: T016 - User registration with invalid data properly rejected")


def test_user_login_with_correct_credentials():
    """T017: Test user login with correct credentials"""
    # First register a user
    user_data = {
        "email": "login_test@example.com",
        "name": "Login Test User",
        "password": "testpass"
    }

    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200

    # Now try to login
    login_data = {
        "username": "login_test@example.com",
        "password": "testpass"
    }

    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200

    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    print("SUCCESS: T017 - User login with correct credentials works")


def test_user_login_with_incorrect_credentials():
    """T018: Test user login with incorrect credentials"""
    # First register a user
    user_data = {
        "email": "login_test2@example.com",
        "name": "Login Test User 2",
        "password": "testpass"
    }

    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200

    # Try to login with wrong password
    login_data = {
        "username": "login_test2@example.com",
        "password": "wrongpass"
    }

    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 401  # Unauthorized

    # Try to login with non-existent email
    login_data = {
        "username": "nonexistent@example.com",
        "password": "testpass"
    }

    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 401  # Unauthorized
    print("SUCCESS: T018 - User login with incorrect credentials properly rejected")


def test_protected_endpoint_access_with_valid_token():
    """T019: Test protected endpoint access with valid token"""
    # First register a user
    user_data = {
        "email": "protected_test@example.com",
        "name": "Protected Test User",
        "password": "testpass"
    }

    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200
    user_id = response.json()["id"]

    # Login to get token
    login_data = {
        "username": "protected_test@example.com",
        "password": "testpass"
    }

    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]

    # Access protected endpoint with valid token
    response = client.get("/api/v1/auth/me",
                         headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == user_id
    assert data["email"] == "protected_test@example.com"
    print("SUCCESS: T019 - Protected endpoint access with valid token works")


def test_protected_endpoint_access_without_token():
    """T020: Test protected endpoint access without token"""
    # Try to access protected endpoint without token
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401  # Unauthorized
    print("SUCCESS: T020 - Protected endpoint access without token properly rejected")


if __name__ == "__main__":
    test_user_registration_with_valid_data()
    test_user_registration_with_invalid_data()
    test_user_login_with_correct_credentials()
    test_user_login_with_incorrect_credentials()
    test_protected_endpoint_access_with_valid_token()
    test_protected_endpoint_access_without_token()
    print("\nSUCCESS: All authentication functionality tests (T015-T020) passed!")