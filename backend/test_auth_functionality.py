"""
Simple test script to verify authentication functionality works
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


def test_user_registration():
    """Test user registration with valid data"""
    user_data = {
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpass"
    }

    response = client.post("/api/v1/auth/register", json=user_data)
    print(f"Registration response: {response.status_code}")
    print(f"Registration data: {response.json()}")
    assert response.status_code == 200

    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["name"] == user_data["name"]
    assert "id" in data
    assert "created_at" in data
    print("SUCCESS: User registration with valid data works")


def test_user_login():
    """Test user login with correct credentials"""
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

    # For OAuth2PasswordRequestForm, we need to send as form data, not JSON
    response = client.post("/api/v1/auth/login", data=login_data)
    print(f"Login response: {response.status_code}")
    print(f"Login data: {response.json()}")
    assert response.status_code == 200

    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    print("SUCCESS: User login with correct credentials works")


if __name__ == "__main__":
    test_user_registration()
    test_user_login()
    print("\nSUCCESS: All authentication functionality tests passed!")