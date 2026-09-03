@echo off
title The Hayatabad Model School - Face Recognition Microservice
color 0B
echo ======================================================================
echo    THE HAYATABAD MODEL SCHOOL - AI FACE RECOGNITION ATTENDANCE
echo ======================================================================
echo.
echo Starting Python Face Recognition Microservice on http://127.0.0.1:8001 ...
echo.
py -3 -m uvicorn python_service.server:app --host 127.0.0.1 --port 8001 --reload
pause
