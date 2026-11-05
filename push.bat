@echo off
title Push Weather Radar to GitHub
color 0A
echo ========================================================
echo       PUSHING WEATHER RADAR TO GITHUB
echo ========================================================
echo.
echo Remote: https://github.com/nitishdubey05/weatherApp.git
echo Branch: main
echo.
"C:\Program Files\Git\cmd\git.exe" push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo SUCCESS! Your code has been pushed to GitHub:
    echo https://github.com/nitishdubey05/weatherApp
    echo ========================================================
) else (
    echo.
    echo If sign-in failed, please retry or check your GitHub permissions.
)
echo.
pause
