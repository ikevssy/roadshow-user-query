@echo off
chcp 65001 >nul
echo ========================================
echo 路演互动用户数据同步 - 立即执行
echo ========================================
echo.

cd /d "%~dp0"
python sync_data.py

echo.
echo 同步完成，按任意键关闭...
pause >nul
