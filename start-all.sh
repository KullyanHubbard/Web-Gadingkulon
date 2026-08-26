#!/usr/bin/env bash
# Nyalakan backend + frontend + tunnel ngrok sekaligus.
# Ctrl+C mematikan ketiganya.
set -e
cd "$(dirname "$0")"

[ -d frontend/node_modules ] || (cd frontend && npm install)

trap 'kill 0' EXIT

./backend/start.sh &
(cd frontend && npm run dev) &

# Beri dev server waktu bind ke 5173 sebelum ngrok menyambung.
sleep 5
# Satu tunnel saja: /api sudah diproksikan Vite ke backend (vite.config.ts).
ngrok http 5173
