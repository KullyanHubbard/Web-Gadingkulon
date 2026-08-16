"""Akun demo untuk backend dummy — PIN & password di-hash (bcrypt) walau
datanya dummy, karena kebiasaan ini yang harus terus dipakai saat database
asli terpasang (CLAUDE.md §11: "PIN & password disimpan sebagai hash").
"""

from dataclasses import dataclass

from app.core.config import settings
from app.core.security import hash_rahasia
from app.data.store import DAFTAR_PENDUDUK
from app.schemas.auth import AuthUser
from app.schemas.penduduk import Penduduk


@dataclass
class PetugasAccount:
    username: str
    password_hash: bytes
    user: AuthUser


@dataclass
class WargaAccount:
    nik: str
    pin_hash: bytes
    no_hp: str | None = None
    email: str | None = None


# Petugas ikut kode wilayah yang sama dengan penduduk; yang membedakan cuma
# blok serialnya (`00000090xx`, di luar rentang yang dipakai generator).
_NIK_PETUGAS = f"{settings.SEED_KODE_WILAYAH}00000090"

PETUGAS_ACCOUNTS: list[PetugasAccount] = [
    PetugasAccount(
        username="dukuh",
        password_hash=hash_rahasia("dukuh123"),
        user=AuthUser(
            id="u-dukuh-1",
            nama="Ki Demang Suryanto",
            role="ADMIN",
            nik=f"{_NIK_PETUGAS}01",
            username="dukuh",
            jabatan="Dukuh",
        ),
    ),
    PetugasAccount(
        username="rw019",
        password_hash=hash_rahasia("rw123"),
        user=AuthUser(
            id="u-rw-019",
            nama="Herman Wijaya",
            role="ADMIN",
            nik=f"{_NIK_PETUGAS}02",
            username="rw019",
            jabatan="Ketua RW 019",
        ),
    ),
    PetugasAccount(
        username="rt03",
        password_hash=hash_rahasia("rt123"),
        user=AuthUser(
            id="u-rt-03",
            nama="Fajar Nugraha",
            role="ADMIN",
            nik=f"{_NIK_PETUGAS}03",
            username="rt03",
            jabatan="Ketua RT 03",
        ),
    ),
]

# Satu akun warga di-seed sudah aktif supaya login bisa dites tanpa aktivasi
# dulu. NIK & tanggal lahirnya diambil dari data dummy urutan pertama &
# kedua — dicetak saat startup (lihat app/main.py) biar gampang dites manual.
_DEMO_AKTIF: Penduduk = DAFTAR_PENDUDUK[0]
_DEMO_AKTIVASI: Penduduk = DAFTAR_PENDUDUK[1]

DEMO_WARGA_AKTIF_NIK = _DEMO_AKTIF.nik
DEMO_WARGA_AKTIF_PIN = "112233"
DEMO_WARGA_AKTIVASI_NIK = _DEMO_AKTIVASI.nik
DEMO_WARGA_AKTIVASI_TANGGAL_LAHIR = _DEMO_AKTIVASI.tanggalLahir

WARGA_ACCOUNTS: dict[str, WargaAccount] = {
    DEMO_WARGA_AKTIF_NIK: WargaAccount(
        nik=DEMO_WARGA_AKTIF_NIK,
        pin_hash=hash_rahasia(DEMO_WARGA_AKTIF_PIN),
    ),
}


def cari_warga_account(nik: str) -> WargaAccount | None:
    return WARGA_ACCOUNTS.get(nik)


def simpan_warga_account(account: WargaAccount) -> None:
    WARGA_ACCOUNTS[account.nik] = account


def hapus_warga_account(nik: str) -> None:
    WARGA_ACCOUNTS.pop(nik, None)


def cari_penduduk_by_nik(nik: str) -> Penduduk | None:
    return next((p for p in DAFTAR_PENDUDUK if p.nik == nik), None)
