"""
Script de inicialización (seed) de la base de datos.

Este script:
1. Crea las tablas necesarias si no existen
2. Inserta un usuario de prueba
3. Inserta varias salas de ejemplo
4. Muestra los IDs generados por consola

Ejecutar con: python scripts/seed.py
"""

import sys
import os

# Añadir el directorio raíz al path para poder importar los módulos
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.connection import engine, SessionLocal
from database.models import Base, User, Room
from datetime import datetime


def seed_database():
    """Inicializa la base de datos con datos de prueba"""
    
    print("=" * 60)
    print("INICIANDO SEED DE BASE DE DATOS")
    print("=" * 60)
    
    # Crear todas las tablas
    print("\n[1/3] Creando tablas...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tablas creadas exitosamente")
    
    # Crear sesión de base de datos
    db = SessionLocal()
    
    try:
        # ============ CREAR USUARIO DE PRUEBA ============
        print("\n[2/3] Insertando usuario de prueba...")
        
        # Verificar si ya existe el usuario
        existing_user = db.query(User).filter(User.email == "demo@ejemplo.com").first()
        
        if existing_user:
            print(f"⚠ Usuario ya existe: ID {existing_user.id}, Email: {existing_user.email}")
            user = existing_user
        else:
            user = User(
                name="Usuario Demo",
                email="demo@ejemplo.com"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"✓ Usuario creado: ID {user.id}, Email: {user.email}")
        
        # ============ CREAR SALAS DE EJEMPLO ============
        print("\n[3/3] Insertando salas de ejemplo...")
        
        rooms_data = [
            {"name": "Sala 101", "library_name": "Biblioteca Central", "capacity": 4},
            {"name": "Sala 102", "library_name": "Biblioteca Central", "capacity": 2},
            {"name": "Sala 201", "library_name": "Biblioteca Central", "capacity": 8},
            {"name": "Sala 301", "library_name": "Biblioteca Central", "capacity": 2},
            {"name": "Sala A1", "library_name": "Biblioteca de Ciencias", "capacity": 5},
            {"name": "Sala A2", "library_name": "Biblioteca de Ciencias", "capacity": 3},
            {"name": "Sala B1", "library_name": "Biblioteca de Humanidades", "capacity": 6},
            {"name": "Sala B2", "library_name": "Biblioteca de Humanidades", "capacity": 4},
        ]
        
        created_rooms = []
        
        for room_data in rooms_data:
            # Verificar si ya existe la sala
            existing_room = db.query(Room).filter(
                Room.name == room_data["name"],
                Room.library_name == room_data["library_name"]
            ).first()
            
            if existing_room:
                print(f"⚠ Sala ya existe: ID {existing_room.id}, {existing_room.name} ({existing_room.library_name})")
                created_rooms.append(existing_room)
            else:
                room = Room(**room_data)
                db.add(room)
                db.commit()
                db.refresh(room)
                created_rooms.append(room)
                print(f"✓ Sala creada: ID {room.id}, {room.name} - {room.library_name} (Capacidad: {room.capacity})")
        
        # ============ RESUMEN ============
        print("\n" + "=" * 60)
        print("SEED COMPLETADO EXITOSAMENTE")
        print("=" * 60)
        
        print(f"\n📊 RESUMEN:")
        print(f"   • Usuario de prueba: ID {user.id} ({user.email})")
        print(f"   • Total de salas: {len(created_rooms)}")
        
        print(f"\n💡 INFORMACIÓN PARA PRUEBAS:")
        print(f"   • User ID para pruebas: {user.id}")
        print(f"   • Email del usuario: {user.email}")
        print(f"\n   IDs de salas disponibles:")
        for room in created_rooms:
            print(f"     - ID {room.id}: {room.name} ({room.library_name}) - Cap. {room.capacity}")
        
        print(f"\n🚀 Puedes usar estos IDs para crear reservas desde el frontend")
        print(f"   Ejemplo de request POST /api/reservations:")
        print(f"""   {{
     "userId": {user.id},
     "roomId": {created_rooms[0].id},
     "date": "2025-11-20",
     "startTime": "14:00",
     "endTime": "16:00"
   }}""")
        
        print("\n" + "=" * 60)
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error al ejecutar seed: {str(e)}")
        raise
    finally:
        db.close()
        print("\n✓ Conexión a base de datos cerrada")


if __name__ == "__main__":
    seed_database()
