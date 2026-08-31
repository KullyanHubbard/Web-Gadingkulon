from collections import defaultdict
from typing import Callable

from fastapi import APIRouter, Query

from app.data.agregat import (
    distribusi_by,
    distribusi_kelompok_umur,
    distribusi_pendidikan,
    format_rt,
    format_rw,
)
from app.data import kunjungan
from app.data import lpm as data_lpm
from app.data import pengurus as data_pengurus
from app.data.store import (
    hanya_aktif,
    penduduk_pada,
    periode_terawal,
    semua_penduduk,
)
from app.schemas.penduduk import Penduduk, RincianRw, StatistikPublik
from app.schemas.pengurus import (
    JabatanWilayahPublik,
    RwPublik,
    StrukturOrganisasiPublik,
)

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
        totalKepalaKeluarga=sum(
            1 for p in warga if p.statusHubunganKeluarga == "KEPALA_KELUARGA"
        ),
        totalLakiLaki=sum(1 for p in warga if p.jenisKelamin == "LAKI_LAKI"),
        totalPerempuan=sum(1 for p in warga if p.jenisKelamin == "PEREMPUAN"),
        perKelompokUmur=distribusi_kelompok_umur(warga),
        perPendidikan=distribusi_pendidikan(warga),
        perAgama=distribusi_by(warga, lambda p: p.agama),
        perStatusPerkawinan=distribusi_by(warga, lambda p: p.statusPerkawinan),
        perRt=per_rt or [],
    )


@router.get("/publik/statistik", response_model=StatistikPublik)
def statistik_publik(
    periode: str | None = Query(
        None,
        pattern=r"^\d{4}-(0[1-9]|1[0-2])$",
        description="Bulan yang diminta, `YYYY-MM`. Kosong = keadaan hari ini.",
    ),
) -> StatistikPublik:
    """Cacah saja — tanpa nama atau alamat. Endpoint ini terbuka tanpa
    autentikasi (lihat CLAUDE.md §11), jadi apa pun yang ditambahkan di sini
    otomatis jadi konsumsi publik: boleh angka agregat, tidak boleh data orang.

    `periode` memutar mundur buku mutasi (`store.penduduk_pada`). Bentuk yang
    salah ditolak 422 oleh pola di atas, bukan diabaikan diam-diam — pemanggil
    yang salah ketik lebih baik tahu daripada dikasih angka bulan lain.
    """
    # Yang pindah & meninggal tidak ikut dihitung — lihat `store.hanya_aktif`.
    semua = hanya_aktif(penduduk_pada(periode) if periode else semua_penduduk())
    return StatistikPublik(
        periodeTerawal=periode_terawal(),
        totalPenduduk=len(semua),
        totalLakiLaki=sum(
            1 for p in semua if p.jenisKelamin == "LAKI_LAKI"
        ),
        totalPerempuan=sum(
            1 for p in semua if p.jenisKelamin == "PEREMPUAN"
        ),
        totalKepalaKeluarga=sum(
            1 for p in semua if p.statusHubunganKeluarga == "KEPALA_KELUARGA"
        ),
        perPekerjaan=distribusi_by(semua, lambda p: p.pekerjaan)[:10],
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


@router.post("/publik/kunjungan")
def catat_kunjungan() -> dict[str, int]:
    """Tambah 1 ke hitungan kunjungan hari ini. Dipanggil frontend sekali per
    browser per hari — lihat `app/data/kunjungan.py` untuk batasannya."""
    return {"jumlah": kunjungan.tambah()}


@router.get("/publik/kunjungan")
def lihat_kunjungan() -> dict[str, int]:
    """Hitungan hari ini tanpa menambah — dipanggil browser yang sudah
    mencatat kunjungannya untuk hari yang sama."""
    return {"jumlah": kunjungan.hari_ini()}


@router.get("/publik/struktur-organisasi", response_model=StrukturOrganisasiPublik)
def struktur_organisasi_publik() -> StrukturOrganisasiPublik:
    """Bagan pengurus untuk halaman profil — Dukuh & Ketua RW/RT beserta nama
    pemegangnya kalau ada. Dibangun dari `pengurus.daftar_jabatan()`, sumber
    yang sama dipakai halaman Admin, jadi pergantian jabatan yang disetujui
    otomatis terlihat di sini tanpa deploy ulang.

    RW/RT hanya muncul kalau ada warga AKTIF ber-alamat di situ —
    `daftar_jabatan()` menurunkan wilayahnya dari data warga, bukan daftar
    tetap. Jabatan tanpa akun aktif tampil dengan `nama=None`; frontend yang
    menandainya "Belum diisi".
    """
    jabatan = data_pengurus.daftar_jabatan()

    dukuh = next(
        (j for j in jabatan if j.role == data_pengurus.ROLE_DUKUH), None
    )

    rw_map: dict[str, RwPublik] = {}
    urutan_rw: list[str] = []
    for j in jabatan:
        if j.role == data_pengurus.ROLE_RW and j.rw is not None:
            rw_map[j.rw] = RwPublik(
                nomor=j.rw, nama=j.pemegang.nama if j.pemegang else None
            )
            urutan_rw.append(j.rw)
    for j in jabatan:
        if j.role == data_pengurus.ROLE_RT and j.rw is not None and j.rt is not None:
            rw_map[j.rw].rt.append(
                JabatanWilayahPublik(
                    nomor=j.rt, nama=j.pemegang.nama if j.pemegang else None
                )
            )

    return StrukturOrganisasiPublik(
        dukuh=dukuh.pemegang.nama if dukuh and dukuh.pemegang else None,
        rw=[rw_map[rw] for rw in urutan_rw],
        lpm=data_lpm.nama() or None,
    )
