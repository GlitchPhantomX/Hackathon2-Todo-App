"""
Test suite for authentication flow with token expiration.

This module tests the JWT token refresh mechanism and expiration handling.
"""
import pytest
import time
from datetime import datetime, timedelta
from jose import jwt
from fastapi.testclient import TestClient

from main import app
from config import settings
from utils.auth_utils import create_access_token, create_refresh_token, create_tokens, get_refresh_token
from models import User, RefreshToken
from db import get_session
from sqlmodel import Session, select


def test_jwt_token_expiration():
    """Test that access tokens expire as expected."""
    # Create a token that expires in 1 second
    expires_delta = timedelta(seconds=1)
    token = create_access_token(
        data={"sub": "123"},
        expires_delta=expires_delta
    )

    # Wait for token to expire
    time.sleep(2)

    # Verify that the token is now expired
    from utils.auth_utils import verify_access_token
    payload = verify_access_token(token)
    assert payload is None, "Token should be expired and invalid"


def test_token_refresh_flow():
    """Test the complete token refresh flow."""
    client = TestClient(app)

    # First, register a test user
    response = client.post(f"{settings.API_V1_PREFIX}/auth/register", json={
        "email": "test@example.com",
        "name": "testuser",
        "password": "TestPassword123!"
    })
    assert response.status_code == 200
    user_data = response.json()
    user_id = user_data["id"]

    # Login to get tokens
    response = client.post(f"{settings.API_V1_PREFIX}/auth/login", data={
        "username": "test@example.com",
        "password": "TestPassword123!"
    })
    assert response.status_code == 200
    tokens = response.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    access_token = tokens["access_token"]
    refresh_token = tokens["refresh_token"]

    # Test that the access token works for protected endpoints
    response = client.get(
        f"{settings.API_V1_PREFIX}/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200

    # Test refresh endpoint
    response = client.post(f"{settings.API_V1_PREFIX}/auth/refresh", data={
        "refresh_token": refresh_token
    })
    assert response.status_code == 200
    new_tokens = response.json()
    assert "access_token" in new_tokens
    assert new_tokens["access_token"] != access_token  # New token should be different

    # Test that old refresh token is no longer valid (if single-use)
    # Note: Our implementation allows reuse until revoked, so this might still work
    # depending on the refresh token implementation

    # Cleanup: delete the test user
    with next(get_session()) as session:
        # Delete user
        user = session.get(User, user_id)
        if user:
            session.delete(user)
            session.commit()


def test_expired_refresh_token():
    """Test that expired refresh tokens are handled properly."""
    # Create a refresh token that expires immediately
    expires_delta = timedelta(seconds=1)
    refresh_token = create_refresh_token(
        data={"sub": "123"},
        expires_delta=expires_delta
    )

    # Wait for token to expire
    time.sleep(2)

    # Try to use the expired refresh token
    client = TestClient(app)
    response = client.post(f"{settings.API_V1_PREFIX}/auth/refresh", data={
        "refresh_token": refresh_token
    })

    # Should return 401 Unauthorized
    assert response.status_code == 401


def test_logout_revokes_refresh_token():
    """Test that logout properly revokes the refresh token."""
    client = TestClient(app)

    # Register and login
    client.post(f"{settings.API_V1_PREFIX}/auth/register", json={
        "email": "logout_test@example.com",
        "name": "logoutuser",
        "password": "TestPassword123!"
    })

    response = client.post(f"{settings.API_V1_PREFIX}/auth/login", data={
        "username": "logout_test@example.com",
        "password": "TestPassword123!"
    })
    assert response.status_code == 200
    tokens = response.json()
    refresh_token = tokens["refresh_token"]

    # Logout with the refresh token
    response = client.post(f"{settings.API_V1_PREFIX}/auth/logout", json={
        "refresh_token": refresh_token
    })
    assert response.status_code == 200

    # Try to refresh with the same token (should fail)
    response = client.post(f"{settings.API_V1_PREFIX}/auth/refresh", data={
        "refresh_token": refresh_token
    })
    assert response.status_code == 401

    # Cleanup
    with next(get_session()) as session:
        user = session.exec(select(User).where(User.email == "logout_test@example.com")).first()
        if user:
            session.delete(user)
            session.commit()


def test_short_lived_access_token():
    """Test behavior with short-lived access tokens using manual token creation."""
    from datetime import timedelta
    from utils.auth_utils import create_access_token

    client = TestClient(app)

    # Register and login
    client.post(f"{settings.API_V1_PREFIX}/auth/register", json={
        "email": "short_token_test@example.com",
        "name": "shortuser",
        "password": "TestPassword123!"
    })

    response = client.post(f"{settings.API_V1_PREFIX}/auth/login", data={
        "username": "short_token_test@example.com",
        "password": "TestPassword123!"
    })
    assert response.status_code == 200
    tokens = response.json()
    refresh_token = tokens["refresh_token"]

    # Create an access token that expires in 1 second
    short_lived_token = create_access_token(
        data={"sub": "123"},
        expires_delta=timedelta(seconds=1)
    )

    # Access token should work initially
    response = client.get(
        f"{settings.API_V1_PREFIX}/auth/me",
        headers={"Authorization": f"Bearer {short_lived_token}"}
    )
    assert response.status_code == 200

    # Wait for access token to expire
    time.sleep(2)  # Sleep for more than 1 second

    # Access token should now be invalid
    response = client.get(
        f"{settings.API_V1_PREFIX}/auth/me",
        headers={"Authorization": f"Bearer {short_lived_token}"}
    )
    assert response.status_code == 403  # Forbidden due to invalid token

    # Should be able to refresh to get a new access token
    response = client.post(f"{settings.API_V1_PREFIX}/auth/refresh", data={
        "refresh_token": refresh_token
    })
    assert response.status_code == 200
    new_tokens = response.json()
    assert "access_token" in new_tokens

    # New access token should work
    response = client.get(
        f"{settings.API_V1_PREFIX}/auth/me",
        headers={"Authorization": f"Bearer {new_tokens['access_token']}"}
    )
    assert response.status_code == 200

    # Cleanup
    with next(get_session()) as session:
        user = session.exec(select(User).where(User.email == "short_token_test@example.com")).first()
        if user:
            session.delete(user)
            session.commit()


if __name__ == "__main__":
    # Run the tests
    test_jwt_token_expiration()
    print("PASSED: JWT token expiration test passed")

    test_token_refresh_flow()
    print("PASSED: Token refresh flow test passed")

    test_expired_refresh_token()
    print("PASSED: Expired refresh token test passed")

    test_logout_revokes_refresh_token()
    print("PASSED: Logout revokes refresh token test passed")

    test_short_lived_access_token()
    print("PASSED: Short-lived access token test passed")

    print("\nALL AUTHENTICATION FLOW TESTS PASSED!")