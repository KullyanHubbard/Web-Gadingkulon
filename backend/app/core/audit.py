"""Jejak perubahan: siapa mengubah apa, kapan, dan dari apa jadi apa.

Sejak Tahap 3b ini tersimpan permanen di tabel `audit_log`. Sebelumnya cuma
`print()` ke console dan hilang tiap restart — memadai selagi yang tercatat
hanya kelola akun, tapi begitu tiga puluh sekian orang bisa mengubah data
warga, catatan itu berhenti jadi kemewahan.

Tetap ikut dicetak ke console: waktu ada yang aneh, orang membaca log server
lebih dulu sebelum membuka database.
"""

from datetime import datetime, timezone

from app.core.config import settings
from app.data import db


def catat_audit(
    *, aktor: str, aksi: str, sasaran: str, perubahan: str = ""
) -> None:
    """`sasaran` = nama atau username yang dikenai tindakan, bukan id — id UUID
    tidak berarti apa-apa buat orang yang membaca log."""
    waktu = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with db.koneksi(settings.DATABASE_FILE) as conn:
        with conn:
            conn.execute(
                "INSERT INTO audit_log (waktu, aktor, aksi, sasaran, perubahan)"
                " VALUES (?, ?, ?, ?, ?)",
                (waktu, aktor, aksi, sasaran, perubahan or None),
            )
    ekor = f" ({perubahan})" if perubahan else ""
    print(f"[AUDIT] {aktor} melakukan '{aksi}' pada {sasaran}{ekor}")


def riwayat(batas: int = 100) -> list[dict]:
    """Catatan terbaru lebih dulu. Belum ada endpoint yang memakainya — ini
    untuk penelusuran lewat baris perintah sampai ada yang benar-benar perlu
    membacanya dari layar."""
    with db.koneksi(settings.DATABASE_FILE) as conn:
        rows = conn.execute(
            "SELECT * FROM audit_log ORDER BY id DESC LIMIT ?", (batas,)
        ).fetchall()
    return [dict(r) for r in rows]
