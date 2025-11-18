"""
Script de instalación rápida para el backend.
Ejecutar con: python setup.py
"""

import subprocess
import sys
import os


def run_command(command, description):
    """Ejecuta un comando y muestra el resultado"""
    print(f"\n{'='*60}")
    print(f"🔧 {description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=True,
            capture_output=False,
            text=True
        )
        print(f"✓ {description} completado")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error en: {description}")
        print(f"   {str(e)}")
        return False


def main():
    print("\n" + "="*60)
    print("🚀 SETUP DE BIBLIORESERVAS BACKEND")
    print("="*60)
    
    # 1. Instalar dependencias
    if not run_command(
        f"{sys.executable} -m pip install -r requirements.txt",
        "Instalando dependencias de Python"
    ):
        print("\n❌ Error al instalar dependencias. Abortando.")
        return
    
    # 2. Verificar si existe .env
    if not os.path.exists(".env"):
        print("\n⚠️  Archivo .env no encontrado")
        print("   Copiando .env.example a .env...")
        try:
            with open(".env.example", "r") as f:
                content = f.read()
            with open(".env", "w") as f:
                f.write(content)
            print("✓ Archivo .env creado")
            print("\n📝 IMPORTANTE: Edita el archivo .env con tus configuraciones SMTP")
        except Exception as e:
            print(f"❌ Error al crear .env: {str(e)}")
    else:
        print("\n✓ Archivo .env ya existe")
    
    # 3. Ejecutar seed
    if not run_command(
        f"{sys.executable} scripts/seed.py",
        "Inicializando base de datos con datos de prueba"
    ):
        print("\n❌ Error al ejecutar seed.")
        return
    
    print("\n" + "="*60)
    print("✅ SETUP COMPLETADO EXITOSAMENTE")
    print("="*60)
    print("\n📋 PRÓXIMOS PASOS:")
    print("   1. Edita el archivo .env con tus credenciales SMTP (opcional)")
    print("   2. Ejecuta el servidor: python main.py")
    print("   3. Abre http://localhost:8000/docs para ver la documentación")
    print("\n" + "="*60)


if __name__ == "__main__":
    main()
