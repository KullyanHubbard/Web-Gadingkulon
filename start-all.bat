@echo off
REM Nyalakan backend + frontend + tunnel ngrok sekaligus.
REM Backend & frontend terbuka di jendela sendiri; tutup jendelanya untuk mematikan.
cd /d "%~dp0"

if not exist frontend\node_modules (
    echo Memasang dependensi frontend...
    cmd /c "cd frontend && npm install"
)

start "SIDUK backend" cmd /k "backend\start.bat"
start "SIDUK frontend" cmd /k "cd frontend && npm run dev"

REM Beri dev server waktu bind ke 5173 sebelum ngrok menyambung.
timeout /t 5 /nobreak >nul

REM Satu tunnel saja: /api sudah diproksikan Vite ke backend (vite.config.ts).
ngrok http 5173
