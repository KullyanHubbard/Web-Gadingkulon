@echo off
REM Nyalakan backend + frontend + tunnel ngrok sekaligus.
REM Backend & frontend terbuka di jendela sendiri; tutup jendelanya untuk mematikan.
cd /d "%~dp0"

REM Diperiksa SEBELUM apa pun dinyalakan. Kalau tidak, backend mati di
REM jendelanya sendiri sementara frontend & ngrok tetap jalan — yang terlihat
REM halaman terbuka normal dengan login yang gagal terus.
if not exist backend\.env (
    echo backend\.env belum ada, backend tidak akan bisa jalan.
    echo.
    echo     copy backend\.env.example backend\.env
    echo.
    echo lalu isi ADMIN_USERNAME dan ADMIN_PASSWORD dengan nilai sungguhan.
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
