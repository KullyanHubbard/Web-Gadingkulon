"""Pergantian pemegang jabatan pengurus: pengajuan + persetujuan.

Admin mengajukan, perangkat desa yang memutuskan. Modul ini memegang seluruh
aturan siapa boleh menyetujui apa — router cuma memanggil.

Riwayatnya tidak pernah dihapus: inilah catatan permanen perpindahan jabatan.
Lihat `docs/superpowers/specs/2026-08-26-tahap-2-pengajuan-persetujuan-design.md`.
"""

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.data import db
from app.data import pengurus as pg
from app.data import sesi

# Pengajuan yang tidak dijawab siapa pun dianggap gugur setelah ini.
UMUR_MAKS_HARI = 30

STATUS_MENUNGGU = "MENUNGGU"
STATUS_DISETUJUI = "DISETUJUI"
STATUS_DITOLAK = "DITOLAK"
STATUS_GUGUR = "GUGUR"


class TidakBoleh(ValueError):
    """Aturan pergantian dilanggar. Router menerjemahkannya jadi HTTP 4xx."""


@dataclass
class Suara:
    pengurus_id: str
    nama: str
    jabatan: str
    setuju: bool
    pada: str


@dataclass
class Pengajuan:
    id: str
    #: Kunci jabatan yang diperebutkan — lihat `pengurus.kode_jabatan_dari()`.
    jabatan_kode: str
    role: str
    rw: str | None
    rt: str | None
    kandidat_id: str
    kandidat_nama: str
    kandidat_rt: str
    kandidat_rw: str
    status: str
    diajukan_oleh: str
    diajukan_pada: str
    selesai_pada: str | None = None
    sebab: str | None = None
    suara: list[Suara] = field(default_factory=list)

    @property
    def jabatan(self) -> str:
        return pg.jabatan_dari(self.role, self.rw, self.rt)


def _db():
    return db.koneksi(settings.DATABASE_FILE)


def _sekarang() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def penyetuju_untuk(role: str, rw: str | None, rt: str | None) -> list[pg.Pengurus]:
    """Siapa yang harus menyetujui pergantian sebuah jabatan.

    Dihitung ulang tiap kali dipanggil, bukan dibekukan saat pengajuan dibuat:
    jabatan yang berganti di tengah jalan akan meninggalkan daftar penyetuju
    yang menunjuk orang yang sudah tidak menjabat.

    **Jabatan kosong dilewati**, bukan dihitung sebagai suara yang belum masuk —
    tanpa itu satu jabatan kosong mengunci pergantian secara permanen (spec
    Tahap 2, "Kursi kosong dilewati" — spec-nya memakai istilah lama).
    """
    aktif = [p for p in pg.daftar() if p.aktif]
    dukuh = [p for p in aktif if p.role == pg.ROLE_DUKUH]

    if role == pg.ROLE_DUKUH:
        return [p for p in aktif if p.role == pg.ROLE_RW]
    if role == pg.ROLE_RW:
        return dukuh
    if role == pg.ROLE_RT:
        ketua_rw = [p for p in aktif if p.role == pg.ROLE_RW and p.rw == rw]
        return ketua_rw + dukuh
    raise TidakBoleh(f"Jabatan {role} tidak bisa diganti lewat pengajuan.")


def _dari_row(row, suara: list[Suara]) -> Pengajuan:
    return Pengajuan(
        id=row["id"],
        jabatan_kode=row["jabatan_kode"],
        role=row["role"],
        rw=row["rw"],
        rt=row["rt"],
        kandidat_id=row["kandidat_id"],
        kandidat_nama=row["kandidat_nama"],
        kandidat_rt=row["kandidat_rt"],
        kandidat_rw=row["kandidat_rw"],
        status=row["status"],
        diajukan_oleh=row["diajukan_oleh"],
        diajukan_pada=row["diajukan_pada"],
        selesai_pada=row["selesai_pada"],
        sebab=row["sebab"],
        suara=suara,
    )


def _muat_suara(conn, pengajuan_id: str) -> list[Suara]:
    rows = conn.execute(
        "SELECT s.*, p.nama, p.role, p.rw, p.rt FROM persetujuan s"
        " JOIN pengurus p ON p.id = s.pengurus_id"
        " WHERE s.pengajuan_id = ? ORDER BY s.pada",
        (pengajuan_id,),
    ).fetchall()
    return [
        Suara(
            pengurus_id=r["pengurus_id"],
            nama=r["nama"],
            jabatan=pg.jabatan_dari(r["role"], r["rw"], r["rt"]),
            setuju=bool(r["setuju"]),
            pada=r["pada"],
        )
        for r in rows
    ]


def _ambil(conn, id: str) -> Pengajuan | None:
    row = conn.execute("SELECT * FROM pengajuan WHERE id = ?", (id,)).fetchone()
    return _dari_row(row, _muat_suara(conn, id)) if row else None


def _selesaikan(conn, id: str, status: str, sebab: str) -> None:
    with conn:
        conn.execute(
            "UPDATE pengajuan SET status = ?, selesai_pada = ?, sebab = ?"
            " WHERE id = ? AND status = ?",
            (status, _sekarang(), sebab, id, STATUS_MENUNGGU),
        )


def _kadaluarsa(p: Pengajuan) -> bool:
    batas = datetime.fromisoformat(p.diajukan_pada) + timedelta(days=UMUR_MAKS_HARI)
    return datetime.now(timezone.utc) > batas


def _kandidat_masih_sah(kandidat_id: str) -> bool:
    from app.data.store import semua_penduduk

    warga = next((w for w in semua_penduduk() if w.id == kandidat_id), None)
    return warga is not None and warga.statusKependudukan == "AKTIF"


def _evaluasi(conn, p: Pengajuan) -> Pengajuan:
    """Perbarui status pengajuan menurut keadaan sekarang.

    Dipanggil setiap kali pengajuan dibaca atau dijawab — bukan lewat tugas
    latar. Tidak ada penjadwal di aplikasi ini, dan menambahkannya berarti satu
    proses lagi yang harus dirawat orang setelah KKN.
    """
    if p.status != STATUS_MENUNGGU:
        return p

    if _kadaluarsa(p):
        _selesaikan(conn, p.id, STATUS_GUGUR, f"Lewat {UMUR_MAKS_HARI} hari tanpa keputusan")
        return _ambil(conn, p.id) or p
    if not _kandidat_masih_sah(p.kandidat_id):
        _selesaikan(conn, p.id, STATUS_GUGUR, "Kandidat sudah tidak aktif di data warga")
        return _ambil(conn, p.id) or p

    menolak = next((s for s in p.suara if not s.setuju), None)
    if menolak:
        _selesaikan(conn, p.id, STATUS_DITOLAK, f"Ditolak {menolak.jabatan}")
        return _ambil(conn, p.id) or p

    wajib = {x.id for x in penyetuju_untuk(p.role, p.rw, p.rt)}
    sudah = {s.pengurus_id for s in p.suara if s.setuju}
    # Penyetuju yang jabatannya sudah kosong tidak lagi ditunggu; yang sudah
    # menjawab tetap dihitung walau jabatannya kini kosong — suaranya sah saat
    # diberikan.
    if wajib and wajib <= sudah:
        _terapkan(conn, p)
        return _ambil(conn, p.id) or p
    return p


def _terapkan(conn, p: Pengajuan) -> None:
    """Pindahkan jabatan: pemegang lama dinonaktifkan, jabatannya jadi kosong.

    Kredensial pemegang baru dibuatkan Admin sesudahnya (jalur Tahap 1) — warga
    tidak punya akun, jadi tidak ada apa pun yang bisa diaktifkan di sini.
    """
    lama = next(
        (x for x in pg.daftar() if x.aktif and x.kode_jabatan == p.jabatan_kode),
        None,
    )
    if lama is not None:
        pg.ubah(lama.id, aktif=False)
        # Sesinya ikut dicabut. Pemeriksaan `aktif` tiap request sudah cukup
        # menolaknya, tapi menyisakan baris sesi milik orang yang sudah tidak
        # menjabat cuma menyimpan barang yang tidak ada gunanya lagi.
        sesi.akhiri_semua(lama.id)
    _selesaikan(
        conn,
        p.id,
        STATUS_DISETUJUI,
        f"Disetujui seluruh penyetuju; {p.kandidat_nama} menggantikan "
        + (lama.nama if lama else "jabatan kosong"),
    )


def ajukan(*, jabatan_kode: str, kandidat_id: str, oleh: str) -> Pengajuan:
    """Usulkan pergantian pemegang sebuah jabatan. Raise `TidakBoleh` kalau
    melanggar salah satu aturan di spec Tahap 2."""
    from app.data.store import semua_penduduk

    semua = {j.kode: j for j in pg.daftar_jabatan()}
    target = semua.get(jabatan_kode)
    if target is None:
        raise TidakBoleh("Jabatan tidak dikenal.")
    if target.pemegang is None:
        raise TidakBoleh(
            f"Jabatan {target.label} sedang kosong — isi langsung lewat "
            "Buatkan Akun, tidak perlu persetujuan."
        )

    warga = next((w for w in semua_penduduk() if w.id == kandidat_id), None)
    if warga is None or warga.statusKependudukan != "AKTIF":
        raise TidakBoleh("Warga yang diusulkan tidak ada atau sudah tidak aktif.")

    if not pg.cocok_wilayah(
        target.role, target.rw, target.rt, warga.alamat.rw, warga.alamat.rt
    ):
        raise TidakBoleh(
            f"{warga.nama} warga RT {warga.alamat.rt}/RW {warga.alamat.rw}, "
            f"tidak bisa memegang jabatan {target.label}."
        )

    # Dibandingkan lewat Kode Warga, bukan nama: dua orang yang benar-benar
    # senama akan saling menghalangi kalau namanya yang dipakai.
    lain = next(
        (
            j
            for j in semua.values()
            if j.pemegang and j.pemegang.warga_id == warga.id
        ),
        None,
    )
    if lain is not None:
        raise TidakBoleh(
            f"{warga.nama} sedang memegang jabatan {lain.label}. "
            "Satu orang satu jabatan."
        )

    penyetuju = penyetuju_untuk(target.role, target.rw, target.rt)
    if not penyetuju:
        raise TidakBoleh(
            f"Belum ada yang bisa menyetujui pergantian {target.label}. "
            "Isi dulu jabatan penyetujunya."
        )

    with _db() as conn:
        berjalan = conn.execute(
            "SELECT 1 FROM pengajuan WHERE jabatan_kode = ? AND status = ?",
            (jabatan_kode, STATUS_MENUNGGU),
        ).fetchone()
        if berjalan:
            raise TidakBoleh(
                f"Jabatan {target.label} sudah punya pengajuan yang berjalan."
            )
        baru = Pengajuan(
            id=str(uuid.uuid4()),
            jabatan_kode=jabatan_kode,
            role=target.role,
            rw=target.rw,
            rt=target.rt,
            kandidat_id=warga.id,
            kandidat_nama=warga.nama,
            kandidat_rt=warga.alamat.rt,
            kandidat_rw=warga.alamat.rw,
            status=STATUS_MENUNGGU,
            diajukan_oleh=oleh,
            diajukan_pada=_sekarang(),
        )
        with conn:
            conn.execute(
                "INSERT INTO pengajuan (id, jabatan_kode, role, rw, rt,"
                " kandidat_id, kandidat_nama, kandidat_rt, kandidat_rw, status,"
                " diajukan_oleh, diajukan_pada) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                (
                    baru.id, baru.jabatan_kode, baru.role, baru.rw, baru.rt,
                    baru.kandidat_id, baru.kandidat_nama, baru.kandidat_rt,
                    baru.kandidat_rw, baru.status, baru.diajukan_oleh,
                    baru.diajukan_pada,
                ),
            )
        return _ambil(conn, baru.id) or baru


def daftar(*, hanya_berjalan: bool = False) -> list[Pengajuan]:
    """Seluruh pengajuan, terbaru dulu. Statusnya dievaluasi ulang saat dibaca."""
    with _db() as conn:
        rows = conn.execute(
            "SELECT id FROM pengajuan ORDER BY diajukan_pada DESC"
        ).fetchall()
        hasil = []
        for r in rows:
            p = _ambil(conn, r["id"])
            if p is None:
                continue
            p = _evaluasi(conn, p)
            if hanya_berjalan and p.status != STATUS_MENUNGGU:
                continue
            hasil.append(p)
    return hasil


def menunggu_jawaban(pengurus_id: str) -> list[Pengajuan]:
    """Pengajuan yang menunggu jawaban orang ini, dan hanya itu.

    Penyetuju tidak pernah melihat pengajuan yang bukan urusannya — bukan
    disembunyikan di layar, memang tidak ikut dikembalikan.
    """
    orang = pg.cari_by_id(pengurus_id)
    if orang is None or not orang.aktif:
        return []
    hasil = []
    for p in daftar(hanya_berjalan=True):
        wajib = {x.id for x in penyetuju_untuk(p.role, p.rw, p.rt)}
        sudah = {s.pengurus_id for s in p.suara}
        if pengurus_id in wajib and pengurus_id not in sudah:
            hasil.append(p)
    return hasil


def jawab(*, pengajuan_id: str, pengurus_id: str, setuju: bool) -> Pengajuan:
    """Satu suara. Raise `TidakBoleh` kalau bukan penyetujunya, pengajuannya
    sudah selesai, atau orang ini sudah pernah menjawab."""
    with _db() as conn:
        p = _ambil(conn, pengajuan_id)
        if p is None:
            raise TidakBoleh("Pengajuan tidak ditemukan.")
        p = _evaluasi(conn, p)
        if p.status != STATUS_MENUNGGU:
            raise TidakBoleh("Pengajuan ini sudah selesai.")

        wajib = {x.id for x in penyetuju_untuk(p.role, p.rw, p.rt)}
        if pengurus_id not in wajib:
            raise TidakBoleh("Anda bukan penyetuju pergantian ini.")
        if any(s.pengurus_id == pengurus_id for s in p.suara):
            raise TidakBoleh("Anda sudah menjawab pengajuan ini.")

        with conn:
            conn.execute(
                "INSERT INTO persetujuan (pengajuan_id, pengurus_id, setuju, pada)"
                " VALUES (?, ?, ?, ?)",
                (pengajuan_id, pengurus_id, 1 if setuju else 0, _sekarang()),
            )
        p = _ambil(conn, pengajuan_id)
        return _evaluasi(conn, p) if p else p  # type: ignore[return-value]


def demo() -> None:
    """Self-check aturan penyetuju. Jalankan dengan DB sekali pakai:

        DATABASE_PATH=/tmp/uji-pergantian.db .venv/bin/python -m app.data.pergantian
    """
    dukuh = pg.tambah("d", "rahasia1", "Pak Dukuh", pg.ROLE_DUKUH)
    rw19 = pg.tambah("rw19", "rahasia1", "Pak RW 19", pg.ROLE_RW, rw="019")
    rw20 = pg.tambah("rw20", "rahasia1", "Pak RW 20", pg.ROLE_RW, rw="020")
    rt1 = pg.tambah("rt1", "rahasia1", "Pak RT 1", pg.ROLE_RT, rw="019", rt="001")

    # Ganti RT: Ketua RW wilayahnya + Dukuh. RW 020 tidak ikut.
    ids = {x.id for x in penyetuju_untuk(pg.ROLE_RT, "019", "001")}
    assert ids == {rw19.id, dukuh.id}, ids
    # Ganti RW: Dukuh saja.
    assert {x.id for x in penyetuju_untuk(pg.ROLE_RW, "019", None)} == {dukuh.id}
    # Ganti Dukuh: seluruh Ketua RW.
    assert {x.id for x in penyetuju_untuk(pg.ROLE_DUKUH, None, None)} == {
        rw19.id, rw20.id
    }

    # Jabatan kosong DILEWATI, bukan ditunggu — inti dari tiga kebuntuan.
    pg.ubah(rw19.id, aktif=False)
    assert {x.id for x in penyetuju_untuk(pg.ROLE_RT, "019", "001")} == {dukuh.id}
    pg.ubah(dukuh.id, aktif=False)
    assert penyetuju_untuk(pg.ROLE_RT, "019", "001") == []
    assert {x.id for x in penyetuju_untuk(pg.ROLE_DUKUH, None, None)} == {rw20.id}

    assert rt1.kode_jabatan == "RT:019/001"
    print("OK: app/data/pergantian.py")


if __name__ == "__main__":
    demo()
