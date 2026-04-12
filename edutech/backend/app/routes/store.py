"""
Avatar Store Routes - Buy, Equip, Inventory
============================================
Ye module character/avatar store handle karta hai:
- GET  /store/avatars     → Available avatars ki list
- GET  /store/inventory   → Mere kharide hue avatars
- POST /store/buy         → Avatar kharido (XP se)
- POST /store/equip       → Avatar equip karo (active banao)
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from bson import ObjectId
from app.database import (
    get_avatars_collection, get_user_avatars_collection,
    get_users_collection, get_activity_log_collection
)
from app.utils.auth import get_current_user
from app.utils.helpers import serialize_doc, serialize_docs, get_current_timestamp, valid_object_id

router = APIRouter(prefix="/store", tags=["Avatar Store"])


# ============================
# Request Models
# ============================

class BuyAvatarRequest(BaseModel):
    """Avatar kharidne ka request"""
    avatar_id: str = Field(..., description="Avatar ka ID jo kharidna hai")


class EquipAvatarRequest(BaseModel):
    """Avatar equip karne ka request"""
    avatar_id: str = Field(..., description="Avatar ka ID jo equip karna hai")


# ============================
# Routes
# ============================

@router.get("/avatars")
async def list_avatars(current_user: dict = Depends(get_current_user)):
    """
    Store ke saare avatars dikhao.
    Har avatar ke saath batayenge:
    - Price (XP mein)
    - Rarity (common, rare, epic, legendary)
    - Kya user ke paas hai ya nahi
    - Kya user afford kar sakta hai ya nahi
    """
    avatars_coll = get_avatars_collection()
    user_avatars_coll = get_user_avatars_collection()
    users = get_users_collection()
    
    # User ka current XP lo
    user = await users.find_one({"_id": ObjectId(current_user["user_id"])})
    user_xp = user.get("xp", 0) if user else 0
    
    # Saare avatars lo
    all_avatars = await avatars_coll.find().sort("price", 1).to_list(length=100)
    
    # User ke owned avatars
    owned = await user_avatars_coll.find(
        {"user_id": current_user["user_id"]}
    ).to_list(length=100)
    owned_ids = {o["avatar_id"] for o in owned}
    
    # Current equipped avatar
    equipped_entry = None
    for o in owned:
        if o.get("equipped"):
            equipped_entry = o
            break
    
    equipped_avatar_id = equipped_entry["avatar_id"] if equipped_entry else None
    
    # Result banao
    result = []
    for avatar in all_avatars:
        aid = str(avatar["_id"])
        price = avatar.get("price", 0)
        result.append({
            "id": aid,
            "name": avatar.get("name", ""),
            "emoji": avatar.get("emoji", "🦁"),
            "description": avatar.get("description", ""),
            "rarity": avatar.get("rarity", "common"),
            "price": price,
            "owned": aid in owned_ids,
            "equipped": aid == equipped_avatar_id,
            "can_afford": user_xp >= price,
        })
    
    return {
        "avatars": result,
        "total": len(result),
        "user_xp": user_xp
    }


@router.get("/inventory")
async def get_inventory(current_user: dict = Depends(get_current_user)):
    """
    User ke kharide hue avatars ki list.
    Sirf owned avatars dikhenge.
    """
    avatars_coll = get_avatars_collection()
    user_avatars_coll = get_user_avatars_collection()
    
    # User ke owned avatars
    owned = await user_avatars_coll.find(
        {"user_id": current_user["user_id"]}
    ).to_list(length=100)
    
    # Avatar details lo
    inventory = []
    for o in owned:
        if valid_object_id(o["avatar_id"]):
            avatar = await avatars_coll.find_one({"_id": ObjectId(o["avatar_id"])})
            if avatar:
                inventory.append({
                    "id": str(avatar["_id"]),
                    "name": avatar.get("name", ""),
                    "emoji": avatar.get("emoji", "🦁"),
                    "description": avatar.get("description", ""),
                    "rarity": avatar.get("rarity", "common"),
                    "equipped": o.get("equipped", False),
                    "purchased_at": o.get("purchased_at", "")
                })
    
    return {"inventory": inventory, "total": len(inventory)}


@router.post("/buy")
async def buy_avatar(req: BuyAvatarRequest, current_user: dict = Depends(get_current_user)):
    """
    Avatar kharido XP se.
    
    Steps:
    1. Avatar exists check karo
    2. Pehle se owned toh nahi check karo
    3. XP enough hai ya nahi check karo
    4. XP deduct karo aur avatar inventory mein daalo
    
    Note: XP deduct NAHI hota - sirf minimum XP requirement check hota hai.
    Matlab agar avatar 500 XP ka hai toh user ke paas 500+ XP hona chahiye,
    lekin XP katega nahi.
    """
    if not valid_object_id(req.avatar_id):
        raise HTTPException(status_code=400, detail="Invalid avatar ID.")
    
    avatars_coll = get_avatars_collection()
    user_avatars_coll = get_user_avatars_collection()
    users = get_users_collection()
    
    # Step 1: Avatar check karo
    avatar = await avatars_coll.find_one({"_id": ObjectId(req.avatar_id)})
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found.")
    
    # Step 2: Already owned check
    existing = await user_avatars_coll.find_one({
        "user_id": current_user["user_id"],
        "avatar_id": req.avatar_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Ye avatar tumhare paas pehle se hai!")
    
    # Step 3: XP check karo
    user = await users.find_one({"_id": ObjectId(current_user["user_id"])})
    user_xp = user.get("xp", 0)
    price = avatar.get("price", 0)
    
    if user_xp < price:
        raise HTTPException(
            status_code=400,
            detail=f"XP kam hai! Tumhare paas {user_xp} XP hai, lekin is avatar ke liye {price} XP chahiye."
        )
    
    # Step 4: Inventory mein daalo
    await user_avatars_coll.insert_one({
        "user_id": current_user["user_id"],
        "avatar_id": req.avatar_id,
        "equipped": False,
        "purchased_at": get_current_timestamp()
    })
    
    # Activity log
    activity = get_activity_log_collection()
    await activity.insert_one({
        "user_id": current_user["user_id"],
        "action": "avatar_purchased",
        "details": {
            "avatar_id": req.avatar_id,
            "avatar_name": avatar.get("name", ""),
            "price": price
        },
        "timestamp": get_current_timestamp()
    })
    
    return {
        "message": f"Avatar '{avatar.get('name', '')}' successfully purchased!",
        "avatar": {
            "id": req.avatar_id,
            "name": avatar.get("name", ""),
            "emoji": avatar.get("emoji", "🦁"),
            "rarity": avatar.get("rarity", "common"),
        }
    }


@router.post("/equip")
async def equip_avatar(req: EquipAvatarRequest, current_user: dict = Depends(get_current_user)):
    """
    Avatar equip karo (active profile avatar set karo).
    
    Steps:
    1. Check karo ki avatar user ke inventory mein hai
    2. Pehle equipped avatar ko unequip karo
    3. New avatar equip karo
    4. User profile mein avatar update karo
    """
    if not valid_object_id(req.avatar_id):
        raise HTTPException(status_code=400, detail="Invalid avatar ID.")
    
    user_avatars_coll = get_user_avatars_collection()
    avatars_coll = get_avatars_collection()
    users = get_users_collection()
    
    # Step 1: Ownership check
    owned = await user_avatars_coll.find_one({
        "user_id": current_user["user_id"],
        "avatar_id": req.avatar_id
    })
    if not owned:
        raise HTTPException(
            status_code=400,
            detail="Ye avatar tumhare inventory mein nahi hai. Pehle kharido!"
        )
    
    # Step 2: Saare avatars unequip karo
    await user_avatars_coll.update_many(
        {"user_id": current_user["user_id"]},
        {"$set": {"equipped": False}}
    )
    
    # Step 3: Is avatar ko equip karo
    await user_avatars_coll.update_one(
        {"user_id": current_user["user_id"], "avatar_id": req.avatar_id},
        {"$set": {"equipped": True}}
    )
    
    # Step 4: User profile update karo
    avatar = await avatars_coll.find_one({"_id": ObjectId(req.avatar_id)})
    avatar_emoji = avatar.get("emoji", "🦁") if avatar else "🦁"
    
    await users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": {"avatar": avatar_emoji, "updated_at": get_current_timestamp()}}
    )
    
    return {
        "message": f"Avatar equipped! Ab tumhara avatar '{avatar_emoji}' hai.",
        "avatar": avatar_emoji
    }
