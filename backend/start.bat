@echo off
cd /d "%~dp0"

REM Backend menolak jalan tanpa ADMIN_USERNAME & ADMIN_PASSWORD pada database
REM kosong. Diperiksa di sini supaya pesannya terbaca sebagai petunjuk.
REM .env.example sengaja TIDAK disalin otomatis: isinya password contoh yang
REM akan berlaku sungguhan kalau disalin diam-diam.
if not exist .env (
    echo backend\.env belum ada.
    echo.
    echo     copy backend\.env.example backend\.env
    echo.
    echo lalu isi ADMIN_USERNAME dan ADMIN_PASSWORD dengan nilai sungguhan.
    echo Dua nilai itu dipakai sekali, untuk membuat akun Admin pertama.
    pause
    exit /b 1
)

if not exist .venv python -m venv .venv
.venv\Scripts\pip install -q -r requirements.txt
.venv\Scripts\uvicorn app.main:app --reload --port 8000
pause
