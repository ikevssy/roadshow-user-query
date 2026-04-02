@echo off
chcp 65001 >nul

cd /d "E:\AIwork\路演互动查询系统\scripts"
"C:\Users\EDY\AppData\Local\Programs\Python\Python312\python.exe" scheduled_sync.py

exit /b %errorlevel%
