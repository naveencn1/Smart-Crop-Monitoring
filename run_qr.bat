@echo off
title SmartCrop AI QR Code Generator
echo Running QR Code generator...
python print_qr.py
if %ERRORLEVEL% neq 0 (
    echo.
    echo Trying with absolute Python path...
    "C:\Users\VVNAV\AppData\Local\Programs\Python\Python313\python.exe" print_qr.py
)
echo.
echo Press any key to close this terminal...
pause > nul
