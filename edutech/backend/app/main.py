"""
AI Education Platform - Backend API
=====================================
Ye main entry point hai FastAPI backend ka.
Saare routes yahan import aur register hote hain.
MongoDB connection startup/shutdown par manage hota hai.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Database connection functions
from app.database import connect_to_mongodb, close_mongodb_connection

# Saare route modules import karo
from app.routes import auth, courses, quiz, gamification, store, ai, parent, admin, analytics, notifications, payment


# ============================
# App Lifespan (Startup/Shutdown)
# ============================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    App ka lifecycle manage karo.
    Startup par MongoDB connect karo, shutdown par disconnect karo.
    """
    # Startup: MongoDB se connect karo
    await connect_to_mongodb()
    print("AI Education Platform Backend started!")
    
    yield  # App chal raha hai
    
    # Shutdown: MongoDB connection band karo
    await close_mongodb_connection()
    print("AI Education Platform Backend stopped.")


# ============================
# FastAPI App Instance
# ============================

app = FastAPI(
    title="AI Education Platform API",
    description="Complete backend API for AI-powered gamified education platform with courses, quizzes, AI tutor, gamification, and more.",
    version="1.0.0",
    lifespan=lifespan,
)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


# ============================
# Routes Register Karo
# ============================

# Auth routes: /auth/register, /auth/login, /auth/me, /auth/password
app.include_router(auth.router)

# Course routes: /courses/, /courses/{id}, /courses/{id}/chapters, /courses/progress
app.include_router(courses.router)

# Quiz routes: /quiz/start, /quiz/submit, /quiz/history
app.include_router(quiz.router)

# Gamification routes: /gamification/stats, /gamification/leaderboard, /gamification/badges
app.include_router(gamification.router)

# Avatar Store routes: /store/avatars, /store/buy, /store/equip, /store/inventory
app.include_router(store.router)

# AI Tutor routes: /ai/chat, /ai/explain, /ai/doubt, /ai/notes, /ai/tts
app.include_router(ai.router)

# Parent Dashboard routes: /parent/link-child, /parent/children, /parent/child/{id}/progress
app.include_router(parent.router)

# Admin Dashboard routes: /admin/stats, /admin/users, /admin/courses, /admin/badges, etc.
app.include_router(admin.router)

# Analytics routes: /analytics/study-time, /analytics/performance, /analytics/weak-areas
app.include_router(analytics.router)

# Notifications routes: /notifications/, /notifications/unread-count, /notifications/read-all
app.include_router(notifications.router)

# Payment & Membership routes: /payment/create-order, /payment/verify, /payment/status, /payment/history
app.include_router(payment.router)


# ============================
# Health Check Endpoint
# ============================

@app.get("/healthz")
async def healthz():
    """Health check endpoint - server alive hai ya nahi check karo."""
    return {"status": "ok"}


@app.get("/")
async def root():
    """Root endpoint - API ka welcome message aur info."""
    return {
        "name": "AI Education Platform API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "auth": "/auth",
            "courses": "/courses",
            "quiz": "/quiz",
            "gamification": "/gamification",
            "store": "/store",
            "ai": "/ai",
            "parent": "/parent",
            "admin": "/admin",
            "analytics": "/analytics",
            "notifications": "/notifications",
        }
    }
