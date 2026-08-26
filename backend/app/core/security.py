"""Hash password.

Token sesi TIDAK di sini — sejak sesi tersimpan di server, token cuma nomor
acak tanpa arti dan tidak ada yang ditandatangani. Lihat `app/data/sesi.py`.
"""

import bcrypt


def hash_rahasia(plain: str) -> bytes:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt())


def cocok_rahasia(plain: str, hashed: bytes) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed)
