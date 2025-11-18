"""
Script para actualizar el email del usuario de prueba
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.connection import SessionLocal
from database.models import User

db = SessionLocal()

try:
    # Obtener el usuario con ID 1
    user = db.query(User).filter(User.id == 1).first()
    
    if user:
        print(f"Usuario actual: {user.name} - {user.email}")
        
        # Actualizar email
        user.email = "francofontanarossa@gmail.com"
        db.commit()
        
        print(f"✅ Email actualizado a: {user.email}")
    else:
        print("❌ Usuario no encontrado")
        
finally:
    db.close()
