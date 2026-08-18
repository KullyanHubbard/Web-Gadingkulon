"""SQLite: penyimpanan penduduk. Satu-satunya modul yang menulis SQL.

Bentuknya sengaja sedatar mungkin:

- **Dua tabel.** `penduduk` (`Alamat` diratakan jadi kolom `alamat_*`;
  Pydantic yang menyusunnya balik — Kartu Keluarga tidak punya tabel sendiri,
  diturunkan dari `noKK` lewat `bangun_kartu_keluarga()`) dan `warga_akun`
  (PIN warga).
- **Nama kolom = nama field Pydantic**, jadi `camelCase` (`noKK`,
  `jenisKelamin`). Melanggar kebiasaan SQL, tapi menghapus seluruh tabel
  pemetaan nama: satu baris masuk ke `Penduduk(**row)` apa adanya. SQLite
  tidak peduli besar-kecil huruf pada nama kolom.
- **`sqlite3` stdlib, bukan ORM.** Query di sini muat di satu layar;
  SQLAlchemy cuma menambah dependensi yang harus dipasang orang lain setelah
  KKN (CLAUDE.md §11).

Baris ber-`deletedAt` **tetap disimpan** — sebabnya ada di `store.py`:
penyaringan itu keputusan baca, bukan alasan membuang data.
"""

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterable, Iterator

from app.schemas.penduduk import Alamat, Penduduk

_PREFIKS_ALAMAT = "alamat_"

# Semua TEXT: NIK & no KK berawalan angka 0 (kode wilayah), jadi menyimpannya
# sebagai INTEGER akan memakan nol di depan diam-diam — bug yang sama persis
# dengan yang dilakukan Excel pada kolom NIK.
SKEMA = """
CREATE TABLE IF NOT EXISTS penduduk (
    id                     TEXT PRIMARY KEY,
    nik                    TEXT NOT NULL UNIQUE,
    noKK                   TEXT NOT NULL,
    nama                   TEXT NOT NULL,
    jenisKelamin           TEXT NOT NULL,
    tempatLahir            TEXT NOT NULL,
    tanggalLahir           TEXT NOT NULL,
    agama                  TEXT NOT NULL,
    statusPerkawinan       TEXT NOT NULL,
    pendidikan             TEXT NOT NULL,
    pekerjaan              TEXT NOT NULL,
    golonganDarah          TEXT NOT NULL,
    statusHubunganKeluarga TEXT NOT NULL,
    kewarganegaraan        TEXT NOT NULL,
    alamat_jalan           TEXT NOT NULL,
    alamat_rt              TEXT NOT NULL,
    alamat_rw              TEXT NOT NULL,
    alamat_desa            TEXT NOT NULL,
    alamat_kecamatan       TEXT NOT NULL,
    alamat_kabupaten       TEXT NOT NULL,
    alamat_provinsi        TEXT NOT NULL,
    alamat_kodePos         TEXT NOT NULL,
    statusKependudukan     TEXT NOT NULL DEFAULT 'AKTIF',
    deletedAt              TEXT
);

-- Lookup KK (`GET /kartu-keluarga/{noKK}`) satu-satunya query non-PRIMARY KEY.
CREATE INDEX IF NOT EXISTS idx_penduduk_noKK ON penduduk(noKK);

-- Akun warga. Ada di sini, bukan di memori, karena reset PIN tidak punya arti
-- kalau seluruh PIN hilang sendiri tiap backend dinyalakan ulang: "direset"
-- jadi keadaan default semua orang, dan tombol pengurus tidak menentukan apa
-- pun. `pin_hash` BLOB karena bcrypt mengembalikan bytes.
CREATE TABLE IF NOT EXISTS warga_akun (
    nik      TEXT PRIMARY KEY,
    pin_hash BLOB NOT NULL,
    noHp     TEXT,
    email    TEXT
);
"""


def buka(path: Path) -> sqlite3.Connection:
    """Buka koneksi, bikin file & skema kalau belum ada."""
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    # Tanpa ini SQLite mengabaikan FOREIGN KEY diam-diam. Belum ada FK sekarang,
    # tapi menyalakannya di satu tempat lebih murah daripada mencari tahu kenapa
    # constraint tidak jalan nanti.
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(SKEMA)
    return conn


@contextmanager
def koneksi(path: Path) -> Iterator[sqlite3.Connection]:
    """Koneksi sekali pakai untuk satu operasi.

    ponytail: buka-tutup tiap panggilan, bukan satu koneksi berumur panjang.
    Harganya tidak terasa pada beban satu padukuhan, dan menghapus seluruh
    urusan thread-safety `sqlite3` (endpoint sync FastAPI jalan di threadpool).
    Pindah ke satu koneksi bersama kalau profiling nanti menunjuk ke sini.
    """
    conn = buka(path)
    try:
        yield conn
    finally:
        conn.close()


def kosong(conn: sqlite3.Connection) -> bool:
    return conn.execute("SELECT 1 FROM penduduk LIMIT 1").fetchone() is None


def _ke_row(p: Penduduk) -> dict[str, object]:
    data = p.model_dump()
    alamat = data.pop("alamat")
    data.update({f"{_PREFIKS_ALAMAT}{k}": v for k, v in alamat.items()})
    return data


def _ke_penduduk(row: sqlite3.Row) -> Penduduk:
    data = dict(row)
    alamat = {
        k.removeprefix(_PREFIKS_ALAMAT): v
        for k, v in data.items()
        if k.startswith(_PREFIKS_ALAMAT)
    }
    inti = {k: v for k, v in data.items() if not k.startswith(_PREFIKS_ALAMAT)}
    return Penduduk(**inti, alamat=Alamat(**alamat))


def simpan(conn: sqlite3.Connection, daftar: Iterable[Penduduk]) -> int:
    """Sisipkan penduduk. Mengembalikan jumlah baris yang masuk.

    NIK ganda ditolak keras oleh `UNIQUE` — impor data asli yang mengandung
    duplikat harus gagal terang-terangan, bukan menimpa baris yang sudah ada.
    """
    rows = [_ke_row(p) for p in daftar]
    if not rows:
        return 0
    kolom = ", ".join(rows[0])
    nilai = ", ".join(f":{k}" for k in rows[0])
    with conn:
        conn.executemany(f"INSERT INTO penduduk ({kolom}) VALUES ({nilai})", rows)
    return len(rows)


def nik_sudah_ada(conn: sqlite3.Connection, niks: list[str]) -> list[str]:
    """NIK dari `niks` yang sudah ada di tabel.

    Dipakai importer supaya berhenti dengan pesan jelas sebelum menulis apa
    pun, bukan menabrak `UNIQUE` di tengah `executemany` (baris lain di batch
    yang sama ikut gagal karena `simpan()` satu transaksi).
    """
    if not niks:
        return []
    tanda = ",".join("?" * len(niks))
    return [
        r["nik"]
        for r in conn.execute(f"SELECT nik FROM penduduk WHERE nik IN ({tanda})", niks)
    ]


def muat(conn: sqlite3.Connection) -> list[Penduduk]:
    """Semua baris, termasuk yang ber-`deletedAt`. Penyaringan milik `store.py`.

    `ORDER BY rowid` = urutan penyisipan, dan itu wajib bukan kosmetik:
    `app/data/akun.py` memilih warga demo lewat `DAFTAR_PENDUDUK[0]` dan `[1]`.
    Tanpa urutan eksplisit, SQLite bebas mengubahnya dan NIK demo ikut bergeser.
    """
    return [
        _ke_penduduk(r)
        for r in conn.execute("SELECT * FROM penduduk ORDER BY rowid")
    ]


# --- Akun warga ------------------------------------------------------------


def warga_akun_ambil(conn: sqlite3.Connection, nik: str) -> sqlite3.Row | None:
    return conn.execute("SELECT * FROM warga_akun WHERE nik = ?", (nik,)).fetchone()


def warga_akun_simpan(
    conn: sqlite3.Connection,
    *,
    nik: str,
    pin_hash: bytes,
    no_hp: str | None = None,
    email: str | None = None,
) -> None:
    with conn:
        conn.execute(
            "INSERT INTO warga_akun (nik, pin_hash, noHp, email) VALUES (?, ?, ?, ?)"
            " ON CONFLICT(nik) DO UPDATE SET pin_hash = excluded.pin_hash,"
            " noHp = excluded.noHp, email = excluded.email",
            (nik, pin_hash, no_hp, email),
        )


def warga_akun_hapus(conn: sqlite3.Connection, nik: str) -> bool:
    """Hapus akun (reset PIN). `False` bila NIK-nya memang tidak punya akun.

    Menghapus, bukan mengosongkan PIN: warga kembali persis ke keadaan sebelum
    aktivasi, jadi jalur masuknya berikutnya sama dengan warga baru — NIK +
    tanggal lahir.
    """
    with conn:
        cur = conn.execute("DELETE FROM warga_akun WHERE nik = ?", (nik,))
    return cur.rowcount > 0


def warga_akun_niks(conn: sqlite3.Connection) -> list[str]:
    return [r["nik"] for r in conn.execute("SELECT nik FROM warga_akun ORDER BY nik")]


def _contoh_penduduk() -> list[Penduduk]:
    """Data uji seadanya untuk `_self_check`. Sengaja ditulis tangan, bukan
    dibangkitkan: yang diuji di sini penyimpanan, bukan pembangkit data.

    Tiga baris memikul beban berbeda — satu normal, satu `deletedAt`, satu
    `statusKependudukan` non-AKTIF, dan NIK yang berawalan `0` supaya ketahuan
    kalau kolomnya berubah jadi INTEGER dan memakan nol depannya.
    """

    def _buat(nik: str, nama: str, **ubah: object) -> Penduduk:
        bawaan = dict(
            id=nik, nik=nik, noKK="0204120101900001", nama=nama,
            jenisKelamin="LAKI_LAKI", tempatLahir="Bandung",
            tanggalLahir="1990-01-01", agama="ISLAM", statusPerkawinan="KAWIN",
            pendidikan="SMA", pekerjaan="Petani", golonganDarah="O",
            statusHubunganKeluarga="KEPALA_KELUARGA", kewarganegaraan="WNI",
            alamat=Alamat(
                jalan="Jl. Uji No. 1", rt="001", rw="019", desa="Sukamaju",
                kecamatan="Cibiru", kabupaten="Bandung", provinsi="Jawa Barat",
                kodePos="40615",
            ),
        )
        return Penduduk(**{**bawaan, **ubah})  # type: ignore[arg-type]

    return [
        _buat("0204120101900001", "Warga Normal"),
        _buat("0204124101900002", "Warga Salah Input", deletedAt="2026-01-15"),
        _buat("0204120101900003", "Warga Pindah", statusKependudukan="PINDAH"),
    ]


def _self_check() -> None:
    import tempfile

    asli = _contoh_penduduk()
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "sub" / "uji.db"  # `sub/` belum ada: uji mkdir juga.

        conn = buka(path)
        assert kosong(conn), "DB baru harus kosong"
        assert simpan(conn, asli) == len(asli), "jumlah baris tersimpan meleset"
        assert not kosong(conn), "DB terisi tapi masih terbaca kosong"
        conn.close()

        # Tutup lalu buka lagi: inti dari pindah ke SQLite adalah data selamat
        # melewati restart proses, jadi itu yang diuji — bukan sekadar roundtrip.
        conn = buka(path)
        hasil = muat(conn)

        assert {p.nik for p in hasil} == {p.nik for p in asli}, "NIK hilang/berubah"
        by_nik = {p.nik: p for p in hasil}
        for p in asli:
            assert by_nik[p.nik] == p, f"baris {p.nik} berubah setelah roundtrip"

        # Kolom yang paling gampang tercecer: alamat (diratakan lalu disusun
        # ulang) dan dua kolom nullable/berdefault.
        assert all(p.alamat.rt and p.alamat.kodePos for p in hasil), "alamat kosong"
        terhapus = [p for p in hasil if p.deletedAt is not None]
        assert len(terhapus) == len([p for p in asli if p.deletedAt is not None]), (
            "deletedAt tidak selamat"
        )
        assert {p.statusKependudukan for p in hasil} == {
            p.statusKependudukan for p in asli
        }, "statusKependudukan tidak selamat"

        # NIK berawalan 0 tidak boleh kehilangan nolnya (sebab semua kolom TEXT).
        assert all(isinstance(p.nik, str) and len(p.nik) == 16 for p in hasil), (
            "NIK bukan string 16 digit — kolom kemungkinan jadi INTEGER"
        )

        try:
            simpan(conn, asli[:1])
        except sqlite3.IntegrityError:
            pass
        else:
            raise AssertionError("NIK duplikat lolos, UNIQUE tidak jalan")

        # nik_sudah_ada: dasar importer "tambah warga baru" — harus menunjuk
        # NIK yang benar-benar sudah ada, dan tidak salah tunjuk NIK yang belum.
        bentrok = nik_sudah_ada(conn, [asli[0].nik, "9999999999999999"])
        assert bentrok == [asli[0].nik], "nik_sudah_ada salah deteksi bentrok"
        assert nik_sudah_ada(conn, []) == [], "nik_sudah_ada harus terima list kosong"
        conn.close()

    print(f"OK: {len(hasil)} baris selamat lewat tutup-buka SQLite, NIK utuh 16 digit")


def _self_check_warga_akun() -> None:
    """Yang diuji: akun warga selamat melewati tutup-buka SQLite, dan reset
    benar-benar menghapusnya — bukan sekadar terlihat hilang di satu proses."""
    import tempfile

    nik, nik_lain = "3204120101900001", "3204120101900002"

    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "uji.db"

        conn = buka(path)
        warga_akun_simpan(conn, nik=nik, pin_hash=b"hash-1", no_hp="0812")
        warga_akun_simpan(conn, nik=nik_lain, pin_hash=b"hash-2")
        conn.close()

        # Tutup-buka: inti dari menaruh akun di SQLite adalah PIN tidak hilang
        # sendiri tiap backend nyala ulang.
        conn = buka(path)
        assert warga_akun_niks(conn) == [nik, nik_lain], "akun hilang setelah restart"
        assert warga_akun_ambil(conn, nik)["pin_hash"] == b"hash-1", (
            "pin_hash berubah — kolom kemungkinan bukan BLOB"
        )
        assert warga_akun_ambil(conn, nik)["noHp"] == "0812", "kontak tidak selamat"

        # PIN baru menimpa yang lama (aktivasi ulang setelah direset).
        warga_akun_simpan(conn, nik=nik, pin_hash=b"hash-baru")
        assert warga_akun_ambil(conn, nik)["pin_hash"] == b"hash-baru"

        # Reset = hapus, dan cuma menyentuh satu orang.
        assert warga_akun_hapus(conn, nik) is True
        assert warga_akun_ambil(conn, nik) is None, "akun masih ada setelah direset"
        assert warga_akun_ambil(conn, nik_lain) is not None, "akun lain ikut terhapus"
        assert warga_akun_hapus(conn, nik) is False, (
            "menghapus akun yang tidak ada tidak boleh dianggap berhasil"
        )
        conn.close()

        conn = buka(path)
        assert warga_akun_niks(conn) == [nik_lain], "reset hidup lagi setelah restart"
        conn.close()

    print("OK: akun warga selamat lewat restart, reset benar-benar menghapus")


if __name__ == "__main__":
    _self_check()
    _self_check_warga_akun()
