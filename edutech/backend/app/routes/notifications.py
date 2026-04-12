"""
Notifications Routes - Get, Mark Read, Create
===============================================
Ye module notifications handle karta hai:
- GET  /notifications/          → Apni notifications dekho
- GET  /notifications/unread-count → Unread count lo
- PUT  /notifications/{id}/read → Notification read mark karo
- PUT  /notifications/read-all  → Saari notifications read mark karo
- POST /notifications/          → Notification create karo (internal use)
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from bson import ObjectId
from app.database import get_notifications_collection
from app.utils.auth import get_current_user, require_admin
from app.utils.helpers import serialize_doc, get_current_timestamp, valid_object_id

router = APIRouter(prefix="/notifications", tags=["Notifications"])


# ============================
# Request Models
# ============================

class CreateNotificationRequest(BaseModel):
    """Notification create karne ka request (admin/system use)"""
    user_id: str = Field(..., description="Kis user ko notification bhejna hai")
    type: str = Field(default="info", description="Type: info, achievement, reminder, alert")
    title: str = Field(..., min_length=1, description="Notification title")
    message: str = Field(..., min_length=1, description="Notification message body")


# ============================
# Routes
# ============================

@router.get("/")
async def get_notifications(
    unread_only: bool = Query(False, description="Sirf unread notifications dikhao"),
    limit: int = Query(20, ge=1, le=50, description="Kitni notifications chahiye"),
    current_user: dict = Depends(get_current_user)
):
    """
    Current user ki notifications return karo.
    Latest pehle aayegi. Optional: sirf unread dikhao.
    """
    notif_coll = get_notifications_collection()
    
    query = {"user_id": current_user["user_id"]}
    if unread_only:
        query["read"] = False
    
    cursor = notif_coll.find(query).sort("created_at", -1).limit(limit)
    notifications = await cursor.to_list(length=limit)
    
    # Serialize karo
    result = []
    for n in notifications:
        result.append({
            "id": str(n["_id"]),
            "type": n.get("type", "info"),
            "title": n.get("title", ""),
            "message": n.get("message", ""),
            "read": n.get("read", False),
            "created_at": n.get("created_at", "")
        })
    
    return {"notifications": result, "total": len(result)}


@router.get("/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """
    Unread notifications ka count return karo.
    Frontend mein notification bell par number dikhane ke liye.
    """
    notif_coll = get_notifications_collection()
    
    count = await notif_coll.count_documents({
        "user_id": current_user["user_id"],
        "read": False
    })
    
    return {"unread_count": count}


@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    """
    Ek notification ko read mark karo.
    User ne notification dekh liya toh read=True set hoga.
    """
    if not valid_object_id(notification_id):
        raise HTTPException(status_code=400, detail="Invalid notification ID.")
    
    notif_coll = get_notifications_collection()
    
    result = await notif_coll.update_one(
        {"_id": ObjectId(notification_id), "user_id": current_user["user_id"]},
        {"$set": {"read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found.")
    
    return {"message": "Notification marked as read."}


@router.put("/read-all")
async def mark_all_as_read(current_user: dict = Depends(get_current_user)):
    """
    Saari notifications ko read mark karo.
    'Mark all as read' button ke liye.
    """
    notif_coll = get_notifications_collection()
    
    result = await notif_coll.update_many(
        {"user_id": current_user["user_id"], "read": False},
        {"$set": {"read": True}}
    )
    
    return {
        "message": f"{result.modified_count} notifications marked as read.",
        "updated_count": result.modified_count
    }


@router.post("/", status_code=201)
async def create_notification(
    req: CreateNotificationRequest,
    current_user: dict = Depends(require_admin)
):
    """
    Notification create karo kisi user ke liye.
    Sirf admin hi notification bhej sakta hai - security ke liye.
    Ye mainly system/admin use ke liye hai - badges, reminders, alerts ke liye.
    
    Types:
    - info: General information
    - achievement: Badge/milestone achieved
    - reminder: Study reminder, streak warning
    - alert: Important alerts
    """
    if not valid_object_id(req.user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID.")
    
    valid_types = ["info", "achievement", "reminder", "alert"]
    if req.type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid notification type. Valid: {valid_types}"
        )
    
    notif_coll = get_notifications_collection()
    
    notif_doc = {
        "user_id": req.user_id,
        "type": req.type,
        "title": req.title,
        "message": req.message,
        "read": False,
        "created_at": get_current_timestamp()
    }
    
    result = await notif_coll.insert_one(notif_doc)
    
    return {
        "message": "Notification created!",
        "notification_id": str(result.inserted_id)
    }
