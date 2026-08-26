"""Sumber data yang dibaca router — satu-satunya tempat data penduduk masuk
ke proses, jadi router tidak perlu tahu datanya lahir dari mana.

Datanya tinggal di SQLite (`settings.DATABASE_PATH`). **Tidak ada seeding
otomatis**: DB kosong tetap kosong, dan itu disengaja. Data masuk lewat
`app/data/impor_excel.py` dari file Excel hasil pendataan pengurus — satu
jalur, jadi tidak mungkin ada data karangan yang menyelinap ke sistem yang
sedang dipakai sungguhan.

ponytail: seluruh tabel dibaca ke memori sekali saat impor modul. Ceilingnya
dua: (1) data puluhan ribu baris, (2) endpoint tulis penduduk — begitu ada
`POST/PATCH /penduduk`, cache ini basi dan router harus query `db.py`
langsung. Ganti isi modul ini, bukan tiap router.

Akun pengurus TIDAK di sini: tabelnya ditulis saat runtime (ADMIN menambah &
menonaktifkan akun), jadi cache impor-sekali akan basi. Lihat
`app/data/pengurus.py`.
"""

from app.core.config import settings
from app.data import db
from app.schemas.penduduk import Penduduk

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
