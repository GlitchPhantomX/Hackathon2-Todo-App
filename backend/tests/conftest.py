"""
Test configuration and fixtures for the backend API
"""
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


@pytest.fixture(scope="function")
def db_session():
    """Create a new database session for each test function"""
    # Create all tables
    SQLModel.metadata.create_all(bind=engine)

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def override_get_session(db_session):
    """Override the get_session dependency for testing"""
    def _get_session():
        yield db_session
    return _get_session


@pytest.fixture(scope="function")
def client(override_get_session):
    """Create a test client with overridden dependencies"""
    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app) as test_client:
        yield test_client
    # Clean up dependency overrides after test
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def auth_headers(client):
    """Create authentication headers for a test user"""
    # Register a test user
    user_data = {
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpass123"
    }
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200

    # Login to get token
    login_data = {
        "username": "test@example.com",
        "password": "testpass123"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200

    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return headers


@pytest.fixture(scope="function")
def created_task(client, auth_headers):
    """Create a test task for use in tests"""
    task_data = {
        "title": "Test Task",
        "description": "Test Description"
    }
    response = client.post("/api/v1/tasks/", json=task_data, headers=auth_headers)
    assert response.status_code == 200
    return response.json()