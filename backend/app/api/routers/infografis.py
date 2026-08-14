from collections import Counter
from datetime import date

from fastapi import APIRouter, Depends

from app.api.routers.auth import current_admin
from app.data.dummy import DAFTAR_PENDUDUK
from app.schemas.auth import AuthUser
from app.schemas.infografis import InfografisData
from app.schemas.penduduk import Distribusi

router = APIRouter(tags=["infografis"])


def _format_rw(rw: str) -> str:
    return f"RW {rw.lstrip('0') or rw}"


def _umur(tanggal_lahir_iso: str) -> int:
    lahir = date.fromisoformat(tanggal_lahir_iso)
    hari_ini = date.today()
    umur = hari_ini.year - lahir.year
    if (hari_ini.month, hari_ini.day) < (lahir.month, lahir.day):
        umur -= 1
    return umur


def _kelompok_umur(umur: int) -> str:
    if umur <= 5:
        return "0-5"
    if umur <= 12:
        return "6-12"
    if umur <= 17:
        return "13-17"
    if umur <= 25:
        return "18-25"
    if umur <= 40:
        return "26-40"
    if umur <= 60:
        return "41-60"
    return "60+"


def _distribusi_by(keyfn) -> list[Distribusi]:
    counter = Counter(keyfn(p) for p in DAFTAR_PENDUDUK)
    return sorted(
        (Distribusi(label=k, value=v) for k, v in counter.items()),
        key=lambda d: d.value,
        reverse=True,
    )


@router.get("/infografis", response_model=InfografisData)
async def infografis(_admin: AuthUser = Depends(current_admin)) -> InfografisData:
    per_kelompok_umur = sorted(
        _distribusi_by(lambda p: _kelompok_umur(_umur(p.tanggalLahir))),
        key=lambda d: d.label,
    )
    return InfografisData(
        totalPenduduk=len(DAFTAR_PENDUDUK),
        totalKK=len({p.noKK for p in DAFTAR_PENDUDUK}),
        totalLakiLaki=sum(
            1 for p in DAFTAR_PENDUDUK if p.jenisKelamin == "LAKI_LAKI"
        ),
        totalPerempuan=sum(
            1 for p in DAFTAR_PENDUDUK if p.jenisKelamin == "PEREMPUAN"
        ),
        perAgama=_distribusi_by(lambda p: p.agama),
        perPendidikan=_distribusi_by(lambda p: p.pendidikan),
        perStatusPerkawinan=_distribusi_by(lambda p: p.statusPerkawinan),
        perDusun=_distribusi_by(lambda p: _format_rw(p.alamat.rw)),
        perKelompokUmur=per_kelompok_umur,
    )
