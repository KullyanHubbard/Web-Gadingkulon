"""Skema Pydantic — cerminan tipe frontend di frontend/src/types/penduduk.ts
dan frontend/src/types/statistik.ts. Bentuknya wajib sama; kalau salah satu
berubah, ubah dua-duanya.
"""

from typing import Literal, Optional

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

# Dua sebab hilangnya warga dari daftar sengaja dipisah — lihat spec auth,
# bagian "Hapus warga". `statusKependudukan` untuk yang datanya sah tapi
# statusnya berubah (pindah/meninggal); `deletedAt` untuk baris yang memang
# tidak pernah valid (salah input).
StatusKependudukan = Literal["AKTIF", "PINDAH", "MENINGGAL"]


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
    statusKependudukan: StatusKependudukan = "AKTIF"
    # ISO date string, atau None kalau barisnya masih berlaku. Baris ber-nilai
    # tidak pernah ikut daftar maupun statistik (disaring di `data/store.py`).
    deletedAt: Optional[str] = None


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


class RincianRw(BaseModel):
    """Agregat satu wilayah (RW, atau satu RT di dalamnya) untuk halaman depan.

    Cacah saja, tanpa NIK/nama/alamat — sama seperti induknya, isi model ini
    terbuka untuk siapa pun. Label pada tiap `Distribusi` masih enum mentah
    (`'ISLAM'`); penerjemahannya milik frontend (`features/penduduk/labels.ts`).

    Modelnya rekursif supaya rincian RT persis sebentuk dengan rincian RW —
    satu model, satu tampilan di frontend. Kedalamannya cuma dua: entri di
    dalam `perRt` selalu ber-`perRt` kosong.
    """

    label: str
    totalPenduduk: int
    totalKK: int
    totalLakiLaki: int
    totalPerempuan: int
    perKelompokUmur: list[Distribusi]
    perPendidikan: list[Distribusi]
    perAgama: list[Distribusi]
    perStatusPerkawinan: list[Distribusi]
    # Rincian tiap RT di wilayah ini, urut menaik menurut nomor RT.
    perRt: list["RincianRw"] = []


class StatistikPublik(BaseModel):
    totalPenduduk: int
    # Dihitung se-desa, bukan dijumlahkan dari `perRw`: satu nomor KK yang
    # anggotanya terpisah RW akan terhitung dua kali kalau dijumlahkan.
    totalKK: int
    totalLakiLaki: int
    totalPerempuan: int
    perRw: list[RincianRw]
