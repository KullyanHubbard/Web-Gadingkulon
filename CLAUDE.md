# CLAUDE.md — Panduan Kerja & Konvensi Kode (NIA Web)

Dokumen ini adalah **sumber kebenaran** untuk gaya kode, arsitektur, dan alur
kerja proyek **NIA — Portal Data Kependudukan Desa**. Baca ini sebelum menulis
kode agar hasil tetap rapi dan konsisten.

---

## Kondisi Saat Ini

- **Backend:** aktif — FastAPI, 12 endpoint (auth, penduduk, kartu-keluarga,
  infografis, statistik publik). Daftar lengkap di §11.
- **Frontend:** aktif, http-only — semua fitur memanggil backend langsung
  lewat `apiClient`. Backend harus jalan (`localhost:8000`) agar frontend
  berfungsi.
- **Database:** belum ada. Data berasal dari generator in-memory
  (`backend/app/data/dummy.py`), hilang setiap restart backend.
- **Direncanakan:** migrasi ke database asli dengan pola seed/reset/import.

---

## 1. Tentang Proyek

Web untuk melihat data kependudukan desa berbasis **NIK / No. KK**.

| Peran     | Hak akses                                                                 |
| --------- | ------------------------------------------------------------------------- |
| **USER**  | Warga. Hanya melihat data NIK miliknya sendiri + anggota Kartu Keluarganya |
| **ADMIN** | Perangkat desa. Melihat data pribadi, **seluruh data penduduk**, & infografis |

**Status:** Frontend + backend aktif. Backend (`backend/`) FastAPI dengan data
dummy di memori (200 KK diacak, lihat `backend/app/data/dummy.py`) — belum
tersambung Postgres.

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
| Backend     | Python + FastAPI (data dummy in-memory)                              |
| Database    | PostgreSQL (dikelola via DBeaver) — direncanakan                    |

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
└── backend/                  # FastAPI (aktif, data dummy)
```

## 4. Arsitektur Berbasis Fitur (feature-first)

Setiap domain berdiri sendiri di `src/features/<nama>/` dengan isi standar:

```
features/penduduk/
├── api/            # implementasi pemanggilan data (kontrak + mock + http)
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
  Sebaliknya, **primitif UI tetap Inggris** (`Button`, `Sidebar`, `LoginButton`) — Bahasa Indonesia dipakai
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

### Warna — palet tertutup

`tailwind.config.js` **mengganti** `theme.colors` (bukan `extend`), jadi warna di
luar palet **tidak menghasilkan class sama sekali**. `bg-blue-600` dan
`text-emerald-500` mati diam-diam — kalau sebuah warna tidak muncul, penyebabnya
hampir pasti ini.

| Kelompok  | Token                        | Untuk                                          |
| --------- | ---------------------------- | ---------------------------------------------- |
| Brand     | `brand-50` … `brand-950`     | aksi utama, aksen, seri chart                  |
| Netral    | `slate-*`                    | teks, permukaan, border — **satu-satunya netral** |
| Semantik  | `red-*`                      | error, danger, aksi merusak                    |
|           | `green-*`                    | sukses, status aktif                           |
|           | `amber-*`                    | peringatan                                     |
|           | `violet-*`                   | aksen statistik netral (`StatCard`)            |

Aturan:

- **Dilarang hex di komponen**, termasuk untuk Recharts. Library yang butuh nilai
  warna (bukan class) mengambilnya dari `@/lib/colors`, yang isinya `var(--…)`
  hasil `theme()` di `styles/index.css`. Rantainya:
  `tailwind.config.js` → CSS var → `lib/colors.ts` → komponen. Satu sumber
  kebenaran; ubah hex di config, chart ikut berubah.
- `gray` / `zinc` / `neutral` / `stone` **tidak tersedia** — netralnya `slate`.
- Warna semantik dipilih berdasarkan **makna**, bukan selera visual. Pasangan
  bakunya `-50` untuk latar, `-200` untuk border, `-700`/`-800` untuk teks
  (lihat `components/ui/Badge.tsx` & `Alert.tsx`).
- Butuh warna baru? **Tambahkan di `tailwind.config.js` dulu**, dengan alasan
  yang jelas. Friksi ini disengaja — keputusan warna harus sadar, bukan ketikan
  spontan.
- `borderColor.DEFAULT` dipin ke `slate-200`, jadi `border` polos tetap benar.

Palet tertutup tidak bisa memblokir **arbitrary value** (`bg-[#ff0000]` tetap
di-generate Tailwind), jadi celah itu ditutup ESLint: rule `no-restricted-syntax`
di `eslint.config.js` menolak hex mentah **dan** `bg-[…]`/`text-[…]` dst.
Dua lapis ini yang bikin palet benar-benar terkunci — jangan lepas salah satunya.

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
- **Pengurus** (Dukuh/RW/RT, semuanya role `ADMIN`) masuk di `/login/petugas`
  dengan username + password.
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

## 11. Backend (FastAPI) — aktif, data dummy

Struktur saat ini (lihat `backend/README.md` untuk cara menjalankan):

```
backend/
├── app/
│   ├── main.py            # entrypoint FastAPI, CORS, exception handler
│   ├── core/               # security (JWT/bcrypt), rate limit, audit log — semua in-memory
│   ├── api/routers/       # auth, penduduk, publik, infografis
│   ├── schemas/           # Pydantic — cerminan tipe frontend, harus sinkron manual
│   └── data/               # generator dummy (200 KK) + akun demo
└── requirements.txt
```

**Belum ada `models/`, `services/`, `db/`** — data hidup di memori proses
(`app/data/dummy.py`), bukan Postgres. Tambahkan lapis itu (SQLAlchemy +
Alembic) baru saat database asli benar-benar dipasang; sampai saat itu jangan
scaffold folder kosong untuknya.

Kontrak endpoint yang **sudah diimplementasikan** (bentuknya sinkron dengan
`*Api` frontend):

| Method | Path                              | Untuk                                   |
| ------ | --------------------------------- | --------------------------------------- |
| POST   | `/auth/login`                     | pengurus: username + password → `{ token, user }` |
| POST   | `/auth/warga/login`               | warga: NIK + PIN → `{ token, user }`    |
| POST   | `/auth/warga/aktivasi/cek`        | NIK + tanggal lahir → `{ tiket, nama }` |
| POST   | `/auth/warga/aktivasi/set-pin`    | tiket + PIN → `{ token, user }`         |
| PATCH  | `/auth/me/kontak`                 | simpan `noHp` / `email` opsional        |
| POST   | `/auth/warga/{nik}/reset-pin`     | hanya ADMIN                             |
| POST   | `/auth/logout`                    | —                                       |
| GET    | `/penduduk`                       | daftar (paginasi: `page`, `pageSize`, `search`) |
| GET    | `/penduduk/nik/{nik}`             | detail per NIK                          |
| GET    | `/kartu-keluarga/{noKK}`          | KK + anggota                            |
| GET    | `/infografis`                     | agregat statistik (ADMIN)               |
| GET    | `/publik/statistik`               | agregat halaman depan — **tanpa auth**, hanya cacah per RW |

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
  belum relevan, `Penduduk` belum punya field status. Tambahkan saat field
  itu ada di data master.
