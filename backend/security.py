from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from jose import JWTError, jwt
from sqlalchemy.orm import Session

import models

from database import SessionLocal


# =====================================================
# JWT CONFIGURATION
# =====================================================

SECRET_KEY = "change_this_to_a_long_random_secret_key"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_HOURS = 24


# =====================================================
# BEARER TOKEN
# =====================================================

security = HTTPBearer()


# =====================================================
# DATABASE SESSION
# =====================================================

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# =====================================================
# CREATE ACCESS TOKEN
# =====================================================

def create_access_token(
    user_id: int
):
    expire = (
        datetime.utcnow()
        + timedelta(
            hours=ACCESS_TOKEN_EXPIRE_HOURS
        )
    )

    payload = {
        "sub": str(user_id),
        "exp": expire,
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# =====================================================
# GET CURRENT LOGGED-IN USER
# =====================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
    db: Session = Depends(
        get_db
    ),
):

    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={
            "WWW-Authenticate": "Bearer"
        },
    )

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get(
            "sub"
        )

        if user_id is None:
            raise credentials_exception

        user_id = int(
            user_id
        )

    except (
        JWTError,
        ValueError,
        TypeError,
    ):
        raise credentials_exception

    user = db.query(
        models.User
    ).filter(
        models.User.id == user_id
    ).first()

    if user is None:
        raise credentials_exception

    return user