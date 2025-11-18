@echo off
REM Script para ejecutar el seed de la base de datos

echo ============================================================
echo BiblioReservas - Inicializando Base de Datos
echo ============================================================
echo.

cd /d "%~dp0"

python scripts/seed.py

echo.
pause
