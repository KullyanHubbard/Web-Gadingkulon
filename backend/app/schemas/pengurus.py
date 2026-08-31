"""Payload kelola akun pengurus — cerminan `frontend/src/features/pengurus/types.ts`."""

from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.auth import AuthUser, Role


class PengurusOut(AuthUser):
    """Akun pengurus untuk halaman kelola akun: `AuthUser` + status aktif.

    `aktif` sengaja tidak ikut `AuthUser` biasa — di dalam sesi nilainya selalu
    True (yang nonaktif tidak bisa masuk), jadi mengirimkannya di sana cuma
    menyiratkan pilihan yang tidak ada.
    """

    aktif: bool


class CalonOut(BaseModel):
    """Warga yang ditandai memegang jabatan ini di kolom "Jabatan" file Excel."""

    id: str
    nama: str


class JabatanOut(BaseModel):
    """Satu jabatan di padukuhan, terisi maupun kosong.

    Daftarnya diturunkan dari alamat warga, bukan disimpan — lihat
    `app/data/pengurus.py:daftar_jabatan`.
    """

    #: Kunci, mis. `RT:019/001` — lihat `pengurus.kode_jabatan_dari()`.
    kode: str
    role: Role
    rw: Optional[str] = None
    rt: Optional[str] = None
    #: Label yang dibaca orang, mis. "Ketua RT 001".
    label: str
    pemegang: Optional[PengurusOut] = None
    # Hanya untuk jabatan kosong; diabaikan begitu ada pemegangnya.
    calon: Optional[CalonOut] = None


class WargaPilihan(BaseModel):
    """Sepotong data warga sekadar untuk dropdown pemilihan: nama + RT/RW."""

    id: str
    nama: str
    rt: str
    rw: str


class PengurusBaru(BaseModel):
    """Mengisi satu jabatan kosong. `role`/`rw`/`rt` menunjuk jabatan mana.

    Orangnya ditunjuk lewat `wargaId`, bukan nama yang diketik: nama dari
    klien tidak bisa diperiksa, sedangkan Kode Warga bisa dicocokkan ke data
    penduduk — termasuk wilayahnya.
    """

    username: str = Field(min_length=3, max_length=32)
    password: str = Field(min_length=8)
    wargaId: str = Field(min_length=1)
    role: Role
    rw: Optional[str] = None
    rt: Optional[str] = None


class PengurusUbah(BaseModel):
    """Field yang tidak dikirim tidak diubah. `rw`/`rt` bernilai null berarti
    dikosongkan — bedanya ditangkap lewat `model_fields_set`."""

    nama: Optional[str] = None
    rw: Optional[str] = None
    rt: Optional[str] = None
    aktif: Optional[bool] = None


class PasswordBaru(BaseModel):
    password: str = Field(min_length=8)


class JabatanWilayahPublik(BaseModel):
    """Satu RT (atau induk RW) di bagan publik: nomor wilayah + nama
    pemegangnya. `nama` kosong berarti jabatan itu belum ada akunnya —
    frontend menandainya "Belum diisi", bukan menyembunyikannya."""

    nomor: str
    nama: Optional[str] = None


class RwPublik(JabatanWilayahPublik):
    rt: list[JabatanWilayahPublik] = []


class StrukturOrganisasiPublik(BaseModel):
    """Bagan pengurus untuk halaman profil publik.

    TANPA username, id, atau status akun — beda dari `JabatanOut` yang
    dipakai Admin. `dukuh`/`rw` diturunkan dari `pengurus.daftar_jabatan()`,
    sumber yang sama dipakai halaman kelola akun. `lpm` datang dari tabel
    terpisah (`app/data/lpm.py`): Ketua LPM bukan salah satu dari empat peran
    akun (ADMIN/DUKUH/RW/RT), jadi tidak punya baris di tabel `pengurus`.
    """

    dukuh: Optional[str] = None
    rw: list[RwPublik] = []
    lpm: Optional[str] = None


class LpmUbah(BaseModel):
    """Ganti nama Ketua LPM. Tanpa Kode Warga: berbeda dari `PengurusBaru`,
    LPM tidak terhubung ke data warga sama sekali, jadi tidak ada yang bisa
    diperiksa selain panjangnya."""

    nama: str = Field(max_length=100)
