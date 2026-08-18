"""Sumber data yang dibaca router — satu-satunya tempat data penduduk masuk
ke proses, jadi router tidak perlu tahu datanya lahir dari mana.

Datanya sekarang tinggal di SQLite (`settings.DATABASE_PATH`). File DB kosong
diisi sekali dari generator dummy; `app/data/dummy.py` sudah turun pangkat jadi
seeder saja, bukan sumber data. Hapus file `.db`-nya kalau mau dataset baru.

ponytail: seluruh tabel dibaca ke memori sekali saat impor, dan `DAFTAR_PENDUDUK`
tetap `list` seperti sebelumnya — semua router jalan tanpa disentuh, dan pada
~700 baris ini lebih cepat daripada query per request. Ceilingnya dua: (1) data
puluhan ribu baris, (2) endpoint tulis — begitu ada `POST/PATCH /penduduk`,
cache ini basi dan router harus query `db.py` langsung. Ganti isi modul ini,
bukan tiap router.
"""

from app.core.config import settings
from app.data import db
from app.data.dummy import bangun_kartu_keluarga, generate_penduduk
from app.schemas.penduduk import KartuKeluarga, Penduduk

_conn = db.buka(settings.DATABASE_FILE)
if db.kosong(_conn):
    db.simpan(_conn, generate_penduduk(settings))
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
