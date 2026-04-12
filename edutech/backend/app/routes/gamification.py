"""
Gamification Routes - XP, Streak, Badges, Leaderboard
======================================================
Ye module gamification system handle karta hai:
- GET  /gamification/stats       → User ki XP, level, streak stats
- GET  /gamification/leaderboard → Top students ki ranking
- GET  /gamification/badges      → Available badges ki list
- GET  /gamification/my-badges   → User ke earned badges
- POST /gamification/check-badges → Naye badges check karo aur award karo
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from app.database import (
    get_users_collection, get_badges_collection,
    get_user_badges_collection, get_quiz_results_collection,
    get_progress_collection, get_notifications_collection
)
from app.utils.auth import get_current_user
from app.utils.helpers import serialize_doc, serialize_docs, get_current_timestamp, valid_object_id

router = APIRouter(prefix="/gamification", tags=["Gamification"])


# ============================
# Routes
# ============================

@router.get("/stats")
async def get_gamification_stats(current_user: dict = Depends(get_current_user)):
    """
    User ki gamification stats return karo.
    XP, level, streak, total quizzes, total chapters completed.
    """
    users = get_users_collection()
    user = await users.find_one({"_id": ObjectId(current_user["user_id"])})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    # Quiz count nikalo
    quiz_coll = get_quiz_results_collection()
    total_quizzes = await quiz_coll.count_documents({
        "user_id": current_user["user_id"],
        "status": "completed"
    })
    
    # Completed chapters count
    progress_coll = get_progress_collection()
    completed_chapters = await progress_coll.count_documents({
        "user_id": current_user["user_id"],
        "completed": True
    })
    
    # Earned badges count
    user_badges_coll = get_user_badges_collection()
    earned_badges = await user_badges_coll.count_documents({
        "user_id": current_user["user_id"]
    })
    
    # XP for next level calculate karo
    current_xp = user.get("xp", 0)
    xp_for_next = 500 - (current_xp % 500)
    xp_progress = (current_xp % 500) / 500 * 100  # Percentage to next level
    
    return {
        "stats": {
            "xp": current_xp,
            "level": user.get("level", 1),
            "streak": user.get("streak", 0),
            "xp_for_next_level": xp_for_next,
            "xp_progress_percent": round(xp_progress),
            "total_quizzes_taken": total_quizzes,
            "chapters_completed": completed_chapters,
            "badges_earned": earned_badges,
            "avatar": user.get("avatar", "🦁"),
            "name": user.get("name", "Student"),
        }
    }


@router.get("/leaderboard")
async def get_leaderboard(
    limit: int = Query(20, ge=1, le=100, description="Top kitne students dikhane hain"),
    current_user: dict = Depends(get_current_user)
):
    """
    Top students ki leaderboard return karo.
    XP ke hisab se sorted, highest XP pehle.
    Current user ka rank bhi batayega.
    """
    users = get_users_collection()
    
    # Top students nikalo (sirf students, admin/parent nahi)
    cursor = users.find(
        {"role": "student"},
        {"name": 1, "xp": 1, "level": 1, "streak": 1, "avatar": 1}
    ).sort("xp", -1).limit(limit)
    
    top_students = await cursor.to_list(length=limit)
    
    # Leaderboard format mein convert karo
    leaderboard = []
    for i, student in enumerate(top_students):
        leaderboard.append({
            "rank": i + 1,
            "id": str(student["_id"]),
            "name": student.get("name", "Student"),
            "xp": student.get("xp", 0),
            "level": student.get("level", 1),
            "streak": student.get("streak", 0),
            "avatar": student.get("avatar", "🦁"),
        })
    
    # Current user ka rank nikalo
    user = await users.find_one({"_id": ObjectId(current_user["user_id"])})
    user_xp = user.get("xp", 0) if user else 0
    
    # Kitne students ke paas zyada XP hai = rank
    higher_count = await users.count_documents({
        "role": "student",
        "xp": {"$gt": user_xp}
    })
    my_rank = higher_count + 1
    
    return {
        "leaderboard": leaderboard,
        "my_rank": my_rank,
        "total_students": await users.count_documents({"role": "student"})
    }


@router.get("/badges")
async def get_all_badges():
    """
    Saare available badges ki list return karo.
    Har badge ka name, description, icon, aur unlock condition dikhega.
    """
    badges_coll = get_badges_collection()
    cursor = badges_coll.find().sort("order", 1)
    badges = await cursor.to_list(length=100)
    
    return {"badges": serialize_docs(badges), "total": len(badges)}


@router.get("/my-badges")
async def get_my_badges(current_user: dict = Depends(get_current_user)):
    """
    Current user ke earned badges return karo.
    Saare badges dikhenge - earned wale highlighted, baaki locked.
    """
    badges_coll = get_badges_collection()
    user_badges_coll = get_user_badges_collection()
    
    # Saare badges lo
    all_badges = await badges_coll.find().sort("order", 1).to_list(length=100)
    
    # User ke earned badges ka set banao
    earned = await user_badges_coll.find(
        {"user_id": current_user["user_id"]}
    ).to_list(length=100)
    earned_ids = {e["badge_id"] for e in earned}
    earned_dates = {e["badge_id"]: e.get("earned_at", "") for e in earned}
    
    # Result banao - har badge ke saath earned status
    result = []
    for badge in all_badges:
        bid = str(badge["_id"])
        result.append({
            "id": bid,
            "name": badge.get("name", ""),
            "description": badge.get("description", ""),
            "icon": badge.get("icon", "🏆"),
            "rarity": badge.get("rarity", "common"),
            "condition": badge.get("condition", ""),
            "earned": bid in earned_ids,
            "earned_at": earned_dates.get(bid, None)
        })
    
    return {
        "badges": result,
        "earned_count": len(earned_ids),
        "total": len(all_badges)
    }


@router.post("/check-badges")
async def check_and_award_badges(current_user: dict = Depends(get_current_user)):
    """
    User ke liye naye badges check karo aur award karo.
    Ye function user ki activity ke basis par decide karta hai
    ki koi naya badge mila ya nahi.
    
    Badge conditions check hote hain:
    - XP milestones (500, 1000, 5000 XP)
    - Quiz milestones (10, 50, 100 quizzes)
    - Streak milestones (7, 30, 100 days)
    - Chapter milestones (10, 50, 100 chapters)
    """
    users = get_users_collection()
    badges_coll = get_badges_collection()
    user_badges_coll = get_user_badges_collection()
    quiz_coll = get_quiz_results_collection()
    progress_coll = get_progress_collection()
    notifications_coll = get_notifications_collection()
    
    # User data lo
    user = await users.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    user_xp = user.get("xp", 0)
    user_streak = user.get("streak", 0)
    
    # Stats nikalo
    total_quizzes = await quiz_coll.count_documents({
        "user_id": current_user["user_id"], "status": "completed"
    })
    total_chapters = await progress_coll.count_documents({
        "user_id": current_user["user_id"], "completed": True
    })
    
    # Already earned badges
    earned = await user_badges_coll.find({"user_id": current_user["user_id"]}).to_list(100)
    earned_ids = {e["badge_id"] for e in earned}
    
    # Saare badges check karo
    all_badges = await badges_coll.find().to_list(length=100)
    
    new_badges = []
    for badge in all_badges:
        bid = str(badge["_id"])
        if bid in earned_ids:
            continue  # Already earned, skip
        
        # Condition check karo
        condition_type = badge.get("condition_type", "")
        condition_value = badge.get("condition_value", 0)
        
        awarded = False
        if condition_type == "xp" and user_xp >= condition_value:
            awarded = True
        elif condition_type == "streak" and user_streak >= condition_value:
            awarded = True
        elif condition_type == "quizzes" and total_quizzes >= condition_value:
            awarded = True
        elif condition_type == "chapters" and total_chapters >= condition_value:
            awarded = True
        
        if awarded:
            # Badge award karo
            await user_badges_coll.insert_one({
                "user_id": current_user["user_id"],
                "badge_id": bid,
                "earned_at": get_current_timestamp()
            })
            
            # Notification bhejo
            await notifications_coll.insert_one({
                "user_id": current_user["user_id"],
                "type": "badge_earned",
                "title": f"New Badge: {badge.get('name', 'Badge')}!",
                "message": f"Congratulations! Tumne '{badge.get('name', '')}' badge earn kiya! {badge.get('icon', '🏆')}",
                "read": False,
                "created_at": get_current_timestamp()
            })
            
            new_badges.append({
                "id": bid,
                "name": badge.get("name", ""),
                "icon": badge.get("icon", "🏆"),
                "description": badge.get("description", ""),
            })
    
    if new_badges:
        return {
            "message": f"Congratulations! {len(new_badges)} new badge(s) earned!",
            "new_badges": new_badges
        }
    else:
        return {
            "message": "Koi naya badge nahi mila abhi. Keep learning!",
            "new_badges": []
        }
