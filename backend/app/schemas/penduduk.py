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

# Susunan rumah tangga. Nomor KK tidak disimpan (spec 2026-08-26), tapi peran
# tiap orang di keluarganya tetap berguna dan tetap jadi filter.
StatusHubunganKeluarga = Literal[
    "KEPALA_KELUARGA", "ISTRI", "ANAK", "FAMILI_LAIN", "LAINNYA"
]

GolonganDarah = Literal["A", "B", "AB", "O", "TIDAK_TAHU"]

# Dua sebab hilangnya warga dari daftar sengaja dipisah — lihat spec auth,
# bagian "Hapus warga". `statusKependudukan` untuk yang datanya sah tapi
# statusnya berubah (pindah/meninggal); `deletedAt` untuk baris yang memang
# tidak pernah valid (salah input).
StatusKependudukan = Literal["AKTIF", "PINDAH", "MENINGGAL"]

# Jabatan warga di padukuhan, diisi pengurus di kolom "Jabatan" file Excel.
#
# Ini BUKAN penentu kewenangan — yang menentukan siapa boleh apa tetap akun
# pengurus (tabel `pengurus`). Kolom ini hanya dibaca untuk **mengisi kursi
# yang masih kosong**: begitu sebuah kursi ada penghuninya, isi kolom ini
# diabaikan. Tanpa batas itu, satu impor Excel yang belum diperbarui bisa
# membatalkan pergantian yang sudah disetujui Dukuh dan para Ketua RW.
JabatanWarga = Literal["WARGA", "DUKUH", "RW", "RT"]


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
    """Satu warga. `id` UUID dibangkitkan saat impor — NIK & Nomor KK tidak
    disimpan sama sekali, jadi tidak ada kunci turunan data."""

    id: str
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
    jabatan: JabatanWarga = "WARGA"
    alamat: Alamat
    statusKependudukan: StatusKependudukan = "AKTIF"
    # ISO date string, atau None kalau barisnya masih berlaku. Baris ber-nilai
    # tidak pernah ikut daftar maupun statistik (disaring di `data/store.py`).
    deletedAt: Optional[str] = None


class PaginatedPenduduk(BaseModel):
    items: list[Penduduk]
    total: int
    page: int
    pageSize: int


class FilterOpsi(BaseModel):
    """Pilihan filter yang BUKAN enum — nilainya cuma bisa diketahui dari isi
    data. Enum (agama, pendidikan, ...) sudah ada di frontend `labels.ts`, jadi
    tidak dikirim lewat jaringan."""

    rt: list[str]
    rw: list[str]
    pekerjaan: list[str]


class Distribusi(BaseModel):
    label: str
    value: int


class RincianRw(BaseModel):
    """Agregat satu wilayah (RW, atau satu RT di dalamnya) untuk halaman depan.

    Cacah saja, tanpa nama/alamat — sama seperti induknya, isi model ini
    terbuka untuk siapa pun. Label pada tiap `Distribusi` masih enum mentah
    (`'ISLAM'`); penerjemahannya milik frontend (`features/penduduk/labels.ts`).

    Modelnya rekursif supaya rincian RT persis sebentuk dengan rincian RW —
    satu model, satu tampilan di frontend. Kedalamannya cuma dua: entri di
    dalam `perRt` selalu ber-`perRt` kosong.
    """

    label: str
    totalPenduduk: int
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
    totalLakiLaki: int
    totalPerempuan: int
    perRw: list[RincianRw]
