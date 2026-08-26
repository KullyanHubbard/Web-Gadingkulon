"""Skema autentikasi — cerminan `frontend/src/features/auth/types.ts`.
Bentuknya wajib sama; kalau salah satu berubah, ubah dua-duanya.

Warga tidak punya akun (spec 2026-08-26), jadi tidak ada skema PIN,
aktivasi, maupun kontak di sini.
"""

from typing import Literal, Optional

from pydantic import BaseModel

Role = Literal["ADMIN", "PENGURUS"]


class AuthUser(BaseModel):
    id: str
    nama: str
    username: str
    role: Role
    # Wilayah kerja. NULL untuk Dukuh; `rt` NULL untuk Ketua RW.
    rw: Optional[str] = None
    rt: Optional[str] = None
    # Diturunkan dari role+rw+rt, tidak disimpan di DB.
    jabatan: str


class PetugasCredentials(BaseModel):
    username: str
    password: str


class Session(BaseModel):
    token: str
    user: AuthUser
