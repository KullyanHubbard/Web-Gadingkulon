# NIA Web — Frontend

Portal Data Kependudukan Desa. React + TypeScript + Vite.

## Menjalankan

```bash
npm install
cp .env.example .env   # opsional, default sudah mode mock
npm run dev            # http://localhost:5173
```

Aplikasi berjalan penuh **tanpa backend** (mode `mock`). Data dummy ada di
`src/mocks/data/`.

## Akun Demo (mode mock)

| Peran               | Username | Password   |
| ------------------- | -------- | ---------- |
| Admin (perangkat desa) | `admin`  | `admin123` |
| Warga               | `warga`  | `warga123` |

- **Warga** hanya melihat data NIK & Kartu Keluarganya sendiri.
- **Admin** melihat dashboard, seluruh data penduduk (cari + paginasi), dan infografis.

## Skrip

| Perintah            | Fungsi                          |
| ------------------- | ------------------------------- |
| `npm run dev`       | Dev server                      |
| `npm run build`     | Typecheck + build produksi      |
| `npm run typecheck` | Cek tipe (tsc)                  |
| `npm run lint`      | ESLint                          |
| `npm run format`    | Prettier                        |

## Menyambungkan ke Backend (FastAPI) nanti

1. Lengkapi implementasi `http*Api` di `src/features/*/api/`.
2. Set `VITE_API_MODE=http` dan `VITE_API_BASE_URL` di `.env`.
3. Proxy dev sudah mengarah ke `http://localhost:8000` (lihat `vite.config.ts`).

Konvensi kode & arsitektur lengkap ada di [`../CLAUDE.md`](../CLAUDE.md).
