from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from config import settings
from models import User, RefreshToken
from sqlmodel import Session, select
from db import get_session


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except:
        return False


def get_password_hash(password: str) -> str:
    # Password ko bytes mein convert kar ke hash karein
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    # Database mein save karne ke liye string mein wapas layein
    return hashed_password.decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


def get_user_id_from_token(token: str) -> Optional[int]:
    payload = verify_access_token(token)
    if payload:
        user_id = payload.get("sub")
        if user_id:
            return int(user_id)
    return None


def authenticate_user(user: User, password: str) -> bool:
    # Dono ko bytes mein convert kar ke check karein
    return bcrypt.checkpw(
        password.encode('utf-8'),
        user.hashed_password.encode('utf-8')
    )


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a refresh token with a longer expiration time."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=7))  # 7 days for refresh token
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def store_refresh_token(db: Session, token: str, user_id: int, expires_at: datetime) -> 'RefreshToken':
    """Store a refresh token using the existing database session."""

    db_token = RefreshToken(
        token=token,
        user_id=user_id,
        expires_at=expires_at
    )
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token


def get_refresh_token(db: Session, token: str) -> Optional[RefreshToken]:
    """
    Retrieve a refresh token from the database using an existing session.
    """
    statement = select(RefreshToken).where(
        RefreshToken.token == token,
        RefreshToken.is_active == True,
        RefreshToken.expires_at > datetime.utcnow()
    )
    return db.exec(statement).first()


def revoke_refresh_token(token: str) -> bool:
    """Revoke a refresh token by setting it as inactive."""
    from models import RefreshToken
    session_gen = get_session()
    session = next(session_gen)
    try:
        db_token = get_refresh_token(token)
        if db_token:
            db_token.is_active = False
            session.add(db_token)
            session.commit()
            return True
        return False
    finally:
        session.close()


def create_tokens(db: Session, user_id: int) -> tuple[str, str]:
    """Create both access and refresh tokens for a user."""
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user_id)},
        expires_delta=access_token_expires
    )

    refresh_token_expires = timedelta(days=7)
    refresh_token_string = create_refresh_token(
        data={"sub": str(user_id)},
        expires_delta=refresh_token_expires
    )
    refresh_token_expires_datetime = datetime.utcnow() + refresh_token_expires

    # Store the refresh token using the session we passed in
    store_refresh_token(
        db=db,
        token=refresh_token_string,
        user_id=user_id,
        expires_at=refresh_token_expires_datetime
    )

    return access_token, refresh_token_string