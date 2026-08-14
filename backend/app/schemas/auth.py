"""Cerminan frontend/src/features/auth/types.ts."""

from typing import Literal, Optional

from pydantic import BaseModel

Role = Literal["USER", "ADMIN"]


class AuthUser(BaseModel):
    id: str
    nama: str
    role: Role
    nik: str
    username: Optional[str] = None
    jabatan: Optional[str] = None
    noHp: Optional[str] = None
    email: Optional[str] = None


class Session(BaseModel):
    token: str
    user: AuthUser


class WargaCredentials(BaseModel):
    nik: str
    pin: str


class PetugasCredentials(BaseModel):
    username: str
    password: str


class AktivasiCek(BaseModel):
    nik: str
    tanggalLahir: str


class AktivasiTiket(BaseModel):
    tiket: str
    nama: str


class SetPinPayload(BaseModel):
    tiket: str
    pin: str


class KontakPayload(BaseModel):
    noHp: Optional[str] = None
    email: Optional[str] = None
