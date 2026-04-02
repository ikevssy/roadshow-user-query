@echo off
chcp 65001 >nul

set LOG_FILE=E:\AIwork\路演互动查询系统\scripts\sync_log.txt
set PYTHON_PATH=C:\Users\EDY\AppData\Local\Programs\Python\Python312\python.exe
set GIT_PATH=C:\Program Files\Git\bin\git.exe
set WORK_DIR=E:\AIwork\路演互动查询系统

echo ======================================== >> "%LOG_FILE%"
echo 同步开始: %date% %time% >> "%LOG_FILE%"
echo ======================================== >> "%LOG_FILE%"

cd /d "%WORK_DIR%\scripts"

echo [1/4] 同步公司数据... >> "%LOG_FILE%"
"%PYTHON_PATH%" auto_sync_all.py >> "%LOG_FILE%" 2>&1

if %errorlevel% neq 0 (
    echo 错误：公司数据同步失败！错误码：%errorlevel% >> "%LOG_FILE%"
    exit /b 1
)

echo [2/4] 同步行业数据... >> "%LOG_FILE%"
"%PYTHON_PATH%" sync_industry.py >> "%LOG_FILE%" 2>&1

if %errorlevel% neq 0 (
    echo 错误：行业数据同步失败！错误码：%errorlevel% >> "%LOG_FILE%"
    exit /b 1
)

echo [3/4] 提交到Git... >> "%LOG_FILE%"
cd /d "%WORK_DIR%"

"%GIT_PATH%" add frontend/public/data/ >> "%LOG_FILE%" 2>&1
"%GIT_PATH%" commit -m "Auto sync: %date%" >> "%LOG_FILE%" 2>&1
"%GIT_PATH%" push >> "%LOG_FILE%" 2>&1

if %errorlevel% neq 0 (
    echo 错误：Git推送失败！错误码：%errorlevel% >> "%LOG_FILE%"
    exit /b 1
)

echo [4/4] 完成！ >> "%LOG_FILE%"
echo 同步完成: %date% %time% >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

exit /b 0
