# NIA Web — Frontend

Portal Data Kependudukan Desa. React + TypeScript + Vite.

## Menjalankan

Backend (FastAPI, data dummy) harus jalan dulu — lihat
[`../backend/README.md`](../backend/README.md).

```bash
./start.sh    # bikin .env kalau belum ada, pasang dependensi, nyalakan Vite
```

Tidak ada `.env.example`. Kerangkanya dibuatkan `start.sh` dengan **nilai
bawaan yang langsung bisa jalan** — frontend tidak punya rahasia wajib seperti
backend, jadi kerangkanya lengkap.

### Isi `frontend/.env`

| Variabel | Wajib | Bawaan | Guna |
| -------- | ----- | ------ | ---- |
| `VITE_API_BASE_URL` | — | `/api` | Base URL API backend. `/api` melewati proxy Vite ke `localhost:8000` (satu origin, tanpa CORS). Isi URL penuh hanya kalau mau memanggil backend langsung. |
| `VITE_APP_NAME` | — | `SIDUK` | Nama aplikasi, dipakai di title & header. |

Semua variabel yang diakses di client **wajib** berprefix `VITE_`.

Berkas itu **tidak ikut repo** (`.gitignore`).

Manual, kalau lebih suka:

```bash
npm install
npm run dev   # http://localhost:5173
```

## Akun Demo (data dummy backend)

| Peran                   | Kredensial                                          |
| ------------------------ | --------------------------------------------------- |
| Dukuh                     | `dukuh` / `dukuh123`                                |
| Ketua RW 019               | `rw019` / `rw123`                                    |
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
