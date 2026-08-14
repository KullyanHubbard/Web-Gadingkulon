"""Skema Pydantic — cerminan tipe frontend di frontend/src/types/penduduk.ts
dan frontend/src/types/statistik.ts. Bentuknya wajib sama; kalau salah satu
berubah, ubah dua-duanya.
"""

from typing import Literal

from pydantic import BaseModel

JenisKelamin = Literal["LAKI_LAKI", "PEREMPUAN"]

Agama = Literal[
    "ISLAM", "KRISTEN", "KATOLIK", "HINDU", "BUDDHA", "KONGHUCU", "LAINNYA"
]

StatusPerkawinan = Literal["BELUM_KAWIN", "KAWIN", "CERAI_HIDUP", "CERAI_MATI"]

Pendidikan = Literal[
    "TIDAK_SEKOLAH", "SD", "SMP", "SMA", "D3", "S1", "S2", "S3"
]

StatusHubunganKeluarga = Literal[
    "KEPALA_KELUARGA", "ISTRI", "ANAK", "FAMILI_LAIN", "LAINNYA"
]

GolonganDarah = Literal["A", "B", "AB", "O", "TIDAK_TAHU"]


class Alamat(BaseModel):
    jalan: str
    rt: str
    rw: str
    desa: str
    kecamatan: str
    kabupaten: str
    provinsi: str
    kodePos: str


class Penduduk(BaseModel):
    id: str
    nik: str
    noKK: str
    nama: str
    jenisKelamin: JenisKelamin
    tempatLahir: str
    tanggalLahir: str
    agama: Agama
    statusPerkawinan: StatusPerkawinan
    pendidikan: Pendidikan
    pekerjaan: str
    golonganDarah: GolonganDarah
    statusHubunganKeluarga: StatusHubunganKeluarga
    kewarganegaraan: str
    alamat: Alamat


class KartuKeluarga(BaseModel):
    noKK: str
    kepalaKeluarga: str
    alamat: Alamat
    anggota: list[Penduduk]


class PaginatedPenduduk(BaseModel):
    items: list[Penduduk]
    total: int
    page: int
    pageSize: int


class Distribusi(BaseModel):
    label: str
    value: int


class StatistikPublik(BaseModel):
    totalPenduduk: int
    perRw: list[Distribusi]
