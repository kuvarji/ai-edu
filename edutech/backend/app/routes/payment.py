"""
Payment Routes - Razorpay Integration + Membership System
==========================================================
Ye module payment aur membership handle karta hai:
- POST /payment/create-order   -> Razorpay order banao
- POST /payment/verify          -> Payment verify karo + membership activate
- GET  /payment/status          -> Current membership status dekho
- GET  /payment/history         -> Payment history dekho
"""

import os
import hmac
import hashlib
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field
from bson import ObjectId
from app.database import get_users_collection
from app.utils.auth import get_current_user
from app.utils.helpers import get_current_timestamp
from dotenv import load_dotenv

load_dotenv()

# Router banao
router = APIRouter(prefix="/payment", tags=["Payment & Membership"])

# Razorpay credentials
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

# Membership Plans
MEMBERSHIP_PLANS = {
    "pro": {
        "name": "Pro Membership",
        "amount": 29900,  # Amount in paise (₹299 = 29900 paise)
        "currency": "INR",
        "duration_days": 30,
        "features": [
            "All Courses Access",
            "Advanced AI Tutor",
            "Unlimited Quizzes",
            "Priority Support",
            "Premium Avatars",
            "Parent Dashboard",
            "Progress Reports",
            "Unlimited AI Chat",
            "Unlimited AI Video Lessons",
        ],
        "description": "Full access to all premium features for 30 days",
    }
}


# ============================
# Request/Response Models
# ============================

class CreateOrderRequest(BaseModel):
    """Order create karne ke liye plan_id chahiye"""
    plan_id: str = Field(default="pro", description="Membership plan ID")


class VerifyPaymentRequest(BaseModel):
    """Payment verify karne ke liye Razorpay payment details chahiye"""
    razorpay_order_id: str = Field(..., description="Razorpay Order ID")
    razorpay_payment_id: str = Field(..., description="Razorpay Payment ID")
    razorpay_signature: str = Field(..., description="Razorpay Signature for verification")


# ============================
# Helper Functions
# ============================

async def create_razorpay_order(order_data: dict) -> dict:
    """Razorpay REST API se order create karo (no razorpay library needed)"""
    import httpx
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Razorpay API keys configured nahi hain. Admin se contact karo."
        )
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.razorpay.com/v1/orders",
            json=order_data,
            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
            timeout=30.0,
        )
        if resp.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"Razorpay order create failed: {resp.text}"
            )
        return resp.json()


def verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """
    Razorpay payment signature verify karo.
    Ye ensure karta hai ki payment tamper nahi hua hai.
    """
    message = f"{order_id}|{payment_id}"
    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected_signature, signature)


def get_payments_collection():
    """Payments collection ka reference do"""
    from app.database import db
    return db["payments"]


# ============================
# Routes
# ============================

@router.get("/plans")
async def get_plans():
    """
    Available membership plans return karo.
    Frontend pe pricing page ke liye.
    """
    plans = []
    for plan_id, plan in MEMBERSHIP_PLANS.items():
        plans.append({
            "id": plan_id,
            "name": plan["name"],
            "amount": plan["amount"],
            "amount_display": f"₹{plan['amount'] // 100}",
            "currency": plan["currency"],
            "duration_days": plan["duration_days"],
            "features": plan["features"],
            "description": plan["description"],
        })
    return {"plans": plans}


@router.post("/create-order")
async def create_order(req: CreateOrderRequest, current_user: dict = Depends(get_current_user)):
    """
    Razorpay order create karo.
    Frontend Razorpay checkout ko ye order_id dega.
    """
    # Plan validate karo
    plan = MEMBERSHIP_PLANS.get(req.plan_id)
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan ID.")
    
    # User info lo
    users = get_users_collection()
    user = await users.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    # Check agar already premium hai
    membership = user.get("membership", {})
    if membership.get("status") == "active":
        expires = membership.get("expires_at", "")
        if expires:
            try:
                exp_date = datetime.fromisoformat(expires.replace("Z", "+00:00"))
                if exp_date > datetime.now(timezone.utc):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Aapki membership abhi active hai! Expire hogi: {exp_date.strftime('%d %B %Y')}"
                    )
            except (ValueError, TypeError):
                pass
    
    # Razorpay order create karo (direct REST API call)
    order_data = {
        "amount": plan["amount"],
        "currency": plan["currency"],
        "receipt": f"ord_{int(datetime.now(timezone.utc).timestamp())}",
        "notes": {
            "user_id": current_user["user_id"],
            "plan_id": req.plan_id,
            "user_email": user.get("email", ""),
        }
    }
    
    order = await create_razorpay_order(order_data)
    
    # Order database mein save karo
    payments = get_payments_collection()
    await payments.insert_one({
        "user_id": current_user["user_id"],
        "razorpay_order_id": order["id"],
        "plan_id": req.plan_id,
        "amount": plan["amount"],
        "currency": plan["currency"],
        "status": "created",
        "created_at": get_current_timestamp(),
    })
    
    return {
        "order_id": order["id"],
        "amount": plan["amount"],
        "currency": plan["currency"],
        "key_id": RAZORPAY_KEY_ID,
        "name": "AI Education Platform",
        "description": plan["description"],
        "prefill": {
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "contact": user.get("phone", ""),
        },
    }


@router.post("/verify")
async def verify_payment(req: VerifyPaymentRequest, current_user: dict = Depends(get_current_user)):
    """
    Razorpay payment verify karo aur membership activate karo.
    Frontend payment complete hone ke baad ye call karega.
    """
    # Signature verify karo
    is_valid = verify_razorpay_signature(
        req.razorpay_order_id,
        req.razorpay_payment_id,
        req.razorpay_signature
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail="Payment signature invalid hai. Payment verify nahi ho saka."
        )
    
    # Order database mein find karo
    payments = get_payments_collection()
    order = await payments.find_one({
        "razorpay_order_id": req.razorpay_order_id,
        "user_id": current_user["user_id"],
    })
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    
    if order.get("status") == "paid":
        raise HTTPException(status_code=400, detail="Ye payment pehle se verify ho chuka hai.")
    
    # Plan details lo
    plan_id = order.get("plan_id", "pro")
    plan = MEMBERSHIP_PLANS.get(plan_id, MEMBERSHIP_PLANS["pro"])
    
    # Payment record update karo
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=plan["duration_days"])
    
    await payments.update_one(
        {"_id": order["_id"]},
        {"$set": {
            "status": "paid",
            "razorpay_payment_id": req.razorpay_payment_id,
            "razorpay_signature": req.razorpay_signature,
            "paid_at": get_current_timestamp(),
        }}
    )
    
    # User ki membership activate karo
    users = get_users_collection()
    await users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": {
            "subscription": "pro",
            "membership": {
                "plan_id": plan_id,
                "status": "active",
                "started_at": now.isoformat(),
                "expires_at": expires_at.isoformat(),
                "payment_id": req.razorpay_payment_id,
            },
            "updated_at": get_current_timestamp(),
        }}
    )
    
    return {
        "message": "Payment successful! Pro membership activated.",
        "membership": {
            "plan": plan_id,
            "status": "active",
            "started_at": now.isoformat(),
            "expires_at": expires_at.isoformat(),
            "features": plan["features"],
        }
    }


@router.get("/status")
async def get_membership_status(current_user: dict = Depends(get_current_user)):
    """
    User ki current membership status return karo.
    """
    users = get_users_collection()
    user = await users.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    membership = user.get("membership", {})
    subscription = user.get("subscription", "free")
    
    # Check agar membership expire ho gayi hai
    if membership.get("status") == "active" and membership.get("expires_at"):
        try:
            exp_date = datetime.fromisoformat(membership["expires_at"].replace("Z", "+00:00"))
            if exp_date <= datetime.now(timezone.utc):
                # Membership expire ho gayi — update karo
                await users.update_one(
                    {"_id": ObjectId(current_user["user_id"])},
                    {"$set": {
                        "subscription": "free",
                        "membership.status": "expired",
                        "updated_at": get_current_timestamp(),
                    }}
                )
                subscription = "free"
                membership["status"] = "expired"
        except (ValueError, TypeError):
            pass
    
    # Pro plan features
    pro_plan = MEMBERSHIP_PLANS["pro"]
    
    return {
        "subscription": subscription,
        "membership": {
            "plan_id": membership.get("plan_id", ""),
            "status": membership.get("status", "none"),
            "started_at": membership.get("started_at", ""),
            "expires_at": membership.get("expires_at", ""),
        },
        "is_premium": subscription == "pro" and membership.get("status") == "active",
        "features": pro_plan["features"] if subscription == "pro" and membership.get("status") == "active" else [],
        "xp": user.get("xp", 0),
    }


@router.get("/history")
async def get_payment_history(current_user: dict = Depends(get_current_user)):
    """
    User ki payment history return karo.
    """
    payments = get_payments_collection()
    cursor = payments.find(
        {"user_id": current_user["user_id"]}
    ).sort("created_at", -1).limit(20)
    
    history = []
    async for payment in cursor:
        plan = MEMBERSHIP_PLANS.get(payment.get("plan_id", "pro"), MEMBERSHIP_PLANS["pro"])
        history.append({
            "id": str(payment["_id"]),
            "plan": payment.get("plan_id", "pro"),
            "plan_name": plan["name"],
            "amount": payment.get("amount", 0),
            "amount_display": f"₹{payment.get('amount', 0) // 100}",
            "status": payment.get("status", "unknown"),
            "created_at": payment.get("created_at", ""),
            "paid_at": payment.get("paid_at", ""),
        })
    
    return {"payments": history, "total": len(history)}
