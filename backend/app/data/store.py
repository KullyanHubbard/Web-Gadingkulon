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

from app.core.audit import catat_audit
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


# --- Menulis data warga ------------------------------------------------------
#
# Sejak Tahap 3b aplikasi adalah sumber kebenaran data warga, bukan Excel.
# Aturan izinnya dua lapis: `penduduk_untuk` menentukan warga MANA yang boleh
# disentuh, `_kolom_terlarang` menentukan kolom mana yang boleh diubah.


def _boleh_pindah_wilayah(user: AuthUser) -> bool:
    """Hanya Dukuh yang boleh mengubah RT/RW seorang warga.

    Kalau Ketua RT boleh, ia bisa memindahkan orang keluar dari wilayahnya
    sendiri — dan begitu tersimpan, ia tidak bisa lagi menyentuh orang itu untuk
    membatalkannya. Kesalahan yang tidak bisa diperbaiki oleh yang melakukannya.
    """
    return user.role == pg.ROLE_DUKUH


def _beda(lama: Penduduk, baru: Penduduk) -> list[str]:
    """Kolom yang berubah, sudah berbentuk "kolom: lama -> baru"."""
    hasil = []
    a, b = lama.model_dump(), baru.model_dump()
    for k in a:
        if k == "alamat":
            for ka in a[k]:
                if a[k][ka] != b[k][ka]:
                    hasil.append(f"alamat.{ka}: {a[k][ka]!r} -> {b[k][ka]!r}")
        elif a[k] != b[k]:
            hasil.append(f"{k}: {a[k]!r} -> {b[k]!r}")
    return hasil


def kode_warga_baru() -> str:
    """Kode Warga berikutnya yang belum terpakai, bentuk `W0001`.

    Dibangkitkan aplikasi, bukan diketik pengurus: mereka tidak punya cara tahu
    kode mana yang masih kosong, dan kode bentrok berarti dua orang bertukar
    identitas. Kode milik baris yang sudah dihapus TIDAK dipakai ulang.
    """
    with db.koneksi(settings.DATABASE_FILE) as conn:
        terpakai = db.id_terpakai(conn)
    angka = [int(k[1:]) for k in terpakai if k.startswith("W") and k[1:].isdigit()]
    return f"W{(max(angka) + 1) if angka else 1:04d}"


class TidakBoleh(ValueError):
    """Aturan izin dilanggar. Router menerjemahkannya jadi HTTP 4xx."""


def _pastikan_boleh(user: AuthUser, rw: str, rt: str, aksi: str) -> None:
    if not pg.cocok_wilayah(user.role, user.rw, user.rt, rw, rt):
        raise TidakBoleh(
            f"RT {rt}/RW {rw} di luar wilayah Anda, tidak bisa {aksi} di sana."
        )


def ubah_warga(user: AuthUser, id: str, ubahan: dict) -> Penduduk:
    """Simpan perubahan satu warga. Raise `TidakBoleh` kalau melanggar izin.

    `ubahan` berisi field `Penduduk` yang mau diganti; `alamat` boleh sebagian.
    Field yang tidak dikirim tidak disentuh.
    """
    lama = next((w for w in penduduk_untuk(user) if w.id == id), None)
    if lama is None:
        # Sama seperti GET: warga di luar wilayah dijawab "tidak ada", bukan
        # "tidak boleh" — yang kedua sudah membocorkan bahwa orangnya ada.
        raise TidakBoleh("Warga tidak ditemukan.")

    data = lama.model_dump()
    alamat_baru = {**data["alamat"], **(ubahan.pop("alamat", None) or {})}
    baru = Penduduk(**{**data, **ubahan, "alamat": alamat_baru, "id": lama.id})

    pindah = (baru.alamat.rw, baru.alamat.rt) != (lama.alamat.rw, lama.alamat.rt)
    if pindah and not _boleh_pindah_wilayah(user):
        raise TidakBoleh(
            "Memindahkan warga antar-RT/RW hanya bisa dilakukan Pak Dukuh. "
            "Alamat jalan tetap bisa Anda betulkan."
        )
    if pindah:
        _pastikan_boleh(user, baru.alamat.rw, baru.alamat.rt, "menempatkan warga")

    perubahan = _beda(lama, baru)
    if not perubahan:
        return lama

    with db.koneksi(settings.DATABASE_FILE) as conn:
        if not db.perbarui(conn, baru):
            raise TidakBoleh("Warga tidak ditemukan.")
    catat_audit(
        aktor=user.username,
        aksi="ubah-warga",
        sasaran=f"{baru.nama} ({baru.id})",
        perubahan="; ".join(perubahan),
    )
    return baru


def tambah_warga(user: AuthUser, data: dict) -> Penduduk:
    """Tambah warga baru di wilayah pengurus ini.

    RT/RW-nya diperiksa terhadap wilayah penambah — kalau tidak, menambah jadi
    jalan memutar untuk memindahkan orang ke wilayah lain.
    """
    alamat = data.get("alamat") or {}
    _pastikan_boleh(user, alamat.get("rw", ""), alamat.get("rt", ""), "menambah warga")

    baru = Penduduk(**{**data, "id": kode_warga_baru()})
    with db.koneksi(settings.DATABASE_FILE) as conn:
        db.simpan(conn, [baru])
    catat_audit(
        aktor=user.username,
        aksi="tambah-warga",
        sasaran=f"{baru.nama} ({baru.id})",
        perubahan=f"RT {baru.alamat.rt}/RW {baru.alamat.rw}",
    )
    return baru
