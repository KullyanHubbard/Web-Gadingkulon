"""Nama Ketua LPM untuk bagan struktur organisasi publik — satu baris tunggal.

Bukan bagian dari `pengurus`: LPM bukan salah satu dari empat peran akun, jadi
tidak punya login maupun ikut sistem ganti-jabatan yang disetujui (lihat
CLAUDE.md §7 dan §11). Admin mengubahnya langsung, tanpa persetujuan siapa pun.
"""

from app.core.config import settings
from app.data import db


def nama() -> str:
    """Nama Ketua LPM saat ini. String kosong berarti belum diisi."""
    with db.koneksi(settings.DATABASE_FILE) as conn:
        row = conn.execute("SELECT nama FROM lpm WHERE id = 1").fetchone()
        return row["nama"] if row else ""


def ubah(nama_baru: str) -> str:
    """Ganti nama Ketua LPM, kembalikan nilai barunya."""
    with db.koneksi(settings.DATABASE_FILE) as conn:
        conn.execute(
            """
            INSERT INTO lpm (id, nama) VALUES (1, ?)
            ON CONFLICT(id) DO UPDATE SET nama = excluded.nama
            """,
            (nama_baru,),
        )
        conn.commit()
        return nama_baru


def demo() -> None:
    """Self-check. Jalankan:
    DATABASE_PATH=/tmp/uji-lpm.db .venv/bin/python -m app.data.lpm
    """
    assert nama() == "", "DB uji harus mulai kosong"
    assert ubah("Masjkuri") == "Masjkuri"
    assert nama() == "Masjkuri"
    assert ubah("") == "", "mengosongkan lagi harus tetap boleh"
    assert nama() == ""
    print("OK: app/data/lpm.py")


if __name__ == "__main__":
    demo()
