from datetime import datetime, timedelta
from jose import jwt
import bcrypt
from config import settings
from models import User
from typing import Optional

def authenticate_user(user: User, password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), user.hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
