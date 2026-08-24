@echo off
cd /d "%~dp0"

set "DEFAULT=..\docs\data-penduduk.xlsx"

echo === Impor data Excel ke SIDUK ===
echo.
set /p "FILE=Path file Excel [Enter = %DEFAULT%]: "
if "%FILE%"=="" set "FILE=%DEFAULT%"

if not exist "%FILE%" (
    echo.
    echo File tidak ketemu: %FILE%
    pause
    exit /b 1
)

if not exist .venv python -m venv .venv
.venv\Scripts\pip install -q openpyxl

echo.
.venv\Scripts\python -m app.data.impor_excel "%FILE%"

echo.
echo Selesai. Restart backend ^(Ctrl+C lalu jalankan start.bat lagi^) supaya data ini kepakai.
pause
