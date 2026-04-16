"""
Authentication Routes - Register, Login, Profile
=================================================
Ye module user authentication handle karta hai:
- POST /auth/register  → Naya account banao
- POST /auth/login     → Login karke JWT token lo
- GET  /auth/me        → Apna profile dekho
- PUT  /auth/me        → Profile update karo
- PUT  /auth/password  → Password change karo
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId
from app.database import get_users_collection
from app.utils.auth import (
    hash_password, verify_password, create_access_token, get_current_user
)
from app.utils.helpers import serialize_doc, get_current_timestamp

# Router banao - saare auth routes /auth prefix ke under aayenge
router = APIRouter(prefix="/auth", tags=["Authentication"])


# ============================
# Request/Response Models
# ============================

class RegisterRequest(BaseModel):
    """Register karne ke liye ye data chahiye"""
    name: str = Field(..., min_length=2, max_length=100, description="User ka full name")
    email: str = Field(..., description="Email address (unique hona chahiye)")
    password: str = Field(..., min_length=6, description="Password (min 6 characters)")
    role: str = Field(default="student", description="Role: student, parent, or admin")
    phone: str | None = Field(None, description="Phone number (optional)")
    grade: str | None = Field(None, description="Student ki class (1-12)")
    board: str | None = Field(None, description="Board: CBSE, ICSE, State Board, etc.")


class LoginRequest(BaseModel):
    """Login karne ke liye ye data chahiye"""
    email: str = Field(..., description="Registered email address")
    password: str = Field(..., description="Account ka password")


class UpdateProfileRequest(BaseModel):
    """Profile update karne ke liye ye data (optional fields)"""
    name: str | None = Field(None, description="Naya name")
    avatar: str | None = Field(None, description="Avatar emoji/ID")
    language: str | None = Field(None, description="Preferred language: hindi/english/hinglish")
    phone: str | None = Field(None, description="Phone number")
    grade: str | None = Field(None, description="Student ki class (1-12)")
    board: str | None = Field(None, description="Board: CBSE, ICSE, State Board, etc.")


class ChangePasswordRequest(BaseModel):
    """Password change karne ke liye old + new password"""
    old_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=6, description="New password (min 6 chars)")


# ============================
# Routes
# ============================

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest):
    """
    Naya user register karo.
    
    Steps:
    1. Check karo ki email pehle se registered toh nahi hai
    2. Password ko hash karo (plain text store nahi karna)
    3. New user document banao with default values (xp=0, level=1, streak=0)
    4. MongoDB mein save karo
    5. JWT token generate karke return karo
    """
    users = get_users_collection()
    
    # Step 1: Check duplicate email
    existing = await users.find_one({"email": req.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ye email pehle se registered hai. Login karo ya doosri email use karo."
        )
    
    # Step 2: Validate role
    # Admin role sirf existing admin hi assign kar sakta hai (admin panel se)
    # Public registration mein admin role allow NAHI hai - security ke liye
    valid_roles = ["student", "parent"]
    if req.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Valid roles: {valid_roles}"
        )
    
    # Step 3: New user document banao
    new_user = {
        "name": req.name,
        "email": req.email.lower(),
        "password_hash": hash_password(req.password),  # Hash store karo, plain text NAHI
        "role": req.role,
        "avatar": "🦁",           # Default avatar
        "xp": 0,                  # Starting XP = 0
        "level": 1,               # Starting Level = 1
        "streak": 0,              # Starting Streak = 0
        "last_active_date": None,  # Streak tracking ke liye
        "language": "hindi",       # Default language
        "phone": req.phone or "",
        "grade": req.grade or "",          # Student ki class
        "board": req.board or "",          # Board (CBSE, ICSE, etc.)
        "subscription": "free",    # Free plan by default
        "created_at": get_current_timestamp(),
        "updated_at": get_current_timestamp(),
    }
    
    # Step 4: MongoDB mein insert karo
    result = await users.insert_one(new_user)
    user_id = str(result.inserted_id)
    
    # Step 5: JWT token banao aur return karo
    token = create_access_token(user_id, req.role)
    
    return {
        "message": "Registration successful! Welcome to AI Education Platform.",
        "token": token,
        "user": {
            "id": user_id,
            "name": req.name,
            "email": req.email.lower(),
            "role": req.role,
            "xp": 0,
            "level": 1,
            "streak": 0,
            "avatar": "🦁",
            "phone": req.phone or "",
            "grade": req.grade or "",
            "board": req.board or "",
        }
    }


@router.post("/login")
async def login(req: LoginRequest):
    """
    User login karo aur JWT token return karo.
    
    Steps:
    1. Email se user dhundho database mein
    2. Password verify karo stored hash se
    3. Streak update karo (agar aaj pehli baar login kiya toh)
    4. JWT token generate karke return karo
    """
    users = get_users_collection()
    
    # Step 1: Email se user dhundho
    user = await users.find_one({"email": req.email.lower()})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ya password galat hai. Dobara try karo."
        )
    
    # Step 2: Password check karo
    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ya password galat hai. Dobara try karo."
        )
    
    # Step 3: Streak update karo
    from datetime import datetime, timezone, timedelta
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    
    last_active = user.get("last_active_date")
    new_streak = user.get("streak", 0)
    
    if last_active != today:
        # Aaj pehli baar active hua
        if last_active == yesterday:
            # Kal bhi active tha → streak badha do
            new_streak += 1
        elif last_active is None or last_active != today:
            # Streak toot gaya → reset to 1
            new_streak = 1
        
        # Database update karo
        await users.update_one(
            {"_id": user["_id"]},
            {"$set": {"streak": new_streak, "last_active_date": today, "updated_at": get_current_timestamp()}}
        )
    
    # Step 4: Token banao
    user_id = str(user["_id"])
    token = create_access_token(user_id, user["role"])
    
    return {
        "message": "Login successful!",
        "token": token,
        "user": {
            "id": user_id,
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "xp": user.get("xp", 0),
            "level": user.get("level", 1),
            "streak": new_streak,
            "avatar": user.get("avatar", "🦁"),
            "subscription": user.get("subscription", "free"),
            "phone": user.get("phone", ""),
            "grade": user.get("grade", ""),
            "board": user.get("board", ""),
        }
    }


@router.get("/me")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """
    Current logged-in user ka profile return karo.
    Authorization header mein Bearer token chahiye.
    """
    users = get_users_collection()
    
    # Token se user_id nikalo aur database se poora data lo
    user = await users.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    
    return {"user": serialize_doc(user)}


@router.put("/me")
async def update_profile(req: UpdateProfileRequest, current_user: dict = Depends(get_current_user)):
    """
    User ka profile update karo (name, avatar, language, phone).
    Sirf wahi fields update hongi jo request mein bhejoge.
    """
    users = get_users_collection()
    
    # Sirf non-None values ko update karo
    update_data = {}
    if req.name is not None:
        update_data["name"] = req.name
    if req.avatar is not None:
        update_data["avatar"] = req.avatar
    if req.language is not None:
        update_data["language"] = req.language
    if req.phone is not None:
        update_data["phone"] = req.phone
    if req.grade is not None:
        update_data["grade"] = req.grade
    if req.board is not None:
        update_data["board"] = req.board
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Koi update data nahi diya. Kam se kam ek field bhejo."
        )
    
    update_data["updated_at"] = get_current_timestamp()
    
    # Database mein update karo
    await users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": update_data}
    )
    
    # Updated profile return karo
    user = await users.find_one({"_id": ObjectId(current_user["user_id"])})
    return {"message": "Profile updated successfully!", "user": serialize_doc(user)}


@router.put("/password")
async def change_password(req: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    """
    Password change karo. Old password verify hoga pehle,
    phir new password ka hash store hoga.
    """
    users = get_users_collection()
    
    # Current user ka data lo
    user = await users.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    # Old password verify karo
    if not verify_password(req.old_password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Old password galat hai."
        )
    
    # New password hash karke save karo
    new_hash = hash_password(req.new_password)
    await users.update_one(
        {"_id": user["_id"]},
        {"$set": {"password_hash": new_hash, "updated_at": get_current_timestamp()}}
    )
    
    return {"message": "Password successfully changed!"}
