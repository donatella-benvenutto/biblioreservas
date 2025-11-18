# Guía de Configuración: AWS + RabbitMQ + Emails

## 📍 Ubicación Actual de los Datos

Actualmente, los datos se guardan en:
```
biblioreservas-backend/biblioreservas.db
```

Este es un archivo SQLite local. Todas las tablas (users, rooms, reservations) están aquí.

---

## 🗄️ Migración a Base de Datos AWS RDS

### Opción 1: PostgreSQL en AWS RDS (Recomendado)

1. **Obtén la información de tu base de datos AWS RDS:**
   - Endpoint: `tu-instancia.xxxxx.us-east-1.rds.amazonaws.com`
   - Puerto: `5432` (PostgreSQL)
   - Usuario: `admin` (o el que hayas creado)
   - Contraseña: la que configuraste
   - Nombre de BD: `biblioreservas` (o el que hayas creado)

2. **Actualiza el archivo `.env`:**
```bash
# Reemplaza con tus datos reales
DATABASE_URL=postgresql://admin:tu_password@tu-endpoint.rds.amazonaws.com:5432/biblioreservas
```

3. **Ejecuta las migraciones:**
```bash
# Esto creará las tablas en AWS
python scripts/seed.py
```

### Opción 2: MySQL en AWS RDS

1. **Si usas MySQL en lugar de PostgreSQL:**

```bash
DATABASE_URL=mysql+pymysql://admin:tu_password@tu-endpoint.rds.amazonaws.com:3306/biblioreservas
```

2. **Ejecuta el seed:**
```bash
python scripts/seed.py
```

### ✅ Ventajas de AWS RDS vs SQLite:

| Característica | SQLite (Local) | AWS RDS |
|---|---|---|
| Ubicación | Archivo local | Servidor en la nube |
| Acceso concurrente | Limitado | Ilimitado |
| Backups | Manual | Automático |
| Escalabilidad | No escala | Escala fácilmente |
| Producción | ❌ No | ✅ Sí |

---

## 🐰 Configuración de RabbitMQ

### ¿Qué es RabbitMQ?

RabbitMQ es un **sistema de colas de mensajes**. En lugar de enviar emails directamente (bloqueando la API), los encolamos y un worker independiente los procesa.

### Flujo sin RabbitMQ (actual):
```
Usuario crea reserva → API envía email (espera 2-3 segundos) → Respuesta al usuario
                                ↓
                         Si falla, reserva igual se guarda
```

### Flujo con RabbitMQ (nuevo):
```
Usuario crea reserva → API encola mensaje en RabbitMQ → Respuesta inmediata
                              ↓
                    [Worker en segundo plano]
                              ↓
                       Procesa cola y envía email
```

### Beneficios:
- ✅ Respuesta instantánea al usuario
- ✅ Emails procesados en background
- ✅ Si falla, se reintenta automáticamente
- ✅ Escalable: puedes tener múltiples workers

---

## 🚀 Instalación de RabbitMQ

### Opción 1: RabbitMQ Local (Para desarrollo)

**Windows:**
1. Descarga e instala RabbitMQ: https://www.rabbitmq.com/install-windows.html
2. O usa Docker:
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

3. Panel de administración: http://localhost:15672
   - Usuario: `guest`
   - Contraseña: `guest`

**Configuración en `.env`:**
```bash
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_VHOST=/
EMAIL_QUEUE_ENABLED=true
```

### Opción 2: CloudAMQP (RabbitMQ en la nube - GRATIS)

1. **Crea cuenta en CloudAMQP:**
   - Ve a: https://www.cloudamqp.com/
   - Plan gratuito: "Little Lemur" (suficiente para desarrollo)

2. **Crea una instancia:**
   - Elige región cercana a tu AWS
   - Copia la **URL de conexión AMQP**

3. **Configuración en `.env`:**
```bash
RABBITMQ_URL=amqps://usuario:password@tu-instancia.cloudamqp.com/vhost
EMAIL_QUEUE_ENABLED=true
```

### Opción 3: Amazon MQ (RabbitMQ en AWS)

Si quieres todo en AWS:

1. Ve a Amazon MQ en la consola de AWS
2. Crea un broker RabbitMQ
3. Obtén el endpoint y credenciales
4. Configura en `.env`

---

## 📧 Configuración de Emails con Gmail

### Paso 1: Habilitar Verificación en 2 Pasos

1. Ve a: https://myaccount.google.com/security
2. Activa "Verificación en 2 pasos"

### Paso 2: Generar Contraseña de Aplicación

1. Ve a: https://myaccount.google.com/apppasswords
2. Selecciona "Correo" y "Windows"
3. Haz clic en "Generar"
4. **Copia la contraseña de 16 caracteres** (algo como: `abcd efgh ijkl mnop`)

### Paso 3: Configurar en `.env`

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop  # Sin espacios, los 16 caracteres
SMTP_FROM_EMAIL=tu-email@gmail.com
SMTP_FROM_NAME=BiblioReservas
```

### ⚠️ Errores Comunes:

| Error | Solución |
|---|---|
| "Username and Password not accepted" | Usa contraseña de aplicación, NO tu contraseña normal |
| "SMTP AUTH extension not supported" | Puerto debe ser 587, no 465 |
| "SSL required" | Usa STARTTLS (puerto 587) |

---

## 🎯 Cómo Usar el Sistema Completo

### Paso 1: Instalar Dependencias Actualizadas

```bash
cd biblioreservas-backend
pip install -r requirements.txt
```

### Paso 2: Configurar .env

Edita `.env` con:
- ✅ Credenciales de AWS RDS
- ✅ Credenciales de RabbitMQ
- ✅ Contraseña de aplicación de Gmail

### Paso 3: Migrar Datos a AWS

```bash
python scripts/seed.py
```

Esto creará las tablas en AWS RDS y agregará datos de prueba.

### Paso 4: Iniciar el Backend

```bash
python main.py
```

### Paso 5: Iniciar el Email Worker (Si usas RabbitMQ)

En **otra terminal**:

```bash
cd biblioreservas-backend
python utils/email_worker.py
```

Verás:
```
📧 Email Worker - RabbitMQ Consumer
Waiting for email tasks...
```

### Paso 6: Probar

1. Crea una reserva desde el frontend
2. Verás en el worker:
```
Processing email task for reservation #1
Email sent successfully for reservation #1
```
3. Revisa tu email!

---

## 📊 Arquitectura Final

```
┌─────────────┐
│   Frontend  │ (Next.js - localhost:3000)
│   React     │
└──────┬──────┘
       │ HTTP
       ↓
┌─────────────┐
│   Backend   │ (FastAPI - localhost:8000)
│   Python    │
└──────┬──────┘
       │
       ├─────────→ ┌──────────────┐
       │           │   AWS RDS    │ (PostgreSQL/MySQL)
       │           │   Database   │
       │           └──────────────┘
       │
       └─────────→ ┌──────────────┐
                   │   RabbitMQ   │ (Cola de mensajes)
                   └──────┬───────┘
                          │
                          ↓
                   ┌──────────────┐
                   │ Email Worker │ (Python)
                   └──────┬───────┘
                          │
                          ↓
                   ┌──────────────┐
                   │ Gmail SMTP   │
                   └──────────────┘
```

---

## 🧪 Testing

### Probar conexión a AWS RDS:

```python
python -c "from database.connection import engine; print('✅ Conectado a AWS RDS!'); print(engine.url)"
```

### Probar RabbitMQ:

```python
python -c "from utils.rabbitmq import check_rabbitmq_connection; print('✅ RabbitMQ OK!' if check_rabbitmq_connection() else '❌ RabbitMQ no disponible')"
```

### Probar email:

1. Crea una reserva desde el frontend
2. Revisa los logs del worker
3. Revisa tu bandeja de entrada

---

## 🆘 Troubleshooting

### RabbitMQ no conecta:
- Verifica que esté corriendo: `docker ps` o revisa el servicio
- Panel web: http://localhost:15672

### Emails no llegan:
- Revisa spam
- Verifica que usaste contraseña de aplicación
- Mira los logs del worker

### AWS RDS no conecta:
- Verifica Security Groups (permite puerto 5432 o 3306)
- VPC debe ser accesible públicamente
- Credenciales correctas en `.env`

---

## 🔐 Seguridad

⚠️ **NUNCA** subas el archivo `.env` a Git

El `.gitignore` ya lo excluye, pero verifica:
```bash
# Debe estar en .gitignore
.env
*.db
```

---

¿Tienes las credenciales de tu base de datos AWS? Te ayudo a configurarlas.
