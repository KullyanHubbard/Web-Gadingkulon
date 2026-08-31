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


# Aksi atas data warga — dibaca pengurus, disaring per wilayah.
AKSI_WARGA = ("ubah-warga", "tambah-warga")
# Aksi atas akun — dibaca Admin. Dua daftar ini berpotongan kosong, sama seperti
# kewenangan yang menghasilkannya.
AKSI_AKUN = ("tambah-pengurus", "reset-password", "ubah-lpm")


def catat_audit(
    *,
    aktor: str,
    aksi: str,
    sasaran: str,
    sasaran_id: str | None = None,
    perubahan: str = "",
) -> None:
    """`sasaran` = nama atau username yang dikenai tindakan — yang dibaca orang.
    `sasaran_id` = Kode Warga atau id akun, yang dipakai menyaring per wilayah.
    """
    waktu = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with db.koneksi(settings.DATABASE_FILE) as conn:
        with conn:
            conn.execute(
                "INSERT INTO audit_log (waktu, aktor, aksi, sasaran, sasaran_id,"
                " perubahan) VALUES (?, ?, ?, ?, ?, ?)",
                (waktu, aktor, aksi, sasaran, sasaran_id, perubahan or None),
            )
    ekor = f" ({perubahan})" if perubahan else ""
    print(f"[AUDIT] {aktor} melakukan '{aksi}' pada {sasaran}{ekor}")


def riwayat(aksi: tuple[str, ...] = (), batas: int = 200) -> list[dict]:
    """Catatan terbaru lebih dulu, disaring per jenis aksi.

    Penyaringan per WILAYAH tidak dilakukan di sini: itu butuh tahu warga siapa
    yang boleh dilihat pemanggilnya, dan aturan itu tinggal di `store.py`.
    """
    sql = "SELECT * FROM audit_log"
    args: list[object] = []
    if aksi:
        sql += f" WHERE aksi IN ({','.join('?' * len(aksi))})"
        args += list(aksi)
    sql += " ORDER BY id DESC LIMIT ?"
    args.append(batas)
    with db.koneksi(settings.DATABASE_FILE) as conn:
        return [dict(r) for r in conn.execute(sql, args)]
