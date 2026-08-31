"""SQLite: penyimpanan penduduk, akun pengurus, dan pergantian jabatan.
Satu-satunya modul yang menulis SQL.

Bentuknya sengaja sedatar mungkin:

- **Enam tabel.** `penduduk` (`Alamat` diratakan jadi kolom `alamat_*`;
  Pydantic yang menyusunnya balik), `pengurus` (akun perangkat desa), serta
  `pengajuan` + `persetujuan` (pergantian jabatan dan suara atasnya), serta
  `audit_log` (jejak perubahan, tidak pernah dihapus), dan `sesi` (sesi login
  yang sedang berjalan).
- **Nama kolom = nama field Pydantic**, jadi `camelCase` (`jenisKelamin`,
  `tanggalLahir`). Melanggar kebiasaan SQL, tapi menghapus seluruh tabel
  pemetaan nama: satu baris masuk ke `Penduduk(**row)` apa adanya. SQLite
  tidak peduli besar-kecil huruf pada nama kolom.
- **`sqlite3` stdlib, bukan ORM.** Query di sini muat di satu layar;
  SQLAlchemy cuma menambah dependensi yang harus dipasang orang lain setelah
  KKN (CLAUDE.md §11).

NIK & Nomor KK tidak disimpan sama sekali — desa tidak mengizinkannya. `id`
penduduk diambil dari kolom **Kode Warga** di Excel: kunci yang dijaga manusia,
satu-satunya yang bertahan melewati impor yang menimpa. Lihat dua spec
bertanggal 2026-08-26 di `docs/superpowers/specs/`.

Baris ber-`deletedAt` **tetap disimpan** — sebabnya ada di `store.py`:
penyaringan itu keputusan baca, bukan alasan membuang data.
"""

import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, Iterator

from app.schemas.penduduk import Alamat, Penduduk

_PREFIKS_ALAMAT = "alamat_"

# Semua TEXT: `alamat_rt`, `alamat_rw`, dan `alamat_kodePos` berawalan angka 0,
# jadi menyimpannya sebagai INTEGER akan memakan nol di depan diam-diam — bug
# yang sama persis dengan yang dilakukan Excel pada kolom-kolom itu.
SKEMA = """
CREATE TABLE IF NOT EXISTS penduduk (
    id                     TEXT PRIMARY KEY,
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
    -- Jabatan dari file Excel. Bukan penentu kewenangan; dibaca hanya untuk
    -- mencalonkan pemegang jabatan yang masih kosong.
    jabatan                TEXT NOT NULL DEFAULT 'WARGA',
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

-- Akun perangkat desa. Satu-satunya akun yang ada — warga tidak punya akun.
-- Di SQLite, bukan di memori: akun ditambah & dinonaktifkan oleh ADMIN saat
-- runtime, jadi harus selamat melewati restart.
-- `jabatan` sengaja TIDAK disimpan: diturunkan dari role + rw + rt, supaya
-- tidak ada dua sumber kebenaran yang bisa berbeda diam-diam.
-- `password_hash` BLOB karena bcrypt mengembalikan bytes.
CREATE TABLE IF NOT EXISTS pengurus (
    id            TEXT PRIMARY KEY,
    username      TEXT NOT NULL UNIQUE,
    password_hash BLOB NOT NULL,
    nama          TEXT NOT NULL,
    role          TEXT NOT NULL,
    rw            TEXT,
    rt            TEXT,
    aktif         INTEGER NOT NULL DEFAULT 1,
    -- Kode Warga pemegang jabatan ini. Dipakai memeriksa "orang ini sedang
    -- menjabat di tempat lain" — nama tidak bisa dipakai untuk itu, karena dua
    -- orang senama akan saling menghalangi. NULL untuk akun ADMIN, yang memang
    -- bukan warga.
    warga_id      TEXT,
    -- Password awal dari Admin sekali pakai: selama 1, akun cuma boleh
    -- mengganti passwordnya sendiri. Padam begitu password diganti.
    harus_ganti_password INTEGER NOT NULL DEFAULT 1
);

-- Usulan pergantian pemegang satu jabatan. TIDAK PERNAH DIHAPUS: riwayat inilah
-- catatan permanen perpindahan jabatan, sekaligus alasan tabel audit_log
-- terpisah belum diperlukan.
-- Identitas kandidat ikut DISALIN (nama/rt/rw) di samping `kandidat_id`: impor
-- Excel berikutnya bisa mengubah nama atau alamat orang itu, sementara riwayat
-- harus tetap terbaca sebagaimana keadaannya saat itu.
CREATE TABLE IF NOT EXISTS pengajuan (
    id             TEXT PRIMARY KEY,
    -- Kunci jabatan, mis. `RT:019/001` — lihat `pengurus.kode_jabatan_dari()`.
    jabatan_kode   TEXT NOT NULL,
    role           TEXT NOT NULL,
    rw             TEXT,
    rt             TEXT,
    kandidat_id    TEXT NOT NULL,
    kandidat_nama  TEXT NOT NULL,
    kandidat_rt    TEXT NOT NULL,
    kandidat_rw    TEXT NOT NULL,
    status         TEXT NOT NULL DEFAULT 'MENUNGGU',
    diajukan_oleh  TEXT NOT NULL,
    diajukan_pada  TEXT NOT NULL,
    selesai_pada   TEXT,
    -- Sebab selesainya, buat dibaca manusia: "ditolak Ketua RW 019",
    -- "kandidat sudah pindah", "lewat 30 hari".
    sebab          TEXT
);

CREATE INDEX IF NOT EXISTS idx_pengajuan_jabatan ON pengajuan(jabatan_kode, status);

-- Satu penyetuju satu suara per pengajuan, dan suaranya tidak bisa diubah.
CREATE TABLE IF NOT EXISTS persetujuan (
    pengajuan_id TEXT NOT NULL REFERENCES pengajuan(id),
    pengurus_id  TEXT NOT NULL REFERENCES pengurus(id),
    setuju       INTEGER NOT NULL,
    pada         TEXT NOT NULL,
    PRIMARY KEY (pengajuan_id, pengurus_id)
);

-- Jejak perubahan data warga & akun. TIDAK PERNAH DIHAPUS.
-- `perubahan` menyimpan kolom apa berubah dari apa ke apa, sebagai teks siap
-- baca — bukan JSON: yang membacanya manusia yang menelusuri sengketa data,
-- bukan program.
CREATE TABLE IF NOT EXISTS audit_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    waktu       TEXT NOT NULL,
    aktor       TEXT NOT NULL,
    aksi        TEXT NOT NULL,
    sasaran     TEXT NOT NULL,
    -- Kode Warga atau id akun yang dikenai tindakan. Dipakai menyaring riwayat
    -- per wilayah; `sasaran` yang berupa teks tidak bisa dipakai untuk itu.
    sasaran_id  TEXT,
    perubahan   TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_waktu ON audit_log(waktu);

-- Sesi yang sedang berjalan. Menggantikan JWT: token di sini cuma nomor acak
-- tanpa arti, dan yang menentukan sah atau tidak adalah ADANYA baris ini —
-- bukan tanda tangan yang tetap berlaku sampai TTL-nya habis. Akibatnya
-- "Keluar" benar-benar mencabut, bukan sekadar melupakan token di browser.
CREATE TABLE IF NOT EXISTS sesi (
    token            TEXT PRIMARY KEY,
    pengurus_id      TEXT NOT NULL REFERENCES pengurus(id),
    dibuat_pada      TEXT NOT NULL,
    kedaluwarsa_pada TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sesi_pengurus ON sesi(pengurus_id);

-- Penghitung kunjungan portal publik. Satu baris per tanggal; frontend
-- menjaga "sekali per browser per hari" lewat `localStorage`, jadi ini BUKAN
-- pengunjung unik — dua orang berbagi satu komputer balai desa terhitung satu.
-- Cukup untuk angka hiasan di footer (lihat `app/data/kunjungan.py`).
CREATE TABLE IF NOT EXISTS kunjungan (
    tanggal TEXT PRIMARY KEY,
    jumlah  INTEGER NOT NULL DEFAULT 0
);

-- Buku mutasi warga: satu baris tiap kali `statusKependudukan` berubah, plus
-- satu baris saat warga baru masuk (`dari IS NULL`). TIDAK PERNAH DIHAPUS.
--
-- Inilah yang membuat statistik per periode mungkin: tabel `penduduk` cuma tahu
-- keadaan sekarang, jadi keadaan bulan lalu dihitung dengan memutar mundur
-- baris-baris di sini (lihat `store.penduduk_pada`). Tanpa buku ini setiap
-- bulan menghasilkan angka yang sama persis.
CREATE TABLE IF NOT EXISTS mutasi (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    warga_id TEXT NOT NULL,
    -- NULL = warga baru masuk, belum punya status sebelumnya.
    dari     TEXT,
    ke       TEXT NOT NULL,
    pada     TEXT NOT NULL,
    oleh     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mutasi_pada ON mutasi(pada);

-- Nama Ketua LPM untuk bagan struktur organisasi publik — satu baris
-- tunggal (id selalu 1). LPM bukan salah satu dari empat peran akun, jadi
-- tidak punya baris di `pengurus` dan tidak ikut sistem ganti-jabatan yang
-- disetujui. Lihat `app/data/lpm.py`.
CREATE TABLE IF NOT EXISTS lpm (
    id   INTEGER PRIMARY KEY CHECK (id = 1),
    nama TEXT NOT NULL DEFAULT ''
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
    # Penggantian nama kolom WAJIB sebelum `SKEMA`: skema baru memasang indeks
    # di atas nama kolom yang baru, dan itu gagal selama kolomnya masih bernama
    # lama di instalasi yang sudah jalan.
    _ganti_nama_kolom(conn)
    conn.executescript(SKEMA)
    _tambal_kolom(conn)
    return conn


# Kolom yang ditambahkan setelah ada instalasi berjalan. `CREATE TABLE IF NOT
# EXISTS` tidak menyentuh tabel yang sudah ada, jadi tanpa ini satu-satunya cara
# memasang kolom baru adalah menghapus file `.db` — beserta seluruh akun di
# dalamnya.
#
# ponytail: daftar tempel seadanya, bukan perkakas migrasi. Cukup selama
# tambahannya kolom nullable. Begitu ada perubahan yang butuh mengisi ulang atau
# membuang kolom, ini tidak lagi memadai — dan saat itu barulah pantas memakai
# alat yang sebenarnya.
_TAMBALAN: list[tuple[str, str, str]] = [
    ("pengurus", "warga_id", "TEXT"),
    ("audit_log", "sasaran_id", "TEXT"),
]


def _tambal_kolom(conn: sqlite3.Connection) -> None:
    for tabel, kolom, tipe in _TAMBALAN:
        ada = {r["name"] for r in conn.execute(f"PRAGMA table_info({tabel})")}
        if kolom not in ada:
            conn.execute(f"ALTER TABLE {tabel} ADD COLUMN {kolom} {tipe}")
            conn.commit()


# Kolom yang BERGANTI NAMA setelah ada instalasi berjalan. Menghapus file `.db`
# bukan pilihan: tabel `pengajuan` itu riwayat permanen perpindahan jabatan.
#
# ponytail: sama seperti `_TAMBALAN` — daftar tempel seadanya. `ALTER TABLE
# RENAME COLUMN` butuh SQLite 3.25+ (2018); Python 3.11 membawa yang jauh lebih
# baru, jadi tidak dijaga versinya di sini.
_GANTI_NAMA: list[tuple[str, str, str]] = [
    # Istilah "kursi" diganti "jabatan" — dua kata untuk satu hal, dan yang
    # dipakai perangkat desa adalah "jabatan".
    ("pengajuan", "kursi", "jabatan_kode"),
]

# Indeks yang ditinggalkan penggantian nama di atas. SQLite ikut memperbarui
# DEFINISI indeks saat kolomnya di-rename, tapi NAMA indeksnya tetap yang lama —
# tanpa baris ini satu tabel berakhir punya dua indeks beridentik isi.
_INDEKS_USANG = ["idx_pengajuan_kursi"]


def _ganti_nama_kolom(conn: sqlite3.Connection) -> None:
    for tabel, lama, baru in _GANTI_NAMA:
        kolom = {r["name"] for r in conn.execute(f"PRAGMA table_info({tabel})")}
        # Tabel belum ada (DB baru) atau sudah pernah diganti — dua-duanya
        # bukan galat, cuma tidak ada yang perlu dikerjakan.
        if lama not in kolom or baru in kolom:
            continue
        conn.execute(f"ALTER TABLE {tabel} RENAME COLUMN {lama} TO {baru}")
        conn.commit()
    for indeks in _INDEKS_USANG:
        conn.execute(f"DROP INDEX IF EXISTS {indeks}")
    conn.commit()


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

    Tidak ada pemeriksaan duplikat di sini: impor selalu mengosongkan tabel
    lebih dulu (`kosongkan`), dan Kode Warga ganda sudah ditolak importer
    sebelum satu baris pun ditulis. Excel adalah sumber kebenaran tunggal.
    """
    rows = [_ke_row(p) for p in daftar]
    if not rows:
        return 0
    kolom = ", ".join(rows[0])
    nilai = ", ".join(f":{k}" for k in rows[0])
    with conn:
        conn.executemany(f"INSERT INTO penduduk ({kolom}) VALUES ({nilai})", rows)
    return len(rows)


def kosongkan(conn: sqlite3.Connection) -> int:
    """Hapus seluruh baris penduduk, kembalikan jumlah yang terhapus.

    Dipakai impor: Excel adalah sumber kebenaran tunggal, jadi tiap impor
    menimpa, bukan menambah. Tanpa NIK tidak ada kunci yang bisa dipercaya
    untuk mengenali orang yang sama antar-impor.
    """
    jumlah = conn.execute("SELECT COUNT(*) FROM penduduk").fetchone()[0]
    with conn:
        conn.execute("DELETE FROM penduduk")
    return int(jumlah)


def perbarui(conn: sqlite3.Connection, p: Penduduk) -> bool:
    """Timpa satu baris penduduk. `False` kalau `id`-nya tidak ada."""
    row = _ke_row(p)
    id_ = row.pop("id")
    setter = ", ".join(f"{k} = :{k}" for k in row)
    with conn:
        cur = conn.execute(
            f"UPDATE penduduk SET {setter} WHERE id = :id", {**row, "id": id_}
        )
    return cur.rowcount > 0


def id_terpakai(conn: sqlite3.Connection) -> set[str]:
    """Seluruh Kode Warga yang sudah ada, termasuk baris ber-`deletedAt`.

    Termasuk yang terhapus: kode milik baris salah input tidak boleh dipakai
    ulang, kalau tidak riwayat audit menunjuk ke dua orang berbeda.
    """
    return {r["id"] for r in conn.execute("SELECT id FROM penduduk")}


def muat(conn: sqlite3.Connection) -> list[Penduduk]:
    """Semua baris, termasuk yang ber-`deletedAt`. Penyaringan milik `store.py`.

    `ORDER BY rowid` = urutan penyisipan, jadi daftar penduduk muncul dalam
    urutan yang sama dengan file Excel-nya — bukan urutan bebas pilihan SQLite.
    """
    return [
        _ke_penduduk(r)
        for r in conn.execute("SELECT * FROM penduduk ORDER BY rowid")
    ]


def catat_mutasi(
    conn: sqlite3.Connection, warga_id: str, dari: str | None, ke: str, oleh: str
) -> None:
    """Tulis satu baris buku mutasi. `dari=None` untuk warga yang baru masuk."""
    conn.execute(
        "INSERT INTO mutasi (warga_id, dari, ke, pada, oleh) VALUES (?, ?, ?, ?, ?)",
        (warga_id, dari, ke, datetime.now(timezone.utc).isoformat(timespec="seconds"), oleh),
    )
    conn.commit()


def mutasi_sejak(conn: sqlite3.Connection, batas: str) -> list[sqlite3.Row]:
    """Mutasi yang tercatat pada atau sesudah `batas` (ISO), TERBARU DULU.

    Urutannya menentukan kebenaran: pemutar mundur di `store.penduduk_pada`
    membatalkan perubahan satu per satu dari yang paling akhir, jadi status yang
    tersisa adalah status pada `batas`.
    """
    return list(
        conn.execute(
            "SELECT warga_id, dari, ke FROM mutasi WHERE pada >= ? ORDER BY pada DESC, id DESC",
            (batas,),
        )
    )


def mutasi_terawal(conn: sqlite3.Connection) -> str | None:
    """Waktu mutasi paling lama, atau None kalau bukunya masih kosong."""
    baris = conn.execute("SELECT MIN(pada) AS pada FROM mutasi").fetchone()
    return baris["pada"] if baris and baris["pada"] else None


def _contoh_penduduk() -> list[Penduduk]:
    """Data uji seadanya untuk `_self_check`. Sengaja ditulis tangan, bukan
    dibangkitkan: yang diuji di sini penyimpanan, bukan pembangkit data.

    Tiga baris memikul beban berbeda — satu normal, satu `deletedAt`, satu
    `statusKependudukan` non-AKTIF.
    """

    def _buat(id: str, nama: str, **ubah: object) -> Penduduk:
        bawaan = dict(
            id=id, nama=nama,
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
        _buat("4f1d0c8e-0001-4000-8000-000000000001", "Warga Normal"),
        _buat(
            "4f1d0c8e-0002-4000-8000-000000000002",
            "Warga Salah Input",
            deletedAt="2026-01-15",
        ),
        _buat(
            "4f1d0c8e-0003-4000-8000-000000000003",
            "Warga Pindah",
            statusKependudukan="PINDAH",
        ),
    ]


def _check_migrasi_jabatan() -> None:
    """DB lama (kolom `pengajuan.kursi`) harus terangkat sendiri saat dibuka.

    Diuji beneran, bukan dibaca sekilas: tabel `pengajuan` adalah riwayat
    permanen perpindahan jabatan, jadi migrasi yang salah menghapus catatan yang
    tidak bisa dibuat ulang dari mana pun.
    """
    import tempfile

    # Bentuk tabel PERSIS seperti sebelum penggantian nama — ditulis tangan,
    # bukan diambil dari `SKEMA`, karena `SKEMA` sudah memakai nama yang baru.
    skema_lama = """
    CREATE TABLE pengajuan (
        id            TEXT PRIMARY KEY,
        kursi         TEXT NOT NULL,
        role          TEXT NOT NULL,
        rw            TEXT,
        rt            TEXT,
        kandidat_id   TEXT NOT NULL,
        kandidat_nama TEXT NOT NULL,
        kandidat_rt   TEXT NOT NULL,
        kandidat_rw   TEXT NOT NULL,
        status        TEXT NOT NULL DEFAULT 'MENUNGGU',
        diajukan_oleh TEXT NOT NULL,
        diajukan_pada TEXT NOT NULL,
        selesai_pada  TEXT,
        sebab         TEXT
    );
    CREATE INDEX idx_pengajuan_kursi ON pengajuan(kursi, status);
    """

    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "lama.db"
        tua = sqlite3.connect(path)
        tua.executescript(skema_lama)
        tua.execute(
            "INSERT INTO pengajuan (id, kursi, role, rw, rt, kandidat_id,"
            " kandidat_nama, kandidat_rt, kandidat_rw, diajukan_oleh,"
            " diajukan_pada) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            ("p1", "RT:019/001", "RT", "019", "001", "W1", "Budi", "001",
             "019", "admin", "2026-08-01T00:00:00"),
        )
        tua.commit()
        tua.close()

        conn = buka(path)
        kolom = {r["name"] for r in conn.execute("PRAGMA table_info(pengajuan)")}
        assert "jabatan_kode" in kolom, "kolom belum berganti nama"
        assert "kursi" not in kolom, "kolom lama masih ada"

        baris = conn.execute("SELECT * FROM pengajuan").fetchone()
        assert baris["jabatan_kode"] == "RT:019/001", "isi baris hilang saat migrasi"
        assert baris["kandidat_nama"] == "Budi", "kolom lain ikut rusak"

        indeks = {
            r["name"]
            for r in conn.execute("PRAGMA index_list(pengajuan)")
        }
        assert "idx_pengajuan_kursi" not in indeks, "indeks usang tidak dibuang"
        assert "idx_pengajuan_jabatan" in indeks, "indeks baru tidak terpasang"
        conn.close()

        # Buka lagi: migrasi harus diam kalau tidak ada yang perlu dikerjakan.
        conn = buka(path)
        assert conn.execute("SELECT COUNT(*) c FROM pengajuan").fetchone()["c"] == 1
        conn.close()

    print("OK: DB lama (kolom `kursi`) terangkat ke `jabatan_kode`")


def _self_check() -> None:
    import tempfile

    _check_migrasi_jabatan()

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

        assert {p.id for p in hasil} == {p.id for p in asli}, "id hilang/berubah"
        by_id = {p.id: p for p in hasil}
        for p in asli:
            assert by_id[p.id] == p, f"baris {p.id} berubah setelah roundtrip"

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

        # RT/RW berawalan 0 tidak boleh kehilangan nolnya (sebab semua kolom TEXT).
        assert all(p.alamat.rt.startswith("0") for p in hasil), (
            "nol depan RT termakan — kolom kemungkinan jadi INTEGER"
        )

        # Impor menimpa: kosongkan harus mengembalikan tabel ke nol baris, dan
        # melaporkan berapa yang dibuang supaya skrip impor bisa memperingatkan.
        assert kosongkan(conn) == len(asli), "kosongkan salah menghitung baris lama"
        assert kosong(conn), "tabel masih terisi setelah dikosongkan"
        assert muat(conn) == [], "muat masih mengembalikan baris setelah dikosongkan"
        assert kosongkan(conn) == 0, "mengosongkan tabel kosong harus mengembalikan 0"
        assert simpan(conn, asli) == len(asli), "impor ulang setelah kosong gagal"
        conn.close()

        conn = buka(path)
        assert len(muat(conn)) == len(asli), "impor ulang tidak selamat lewat restart"
        conn.close()

    print(f"OK: {len(hasil)} baris selamat lewat tutup-buka SQLite, impor menimpa bersih")


if __name__ == "__main__":
    _self_check()
