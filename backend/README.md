# Backend SIDUK

FastAPI + SQLite (`sqlite3` stdlib, tanpa ORM). Enam tabel: `penduduk`,
`pengurus`, `sesi`, `pengajuan` + `persetujuan` (riwayat perpindahan jabatan),
dan `audit_log`. Tiga yang terakhir tidak pernah dihapus.

**NIK dan Nomor Kartu Keluarga tidak disimpan sama sekali** — desa tidak
mengizinkannya. `id` penduduk diambil dari kolom **Kode Warga** di Excel: kunci
yang dijaga pengurus, satu-satunya yang bertahan melewati impor yang menimpa.
Kode ganda atau kosong menghentikan impor. Lihat dua spec bertanggal 2026-08-26
di `docs/superpowers/specs/`.

**Warga tidak punya akun.** Yang bisa masuk hanya perangkat desa, empat peran:

| Peran   | Bisa apa |
| ------- | -------- |
| `ADMIN` | Kelola akun pengurus. **Nol akses data warga.** |
| `DUKUH` | Baca data warga + infografis **seluruh padukuhan** |
| `RW`    | sama, tapi **warga RW-nya saja** |
| `RT`    | sama, tapi **warga RT-nya saja** |

Akun melekat pada **jabatan**: daftarnya diturunkan dari alamat warga di data
penduduk, bukan disimpan di tabel kedua, jadi jabatan RT baru muncul sendiri
begitu ada warga ber-RT itu. Satu jabatan hanya boleh dipegang satu akun aktif.

**Mengisi jabatan kosong bebas; mengganti pemegang jabatan terisi wajib lewat
pengajuan yang disetujui.** Admin mengajukan, perangkat desa memutuskan:
ganti Ketua RT butuh Ketua RW-nya + Dukuh, ganti Ketua RW butuh Dukuh, ganti
Dukuh butuh seluruh Ketua RW. Jabatan penyetuju yang sedang kosong
**dilewati**, bukan ditunggu — tanpa itu satu jabatan kosong mengunci
pergantian selamanya.

**Password awal dari Admin sekali pakai.** Akun baru bisa login tapi ditolak di
semua endpoint lain sampai menggantinya lewat `POST /auth/ganti-password`.

| Kolom                | Isi                                                    |
| -------------------- | ------------------------------------------------------ |
| `statusKependudukan` | `AKTIF` / `PINDAH` / `MENINGGAL` — datanya sah, tetap ikut daftar & statistik |
| `deletedAt`          | ISO date atau `null` — salah input, **tidak pernah** ikut daftar & statistik |

Penyaringan `deletedAt` ada di `app/data/store.py`, satu tempat, bukan di tiap
router. **Batas wilayah juga**: `store.penduduk_untuk(user)` dipanggil setiap
endpoint baca, dan `GET /penduduk/{id}` menjawab 404 (bukan 403) untuk warga di
luar wilayah — 403 memberi tahu bahwa orangnya ada.

`store.py` tidak menyimpan cache: tiap panggilan query database. Statistik
publik (`/publik/statistik`) tetap se-padukuhan karena memang terbuka tanpa
login.

## Jalankan

```bash
./start.sh    # jalankan sekali: kerangka .env dibuatkan, lalu berhenti
              # isi ADMIN_USERNAME & ADMIN_PASSWORD di backend/.env
./start.sh    # jalankan lagi: bikin venv, pasang dependensi, nyalakan uvicorn
```

Tidak ada `.env.example`. Kerangkanya dibuatkan `start.sh` dengan **nilai
kosong**, bukan contoh yang berlaku — password contoh yang tersalin diam-diam
berhenti jadi contoh dan berubah jadi password Admin yang sungguhan.

### Isi `backend/.env`

| Variabel | Wajib | Guna |
| -------- | ----- | ---- |
| `ADMIN_USERNAME` | ✅ | Username akun Admin pertama. Dipakai sekali, saat tabel `pengurus` masih kosong. |
| `ADMIN_PASSWORD` | ✅ | Passwordnya. **Mengubahnya setelah akunnya terbentuk tidak berpengaruh apa-apa** — isi yang benar sejak awal. |
| `DATABASE_PATH` | — | Path file SQLite, relatif dari `backend/`. Bawaan `./data/siduk.db`. |
| `SESI_TTL_JAM` | — | Umur sesi login. Bawaan 12. |
| `CORS_ORIGINS` | — | Asal yang boleh memanggil API, dipisah koma. Tidak terpakai kalau frontend diproksikan lewat Vite (`/api`). |

Berkas itu **tidak ikut repo** (`.gitignore`). Definisi yang berlaku ada di
`app/core/config.py`; tabel di atas cuma penjelasannya.

Manual, kalau lebih suka:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload --port 8000
```

**Backend menolak jalan kalau tabel `pengurus` kosong sementara
`ADMIN_USERNAME` / `ADMIN_PASSWORD` belum diisi.**

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
.venv/bin/python -m app.data.impor_excel ../docs/data-penduduk.xlsx
```

**Setiap impor MENIMPA seluruh tabel penduduk**, jadi skrip ini **menolak jalan
kalau database sudah berisi** — sejak Tahap 3b sumber kebenaran data warga
adalah aplikasi, bukan file ini. Kalau memang mau membuang isi database dan
menggantinya, ulangi dengan `--timpa-semua`.

Kolom **Kode Warga** wajib diisi, unik, dan tidak boleh berubah: nilainya jadi
`id` penduduk. Impor berhenti dengan menyebutkan nomor barisnya kalau ada yang
kosong atau ganda.

Kolom **Jabatan** (`WARGA`/`DUKUH`/`RW`/`RT`) menandai siapa memegang apa.
Dibaca **hanya untuk jabatan yang masih kosong** — begitu terisi, kolom
itu diabaikan, sehingga impor tidak pernah membatalkan pergantian yang sudah
disetujui. Dua orang ditandai memegang jabatan yang sama menghentikan impor.

Restart backend setelah impor: `store.py` membaca tabel sekali saat start.

Kolom baru pada tabel yang sudah ada dipasang otomatis saat backend membuka
database (`db._TAMBALAN`) — **file `.db` tidak perlu dihapus**, dan akun yang
sudah ada selamat.

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
| GET    | `/penduduk/{id}`                 | detail satu warga (404 kalau di luar wilayah)           |
| POST   | `/penduduk`                      | tambah warga di wilayah sendiri — PENGURUS              |
| PATCH  | `/penduduk/{id}`                 | ubah data warga; RT/RW hanya Dukuh — PENGURUS           |
| GET    | `/infografis`                    | agregat lengkap — semua pengurus                        |
| GET    | `/publik/statistik`              | cacah per RW — **tanpa auth**                           |
| GET    | `/pengurus`                      | daftar **jabatan**, terisi & kosong — ADMIN              |
| GET    | `/pengurus/warga?q=&jabatanKode=` | cari warga buat dropdown (nama + RT/RW) — ADMIN        |
| POST   | `/pengurus`                      | isi satu jabatan kosong — ADMIN                         |
| POST   | `/pengurus/{id}/reset-password`  | ganti password akun — ADMIN                             |
| GET    | `/pergantian`                    | riwayat pengajuan — ADMIN                               |
| POST   | `/pergantian`                    | ajukan pergantian jabatan terisi — ADMIN                |
| GET    | `/pergantian/menunggu`           | pengajuan yang menunggu jawaban saya — PENGURUS         |
| POST   | `/pergantian/{id}/jawab`         | satu suara, tidak bisa diubah — PENGURUS                |
| GET    | `/audit`                         | riwayat: data warga se-wilayah (PENGURUS) / akun (ADMIN) |

Filter `GET /penduduk` (semua opsional, digabung AND): `jenisKelamin`, `agama`,
`golonganDarah`, `pendidikan`, `statusPerkawinan`, `statusHubunganKeluarga`,
`pekerjaan`, `rt`, `rw`, `kelompokUmur`.

Token sesi dikirim lewat header `Authorization: Bearer <token>`. Sesi, status
`aktif`, dan `harus_ganti_password` diperiksa tiap request — pencabutan berlaku
seketika, tidak ada yang tetap sah sampai umurnya habis.

**Tidak ada `PATCH` maupun `DELETE /pengurus`.** Jabatan hanya menjadi kosong
lewat pergantian yang disetujui — kalau Admin bisa mengosongkannya sendiri, ia
bisa mengisinya langsung dan persetujuan jadi hiasan yang bisa dilewati dalam
dua klik.

**Satu orang satu jabatan**, diperiksa lewat Kode Warga (`pengurus.warga_id`),
bukan nama — dua orang yang benar-benar senama tidak boleh saling menghalangi.

**Kandidat wajib warga wilayah jabatannya**: Ketua RT dari RT itu, Ketua RW dari
RW itu, Dukuh dari mana pun (`pengurus.cocok_wilayah`). Ditegakkan saat mengisi
jabatan kosong maupun mengajukan pergantian. Karena itu `POST /pengurus` menerima
`wargaId`, bukan `nama` — nama dari klien tidak bisa diperiksa, Kode Warga bisa.

`/pengurus/warga` adalah **satu-satunya celah Admin ke data warga**: nama +
RT/RW saja, minimal 2 huruf pencarian, maksimal 20 hasil. `?jabatanKode=`
mempersempitnya ke warga yang boleh memegang jabatan itu — makin sempit, makin
sedikit data warga yang terbuka untuk Admin. Celah ini tidak
terhindarkan — Admin harus bisa menunjuk orang — jadi yang bisa dilakukan
adalah membuatnya sesempit mungkin.

## Uji

```bash
.venv/bin/python -m app.data.db                                    # skema & impor menimpa
.venv/bin/python -m app.data.agregat                               # kelompok umur & distribusi
DATABASE_PATH=/tmp/uji.db .venv/bin/python -m app.data.pengurus     # kelola akun
DATABASE_PATH=/tmp/uji2.db .venv/bin/python -m app.data.pergantian  # aturan penyetuju
DATABASE_PATH=/tmp/uji3.db .venv/bin/python -m app.data.sesi        # sesi login
.venv/bin/python -m app.core.ratelimit                             # batas login
```

`httpx` tidak ada di `requirements.txt`, jadi `fastapi.testclient` tidak bisa
dipakai. Uji ujung-ke-ujung: jalankan uvicorn di port lain dengan
`DATABASE_PATH` sementara, lalu panggil pakai `urllib` stdlib.

File `data/siduk.db` di-gitignore — **jangan pernah di-commit.** Backup-nya
menyalin file, bukan commit.

**Audit log tersimpan permanen** di tabel `audit_log` — siapa mengubah apa,
kapan, dan nilai sebelum → sesudah tiap kolom. Dibaca lewat `GET /audit`, dan
isinya mengikuti kewenangan: pengurus mendapat riwayat data warga di
wilayahnya, Admin hanya riwayat kelola akun.

**Login dibatasi** (`app/core/ratelimit.py`): 5 percobaan gagal **per
username** dalam 15 menit, lalu 429 beserta `Retry-After`. Tidak ada batas
per-IP — satu jaringan balai desa dipakai banyak pengurus sekaligus, jadi
menghitung per IP bisa mengunci seluruh ruangan.

**Sesi tersimpan di server** (tabel `sesi`), bukan JWT. Token cuma nomor acak;
"Keluar" benar-benar mencabut, ganti password memutus sesi lain milik akun itu,
dan reset oleh Admin mencabut seluruh sesinya. Tidak ada `JWT_SECRET`.
