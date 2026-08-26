# Backend SIDUK

FastAPI + SQLite (`sqlite3` stdlib, tanpa ORM). Dua tabel: `penduduk` dan
`pengurus`.

**NIK dan Nomor Kartu Keluarga tidak disimpan sama sekali** — desa tidak
mengizinkannya. `id` penduduk adalah UUID yang dibangkitkan saat impor, bukan
turunan data apa pun. Lihat
`docs/superpowers/specs/2026-08-26-hapus-nik-kk-auth-pengurus-design.md`.

**Warga tidak punya akun.** Yang bisa masuk hanya perangkat desa: `ADMIN`
(Dukuh — plus kelola akun) dan `PENGURUS` (Ketua RW/RT).

| Kolom                | Isi                                                    |
| -------------------- | ------------------------------------------------------ |
| `statusKependudukan` | `AKTIF` / `PINDAH` / `MENINGGAL` — datanya sah, tetap ikut daftar & statistik |
| `deletedAt`          | ISO date atau `null` — salah input, **tidak pernah** ikut daftar & statistik |

Penyaringan `deletedAt` ada di `app/data/store.py`, satu tempat, bukan di tiap
router.

## Jalankan

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

cp .env.example .env      # WAJIB: isi ADMIN_USERNAME & ADMIN_PASSWORD
.venv/bin/uvicorn app.main:app --reload --port 8000
```

**Backend menolak jalan kalau tabel `pengurus` kosong dan `ADMIN_USERNAME` /
`ADMIN_PASSWORD` belum diisi.** Dua nilai itu dipakai sekali, untuk membuat akun
Dukuh pertama; setelah akun itu ada, nilainya tidak dipakai lagi. Memakai
default berarti ada instalasi yang berjalan dengan password yang tertulis di
kode publik — karena itu tidak ada defaultnya.

Docs interaktif: http://localhost:8000/docs

## Isi data penduduk

Database kosong tetap kosong — tidak ada seeding otomatis. Data masuk dari file
Excel pendataan:

```bash
.venv/bin/pip install openpyxl   # sekali, alat ini saja yang butuh
.venv/bin/python -m app.data.impor_excel ../docs/data-penduduk.xlsx
```

**Setiap impor MENIMPA seluruh tabel penduduk.** File yang diimpor harus selalu
lengkap, bukan berisi warga baru saja. Tanpa NIK tidak ada kunci yang bisa
dipercaya untuk mengenali orang yang sama antar-impor, jadi tidak ada dedup —
Excel adalah sumber kebenaran tunggal.

Restart backend setelah impor: `store.py` membaca tabel sekali saat start.

Formulir kosong untuk pengurus dibangkitkan dari definisi kolom yang sama:

```bash
.venv/bin/python -m tools.buat_template_excel   # -> docs/template-data-penduduk.xlsx
.venv/bin/python -m tools.buat_data_contoh      # -> docs/data-penduduk.xlsx (data karangan)
```

## Sambungkan ke frontend

Di `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8000
```

## Endpoint

| Method | Path                             | Untuk                                                  |
| ------ | -------------------------------- | ------------------------------------------------------ |
| POST   | `/auth/login`                    | pengurus: username + password → `{ token, user }`      |
| POST   | `/auth/logout`                   | —                                                      |
| GET    | `/penduduk`                      | daftar: `page`, `pageSize`, `search` (nama) + filter    |
| GET    | `/penduduk/filter-opsi`          | pilihan RT / RW / pekerjaan dari isi data              |
| GET    | `/penduduk/{id}`                 | detail satu warga                                       |
| GET    | `/infografis`                    | agregat lengkap — semua pengurus                        |
| GET    | `/publik/statistik`              | cacah per RW — **tanpa auth**                           |
| GET    | `/pengurus`                      | daftar akun — ADMIN                                     |
| POST   | `/pengurus`                      | tambah akun — ADMIN                                     |
| PATCH  | `/pengurus/{id}`                 | ubah nama / wilayah / status aktif — ADMIN              |
| POST   | `/pengurus/{id}/reset-password`  | ganti password akun — ADMIN                             |

Filter `GET /penduduk` (semua opsional, digabung AND): `jenisKelamin`, `agama`,
`golonganDarah`, `pendidikan`, `statusPerkawinan`, `statusHubunganKeluarga`,
`pekerjaan`, `rt`, `rw`, `kelompokUmur`.

Token JWT dikirim lewat header `Authorization: Bearer <token>`. Status `aktif`
diperiksa tiap request, jadi akun yang dinonaktifkan langsung tertolak walaupun
tokennya belum kedaluwarsa.

Tidak ada `DELETE /pengurus`: akun cukup dinonaktifkan supaya jejak audit tetap
menunjuk ke akun yang ada.

## Uji

```bash
.venv/bin/python -m app.data.db                                    # skema & impor menimpa
.venv/bin/python -m app.data.agregat                               # kelompok umur & distribusi
DATABASE_PATH=/tmp/uji.db .venv/bin/python -m app.data.pengurus     # kelola akun
```

`httpx` tidak ada di `requirements.txt`, jadi `fastapi.testclient` tidak bisa
dipakai. Uji ujung-ke-ujung: jalankan uvicorn di port lain dengan
`DATABASE_PATH` sementara, lalu panggil pakai `urllib` stdlib.

File `data/siduk.db` di-gitignore — **jangan pernah di-commit.** Backup-nya
menyalin file, bukan commit.

**Yang masih di memori dan hilang tiap restart:** audit log
(`app/core/audit.py`, baru `print()` ke console).
