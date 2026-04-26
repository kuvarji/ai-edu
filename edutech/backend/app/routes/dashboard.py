"""
Dashboard Routes - Combined endpoint for student dashboard
============================================================
Single endpoint that returns ALL data needed for the student dashboard.
6 API calls → 1 API call = faster page load.

- GET /dashboard/ → Courses, stats, weekly report, daily goals, study time, progress
"""

from fastapi import APIRouter, Depends, Query
from bson import ObjectId
from datetime import datetime, timezone, timedelta
from app.database import (
    get_users_collection, get_courses_collection, get_chapters_collection,
    get_progress_collection, get_quiz_results_collection,
    get_activity_log_collection
)
from app.utils.auth import get_current_user
from app.utils.helpers import serialize_doc, serialize_docs, get_current_timestamp

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
async def get_dashboard(
    current_user: dict = Depends(get_current_user),
    grade: int | None = Query(None, description="Class filter"),
    board: str | None = Query(None, description="Board filter"),
):
    """
    Student dashboard ka saara data ek call mein.
    Courses, gamification stats, weekly report, daily goals,
    study time (30 days), aur course progress — sab ek response mein.
    """
    user_id = current_user["user_id"]

    users = get_users_collection()
    courses_coll = get_courses_collection()
    chapters_coll = get_chapters_collection()
    progress_coll = get_progress_collection()
    quiz_coll = get_quiz_results_collection()
    activity_coll = get_activity_log_collection()

    # ---- User data ----
    user = await users.find_one({"_id": ObjectId(user_id)})
    user_xp = user.get("xp", 0) if user else 0
    user_level = user.get("level", 1) if user else 1
    user_streak = user.get("streak", 0) if user else 0

    # ---- Courses (filtered by grade/board if provided) ----
    course_query: dict = {}
    if grade is not None:
        course_query["grade"] = grade
    if board is not None:
        course_query["board"] = board.upper()

    course_list = await courses_coll.find(course_query).sort("grade", 1).to_list(length=100)
    courses_data = serialize_docs(course_list)

    # ---- Gamification Stats ----
    total_quizzes = await quiz_coll.count_documents({
        "user_id": user_id, "status": "completed"
    })
    completed_chapters_count = await progress_coll.count_documents({
        "user_id": user_id, "completed": True
    })
    xp_for_next = 500 - (user_xp % 500)

    stats = {
        "xp": user_xp,
        "level": user_level,
        "streak": user_streak,
        "xp_for_next_level": xp_for_next,
        "total_quizzes": total_quizzes,
        "total_chapters": completed_chapters_count,
        "badges_earned": 0,
    }

    # ---- Study Time (30 days) ----
    start_30d = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    activities = await activity_coll.find({
        "user_id": user_id,
        "timestamp": {"$gte": start_30d}
    }).sort("timestamp", 1).to_list(length=1000)

    daily_data: dict = {}
    for act in activities:
        ts = act.get("timestamp", "")
        if ts:
            day = ts[:10]
            if day not in daily_data:
                daily_data[day] = {"activities": 0, "chapters": 0, "quizzes": 0, "logged_minutes": 0}
            daily_data[day]["activities"] += 1
            if act.get("action") == "chapter_completed":
                daily_data[day]["chapters"] += 1
            elif act.get("action") == "quiz_completed":
                daily_data[day]["quizzes"] += 1
            elif act.get("action") == "study_session":
                daily_data[day]["logged_minutes"] += act.get("details", {}).get("minutes", 0)

    study_days = []
    for day, data in sorted(daily_data.items()):
        minutes = data["logged_minutes"] if data["logged_minutes"] > 0 else data["activities"] * 5
        study_days.append({
            "date": day,
            "estimated_minutes": minutes,
            "chapters_completed": data["chapters"],
            "quizzes_taken": data["quizzes"],
            "total_activities": data["activities"]
        })

    total_minutes = sum(d["estimated_minutes"] for d in study_days)

    study_time = {
        "study_time": {
            "total_minutes": total_minutes,
            "total_hours": round(total_minutes / 60, 1),
            "average_daily_minutes": round(total_minutes / 30) if total_minutes > 0 else 0,
            "active_days": len(study_days),
            "total_days": 30,
        },
        "daily_breakdown": study_days,
    }

    # ---- Daily Goals ----
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()

    lessons_today = await progress_coll.count_documents({
        "user_id": user_id, "completed": True, "completed_at": {"$gte": today_start}
    })
    today_quizzes = await quiz_coll.find({
        "user_id": user_id, "status": "completed", "completed_at": {"$gte": today_start}
    }).to_list(length=100)

    questions_today = sum(q.get("total_questions", 0) for q in today_quizzes)
    xp_from_quizzes = sum(q.get("xp_earned", 0) for q in today_quizzes)
    xp_today = xp_from_quizzes + lessons_today * 50
    activities_today = await activity_coll.count_documents({
        "user_id": user_id, "timestamp": {"$gte": today_start}
    })
    study_minutes_today = activities_today * 5

    goals = [
        {"id": "lessons", "label": "Complete 3 lessons", "current": lessons_today, "target": 3, "color": "from-violet-500 to-purple-500"},
        {"id": "questions", "label": "Solve 10 quiz questions", "current": questions_today, "target": 10, "color": "from-cyan-500 to-blue-500"},
        {"id": "xp", "label": "Earn 200 XP", "current": xp_today, "target": 200, "color": "from-amber-500 to-orange-500"},
        {"id": "study_time", "label": "Study for 30 min", "current": study_minutes_today, "target": 30, "color": "from-emerald-500 to-teal-500"},
    ]

    # ---- Weekly Report ----
    start_7d = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    week_quizzes = await quiz_coll.find({
        "user_id": user_id, "status": "completed", "completed_at": {"$gte": start_7d}
    }).to_list(length=100)

    week_chapters = await progress_coll.count_documents({
        "user_id": user_id, "completed": True, "completed_at": {"$gte": start_7d}
    })
    week_activities = await activity_coll.count_documents({
        "user_id": user_id, "timestamp": {"$gte": start_7d}
    })

    quiz_scores = [q.get("score", 0) for q in week_quizzes]
    xp_earned_week = sum(q.get("xp_earned", 0) for q in week_quizzes)

    weekly_report = {
        "weekly_report": {
            "period": "Last 7 days",
            "quizzes_taken": len(week_quizzes),
            "average_quiz_score": round(sum(quiz_scores) / len(quiz_scores)) if quiz_scores else 0,
            "best_quiz_score": max(quiz_scores) if quiz_scores else 0,
            "chapters_completed": week_chapters,
            "total_activities": week_activities,
            "xp_earned_this_week": xp_earned_week,
            "estimated_study_hours": round(week_activities * 5 / 60, 1),
            "current_streak": user_streak,
            "current_level": user_level,
            "total_xp": user_xp,
        }
    }

    # ---- Course Progress ----
    user_progress = await progress_coll.find({
        "user_id": user_id, "completed": True
    }).to_list(length=500)

    course_progress_map: dict = {}
    for p in user_progress:
        cid = p["course_id"]
        if cid not in course_progress_map:
            course_progress_map[cid] = 0
        course_progress_map[cid] += 1

    progress_list = []
    for course in course_list:
        cid = str(course["_id"])
        total_ch = await chapters_coll.count_documents({"course_id": cid})
        completed = course_progress_map.get(cid, 0)
        progress_list.append({
            "course": serialize_doc(course),
            "completed_chapters": completed,
            "total_chapters": total_ch,
            "progress_percentage": round((completed / total_ch * 100) if total_ch > 0 else 0),
        })

    return {
        "courses": {"courses": courses_data, "total": len(courses_data)},
        "stats": stats,
        "weekly_report": weekly_report,
        "daily_goals": {"goals": goals},
        "study_time": study_time,
        "progress": {"progress": progress_list},
    }
