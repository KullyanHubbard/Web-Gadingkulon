"""Batas percobaan login.

Dua ember terpisah, dan longgarnya berbeda dengan sengaja:

- **Per username** — ketat (5 per 15 menit). Ini yang menahan orang menebak
  password satu akun tertentu.
- **Per IP** — longgar (20 per 15 menit). Ini menahan penebakan yang berpindah-
  pindah username dari satu tempat.

Kenapa yang per-IP tidak ikut ketat: di padukuhan, seluruh pengurus kemungkinan
besar memakai satu jaringan yang sama — balai desa, atau satu tethering. Kalau
batas per-IP disamakan 5, tiga orang yang sama-sama salah ketik sekali bisa
mengunci semua orang di ruangan itu sekaligus, dan tidak ada seorang pun yang
bisa membukanya.

ponytail: hitungannya di memori proses, hilang tiap restart, dan tidak dibagi
antar-proses. Serangan tebak-password berlangsung dalam hitungan menit
sedangkan restart jarang, jadi ini memadai. Pindahkan ke tabel atau Redis
begitu backend jalan lebih dari satu proses — kalau tidak, batasnya terkalikan
sebanyak jumlah proses.
"""

import time

JENDELA_DETIK = 15 * 60
BATAS_USERNAME = 5
BATAS_IP = 20

# kunci -> daftar waktu gagal (monotonic). Hanya percobaan GAGAL yang dicatat.
_gagal: dict[str, list[float]] = {}


def _bersihkan(kunci: str, sekarang: float) -> list[float]:
    tersisa = [w for w in _gagal.get(kunci, []) if sekarang - w < JENDELA_DETIK]
    if tersisa:
        _gagal[kunci] = tersisa
    else:
        _gagal.pop(kunci, None)
    return tersisa


def sisa_tunggu(username: str, ip: str) -> int:
    """Detik yang harus ditunggu sebelum boleh mencoba lagi; 0 kalau boleh.

    Yang dikembalikan waktu tunggu ember yang paling lama, supaya pesannya
    tidak menyuruh orang mencoba lagi padahal masih akan ditolak.
    """
    sekarang = time.monotonic()
    tunggu = 0
    for kunci, batas in ((f"u:{username}", BATAS_USERNAME), (f"i:{ip}", BATAS_IP)):
        waktu = _bersihkan(kunci, sekarang)
        if len(waktu) >= batas:
            # Terbuka lagi begitu percobaan tertua keluar dari jendela.
            tunggu = max(tunggu, int(JENDELA_DETIK - (sekarang - waktu[0])) + 1)
    return tunggu


def catat_gagal(username: str, ip: str) -> None:
    sekarang = time.monotonic()
    for kunci in (f"u:{username}", f"i:{ip}"):
        _bersihkan(kunci, sekarang)
        _gagal.setdefault(kunci, []).append(sekarang)


def reset(username: str) -> None:
    """Login berhasil: hitungan username itu dinolkan.

    Ember IP sengaja TIDAK ikut dinolkan — kalau ikut, orang yang memegang satu
    kredensial sah bisa membersihkan jejaknya setiap kali hampir kena batas,
    dan batas per-IP jadi tidak berarti.
    """
    _gagal.pop(f"u:{username}", None)


def demo() -> None:
    """Self-check. Jalankan: .venv/bin/python -m app.core.ratelimit"""
    _gagal.clear()
    assert sisa_tunggu("budi", "1.1.1.1") == 0

    for _ in range(BATAS_USERNAME - 1):
        catat_gagal("budi", "1.1.1.1")
    assert sisa_tunggu("budi", "1.1.1.1") == 0, "belum sampai batas"

    catat_gagal("budi", "1.1.1.1")
    tunggu = sisa_tunggu("budi", "1.1.1.1")
    assert 0 < tunggu <= JENDELA_DETIK + 1, tunggu

    # Username lain dari IP yang sama masih boleh — batas per-IP lebih longgar,
    # supaya satu ruangan tidak terkunci gara-gara satu orang salah ketik.
    assert sisa_tunggu("siti", "1.1.1.1") == 0, "IP ikut terkunci terlalu dini"
    # Username yang sama dari IP lain tetap terkunci.
    assert sisa_tunggu("budi", "2.2.2.2") > 0, "kunci username harus ikut orangnya"

    reset("budi")
    assert sisa_tunggu("budi", "1.1.1.1") == 0, "login berhasil harus menolkan"

    # Ember IP: penebakan yang berpindah-pindah username tetap tertahan.
    _gagal.clear()
    for i in range(BATAS_IP):
        catat_gagal(f"orang{i}", "3.3.3.3")
    assert sisa_tunggu("orang-baru", "3.3.3.3") > 0, "ember IP tidak jalan"

    # Percobaan lama keluar dari jendela dengan sendirinya.
    _gagal.clear()
    lampau = time.monotonic() - JENDELA_DETIK - 1
    _gagal["u:lama"] = [lampau] * BATAS_USERNAME
    assert sisa_tunggu("lama", "4.4.4.4") == 0, "jendela tidak bergeser"

    _gagal.clear()
    print("OK: app/core/ratelimit.py")


if __name__ == "__main__":
    demo()
