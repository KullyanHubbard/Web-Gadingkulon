# NIA Web — Frontend

Portal Data Kependudukan Desa. React + TypeScript + Vite.

## Menjalankan

Backend (FastAPI, data dummy) harus jalan dulu — lihat
[`../backend/README.md`](../backend/README.md).

```bash
npm install
cp .env.example .env   # arahkan VITE_API_BASE_URL ke backend
npm run dev            # http://localhost:5173
```

## Akun Demo (data dummy backend)

| Peran                   | Kredensial                                          |
| ------------------------ | --------------------------------------------------- |
| Dukuh                     | `dukuh` / `dukuh123`                                |
| Ketua RT 03                | `rt03` / `rt123`                                     |
| Warga (sudah aktif)       | NIK `3204120210750001` / PIN `112233`                |
| Warga (belum aktivasi)    | NIK `3204124205790001`, lahir `02-05-1979`            |

Daftar ini juga tercetak di terminal saat backend dinyalakan.

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

Konvensi kode & arsitektur lengkap ada di [`../CLAUDE.md`](../CLAUDE.md).
