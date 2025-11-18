"""
Test AWS RDS PostgreSQL Connection
Este script verifica que la conexión a AWS RDS funcione correctamente
antes de ejecutar seed.py
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print("=" * 60)
print("🔍 VERIFICACIÓN DE CONEXIÓN A AWS RDS POSTGRESQL")
print("=" * 60)
print()

# Mostrar URL (ocultando contraseña)
if DATABASE_URL:
    safe_url = DATABASE_URL.replace(DATABASE_URL.split('@')[0].split(':')[-1], "****")
    print(f"📍 DATABASE_URL: {safe_url}")
else:
    print("❌ DATABASE_URL no configurada en .env")
    exit(1)

print()
print("🔄 Intentando conectar...")
print()

try:
    # Crear engine
    engine = create_engine(DATABASE_URL, echo=False)
    
    # Intentar conexión
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        version = result.fetchone()[0]
        
        print("✅ ¡CONEXIÓN EXITOSA!")
        print()
        print(f"📦 PostgreSQL Version:")
        print(f"   {version}")
        print()
        
        # Verificar si existen tablas
        result = conn.execute(text("""
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
        """))
        tables = result.fetchall()
        
        if tables:
            print(f"📊 Tablas existentes ({len(tables)}):")
            for table in tables:
                print(f"   - {table[0]}")
        else:
            print("📊 No hay tablas creadas aún")
            print("   ℹ️  Ejecuta 'python scripts/seed.py' para crear las tablas")
        
        print()
        print("=" * 60)
        print("✅ Todo listo para ejecutar seed.py")
        print("=" * 60)
        
except OperationalError as e:
    error_msg = str(e)
    
    print("❌ ERROR DE CONEXIÓN")
    print()
    print(f"Detalle: {error_msg}")
    print()
    print("🔧 Posibles soluciones:")
    print()
    
    if "password authentication failed" in error_msg:
        print("   1. ⚠️  La contraseña de PostgreSQL es incorrecta")
        print("      → Verifica la contraseña en .env")
        print("      → Formato: postgresql://usuario:contraseña@host:5432/database")
        print()
    
    if "could not connect to server" in error_msg or "Connection refused" in error_msg:
        print("   1. 🔒 Tu IP no está autorizada en el Security Group de AWS RDS")
        print("      → Ve a AWS Console → RDS → Security Groups")
        print("      → Agrega tu IP pública actual")
        print()
        print("   2. 🌐 El endpoint puede estar incorrecto")
        print("      → Verifica en AWS Console el endpoint exacto")
        print()
        print("   3. 🔌 El puerto 5432 puede estar bloqueado")
        print("      → Verifica el firewall local")
        print()
    
    if "database" in error_msg and "does not exist" in error_msg:
        print("   1. 💾 La base de datos no existe en RDS")
        print("      → Conéctate con un cliente SQL")
        print("      → Ejecuta: CREATE DATABASE biblioreservas;")
        print()
    
    print("=" * 60)
    exit(1)

except Exception as e:
    print(f"❌ ERROR INESPERADO: {e}")
    print()
    print("🔧 Revisa:")
    print("   - Formato de DATABASE_URL en .env")
    print("   - Que psycopg2-binary esté instalado")
    print("   - Logs de AWS RDS en la consola")
    print()
    print("=" * 60)
    exit(1)
