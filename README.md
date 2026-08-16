# SIDUK — Portal Data Kependudukan Desa

Aplikasi web untuk melihat data kependudukan desa berdasarkan **NIK / No. KK**.

- **Warga (USER):** melihat data NIK & Kartu Keluarga miliknya sendiri.
- **Perangkat Desa (ADMIN):** melihat data pribadi, seluruh data penduduk, dan infografis.

## Struktur

```
NIA-WEB/
├── CLAUDE.md      # panduan kerja & konvensi kode (baca dulu)
├── frontend/      # React + TypeScript + Vite  (AKTIF)
└── backend/       # Python + FastAPI            (AKTIF, data masih dummy — lihat backend/README.md)
```

## Mulai Cepat

```bash
# Backend
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload --port 8000

# Frontend (terminal baru)
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Frontend butuh backend jalan (`VITE_API_BASE_URL` di `frontend/.env`). Akun demo
dicetak backend di terminal setiap kali dinyalakan. Detail endpoint ada di
[`backend/README.md`](backend/README.md).

## Tech Stack

| Lapisan  | Teknologi                                              |
| -------- | ------------------------------------------------------ |
| Frontend | React 18, TypeScript, Vite, Tailwind, React Query      |
| Backend  | Python, FastAPI _(data dummy, belum ke database)_      |
| Database | SQLite _(dalam implementasi)_                          |

Konvensi & arsitektur: lihat [`CLAUDE.md`](CLAUDE.md).
