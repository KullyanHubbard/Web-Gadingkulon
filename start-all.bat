@echo off
REM Nyalakan backend + frontend + tunnel ngrok sekaligus.
REM Backend & frontend terbuka di jendela sendiri; tutup jendelanya untuk mematikan.
cd /d "%~dp0"

REM Diperiksa SEBELUM apa pun dinyalakan. Kalau tidak, backend mati di
REM jendelanya sendiri sementara frontend & ngrok tetap jalan — yang terlihat
REM halaman terbuka normal dengan login yang gagal terus.
findstr /r /c:"^ADMIN_PASSWORD=..*" backend\.env >nul 2>&1
if errorlevel 1 (
    echo backend\.env belum siap — ADMIN_USERNAME dan ADMIN_PASSWORD harus diisi dulu.
    echo Jalankan backend\start.bat sekali untuk membuatkan kerangkanya.
    pause
    exit /b 1
)

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
