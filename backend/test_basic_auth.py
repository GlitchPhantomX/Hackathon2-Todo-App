"""
Basic test script to verify authentication functionality for tasks T012-T015, T017, T018, T020
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


def test_auth_router_registration():
    """T012: Test auth router with register endpoint"""
    user_data = {
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpass"
    }

    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == user_data["email"]
    print("SUCCESS: T012 - Auth router register endpoint works")


def test_auth_router_login():
    """T013: Test auth router with login endpoint"""
    # First register a user
    user_data = {
        "email": "login@example.com",
        "name": "Login User",
        "password": "testpass"
    }

    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200

    # Now try to login
    login_data = {
        "username": "login@example.com",
        "password": "testpass"
    }

    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    print("SUCCESS: T013 - Auth router login endpoint works")


def test_auth_router_get_current_user():
    """T014: Test auth router with get current user endpoint"""
    # First register and login to get a token
    user_data = {
        "email": "current@example.com",
        "name": "Current User",
        "password": "testpass"
    }

    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200

    # Login to get token
    login_data = {
        "username": "current@example.com",
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
    assert data["email"] == "current@example.com"
    print("SUCCESS: T014 - Auth router get current user endpoint works")


def test_user_registration_with_valid_data():
    """T015: Test user registration with valid data"""
    user_data = {
        "email": "valid@example.com",
        "name": "Valid User",
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


def test_user_login_with_correct_credentials():
    """T017: Test user login with correct credentials"""
    # First register a user
    user_data = {
        "email": "correct@example.com",
        "name": "Correct User",
        "password": "testpass"
    }

    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200

    # Now try to login with correct credentials
    login_data = {
        "username": "correct@example.com",
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
        "email": "incorrect@example.com",
        "name": "Incorrect User",
        "password": "testpass"
    }

    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200

    # Try to login with wrong password
    login_data = {
        "username": "incorrect@example.com",
        "password": "wrongpass"
    }

    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 401  # Unauthorized
    print("SUCCESS: T018 - User login with incorrect credentials properly rejected")


def test_protected_endpoint_without_token():
    """T020: Test protected endpoint access without token"""
    # Try to access protected endpoint without token
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401  # Unauthorized
    print("SUCCESS: T020 - Protected endpoint access without token properly rejected")


if __name__ == "__main__":
    test_auth_router_registration()
    test_auth_router_login()
    test_auth_router_get_current_user()
    test_user_registration_with_valid_data()
    test_user_login_with_correct_credentials()
    test_user_login_with_incorrect_credentials()
    test_protected_endpoint_without_token()
    print("\nSUCCESS: All authentication functionality tests passed!")