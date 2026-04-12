"""
Authentication Utility Module - JWT Token aur Password Hashing
==============================================================
Ye module JWT tokens create/verify karta hai aur passwords ko
securely hash karta hai bcrypt se.
"""

import os
import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

# JWT Secret key - .env file se aayegi, default for development
JWT_SECRET = os.getenv("JWT_SECRET", "ai-edu-super-secret-key-change-in-production")

# JWT token kitne time tak valid rahega (hours mein)
JWT_EXPIRY_HOURS = 24

# JWT Algorithm
JWT_ALGORITHM = "HS256"

# Bearer token scheme for FastAPI dependency injection
security = HTTPBearer()


def hash_password(password: str) -> str:
    """
    Password ko bcrypt se hash karo.
    Plain text password kabhi store nahi karna - hamesha hash store karo.
    
    Args:
        password: User ka plain text password
    Returns:
        Hashed password string
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    User ka diya password check karo hashed password se.
    Login ke time use hota hai.
    
    Args:
        plain_password: User ne jo password dala
        hashed_password: Database mein stored hash
    Returns:
        True agar password sahi hai, False agar galat
    """
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


def create_access_token(user_id: str, role: str) -> str:
    """
    JWT access token banao user ke liye.
    Token mein user_id aur role hota hai.
    
    Args:
        user_id: MongoDB ObjectId as string
        role: User ka role (student/parent/admin)
    Returns:
        JWT token string
    """
    # Token expiry time set karo
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS)
    
    # Token payload - ye data token ke andar encrypted hoga
    payload = {
        "user_id": user_id,      # Kaun hai ye user
        "role": role,             # Kya role hai (student/parent/admin)
        "exp": expire,            # Kab expire hoga
        "iat": datetime.now(timezone.utc)  # Kab bana ye token
    }
    
    # Token encode karke return karo
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def decode_access_token(token: str) -> dict:
    """
    JWT token ko decode karke user info nikalo.
    Agar token invalid ya expired hai toh error throw hoga.
    
    Args:
        token: JWT token string
    Returns:
        Decoded payload dict with user_id and role
    Raises:
        HTTPException: Agar token expired ya invalid hai
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        # Token ka time khatam ho gaya
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired. Please login again."
        )
    except jwt.InvalidTokenError:
        # Token galat hai ya tampered hai
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token. Please login again."
        )


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    FastAPI Dependency - Current logged-in user ko identify karo.
    Ye function route mein Depends() se use hota hai.
    
    Usage in route:
        @router.get("/profile")
        async def profile(user: dict = Depends(get_current_user)):
            # user["user_id"] se user ka data nikalo
    
    Args:
        credentials: Bearer token from Authorization header
    Returns:
        Decoded user payload (user_id, role)
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    return payload


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """
    Admin-only routes ke liye dependency.
    Agar user admin nahi hai toh 403 Forbidden error milega.
    
    Args:
        user: Current user payload from JWT
    Returns:
        User payload agar admin hai
    Raises:
        HTTPException: Agar user admin nahi hai
    """
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required. Tumhara role admin nahi hai."
        )
    return user


async def require_parent(user: dict = Depends(get_current_user)) -> dict:
    """
    Parent-only routes ke liye dependency.
    Agar user parent nahi hai toh 403 Forbidden error milega.
    
    Args:
        user: Current user payload from JWT
    Returns:
        User payload agar parent hai
    Raises:
        HTTPException: Agar user parent nahi hai
    """
    if user.get("role") != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Parent access required. Tumhara role parent nahi hai."
        )
    return user
