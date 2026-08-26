# CLAUDE.md — Panduan Kerja & Konvensi Kode (SIDUK)

Dokumen ini adalah **sumber kebenaran** untuk gaya kode, arsitektur, dan alur
kerja proyek **SIDUK — Portal Data Kependudukan Desa**. Baca ini sebelum menulis
kode agar hasil tetap rapi dan konsisten.

---

## Kondisi Saat Ini

- **Backend:** aktif — FastAPI, 10 endpoint (auth, penduduk, infografis,
  statistik publik, kelola akun pengurus). Daftar lengkap di §11.
- **Frontend:** aktif, http-only — semua fitur memanggil backend langsung
  lewat `apiClient`. Backend harus jalan (`localhost:8000`) agar frontend
  berfungsi.
- **Database:** **SQLite — terpasang** untuk data penduduk **dan akun
  pengurus** (`backend/app/data/db.py`, file di `settings.DATABASE_PATH`).
  Tidak ada seeding otomatis: data penduduk masuk lewat
  `app/data/impor_excel.py`, akun Dukuh pertama lewat `pengurus.bootstrap()`
  dari env. **Yang masih di memori:** audit log saja.
- **NIK & No. KK tidak disimpan sama sekali** (keputusan desa, 26 Agustus
  2026). Warga tidak punya akun. `id` penduduk = kolom **Kode Warga** di Excel.
- **Empat peran** (`ADMIN`/`DUKUH`/`RW`/`RT`) dan akun berbentuk **kursi**.
  Mengisi kursi kosong bebas; **mengganti penghuni kursi terisi wajib lewat
  pengajuan yang disetujui** perangkat desa. Admin mengajukan, tidak pernah
  menyetujui.

---

## 1. Tentang Proyek

Web untuk melihat data kependudukan desa. Dipakai **perangkat desa saja** —
warga tidak punya akun.

| Peran     | Hak akses                                                                    |
| --------- | ---------------------------------------------------------------------------- |
| **ADMIN** | Kelola akun pengurus. **Nol akses data warga** — bukan pembatasan simbolis     |
| **DUKUH** | Baca data penduduk & infografis **seluruh padukuhan**                         |
| **RW**    | sama, tapi **warga RW-nya saja** (satu akun per nomor RW)                     |
| **RT**    | sama, tapi **warga RT-nya saja** (satu akun per nomor RT)                     |

Kewenangan ADMIN dan tiga peran lain **berpotongan kosong**: yang memegang
tombol pemberian akses tidak membaca isi datanya, dan yang membaca data tidak
bisa menyentuh akun siapa pun termasuk akunnya sendiri. Baca **dibatasi
wilayah** sejak Tahap 3a — Ketua RT 004 hanya melihat warga RT 004.

Halaman depan (`/publik/statistik`) terbuka tanpa login, isinya cacah saja.

Desain berlaku, tiga dokumen dan ketiganya masih hidup:
`2026-08-26-hapus-nik-kk-auth-pengurus-design.md` (NIK/KK & warga tanpa akun)
`2026-08-26-empat-peran-pergantian-pengurus-design.md` (peran, kursi, Kode
Warga, ganti password wajib), dan
`2026-08-26-tahap-2-pengajuan-persetujuan-design.md` (pengajuan, persetujuan,
aturan "kursi kosong dilewati"), dan
`2026-08-26-tahap-3-wilayah-dan-mutasi-design.md` (batas wilayah — 3a selesai,
mutasi data warga 3b belum).
Spec lama (`2026-08-12-auth-warga-pin-design.md`) disimpan sebagai catatan
alasan — terutama bagian "Rancangan awal yang dibatalkan" yang masih berlaku —
tapi seluruh jalur autentikasi warga di dalamnya **sudah dicabut**.

**Status:** Frontend + backend aktif. Backend (`backend/`) FastAPI dengan data
penduduk di SQLite, diisi dari file Excel pendataan lewat
`backend/app/data/impor_excel.py`.

### Penamaan proyek (jangan ditanya ulang)

| Konteks                                   | Nama                            |
| ----------------------------------------- | ------------------------------- |
| Repo & direktori                          | `NIA-WEB` — **jangan diubah**   |
| Nama package (`frontend/package.json`)    | `nia-web-frontend` — **jangan diubah** |
| Nama produk yang dilihat user             | **SIDUK**                       |
| Judul dokumen, README, UI, FastAPI `title` | **SIDUK** (`title="SIDUK API"`) |

`NIA-WEB` / `nia-web-frontend` sudah tertanam di git history dan lockfile;
menggantinya cuma bikin diff besar tanpa manfaat. Yang penting konsisten adalah
nama yang **dibaca user** — itu selalu SIDUK.

## 2. Tech Stack

| Lapisan     | Teknologi                                                             |
| ----------- | -------------------------------------------------------------------- |
| Frontend    | React 18 + TypeScript + Vite                                         |
| Styling     | Tailwind CSS                                                         |
| Routing     | React Router v6                                                      |
| Server state| TanStack Query (React Query)                                        |
| Auth state  | Zustand                                                              |
| Form        | React Hook Form + Zod                                                |
| Charts      | Recharts                                                             |
| Backend     | Python + FastAPI                                                     |
| Database    | SQLite (`sqlite3` stdlib, tanpa ORM) — data penduduk                 |

## 3. Struktur Direktori

```
NIA-WEB/
├── CLAUDE.md                 # dokumen ini
├── frontend/                 # aplikasi React (aktif)
│   └── src/
│       ├── app/              # provider global (React Query, Router)
│       ├── components/
│       │   ├── layout/       # Sidebar, Navbar, DashboardLayout, PageHeader
│       │   └── ui/           # primitif UI reusable (Button, Card, Table, …)
│       ├── config/           # akses env tervalidasi (env.ts)
│       ├── features/         # kode per-domain (lihat §4)
│       │   ├── auth/             # login + sesi + ganti password
│       │   ├── pengurus/         # kursi & akun (ADMIN)
│       │   ├── pergantian/       # pengajuan + persetujuan jabatan
│       │   ├── penduduk/         # daftar + filter kategori
│       │   ├── infografis/       # agregat untuk pengurus (di balik login)
│       │   └── statistik-publik/ # agregat halaman depan (tanpa login)
│       ├── hooks/            # hook generik lintas fitur (useDebounce, …)
│       ├── lib/              # klien & util lintas fitur (api-client, utils, query-client)
│       ├── pages/            # komponen halaman (route target)
│       ├── routes/           # definisi route, guards, paths
│       ├── styles/           # CSS global + Tailwind
│       └── types/            # tipe lintas fitur (api.ts)
└── backend/                  # FastAPI (aktif, penduduk di SQLite)
```

## 4. Arsitektur Berbasis Fitur (feature-first)

Setiap domain berdiri sendiri di `src/features/<nama>/` dengan isi standar:

```
features/penduduk/
├── api/            # kontrak (`interface XApi`) + implementasi http
├── components/     # komponen khusus fitur ini
├── hooks/          # React Query hooks (use-penduduk.ts)
├── types.ts        # model domain
├── labels.ts       # peta enum -> teks tampilan
├── view-model.ts   # data mentah -> bentuk siap tampil
└── utils.ts        # helper murni khusus fitur
```

**Aturan arah impor (jangan dilanggar):**

- `features/*` **boleh** impor dari `components/ui`, `lib`, `hooks`, `types`, `config`.
- `features/A` **tidak boleh** impor internal `features/B`. Butuh berbagi? Naikkan ke `lib`/`components`/`types`.
- `components/ui` **tidak boleh** impor dari `features/*` (harus generik).
- `pages/*` merakit `features/*` + `components/*`; jangan taruh logika bisnis berat di sini.

## 5. Lapisan Data — Kontrak API

Backend aktif, jadi tiap fitur mendefinisikan **kontrak API** lalu
menyediakan satu implementasi yang memanggil `apiClient` (axios → FastAPI).
Tidak ada lagi cabang mock/http — mock sudah dicabut sepenuhnya (§11).

```ts
export interface PendudukApi { list(...): Promise<...>; getByNik(...): ...; }

export const pendudukApi: PendudukApi = {
  async list(params) {
    const { data } = await apiClient.get('/penduduk', { params });
    return data;
  },
  // ...
};
```

Komponen tidak pernah memanggil `apiClient` langsung — selalu lewat `pendudukApi`
& React Query hooks di `features/*/hooks/`.

## 6. Konvensi Kode

### Penamaan

- Komponen React & tipe: `PascalCase` (`PendudukDetail`, `AuthUser`).
- Variabel, fungsi, hook: `camelCase` (`hitungUmur`, `usePendudukList`).
- File komponen: `PascalCase.tsx`. File non-komponen: `kebab-case.ts` (`use-penduduk.ts`, `api-client.ts`).
- Konstanta modul: `UPPER_SNAKE_CASE` (`PAGE_SIZE`).
- **Istilah domain memakai Bahasa Indonesia** (`penduduk`, `pengurus`, `jenisKelamin`) agar selaras dengan data asli.
  Sebaliknya, **primitif UI tetap Inggris** (`Button`, `Sidebar`, `AccountButton`) — Bahasa Indonesia dipakai
  karena datanya berbahasa Indonesia, bukan sebagai gaya bahasa menyeluruh.
- File view-model **selalu bernama `view-model.ts`** (tanpa prefiks) dan tinggal di folder yang memilikinya:
  di dalam fitur bila logikanya milik satu fitur, atau di folder halaman bila justru di situ dua fitur bertemu
  (lihat `pages/admin/infografis/view-model.ts` — memindahkannya ke dalam fitur akan melanggar aturan impor §4).

### TypeScript

- `strict` menyala. **Dilarang `any`** — pakai `unknown` + penyempitan tipe bila perlu.
- Impor tipe pakai `import type { … }`.
- Enum domain sebagai **union string literal** (`'ISLAM' | 'KRISTEN'`), bukan `enum`. Pasangkan dengan peta label di `labels.ts`.
- Path alias: selalu `@/…` (mis. `@/features/auth/hooks/use-auth`), hindari `../../../`.

### Komponen

- Fungsi komponen + hooks. Tanpa class component.
- Satu komponen utama per file. Komponen pembantu kecil boleh di file yang sama bila privat.
- Halaman (`pages/*`) memakai `export default`; selain itu **named export**.
- `className` dinamis WAJIB lewat helper `cn()` (`@/lib/utils`), jangan gabung string manual.

### Styling

- Tailwind utility-first. Hindari file CSS terpisah kecuali untuk global (`styles/index.css`).
- Kelas panjang: urutkan otomatis oleh `prettier-plugin-tailwindcss` (jalankan `npm run format`).

### Data fetching (React Query)

- Semua akses server lewat hook di `features/*/hooks/`, **bukan** `useEffect + fetch`.
- Definisikan **query keys terpusat** per fitur (`pendudukKeys`) untuk caching & invalidasi konsisten.
- Jangan panggil `api-client`/`*Api` langsung dari komponen; bungkus dalam hook.

### Form

- React Hook Form + skema Zod di `features/*/schemas.ts`. Validasi lewat `zodResolver`.
- **Jangan `<input type="date">` untuk tanggal yang diketik orang.** Urutan
  kotaknya (dd/mm vs mm/dd) ikut bahasa browser dan **tidak bisa dipaksa** —
  tidak lewat atribut, CSS, maupun `lang`. Akibatnya isian diam-diam terbaca
  jadi tanggal lain. Pakai tiga kolom Tgl / Bulan (nama, bukan angka) / Tahun,
  disatukan jadi ISO. Aturannya masih berlaku walaupun form terakhir yang
  memakainya (aktivasi warga) sudah dicabut — tanggal lahir masuk lewat Excel
  sekarang.

### Error

- Error API dinormalisasi menjadi `ApiError` (`@/types/api`) oleh interceptor axios.
- Di UI, tampilkan pesan ramah (komponen `Alert`), jangan `alert()` / `console.log` untuk user.

## 7. Autentikasi & Otorisasi

**Model auth (lihat
`docs/superpowers/specs/2026-08-26-hapus-nik-kk-auth-pengurus-design.md`
untuk alasan lengkapnya):**

- **Warga tidak punya akun.** Tidak ada login warga, PIN, aktivasi, maupun
  halaman kontak. Dicabut 26 Agustus 2026 bersama NIK & No. KK — jangan
  dihidupkan lagi tanpa keputusan eksplisit.
- **Perangkat desa** masuk di `/login` dengan username + password. Empat peran:
  `ADMIN` (kelola akun, buta data warga) dan `DUKUH`/`RW`/`RT` (baca data
  warga, tidak bisa menyentuh akun).
- **Akun pengurus tinggal di SQLite** (tabel `pengurus`), ditambah &
  dinonaktifkan ADMIN saat runtime lewat `/admin/pengurus`. Akun ADMIN pertama
  dibuat `pengurus.bootstrap()` dari `ADMIN_USERNAME`/`ADMIN_PASSWORD`; **DB
  kosong tanpa dua env itu = backend menolak jalan**, bukan memakai default.
- **Akun pengurus tidak punya masa berlaku.** Satu-satunya mekanisme siklus
  hidupnya kolom boolean `aktif`; tidak ada tanggal dan tidak ada perbandingan
  waktu di mana pun. Konsekuensinya diterima sadar: akun pengurus lama tetap
  bisa masuk sampai ada yang menonaktifkannya manual. Penggantinya prosedur
  di `docs/PROSEDUR-PENGURUS.md`, bukan kode.
- **Tiga dependency, jangan tertukar:** `current_user` (siapa pun yang masuk —
  dipakai hanya oleh ganti password), `current_pengurus` (`DUKUH`/`RW`/`RT`,
  menolak ADMIN), `current_admin` (ADMIN saja).
- **Akun berbentuk kursi.** Daftar kursi diturunkan dari alamat warga
  (`pengurus.daftar_kursi`), bukan disimpan di tabel kedua. Satu kursi hanya
  boleh dihuni satu akun **aktif** — akun nonaktif penghuni lama tetap
  tersimpan di kursi yang sama, jadi keunikannya diperiksa di kode, bukan lewat
  `UNIQUE` di SQL.
- **Password awal dari Admin sekali pakai.** Kolom `harus_ganti_password`:
  selama menyala, login berhasil tapi `current_pengurus`/`current_admin`
  menolak 403. Reset oleh Admin menyalakannya lagi.
- **`jabatan` tidak disimpan** — diturunkan dari `role` + `rw` + `rt`
  (`pengurus.jabatan_dari`). Menyimpannya berarti dua sumber kebenaran yang
  bisa berbeda diam-diam. `kursi_dari()` memakai RW **dan** RT sekaligus: nomor
  RT cuma unik di dalam RW-nya.
- **Status `aktif` diperiksa tiap request** (`current_user` query DB, bukan
  baca klaim token), jadi menonaktifkan akun langsung berlaku tanpa menunggu
  TTL JWT habis.
- **Tidak ada OTP, SMS, WhatsApp, atau email di jalur autentikasi.** Syarat nol
  biaya bersifat mutlak. Password baru disampaikan tatap muka; itu satu-satunya
  jalur, dan disengaja.
- **Tidak ada rate limit** — `app/core/ratelimit.py` ikut dicabut bersama jalur
  warga. Jumlah akun sedikit dan semuanya dibuat manual oleh ADMIN. Tambahkan
  kalau aplikasi nanti terbuka ke internet luas.

**Mekanik:**

- Sesi (token + user) disimpan Zustand (`auth-store.ts`) & di-persist ke `localStorage` (`token-storage.ts`).
- Proteksi route lewat guard di `routes/guards.tsx`:
  - `RequireAuth` — wajib login.
  - `RequireRole roles={[...]}` — menerima **daftar** peran, bukan satu.
  - `RequireGantiPassword` — alihkan ke `/ganti-password` selagi penandanya
    menyala.
  - `RedirectIfAuthenticated` — halaman login menolak user yang sudah masuk.
- Menu sidebar mengikuti role via `navItemsForRole()` — **selalu perbarui ini saat menambah halaman**.
- `homePathForRole()`: ADMIN mendarat di `/admin/pengurus` (satu-satunya
  halaman yang terbuka untuknya), sisanya di `/admin/penduduk`.

> Keamanan sebenarnya WAJIB ditegakkan di backend (FastAPI). Guard frontend hanya UX.

## 8. Environment Variables

- Hanya variabel berprefix `VITE_` yang terbaca di client.
- **Jangan** baca `import.meta.env.*` langsung; akses via `@/config/env`.
- Salin `.env.example` → `.env`. Kunci utama: `VITE_API_BASE_URL` (default
  `http://localhost:8000` — arahkan ke backend yang jalan, lihat §11).

## 9. Perintah

Dari `frontend/`:

```bash
npm install        # sekali di awal
npm run dev        # dev server (http://localhost:5173)
npm run build      # typecheck + build produksi
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
npm run format     # Prettier — mengubah file, jadi typecheck/lint lagi sesudahnya
```

Dari `backend/` — **selalu `.venv/bin/python`**, `python3` sistem tidak punya
dependensinya:

```bash
.venv/bin/uvicorn app.main:app --reload --port 8000
.venv/bin/python -m app.data.db         # self-check SQLite (skema + impor menimpa)
.venv/bin/python -m app.data.agregat    # self-check kelompok umur & distribusi
DATABASE_PATH=/tmp/uji.db .venv/bin/python -m app.data.pengurus   # self-check kelola akun
.venv/bin/python -m app.data.impor_excel ../docs/data-penduduk.xlsx   # isi data (MENIMPA)
```

**Sebelum menganggap tugas selesai:** `npm run typecheck` **dan** `npm run lint`
harus bersih (0 error), `npm run build` sukses, dan ketiga self-check backend
di atas lolos bila menyentuh lapisan data.

### Menguji — perkakasnya terbatas, ini yang jalan

- **`fastapi.testclient` tidak bisa dipakai:** `httpx` tidak ada di
  `requirements.txt`. Uji ujung-ke-ujung dengan menjalankan uvicorn di port
  lain + `DATABASE_PATH` sementara, lalu panggil pakai `urllib` stdlib.
- **Frontend tidak punya test runner.** Untuk memeriksa satu modul murni:
  `node --experimental-strip-types <file>.ts` dari `frontend/` — Node 22 bisa
  mengimpor `.ts` langsung, tanpa memasang apa pun.
- **Akun pengurus untuk uji dibuat sendiri**, tidak ada yang di-seed:
  `DATABASE_PATH=/tmp/uji.db ADMIN_USERNAME=dukuh ADMIN_PASSWORD=rahasia123`
  saat menjalankan uvicorn — `bootstrap()` membuat akun ADMIN pertama, dan
  backend menolak jalan kalau dua env itu kosong pada DB kosong.
- **`id` penduduk dibaca dari DB**, bukan dari log startup:
  `SELECT id, nama FROM penduduk ORDER BY rowid LIMIT 2`. `print()` di startup
  ter-buffer begitu stdout dipipe ke file, jadi sering belum muncul saat dibaca.
- **Jangan `pkill -f "uvicorn …"`** untuk mematikan server latar: polanya
  cocok dengan baris perintah shell yang sedang menjalankannya, jadi shell-nya
  ikut mati dan output perintah berikutnya hilang. Simpan PID-nya
  (`echo $! > /tmp/pid`) lalu `kill "$(cat /tmp/pid)"`.

## 10. Menambah Fitur / Halaman Baru (checklist)

1. Buat folder `features/<nama>/` (types, api, hooks, components).
2. Definisikan kontrak API (`interface XApi`) + implementasi yang memanggil `apiClient`.
3. Tambah query keys + hook React Query di `features/<nama>/hooks/`.
4. Buat halaman di `pages/…`, rakit dari komponen fitur.
5. Daftarkan path di `routes/paths.ts`, route di `routes/AppRoutes.tsx` (bungkus guard yang sesuai), dan lazy-load halamannya.
6. Tambah item menu di `components/layout/nav-config.ts` bila perlu.
7. Jalankan `npm run typecheck && npm run lint && npm run build`.

## 11. Backend (FastAPI) — aktif, penduduk di SQLite

Struktur saat ini (lihat `backend/README.md` untuk cara menjalankan):

```
backend/
├── app/
│   ├── main.py            # entrypoint FastAPI, CORS, exception handler, bootstrap
│   ├── core/              # security (JWT/bcrypt) + audit log (masih in-memory)
│   ├── api/routers/       # auth, penduduk, pengurus, pergantian, publik, infografis
│   ├── schemas/           # Pydantic — cerminan tipe frontend, harus sinkron manual
│   └── data/              # db.py (SQLite) + store.py (cache penduduk, dibaca router)
│                          # + pengurus.py (akun & kursi) + pergantian.py (usulan)
│                          # + agregat.py
│                          # + impor_excel.py (isi tabel dari Excel)
├── tools/                 # pembangkit template & data contoh Excel (bukan bagian app)
├── data/siduk.db          # di-gitignore — jangan pernah di-commit
└── requirements.txt
```

**Database: SQLite — keputusan final, bukan salah satu opsi.** Postgres/DBeaver
sudah tidak dipertimbangkan lagi: satu file `.db` yang gampang di-backup, nol
server buat dipasang dan dirawat setelah KKN. Jangan mengusulkan Postgres balik
tanpa keputusan eksplisit.

**File `.db` TIDAK ikut repo** dan itu tidak bisa ditawar: begitu isinya data
warga sungguhan, satu commit menaruh data kependudukan sedesa di git history
permanen, dan git history tidak bisa dibersihkan setengah-setengah. Sudah
dikunci di `backend/.gitignore` (`data/`, `*.db`). Backup-nya salin file, bukan
commit.

**Kolom baru dipasang lewat `db._TAMBALAN`**, bukan dengan menghapus file
`.db`: `CREATE TABLE IF NOT EXISTS` tidak menyentuh tabel yang sudah ada, dan
menghapus filenya berarti membuang seluruh akun di dalamnya. Ditandai
`ponytail:` — daftar tempel seadanya, cukup untuk kolom nullable, dan bukan
pengganti perkakas migrasi kalau nanti ada perubahan yang lebih berat.

**Akses SQL cuma di `app/data/db.py`** — `sqlite3` stdlib, empat tabel:
`penduduk` (dengan `Alamat` diratakan jadi kolom `alamat_*`), `pengurus`, serta
`pengajuan` + `persetujuan` (riwayat perpindahan jabatan, tidak pernah
dihapus).
Tabel `pengurus` dibaca lewat koneksi sekali pakai per operasi (`db.koneksi`,
dibungkus `app/data/pengurus.py`), **bukan** lewat cache `store.py` — tabelnya
ditulis saat runtime, jadi cache impor-sekali itu akan basi. Tanpa ORM: query
yang ada muat di satu layar, dan SQLAlchemy cuma menambah dependensi yang harus
dirawat orang lain setelah KKN. **Tidak ada `models/` atau `services/`** —
skema Pydantic di `app/schemas/` sudah merangkap model.

**Batas wilayah ditegakkan di satu tempat:** `store.penduduk_untuk(user)`,
dipanggil SETIAP endpoint baca. Router tidak pernah menyaring sendiri — satu
endpoint yang lupa jadi lubang yang tidak kelihatan. Aturannya dipinjam dari
`pengurus.cocok_wilayah`, predikat yang sama yang menentukan siapa boleh
menduduki sebuah kursi. `GET /penduduk/{id}` menjawab **404, bukan 403**, untuk
warga di luar wilayah: 403 memberi tahu bahwa orangnya ada.

`app/data/store.py` **tidak lagi menyimpan cache**. Konstanta `DAFTAR_PENDUDUK`
dicabut di Tahap 3a dan diganti `semua_penduduk()` + `penduduk_untuk(user)`,
yang query database tiap dipanggil. Ditandai `ponytail:` — pindahkan
penyaringannya ke `WHERE` di SQL kalau datanya nanti puluhan ribu baris.

**Data penduduk read-only dari sisi aplikasi.** Satu-satunya jalur masuk data
adalah `app/data/impor_excel.py`, dan **tiap impor menimpa seluruh tabel**
(`db.kosongkan`).

**Kolom "Jabatan" di Excel (`WARGA`/`DUKUH`/`RW`/`RT`) dibaca HANYA untuk kursi
yang masih kosong** (`pengurus.daftar_kursi` mengisi `Kursi.calon`). Begitu
sebuah kursi ada penghuninya, kolom itu diabaikan — kalau tidak, satu impor
Excel yang belum diperbarui bisa membatalkan pergantian yang sudah disetujui
Dukuh dan para Ketua RW. Kolom ini **bukan** penentu kewenangan; yang
menentukan tetap akun di tabel `pengurus`. Dua orang ditandai memegang kursi
yang sama menghentikan impor.

**`id` penduduk = kolom "Kode Warga" di Excel**, bukan UUID. Kunci yang dijaga
manusia adalah satu-satunya yang bertahan melewati impor yang menimpa, dan
Tahap 2 mengharuskan jabatan pengurus menunjuk warga tertentu. Kode ganda atau
kosong **menghentikan impor sebelum satu baris pun ditulis** — dua warga
bertukar kode berarti dua orang bertukar jabatan tanpa ada yang menyadarinya.

Kontrak endpoint yang **sudah diimplementasikan** (bentuknya sinkron dengan
`*Api` frontend):

| Method | Path                             | Untuk                                                  |
| ------ | -------------------------------- | ------------------------------------------------------ |
| POST   | `/auth/login`                    | pengurus: username + password → `{ token, user }`      |
| POST   | `/auth/logout`                   | —                                                      |
| POST   | `/auth/ganti-password`           | ganti password sendiri; satu-satunya pintu yang terbuka selagi `harusGantiPassword` menyala |
| GET    | `/penduduk`                      | daftar: `page`, `pageSize`, `search` (nama) + 10 filter |
| GET    | `/penduduk/filter-opsi`          | pilihan RT / RW / pekerjaan dari isi data              |
| GET    | `/penduduk/{id}`                 | detail satu warga                                       |
| GET    | `/infografis`                    | agregat lengkap — semua pengurus                        |
| GET    | `/publik/statistik`              | cacah per RW — **tanpa auth**                           |
| GET    | `/pengurus`                      | daftar **kursi** (terisi & kosong) — ADMIN              |
| GET    | `/pengurus/warga`                | cari warga buat dropdown (nama + RT/RW saja) — ADMIN    |
| POST   | `/pengurus`                      | isi satu kursi **kosong** — ADMIN                       |
| POST   | `/pengurus/{id}/reset-password`  | ganti password akun — ADMIN                             |
| GET    | `/pergantian`                    | riwayat pengajuan — ADMIN                               |
| POST   | `/pergantian`                    | ajukan pergantian kursi **terisi** — ADMIN              |
| GET    | `/pergantian/menunggu`           | pengajuan yang menunggu jawaban saya — PENGURUS         |
| POST   | `/pergantian/{id}/jawab`         | satu suara, tidak bisa diubah — PENGURUS                |

Filter `GET /penduduk` (semua opsional, digabung AND, disaring di memori oleh
`penduduk.saring`): `jenisKelamin`, `agama`, `golonganDarah`, `pendidikan`,
`statusPerkawinan`, `statusHubunganKeluarga`, `pekerjaan`, `rt`, `rw`,
`kelompokUmur`.

**Satu orang satu jabatan**, diperiksa lewat kolom `pengurus.warga_id` (Kode
Warga penghuni kursi) — bukan lewat nama, karena dua orang yang benar-benar
senama akan saling menghalangi. `NULL` untuk akun ADMIN, yang memang bukan
warga.

**Kandidat wajib warga wilayah kursinya** — Ketua RT dari RT itu, Ketua RW dari
RW itu, Dukuh dari mana pun (`pengurus.cocok_wilayah`). Ditegakkan di dua jalur
sekaligus: mengisi kursi kosong dan mengajukan pergantian. `POST /pengurus`
menerima `wargaId`, **bukan** `nama` — nama dari klien tidak bisa diperiksa,
Kode Warga bisa.

**Admin memilih warga lewat `GET /pengurus/warga`, bukan mengetik namanya.** Ia
buta terhadap data kependudukan, jadi tidak punya cara tahu nama siapa yang
benar. Endpoint itu satu-satunya celahnya — nama + RT/RW saja, minimal 2 huruf,
maksimal 20 hasil, dan bisa dipersempit ke satu kursi lewat `?kursi=` — dipakai
dua tempat: mengisi kursi kosong dan memilih
kandidat pergantian. Klien bersamanya di `lib/warga-api.ts` +
`hooks/use-cari-warga.ts` + `components/ui/PilihWarga.tsx`, bukan di dalam
salah satu fitur (§4).

**Rute statis ditulis sebelum rute ber-parameter** — `/penduduk/filter-opsi`
harus di atas `/penduduk/{id}`, kalau tidak ia terbaca sebagai sebuah id.

**Ditegakkan backend** (guard frontend hanya UX):

- ✅ `/publik/statistik` hanya mengembalikan cacah. Tidak ada nama maupun
  alamat — endpoint ini terbuka untuk siapa saja, jadi apa pun yang
  ditambahkan ke sana otomatis menjadi konsumsi publik.
- ✅ Seluruh endpoint penduduk & infografis butuh sesi pengurus.
- ✅ Password disimpan sebagai hash (`bcrypt`, `app/core/security.py`), tidak
  pernah polos.
- ✅ Login menolak akun `aktif = 0` dengan pesan yang dibedakan dari salah
  password, dan `current_user` memeriksa `aktif` tiap request — token lama akun
  nonaktif ikut tertolak.
- ✅ `/pengurus/*` hanya ADMIN (`dependencies=[Depends(current_admin)]` di
  level router), dicatat di log audit.
- ✅ ADMIN ditolak di seluruh endpoint data warga (`current_pengurus`), bukan
  sekadar disembunyikan menunya.
- ✅ Akun yang belum mengganti password awal ditolak 403 di mana pun kecuali
  `/auth/ganti-password`; password baru wajib berbeda dari yang lama.
- ✅ **Tidak ada cara mengosongkan kursi lewat API.** `PATCH /pengurus`
  dicabut: kalau Admin bisa mengosongkan kursi sendiri, ia bisa mengisinya
  langsung dan seluruh mekanisme persetujuan bisa dilewati dalam dua klik.
- ✅ Admin ditolak `current_pengurus` di `/pergantian/menunggu` dan
  `/pergantian/{id}/jawab` — ia mengajukan dan melihat, tidak pernah
  menyetujui.
- ✅ Penyetuju hanya menerima pengajuan yang ditujukan kepadanya; yang lain
  memang tidak ikut dikembalikan, bukan disembunyikan di layar.
- ✅ Backend menolak jalan kalau `JWT_SECRET` masih bernilai bawaan
  (`app/main.py:_wajib_diisi`), atau kalau tabel `pengurus` kosong tapi
  `ADMIN_USERNAME`/`ADMIN_PASSWORD` belum diisi. Defaultnya tetap ada supaya
  perkakas baris perintah jalan tanpa `.env`; yang menolak adalah startup.
- ✅ `deletedAt` (salah input) disaring di `app/data/store.py`, satu tempat.
  `PINDAH`/`MENINGGAL` sengaja **tidak** disaring: datanya sah, dan keputusan
  sementaranya tetap dihitung.

**Utang yang masih terbuka** — tercatat di spec 2026-08-26, jangan dianggap
kondisi final:

- ⬜ **Endpoint mutasi data warga** (Tahap 3b): ubah data, tandai
  PINDAH/MENINGGAL, tambah warga baru — semuanya dibatasi wilayah lewat
  `cocok_wilayah` yang sudah ada. Ikut wajib di tahap itu: **impor Excel
  dikunci** (menolak jalan kalau tabel sudah berisi, kecuali `--timpa-semua`)
  dan **audit log jadi tabel sungguhan**.
- ⬜ **Sesi server-side menggantikan JWT.** Sekarang pencabutan sudah berlaku
  seketika lewat pemeriksaan `aktif` tiap request, jadi prioritasnya turun —
  tapi token yang sah sampai TTL habis tetap bukan model yang benar.
- ⬜ **Audit log persisten** (`tabel audit_log` + `GET /audit`).
  `app/core/audit.py` masih `print()` ke console dan hilang tiap restart. Yang
  paling perlu ditelusuri — perpindahan jabatan — sudah tercatat permanen di
  tabel `pengajuan`/`persetujuan`, jadi ini menunggu sampai ada mutasi data
  warga.
- ⬜ **Rate limit login pengurus.** Dicabut bersama jalur warga; belum ada
  penggantinya. Satu-satunya lubang keamanan yang tersisa dari daftar awal.
- ⬜ **Status kependudukan (`PINDAH`/`MENINGGAL`)** ikut disaring dari daftar
  atau statistik. Sekarang tetap dihitung, sesuai keputusan sementara di
  `docs/PROSEDUR-PENGURUS.md`.
