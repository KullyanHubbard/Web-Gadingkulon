# Backend SIDUK

FastAPI + SQLite (`sqlite3` stdlib, tanpa ORM). Empat tabel: `penduduk`,
`pengurus`, serta `pengajuan` + `persetujuan` (riwayat perpindahan jabatan,
tidak pernah dihapus).

**NIK dan Nomor Kartu Keluarga tidak disimpan sama sekali** — desa tidak
mengizinkannya. `id` penduduk diambil dari kolom **Kode Warga** di Excel: kunci
yang dijaga pengurus, satu-satunya yang bertahan melewati impor yang menimpa.
Kode ganda atau kosong menghentikan impor. Lihat dua spec bertanggal 2026-08-26
di `docs/superpowers/specs/`.

**Warga tidak punya akun.** Yang bisa masuk hanya perangkat desa, empat peran:

| Peran   | Bisa apa |
| ------- | -------- |
| `ADMIN` | Kelola akun pengurus. **Nol akses data warga.** |
| `DUKUH` | Baca seluruh data warga + infografis |
| `RW`    | sama (satu akun per nomor RW) |
| `RT`    | sama (satu akun per nomor RT) |

Akun berbentuk **kursi**: daftar jabatannya diturunkan dari alamat warga di
data penduduk, bukan disimpan di tabel kedua, jadi kursi RT baru muncul sendiri
begitu ada warga ber-RT itu. Satu kursi hanya boleh dihuni satu akun aktif.

**Mengisi kursi kosong bebas; mengganti penghuni kursi terisi wajib lewat
pengajuan yang disetujui.** Admin mengajukan, perangkat desa memutuskan:
ganti Ketua RT butuh Ketua RW-nya + Dukuh, ganti Ketua RW butuh Dukuh, ganti
Dukuh butuh seluruh Ketua RW. Kursi penyetuju yang sedang kosong **dilewati**,
bukan ditunggu — tanpa itu satu kursi kosong mengunci pergantian selamanya.

**Password awal dari Admin sekali pakai.** Akun baru bisa login tapi ditolak di
semua endpoint lain sampai menggantinya lewat `POST /auth/ganti-password`.

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

**Backend menolak jalan kalau `JWT_SECRET` masih bernilai bawaan**, atau kalau
tabel `pengurus` kosong sementara `ADMIN_USERNAME` / `ADMIN_PASSWORD` belum
diisi.

`JWT_SECRET` bawaan tertulis di kode yang bisa dibaca siapa saja — dengan nilai
itu siapa pun bisa membuat token masuk palsu untuk akun mana pun. Bangkitkan
sekali: `python3 -c "import secrets; print(secrets.token_urlsafe(48))"`.

`ADMIN_USERNAME` / `ADMIN_PASSWORD` dipakai sekali, untuk membuat akun `ADMIN`
pertama; setelah akun itu ada, nilainya tidak dipakai lagi — **mengubahnya
belakangan tidak mengubah password akun yang sudah terlanjur dibuat.** Akun
bootstrap ini tidak dituntut ganti password: nilainya datang dari environment
server, bukan dari tangan orang lain.

Docs interaktif: http://localhost:8000/docs

## Isi data penduduk

Database kosong tetap kosong — tidak ada seeding otomatis. Data masuk dari file
Excel pendataan:

```bash
.venv/bin/pip install openpyxl   # sekali, alat ini saja yang butuh
.venv/bin/python -m app.data.impor_excel ../docs/data-penduduk.xlsx
```

**Setiap impor MENIMPA seluruh tabel penduduk.** File yang diimpor harus selalu
lengkap, bukan berisi warga baru saja. Excel adalah sumber kebenaran tunggal.

Kolom **Kode Warga** wajib diisi, unik, dan tidak boleh berubah: nilainya jadi
`id` penduduk. Impor berhenti dengan menyebutkan nomor barisnya kalau ada yang
kosong atau ganda.

Kolom **Jabatan** (`WARGA`/`DUKUH`/`RW`/`RT`) menandai siapa memegang kursi apa.
Dibaca **hanya untuk kursi yang masih kosong** — begitu kursinya terisi, kolom
itu diabaikan, sehingga impor tidak pernah membatalkan pergantian yang sudah
disetujui. Dua orang ditandai memegang kursi yang sama menghentikan impor.

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
| POST   | `/auth/ganti-password`           | ganti password sendiri (semua peran)                   |
| GET    | `/penduduk`                      | daftar: `page`, `pageSize`, `search` (nama) + filter    |
| GET    | `/penduduk/filter-opsi`          | pilihan RT / RW / pekerjaan dari isi data              |
| GET    | `/penduduk/{id}`                 | detail satu warga                                       |
| GET    | `/infografis`                    | agregat lengkap — semua pengurus                        |
| GET    | `/publik/statistik`              | cacah per RW — **tanpa auth**                           |
| GET    | `/pengurus`                      | daftar **kursi**, terisi & kosong — ADMIN                |
| GET    | `/pengurus/warga?q=&kursi=`      | cari warga buat dropdown (nama + RT/RW) — ADMIN         |
| POST   | `/pengurus`                      | isi satu kursi kosong — ADMIN                           |
| POST   | `/pengurus/{id}/reset-password`  | ganti password akun — ADMIN                             |
| GET    | `/pergantian`                    | riwayat pengajuan — ADMIN                               |
| POST   | `/pergantian`                    | ajukan pergantian kursi terisi — ADMIN                  |
| GET    | `/pergantian/menunggu`           | pengajuan yang menunggu jawaban saya — PENGURUS         |
| POST   | `/pergantian/{id}/jawab`         | satu suara, tidak bisa diubah — PENGURUS                |

Filter `GET /penduduk` (semua opsional, digabung AND): `jenisKelamin`, `agama`,
`golonganDarah`, `pendidikan`, `statusPerkawinan`, `statusHubunganKeluarga`,
`pekerjaan`, `rt`, `rw`, `kelompokUmur`.

Token JWT dikirim lewat header `Authorization: Bearer <token>`. Status `aktif`
dan `harus_ganti_password` diperiksa tiap request, jadi akun yang dicabut
aksesnya langsung tertolak walaupun tokennya belum kedaluwarsa.

**Tidak ada `PATCH` maupun `DELETE /pengurus`.** Kursi hanya menjadi kosong
lewat pergantian yang disetujui — kalau Admin bisa mengosongkannya sendiri, ia
bisa mengisinya langsung dan persetujuan jadi hiasan yang bisa dilewati dalam
dua klik.

**Kandidat wajib warga wilayah kursinya**: Ketua RT dari RT itu, Ketua RW dari
RW itu, Dukuh dari mana pun (`pengurus.cocok_wilayah`). Ditegakkan saat mengisi
kursi kosong maupun mengajukan pergantian. Karena itu `POST /pengurus` menerima
`wargaId`, bukan `nama` — nama dari klien tidak bisa diperiksa, Kode Warga bisa.

`/pengurus/warga` adalah **satu-satunya celah Admin ke data warga**: nama +
RT/RW saja, minimal 2 huruf pencarian, maksimal 20 hasil. `?kursi=`
mempersempitnya ke warga yang boleh menduduki kursi itu — makin sempit, makin
sedikit data warga yang terbuka untuk Admin. Celah ini tidak
terhindarkan — Admin harus bisa menunjuk orang — jadi yang bisa dilakukan
adalah membuatnya sesempit mungkin.

## Uji

```bash
.venv/bin/python -m app.data.db                                    # skema & impor menimpa
.venv/bin/python -m app.data.agregat                               # kelompok umur & distribusi
DATABASE_PATH=/tmp/uji.db .venv/bin/python -m app.data.pengurus     # kelola akun
DATABASE_PATH=/tmp/uji2.db .venv/bin/python -m app.data.pergantian  # aturan penyetuju
```

`httpx` tidak ada di `requirements.txt`, jadi `fastapi.testclient` tidak bisa
dipakai. Uji ujung-ke-ujung: jalankan uvicorn di port lain dengan
`DATABASE_PATH` sementara, lalu panggil pakai `urllib` stdlib.

File `data/siduk.db` di-gitignore — **jangan pernah di-commit.** Backup-nya
menyalin file, bukan commit.

**Yang masih di memori dan hilang tiap restart:** audit log
(`app/core/audit.py`, baru `print()` ke console).
