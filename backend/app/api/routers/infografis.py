from fastapi import APIRouter, Depends

from app.api.routers.auth import current_pengurus
from app.data.agregat import (
    distribusi_by,
    distribusi_kelompok_umur,
    distribusi_pendidikan,
    format_rw,
)
from app.data.store import hanya_aktif, penduduk_untuk
from app.schemas.auth import AuthUser
from app.schemas.infografis import InfografisData

router = APIRouter(tags=["infografis"])


@router.get("/infografis", response_model=InfografisData)
async def infografis(user: AuthUser = Depends(current_pengurus)) -> InfografisData:
    """Agregat wilayah pemanggilnya, bukan seluruh padukuhan.

    Grafik Ketua RT 004 jadi tentang RT 004 saja — termasuk `perDusun`, yang
    karena itu cuma berisi satu batang. Wajar, bukan cacat.
    """
    # Yang pindah & meninggal tidak ikut dihitung: ini gambaran siapa yang
    # tinggal di sini sekarang, bukan siapa yang pernah tercatat.
    warga = hanya_aktif(penduduk_untuk(user))
    return InfografisData(
        totalPenduduk=len(warga),
        totalLakiLaki=sum(
            1 for p in warga if p.jenisKelamin == "LAKI_LAKI"
        ),
        totalPerempuan=sum(
            1 for p in warga if p.jenisKelamin == "PEREMPUAN"
        ),
        perAgama=distribusi_by(warga, lambda p: p.agama),
        perPendidikan=distribusi_pendidikan(warga),
        perStatusPerkawinan=distribusi_by(
            warga, lambda p: p.statusPerkawinan
        ),
        perDusun=distribusi_by(warga, lambda p: format_rw(p.alamat.rw)),
        perKelompokUmur=distribusi_kelompok_umur(warga),
    )
