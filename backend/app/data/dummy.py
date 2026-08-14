"""Generator data dummy kependudukan: 200 Kartu Keluarga, tiap KK beranggota
3-5 orang (diacak). Dipakai selama backend belum tersambung ke Postgres asli
(lihat CLAUDE.md §11) — data ini hidup di memori proses, hilang tiap restart.

Diseed supaya datasetnya tetap sama di setiap restart, bukan berubah-ubah
tiap kali server dinyalakan.
"""

import calendar
import itertools
import random
from datetime import date

from app.schemas.penduduk import Alamat, KartuKeluarga, Penduduk

JUMLAH_KELUARGA = 200
TAHUN_SEKARANG = 2026

SEED = 20260814

WILAYAH = {
    "desa": "Sukamaju",
    "kecamatan": "Cibiru",
    "kabupaten": "Bandung",
    "provinsi": "Jawa Barat",
    "kodePos": "40615",
}

RW_LIST = ["019", "020", "021"]
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


def _nama_depan(perempuan: bool) -> str:
    return random.choice(NAMA_DEPAN_PEREMPUAN if perempuan else NAMA_DEPAN_LAKI)


def _tanggal_lahir(usia: int) -> date:
    tahun = TAHUN_SEKARANG - usia
    bulan = random.randint(1, 12)
    hari = random.randint(1, calendar.monthrange(tahun, bulan)[1])
    return date(tahun, bulan, hari)


def _nik(tanggal: date, perempuan: bool, urut: int) -> str:
    hari = tanggal.day + (40 if perempuan else 0)
    return f"320412{hari:02d}{tanggal.month:02d}{tanggal.year % 100:02d}{urut:04d}"


def _no_kk(index_keluarga: int) -> str:
    return f"320412000001{index_keluarga:04d}"


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
        nik=_nik(tanggal_lahir, perempuan, nik_urut),
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


def _keluarga(index_keluarga: int, counter: itertools.count) -> list[Penduduk]:
    jumlah_anggota = random.randint(3, 5)
    no_kk = _no_kk(index_keluarga)
    rw = RW_LIST[(index_keluarga - 1) % len(RW_LIST)]
    rt = f"{((index_keluarga - 1) % 5) + 1:03d}"
    alamat = Alamat(
        jalan=f"Jl. {random.choice(JALAN_POOL)} No. {random.randint(1, 60)}",
        rt=rt,
        rw=rw,
        **WILAYAH,
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


def _generate() -> list[Penduduk]:
    random.seed(SEED)
    counter = itertools.count(1)
    daftar: list[Penduduk] = []
    for index_keluarga in range(1, JUMLAH_KELUARGA + 1):
        daftar.extend(_keluarga(index_keluarga, counter))
    return daftar


DAFTAR_PENDUDUK: list[Penduduk] = _generate()


def _bangun_kartu_keluarga() -> dict[str, KartuKeluarga]:
    by_no_kk: dict[str, list[Penduduk]] = {}
    for p in DAFTAR_PENDUDUK:
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


KARTU_KELUARGA_BY_NOKK: dict[str, KartuKeluarga] = _bangun_kartu_keluarga()


def _self_check() -> None:
    assert len(KARTU_KELUARGA_BY_NOKK) == JUMLAH_KELUARGA, "jumlah KK harus 200"
    for kk in KARTU_KELUARGA_BY_NOKK.values():
        assert 3 <= len(kk.anggota) <= 5, f"anggota KK {kk.noKK} di luar 3-5"
    nik_set = {p.nik for p in DAFTAR_PENDUDUK}
    assert len(nik_set) == len(DAFTAR_PENDUDUK), "ada NIK duplikat"
    print(
        f"OK: {len(KARTU_KELUARGA_BY_NOKK)} KK, "
        f"{len(DAFTAR_PENDUDUK)} penduduk, NIK semua unik"
    )


if __name__ == "__main__":
    _self_check()
