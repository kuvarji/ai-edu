"""
AI Tutor Routes - Chat, Explain, Doubt Solver, Notes, TTS
===========================================================
Ye module AI tutor features handle karta hai:
- POST /ai/chat        → AI se chat karo (Gemini API)
- POST /ai/explain     → Topic explain karwao
- POST /ai/doubt       → Doubt solve karwao
- POST /ai/notes       → Auto notes generate karo
- POST /ai/tts         → Text to Speech (Edge TTS)
- GET  /ai/history     → Chat history dekho
"""

import os
import asyncio
import uuid
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from pydantic import BaseModel, Field
from bson import ObjectId
from app.database import get_chat_history_collection, get_activity_log_collection
from app.utils.auth import get_current_user
from app.utils.helpers import get_current_timestamp
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/ai", tags=["AI Tutor"])

# Gemini API key (.env file se)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


# ============================
# Request Models
# ============================

class ChatRequest(BaseModel):
    """AI se chat karne ka request"""
    message: str = Field(..., min_length=1, max_length=2000, description="User ka message/question")
    subject: str = Field(default="general", description="Subject context (math, science, etc.)")
    grade: int = Field(default=10, ge=6, le=12, description="Student ki class")


class ExplainRequest(BaseModel):
    """Topic explain karwane ka request"""
    topic: str = Field(..., min_length=1, max_length=500, description="Topic jo explain karna hai")
    subject: str = Field(default="general", description="Subject")
    grade: int = Field(default=10, ge=6, le=12, description="Class")
    language: str = Field(default="hinglish", description="Response language: hindi/english/hinglish")


class DoubtRequest(BaseModel):
    """Doubt solve karwane ka request"""
    question: str = Field(..., min_length=1, max_length=2000, description="Doubt/Question")
    subject: str = Field(default="general", description="Subject")
    grade: int = Field(default=10, ge=6, le=12, description="Class")


class NotesRequest(BaseModel):
    """Auto notes generate karne ka request"""
    topic: str = Field(..., min_length=1, max_length=500, description="Topic jiske notes chahiye")
    subject: str = Field(default="general", description="Subject")
    grade: int = Field(default=10, ge=6, le=12, description="Class")


class TTSRequest(BaseModel):
    """Text to Speech request"""
    text: str = Field(..., min_length=1, max_length=5000, description="Text jo bolna hai")
    language: str = Field(default="hi", description="Language code: hi (Hindi), en (English)")


class GenerateLessonRequest(BaseModel):
    """AI Lesson Generate karne ka request — Gemini se script banao"""
    topic: str = Field(..., min_length=1, max_length=500, description="Chapter/Topic name")
    subject: str = Field(default="science", description="Subject (science, math, etc.)")
    grade: int = Field(default=8, ge=1, le=12, description="Student ki class")
    language: str = Field(default="hinglish", description="hinglish / hindi / english")
    character_name: str = Field(default="Sheru", description="Character ka naam jo padhayega")


# ============================
# Helper: Gemini API Call
# ============================

async def call_gemini(prompt: str) -> str:
    """
    Google Gemini API ko call karo response lene ke liye.
    Agar API key nahi hai toh fallback response dega.
    
    Args:
        prompt: Full prompt jo Gemini ko bhejna hai
    Returns:
        AI ka response text
    """
    if not GEMINI_API_KEY:
        # API key nahi hai - fallback response do
        return ("AI tutor abhi available nahi hai kyunki Gemini API key set nahi hai. "
                "Admin se contact karo API key set karwane ke liye. "
                "Agar aap admin hain toh .env file mein GEMINI_API_KEY set karo.")
    
    try:
        import google.generativeai as genai
        
        # Gemini configure karo
        genai.configure(api_key=GEMINI_API_KEY)
        # gemini-2.0-flash use karo (gemini-pro deprecated ho chuka hai)
        model = genai.GenerativeModel("gemini-2.0-flash")
        
        # Response generate karo
        response = await asyncio.to_thread(
            model.generate_content, prompt
        )
        
        return response.text
    except Exception as e:
        return f"AI response generate karne mein error aaya: {str(e)}. Please try again."


# ============================
# Routes
# ============================

@router.post("/chat")
async def chat_with_ai(req: ChatRequest, current_user: dict = Depends(get_current_user)):
    """
    AI tutor se chat karo.
    User ka message Gemini API ko jayega aur intelligent response aayega.
    Chat history save hoti hai future reference ke liye.
    """
    # Prompt banao with context
    prompt = f"""You are an AI tutor for Indian students studying {req.subject} in Class {req.grade}.
Respond in a friendly, encouraging way. Use simple language.
If the student asks in Hindi/Hinglish, respond in the same language.

Student's question: {req.message}

Provide a clear, concise answer with examples if needed."""

    # AI se response lo
    ai_response = await call_gemini(prompt)
    
    # Chat history save karo
    chat_coll = get_chat_history_collection()
    await chat_coll.insert_one({
        "user_id": current_user["user_id"],
        "type": "chat",
        "subject": req.subject,
        "user_message": req.message,
        "ai_response": ai_response,
        "timestamp": get_current_timestamp()
    })
    
    return {
        "response": ai_response,
        "subject": req.subject,
    }


@router.post("/explain")
async def explain_topic(req: ExplainRequest, current_user: dict = Depends(get_current_user)):
    """
    Koi bhi topic detail mein explain karwao.
    Language preference ke hisab se response aayega (Hindi/English/Hinglish).
    """
    language_instruction = {
        "hindi": "Respond in Hindi using Devanagari script.",
        "english": "Respond in simple English.",
        "hinglish": "Respond in Hinglish (Hindi written in English script mixed with English words)."
    }
    
    lang_inst = language_instruction.get(req.language, language_instruction["hinglish"])
    
    prompt = f"""You are an expert {req.subject} teacher for Class {req.grade} Indian students.
{lang_inst}

Explain this topic in detail: {req.topic}

Include:
1. Simple definition
2. Key concepts (bullet points)
3. Real-life examples
4. Important formulas (if applicable)
5. Tips to remember

Make it easy to understand for a Class {req.grade} student."""

    ai_response = await call_gemini(prompt)
    
    # Chat history save karo
    chat_coll = get_chat_history_collection()
    await chat_coll.insert_one({
        "user_id": current_user["user_id"],
        "type": "explain",
        "subject": req.subject,
        "topic": req.topic,
        "user_message": f"Explain: {req.topic}",
        "ai_response": ai_response,
        "timestamp": get_current_timestamp()
    })
    
    return {
        "topic": req.topic,
        "explanation": ai_response,
        "subject": req.subject,
        "language": req.language
    }


@router.post("/doubt")
async def solve_doubt(req: DoubtRequest, current_user: dict = Depends(get_current_user)):
    """
    Student ka doubt solve karo.
    Step-by-step solution dega with explanation.
    """
    prompt = f"""You are a patient {req.subject} tutor for Class {req.grade} students.
A student has a doubt. Solve it step by step.
Use Hinglish (Hindi + English mix) for explanation.

Student's doubt: {req.question}

Provide:
1. Short answer first
2. Step-by-step detailed solution
3. Why this approach works
4. Similar practice question at the end"""

    ai_response = await call_gemini(prompt)
    
    # Chat history save karo
    chat_coll = get_chat_history_collection()
    await chat_coll.insert_one({
        "user_id": current_user["user_id"],
        "type": "doubt",
        "subject": req.subject,
        "user_message": req.question,
        "ai_response": ai_response,
        "timestamp": get_current_timestamp()
    })
    
    return {
        "doubt": req.question,
        "solution": ai_response,
        "subject": req.subject,
    }


@router.post("/notes")
async def generate_notes(req: NotesRequest, current_user: dict = Depends(get_current_user)):
    """
    Topic ke auto-generated study notes banao.
    Well-structured notes milenge with headings, bullet points, formulas.
    """
    prompt = f"""Create comprehensive study notes for Class {req.grade} {req.subject} on the topic: {req.topic}

Format the notes with:
1. **Topic Title**
2. **Key Definitions** (2-3 important definitions)
3. **Main Concepts** (bullet points with brief explanations)
4. **Important Formulas** (if applicable)
5. **Diagrams Description** (describe any important diagrams)
6. **Solved Examples** (2-3 examples)
7. **Quick Revision Points** (5-7 one-liner points)
8. **Practice Questions** (3-5 questions)

Use simple language. Mix Hindi and English where it helps understanding."""

    ai_response = await call_gemini(prompt)
    
    # Chat history save karo
    chat_coll = get_chat_history_collection()
    await chat_coll.insert_one({
        "user_id": current_user["user_id"],
        "type": "notes",
        "subject": req.subject,
        "topic": req.topic,
        "user_message": f"Generate notes: {req.topic}",
        "ai_response": ai_response,
        "timestamp": get_current_timestamp()
    })
    
    # Activity log
    activity = get_activity_log_collection()
    await activity.insert_one({
        "user_id": current_user["user_id"],
        "action": "notes_generated",
        "details": {"topic": req.topic, "subject": req.subject},
        "timestamp": get_current_timestamp()
    })
    
    return {
        "topic": req.topic,
        "notes": ai_response,
        "subject": req.subject,
    }


@router.post("/generate-lesson")
async def generate_lesson(req: GenerateLessonRequest, current_user: dict = Depends(get_current_user)):
    """
    AI se lesson script generate karo — character ke style mein.
    Gemini API topic ke hisab se structured lesson likhega
    jo frontend mein TTS + character image ke saath play hoga.
    
    Returns: List of lesson segments (slides) with text for each.
    """
    language_instruction = {
        "hindi": "Respond ONLY in Hindi (Devanagari script).",
        "english": "Respond ONLY in simple English.",
        "hinglish": "Respond in Hinglish (Hindi words written in English script, mixed with English technical terms)."
    }
    lang_inst = language_instruction.get(req.language, language_instruction["hinglish"])

    prompt = f"""You are {req.character_name}, a fun and friendly animated character teacher for Class {req.grade} Indian students.
{lang_inst}

Generate a teaching lesson on: "{req.topic}" for {req.subject} Class {req.grade}.

IMPORTANT: Return the lesson as a JSON array of segments. Each segment is a slide that will be shown one at a time.
Return ONLY valid JSON, no markdown, no code fences, no explanation outside the JSON.

Format:
[
  {{"slide": 1, "title": "Introduction", "text": "Namaste bacchon! Main hoon {req.character_name}! Aaj hum padhenge...", "emoji": "👋"}},
  {{"slide": 2, "title": "...", "text": "...", "emoji": "📚"}},
  ...
]

Rules:
- Create 6-10 slides total
- Slide 1: Introduction — character greets students, tells topic name
- Slides 2-4: Main concepts explained simply with examples
- Slides 5-7: Key points, formulas, important facts
- Slide 8-9: Real-life examples or fun facts
- Last slide: Summary + encouragement
- Each slide text should be 2-4 sentences (not too long, will be spoken aloud)
- Use fun, encouraging tone. Add emoji naturally.
- The character ({req.character_name}) should speak in first person
- Include relevant {req.subject} terminology"""

    ai_response = await call_gemini(prompt)

    # Parse JSON response from Gemini
    slides = []
    try:
        import json
        # Clean up response — remove markdown code fences if present
        cleaned = ai_response.strip()
        if cleaned.startswith("```"):
            # Remove first line (```json) and last line (```)
            lines = cleaned.split("\n")
            cleaned = "\n".join(lines[1:-1])
        slides = json.loads(cleaned)
        if not isinstance(slides, list):
            raise ValueError("Expected a JSON array of slides")
    except (json.JSONDecodeError, ValueError):
        # Fallback: wrap the raw text into a single slide
        slides = [
            {"slide": 1, "title": req.topic, "text": ai_response, "emoji": "📚"}
        ]

    # Activity log
    activity = get_activity_log_collection()
    await activity.insert_one({
        "user_id": current_user["user_id"],
        "action": "lesson_generated",
        "details": {
            "topic": req.topic,
            "subject": req.subject,
            "grade": req.grade,
            "character": req.character_name,
            "slides_count": len(slides),
        },
        "timestamp": get_current_timestamp()
    })

    return {
        "topic": req.topic,
        "subject": req.subject,
        "grade": req.grade,
        "character": req.character_name,
        "language": req.language,
        "slides": slides,
    }


@router.post("/tts")
async def text_to_speech(req: TTSRequest, current_user: dict = Depends(get_current_user)):
    """
    Text ko speech mein convert karo using Edge TTS.
    Audio file generate hogi jo download ki ja sakti hai.
    
    Supported languages:
    - hi: Hindi (female voice)
    - en: English (female voice)
    """
    try:
        import edge_tts
        
        # Voice select karo language ke hisab se
        voices = {
            "hi": "hi-IN-SwaraNeural",     # Hindi female voice
            "en": "en-IN-NeerjaNeural",     # Indian English female voice
        }
        voice = voices.get(req.language, voices["hi"])
        
        # Unique filename banao
        filename = f"tts_{uuid.uuid4().hex[:8]}.mp3"
        filepath = f"/tmp/{filename}"
        
        # TTS generate karo
        communicate = edge_tts.Communicate(req.text, voice)
        await communicate.save(filepath)
        
        # Audio file return karo
        # BackgroundTask se response bhejne ke baad temp file delete hoga (disk leak prevention)
        cleanup = BackgroundTask(os.remove, filepath)
        return FileResponse(
            filepath,
            media_type="audio/mpeg",
            filename=filename,
            headers={"Content-Disposition": f"attachment; filename={filename}"},
            background=cleanup
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"TTS generation failed: {str(e)}"
        )


@router.get("/history")
async def get_chat_history(
    type: str | None = Query(None, description="Filter: chat, explain, doubt, notes"),
    subject: str | None = Query(None, description="Filter by subject"),
    limit: int = Query(20, ge=1, le=50, description="Number of messages"),
    current_user: dict = Depends(get_current_user)
):
    """
    AI tutor se chat history dekho.
    Optional filters: type (chat/explain/doubt/notes), subject.
    Latest messages pehle aayenge.
    """
    chat_coll = get_chat_history_collection()
    
    query = {"user_id": current_user["user_id"]}
    if type:
        query["type"] = type
    if subject:
        query["subject"] = subject.lower()
    
    cursor = chat_coll.find(query).sort("timestamp", -1).limit(limit)
    messages = await cursor.to_list(length=limit)
    
    # Serialize karo
    result = []
    for msg in messages:
        result.append({
            "id": str(msg["_id"]),
            "type": msg.get("type", "chat"),
            "subject": msg.get("subject", ""),
            "user_message": msg.get("user_message", ""),
            "ai_response": msg.get("ai_response", ""),
            "topic": msg.get("topic", ""),
            "timestamp": msg.get("timestamp", "")
        })
    
    return {"history": result, "total": len(result)}
