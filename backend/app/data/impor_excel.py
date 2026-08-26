"""Isi tabel penduduk dari file Excel hasil pendataan pengurus. Kolomnya
dibaca lewat app/schemas/penduduk.py, disimpan lewat app/data/db.py (sudah
tervalidasi self-check-nya sendiri).

File Excel adalah sumber kebenaran tunggal. Setiap impor MENIMPA seluruh
tabel penduduk — file yang diimpor harus selalu lengkap, bukan berisi warga
baru saja, atau warga lama akan terhapus.

Tidak ada dedup: tanpa NIK tidak ada kunci yang bisa dipercaya untuk mengenali
orang yang sama antar-impor, dan kandidat penggantinya (nama + tanggal lahir +
alamat) gagal persis pada kasus yang paling mungkin terjadi di satu padukuhan:
dua orang senama.

Kolom dicocokkan lewat **nama header**, bukan urutan. Pengurus boleh
menggeser, jadi mengandalkan urutan berarti data masuk ke kolom yang salah
tanpa ada yang menyadarinya.

Backend boleh tetap menyala saat skrip ini jalan — SQLite aman ditulis
sementara proses lain membacanya. Yang TIDAK terjadi otomatis: proses backend
yang sedang jalan sudah memuat seluruh tabel ke memori saat start
(app/data/store.py), jadi warga baru baru kelihatan di API setelah backend
di-restart.

Pakai:
    .venv/bin/pip install openpyxl   # sekali, alat ini saja yang butuh
    .venv/bin/python -m app.data.impor_excel ../docs/data-penduduk.xlsx
"""

import sys
import uuid

from openpyxl import load_workbook

from app.core.config import settings
from app.data import db
from app.schemas.penduduk import Alamat, Penduduk

NAMA_SHEET = "Data Penduduk"
BARIS_HEADER = 2  # baris 1 = judul

# Satu-satunya definisi kolom: (field Pydantic, label di Excel, lebar kolom).
# Pembangkit file Excel di `backend/tools/` membaca daftar ini juga, supaya
# bentuk file dan pembacanya tidak mungkin melenceng sendiri-sendiri.
KOLOM: list[tuple[str, str, int]] = [
    ("nama", "Nama Lengkap", 24),
    ("jenisKelamin", "Jenis Kelamin", 14),
    ("tempatLahir", "Tempat Lahir", 16),
    ("tanggalLahir", "Tanggal Lahir (yyyy-mm-dd)", 20),
    ("agama", "Agama", 12),
    ("statusPerkawinan", "Status Perkawinan", 16),
    ("pendidikan", "Pendidikan Terakhir", 14),
    ("pekerjaan", "Pekerjaan", 20),
    ("golonganDarah", "Gol. Darah", 10),
    ("statusHubunganKeluarga", "Status dalam KK", 18),
    ("kewarganegaraan", "Kewarganegaraan", 14),
    ("jalan", "Alamat Jalan", 26),
    ("rt", "RT", 6),
    ("rw", "RW", 6),
    ("desa", "Desa/Kelurahan", 16),
    ("kecamatan", "Kecamatan", 14),
    ("kabupaten", "Kabupaten", 14),
    ("provinsi", "Provinsi", 14),
    ("kodePos", "Kode Pos", 10),
]

# Kolom yang isinya terkunci ke sedikit pilihan. Dipakai pembangkit template
# untuk memasang dropdown; salah ketik ditangkap Pydantic saat impor.
PILIHAN: dict[str, list[str]] = {
    "jenisKelamin": ["LAKI_LAKI", "PEREMPUAN"],
    "agama": ["ISLAM", "KRISTEN", "KATOLIK", "HINDU", "BUDDHA", "KONGHUCU", "LAINNYA"],
    "statusPerkawinan": ["BELUM_KAWIN", "KAWIN", "CERAI_HIDUP", "CERAI_MATI"],
    "pendidikan": ["TIDAK_SEKOLAH", "SD", "SMP", "SMA", "D3", "S1", "S2", "S3"],
    "golonganDarah": ["A", "B", "AB", "O", "TIDAK_TAHU"],
    "statusHubunganKeluarga": [
        "KEPALA_KELUARGA", "ISTRI", "ANAK", "FAMILI_LAIN", "LAINNYA",
    ],
}

_ALAMAT = {
    "jalan", "rt", "rw", "desa", "kecamatan", "kabupaten", "provinsi", "kodePos",
}


def _samakan(teks: object) -> str:
    """Header dibandingkan tanpa peduli huruf besar-kecil & spasi berlebih."""
    return " ".join(str(teks or "").split()).lower()


def petakan_kolom(baris_header: tuple) -> dict[str, int]:
    """Nama field -> indeks kolom, dicocokkan dari label di baris header."""
    ada = {_samakan(v): i for i, v in enumerate(baris_header) if v is not None}
    peta, hilang = {}, []
    for field, label, _ in KOLOM:
        i = ada.get(_samakan(label))
        if i is None:
            hilang.append(label)
        else:
            peta[field] = i
    if hilang:
        sys.exit(
            "Kolom berikut tidak ketemu di baris header Excel:\n  "
            + "\n  ".join(hilang)
            + "\n\nJudul kolom tidak boleh diubah — urutannya boleh."
        )
    return peta


def baris_ke_penduduk(nilai: dict[str, str]) -> Penduduk:
    inti = {k: v for k, v in nilai.items() if k not in _ALAMAT}
    alamat = {k: v for k, v in nilai.items() if k in _ALAMAT}
    # `id` dibangkitkan, bukan diturunkan dari data: NIK tidak lagi disimpan
    # (spec 2026-08-26), dan tidak ada field lain yang dijamin unik.
    return Penduduk(id=str(uuid.uuid4()), alamat=Alamat(**alamat), **inti)


def baca_xlsx(path: str) -> list[Penduduk]:
    ws = load_workbook(path, data_only=True)[NAMA_SHEET]
    baris = list(ws.iter_rows(min_row=BARIS_HEADER, values_only=True))
    peta = petakan_kolom(baris[0])

    daftar = []
    for r in baris[1:]:
        if not r[peta["nama"]]:  # nama kosong = baris belum diisi, lewati
            continue
        nilai = {
            field: ("" if r[i] is None else str(r[i]).strip())
            for field, i in peta.items()
        }
        daftar.append(baris_ke_penduduk(nilai))
    return daftar


def main(path_xlsx: str) -> None:
    daftar = baca_xlsx(path_xlsx)
    if not daftar:
        sys.exit("Tidak ada baris terisi — cek lagi apakah baris contoh sudah dihapus.")

    conn = db.buka(settings.DATABASE_FILE)
    lama = db.kosongkan(conn)
    masuk = db.simpan(conn, daftar)
    conn.close()
    if lama:
        print(f"PERHATIAN: {lama} baris lama dihapus dan diganti seluruhnya.")
    print(f"OK: {masuk} warga masuk ke {settings.DATABASE_FILE}")
    print("Restart backend supaya data ini kepakai — store.py baca tabel sekali saat start.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Pakai: python -m app.data.impor_excel <path-ke-file.xlsx>")
    main(sys.argv[1])
