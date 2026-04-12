"""
Helper Utility Module - Common helper functions
================================================
Ye module common utility functions rakhta hai jo
multiple routes mein reuse hote hain.
"""

from datetime import datetime, timezone
from bson import ObjectId


def serialize_doc(doc: dict) -> dict:
    """
    MongoDB document ko JSON-serializable banao.
    MongoDB ka ObjectId JSON mein directly nahi jata,
    isliye usse string mein convert karna padta hai.
    
    Args:
        doc: MongoDB document (dict with _id as ObjectId)
    Returns:
        Dict with _id converted to string "id"
    """
    if doc is None:
        return None
    
    # _id ko string mein convert karo aur "id" key mein daalo
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    
    # Agar password_hash hai toh response mein mat bhejo (security)
    if "password_hash" in doc:
        del doc["password_hash"]
    
    return doc


def serialize_docs(docs: list) -> list:
    """
    Multiple MongoDB documents ko serialize karo.
    List of documents ke liye bulk conversion.
    
    Args:
        docs: List of MongoDB documents
    Returns:
        List of serialized dicts
    """
    return [serialize_doc(doc) for doc in docs]


def get_current_timestamp() -> str:
    """
    Current UTC timestamp return karo ISO format mein.
    Saare timestamps UTC mein store honge consistency ke liye.
    
    Returns:
        ISO format timestamp string (e.g., "2024-01-15T10:30:00Z")
    """
    return datetime.now(timezone.utc).isoformat()


def valid_object_id(id_string: str) -> bool:
    """
    Check karo ki given string valid MongoDB ObjectId hai ya nahi.
    Invalid IDs se 500 errors aa sakte hain, isliye pehle validate karo.
    
    Args:
        id_string: String to validate as ObjectId
    Returns:
        True agar valid ObjectId hai
    """
    try:
        ObjectId(id_string)
        return True
    except Exception:
        return False


def calculate_level(xp: int) -> int:
    """
    XP se user ka level calculate karo.
    Har 500 XP par ek level badhta hai.
    Minimum level 1 hota hai.
    
    Formula: level = (xp // 500) + 1
    Example: 0 XP = Level 1, 500 XP = Level 2, 1000 XP = Level 3
    
    Args:
        xp: User ka total XP
    Returns:
        User ka current level
    """
    return (xp // 500) + 1


def xp_for_next_level(xp: int) -> int:
    """
    Next level ke liye kitna aur XP chahiye wo calculate karo.
    
    Args:
        xp: User ka current total XP
    Returns:
        Kitna XP aur chahiye next level ke liye
    """
    return 500 - (xp % 500)
