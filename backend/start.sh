#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

# Backend menolak jalan tanpa ADMIN_USERNAME & ADMIN_PASSWORD pada database
# kosong. Diperiksa di sini supaya pesannya terbaca sebagai petunjuk, bukan
# sebagai tumpukan traceback.
#
# `.env.example` sengaja TIDAK disalin otomatis: isinya
# `ADMIN_PASSWORD=ganti-password-ini`, dan menyalinnya diam-diam mengubah
# contoh itu menjadi password Admin yang sungguhan dan berlaku — tertulis di
# berkas yang ikut repo.
if [ ! -f .env ]; then
  cat >&2 <<'PESAN'
backend/.env belum ada.

  cp backend/.env.example backend/.env

lalu isi ADMIN_USERNAME dan ADMIN_PASSWORD dengan nilai sungguhan. Dua nilai
itu dipakai sekali, untuk membuat akun Admin pertama — setelah akun itu ada,
mengubahnya tidak berpengaruh apa-apa.
PESAN
  exit 1
fi

[ -d .venv ] || python3 -m venv .venv
.venv/bin/pip install -q -r requirements.txt
.venv/bin/uvicorn app.main:app --reload --port 8000
