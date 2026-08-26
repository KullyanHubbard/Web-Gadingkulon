"""Payload kelola akun pengurus — cerminan `frontend/src/features/pengurus/types.ts`."""

from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.auth import Role


class PengurusBaru(BaseModel):
    username: str = Field(min_length=3, max_length=32)
    password: str = Field(min_length=8)
    nama: str = Field(min_length=1)
    role: Role
    rw: Optional[str] = None
    rt: Optional[str] = None


class PengurusUbah(BaseModel):
    """Field yang tidak dikirim tidak diubah. `rw`/`rt` bernilai null berarti
    dikosongkan — bedanya ditangkap lewat `model_fields_set`."""

    nama: Optional[str] = None
    rw: Optional[str] = None
    rt: Optional[str] = None
    aktif: Optional[bool] = None


class PasswordBaru(BaseModel):
    password: str = Field(min_length=8)
