"""Payload kelola akun pengurus — cerminan `frontend/src/features/pengurus/types.ts`."""

from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.auth import AuthUser, Role


class PengurusOut(AuthUser):
    """Akun pengurus untuk halaman kelola akun: `AuthUser` + status aktif.

    `aktif` sengaja tidak ikut `AuthUser` biasa — di dalam sesi nilainya selalu
    True (yang nonaktif tidak bisa masuk), jadi mengirimkannya di sana cuma
    menyiratkan pilihan yang tidak ada.
    """

    aktif: bool


class KursiOut(BaseModel):
    """Satu jabatan di padukuhan, terisi maupun kosong.

    Daftarnya diturunkan dari alamat warga, bukan disimpan — lihat
    `app/data/pengurus.py:daftar_kursi`.
    """

    kursi: str
    role: Role
    rw: Optional[str] = None
    rt: Optional[str] = None
    jabatan: str
    penghuni: Optional[PengurusOut] = None


class PengurusBaru(BaseModel):
    """Mengisi satu kursi kosong. `role`/`rw`/`rt` menunjuk kursi mana."""

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
