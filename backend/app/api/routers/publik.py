from collections import defaultdict
from typing import Callable

from fastapi import APIRouter

from app.data.agregat import (
    distribusi_by,
    distribusi_kelompok_umur,
    distribusi_pendidikan,
    format_rt,
    format_rw,
)
from app.data.store import semua_penduduk
from app.schemas.penduduk import Penduduk, RincianRw, StatistikPublik

router = APIRouter(tags=["publik"])


def _kelompokkan(
    warga: list[Penduduk], kunci: Callable[[Penduduk], str]
) -> list[tuple[str, list[Penduduk]]]:
    """Kelompokkan warga per nilai `kunci`, urut menaik menurut kuncinya."""
    hasil: defaultdict[str, list[Penduduk]] = defaultdict(list)
    for p in warga:
        hasil[kunci(p)].append(p)
    return sorted(hasil.items())


def _rincian(
    label: str, warga: list[Penduduk], per_rt: list[RincianRw] | None = None
) -> RincianRw:
    return RincianRw(
        label=label,
        totalPenduduk=len(warga),
        totalLakiLaki=sum(1 for p in warga if p.jenisKelamin == "LAKI_LAKI"),
        totalPerempuan=sum(1 for p in warga if p.jenisKelamin == "PEREMPUAN"),
        perKelompokUmur=distribusi_kelompok_umur(warga),
        perPendidikan=distribusi_pendidikan(warga),
        perAgama=distribusi_by(warga, lambda p: p.agama),
        perStatusPerkawinan=distribusi_by(warga, lambda p: p.statusPerkawinan),
        perRt=per_rt or [],
    )


@router.get("/publik/statistik", response_model=StatistikPublik)
def statistik_publik() -> StatistikPublik:
    """Cacah saja — tanpa nama atau alamat. Endpoint ini terbuka tanpa
    autentikasi (lihat CLAUDE.md §11), jadi apa pun yang ditambahkan di sini
    otomatis jadi konsumsi publik: boleh angka agregat, tidak boleh data orang.
    """
    semua = semua_penduduk()
    return StatistikPublik(
        totalPenduduk=len(semua),
        totalLakiLaki=sum(
            1 for p in semua if p.jenisKelamin == "LAKI_LAKI"
        ),
        totalPerempuan=sum(
            1 for p in semua if p.jenisKelamin == "PEREMPUAN"
        ),
        perRw=[
            _rincian(
                format_rw(rw),
                warga,
                [
                    _rincian(format_rt(rt), warga_rt)
                    for rt, warga_rt in _kelompokkan(warga, lambda p: p.alamat.rt)
                ],
            )
            for rw, warga in _kelompokkan(semua, lambda p: p.alamat.rw)
        ],
    )
