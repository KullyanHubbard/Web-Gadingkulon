"""Akun perangkat desa (Dukuh/RW/RT) — satu-satunya akun yang ada.

Dibaca lewat koneksi sekali pakai per operasi, BUKAN lewat cache `store.py`:
tabelnya ditulis saat runtime (ADMIN menambah & menonaktifkan akun), jadi
cache impor-sekali akan basi.

Password selalu di-hash bcrypt, tidak pernah disimpan polos.
"""

import uuid
from dataclasses import dataclass

from app.core.config import settings
from app.core.security import hash_rahasia
from app.data import db

ROLE_ADMIN = "ADMIN"
ROLE_PENGURUS = "PENGURUS"

# Penanda "argumen tidak dikirim" untuk `ubah()`, supaya `rw=None` yang berarti
# "kosongkan" bisa dibedakan dari "jangan sentuh". Bagian dari kontrak modul
# ini, jadi sengaja publik.
TETAP = object()


@dataclass
class Pengurus:
    id: str
    username: str
    nama: str
    role: str
    rw: str | None
    rt: str | None
    aktif: bool

    @property
    def jabatan(self) -> str:
        return jabatan_dari(self.role, self.rw, self.rt)


def jabatan_dari(role: str, rw: str | None, rt: str | None) -> str:
    """Label jabatan diturunkan, tidak disimpan — kalau ikut disimpan, ia bisa
    berbeda dari wilayahnya diam-diam saat salah satunya diedit.

    Urutan periksa dari yang paling spesifik: RT ada berarti Ketua RT, apa pun
    isi RW-nya.
    """
    if rt:
        return f"Ketua RT {rt}"
    if rw:
        return f"Ketua RW {rw}"
    return "Dukuh" if role == ROLE_ADMIN else "Pengurus"


def _db():
    return db.koneksi(settings.DATABASE_FILE)


def _dari_row(row) -> Pengurus:
    return Pengurus(
        id=row["id"],
        username=row["username"],
        nama=row["nama"],
        role=row["role"],
        rw=row["rw"],
        rt=row["rt"],
        aktif=bool(row["aktif"]),
    )


def cari_by_username(username: str) -> tuple[Pengurus, bytes] | None:
    """Pengurus + hash password-nya. Hash sengaja dikembalikan terpisah, bukan
    jadi field `Pengurus` — supaya tidak ikut terbawa ke response API."""
    with _db() as conn:
        row = conn.execute(
            "SELECT * FROM pengurus WHERE username = ?", (username,)
        ).fetchone()
    return (_dari_row(row), row["password_hash"]) if row else None


def cari_by_id(id: str) -> Pengurus | None:
    with _db() as conn:
        row = conn.execute("SELECT * FROM pengurus WHERE id = ?", (id,)).fetchone()
    return _dari_row(row) if row else None


def daftar() -> list[Pengurus]:
    with _db() as conn:
        rows = conn.execute(
            "SELECT * FROM pengurus ORDER BY role, rw, rt, username"
        ).fetchall()
    return [_dari_row(r) for r in rows]


def tambah(
    username: str,
    password: str,
    nama: str,
    role: str,
    rw: str | None = None,
    rt: str | None = None,
) -> Pengurus:
    """Raise `ValueError` kalau username sudah dipakai."""
    baru = Pengurus(
        id=str(uuid.uuid4()),
        username=username,
        nama=nama,
        role=role,
        rw=rw or None,
        rt=rt or None,
        aktif=True,
    )
    with _db() as conn:
        sudah = conn.execute(
            "SELECT 1 FROM pengurus WHERE username = ?", (username,)
        ).fetchone()
        if sudah:
            raise ValueError(f"Username '{username}' sudah dipakai.")
        with conn:
            conn.execute(
                "INSERT INTO pengurus (id, username, password_hash, nama, role,"
                " rw, rt, aktif) VALUES (?, ?, ?, ?, ?, ?, ?, 1)",
                (
                    baru.id,
                    baru.username,
                    hash_rahasia(password),
                    baru.nama,
                    baru.role,
                    baru.rw,
                    baru.rt,
                ),
            )
    return baru


def ubah(
    id: str,
    *,
    nama: str | None = None,
    rw: object = TETAP,
    rt: object = TETAP,
    aktif: bool | None = None,
) -> Pengurus | None:
    """Field yang tidak dikirim tidak diubah. `None` untuk `rw`/`rt` berarti
    dikosongkan — bedanya dari "jangan sentuh" ditandai `TETAP`."""
    ada = cari_by_id(id)
    if ada is None:
        return None
    kolom: list[str] = []
    nilai: list[object] = []
    if nama is not None:
        kolom.append("nama = ?")
        nilai.append(nama)
    if rw is not TETAP:
        kolom.append("rw = ?")
        nilai.append(rw or None)
    if rt is not TETAP:
        kolom.append("rt = ?")
        nilai.append(rt or None)
    if aktif is not None:
        kolom.append("aktif = ?")
        nilai.append(1 if aktif else 0)
    if not kolom:
        return ada
    with _db() as conn:
        with conn:
            conn.execute(
                f"UPDATE pengurus SET {', '.join(kolom)} WHERE id = ?", (*nilai, id)
            )
    return cari_by_id(id)


def ganti_password(id: str, password: str) -> bool:
    with _db() as conn:
        with conn:
            cur = conn.execute(
                "UPDATE pengurus SET password_hash = ? WHERE id = ?",
                (hash_rahasia(password), id),
            )
    return cur.rowcount > 0


def bootstrap() -> None:
    """Buat akun ADMIN pertama kalau tabel masih kosong.

    Menolak jalan (bukan memakai default) ketika tabel kosong tapi env belum
    diisi: default berarti ada instalasi yang berjalan dengan password yang
    tertulis di kode publik.
    """
    with _db() as conn:
        ada = conn.execute("SELECT 1 FROM pengurus LIMIT 1").fetchone()
    if ada:
        return
    if not settings.ADMIN_USERNAME or not settings.ADMIN_PASSWORD:
        raise RuntimeError(
            "Tabel pengurus kosong dan belum ada akun ADMIN pertama.\n"
            "Isi ADMIN_USERNAME dan ADMIN_PASSWORD di backend/.env lalu jalankan "
            "ulang. Lihat backend/.env.example."
        )
    tambah(
        username=settings.ADMIN_USERNAME,
        password=settings.ADMIN_PASSWORD,
        nama="Dukuh",
        role=ROLE_ADMIN,
    )
    print(f"  Akun ADMIN pertama dibuat: {settings.ADMIN_USERNAME}")


def demo() -> None:
    """Self-check. Jalankan dengan DB sekali pakai:

        DATABASE_PATH=/tmp/uji-pengurus.db .venv/bin/python -m app.data.pengurus
    """
    assert jabatan_dari(ROLE_ADMIN, None, None) == "Dukuh"
    assert jabatan_dari(ROLE_PENGURUS, "019", None) == "Ketua RW 019"
    assert jabatan_dari(ROLE_PENGURUS, "019", "03") == "Ketua RT 03"

    p = tambah("uji-rt", "rahasia", "Fajar", ROLE_PENGURUS, rw="019", rt="03")
    assert p.jabatan == "Ketua RT 03"
    hasil = cari_by_username("uji-rt")
    assert hasil is not None and hasil[1].startswith(b"$2"), "password tidak di-hash"

    try:
        tambah("uji-rt", "lain", "Kembar", ROLE_PENGURUS)
        raise AssertionError("username ganda harus ditolak")
    except ValueError:
        pass

    diubah = ubah(p.id, aktif=False)
    assert diubah is not None and diubah.aktif is False
    # Mengubah nama tidak boleh diam-diam mengaktifkan kembali akunnya.
    diubah = ubah(p.id, nama="Fajar N.")
    assert diubah is not None and diubah.nama == "Fajar N." and diubah.aktif is False
    # `TETAP` vs None: wilayah cuma berubah kalau memang dikirim.
    assert ubah(p.id, nama="Fajar N.").rt == "03"  # type: ignore[union-attr]
    assert ubah(p.id, rt=None).rt is None  # type: ignore[union-attr]

    lama = cari_by_username("uji-rt")[1]  # type: ignore[index]
    assert ganti_password(p.id, "password-baru") is True
    assert cari_by_username("uji-rt")[1] != lama, "hash tidak berubah"  # type: ignore[index]
    assert ganti_password("tidak-ada", "baru") is False
    assert ubah("tidak-ada", nama="x") is None
    assert cari_by_id("tidak-ada") is None

    print(f"OK: app/data/pengurus.py ({len(daftar())} akun di DB uji)")


if __name__ == "__main__":
    demo()
