"""Pembatas laju di memori proses — untuk endpoint aktivasi & login warga
(CLAUDE.md §11: keduanya titik terlemah, NIK+tanggal lahir gampang ditebak).

ponytail: cuma cukup untuk satu proses. Kalau backend jalan lebih dari satu
instance/replika, pindah ke penyimpanan bersama (mis. Redis) supaya batasnya
konsisten lintas proses.
"""

import time

_riwayat: dict[str, list[float]] = {}
_gagal_beruntun: dict[str, tuple[int, float]] = {}


def terlalu_sering(kunci: str, batas: int, jendela_detik: float) -> bool:
    """Batasi total percobaan (sukses maupun gagal) dalam satu jendela waktu."""
    sekarang = time.monotonic()
    riwayat = [t for t in _riwayat.get(kunci, []) if sekarang - t < jendela_detik]
    lolos = len(riwayat) < batas
    riwayat.append(sekarang)
    _riwayat[kunci] = riwayat
    return not lolos


def catat_gagal(kunci: str) -> None:
    jumlah, _ = _gagal_beruntun.get(kunci, (0, 0.0))
    _gagal_beruntun[kunci] = (jumlah + 1, time.monotonic())


def reset_gagal(kunci: str) -> None:
    _gagal_beruntun.pop(kunci, None)


def terkunci(kunci: str, batas: int, cooldown_detik: float) -> bool:
    """Kunci sementara setelah `batas` kegagalan beruntun, sampai `cooldown_detik`
    berlalu sejak kegagalan terakhir."""
    jumlah, waktu = _gagal_beruntun.get(kunci, (0, 0.0))
    if jumlah < batas:
        return False
    if time.monotonic() - waktu > cooldown_detik:
        reset_gagal(kunci)
        return False
    return True
