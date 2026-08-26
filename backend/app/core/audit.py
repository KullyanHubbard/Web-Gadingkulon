"""Log audit di memori — kelola akun pengurus wajib tercatat (siapa, kapan,
akun siapa).

ponytail: `print()` + list di memori, hilang tiap restart, belum ada endpoint
buat membacanya. Memadai selagi yang tercatat cuma kelola akun. Naikkan ke
tabel `audit_log` di SQLite + `GET /audit` begitu ada endpoint mutasi data
warga — sejak itu jejaknya harus awet.
"""

import time


_log: list[dict] = []


def catat_audit(*, aktor: str, aksi: str, target: str, catatan: str = "") -> None:
    """`target` = username akun yang dikenai tindakan, bukan id — id UUID tidak
    berarti apa-apa buat orang yang membaca log."""
    entri = {
        "aktor": aktor,
        "aksi": aksi,
        "target": target,
        "catatan": catatan,
        "waktu": time.time(),
    }
    _log.append(entri)
    ekor = f" ({catatan})" if catatan else ""
    print(f"[AUDIT] {aktor} melakukan '{aksi}' pada {target}{ekor}")
