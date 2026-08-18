"""Akun petugas & warga.

Dua tempat penyimpanan, dan bedanya disengaja:

- **Akun petugas di memori** — di-seed identik tiap proses nyala, jadi restart
  tidak mengubah apa pun. Kelola akun pengurus belum ada; begitu ada, akun ini
  ikut pindah ke SQLite.
- **Akun warga di SQLite** — berubah karena perbuatan orang (warga menetapkan
  PIN, pengurus mereset) dan harus selamat melewati restart. PIN di memori
  membuat tombol Reset PIN tidak berarti apa-apa: tiap backend nyala ulang,
  semua warga sudah otomatis kembali ke keadaan "belum punya PIN" tanpa ada
  yang menekan apa pun.

PIN & password di-hash (bcrypt) walau datanya masih dummy, karena kebiasaan
inilah yang harus terus dipakai saat data asli masuk (CLAUDE.md §11).
"""

from dataclasses import dataclass

from app.core.config import settings
from app.core.security import hash_rahasia
from app.data import db
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


def _db():
    """Koneksi sekali pakai ke DB yang dikonfigurasi. Lihat `db.koneksi`."""
    return db.koneksi(settings.DATABASE_FILE)


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

# Dua warga demo dipilih dari data dummy urutan pertama & kedua — dicetak saat
# startup (lihat app/main.py) biar gampang dites manual.
_DEMO_AKTIF: Penduduk = DAFTAR_PENDUDUK[0]
_DEMO_AKTIVASI: Penduduk = DAFTAR_PENDUDUK[1]

DEMO_WARGA_AKTIF_NIK = _DEMO_AKTIF.nik
DEMO_WARGA_AKTIF_PIN = "112233"
DEMO_WARGA_AKTIVASI_NIK = _DEMO_AKTIVASI.nik
DEMO_WARGA_AKTIVASI_TANGGAL_LAHIR = _DEMO_AKTIVASI.tanggalLahir

def cari_warga_account(nik: str) -> WargaAccount | None:
    with _db() as conn:
        row = db.warga_akun_ambil(conn, nik)
    if row is None:
        return None
    return WargaAccount(
        nik=row["nik"],
        pin_hash=row["pin_hash"],
        no_hp=row["noHp"],
        email=row["email"],
    )


def simpan_warga_account(account: WargaAccount) -> None:
    with _db() as conn:
        db.warga_akun_simpan(
            conn,
            nik=account.nik,
            pin_hash=account.pin_hash,
            no_hp=account.no_hp,
            email=account.email,
        )


def hapus_warga_account(nik: str) -> bool:
    """Reset PIN. `False` bila warga itu memang belum pernah aktivasi."""
    with _db() as conn:
        return db.warga_akun_hapus(conn, nik)


def daftar_nik_berakun() -> list[str]:
    """NIK yang akunnya sudah pernah diaktifkan.

    Dipakai daftar penduduk untuk memutuskan apakah tombol Reset PIN muncul:
    warga yang belum pernah aktivasi tidak punya PIN untuk direset.
    """
    with _db() as conn:
        return db.warga_akun_niks(conn)


def cari_penduduk_by_nik(nik: str) -> Penduduk | None:
    return next((p for p in DAFTAR_PENDUDUK if p.nik == nik), None)


# Warga demo di-seed sekali, saat tabelnya masih benar-benar kosong. Sesudah itu
# isi tabel yang berkuasa: PIN yang dihapus pengurus tidak boleh hidup lagi cuma
# karena backend di-restart.
with _db() as _conn:
    if not db.warga_akun_niks(_conn):
        db.warga_akun_simpan(
            _conn,
            nik=DEMO_WARGA_AKTIF_NIK,
            pin_hash=hash_rahasia(DEMO_WARGA_AKTIF_PIN),
        )
