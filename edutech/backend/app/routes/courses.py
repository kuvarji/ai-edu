"""
Course Management Routes - Courses, Chapters, Progress
=======================================================
Ye module courses aur chapters manage karta hai:
- GET  /courses/           → Saare courses ki list
- GET  /courses/{id}       → Ek course ka detail
- GET  /courses/{id}/chapters → Course ke saare chapters
- POST /courses/progress   → Chapter complete mark karo
- GET  /courses/progress/me → Apna poora progress dekho
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from pydantic import BaseModel, Field
from bson import ObjectId
from app.database import (
    get_courses_collection, get_chapters_collection, get_progress_collection,
    get_users_collection, get_activity_log_collection
)
from app.utils.auth import get_current_user
from app.utils.helpers import serialize_doc, serialize_docs, get_current_timestamp, valid_object_id

# Router banao - /courses prefix ke under
router = APIRouter(prefix="/courses", tags=["Courses"])


# ============================
# Request/Response Models
# ============================

class MarkProgressRequest(BaseModel):
    """Chapter complete mark karne ka request"""
    course_id: str = Field(..., description="Course ka ID")
    chapter_id: str = Field(..., description="Chapter ka ID jo complete hua")


# ============================
# Routes
# ============================

@router.get("/")
async def list_courses(
    grade: int | None = Query(None, description="Class filter (6-12)"),
    subject: str | None = Query(None, description="Subject filter (math, science, etc.)"),
    board: str | None = Query(None, description="Board filter (CBSE, ICSE, etc.)")
):
    """
    Saare courses ki list return karo.
    Optional filters: grade, subject, board.
    
    Example: GET /courses/?grade=10&subject=math
    """
    courses = get_courses_collection()
    
    # Filter query banao based on optional parameters
    query = {}
    if grade is not None:
        query["grade"] = grade
    if subject is not None:
        query["subject"] = subject.lower()
    if board is not None:
        query["board"] = board.upper()
    
    # Courses fetch karo
    cursor = courses.find(query).sort("grade", 1)
    course_list = await cursor.to_list(length=100)
    
    return {"courses": serialize_docs(course_list), "total": len(course_list)}


@router.get("/{course_id}")
async def get_course_detail(course_id: str):
    """
    Ek specific course ka detail return karo.
    Course ID dena padega URL mein.
    """
    if not valid_object_id(course_id):
        raise HTTPException(status_code=400, detail="Invalid course ID format.")
    
    courses = get_courses_collection()
    course = await courses.find_one({"_id": ObjectId(course_id)})
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
    
    # Total chapters count bhi nikalo
    chapters = get_chapters_collection()
    total_chapters = await chapters.count_documents({"course_id": course_id})
    
    course_data = serialize_doc(course)
    course_data["total_chapters"] = total_chapters
    
    return {"course": course_data}


@router.get("/{course_id}/chapters")
async def get_course_chapters(
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Course ke saare chapters return karo with user ka progress.
    Har chapter ke saath batayenge ki complete hua ya nahi.
    """
    if not valid_object_id(course_id):
        raise HTTPException(status_code=400, detail="Invalid course ID format.")
    
    # Course exists check karo
    courses = get_courses_collection()
    course = await courses.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
    
    # Chapters fetch karo (order ke hisab se sorted)
    chapters_coll = get_chapters_collection()
    cursor = chapters_coll.find({"course_id": course_id}).sort("order", 1)
    chapter_list = await cursor.to_list(length=100)
    
    # User ka progress nikalo is course ke liye
    progress_coll = get_progress_collection()
    user_progress = await progress_coll.find(
        {"user_id": current_user["user_id"], "course_id": course_id}
    ).to_list(length=100)
    
    # Set banao completed chapter IDs ka for quick lookup
    completed_ids = {p["chapter_id"] for p in user_progress if p.get("completed")}
    
    # Chapters mein completion status add karo
    result = []
    for ch in chapter_list:
        ch_data = serialize_doc(ch)
        ch_data["is_completed"] = ch_data["id"] in completed_ids
        result.append(ch_data)
    
    completed_count = len(completed_ids)
    total = len(chapter_list)
    progress_percent = round((completed_count / total * 100) if total > 0 else 0)
    
    return {
        "course": serialize_doc(course) if course.get("_id") else {"id": course_id},
        "chapters": result,
        "progress": {
            "completed": completed_count,
            "total": total,
            "percentage": progress_percent
        }
    }


@router.post("/progress")
async def mark_chapter_complete(
    req: MarkProgressRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Chapter ko complete mark karo.
    User ko XP milega chapter complete karne par (+50 XP).
    
    Steps:
    1. Check karo chapter valid hai ya nahi
    2. Check karo pehle se complete toh nahi hai
    3. Progress record save karo
    4. User ko +50 XP do
    5. Activity log mein entry daalo
    """
    if not valid_object_id(req.course_id) or not valid_object_id(req.chapter_id):
        raise HTTPException(status_code=400, detail="Invalid course or chapter ID.")
    
    # Chapter exists check
    chapters = get_chapters_collection()
    chapter = await chapters.find_one({"_id": ObjectId(req.chapter_id), "course_id": req.course_id})
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found in this course.")
    
    # Already completed check
    progress_coll = get_progress_collection()
    existing = await progress_coll.find_one({
        "user_id": current_user["user_id"],
        "course_id": req.course_id,
        "chapter_id": req.chapter_id
    })
    
    if existing and existing.get("completed"):
        return {"message": "Ye chapter pehle se complete hai!", "xp_earned": 0}
    
    # Progress save karo
    progress_doc = {
        "user_id": current_user["user_id"],
        "course_id": req.course_id,
        "chapter_id": req.chapter_id,
        "completed": True,
        "completed_at": get_current_timestamp()
    }
    
    if existing:
        await progress_coll.update_one(
            {"_id": existing["_id"]},
            {"$set": {"completed": True, "completed_at": get_current_timestamp()}}
        )
    else:
        await progress_coll.insert_one(progress_doc)
    
    # User ko +50 XP do
    xp_reward = 50
    users = get_users_collection()
    user = await users.find_one({"_id": ObjectId(current_user["user_id"])})
    new_xp = user.get("xp", 0) + xp_reward
    new_level = (new_xp // 500) + 1
    
    await users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": {"xp": new_xp, "level": new_level, "updated_at": get_current_timestamp()}}
    )
    
    # Activity log mein daalo
    activity = get_activity_log_collection()
    await activity.insert_one({
        "user_id": current_user["user_id"],
        "action": "chapter_completed",
        "details": {
            "course_id": req.course_id,
            "chapter_id": req.chapter_id,
            "chapter_title": chapter.get("title", ""),
            "xp_earned": xp_reward
        },
        "timestamp": get_current_timestamp()
    })
    
    return {
        "message": f"Chapter complete! +{xp_reward} XP earned!",
        "xp_earned": xp_reward,
        "total_xp": new_xp,
        "level": new_level
    }


@router.get("/progress/me")
async def get_my_progress(current_user: dict = Depends(get_current_user)):
    """
    Current user ka saare courses ka progress return karo.
    Har course ke liye kitne chapters complete hue wo dikhayega.
    """
    progress_coll = get_progress_collection()
    courses_coll = get_courses_collection()
    chapters_coll = get_chapters_collection()
    
    # Saare courses lo
    all_courses = await courses_coll.find().to_list(length=100)
    
    # User ka saara progress lo
    user_progress = await progress_coll.find(
        {"user_id": current_user["user_id"], "completed": True}
    ).to_list(length=500)
    
    # Course-wise progress count
    course_progress = {}
    for p in user_progress:
        cid = p["course_id"]
        if cid not in course_progress:
            course_progress[cid] = 0
        course_progress[cid] += 1
    
    # Result banao
    result = []
    for course in all_courses:
        cid = str(course["_id"])
        total_chapters = await chapters_coll.count_documents({"course_id": cid})
        completed = course_progress.get(cid, 0)
        
        result.append({
            "course": serialize_doc(course),
            "completed_chapters": completed,
            "total_chapters": total_chapters,
            "progress_percentage": round((completed / total_chapters * 100) if total_chapters > 0 else 0)
        })
    
    return {"progress": result}
