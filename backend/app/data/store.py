"""Sumber data penduduk yang dibaca router — satu-satunya tempat data warga
masuk ke proses, jadi router tidak perlu tahu datanya lahir dari mana.

Datanya tinggal di SQLite (`settings.DATABASE_PATH`). **Tidak ada seeding
otomatis**: DB kosong tetap kosong, dan itu disengaja.

Dulu seluruh tabel dibaca ke memori sekali saat modul diimpor. Itu dicabut di
Tahap 3a: begitu ada endpoint tulis, cache seperti itu basi tanpa ada yang
menyadarinya. Konstantanya dihapus, bukan disimpan sebagai alias — apa pun yang
masih menunjuk ke sana harus gagal terang-terangan.

ponytail: tiap panggilan membuka koneksi dan membaca seluruh tabel (~385 baris
pada satu padukuhan), lalu menyaring di Python. Sederhana, dan menghapus
seluruh urusan "kapan cache harus disegarkan". Pindahkan penyaringannya ke
`WHERE` di SQL kalau datanya nanti puluhan ribu baris.
"""

from app.core.config import settings
from app.data import db
from app.data import pengurus as pg
from app.schemas.auth import AuthUser
from app.schemas.penduduk import Penduduk


def semua_penduduk() -> list[Penduduk]:
    """Seluruh warga padukuhan, tanpa batas wilayah.

    Baris ber-`deletedAt` = salah input, datanya memang tidak pernah valid,
    jadi tidak pernah ikut daftar maupun statistik. Disaring di sini, satu
    tempat, supaya tiap router tidak perlu mengingatnya. Tetap tersimpan di DB —
    yang menyaring adalah pembacaan, bukan penyimpanan.

    `statusKependudukan` PINDAH/MENINGGAL sengaja TIDAK disaring: datanya sah,
    yang berubah statusnya, dan untuk sementara tetap ikut dihitung.
    """
    with db.koneksi(settings.DATABASE_FILE) as conn:
        return [p for p in db.muat(conn) if p.deletedAt is None]


def penduduk_untuk(user: AuthUser) -> list[Penduduk]:
    """Warga yang boleh dilihat pengurus ini.

    Dukuh seluruh padukuhan, Ketua RW se-RW-nya, Ketua RT se-RT-nya. Aturannya
    dipinjam dari `pengurus.cocok_wilayah` — predikat yang sama yang menentukan
    siapa boleh menduduki sebuah kursi, karena memang pertanyaannya sama:
    wilayah mana yang jadi tanggung jawab orang ini.

    Dipanggil SETIAP endpoint baca. Router tidak pernah menyaring sendiri —
    kalau tidak, satu endpoint yang lupa jadi lubang yang tidak kelihatan.

    ADMIN tidak pernah sampai ke sini: `current_pengurus` menolaknya lebih dulu.
    """
    return [
        w
        for w in semua_penduduk()
        if pg.cocok_wilayah(user.role, user.rw, user.rt, w.alamat.rw, w.alamat.rt)
    ]
