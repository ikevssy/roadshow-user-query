@echo off
chcp 65001 >nul
title 路演互动数据同步 - 一键更新

echo ========================================
echo 路演互动用户数据同步工具
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 正在同步数据（可能需要5-15分钟）...
python batch_sync_oids.py

if %errorlevel% neq 0 (
    echo.
    echo 错误：数据同步失败！请检查网络连接和配置文件。
    pause
    exit /b 1
)

echo.
echo [2/3] 数据同步完成，正在提交到Git...

cd ..

git add frontend/public/data/
git status

echo.
set /p confirm=确认提交并推送？(Y/N): 
if /i "%confirm%" neq "Y" (
    echo 已取消推送
    pause
    exit /b 0
)

git commit -m "Update data: %date% %time%"
git push

if %errorlevel% neq 0 (
    echo.
    echo 错误：Git推送失败！请检查网络连接。
    pause
    exit /b 1
)

echo.
echo ========================================
echo 完成！数据将在2-3分钟后在Vercel生效
echo ========================================
echo.
pause
