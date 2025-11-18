# BiblioReservas Backend

Backend API para el sistema de reservas de salas de biblioteca.

## Stack Tecnológico

- **Python 3.9+**
- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM para manejo de base de datos
- **PostgreSQL** - Base de datos relacional (o SQLite para desarrollo)
- **Pydantic** - Validación de datos
- **aiosmtplib** - Envío asíncrono de emails

## Instalación

1. Crear entorno virtual:
```bash
python -m venv venv
```

2. Activar entorno virtual:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

5. Inicializar la base de datos con datos de prueba:
```bash
python scripts/seed.py
```

## Ejecutar el servidor

```bash
python main.py
```

O usando uvicorn directamente:
```bash
uvicorn main:app --reload --port 8000
```

El servidor estará disponible en: http://localhost:8000

Documentación API (Swagger): http://localhost:8000/docs

## Endpoints Principales

### Salas
- `GET /api/rooms` - Listar todas las salas disponibles

### Reservas
- `POST /api/reservations` - Crear una nueva reserva
- `GET /api/users/{userId}/reservations` - Listar reservas de un usuario

## Base de Datos

El sistema utiliza tres tablas principales:

- **users** - Usuarios del sistema
- **rooms** - Salas disponibles para reservar
- **reservations** - Reservas realizadas

La tabla `reservations` tiene un constraint único sobre `(room_id, date, start_time, end_time)` para prevenir dobles reservas.

## Envío de Emails

Después de crear una reserva exitosamente, el sistema envía un email de confirmación al usuario.

Configurar las credenciales SMTP en el archivo `.env`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu-email@gmail.com
SMTP_PASSWORD=tu-password-de-aplicacion
```

Para Gmail, necesitas generar una "Contraseña de aplicación" en la configuración de seguridad de tu cuenta.

## Desarrollo

El proyecto está estructurado de la siguiente manera:

```
biblioreservas-backend/
├── main.py                 # Punto de entrada de la aplicación
├── database/
│   ├── __init__.py
│   ├── connection.py       # Configuración de la conexión a BD
│   └── models.py           # Modelos SQLAlchemy
├── routers/
│   ├── __init__.py
│   ├── rooms.py            # Endpoints de salas
│   └── reservations.py     # Endpoints de reservas
├── schemas/
│   ├── __init__.py
│   └── schemas.py          # Esquemas Pydantic
├── utils/
│   ├── __init__.py
│   └── email.py            # Utilidades de email
├── scripts/
│   └── seed.py             # Script de inicialización
└── requirements.txt        # Dependencias
```
