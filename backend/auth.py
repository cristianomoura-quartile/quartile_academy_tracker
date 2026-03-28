import bcrypt
import jwt
import os
import secrets
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Request
from bson import ObjectId

JWT_ALGORITHM = "HS256"

def get_jwt_secret():
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request, db) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(*roles):
    """Returns a dependency that checks the user has one of the specified roles."""
    async def checker(user: dict):
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return checker

async def seed_users(db, logger):
    """Seed admin, instructor, and student users."""
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@quartile.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")

    users_to_seed = [
        {"email": admin_email, "password": admin_password, "name": "Admin", "role": "admin"},
        {"email": "instructor@quartile.com", "password": "instructor123", "name": "Felipe Tahara", "role": "instructor"},
        {"email": "student@quartile.com", "password": "student123", "name": "Ana Reyes", "role": "student"},
    ]

    for u in users_to_seed:
        existing = await db.users.find_one({"email": u["email"]})
        if not existing:
            await db.users.insert_one({
                "email": u["email"],
                "password_hash": hash_password(u["password"]),
                "name": u["name"],
                "role": u["role"],
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            logger.info(f"Seeded user: {u['email']} ({u['role']})")
        else:
            if not verify_password(u["password"], existing.get("password_hash", "")):
                await db.users.update_one({"email": u["email"]}, {"$set": {"password_hash": hash_password(u["password"])}})

    await db.users.create_index("email", unique=True)
