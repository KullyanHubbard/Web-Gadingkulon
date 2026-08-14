from collections import Counter

from fastapi import APIRouter

from app.data.dummy import DAFTAR_PENDUDUK
from app.schemas.penduduk import Distribusi, StatistikPublik

router = APIRouter(tags=["publik"])


def _format_rw(rw: str) -> str:
    """`'019'` -> `'RW 19'` — cerminan `frontend/src/lib/wilayah.ts`."""
    return f"RW {rw.lstrip('0') or rw}"


@router.get("/publik/statistik", response_model=StatistikPublik)
def statistik_publik() -> StatistikPublik:
    """Cacah saja — tanpa NIK, nama, atau alamat. Endpoint ini terbuka tanpa
    autentikasi (lihat CLAUDE.md §11), jadi jangan tambah field lain di sini.
    """
    counter = Counter(p.alamat.rw for p in DAFTAR_PENDUDUK)
    per_rw = [
        Distribusi(label=_format_rw(rw), value=jumlah)
        for rw, jumlah in sorted(counter.items())
    ]
    return StatistikPublik(totalPenduduk=len(DAFTAR_PENDUDUK), perRw=per_rw)
