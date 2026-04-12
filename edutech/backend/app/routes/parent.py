"""
Parent Dashboard Routes - Child Management & Progress
======================================================
Ye module parent dashboard handle karta hai:
- POST /parent/link-child     → Bachche ka account link karo
- GET  /parent/children       → Linked children ki list
- GET  /parent/child/{id}/progress → Bachche ka progress dekho
- GET  /parent/child/{id}/activity → Bachche ki recent activity
- PUT  /parent/child/{id}/limits   → Study time limits set karo
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from bson import ObjectId
from app.database import (
    get_users_collection, get_parent_child_collection,
    get_progress_collection, get_quiz_results_collection,
    get_activity_log_collection, get_courses_collection,
    get_chapters_collection
)
from app.utils.auth import get_current_user, require_parent
from app.utils.helpers import serialize_doc, get_current_timestamp, valid_object_id

router = APIRouter(prefix="/parent", tags=["Parent Dashboard"])


# ============================
# Request Models
# ============================

class LinkChildRequest(BaseModel):
    """Bachche ko link karne ka request"""
    child_email: str = Field(..., description="Bachche ka registered email")


class StudyLimitsRequest(BaseModel):
    """Study time limits set karne ka request"""
    daily_limit_minutes: int = Field(default=120, ge=30, le=480, description="Daily study limit (minutes, 30-480)")
    quiz_limit_per_day: int = Field(default=10, ge=1, le=50, description="Max quizzes per day")
    break_reminder_minutes: int = Field(default=45, ge=15, le=120, description="Break reminder after X minutes")


# ============================
# Routes
# ============================

@router.post("/link-child")
async def link_child(req: LinkChildRequest, current_user: dict = Depends(require_parent)):
    """
    Parent apne bachche ka account link kare.
    
    Steps:
    1. Child ka email se user dhundho
    2. Check karo ki child role "student" hai
    3. Check karo pehle se linked toh nahi hai
    4. Parent-Child link create karo
    """
    users = get_users_collection()
    pc_coll = get_parent_child_collection()
    
    # Step 1: Child user dhundho
    child = await users.find_one({"email": req.child_email.lower()})
    if not child:
        raise HTTPException(
            status_code=404,
            detail="Is email se koi student account nahi mila. Pehle bachche ka account register karo."
        )
    
    # Step 2: Role check
    if child.get("role") != "student":
        raise HTTPException(
            status_code=400,
            detail="Ye account student ka nahi hai. Sirf student accounts link ho sakte hain."
        )
    
    child_id = str(child["_id"])
    
    # Step 3: Already linked check
    existing = await pc_coll.find_one({
        "parent_id": current_user["user_id"],
        "child_id": child_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Ye bachcha pehle se linked hai!")
    
    # Step 4: Link create karo
    await pc_coll.insert_one({
        "parent_id": current_user["user_id"],
        "child_id": child_id,
        "child_name": child.get("name", ""),
        "child_email": req.child_email.lower(),
        "daily_limit_minutes": 120,      # Default 2 hours
        "quiz_limit_per_day": 10,        # Default 10 quizzes
        "break_reminder_minutes": 45,    # Default 45 minutes
        "linked_at": get_current_timestamp()
    })
    
    return {
        "message": f"Bachcha '{child.get('name', '')}' successfully linked!",
        "child": {
            "id": child_id,
            "name": child.get("name", ""),
            "email": req.child_email.lower(),
            "xp": child.get("xp", 0),
            "level": child.get("level", 1),
        }
    }


@router.get("/children")
async def get_children(current_user: dict = Depends(require_parent)):
    """
    Parent ke saare linked children ki list.
    Har bachche ka basic info aur stats dikhega.
    """
    users = get_users_collection()
    pc_coll = get_parent_child_collection()
    
    # Linked children dhundho
    links = await pc_coll.find({"parent_id": current_user["user_id"]}).to_list(length=20)
    
    children = []
    for link in links:
        if valid_object_id(link["child_id"]):
            child = await users.find_one({"_id": ObjectId(link["child_id"])})
            if child:
                children.append({
                    "id": str(child["_id"]),
                    "name": child.get("name", ""),
                    "email": child.get("email", ""),
                    "avatar": child.get("avatar", "🦁"),
                    "xp": child.get("xp", 0),
                    "level": child.get("level", 1),
                    "streak": child.get("streak", 0),
                    "daily_limit_minutes": link.get("daily_limit_minutes", 120),
                    "linked_at": link.get("linked_at", "")
                })
    
    return {"children": children, "total": len(children)}


@router.get("/child/{child_id}/progress")
async def get_child_progress(child_id: str, current_user: dict = Depends(require_parent)):
    """
    Bachche ka detailed course progress dekho.
    Har course mein kitne chapters complete hue wo dikhega.
    """
    if not valid_object_id(child_id):
        raise HTTPException(status_code=400, detail="Invalid child ID.")
    
    # Check karo ki ye bachcha is parent ka hai
    pc_coll = get_parent_child_collection()
    link = await pc_coll.find_one({
        "parent_id": current_user["user_id"],
        "child_id": child_id
    })
    if not link:
        raise HTTPException(status_code=403, detail="Ye bachcha tumse linked nahi hai.")
    
    # Progress data lo
    progress_coll = get_progress_collection()
    courses_coll = get_courses_collection()
    chapters_coll = get_chapters_collection()
    quiz_coll = get_quiz_results_collection()
    users = get_users_collection()
    
    # Child ka profile
    child = await users.find_one({"_id": ObjectId(child_id)})
    
    # Course-wise progress
    all_courses = await courses_coll.find().to_list(length=100)
    user_progress = await progress_coll.find(
        {"user_id": child_id, "completed": True}
    ).to_list(length=500)
    
    course_progress_map = {}
    for p in user_progress:
        cid = p["course_id"]
        if cid not in course_progress_map:
            course_progress_map[cid] = 0
        course_progress_map[cid] += 1
    
    progress_list = []
    for course in all_courses:
        cid = str(course["_id"])
        total = await chapters_coll.count_documents({"course_id": cid})
        completed = course_progress_map.get(cid, 0)
        progress_list.append({
            "course_name": course.get("title", ""),
            "subject": course.get("subject", ""),
            "completed_chapters": completed,
            "total_chapters": total,
            "percentage": round((completed / total * 100) if total > 0 else 0)
        })
    
    # Quiz stats
    total_quizzes = await quiz_coll.count_documents({"user_id": child_id, "status": "completed"})
    quiz_cursor = quiz_coll.find({"user_id": child_id, "status": "completed"}).sort("completed_at", -1).limit(5)
    recent_quizzes = await quiz_cursor.to_list(length=5)
    
    avg_score = 0
    if recent_quizzes:
        avg_score = round(sum(q.get("score", 0) for q in recent_quizzes) / len(recent_quizzes))
    
    return {
        "child": {
            "name": child.get("name", "") if child else "",
            "xp": child.get("xp", 0) if child else 0,
            "level": child.get("level", 1) if child else 1,
            "streak": child.get("streak", 0) if child else 0,
        },
        "course_progress": progress_list,
        "quiz_stats": {
            "total_quizzes": total_quizzes,
            "average_score": avg_score,
        }
    }


@router.get("/child/{child_id}/activity")
async def get_child_activity(
    child_id: str,
    limit: int = Query(20, ge=1, le=50),
    current_user: dict = Depends(require_parent)
):
    """
    Bachche ki recent activity dekho.
    Kya kya kiya - chapters padhe, quizzes diye, avatars kharide, etc.
    """
    if not valid_object_id(child_id):
        raise HTTPException(status_code=400, detail="Invalid child ID.")
    
    # Parent-child link check
    pc_coll = get_parent_child_collection()
    link = await pc_coll.find_one({
        "parent_id": current_user["user_id"],
        "child_id": child_id
    })
    if not link:
        raise HTTPException(status_code=403, detail="Ye bachcha tumse linked nahi hai.")
    
    # Activity log lo
    activity_coll = get_activity_log_collection()
    cursor = activity_coll.find({"user_id": child_id}).sort("timestamp", -1).limit(limit)
    activities = await cursor.to_list(length=limit)
    
    result = []
    for act in activities:
        result.append({
            "id": str(act["_id"]),
            "action": act.get("action", ""),
            "details": act.get("details", {}),
            "timestamp": act.get("timestamp", "")
        })
    
    return {"activities": result, "total": len(result)}


@router.put("/child/{child_id}/limits")
async def set_study_limits(
    child_id: str,
    req: StudyLimitsRequest,
    current_user: dict = Depends(require_parent)
):
    """
    Bachche ke liye study limits set karo.
    Daily time limit, quiz limit, aur break reminder.
    """
    if not valid_object_id(child_id):
        raise HTTPException(status_code=400, detail="Invalid child ID.")
    
    # Parent-child link check
    pc_coll = get_parent_child_collection()
    link = await pc_coll.find_one({
        "parent_id": current_user["user_id"],
        "child_id": child_id
    })
    if not link:
        raise HTTPException(status_code=403, detail="Ye bachcha tumse linked nahi hai.")
    
    # Limits update karo
    await pc_coll.update_one(
        {"parent_id": current_user["user_id"], "child_id": child_id},
        {"$set": {
            "daily_limit_minutes": req.daily_limit_minutes,
            "quiz_limit_per_day": req.quiz_limit_per_day,
            "break_reminder_minutes": req.break_reminder_minutes,
            "updated_at": get_current_timestamp()
        }}
    )
    
    return {
        "message": "Study limits updated!",
        "limits": {
            "daily_limit_minutes": req.daily_limit_minutes,
            "quiz_limit_per_day": req.quiz_limit_per_day,
            "break_reminder_minutes": req.break_reminder_minutes
        }
    }
