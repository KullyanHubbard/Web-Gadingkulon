"""Helper cacah yang dipakai lebih dari satu router statistik.

Sebelumnya `infografis.py` dan `publik.py` masing-masing menulis ulang
`_format_rw`, `_umur`, dan pengelompokan umurnya sendiri. Satu tempat saja:
kalau batas kelompok umur berubah, dua halaman ikut berubah bersamaan.
"""

from collections import Counter
from datetime import date
from typing import Callable, Iterable

from app.schemas.penduduk import Distribusi, Penduduk

# Urutan tampil kelompok umur, sengaja eksplisit: mengurutkan labelnya sebagai
# teks menaruh '13-17' sebelum '6-12'.
KELOMPOK_UMUR = ("0-5", "6-12", "13-17", "18-25", "26-40", "41-60", "60+")

# Batas atas (inklusif) tiap kelompok kecuali yang terakhir.
_BATAS_UMUR = (5, 12, 17, 25, 40, 60)

# Urutan tampil pendidikan — jenjang naik dari SD ke tertinggi. "Tidak
# Sekolah" bukan jenjang, ditaruh di ekor, bukan di kepala urutan naik.
URUTAN_PENDIDIKAN = ("SD", "SMP", "SMA", "D3", "S1", "S2", "S3", "TIDAK_SEKOLAH")


def _dua_digit(kode: str) -> str:
    """`'019'` -> `'19'`, `'001'` -> `'01'`.

    Nol di depan adalah format penyimpanan yang mengikuti kartu keluarga (tiga
    digit); yang dibaca orang dua digit. Nomor tiga digit sungguhan (`'100'`)
    tidak dipotong, dan kode nol semua tidak jadi string kosong.
    """
    return (kode.lstrip("0") or "0").rjust(2, "0")


def format_rw(rw: str) -> str:
    """`'019'` -> `'RW 19'` — cerminan `frontend/src/lib/wilayah.ts`."""
    return f"RW {_dua_digit(rw)}"


def format_rt(rt: str) -> str:
    """`'001'` -> `'RT 01'`."""
    return f"RT {_dua_digit(rt)}"


def umur(tanggal_lahir_iso: str) -> int:
    lahir = date.fromisoformat(tanggal_lahir_iso)
    hari_ini = date.today()
    tahun = hari_ini.year - lahir.year
    if (hari_ini.month, hari_ini.day) < (lahir.month, lahir.day):
        tahun -= 1
    return tahun


def kelompok_umur(tahun: int) -> str:
    for batas, label in zip(_BATAS_UMUR, KELOMPOK_UMUR):
        if tahun <= batas:
            return label
    return KELOMPOK_UMUR[-1]


def distribusi_by(
    orang: Iterable[Penduduk], keyfn: Callable[[Penduduk], str]
) -> list[Distribusi]:
    """Cacah per kategori, terbanyak dulu. Kategori tanpa anggota tidak muncul."""
    counter = Counter(keyfn(p) for p in orang)
    return sorted(
        (Distribusi(label=k, value=v) for k, v in counter.items()),
        key=lambda d: d.value,
        reverse=True,
    )


def distribusi_kelompok_umur(orang: Iterable[Penduduk]) -> list[Distribusi]:
    """Cacah per kelompok umur, urut umur — bukan urut jumlah."""
    return sorted(
        distribusi_by(orang, lambda p: kelompok_umur(umur(p.tanggalLahir))),
        key=lambda d: KELOMPOK_UMUR.index(d.label),
    )


def distribusi_pendidikan(orang: Iterable[Penduduk]) -> list[Distribusi]:
    """Cacah per pendidikan, urut jenjang — bukan urut jumlah."""
    return sorted(
        distribusi_by(orang, lambda p: p.pendidikan),
        key=lambda d: URUTAN_PENDIDIKAN.index(d.label),
    )


if __name__ == "__main__":
    # Cek mandiri: `python -m app.data.agregat` (tidak butuh pytest).
    assert format_rw("019") == "RW 19"
    assert format_rw("100") == "RW 100"
    assert format_rw("000") == "RW 00"
    assert format_rt("001") == "RT 01"
    assert format_rt("012") == "RT 12"

    assert [kelompok_umur(u) for u in (0, 5, 6, 17, 18, 60, 61, 99)] == [
        "0-5",
        "0-5",
        "6-12",
        "13-17",
        "18-25",
        "41-60",
        "60+",
        "60+",
    ]

    hari_ini = date.today()
    assert umur(hari_ini.replace(year=hari_ini.year - 30).isoformat()) == 30
    # Ulang tahun besok: belum genap.
    besok = hari_ini.toordinal() + 1
    lahir = date.fromordinal(besok).replace(year=hari_ini.year - 30)
    assert umur(lahir.isoformat()) == 29

    def _orang(
        tanggal_lahir: str, agama: str = "ISLAM", pendidikan: str = "SD"
    ) -> Penduduk:
        return Penduduk(
            id="uji",
            nama="x",
            jenisKelamin="LAKI_LAKI",
            tempatLahir="x",
            tanggalLahir=tanggal_lahir,
            agama=agama,
            statusPerkawinan="BELUM_KAWIN",
            pendidikan=pendidikan,
            pekerjaan="x",
            golonganDarah="O",
            statusHubunganKeluarga="ANAK",
            kewarganegaraan="WNI",
            alamat={
                "jalan": "x",
                "rt": "001",
                "rw": "019",
                "desa": "x",
                "kecamatan": "x",
                "kabupaten": "x",
                "provinsi": "x",
                "kodePos": "00000",
            },
        )

    y = hari_ini.year
    warga = [
        _orang(f"{y - 3}-01-01"),
        _orang(f"{y - 30}-01-01"),
        _orang(f"{y - 31}-01-01"),
        _orang(f"{y - 70}-01-01", agama="KATOLIK"),
    ]
    # Urut umur, bukan urut jumlah: '0-5' (1 orang) tetap di depan '26-40' (2).
    assert [(d.label, d.value) for d in distribusi_kelompok_umur(warga)] == [
        ("0-5", 1),
        ("26-40", 2),
        ("60+", 1),
    ]
    # Sebaliknya, distribusi biasa urut jumlah.
    assert [(d.label, d.value) for d in distribusi_by(warga, lambda p: p.agama)] == [
        ("ISLAM", 3),
        ("KATOLIK", 1),
    ]

    warga_pendidikan = [
        _orang(f"{y - 30}-01-01", pendidikan="S1"),
        _orang(f"{y - 30}-01-01", pendidikan="SD"),
    ]
    # Urut jenjang (SD sebelum S1), bukan urut abjad atau jumlah.
    assert [d.label for d in distribusi_pendidikan(warga_pendidikan)] == [
        "SD",
        "S1",
    ]

    print("agregat: OK")
