"""Kelola akun perangkat desa. ADMIN saja.

Tidak ada DELETE: akun yang pernah dipakai tidak dihapus, cukup dinonaktifkan
(`aktif = 0`). Menghapusnya membuat jejak audit menunjuk ke akun yang tidak
ada lagi.
"""

from fastapi import APIRouter, Depends, HTTPException

from app.api.routers.auth import current_admin, ke_auth_user
from app.core.audit import catat_audit
from app.data import pengurus as data
from app.schemas.auth import AuthUser
from app.schemas.pengurus import (
    PasswordBaru,
    PengurusBaru,
    PengurusOut,
    PengurusUbah,
)

router = APIRouter(
    prefix="/pengurus",
    tags=["pengurus"],
    dependencies=[Depends(current_admin)],
)


def _keluaran(p: data.Pengurus) -> PengurusOut:
    return PengurusOut(**ke_auth_user(p).model_dump(), aktif=p.aktif)


@router.get("", response_model=list[PengurusOut])
def daftar_pengurus() -> list[PengurusOut]:
    return [_keluaran(p) for p in data.daftar()]


@router.post("", response_model=PengurusOut, status_code=201)
def tambah_pengurus(
    payload: PengurusBaru, admin: AuthUser = Depends(current_admin)
) -> PengurusOut:
    try:
        baru = data.tambah(
            username=payload.username,
            password=payload.password,
            nama=payload.nama,
            role=payload.role,
            rw=payload.rw,
            rt=payload.rt,
        )
    except ValueError as e:
        raise HTTPException(409, str(e))
    catat_audit(aktor=admin.username, aksi="tambah-pengurus", target=baru.username)
    return _keluaran(baru)


@router.patch("/{id}", response_model=PengurusOut)
def ubah_pengurus(
    id: str, payload: PengurusUbah, admin: AuthUser = Depends(current_admin)
) -> PengurusOut:
    dikirim = payload.model_fields_set
    hasil = data.ubah(
        id,
        nama=payload.nama,
        rw=payload.rw if "rw" in dikirim else data.TETAP,
        rt=payload.rt if "rt" in dikirim else data.TETAP,
        aktif=payload.aktif,
    )
    if hasil is None:
        raise HTTPException(404, "Akun pengurus tidak ditemukan.")
    catat_audit(
        aktor=admin.username,
        aksi="ubah-pengurus",
        target=hasil.username,
        catatan=", ".join(sorted(dikirim)),
    )
    return _keluaran(hasil)


@router.post("/{id}/reset-password", status_code=204)
def reset_password(
    id: str, payload: PasswordBaru, admin: AuthUser = Depends(current_admin)
) -> None:
    target = data.cari_by_id(id)
    if target is None or not data.ganti_password(id, payload.password):
        raise HTTPException(404, "Akun pengurus tidak ditemukan.")
    catat_audit(aktor=admin.username, aksi="reset-password", target=target.username)
