# NIA — Portal Data Kependudukan Desa

Aplikasi web untuk melihat data kependudukan desa berdasarkan **NIK / No. KK**.

- **Warga (USER):** melihat data NIK & Kartu Keluarga miliknya sendiri.
- **Perangkat Desa (ADMIN):** melihat data pribadi, seluruh data penduduk, dan infografis.

## Struktur

```
NIA-WEB/
├── CLAUDE.md      # panduan kerja & konvensi kode (baca dulu)
├── frontend/      # React + TypeScript + Vite  (AKTIF)
└── backend/       # Python + FastAPI            (menyusul, belum dibuat)
```

## Mulai Cepat

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Berjalan tanpa backend (mode data _mock_). Akun demo & detail ada di
[`frontend/README.md`](frontend/README.md).

## Tech Stack

| Lapisan  | Teknologi                                              |
| -------- | ------------------------------------------------------ |
| Frontend | React 18, TypeScript, Vite, Tailwind, React Query      |
| Backend  | Python, FastAPI _(direncanakan)_                       |
| Database | PostgreSQL, dikelola via DBeaver _(direncanakan)_      |

Konvensi & arsitektur: lihat [`CLAUDE.md`](CLAUDE.md).
