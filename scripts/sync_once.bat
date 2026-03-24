@echo off
chcp 65001 >nul
title 路演互动数据同步 - 单次同步

echo ========================================
echo 路演互动用户数据同步 - 单次执行
echo ========================================
echo.

cd /d "%~dp0"

echo 正在同步数据...
python sync_data.py

echo.
echo 同步完成！按任意键关闭...
pause >nul
