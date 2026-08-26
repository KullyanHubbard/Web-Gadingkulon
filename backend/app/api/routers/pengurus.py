"""Kelola akun perangkat desa. ADMIN saja.

Yang dikelola adalah **kursi** (Dukuh, Ketua RW 019, Ketua RT 001, …), bukan
sekadar daftar akun: satu kursi dihuni satu orang, dan orangnya berganti
sewaktu-waktu. Daftar kursinya diturunkan dari alamat warga di data penduduk.

Tidak ada DELETE: akun yang pernah dipakai tidak dihapus, cukup dinonaktifkan
(`aktif = 0`). Menghapusnya membuat jejak audit menunjuk ke akun yang tidak
ada lagi.

**Tidak ada cara mengosongkan kursi dari sini.** Kursi hanya menjadi kosong
lewat pergantian yang disetujui (`app/api/routers/pergantian.py`). Kalau Admin
masih bisa mencabut akses sendiri, ia bisa mengosongkan kursi lalu mengisinya
langsung — dan seluruh mekanisme persetujuan jadi hiasan yang bisa dilewati
dalam dua klik.
"""

from fastapi import APIRouter, Depends, HTTPException

from app.api.routers.auth import current_admin, ke_auth_user
from app.core.audit import catat_audit
from app.data import pengurus as data
from app.schemas.auth import AuthUser
from app.schemas.pengurus import (
    CalonOut,
    KursiOut,
    PasswordBaru,
    PengurusBaru,
    PengurusOut,
)

router = APIRouter(
    prefix="/pengurus",
    tags=["pengurus"],
    dependencies=[Depends(current_admin)],
)


def _keluaran(p: data.Pengurus) -> PengurusOut:
    return PengurusOut(**ke_auth_user(p).model_dump(), aktif=p.aktif)


@router.get("", response_model=list[KursiOut])
def daftar_kursi() -> list[KursiOut]:
    """Seluruh kursi padukuhan, terisi maupun kosong.

    Yang dikembalikan kursi, bukan akun: halaman Admin memang menampilkan
    jabatan yang ada di padukuhan, termasuk yang belum ada penghuninya.
    """
    return [
        KursiOut(
            kursi=k.kursi,
            role=k.role,  # type: ignore[arg-type]
            rw=k.rw,
            rt=k.rt,
            jabatan=k.jabatan,
            penghuni=_keluaran(k.penghuni) if k.penghuni else None,
            calon=CalonOut(id=k.calon.id, nama=k.calon.nama) if k.calon else None,
        )
        for k in data.daftar_kursi()
    ]


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


@router.post("/{id}/reset-password", status_code=204)
def reset_password(
    id: str, payload: PasswordBaru, admin: AuthUser = Depends(current_admin)
) -> None:
    target = data.cari_by_id(id)
    if target is None or not data.ganti_password(
        id, payload.password, oleh_admin=True
    ):
        raise HTTPException(404, "Akun pengurus tidak ditemukan.")
    catat_audit(aktor=admin.username, aksi="reset-password", target=target.username)
