@echo off
REM Script para iniciar el backend de BiblioReservas en Windows

echo ============================================================
echo BiblioReservas Backend - Iniciando servidor
echo ============================================================
echo.

cd /d "%~dp0"

echo Verificando dependencias...
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo.
    echo [!] Dependencias no encontradas. Instalando...
    python -m pip install -r requirements.txt
    if errorlevel 1 (
        echo.
        echo [X] Error al instalar dependencias
        pause
        exit /b 1
    )
)

echo.
echo Iniciando servidor en http://localhost:8000
echo Documentacion: http://localhost:8000/docs
echo.
echo Presiona Ctrl+C para detener el servidor
echo ============================================================
echo.

python main.py
