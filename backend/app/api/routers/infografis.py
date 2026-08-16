from fastapi import APIRouter, Depends

from app.api.routers.auth import current_admin
from app.data.agregat import distribusi_by, distribusi_kelompok_umur, format_rw
from app.data.store import DAFTAR_PENDUDUK
from app.schemas.auth import AuthUser
from app.schemas.infografis import InfografisData

router = APIRouter(tags=["infografis"])


@router.get("/infografis", response_model=InfografisData)
async def infografis(_admin: AuthUser = Depends(current_admin)) -> InfografisData:
    return InfografisData(
        totalPenduduk=len(DAFTAR_PENDUDUK),
        totalKK=len({p.noKK for p in DAFTAR_PENDUDUK}),
        totalLakiLaki=sum(
            1 for p in DAFTAR_PENDUDUK if p.jenisKelamin == "LAKI_LAKI"
        ),
        totalPerempuan=sum(
            1 for p in DAFTAR_PENDUDUK if p.jenisKelamin == "PEREMPUAN"
        ),
        perAgama=distribusi_by(DAFTAR_PENDUDUK, lambda p: p.agama),
        perPendidikan=distribusi_by(DAFTAR_PENDUDUK, lambda p: p.pendidikan),
        perStatusPerkawinan=distribusi_by(
            DAFTAR_PENDUDUK, lambda p: p.statusPerkawinan
        ),
        perDusun=distribusi_by(DAFTAR_PENDUDUK, lambda p: format_rw(p.alamat.rw)),
        perKelompokUmur=distribusi_kelompok_umur(DAFTAR_PENDUDUK),
    )
