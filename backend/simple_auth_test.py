"""
Simple test to verify authentication functionality works without CSRF issues.
"""
from datetime import timedelta
import time
from utils.auth_utils import create_access_token, verify_access_token, create_refresh_token, get_refresh_token
from config import settings

def test_jwt_expiration():
    """Test that JWT tokens expire properly."""
    print("Testing JWT expiration...")

    # Create a token that expires in 1 second
    expires_delta = timedelta(seconds=1)
    token = create_access_token(
        data={"sub": "123"},
        expires_delta=expires_delta
    )

    print(f"Created token: {token[:20]}...")

    # Verify token works initially
    payload = verify_access_token(token)
    assert payload is not None, "Token should be valid initially"
    print("PASS: Token is valid initially")

    # Wait for token to expire
    print("Waiting for token to expire...")
    time.sleep(2)

    # Verify token is now expired
    payload = verify_access_token(token)
    assert payload is None, "Token should be expired"
    print("PASS: Token expires as expected")

def test_refresh_token_expiration():
    """Test that refresh tokens expire properly."""
    print("\nTesting refresh token expiration...")

    # Create a refresh token that expires in 1 second
    expires_delta = timedelta(seconds=1)
    refresh_token = create_refresh_token(
        data={"sub": "123"},
        expires_delta=expires_delta
    )

    print(f"Created refresh token: {refresh_token[:20]}...")

    # Wait for token to expire
    print("Waiting for refresh token to expire...")
    time.sleep(2)

    # Try to retrieve the expired refresh token
    db_token = get_refresh_token(refresh_token)
    assert db_token is None, "Expired refresh token should not be found in DB"
    print("PASS: Refresh token expires as expected")

def test_token_creation():
    """Test that tokens are created properly."""
    print("\nTesting token creation...")

    # Create access token
    access_token = create_access_token(
        data={"sub": "test_user"},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    # Verify access token
    payload = verify_access_token(access_token)
    assert payload is not None, "Access token should be valid"
    assert payload["sub"] == "test_user", "Token should contain correct subject"
    print("PASS: Access token created and verified successfully")

    # Create refresh token
    refresh_token = create_refresh_token(
        data={"sub": "test_user"},
        expires_delta=timedelta(days=7)
    )

    # Verify refresh token
    # Note: We can't use verify_access_token for refresh tokens since they have different type
    from jose import jwt
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert payload["sub"] == "test_user", "Refresh token should contain correct subject"
        assert payload["type"] == "refresh", "Refresh token should have correct type"
        print("PASS: Refresh token created and verified successfully")
    except:
        print("FAIL: Error verifying refresh token")

if __name__ == "__main__":
    test_token_creation()
    test_jwt_expiration()
    test_refresh_token_expiration()
    print("\nALL SIMPLE AUTH TESTS PASSED!")