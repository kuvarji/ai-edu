"""
Admin Dashboard Routes - Stats, Users, Content Management
==========================================================
Ye module admin dashboard handle karta hai:
- GET    /admin/stats           → Platform ki overall stats
- GET    /admin/users           → All users list
- PUT    /admin/users/{id}/role → User ka role change karo
- DELETE /admin/users/{id}      → User delete karo
- POST   /admin/courses         → Naya course add karo
- PUT    /admin/courses/{id}    → Course edit karo
- DELETE /admin/courses/{id}    → Course delete karo
- POST   /admin/chapters        → Naya chapter add karo
- POST   /admin/badges          → Naya badge add karo
- POST   /admin/avatars         → Naya avatar add karo
- POST   /admin/quiz-questions  → Quiz questions add karo
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from bson import ObjectId
from app.database import (
    get_users_collection, get_courses_collection, get_chapters_collection,
    get_badges_collection, get_avatars_collection, get_quiz_questions_collection,
    get_quiz_results_collection, get_progress_collection, get_activity_log_collection
)
from app.utils.auth import require_admin
from app.utils.helpers import serialize_doc, serialize_docs, get_current_timestamp, valid_object_id

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])


# ============================
# Request Models
# ============================

class CreateCourseRequest(BaseModel):
    """Naya course banane ka request"""
    title: str = Field(..., min_length=2, description="Course ka title")
    subject: str = Field(..., description="Subject (math, science, english, etc.)")
    grade: int = Field(..., ge=6, le=12, description="Class (6-12)")
    board: str = Field(default="CBSE", description="Board (CBSE, ICSE, etc.)")
    icon: str = Field(default="📚", description="Course icon emoji")
    color: str = Field(default="violet", description="Theme color")
    description: str = Field(default="", description="Course description")


class UpdateCourseRequest(BaseModel):
    """Course update karne ka request"""
    title: str | None = None
    subject: str | None = None
    grade: int | None = None
    board: str | None = None
    icon: str | None = None
    color: str | None = None
    description: str | None = None


class CreateChapterRequest(BaseModel):
    """Naya chapter banane ka request"""
    course_id: str = Field(..., description="Kis course mein add karna hai")
    title: str = Field(..., min_length=2, description="Chapter title")
    content: str = Field(default="", description="Chapter content/notes")
    video_url: str = Field(default="", description="Video lecture URL")
    order: int = Field(default=1, ge=1, description="Chapter order number")


class CreateBadgeRequest(BaseModel):
    """Naya badge banane ka request"""
    name: str = Field(..., description="Badge name")
    description: str = Field(default="", description="Badge description")
    icon: str = Field(default="🏆", description="Badge icon emoji")
    rarity: str = Field(default="common", description="Rarity: common, rare, epic, legendary")
    condition_type: str = Field(..., description="Condition: xp, streak, quizzes, chapters")
    condition_value: int = Field(..., ge=1, description="Condition value (e.g., 500 for 500 XP)")
    order: int = Field(default=1, description="Display order")


class CreateAvatarRequest(BaseModel):
    """Naya avatar banane ka request"""
    name: str = Field(..., description="Avatar name")
    emoji: str = Field(default="🦁", description="Avatar emoji")
    description: str = Field(default="", description="Avatar description")
    rarity: str = Field(default="common", description="Rarity: common, rare, epic, legendary")
    price: int = Field(default=0, ge=0, description="XP price to unlock")


class CreateQuizQuestionRequest(BaseModel):
    """Quiz question add karne ka request"""
    question: str = Field(..., description="Question text")
    options: list[str] = Field(..., min_length=4, max_length=4, description="4 options")
    correct_option: int = Field(..., ge=0, le=3, description="Correct option index (0-3)")
    subject: str = Field(..., description="Subject")
    grade: int = Field(default=10, ge=6, le=12, description="Class")
    difficulty: str = Field(default="medium", description="Difficulty: easy, medium, hard")
    explanation: str = Field(default="", description="Answer explanation")


class ChangeRoleRequest(BaseModel):
    """User ka role change karne ka request"""
    role: str = Field(..., description="New role: student, parent, admin")


# ============================
# Routes
# ============================

@router.get("/stats")
async def get_platform_stats(admin: dict = Depends(require_admin)):
    """
    Platform ki overall statistics return karo.
    Total users, courses, quizzes, revenue, etc.
    """
    users = get_users_collection()
    courses = get_courses_collection()
    quiz_coll = get_quiz_results_collection()
    progress_coll = get_progress_collection()
    
    # Counts nikalo
    total_users = await users.count_documents({})
    total_students = await users.count_documents({"role": "student"})
    total_parents = await users.count_documents({"role": "parent"})
    total_admins = await users.count_documents({"role": "admin"})
    total_courses = await courses.count_documents({})
    total_quizzes = await quiz_coll.count_documents({"status": "completed"})
    total_chapters_completed = await progress_coll.count_documents({"completed": True})
    
    # Subscription stats
    free_users = await users.count_documents({"subscription": "free"})
    pro_users = await users.count_documents({"subscription": "pro"})
    premium_users = await users.count_documents({"subscription": "premium"})
    
    # Estimated revenue (Pro = ₹299/mo, Premium = ₹599/mo)
    estimated_monthly_revenue = (pro_users * 299) + (premium_users * 599)
    
    # Recent activity count (last 24 hours)
    from datetime import datetime, timezone, timedelta
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    activity_coll = get_activity_log_collection()
    recent_activities = await activity_coll.count_documents({
        "timestamp": {"$gte": yesterday}
    })
    
    return {
        "stats": {
            "users": {
                "total": total_users,
                "students": total_students,
                "parents": total_parents,
                "admins": total_admins,
            },
            "content": {
                "total_courses": total_courses,
                "total_quizzes_taken": total_quizzes,
                "chapters_completed": total_chapters_completed,
            },
            "revenue": {
                "free_users": free_users,
                "pro_users": pro_users,
                "premium_users": premium_users,
                "estimated_monthly_revenue": estimated_monthly_revenue,
            },
            "activity": {
                "last_24h_activities": recent_activities,
            }
        }
    }


@router.get("/users")
async def list_users(
    role: str | None = Query(None, description="Filter by role"),
    search: str | None = Query(None, description="Search by name or email"),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    admin: dict = Depends(require_admin)
):
    """
    Saare users ki list return karo.
    Optional filters: role, search (name/email).
    Pagination supported: skip aur limit.
    """
    users = get_users_collection()
    
    query = {}
    if role:
        query["role"] = role
    if search:
        # Name ya email mein search karo (case-insensitive)
        # re.escape se special regex characters sanitize karo (ReDoS prevention)
        import re
        escaped_search = re.escape(search)
        query["$or"] = [
            {"name": {"$regex": escaped_search, "$options": "i"}},
            {"email": {"$regex": escaped_search, "$options": "i"}}
        ]
    
    total = await users.count_documents(query)
    cursor = users.find(
        query,
        {"password_hash": 0}  # Password hash mat bhejo
    ).sort("created_at", -1).skip(skip).limit(limit)
    
    user_list = await cursor.to_list(length=limit)
    
    return {
        "users": serialize_docs(user_list),
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.put("/users/{user_id}/role")
async def change_user_role(user_id: str, req: ChangeRoleRequest, admin: dict = Depends(require_admin)):
    """User ka role change karo (student/parent/admin)."""
    if not valid_object_id(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID.")
    
    valid_roles = ["student", "parent", "admin"]
    if req.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Valid: {valid_roles}")
    
    users = get_users_collection()
    result = await users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": req.role, "updated_at": get_current_timestamp()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found.")
    
    return {"message": f"User role changed to '{req.role}'."}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(require_admin)):
    """User ka account delete karo. Warning: Ye permanent hai!"""
    if not valid_object_id(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID.")
    
    # Admin apna account delete nahi kar sakta
    if user_id == admin["user_id"]:
        raise HTTPException(status_code=400, detail="Tum apna khud ka account delete nahi kar sakte!")
    
    users = get_users_collection()
    result = await users.delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found.")
    
    return {"message": "User deleted successfully."}


@router.post("/courses", status_code=201)
async def create_course(req: CreateCourseRequest, admin: dict = Depends(require_admin)):
    """Naya course create karo."""
    courses = get_courses_collection()
    
    course_doc = {
        "title": req.title,
        "subject": req.subject.lower(),
        "grade": req.grade,
        "board": req.board.upper(),
        "icon": req.icon,
        "color": req.color,
        "description": req.description,
        "created_at": get_current_timestamp(),
        "updated_at": get_current_timestamp()
    }
    
    result = await courses.insert_one(course_doc)
    
    return {
        "message": f"Course '{req.title}' created!",
        "course_id": str(result.inserted_id)
    }


@router.put("/courses/{course_id}")
async def update_course(course_id: str, req: UpdateCourseRequest, admin: dict = Depends(require_admin)):
    """Existing course update karo."""
    if not valid_object_id(course_id):
        raise HTTPException(status_code=400, detail="Invalid course ID.")
    
    courses = get_courses_collection()
    
    update_data = {}
    if req.title is not None:
        update_data["title"] = req.title
    if req.subject is not None:
        update_data["subject"] = req.subject.lower()
    if req.grade is not None:
        update_data["grade"] = req.grade
    if req.board is not None:
        update_data["board"] = req.board.upper()
    if req.icon is not None:
        update_data["icon"] = req.icon
    if req.color is not None:
        update_data["color"] = req.color
    if req.description is not None:
        update_data["description"] = req.description
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Koi update data nahi diya.")
    
    update_data["updated_at"] = get_current_timestamp()
    
    result = await courses.update_one(
        {"_id": ObjectId(course_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course not found.")
    
    return {"message": "Course updated!"}


@router.delete("/courses/{course_id}")
async def delete_course(course_id: str, admin: dict = Depends(require_admin)):
    """Course delete karo. Related chapters bhi delete honge."""
    if not valid_object_id(course_id):
        raise HTTPException(status_code=400, detail="Invalid course ID.")
    
    courses = get_courses_collection()
    chapters = get_chapters_collection()
    
    # Course delete karo
    result = await courses.delete_one({"_id": ObjectId(course_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course not found.")
    
    # Related chapters bhi delete karo
    deleted_chapters = await chapters.delete_many({"course_id": course_id})
    
    return {
        "message": f"Course deleted. {deleted_chapters.deleted_count} chapters bhi delete hue."
    }


@router.post("/chapters", status_code=201)
async def create_chapter(req: CreateChapterRequest, admin: dict = Depends(require_admin)):
    """Course mein naya chapter add karo."""
    if not valid_object_id(req.course_id):
        raise HTTPException(status_code=400, detail="Invalid course ID.")
    
    # Course exists check
    courses = get_courses_collection()
    course = await courses.find_one({"_id": ObjectId(req.course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
    
    chapters = get_chapters_collection()
    chapter_doc = {
        "course_id": req.course_id,
        "title": req.title,
        "content": req.content,
        "video_url": req.video_url,
        "order": req.order,
        "created_at": get_current_timestamp()
    }
    
    result = await chapters.insert_one(chapter_doc)
    
    return {
        "message": f"Chapter '{req.title}' added to course!",
        "chapter_id": str(result.inserted_id)
    }


@router.post("/badges", status_code=201)
async def create_badge(req: CreateBadgeRequest, admin: dict = Depends(require_admin)):
    """Naya badge/achievement create karo."""
    badges = get_badges_collection()
    
    badge_doc = {
        "name": req.name,
        "description": req.description,
        "icon": req.icon,
        "rarity": req.rarity,
        "condition_type": req.condition_type,
        "condition_value": req.condition_value,
        "order": req.order,
        "created_at": get_current_timestamp()
    }
    
    result = await badges.insert_one(badge_doc)
    
    return {
        "message": f"Badge '{req.name}' created!",
        "badge_id": str(result.inserted_id)
    }


@router.post("/avatars", status_code=201)
async def create_avatar(req: CreateAvatarRequest, admin: dict = Depends(require_admin)):
    """Avatar store mein naya avatar add karo."""
    avatars = get_avatars_collection()
    
    avatar_doc = {
        "name": req.name,
        "emoji": req.emoji,
        "description": req.description,
        "rarity": req.rarity,
        "price": req.price,
        "created_at": get_current_timestamp()
    }
    
    result = await avatars.insert_one(avatar_doc)
    
    return {
        "message": f"Avatar '{req.name}' created!",
        "avatar_id": str(result.inserted_id)
    }


@router.post("/quiz-questions", status_code=201)
async def add_quiz_questions(
    questions: list[CreateQuizQuestionRequest],
    admin: dict = Depends(require_admin)
):
    """
    Quiz questions bank mein add karo.
    Multiple questions ek saath add kar sakte ho (bulk insert).
    """
    quiz_coll = get_quiz_questions_collection()
    
    docs = []
    for q in questions:
        docs.append({
            "question": q.question,
            "options": q.options,
            "correct_option": q.correct_option,
            "subject": q.subject.lower(),
            "grade": q.grade,
            "difficulty": q.difficulty.lower(),
            "explanation": q.explanation,
            "created_at": get_current_timestamp()
        })
    
    # Empty list check - insert_many empty list par crash hota hai
    if not docs:
        raise HTTPException(status_code=400, detail="Kam se kam ek question bhejo.")
    
    result = await quiz_coll.insert_many(docs)
    
    return {
        "message": f"{len(result.inserted_ids)} questions added to quiz bank!",
        "count": len(result.inserted_ids)
    }
