"""Log audit di memori — CLAUDE.md §11: reset-pin wajib tercatat (siapa,
kapan, NIK siapa). Belum ada endpoint buat membacanya; baru dicetak ke
console. Upgrade path: tulis ke tabel `audit_log` di SQLite (lihat CLAUDE.md
§11) begitu databasenya terpasang.
"""

import time


_log: list[dict] = []


def catat_audit(*, aktor: str, aksi: str, target_nik: str) -> None:
    entri = {
        "aktor": aktor,
        "aksi": aksi,
        "targetNik": target_nik,
        "waktu": time.time(),
    }
    _log.append(entri)
    print(f"[AUDIT] {aktor} melakukan '{aksi}' pada NIK {target_nik}")
