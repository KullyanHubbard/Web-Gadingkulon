# CLAUDE.md — Panduan Kerja & Konvensi Kode (SIDUK)

Dokumen ini adalah **sumber kebenaran** untuk gaya kode, arsitektur, dan alur
kerja proyek **SIDUK — Portal Data Kependudukan Desa**. Baca ini sebelum menulis
kode agar hasil tetap rapi dan konsisten.

---

## Kondisi Saat Ini

- **Backend:** aktif — FastAPI, 12 endpoint (auth, penduduk, kartu-keluarga,
  infografis, statistik publik). Daftar lengkap di §11.
- **Frontend:** aktif, http-only — semua fitur memanggil backend langsung
  lewat `apiClient`. Backend harus jalan (`localhost:8000`) agar frontend
  berfungsi.
- **Database:** **SQLite — terpasang** untuk data penduduk
  (`backend/app/data/db.py`, file di `settings.DATABASE_PATH`). File kosong
  diisi sekali dari `dummy.py`, yang sekarang cuma seeder. Data penduduk
  selamat melewati restart. **Yang masih di memori:** akun warga & pengurus,
  tiket aktivasi, rate limit, audit log — semua itu belum pindah.

---

## 1. Tentang Proyek

Web untuk melihat data kependudukan desa berbasis **NIK / No. KK**.

| Peran        | Hak akses                                                                 |
| ------------ | ------------------------------------------------------------------------- |
| **WARGA**    | Hanya melihat data NIK miliknya sendiri + anggota Kartu Keluarganya        |
| **PENGURUS** | Dukuh/RW/RT. Baca seluruh data penduduk & infografis; **mutasi data warga dibatasi wilayah kerjanya** |
| **ADMIN**    | Semua kewenangan PENGURUS + kelola akun pengurus. Peran pemeliharaan, bukan nama orang |

Tiga peran ini menggantikan model `ADMIN` datar. Desain lengkap + matriks
kewenangan per endpoint: `docs/superpowers/specs/2026-08-12-auth-warga-pin-design.md`.
**Kode belum menyusul** — backend masih `USER`/`ADMIN` (lihat §7).

**Status:** Frontend + backend aktif. Backend (`backend/`) FastAPI dengan data
penduduk di SQLite, di-seed sekali dari generator dummy (200 KK diacak, lihat
`backend/app/data/dummy.py`).

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
│       │   ├── auth/
│       │   ├── penduduk/
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

Backend aktif (data dummy), jadi tiap fitur mendefinisikan **kontrak API** lalu
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
- **Istilah domain memakai Bahasa Indonesia** (`penduduk`, `noKK`, `jenisKelamin`) agar selaras dengan data asli.
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

### Error

- Error API dinormalisasi menjadi `ApiError` (`@/types/api`) oleh interceptor axios.
- Di UI, tampilkan pesan ramah (komponen `Alert`), jangan `alert()` / `console.log` untuk user.

## 7. Autentikasi & Otorisasi

**Model auth (lihat `docs/superpowers/specs/2026-08-12-auth-warga-pin-design.md`
untuk alasan lengkapnya):**

- **Warga** masuk dengan **NIK + PIN 6 digit**. Tidak ada registrasi — seluruh
  NIK sudah ada di data kependudukan. Pertama kali, warga mengaktifkan akunnya
  di `/aktivasi` dengan **NIK + tanggal lahir**, lalu menetapkan PIN sendiri.
- **Pengurus** (Dukuh/RW/RT) masuk di `/login/petugas` dengan username +
  password. Desainnya memakai tiga peran (`WARGA`/`PENGURUS`/`ADMIN`);
  **kode saat ini masih dua** (`USER`/`ADMIN` datar) — selisih ini disengaja
  dan tercatat, jangan dianggap sudah beres.
- **Akun pengurus tidak punya masa berlaku.** Satu-satunya mekanisme siklus
  hidupnya kolom boolean `aktif`; tidak ada tanggal dan tidak ada perbandingan
  waktu di mana pun. Konsekuensinya diterima sadar: akun pengurus lama tetap
  bisa masuk sampai ada yang menonaktifkannya manual. Penggantinya prosedur
  di `docs/PROSEDUR-PENGURUS.md`, bukan kode.
- **Mutasi data warga dibatasi wilayah** (Dukuh = padukuhan, Ketua RW = RW-nya,
  Ketua RT = RT-nya) lewat satu helper `boleh_akses(pengurus, warga)` yang
  dipanggil setiap endpoint mutasi — jangan sebar logikanya per endpoint.
  **Baca tidak dibatasi wilayah**: daftar penduduk & infografis tetap
  se-padukuhan untuk semua pengurus.
- **Tidak ada OTP, SMS, WhatsApp, atau email di jalur autentikasi.** Syarat nol
  biaya bersifat mutlak; semua jalur pengiriman token terbukti berbiaya atau
  butuh perawatan yang tidak akan ada setelah KKN. Jangan menambahkannya
  kembali tanpa keputusan eksplisit.
- **Nomor HP & email bersifat opsional dan bukan kredensial** — murni data yang
  dikumpulkan lewat `/kontak` setelah warga masuk.
- **Lupa PIN dipulihkan luring:** warga menemui pengurus, pengurus menekan
  Reset PIN, warga mengaktifkan akunnya ulang. Prosedurnya ada di
  `docs/PROSEDUR-PENGURUS.md`.
- NIK yang akunnya **sudah aktif** tidak boleh diklaim ulang lewat tanggal
  lahir — kalau tidak, akun warga bisa diambil alih.

**Mekanik:**

- Sesi (token + user) disimpan Zustand (`auth-store.ts`) & di-persist ke `localStorage` (`token-storage.ts`).
- Proteksi route lewat guard di `routes/guards.tsx`:
  - `RequireAuth` — wajib login.
  - `RequireRole` — batasi per role (bungkus route admin).
  - `RedirectIfAuthenticated` — halaman login menolak user yang sudah masuk.
- Menu sidebar mengikuti role via `navItemsForRole()` — **selalu perbarui ini saat menambah halaman**.

> Keamanan sebenarnya WAJIB ditegakkan di backend (FastAPI). Guard frontend hanya UX.

## 8. Environment Variables

- Hanya variabel berprefix `VITE_` yang terbaca di client.
- **Jangan** baca `import.meta.env.*` langsung; akses via `@/config/env`.
- Salin `.env.example` → `.env`. Kunci utama: `VITE_API_BASE_URL` (default
  `http://localhost:8000` — arahkan ke backend yang jalan, lihat §11).

## 9. Perintah

Jalankan dari `frontend/`:

```bash
npm install        # sekali di awal
npm run dev        # dev server (http://localhost:5173)
npm run build      # typecheck + build produksi
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
npm run format     # Prettier
```

**Sebelum menganggap tugas selesai:** `npm run typecheck` **dan** `npm run lint`
harus bersih (0 error). `npm run build` harus sukses.

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
│   ├── main.py            # entrypoint FastAPI, CORS, exception handler
│   ├── core/               # security (JWT/bcrypt), rate limit, audit log — semua in-memory
│   ├── api/routers/       # auth, penduduk, publik, infografis
│   ├── schemas/           # Pydantic — cerminan tipe frontend, harus sinkron manual
│   └── data/               # db.py (SQLite) + store.py (dibaca router)
│                           # + dummy.py (seeder 200 KK) + akun.py (akun demo)
├── data/siduk.db          # di-gitignore — jangan pernah di-commit
└── requirements.txt
```

**Database: SQLite — keputusan final, bukan salah satu opsi.** Postgres/DBeaver
sudah tidak dipertimbangkan lagi: satu file `.db` yang gampang di-backup, nol
server buat dipasang dan dirawat setelah KKN. Jangan mengusulkan Postgres balik
tanpa keputusan eksplisit.

**File `.db` TIDAK ikut repo** dan itu tidak bisa ditawar: begitu isinya NIK
asli, satu commit menaruh data kependudukan sedesa di git history permanen, dan
git history tidak bisa dibersihkan setengah-setengah. Sudah dikunci di
`backend/.gitignore` (`data/`, `*.db`). Backup-nya salin file, bukan commit.

**Akses SQL cuma di `app/data/db.py`** — `sqlite3` stdlib, satu tabel
`penduduk` dengan `Alamat` diratakan jadi kolom `alamat_*`. Tanpa ORM: query
yang ada muat di satu layar, dan SQLAlchemy cuma menambah dependensi yang harus
dirawat orang lain setelah KKN. **Tidak ada `models/` atau `services/`** —
skema Pydantic di `app/schemas/` sudah merangkap model; jangan scaffold lapis
yang belum ada isinya.

`app/data/store.py` membaca seluruh tabel ke memori sekali saat impor, jadi
router tidak berubah sama sekali. Ini punya ceiling dan sudah ditandai
`ponytail:` di file itu — begitu ada endpoint tulis, cache itu basi dan router
harus query `db.py` langsung.

Kontrak endpoint yang **sudah diimplementasikan** (bentuknya sinkron dengan
`*Api` frontend):

| Method | Path                              | Untuk                                   |
| ------ | --------------------------------- | --------------------------------------- |
| POST   | `/auth/login`                     | pengurus: username + password → `{ token, user }` |
| POST   | `/auth/warga/login`               | warga: NIK + PIN → `{ token, user }`    |
| POST   | `/auth/warga/aktivasi/cek`        | NIK + tanggal lahir → `{ tiket, nama }` |
| POST   | `/auth/warga/aktivasi/set-pin`    | tiket + PIN → `{ token, user }`         |
| PATCH  | `/auth/me/kontak`                 | simpan `noHp` / `email` opsional        |
| POST   | `/auth/warga/{nik}/reset-pin`     | **kode: hanya ADMIN** — desain sudah menurunkannya ke PENGURUS |
| POST   | `/auth/logout`                    | —                                       |
| GET    | `/penduduk`                       | daftar (paginasi: `page`, `pageSize`, `search`) |
| GET    | `/penduduk/nik/{nik}`             | detail per NIK                          |
| GET    | `/kartu-keluarga/{noKK}`          | KK + anggota                            |
| GET    | `/infografis`                     | agregat statistik (ADMIN)               |
| GET    | `/publik/statistik`               | agregat halaman depan — **tanpa auth**, total se-desa (jiwa, KK, L/P) + rincian per RW (gender, umur, pendidikan, agama, status perkawinan) |

**Ditegakkan backend** (guard frontend hanya UX) — status implementasi saat ini:

- ✅ `/publik/statistik` hanya mengembalikan cacah. Tidak ada NIK, nama, atau
  alamat — endpoint ini terbuka untuk siapa saja, jadi apa pun yang
  ditambahkan ke sana otomatis menjadi konsumsi publik.
- ✅ USER hanya boleh mengakses NIK miliknya + anggota `noKK` yang sama —
  divalidasi dari klaim JWT (`app/api/routers/penduduk.py`), bukan parameter
  request.
- ✅ PIN & password disimpan sebagai hash (`bcrypt`, `app/core/security.py`),
  tidak pernah polos.
- ✅ `/auth/warga/aktivasi/cek` di-throttle per NIK+IP; login warga dikunci
  sementara setelah 5 PIN salah berturut-turut (`app/core/ratelimit.py`).
  ponytail: pembatas ini di memori satu proses — kalau backend jalan lebih
  dari satu instance, pindah ke penyimpanan bersama (mis. Redis).
- ✅ Tiket aktivasi sekali pakai, umur ±10 menit, terikat ke NIK.
- ✅ Aktivasi ditolak untuk NIK yang akunnya sudah aktif (cegah pengambilalihan).
- ✅ `reset-pin` hanya untuk `ADMIN`, dicatat di log audit (`app/core/audit.py`
  — baru ke console, belum ada endpoint buat membacanya).
- ⬜ Status kependudukan (pindah/meninggal) menonaktifkan akses otomatis —
  **fieldnya sekarang sudah ada** (`Penduduk.statusKependudukan`), jadi butir
  ini sudah bisa dikerjakan. Yang belum: `auth.py` masih meloloskan login warga
  ber-status `PINDAH`/`MENINGGAL`.
- ✅ `deletedAt` (salah input) disaring di `app/data/store.py`, satu tempat —
  baris ber-nilai tidak pernah sampai ke router. `PINDAH`/`MENINGGAL` sengaja
  **tidak** disaring: datanya sah, dan keputusan sementaranya tetap dihitung
  (spec auth, bagian "Hapus warga").

**Selisih desain vs kode yang disengaja** — semuanya sudah diputuskan di
`docs/superpowers/specs/2026-08-12-auth-warga-pin-design.md`, tinggal
dikerjakan. Jangan diperlakukan sebagai kondisi final:

- ⬜ **Tiga peran** (`WARGA`/`PENGURUS`/`ADMIN`). Kode masih `USER`/`ADMIN`
  datar, dan `current_admin` di `app/api/routers/auth.py` menjaga dua hal
  berbeda sekaligus (baca seluruh penduduk vs kelola akun) yang di desain
  sudah dipisah tegas.
- ⬜ **Kolom `aktif`** pada akun pengurus + penolakan login untuk akun
  nonaktif. Belum ada; `PETUGAS_ACCOUNTS` sekarang tidak punya kolom status.
- ⬜ **Kolom `rw`/`rt` nullable** + helper `boleh_akses(pengurus, warga)`.
- ⬜ **Endpoint mutasi warga** (`POST`/`PATCH`/`DELETE /penduduk`). Backend
  masih nol endpoint tulis di luar auth. Rencananya menempel di
  `app/api/routers/penduduk.py` sebagai `APIRouter` kedua ber-`dependencies`,
  bukan file router baru — alasannya di spec.
- ⬜ **Router `/pengurus`** (kelola akun, ADMIN saja) + bootstrap ADMIN pertama.
- ⬜ **Sesi server-side menggantikan JWT.** Naik prioritas: sejak masa berlaku
  akun dihapus, menonaktifkan akun adalah satu-satunya cara memutus akses,
  dan itu harus berlaku seketika — bukan menunggu TTL 12 jam
  (`settings.JWT_TTL_JAM`) habis sendiri.
- ⬜ **Audit log persisten** (`tabel audit_log` + `GET /audit`) dengan nilai
  sebelum/sesudah. `app/core/audit.py` masih `print()` ke console dan hilang
  tiap restart — tidak memadai begitu ada mutasi data warga.
