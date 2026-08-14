"""Hash & token untuk backend dummy.

Secret JWT ditulis polos di sini karena datanya dummy dan cuma jalan lokal.
Saat backend beneran dipakai produksi, pindahkan ke env var.
"""

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

JWT_SECRET = "dummy-secret-nia-backend"
JWT_ALGORITHM = "HS256"
JWT_TTL = timedelta(hours=12)


def hash_rahasia(plain: str) -> bytes:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt())


def cocok_rahasia(plain: str, hashed: bytes) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed)


def buat_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + JWT_TTL}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def urai_token(token: str) -> str | None:
    """`sub` (id user) dari token, atau `None` kalau tidak valid/kedaluwarsa."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except jwt.PyJWTError:
        return None
