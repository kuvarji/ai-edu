"""
Analytics Routes - Study Time, Performance, Weak Areas, Recommendations
========================================================================
Ye module analytics aur insights provide karta hai:
- GET  /analytics/study-time    → Study time ka analysis
- POST /analytics/study-time    → Study time log karo
- GET  /analytics/performance   → Subject-wise performance
- GET  /analytics/weak-areas    → Weak areas identify karo
- GET  /analytics/recommendations → AI-based study recommendations
- GET  /analytics/weekly-report → Weekly progress report
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from bson import ObjectId
from datetime import datetime, timezone, timedelta
from app.database import (
    get_users_collection, get_quiz_results_collection,
    get_progress_collection, get_activity_log_collection,
    get_courses_collection, get_chapters_collection
)
from app.utils.auth import get_current_user
from app.utils.helpers import valid_object_id, get_current_timestamp

router = APIRouter(prefix="/analytics", tags=["Analytics"])


class LogStudyTimeRequest(BaseModel):
    """Study session log karne ka request"""
    minutes: int = Field(..., ge=1, le=300, description="Kitne minutes study ki")
    course_id: str | None = Field(None, description="Course ID (optional)")
    chapter_id: str | None = Field(None, description="Chapter ID (optional)")
    activity_type: str = Field("lesson", description="Activity type: lesson, chat, quiz")


# ============================
# Routes
# ============================

@router.post("/study-time")
async def log_study_time(
    req: LogStudyTimeRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Study session log karo.
    Frontend se call hota hai jab user lesson complete karta hai ya chat karta hai.
    """
    activity_coll = get_activity_log_collection()

    await activity_coll.insert_one({
        "user_id": current_user["user_id"],
        "action": "study_session",
        "details": {
            "minutes": req.minutes,
            "course_id": req.course_id,
            "chapter_id": req.chapter_id,
            "activity_type": req.activity_type,
        },
        "timestamp": get_current_timestamp()
    })

    return {"message": f"{req.minutes} minutes study time logged!", "minutes": req.minutes}


@router.get("/study-time")
async def get_study_time(
    days: int = Query(7, ge=1, le=30, description="Last kitne days ka data (1-30)"),
    current_user: dict = Depends(get_current_user)
):
    """
    User ka study time analysis.
    Activity log se calculate karta hai ki user kitna active tha.
    Day-wise breakdown milega.
    """
    activity_coll = get_activity_log_collection()
    
    # Start date calculate karo
    start_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    
    # User ki saari activities last N days ki
    activities = await activity_coll.find({
        "user_id": current_user["user_id"],
        "timestamp": {"$gte": start_date}
    }).sort("timestamp", 1).to_list(length=1000)
    
    # Day-wise activity count + actual logged study minutes
    daily_data = {}
    for act in activities:
        ts = act.get("timestamp", "")
        if ts:
            day = ts[:10]  # "2024-01-15" format
            if day not in daily_data:
                daily_data[day] = {"activities": 0, "chapters": 0, "quizzes": 0, "logged_minutes": 0}
            daily_data[day]["activities"] += 1
            
            if act.get("action") == "chapter_completed":
                daily_data[day]["chapters"] += 1
            elif act.get("action") == "quiz_completed":
                daily_data[day]["quizzes"] += 1
            elif act.get("action") == "study_session":
                daily_data[day]["logged_minutes"] += act.get("details", {}).get("minutes", 0)
    
    # Result format
    study_days = []
    for day, data in sorted(daily_data.items()):
        # Use logged minutes if available, otherwise estimate from activities
        minutes = data["logged_minutes"] if data["logged_minutes"] > 0 else data["activities"] * 5
        study_days.append({
            "date": day,
            "estimated_minutes": minutes,
            "chapters_completed": data["chapters"],
            "quizzes_taken": data["quizzes"],
            "total_activities": data["activities"]
        })
    
    # Summary
    total_minutes = sum(d["estimated_minutes"] for d in study_days)
    avg_daily = round(total_minutes / days) if days > 0 else 0
    
    return {
        "study_time": {
            "total_minutes": total_minutes,
            "total_hours": round(total_minutes / 60, 1),
            "average_daily_minutes": avg_daily,
            "active_days": len(study_days),
            "total_days": days,
        },
        "daily_breakdown": study_days
    }


@router.get("/performance")
async def get_performance(
    days: int = Query(30, ge=1, le=90, description="Last kitne days ka data"),
    current_user: dict = Depends(get_current_user)
):
    """
    Subject-wise performance analysis.
    Quiz scores ka average, trend, aur subject-wise breakdown.
    """
    quiz_coll = get_quiz_results_collection()
    
    start_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    
    # User ke completed quizzes
    quizzes = await quiz_coll.find({
        "user_id": current_user["user_id"],
        "status": "completed",
        "completed_at": {"$gte": start_date}
    }).sort("completed_at", 1).to_list(length=500)
    
    # Subject-wise performance calculate karo
    subject_stats = {}
    for q in quizzes:
        subject = q.get("subject", "general")
        if subject not in subject_stats:
            subject_stats[subject] = {
                "total_quizzes": 0,
                "total_score": 0,
                "scores": [],
                "total_correct": 0,
                "total_questions": 0,
                "total_xp": 0,
            }
        
        stats = subject_stats[subject]
        stats["total_quizzes"] += 1
        stats["total_score"] += q.get("score", 0)
        stats["scores"].append(q.get("score", 0))
        stats["total_correct"] += q.get("correct_count", 0)
        stats["total_questions"] += q.get("total_questions", 0)
        stats["total_xp"] += q.get("xp_earned", 0)
    
    # Result format
    performance = []
    for subject, stats in subject_stats.items():
        avg_score = round(stats["total_score"] / stats["total_quizzes"]) if stats["total_quizzes"] > 0 else 0
        accuracy = round(stats["total_correct"] / stats["total_questions"] * 100) if stats["total_questions"] > 0 else 0
        
        # Trend calculate karo (last 5 quizzes vs first 5)
        scores = stats["scores"]
        trend = "stable"
        if len(scores) >= 4:
            first_half = sum(scores[:len(scores)//2]) / (len(scores)//2)
            second_half = sum(scores[len(scores)//2:]) / (len(scores) - len(scores)//2)
            if second_half > first_half + 5:
                trend = "improving"
            elif second_half < first_half - 5:
                trend = "declining"
        
        performance.append({
            "subject": subject,
            "total_quizzes": stats["total_quizzes"],
            "average_score": avg_score,
            "accuracy": accuracy,
            "total_xp_earned": stats["total_xp"],
            "trend": trend,  # improving / declining / stable
            "best_score": max(scores) if scores else 0,
            "worst_score": min(scores) if scores else 0,
        })
    
    # Overall stats
    all_scores = [q.get("score", 0) for q in quizzes]
    overall_avg = round(sum(all_scores) / len(all_scores)) if all_scores else 0
    
    return {
        "overall": {
            "total_quizzes": len(quizzes),
            "average_score": overall_avg,
            "total_xp_earned": sum(q.get("xp_earned", 0) for q in quizzes),
        },
        "subject_performance": performance,
        "period_days": days
    }


@router.get("/weak-areas")
async def get_weak_areas(current_user: dict = Depends(get_current_user)):
    """
    User ke weak areas identify karo.
    Kaunse subjects mein performance kam hai, kahan improve karna chahiye.
    Quiz scores aur progress ke basis par analysis.
    """
    quiz_coll = get_quiz_results_collection()
    progress_coll = get_progress_collection()
    courses_coll = get_courses_collection()
    
    # Last 30 days ke quizzes
    start_date = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    quizzes = await quiz_coll.find({
        "user_id": current_user["user_id"],
        "status": "completed",
        "completed_at": {"$gte": start_date}
    }).to_list(length=200)
    
    # Subject-wise average score
    subject_scores = {}
    for q in quizzes:
        subject = q.get("subject", "general")
        if subject not in subject_scores:
            subject_scores[subject] = []
        subject_scores[subject].append(q.get("score", 0))
    
    # Weak areas = subjects with avg score < 60%
    weak_areas = []
    strong_areas = []
    
    for subject, scores in subject_scores.items():
        avg = round(sum(scores) / len(scores))
        area = {
            "subject": subject,
            "average_score": avg,
            "quizzes_taken": len(scores),
            "needs_improvement": avg < 60,
        }
        
        if avg < 60:
            area["suggestion"] = f"{subject.capitalize()} mein practice badhao. Average score {avg}% hai, 60%+ target karo."
            weak_areas.append(area)
        else:
            strong_areas.append(area)
    
    # Courses jinhein start nahi kiya (potential weak areas)
    all_courses = await courses_coll.find().to_list(length=100)
    user_progress = await progress_coll.find(
        {"user_id": current_user["user_id"], "completed": True}
    ).to_list(length=500)
    
    started_course_ids = {p["course_id"] for p in user_progress}
    
    not_started = []
    for course in all_courses:
        cid = str(course["_id"])
        if cid not in started_course_ids:
            not_started.append({
                "course": course.get("title", ""),
                "subject": course.get("subject", ""),
                "grade": course.get("grade", 10),
            })
    
    return {
        "weak_areas": weak_areas,
        "strong_areas": strong_areas,
        "not_started_courses": not_started[:5],  # Top 5
        "summary": {
            "total_subjects_attempted": len(subject_scores),
            "weak_count": len(weak_areas),
            "strong_count": len(strong_areas),
        }
    }


@router.get("/recommendations")
async def get_recommendations(current_user: dict = Depends(get_current_user)):
    """
    AI-based study recommendations.
    User ki performance, weak areas, aur activity ke basis par
    personalized suggestions dega.
    """
    users = get_users_collection()
    quiz_coll = get_quiz_results_collection()
    progress_coll = get_progress_collection()
    
    # User data
    user = await users.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    user_xp = user.get("xp", 0)
    user_streak = user.get("streak", 0)
    user_level = user.get("level", 1)
    
    # Stats
    total_quizzes = await quiz_coll.count_documents({
        "user_id": current_user["user_id"], "status": "completed"
    })
    total_chapters = await progress_coll.count_documents({
        "user_id": current_user["user_id"], "completed": True
    })
    
    # Recent quiz performance
    recent_quizzes = await quiz_coll.find({
        "user_id": current_user["user_id"], "status": "completed"
    }).sort("completed_at", -1).limit(5).to_list(length=5)
    
    recent_avg = 0
    if recent_quizzes:
        recent_avg = round(sum(q.get("score", 0) for q in recent_quizzes) / len(recent_quizzes))
    
    # Recommendations generate karo
    recommendations = []
    
    # Streak based
    if user_streak == 0:
        recommendations.append({
            "type": "streak",
            "priority": "high",
            "message": "Aaj se daily study shuru karo! Streak maintain karo aur badges earn karo.",
            "action": "Start a quiz or complete a chapter"
        })
    elif user_streak < 7:
        recommendations.append({
            "type": "streak",
            "priority": "medium",
            "message": f"Great! {user_streak} day streak hai. 7 days tak pahuncho 'Week Warrior' badge ke liye!",
            "action": "Keep logging in daily"
        })
    
    # Quiz based
    if total_quizzes < 5:
        recommendations.append({
            "type": "quiz",
            "priority": "high",
            "message": "Zyada quizzes do! Practice se confidence badhega aur XP bhi milega.",
            "action": "Take a quiz now"
        })
    elif recent_avg < 60:
        recommendations.append({
            "type": "performance",
            "priority": "high",
            "message": f"Recent quiz average {recent_avg}% hai. Chapters dubara padho aur easy difficulty se start karo.",
            "action": "Review weak topics and retry"
        })
    elif recent_avg >= 80:
        recommendations.append({
            "type": "performance",
            "priority": "low",
            "message": f"Excellent! {recent_avg}% average score. Ab hard difficulty try karo!",
            "action": "Try hard difficulty quizzes"
        })
    
    # Chapter based
    if total_chapters < 3:
        recommendations.append({
            "type": "progress",
            "priority": "high",
            "message": "Abhi sirf kuch chapters complete kiye hain. Zyada chapters padho knowledge badhane ke liye.",
            "action": "Complete more chapters"
        })
    
    # Level based
    if user_level < 3:
        recommendations.append({
            "type": "xp",
            "priority": "medium",
            "message": f"Level {user_level} par ho. Quizzes do aur chapters complete karo XP earn karne ke liye!",
            "action": "Earn more XP"
        })
    
    # General daily recommendation
    recommendations.append({
        "type": "daily",
        "priority": "low",
        "message": "Roz 30 minutes study karo. Consistency se better results aate hain!",
        "action": "Study for 30 minutes today"
    })
    
    return {
        "recommendations": recommendations,
        "current_stats": {
            "xp": user_xp,
            "level": user_level,
            "streak": user_streak,
            "total_quizzes": total_quizzes,
            "total_chapters": total_chapters,
            "recent_average": recent_avg
        }
    }


@router.get("/weekly-report")
async def get_weekly_report(current_user: dict = Depends(get_current_user)):
    """
    Last 7 days ka weekly progress report.
    Summary format mein saari stats ek jagah.
    """
    quiz_coll = get_quiz_results_collection()
    progress_coll = get_progress_collection()
    activity_coll = get_activity_log_collection()
    users = get_users_collection()
    
    start_date = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    
    # User data
    user = await users.find_one({"_id": ObjectId(current_user["user_id"])})
    
    # This week's quizzes
    week_quizzes = await quiz_coll.find({
        "user_id": current_user["user_id"],
        "status": "completed",
        "completed_at": {"$gte": start_date}
    }).to_list(length=100)
    
    # This week's chapters
    week_chapters = await progress_coll.count_documents({
        "user_id": current_user["user_id"],
        "completed": True,
        "completed_at": {"$gte": start_date}
    })
    
    # This week's activities
    week_activities = await activity_coll.count_documents({
        "user_id": current_user["user_id"],
        "timestamp": {"$gte": start_date}
    })
    
    # Quiz stats
    quiz_scores = [q.get("score", 0) for q in week_quizzes]
    xp_earned = sum(q.get("xp_earned", 0) for q in week_quizzes)
    
    return {
        "weekly_report": {
            "period": f"Last 7 days",
            "quizzes_taken": len(week_quizzes),
            "average_quiz_score": round(sum(quiz_scores) / len(quiz_scores)) if quiz_scores else 0,
            "best_quiz_score": max(quiz_scores) if quiz_scores else 0,
            "chapters_completed": week_chapters,
            "total_activities": week_activities,
            "xp_earned_this_week": xp_earned,
            "estimated_study_hours": round(week_activities * 5 / 60, 1),
            "current_streak": user.get("streak", 0) if user else 0,
            "current_level": user.get("level", 1) if user else 1,
            "total_xp": user.get("xp", 0) if user else 0,
        }
    }
