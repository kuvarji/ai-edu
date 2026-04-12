"""
Quiz System Routes - Quiz Generation, Submit, History
======================================================
Ye module quiz system handle karta hai:
- GET  /quiz/start       → Quiz questions generate karo (AI se ya bank se)
- POST /quiz/submit      → Quiz answers submit karo aur score lo
- GET  /quiz/history     → Apni quiz history dekho
- GET  /quiz/history/{id} → Ek quiz attempt ka detail
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from bson import ObjectId
from typing import Optional
from app.database import (
    get_quiz_questions_collection, get_quiz_results_collection,
    get_users_collection, get_activity_log_collection
)
from app.utils.auth import get_current_user
from app.utils.helpers import serialize_doc, serialize_docs, get_current_timestamp, valid_object_id

router = APIRouter(prefix="/quiz", tags=["Quiz"])


# ============================
# Request/Response Models
# ============================

class QuizAnswer(BaseModel):
    """Ek question ka answer"""
    question_id: str = Field(..., description="Question ka ID")
    selected_option: int = Field(..., ge=0, le=3, description="Selected option index (0-3)")


class SubmitQuizRequest(BaseModel):
    """Quiz submit karne ka request - saare answers ek saath bhejo"""
    quiz_id: str = Field(..., description="Quiz session ID")
    subject: str = Field(..., description="Subject (math, science, etc.)")
    answers: list[QuizAnswer] = Field(..., description="List of answers")


# ============================
# Routes
# ============================

@router.get("/start")
async def start_quiz(
    subject: str = Query(..., description="Subject for quiz (math, science, english, etc.)"),
    grade: int = Query(10, description="Class/Grade (6-12)"),
    difficulty: str = Query("medium", description="Difficulty: easy, medium, hard"),
    count: int = Query(5, ge=1, le=20, description="Number of questions (1-20)"),
    current_user: dict = Depends(get_current_user)
):
    """
    Quiz start karo - questions return karo bank se.
    
    Agar database mein enough questions hain toh wahan se nikalenge.
    Nahi toh default sample questions denge.
    
    Args:
        subject: Quiz ka subject (math/science/english/etc.)
        grade: Student ki class (6-12)
        difficulty: easy/medium/hard
        count: Kitne questions chahiye (default 5)
    """
    questions_coll = get_quiz_questions_collection()
    
    # Database se matching questions dhundho
    query = {
        "subject": subject.lower(),
        "grade": grade,
        "difficulty": difficulty.lower()
    }
    
    # Random questions nikalo using MongoDB $sample
    pipeline = [
        {"$match": query},
        {"$sample": {"size": count}}
    ]
    
    questions = await questions_coll.aggregate(pipeline).to_list(length=count)
    
    # Agar questions kam hain toh sample questions generate karo
    if len(questions) < count:
        sample_questions = generate_sample_questions(subject, grade, difficulty, count)
        questions = sample_questions
    else:
        # Questions ko serialize karo (answers hide karo quiz ke time)
        questions = [format_question_for_quiz(q) for q in questions]
    
    # Quiz session banao (track karne ke liye ki kaun sa quiz chal raha hai)
    quiz_results_coll = get_quiz_results_collection()
    quiz_session = {
        "user_id": current_user["user_id"],
        "subject": subject.lower(),
        "grade": grade,
        "difficulty": difficulty,
        "total_questions": len(questions),
        "status": "in_progress",  # Quiz abhi chal raha hai
        "started_at": get_current_timestamp(),
        "completed_at": None,
        "score": None,
        "xp_earned": None,
    }
    result = await quiz_results_coll.insert_one(quiz_session)
    quiz_id = str(result.inserted_id)
    
    return {
        "quiz_id": quiz_id,
        "subject": subject,
        "grade": grade,
        "difficulty": difficulty,
        "questions": questions,
        "total": len(questions),
        "time_limit_seconds": len(questions) * 30  # 30 seconds per question
    }


@router.post("/submit")
async def submit_quiz(
    req: SubmitQuizRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Quiz ke answers submit karo aur score lo.
    
    Steps:
    1. Quiz session validate karo
    2. Har answer check karo (sahi ya galat)
    3. Score calculate karo
    4. XP reward do based on score
    5. Results save karo database mein
    """
    if not valid_object_id(req.quiz_id):
        raise HTTPException(status_code=400, detail="Invalid quiz ID.")
    
    quiz_results_coll = get_quiz_results_collection()
    questions_coll = get_quiz_questions_collection()
    
    # Quiz session check karo
    quiz = await quiz_results_coll.find_one({"_id": ObjectId(req.quiz_id)})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz session not found.")
    
    if quiz.get("status") == "completed":
        raise HTTPException(status_code=400, detail="Ye quiz pehle se submit ho chuka hai.")
    
    # Answers check karo
    correct_count = 0
    total = len(req.answers)
    answer_details = []
    
    for ans in req.answers:
        # Question dhundho database mein
        if valid_object_id(ans.question_id):
            question = await questions_coll.find_one({"_id": ObjectId(ans.question_id)})
        else:
            question = None
        
        is_correct = False
        correct_answer = -1
        
        if question:
            correct_answer = question.get("correct_option", 0)
            is_correct = ans.selected_option == correct_answer
        
        if is_correct:
            correct_count += 1
        
        answer_details.append({
            "question_id": ans.question_id,
            "selected": ans.selected_option,
            "correct": correct_answer,
            "is_correct": is_correct
        })
    
    # Score calculate karo (percentage)
    score = round((correct_count / total * 100) if total > 0 else 0)
    
    # XP reward calculate karo based on score
    # 100% = 100 XP, 80%+ = 75 XP, 60%+ = 50 XP, 40%+ = 25 XP, below = 10 XP
    if score >= 100:
        xp_earned = 100
    elif score >= 80:
        xp_earned = 75
    elif score >= 60:
        xp_earned = 50
    elif score >= 40:
        xp_earned = 25
    else:
        xp_earned = 10
    
    # Quiz result update karo
    await quiz_results_coll.update_one(
        {"_id": ObjectId(req.quiz_id)},
        {"$set": {
            "status": "completed",
            "score": score,
            "correct_count": correct_count,
            "total_questions": total,
            "xp_earned": xp_earned,
            "answers": answer_details,
            "completed_at": get_current_timestamp()
        }}
    )
    
    # User ko XP do
    users = get_users_collection()
    user = await users.find_one({"_id": ObjectId(current_user["user_id"])})
    new_xp = user.get("xp", 0) + xp_earned
    new_level = (new_xp // 500) + 1
    
    await users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": {"xp": new_xp, "level": new_level, "updated_at": get_current_timestamp()}}
    )
    
    # Activity log mein daalo
    activity = get_activity_log_collection()
    await activity.insert_one({
        "user_id": current_user["user_id"],
        "action": "quiz_completed",
        "details": {
            "subject": req.subject,
            "score": score,
            "correct": correct_count,
            "total": total,
            "xp_earned": xp_earned
        },
        "timestamp": get_current_timestamp()
    })
    
    return {
        "message": f"Quiz complete! Score: {score}% ({correct_count}/{total})",
        "score": score,
        "correct": correct_count,
        "total": total,
        "xp_earned": xp_earned,
        "total_xp": new_xp,
        "level": new_level,
        "answers": answer_details
    }


@router.get("/history")
async def get_quiz_history(
    subject: str | None = Query(None, description="Filter by subject"),
    limit: int = Query(20, ge=1, le=50, description="Number of results"),
    current_user: dict = Depends(get_current_user)
):
    """
    User ki quiz history return karo.
    Latest quiz pehle aayegi. Optional subject filter.
    """
    quiz_results_coll = get_quiz_results_collection()
    
    query = {"user_id": current_user["user_id"], "status": "completed"}
    if subject:
        query["subject"] = subject.lower()
    
    cursor = quiz_results_coll.find(query).sort("completed_at", -1).limit(limit)
    results = await cursor.to_list(length=limit)
    
    # Serialize karo (answers detail hata do response chota rakhne ke liye)
    history = []
    for r in results:
        history.append({
            "id": str(r["_id"]),
            "subject": r.get("subject", ""),
            "grade": r.get("grade", 10),
            "difficulty": r.get("difficulty", "medium"),
            "score": r.get("score", 0),
            "correct": r.get("correct_count", 0),
            "total": r.get("total_questions", 0),
            "xp_earned": r.get("xp_earned", 0),
            "completed_at": r.get("completed_at", "")
        })
    
    return {"history": history, "total": len(history)}


@router.get("/history/{quiz_id}")
async def get_quiz_detail(quiz_id: str, current_user: dict = Depends(get_current_user)):
    """
    Ek specific quiz attempt ka full detail dekho,
    including har question ka answer aur sahi answer.
    """
    if not valid_object_id(quiz_id):
        raise HTTPException(status_code=400, detail="Invalid quiz ID.")
    
    quiz_results_coll = get_quiz_results_collection()
    quiz = await quiz_results_coll.find_one({
        "_id": ObjectId(quiz_id),
        "user_id": current_user["user_id"]
    })
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz result not found.")
    
    return {"quiz": serialize_doc(quiz)}


# ============================
# Helper Functions
# ============================

def format_question_for_quiz(question: dict) -> dict:
    """
    Question ko quiz format mein convert karo.
    Correct answer hide karo (student ko nahi dikhana quiz ke time).
    """
    return {
        "id": str(question["_id"]),
        "question": question.get("question", ""),
        "options": question.get("options", []),
        "subject": question.get("subject", ""),
        "difficulty": question.get("difficulty", "medium"),
        # correct_option NAHI bhejenge - ye quiz submit ke baad dikhega
    }


def generate_sample_questions(subject: str, grade: int, difficulty: str, count: int) -> list:
    """
    Agar database mein questions nahi hain toh sample questions generate karo.
    Ye fallback hai - production mein AI se generate honge ya admin add karega.
    """
    # Sample questions bank (subject-wise)
    sample_bank = {
        "math": [
            {"question": "2 + 2 = ?", "options": ["3", "4", "5", "6"], "correct_option": 1},
            {"question": "5 × 6 = ?", "options": ["25", "30", "35", "36"], "correct_option": 1},
            {"question": "100 ÷ 4 = ?", "options": ["20", "25", "30", "50"], "correct_option": 1},
            {"question": "√144 = ?", "options": ["10", "11", "12", "13"], "correct_option": 2},
            {"question": "15² = ?", "options": ["200", "225", "250", "215"], "correct_option": 1},
        ],
        "science": [
            {"question": "Pani ka chemical formula kya hai?", "options": ["H2O", "CO2", "NaCl", "O2"], "correct_option": 0},
            {"question": "Light ka speed kitna hai?", "options": ["3×10⁶ m/s", "3×10⁸ m/s", "3×10⁴ m/s", "3×10¹⁰ m/s"], "correct_option": 1},
            {"question": "DNA ka full form kya hai?", "options": ["Deoxyribose Nucleic Acid", "Deoxyribonucleic Acid", "Dinucleotide Acid", "None"], "correct_option": 1},
            {"question": "Sabse bada planet kaunsa hai?", "options": ["Saturn", "Jupiter", "Neptune", "Mars"], "correct_option": 1},
            {"question": "Photosynthesis mein kya produce hota hai?", "options": ["CO2", "O2", "N2", "H2"], "correct_option": 1},
        ],
        "english": [
            {"question": "What is the past tense of 'go'?", "options": ["goed", "went", "gone", "going"], "correct_option": 1},
            {"question": "Which is a noun?", "options": ["run", "beautiful", "table", "quickly"], "correct_option": 2},
            {"question": "What is a synonym of 'happy'?", "options": ["sad", "joyful", "angry", "tired"], "correct_option": 1},
            {"question": "Which is correct?", "options": ["He go school", "He goes to school", "He going school", "He gone school"], "correct_option": 1},
            {"question": "What is the plural of 'child'?", "options": ["childs", "childes", "children", "child"], "correct_option": 2},
        ]
    }
    
    # Subject ke questions lo ya default math questions
    questions = sample_bank.get(subject.lower(), sample_bank["math"])
    
    # Required count tak questions do (repeat if needed)
    result = []
    for i in range(min(count, len(questions))):
        q = questions[i]
        result.append({
            "id": f"sample_{subject}_{i}",
            "question": q["question"],
            "options": q["options"],
            "subject": subject,
            "difficulty": difficulty,
        })
    
    return result
