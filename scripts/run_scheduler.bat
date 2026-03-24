@echo off
chcp 65001 >nul
echo ========================================
echo 路演互动用户数据同步 - 定时任务模式
echo ========================================
echo.

cd /d "%~dp0"
python sync_data.py --schedule

pause
