#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

DEFAULT="../docs/data-penduduk.xlsx"

echo "=== Impor data Excel ke SIDUK ==="
echo
read -p "Path file Excel [Enter = $DEFAULT]: " FILE
FILE="${FILE:-$DEFAULT}"

if [ ! -f "$FILE" ]; then
    echo
    echo "File tidak ketemu: $FILE"
    read -p "Tekan Enter untuk keluar..."
    exit 1
fi

[ -d .venv ] || python3 -m venv .venv
.venv/bin/pip install -q openpyxl

echo
.venv/bin/python -m app.data.impor_excel "$FILE"

echo
echo "Selesai. Restart backend (Ctrl+C lalu jalankan start.sh lagi) supaya data ini kepakai."
read -p "Tekan Enter untuk keluar..."
