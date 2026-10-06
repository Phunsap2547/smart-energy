@echo off
cd /d %~dp0
call .venv\Scripts\activate.bat
python ml_poll_worker.py
pause