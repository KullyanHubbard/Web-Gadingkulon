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

from datetime import datetime, timedelta, timezone

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

    `statusKependudukan` PINDAH/MENINGGAL **ikut dikembalikan** di sini: mereka
    masih harus tampil di daftar penduduk, kalau tidak pengurus tidak punya cara
    membatalkan penandaan yang keliru. Yang mengeluarkannya dari HITUNGAN adalah
    `hanya_aktif`, dipanggil di jalur statistik.
    """
    with db.koneksi(settings.DATABASE_FILE) as conn:
        return [p for p in db.muat(conn) if p.deletedAt is None]


def hanya_aktif(daftar: list[Penduduk]) -> list[Penduduk]:
    """Buang warga yang sudah pindah atau meninggal.

    Dipakai **hanya di jalur statistik** — total penduduk, demografi,
    infografis, statistik publik. Angka "jumlah penduduk" harus berarti orang
    yang benar-benar tinggal di sini sekarang; kalau yang pindah dan meninggal
    ikut dihitung, angkanya makin jauh dari kenyataan tiap tahun tanpa ada yang
    menyadarinya.

    Daftar penduduk sengaja TIDAK memakai ini: warga bertanda PINDAH/MENINGGAL
    tetap harus terlihat dan bisa diubah, kalau tidak penandaan yang keliru
    tidak bisa dibatalkan.
    """
    return [w for w in daftar if w.statusKependudukan == "AKTIF"]


def penduduk_untuk(user: AuthUser) -> list[Penduduk]:
    """Warga yang boleh dilihat pengurus ini.

    Dukuh seluruh padukuhan, Ketua RW se-RW-nya, Ketua RT se-RT-nya. Aturannya
    dipinjam dari `pengurus.cocok_wilayah` — predikat yang sama yang menentukan
    siapa boleh memegang sebuah jabatan, karena memang pertanyaannya sama:
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


# --- Keadaan pada bulan lampau ----------------------------------------------
#
# Tabel `penduduk` cuma tahu keadaan sekarang. Keadaan bulan lalu dihitung
# dengan MEMUTAR MUNDUR buku mutasi (`db.catat_mutasi`) — lihat spec
# `docs/superpowers/specs/2026-09-01-periode-riwayat-mutasi-design.md`.


# Padukuhan ini di Yogyakarta: WIB, offset tetap, tanpa DST. Batas bulan HARUS
# dihitung di zona itu — pukul 00:00–07:00 tanggal 1 masih tanggal 30/31 di UTC,
# jadi pemakai di pagi hari akan melihat bulan lalu yang ditawarkan sebagai
# "bulan ini". Yang DISIMPAN tetap UTC; yang diterjemahkan cuma batasnya.
WIB = timezone(timedelta(hours=7))


def _batas_periode(periode: str) -> str:
    """Awal bulan BERIKUTNYA dalam ISO — pemisah "sudah" dan "belum terjadi".

    Mutasi tepat pada batas ini sudah di luar periode: ia terjadi di bulan
    sesudahnya, jadi harus ikut dibatalkan.
    """
    tahun, bulan = (int(x) for x in periode.split("-"))
    tahun_berikut, bulan_berikut = (tahun + 1, 1) if bulan == 12 else (tahun, bulan + 1)
    # Dikembalikan sebagai UTC: `db.mutasi_sejak` membandingkannya sebagai TEKS,
    # dan dua ISO beroffset berbeda tidak bisa dibandingkan begitu.
    return (
        datetime(tahun_berikut, bulan_berikut, 1, tzinfo=WIB)
        .astimezone(timezone.utc)
        .isoformat(timespec="seconds")
    )


def periode_sekarang() -> str:
    """Bulan berjalan menurut WIB, bentuk `YYYY-MM`."""
    return datetime.now(WIB).strftime("%Y-%m")


def periode_terawal() -> str:
    """Bulan paling lampau yang masih bisa dihitung.

    Konservatif dengan sengaja: selama buku mutasi kosong, jawabannya bulan
    berjalan. Bulan antara "fitur dipasang" dan "mutasi pertama" sebenarnya
    masih bisa dihitung, tapi tidak ada yang mencatat kapan fitur dipasang —
    dan menawarkan bulan yang tidak bisa dipertanggungjawabkan lebih buruk
    daripada menawarkan lebih sedikit.
    """
    with db.koneksi(settings.DATABASE_FILE) as conn:
        pada = db.mutasi_terawal(conn)
    if pada is None:
        return periode_sekarang()
    return datetime.fromisoformat(pada).astimezone(WIB).strftime("%Y-%m")


def penduduk_pada(periode: str) -> list[Penduduk]:
    """Warga sebagaimana keadaannya di akhir bulan `periode` (`YYYY-MM`).

    Ambil keadaan sekarang, lalu batalkan tiap mutasi yang terjadi SESUDAH
    periode itu, dari yang paling akhir. Warga yang baru masuk sesudahnya
    (`dari IS NULL`) dikeluarkan — waktu itu dia memang belum ada.

    Periode berjalan pun lewat jalur yang sama: tidak ada mutasi sesudahnya,
    jadi hasilnya persis `semua_penduduk()`.
    """
    batas = _batas_periode(periode)
    warga = {w.id: w for w in semua_penduduk()}
    with db.koneksi(settings.DATABASE_FILE) as conn:
        for m in db.mutasi_sejak(conn, batas):
            sekarang = warga.get(m["warga_id"])
            if sekarang is None:
                continue
            if m["dari"] is None:
                del warga[m["warga_id"]]
            else:
                warga[m["warga_id"]] = sekarang.model_copy(
                    update={"statusKependudukan": m["dari"]}
                )
    return list(warga.values())


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
        # Buku mutasi ditulis di sini, bukan di router: ini satu-satunya jalur
        # yang mengubah status warga, jadi tidak ada pintu yang bisa lupa.
        if lama.statusKependudukan != baru.statusKependudukan:
            db.catat_mutasi(
                conn,
                baru.id,
                lama.statusKependudukan,
                baru.statusKependudukan,
                user.username,
            )
    catat_audit(
        aktor=user.username,
        aksi="ubah-warga",
        sasaran=baru.nama,
        sasaran_id=baru.id,
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
        # `dari=None`: sebelum hari ini orang ini belum ada di padukuhan, jadi
        # statistik bulan-bulan sebelumnya tidak boleh menghitungnya.
        db.catat_mutasi(conn, baru.id, None, baru.statusKependudukan, user.username)
    catat_audit(
        aktor=user.username,
        aksi="tambah-warga",
        sasaran=baru.nama,
        sasaran_id=baru.id,
        perubahan=f"RT {baru.alamat.rt}/RW {baru.alamat.rw}",
    )
    return baru


# --- Self-check --------------------------------------------------------------


def _check_mutasi() -> None:
    """Mesin waktunya harus benar-benar memutar mundur.

    Yang diuji: warga yang ditandai MENINGGAL hari ini tetap terhitung pada
    periode sebelum penandaan, dan warga yang baru ditambahkan tidak muncul di
    periode sebelum dia masuk.
    """
    from app.schemas.penduduk import Alamat

    alamat = Alamat(
        jalan="Jl. Uji", rt="001", rw="019", desa="Sukamaju", kecamatan="Cibiru",
        kabupaten="Bandung", provinsi="Jawa Barat", kodePos="40615",
    )
    warga = Penduduk(
        id="W9001", nama="Warga Uji", jenisKelamin="LAKI_LAKI",
        tempatLahir="Bandung", tanggalLahir="1950-01-01", agama="ISLAM",
        statusPerkawinan="KAWIN", pendidikan="SD", pekerjaan="Petani",
        golonganDarah="O", statusHubunganKeluarga="KEPALA_KELUARGA",
        kewarganegaraan="WNI", alamat=alamat,
    )
    with db.koneksi(settings.DATABASE_FILE) as conn:
        conn.execute("DELETE FROM penduduk")
        conn.execute("DELETE FROM mutasi")
        conn.commit()
        db.simpan(conn, [warga])
        # Dua baris buku, ditulis tangan supaya tanggalnya bisa diatur.
        conn.execute(
            "INSERT INTO mutasi (warga_id, dari, ke, pada, oleh) VALUES"
            " ('W9001', NULL, 'AKTIF', '2026-09-10T00:00:00+00:00', 'uji'),"
            " ('W9001', 'AKTIF', 'MENINGGAL', '2026-10-05T00:00:00+00:00', 'uji')"
        )
        conn.execute(
            "UPDATE penduduk SET statusKependudukan = 'MENINGGAL' WHERE id = 'W9001'"
        )
        conn.commit()

    sekarang = hanya_aktif(penduduk_pada("2026-10"))
    assert sekarang == [], f"Oktober: sudah meninggal, tidak boleh terhitung: {sekarang}"

    september = hanya_aktif(penduduk_pada("2026-09"))
    assert len(september) == 1, f"September: harus terhitung lagi, dapat {september}"
    assert september[0].statusKependudukan == "AKTIF"

    agustus = penduduk_pada("2026-08")
    assert agustus == [], f"Agustus: belum masuk padukuhan, dapat {agustus}"

    assert periode_terawal() == "2026-09", periode_terawal()
    print("OK: mesin waktu memutar mundur MENINGGAL & warga masuk")


if __name__ == "__main__":
    _check_mutasi()
