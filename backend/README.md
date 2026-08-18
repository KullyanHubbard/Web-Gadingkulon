# Backend SIDUK (dummy)

FastAPI. Data penduduk di SQLite, di-seed dari generator dummy (CLAUDE.md §11).
200 Kartu Keluarga, tiap KK 3-5 anggota (diacak, seed tetap jadi datanya sama
tiap restart). Generator ada di `app/data/dummy.py`.

Bentuk datanya sudah mengikuti skema yang direncanakan untuk database, jadi
impor data asli nanti tinggal mengisi tabel dengan kolom yang sama:

| Kolom                | Isi                                                    |
| -------------------- | ------------------------------------------------------ |
| `statusKependudukan` | `AKTIF` / `PINDAH` / `MENINGGAL` — datanya sah, tetap ikut daftar & statistik |
| `deletedAt`          | ISO date atau `null` — salah input, **tidak pernah** ikut daftar & statistik |

Penyaringan `deletedAt` ada di `app/data/store.py`, satu tempat, bukan di
tiap router. Cacah saat ini: 801 baris digenerate, 3 bertanda `deletedAt`,
jadi 798 yang terlihat lewat API.

## Jalankan

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload --port 8000
```

Docs interaktif: http://localhost:8000/docs

## Sambungkan ke frontend

Di `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8000
```

## Endpoint

| Method | Path                           | Untuk                                     |
| ------ | ------------------------------- | -------------------------------------------- |
| POST   | `/auth/login`                   | pengurus: username + password               |
| POST   | `/auth/warga/login`             | warga: NIK + PIN                             |
| POST   | `/auth/warga/aktivasi/cek`      | NIK + tanggal lahir → tiket (throttled)      |
| POST   | `/auth/warga/aktivasi/set-pin`  | tiket + PIN baru → sesi                      |
| PATCH  | `/auth/me/kontak`               | simpan noHp/email opsional (perlu token)     |
| GET    | `/auth/warga/akun`              | hanya ADMIN — NIK yang akunnya sudah aktif   |
| POST   | `/auth/warga/{nik}/reset-pin`   | hanya ADMIN — hapus akun, warga aktivasi ulang; tercatat di audit log |
| POST   | `/auth/logout`                  | —                                             |
| GET    | `/penduduk`                     | daftar (`page`, `pageSize`, `search`)        |
| GET    | `/penduduk/nik/{nik}`           | detail per NIK                                |
| GET    | `/kartu-keluarga/{noKK}`        | KK + anggota                                  |
| GET    | `/publik/statistik`             | cacah per RW — tanpa auth                     |
| GET    | `/infografis`                   | agregat lengkap — hanya ADMIN                 |

Token JWT dikirim lewat header `Authorization: Bearer <token>`.

**Data penduduk & akun warga** tinggal di SQLite (`data/siduk.db`, dibuat
otomatis saat backend pertama kali jalan lalu diisi dari generator dummy) —
selamat melewati restart. Akun warga wajib ikut di sini: kalau PIN disimpan di
memori, tiap restart semua warga otomatis kembali ke keadaan "belum punya PIN"
dan tombol Reset PIN pengurus tidak menentukan apa pun. Mau dataset baru? Hapus
filenya, jalankan ulang. File itu di-gitignore: jangan pernah di-commit,
apalagi setelah berisi NIK asli.

**Sisanya masih di memori proses** dan hilang tiap restart: akun pengurus
(di-seed identik tiap start, jadi tidak berubah), tiket aktivasi, rate limit,
audit log.
