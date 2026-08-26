"""Riwayat perubahan: siapa mengubah apa, kapan, dari apa jadi apa.

Yang dilihat mengikuti kewenangan, dan dua daftarnya berpotongan kosong —
sama seperti kewenangan yang menghasilkannya:

- **PENGURUS** melihat riwayat data warga, disaring wilayahnya sendiri.
- **ADMIN** melihat riwayat kelola akun, dan tidak pernah melihat riwayat data
  warga — sama seperti ia tidak boleh melihat datanya.
"""

from fastapi import APIRouter, Depends, HTTPException

from app.api.routers.auth import current_user
from app.core import audit
from app.core.audit import AKSI_AKUN, AKSI_WARGA
from app.data.store import penduduk_untuk
from app.schemas.audit import CatatanAudit
from app.schemas.auth import ROLE_PENGURUS, AuthUser

router = APIRouter(tags=["audit"])


def _keluaran(r: dict) -> CatatanAudit:
    return CatatanAudit(
        id=r["id"],
        waktu=r["waktu"],
        aktor=r["aktor"],
        aksi=r["aksi"],
        sasaran=r["sasaran"],
        sasaranId=r["sasaran_id"],
        perubahan=r["perubahan"],
    )


@router.get("/audit", response_model=list[CatatanAudit])
def riwayat(user: AuthUser = Depends(current_user)) -> list[CatatanAudit]:
    """Riwayat yang boleh dibaca orang ini.

    Sengaja memakai `current_user`, bukan `current_pengurus` atau
    `current_admin`: dua peran memakai endpoint yang sama tapi mendapat isi
    yang berbeda, dan pembagiannya ditentukan di sini.
    """
    if user.role == "ADMIN":
        return [_keluaran(r) for r in audit.riwayat(AKSI_AKUN)]

    if user.role not in ROLE_PENGURUS:
        raise HTTPException(403, "Peran ini tidak punya riwayat untuk dibaca.")

    # Disaring per wilayah lewat warga yang boleh dilihat pemanggilnya. Warga
    # yang sudah pindah keluar wilayahnya ikut hilang dari riwayat — konsisten
    # dengan daftar penduduk, yang juga tidak lagi menampilkannya.
    boleh = {w.id for w in penduduk_untuk(user)}
    return [
        _keluaran(r)
        for r in audit.riwayat(AKSI_WARGA)
        if r["sasaran_id"] in boleh
    ]
