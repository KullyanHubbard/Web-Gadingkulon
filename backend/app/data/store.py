"""Sumber data yang dibaca router — satu-satunya tempat data penduduk masuk
ke proses, jadi router tidak perlu tahu datanya lahir dari mana.

Datanya tinggal di SQLite (`settings.DATABASE_PATH`). **Tidak ada seeding
otomatis**: DB kosong tetap kosong, dan itu disengaja. Data masuk lewat
`app/data/impor_excel.py` dari file Excel hasil pendataan pengurus — satu
jalur, jadi tidak mungkin ada data karangan yang menyelinap ke sistem yang
sedang dipakai sungguhan.

ponytail: seluruh tabel dibaca ke memori sekali saat impor, dan `DAFTAR_PENDUDUK`
tetap `list` seperti sebelumnya — semua router jalan tanpa disentuh, dan pada
~700 baris ini lebih cepat daripada query per request. Ceilingnya dua: (1) data
puluhan ribu baris, (2) endpoint tulis — begitu ada `POST/PATCH /penduduk`,
cache ini basi dan router harus query `db.py` langsung. Ganti isi modul ini,
bukan tiap router.
"""

from app.core.config import settings
from app.data import db
from app.schemas.penduduk import KartuKeluarga, Penduduk


def bangun_kartu_keluarga(daftar: list[Penduduk]) -> dict[str, KartuKeluarga]:
    """Kelompokkan penduduk per `noKK` jadi indeks Kartu Keluarga.

    KK tidak punya tabel sendiri — ia diturunkan dari `noKK` yang sama, jadi
    tidak ada yang perlu dijaga tetap sinkron antara dua tabel.
    """
    by_no_kk: dict[str, list[Penduduk]] = {}
    for p in daftar:
        by_no_kk.setdefault(p.noKK, []).append(p)

    hasil: dict[str, KartuKeluarga] = {}
    for no_kk, anggota in by_no_kk.items():
        kepala = next(
            (p for p in anggota if p.statusHubunganKeluarga == "KEPALA_KELUARGA"),
            anggota[0],
        )
        hasil[no_kk] = KartuKeluarga(
            noKK=no_kk,
            kepalaKeluarga=kepala.nama,
            alamat=kepala.alamat,
            anggota=anggota,
        )
    return hasil


_conn = db.buka(settings.DATABASE_FILE)
_SEMUA_PENDUDUK = db.muat(_conn)
_conn.close()

# Baris ber-`deletedAt` = salah input, datanya memang tidak pernah valid, jadi
# tidak pernah ikut daftar maupun statistik (spec auth, bagian "Hapus warga").
# Disaring di sini, satu tempat, supaya tiap router tidak perlu mengingatnya.
# Tetap tersimpan di DB — yang menyaring adalah pembacaan, bukan penyimpanan.
# `statusKependudukan` PINDAH/MENINGGAL sengaja TIDAK disaring — datanya sah,
# yang berubah statusnya, dan untuk sementara tetap ikut dihitung.
DAFTAR_PENDUDUK: list[Penduduk] = [p for p in _SEMUA_PENDUDUK if p.deletedAt is None]
KARTU_KELUARGA_BY_NOKK: dict[str, KartuKeluarga] = bangun_kartu_keluarga(
    DAFTAR_PENDUDUK
)
