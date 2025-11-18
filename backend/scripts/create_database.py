"""
Script para crear la base de datos biblioreservas en AWS RDS
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

# Obtener la URL de conexión
DATABASE_URL = os.getenv("DATABASE_URL")

# Modificar la URL para conectar a la base de datos 'postgres' (que siempre existe)
if DATABASE_URL:
    # Reemplazar /biblioreservas con /postgres
    postgres_url = DATABASE_URL.rsplit('/', 1)[0] + '/postgres'
    
    print("=" * 60)
    print("🔧 CREANDO BASE DE DATOS BIBLIORESERVAS")
    print("=" * 60)
    print()
    print(f"📍 Conectando a: {postgres_url.split('@')[1]}")
    print()
    
    try:
        # Crear engine con isolation_level para poder crear DB
        engine = create_engine(postgres_url, isolation_level="AUTOCOMMIT")
        
        with engine.connect() as conn:
            # Verificar si la base de datos ya existe
            result = conn.execute(text(
                "SELECT 1 FROM pg_database WHERE datname = 'biblioreservas'"
            ))
            
            if result.fetchone():
                print("✅ La base de datos 'biblioreservas' ya existe")
            else:
                print("🔄 Creando base de datos 'biblioreservas'...")
                conn.execute(text("CREATE DATABASE biblioreservas"))
                print("✅ ¡Base de datos creada exitosamente!")
            
            print()
            print("=" * 60)
            print("✅ Listo para ejecutar seed.py")
            print("=" * 60)
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        print()
        print("💡 Posibles soluciones:")
        print("   - Verifica que las credenciales sean correctas")
        print("   - Verifica que tengas permisos para crear bases de datos")
        print()
        exit(1)
else:
    print("❌ DATABASE_URL no está configurada en .env")
    exit(1)
