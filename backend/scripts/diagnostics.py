"""
Script de diagnóstico para verificar la configuración del sistema.

Verifica:
- Conexión a la base de datos
- Conexión a RabbitMQ
- Configuración de SMTP
- Variables de entorno

Uso: python scripts/diagnostics.py
"""

import sys
import os

# Añadir directorio raíz al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from dotenv import load_dotenv
from database.connection import engine, SessionLocal
from database.models import User, Room, Reservation
from utils.rabbitmq import check_rabbitmq_connection
import smtplib

load_dotenv()


def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


def check_database():
    """Verifica la conexión a la base de datos"""
    print_section("🗄️  BASE DE DATOS")
    
    try:
        db_url = os.getenv("DATABASE_URL")
        print(f"URL: {db_url}")
        
        # Intentar conectar
        connection = engine.connect()
        print("✅ Conexión exitosa")
        
        # Verificar tipo de base de datos
        if "sqlite" in db_url:
            print("📍 Tipo: SQLite (local)")
            db_file = db_url.replace("sqlite:///./", "")
            if os.path.exists(db_file):
                size = os.path.getsize(db_file)
                print(f"📊 Tamaño del archivo: {size / 1024:.2f} KB")
        elif "postgresql" in db_url:
            print("📍 Tipo: PostgreSQL (AWS RDS)")
        elif "mysql" in db_url:
            print("📍 Tipo: MySQL (AWS RDS)")
        
        # Contar registros
        db = SessionLocal()
        user_count = db.query(User).count()
        room_count = db.query(Room).count()
        reservation_count = db.query(Reservation).count()
        db.close()
        
        print(f"\n📊 Registros:")
        print(f"   • Usuarios: {user_count}")
        print(f"   • Salas: {room_count}")
        print(f"   • Reservas: {reservation_count}")
        
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def check_rabbitmq():
    """Verifica la conexión a RabbitMQ"""
    print_section("🐰 RABBITMQ")
    
    queue_enabled = os.getenv("EMAIL_QUEUE_ENABLED", "false").lower() == "true"
    print(f"Habilitado: {'✅ SÍ' if queue_enabled else '❌ NO (emails síncronos)'}")
    
    if not queue_enabled:
        print("\n💡 Para habilitar RabbitMQ, configura en .env:")
        print("   EMAIL_QUEUE_ENABLED=true")
        return None
    
    rabbitmq_url = os.getenv("RABBITMQ_URL")
    if rabbitmq_url:
        print(f"URL: {rabbitmq_url[:50]}...")
    else:
        print(f"Host: {os.getenv('RABBITMQ_HOST', 'localhost')}")
        print(f"Port: {os.getenv('RABBITMQ_PORT', '5672')}")
        print(f"User: {os.getenv('RABBITMQ_USER', 'guest')}")
    
    try:
        if check_rabbitmq_connection():
            print("✅ Conexión exitosa")
            print(f"Cola: {os.getenv('EMAIL_QUEUE_NAME', 'email_notifications')}")
            print("\n⚠️  Recuerda iniciar el worker:")
            print("   python utils/email_worker.py")
            return True
        else:
            print("❌ No se pudo conectar")
            print("\n💡 Soluciones:")
            print("   1. Instala RabbitMQ: docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management")
            print("   2. O usa CloudAMQP (gratis): https://www.cloudamqp.com/")
            print("   3. O deshabilita la cola: EMAIL_QUEUE_ENABLED=false")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def check_smtp():
    """Verifica la configuración de SMTP"""
    print_section("📧 CONFIGURACIÓN DE EMAIL")
    
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_user = os.getenv("SMTP_USERNAME")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM_EMAIL")
    
    print(f"Host: {smtp_host}")
    print(f"Port: {smtp_port}")
    print(f"Usuario: {smtp_user}")
    print(f"Password: {'✅ Configurado' if smtp_pass else '❌ No configurado'}")
    print(f"From: {from_email}")
    
    if not all([smtp_host, smtp_port, smtp_user, smtp_pass]):
        print("\n❌ Configuración incompleta")
        print("\n💡 Para configurar Gmail:")
        print("   1. Ve a: https://myaccount.google.com/apppasswords")
        print("   2. Genera una contraseña de aplicación")
        print("   3. Configura en .env:")
        print("      SMTP_USERNAME=tu-email@gmail.com")
        print("      SMTP_PASSWORD=contraseña-de-16-caracteres")
        return False
    
    try:
        print("\n🔍 Probando conexión SMTP...")
        server = smtplib.SMTP(smtp_host, int(smtp_port))
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.quit()
        print("✅ Conexión SMTP exitosa")
        print("✉️  Los emails se enviarán correctamente")
        return True
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")
        print("\n💡 Verifica:")
        print("   • Que uses contraseña de aplicación (NO tu contraseña normal)")
        print("   • Verificación en 2 pasos activada en Gmail")
        print("   • Puerto 587 (no 465)")
        return False


def check_environment():
    """Verifica las variables de entorno críticas"""
    print_section("🔧 VARIABLES DE ENTORNO")
    
    critical_vars = [
        "DATABASE_URL",
        "CORS_ORIGINS",
        "API_PORT"
    ]
    
    optional_vars = [
        "EMAIL_QUEUE_ENABLED",
        "RABBITMQ_HOST",
        "SMTP_USERNAME"
    ]
    
    print("Variables críticas:")
    all_ok = True
    for var in critical_vars:
        value = os.getenv(var)
        if value:
            # Ocultar passwords
            if "password" in var.lower():
                display = "***"
            else:
                display = value[:50] + "..." if len(value) > 50 else value
            print(f"  ✅ {var}: {display}")
        else:
            print(f"  ❌ {var}: No configurado")
            all_ok = False
    
    print("\nVariables opcionales:")
    for var in optional_vars:
        value = os.getenv(var)
        status = "✅ " if value else "⚪ "
        print(f"  {status}{var}: {value or 'No configurado'}")
    
    return all_ok


def main():
    print("\n" + "="*60)
    print("  🔍 DIAGNÓSTICO DEL SISTEMA - BiblioReservas")
    print("="*60)
    
    results = {
        "env": check_environment(),
        "db": check_database(),
        "rabbitmq": check_rabbitmq(),
        "smtp": check_smtp()
    }
    
    print_section("📋 RESUMEN")
    
    print("Estado de componentes:")
    print(f"  {'✅' if results['env'] else '❌'} Variables de entorno")
    print(f"  {'✅' if results['db'] else '❌'} Base de datos")
    
    if results['rabbitmq'] is None:
        print(f"  ⚪ RabbitMQ (deshabilitado)")
    else:
        print(f"  {'✅' if results['rabbitmq'] else '❌'} RabbitMQ")
    
    print(f"  {'✅' if results['smtp'] else '❌'} Configuración de email")
    
    all_ok = results['env'] and results['db'] and results['smtp']
    if results['rabbitmq'] is not None:
        all_ok = all_ok and results['rabbitmq']
    
    if all_ok:
        print("\n🎉 ¡Todo configurado correctamente!")
        print("\n🚀 Puedes iniciar el sistema:")
        print("   Terminal 1: python main.py")
        if results['rabbitmq']:
            print("   Terminal 2: python utils/email_worker.py")
    else:
        print("\n⚠️  Hay problemas de configuración")
        print("   Revisa los detalles arriba y el archivo AWS_RABBITMQ_CONFIG.md")
    
    print("\n" + "="*60)


if __name__ == "__main__":
    main()
