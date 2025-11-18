@echo off
REM Script para iniciar el Email Worker de RabbitMQ

echo ============================================================
echo Email Worker - RabbitMQ Consumer
echo ============================================================
echo.
echo Este worker procesa la cola de emails en segundo plano.
echo Debe estar corriendo junto con el backend para que los
echo emails se envien correctamente.
echo.
echo Presiona Ctrl+C para detener el worker
echo ============================================================
echo.

cd /d "%~dp0"

python utils/email_worker.py
