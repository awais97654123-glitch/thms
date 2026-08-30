@echo off
title The Hayatabad Model School - Admin ERP
echo ========================================================
echo   THE HAYATABAD MODEL SCHOOL - MANAGEMENT SYSTEM
echo ========================================================
echo.
echo Initializing Application Window...
echo.

cd /d "d:\projects\app\ten"
powershell -ExecutionPolicy Bypass -File "d:\projects\app\ten\scripts\launch-admin-app.ps1"

timeout /t 2 >nul
exit
