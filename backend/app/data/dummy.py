"""Generator data dummy kependudukan: sejumlah Kartu Keluarga, tiap KK
beranggota 3-5 orang (diacak). Dipakai selama backend belum tersambung ke
SQLite (lihat CLAUDE.md §11) — hasilnya hidup di memori proses.

Modul ini murni generator: mengimpornya tidak membangkitkan apa-apa. Yang
memanggilnya sekali lalu menyimpan hasilnya adalah `app/data/store.py`.

Semua nilai yang bisa berbeda antar environment (jumlah KK, kode wilayah, RW,
alamat, seed acak) masuk lewat parameter `cfg` — lihat `app/core/config.py`.
Yang tetap di file ini cuma kosakata & bobot distribusi: itu bagian dari
definisi datasetnya, bukan tombol deployment.
"""

import calendar
import itertools
import random
from collections import Counter
from datetime import date

from app.core.config import Settings, settings
from app.schemas.penduduk import Alamat, KartuKeluarga, Penduduk

# Tahun acuan buat menghitung tanggal lahir dari usia. Bukan konfigurasi:
# mengubahnya menggeser seluruh NIK & tanggal lahir, jadi ia bagian dari
# definisi dataset — sama statusnya dengan bobot distribusi di bawah.
TAHUN_SEKARANG = 2026

JALAN_POOL = [
    "Melati", "Mawar", "Kenanga", "Anggrek", "Dahlia",
    "Flamboyan", "Cempaka", "Kamboja", "Seroja", "Tulip",
]

NAMA_DEPAN_LAKI = [
    "Bambang", "Andi", "Wayan", "Fajar", "Dedi", "Iwan", "Agus", "Hendra",
    "Rudi", "Joko", "Ahmad", "Yusuf", "Eko", "Slamet", "Wahyu", "Dian",
    "Anton", "Budi", "Josua", "Made", "Ridwan", "Herman", "Taufik", "Asep",
]
NAMA_DEPAN_PEREMPUAN = [
    "Siti", "Rina", "Dewi", "Ani", "Wati", "Sri", "Yuni", "Fitri", "Lina",
    "Rahayu", "Ratna", "Indah", "Nur", "Putri", "Wulan", "Kartika", "Yani",
    "Maya", "Desi", "Sari", "Ika", "Ni Luh", "Endah", "Lestari",
]
NAMA_BELAKANG = [
    "Sutrisno", "Rahayu", "Sudarma", "Nugraha", "Kurniawan", "Setiawan",
    "Wijaya", "Santoso", "Hidayat", "Saputra", "Gunawan", "Permana",
    "Hakim", "Sihombing", "Situmorang", "Simanjuntak", "Pratama", "Firmansyah",
]
PEKERJAAN_POOL = [
    "Wiraswasta", "Petani", "Pedagang", "Guru", "PNS", "Karyawan Swasta",
    "Buruh", "Sopir", "Montir", "Perawat", "Dokter", "Nelayan", "Tukang Kayu",
    "Penjahit", "Satpam",
]
TEMPAT_LAHIR_POOL = [
    "Bandung", "Garut", "Cimahi", "Sumedang", "Tasikmalaya", "Cianjur",
    "Sukabumi", "Denpasar", "Medan", "Yogyakarta",
]
AGAMA_KELUARGA = (
    ["ISLAM"] * 82 + ["KRISTEN"] * 8 + ["KATOLIK"] * 5
    + ["HINDU"] * 2 + ["BUDDHA"] * 2 + ["KONGHUCU"] * 1
)
GOLDA_POOL = ["A"] * 22 + ["B"] * 22 + ["AB"] * 8 + ["O"] * 38 + ["TIDAK_TAHU"] * 10
PENDIDIKAN_DEWASA_POOL = (
    ["SMA"] * 30 + ["D3"] * 15 + ["S1"] * 35 + ["S2"] * 12
    + ["S3"] * 3 + ["TIDAK_SEKOLAH"] * 5
)

# Bobot status kependudukan — sekelas dengan bobot agama/golongan darah di
# atas: bagian dari definisi dataset, bukan tombol deployment.
PELUANG_PINDAH = 0.02
PELUANG_MENINGGAL_LANSIA = 0.08
USIA_MINIMAL_MENINGGAL = 50
# Beberapa baris sengaja ditandai "salah input" supaya penyaringan `deletedAt`
# punya data ujinya. Tanggalnya tetap biar datasetnya tidak berubah tiap hari.
JUMLAH_SALAH_INPUT = 3
TANGGAL_HAPUS_DUMMY = f"{TAHUN_SEKARANG}-01-15"


def _nama_depan(perempuan: bool) -> str:
    return random.choice(NAMA_DEPAN_PEREMPUAN if perempuan else NAMA_DEPAN_LAKI)


def _tanggal_lahir(usia: int) -> date:
    tahun = TAHUN_SEKARANG - usia
    bulan = random.randint(1, 12)
    hari = random.randint(1, calendar.monthrange(tahun, bulan)[1])
    return date(tahun, bulan, hari)


def _nik(tanggal: date, perempuan: bool, urut: int, kode_wilayah: str) -> str:
    hari = tanggal.day + (40 if perempuan else 0)
    return (
        f"{kode_wilayah}{hari:02d}{tanggal.month:02d}"
        f"{tanggal.year % 100:02d}{urut:04d}"
    )


def _no_kk(index_keluarga: int, kode_wilayah: str) -> str:
    return f"{kode_wilayah}000001{index_keluarga:04d}"


def _pendidikan_untuk_usia(usia: int) -> str:
    if usia < 6:
        return "TIDAK_SEKOLAH"
    if usia < 12:
        return "SD"
    if usia < 15:
        return "SMP"
    if usia < 18:
        return "SMA"
    return random.choice(PENDIDIKAN_DEWASA_POOL)


def _pekerjaan_untuk(usia: int) -> str:
    if usia < 6:
        return "Belum/Tidak Bekerja"
    if usia < 18:
        return "Pelajar"
    if usia < 23 and random.random() < 0.4:
        return "Mahasiswa"
    return random.choice(PEKERJAAN_POOL)


def _status_kawin_untuk(usia: int, punya_pasangan: bool) -> str:
    if punya_pasangan:
        return "KAWIN"
    if usia < 20:
        return "BELUM_KAWIN"
    return random.choices(
        ["BELUM_KAWIN", "KAWIN", "CERAI_HIDUP", "CERAI_MATI"],
        weights=[55, 25, 10, 10],
    )[0]


def _anggota(
    *,
    id_urut: int,
    nik_urut: int,
    no_kk: str,
    kode_wilayah: str,
    nama: str,
    perempuan: bool,
    usia: int,
    agama: str,
    peran: str,
    punya_pasangan: bool,
    alamat: Alamat,
) -> Penduduk:
    tanggal_lahir = _tanggal_lahir(usia)
    return Penduduk(
        id=f"p-{id_urut:04d}",
        nik=_nik(tanggal_lahir, perempuan, nik_urut, kode_wilayah),
        noKK=no_kk,
        nama=nama,
        jenisKelamin="PEREMPUAN" if perempuan else "LAKI_LAKI",
        tempatLahir=random.choice(TEMPAT_LAHIR_POOL),
        tanggalLahir=tanggal_lahir.isoformat(),
        agama=agama,
        statusPerkawinan=_status_kawin_untuk(usia, punya_pasangan),
        pendidikan=_pendidikan_untuk_usia(usia),
        pekerjaan=_pekerjaan_untuk(usia),
        golonganDarah=random.choice(GOLDA_POOL),
        statusHubunganKeluarga=peran,
        kewarganegaraan="WNI",
        alamat=alamat,
    )


def _keluarga(
    index_keluarga: int, counter: itertools.count, cfg: Settings
) -> list[Penduduk]:
    kode_wilayah = cfg.SEED_KODE_WILAYAH
    rw_list = cfg.SEED_RW_LIST

    jumlah_anggota = random.randint(3, 5)
    no_kk = _no_kk(index_keluarga, kode_wilayah)
    # Tiap RW punya `cfg.SEED_RT_PER_RW` buah RT, bernomor berurutan lintas RW.
    # Nomor RT diturunkan dari posisi RW, bukan dari sisa bagi sendiri — kalau
    # tidak, jumlah RW yang habis dibagi jumlah RT bikin tiap RW cuma kebagian
    # satu RT tanpa ada yang sadar.
    urut_rw = (index_keluarga - 1) % len(rw_list)
    rw = rw_list[urut_rw]
    urut_rt = ((index_keluarga - 1) // len(rw_list)) % cfg.SEED_RT_PER_RW
    rt = f"{urut_rw * cfg.SEED_RT_PER_RW + urut_rt + 1:03d}"
    alamat = Alamat(
        jalan=f"Jl. {random.choice(JALAN_POOL)} No. {random.randint(1, 60)}",
        rt=rt,
        rw=rw,
        desa=cfg.SEED_DESA,
        kecamatan=cfg.SEED_KECAMATAN,
        kabupaten=cfg.SEED_KABUPATEN,
        provinsi=cfg.SEED_PROVINSI,
        kodePos=cfg.SEED_KODE_POS,
    )
    agama = random.choice(AGAMA_KELUARGA)
    marga = random.choice(NAMA_BELAKANG)

    kepala_perempuan = random.random() < 0.15
    usia_kepala = random.randint(28, 65)
    # Tipe domain (`statusHubunganKeluarga`) tidak punya peran "SUAMI" — kepala
    # perempuan berarti keluarga tanpa pasangan tercatat, bukan bug.
    punya_pasangan = (not kepala_perempuan) and random.random() < 0.85

    anggota = [
        _anggota(
            id_urut=next(counter),
            nik_urut=index_keluarga,
            no_kk=no_kk,
            kode_wilayah=kode_wilayah,
            nama=f"{_nama_depan(kepala_perempuan)} {marga}",
            perempuan=kepala_perempuan,
            usia=usia_kepala,
            agama=agama,
            peran="KEPALA_KELUARGA",
            punya_pasangan=punya_pasangan,
            alamat=alamat,
        )
    ]
    sisa = jumlah_anggota - 1

    if punya_pasangan:
        usia_pasangan = max(20, usia_kepala + random.randint(-5, 5))
        anggota.append(
            _anggota(
                id_urut=next(counter),
                nik_urut=index_keluarga,
                no_kk=no_kk,
                kode_wilayah=kode_wilayah,
                nama=f"{_nama_depan(True)} {random.choice(NAMA_BELAKANG)}",
                perempuan=True,
                usia=usia_pasangan,
                agama=agama,
                peran="ISTRI",
                punya_pasangan=True,
                alamat=alamat,
            )
        )
        sisa -= 1

    usia_anak_maks = max(usia_kepala - 18, 1)
    for _ in range(sisa):
        famili_lain = random.random() < 0.12
        perempuan = random.random() < 0.5
        if famili_lain:
            usia = random.randint(18, 70)
            nama = f"{_nama_depan(perempuan)} {random.choice(NAMA_BELAKANG)}"
        else:
            usia = random.randint(0, min(usia_anak_maks, 30))
            nama = f"{_nama_depan(perempuan)} {marga}"
        anggota.append(
            _anggota(
                id_urut=next(counter),
                nik_urut=index_keluarga,
                no_kk=no_kk,
                kode_wilayah=kode_wilayah,
                nama=nama,
                perempuan=perempuan,
                usia=usia,
                agama=agama,
                peran="FAMILI_LAIN" if famili_lain else "ANAK",
                punya_pasangan=False,
                alamat=alamat,
            )
        )

    return anggota


def _tandai_status(daftar: list[Penduduk], seed: int) -> None:
    """Isi `statusKependudukan` & `deletedAt` di lintasan kedua.

    Sengaja memakai RNG sendiri, bukan `random` global, supaya urutan acak
    lintasan pertama tidak bergeser — NIK, nama, dan akun demo tetap sama
    persis seperti sebelum dua kolom ini ada.
    """
    rng = random.Random(seed + 1)

    for p in daftar:
        usia = TAHUN_SEKARANG - int(p.tanggalLahir[:4])
        # Kepala keluarga dilewati: KK yang kepalanya tercatat meninggal tapi
        # masih tampil sebagai kepala keluarga cuma bikin bingung di layar.
        if (
            usia >= USIA_MINIMAL_MENINGGAL
            and p.statusHubunganKeluarga != "KEPALA_KELUARGA"
            and rng.random() < PELUANG_MENINGGAL_LANSIA
        ):
            p.statusKependudukan = "MENINGGAL"
        elif rng.random() < PELUANG_PINDAH:
            p.statusKependudukan = "PINDAH"

    # Dua baris pertama dilewati — `data/akun.py` memakainya sebagai akun demo.
    for p in rng.sample(daftar[2:], JUMLAH_SALAH_INPUT):
        p.deletedAt = TANGGAL_HAPUS_DUMMY


def generate_penduduk(cfg: Settings) -> list[Penduduk]:
    """Bangkitkan seluruh penduduk. Diseed dari `cfg.SEED_RANDOM_SEED` supaya
    datasetnya sama di setiap restart, bukan berubah-ubah tiap dinyalakan."""
    random.seed(cfg.SEED_RANDOM_SEED)
    counter = itertools.count(1)
    daftar: list[Penduduk] = []
    for index_keluarga in range(1, cfg.SEED_JUMLAH_KELUARGA + 1):
        daftar.extend(_keluarga(index_keluarga, counter, cfg))
    _tandai_status(daftar, cfg.SEED_RANDOM_SEED)
    return daftar


def bangun_kartu_keluarga(daftar: list[Penduduk]) -> dict[str, KartuKeluarga]:
    """Kelompokkan penduduk per `noKK` jadi indeks Kartu Keluarga."""
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


def _self_check() -> None:
    daftar = generate_penduduk(settings)
    kk_by_no_kk = bangun_kartu_keluarga(daftar)

    assert len(kk_by_no_kk) == settings.SEED_JUMLAH_KELUARGA, "jumlah KK tidak cocok"
    for kk in kk_by_no_kk.values():
        assert 3 <= len(kk.anggota) <= 5, f"anggota KK {kk.noKK} di luar 3-5"
    nik_set = {p.nik for p in daftar}
    assert len(nik_set) == len(daftar), "ada NIK duplikat"

    # Dua kolom baru: ada isinya, dan tidak menabrak akun demo.
    terhapus = [p for p in daftar if p.deletedAt is not None]
    assert len(terhapus) == JUMLAH_SALAH_INPUT, "jumlah baris salah input meleset"
    assert all(p.deletedAt is None for p in daftar[:2]), "akun demo ikut terhapus"
    status = {p.statusKependudukan for p in daftar}
    assert status == {"AKTIF", "PINDAH", "MENINGGAL"}, f"status tidak lengkap: {status}"
    assert all(
        p.statusHubunganKeluarga != "KEPALA_KELUARGA"
        for p in daftar
        if p.statusKependudukan == "MENINGGAL"
    ), "kepala keluarga tidak boleh bertanda meninggal"
    # Yang baru diparameterkan — pastikan cfg benar-benar dipakai, bukan literal.
    assert all(nik.startswith(settings.SEED_KODE_WILAYAH) for nik in nik_set), (
        "kode wilayah tidak terpakai di NIK"
    )
    assert {p.alamat.rw for p in daftar} <= set(settings.SEED_RW_LIST), (
        "ada RW di luar SEED_RW_LIST"
    )
    rt_per_rw: dict[str, set[str]] = {}
    for p in daftar:
        rt_per_rw.setdefault(p.alamat.rw, set()).add(p.alamat.rt)
    assert all(len(rts) == settings.SEED_RT_PER_RW for rts in rt_per_rw.values()), (
        f"tiap RW harus punya {settings.SEED_RT_PER_RW} RT: "
        f"{ {rw: sorted(rts) for rw, rts in rt_per_rw.items()} }"
    )
    # Tidak ada nomor RT yang dipakai dua RW.
    assert len({rt for rts in rt_per_rw.values() for rt in rts}) == (
        len(rt_per_rw) * settings.SEED_RT_PER_RW
    ), "nomor RT bertabrakan antar RW"
    assert {p.alamat.desa for p in daftar} == {settings.SEED_DESA}, (
        "desa tidak diambil dari config"
    )
    cacah = Counter(p.statusKependudukan for p in daftar)
    print(
        f"OK: {len(kk_by_no_kk)} KK, {len(daftar)} penduduk, NIK semua unik, "
        f"wilayah {settings.SEED_KODE_WILAYAH} RW {settings.SEED_RW_LIST}\n"
        f"    status: {dict(cacah)}, salah input (deletedAt): {len(terhapus)}"
    )


if __name__ == "__main__":
    _self_check()
