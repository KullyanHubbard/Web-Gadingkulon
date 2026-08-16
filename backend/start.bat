@echo off
cd /d "%~dp0"
if not exist .venv python -m venv .venv
.venv\Scripts\pip install -q -r requirements.txt
.venv\Scripts\uvicorn app.main:app --reload --port 8000
pause
