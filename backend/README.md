# Backend NIA (dummy)

FastAPI, data dummy di memori — belum tersambung Postgres (lihat CLAUDE.md §11).
200 Kartu Keluarga, tiap KK 3-5 anggota (diacak, seed tetap jadi datanya sama
tiap restart). Generator ada di `app/data/dummy.py`.

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
| POST   | `/auth/warga/{nik}/reset-pin`   | hanya ADMIN, tercatat di audit log           |
| POST   | `/auth/logout`                  | —                                             |
| GET    | `/penduduk`                     | daftar (`page`, `pageSize`, `search`)        |
| GET    | `/penduduk/nik/{nik}`           | detail per NIK                                |
| GET    | `/kartu-keluarga/{noKK}`        | KK + anggota                                  |
| GET    | `/publik/statistik`             | cacah per RW — tanpa auth                     |
| GET    | `/infografis`                   | agregat lengkap — hanya ADMIN                 |

Token JWT dikirim lewat header `Authorization: Bearer <token>`. Semua state
(akun warga, tiket aktivasi, rate limit) hidup di memori proses — hilang tiap
restart, kecuali akun warga demo yang di-seed ulang otomatis.
