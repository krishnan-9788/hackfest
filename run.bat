@echo off
TITLE AI Complaint Classification and Management System

echo =====================================================================
echo  AI-Powered Complaint Classification and Management System
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Python dependencies...
python -m pip install -r backend\requirements.txt --quiet

echo [2/3] Initializing Database & Seed Records...
cd /d "%~dp0backend"
python -m app.database.init_db
cd /d "%~dp0"

echo [3/3] Launching Backend & Frontend services...

echo Starting FastAPI Backend on http://localhost:8000 ...
start "Backend Server (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo Starting React Frontend on http://localhost:5173 ...
start "Frontend Dev (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =====================================================================
echo Both servers have been launched in separate windows!
echo - Frontend Dashboard: http://localhost:5173
echo - Backend Swagger Docs: http://localhost:8000/docs
echo =====================================================================
echo.
pause
