"""Hash & token.

Secret dan umur token dibaca dari `settings` (env `JWT_SECRET`, `JWT_TTL_JAM`).
Defaultnya nilai dev yang sengaja bertuliskan "dev-only" — kalau nilai itu
sampai jalan di produksi, artinya `.env` belum dipasang.
"""

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import settings

# Keputusan teknis, bukan konfigurasi deployment — tidak perlu ke env.
JWT_ALGORITHM = "HS256"


def hash_rahasia(plain: str) -> bytes:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt())


def cocok_rahasia(plain: str, hashed: bytes) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed)


def buat_token(user_id: str) -> str:
    kedaluwarsa = datetime.now(timezone.utc) + timedelta(hours=settings.JWT_TTL_JAM)
    payload = {"sub": user_id, "exp": kedaluwarsa}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=JWT_ALGORITHM)


def urai_token(token: str) -> str | None:
    """`sub` (id user) dari token, atau `None` kalau tidak valid/kedaluwarsa."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except jwt.PyJWTError:
        return None
