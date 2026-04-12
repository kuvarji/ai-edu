"""
Database Connection Module - MongoDB Atlas se connect karne ke liye
=================================================================
Ye module MongoDB Atlas se async connection banata hai using Motor driver.
Saari collections yahan define hain jo poore app mein use hoti hain.
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# .env file se environment variables load karo
load_dotenv()

# MongoDB Atlas connection URI (.env file se aayegi)
MONGODB_URI = os.getenv("MONGODB_ATLAS_URI", "mongodb://localhost:27017")

# Database name
DATABASE_NAME = "ai_edu"

# MongoDB client instance (async)
client: AsyncIOMotorClient = None  # type: ignore

# Database reference (startup par set hoga)
db = None


async def connect_to_mongodb():
    """
    MongoDB se connection establish karo.
    Ye function app startup par call hota hai.
    """
    global client, db
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    print(f"MongoDB Atlas se connected: {DATABASE_NAME}")


async def close_mongodb_connection():
    """
    MongoDB connection band karo.
    Ye function app shutdown par call hota hai.
    """
    global client
    if client:
        client.close()
        print("MongoDB connection closed.")


def get_database():
    """
    Database reference return karo.
    Routes mein isse use karenge collections access karne ke liye.
    """
    return db


# ============================================
# Collections ka reference (convenience ke liye)
# ============================================

def get_users_collection():
    """Users collection - saare registered users ka data"""
    return db["users"]

def get_courses_collection():
    """Courses collection - saare courses (Math, Science, etc.)"""
    return db["courses"]

def get_chapters_collection():
    """Chapters collection - har course ke chapters"""
    return db["chapters"]

def get_progress_collection():
    """Progress collection - user ka course/chapter progress"""
    return db["progress"]

def get_quiz_questions_collection():
    """Quiz Questions collection - MCQ questions bank"""
    return db["quiz_questions"]

def get_quiz_results_collection():
    """Quiz Results collection - user ke quiz attempts aur scores"""
    return db["quiz_results"]

def get_badges_collection():
    """Badges collection - achievements/badges definitions"""
    return db["badges"]

def get_user_badges_collection():
    """User Badges collection - user ne kaunse badges unlock kiye"""
    return db["user_badges"]

def get_avatars_collection():
    """Avatars collection - character store ke avatars"""
    return db["avatars"]

def get_user_avatars_collection():
    """User Avatars collection - user ne kaunse avatars kharide"""
    return db["user_avatars"]

def get_chat_history_collection():
    """Chat History collection - AI tutor se chat history"""
    return db["chat_history"]

def get_notifications_collection():
    """Notifications collection - user ki notifications"""
    return db["notifications"]

def get_activity_log_collection():
    """Activity Log collection - platform activity tracking"""
    return db["activity_log"]

def get_parent_child_collection():
    """Parent-Child collection - parent aur child ka link"""
    return db["parent_child"]
