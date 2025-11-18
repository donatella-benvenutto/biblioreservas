# 🚀 Instrucciones de Configuración Final

## ⚠️ INFORMACIÓN FALTANTE NECESARIA

### 1. Contraseña de PostgreSQL AWS RDS
**Necesito que proporciones:**
- La contraseña del usuario `postgres` de tu base de datos AWS RDS
- El nombre de la base de datos (si no es `biblioreservas`)

**Actualiza manualmente el archivo `.env` en la línea:**
```
DATABASE_URL=postgresql://postgres:TU_CONTRASEÑA_AQUI@biblioreservas.c56me4key5uj.us-east-2.rds.amazonaws.com:5432/biblioreservas
```

### 2. Instalación de RabbitMQ

**Opción A: RabbitMQ Local con Docker (Recomendado - Más Rápido)**
```powershell
# Instalar Docker Desktop desde: https://www.docker.com/products/docker-desktop/

# Una vez instalado Docker, ejecutar:
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Panel de administración: http://localhost:15672
# Usuario: guest, Password: guest
```

**Opción B: CloudAMQP (Gratis, en la nube)**
1. Ir a https://customer.cloudamqp.com/signup
2. Crear cuenta gratuita
3. Crear nueva instancia (plan "Little Lemur" - FREE)
4. Copiar la URL de conexión (formato: `amqps://usuario:pass@host.cloudamqp.com/vhost`)
5. Actualizar `.env`:
   ```
   RABBITMQ_URL=amqps://usuario:pass@host.cloudamqp.com/vhost
   ```

**Opción C: RabbitMQ Local sin Docker**
1. Descargar desde: https://www.rabbitmq.com/download.html
2. Instalar en Windows
3. El servicio iniciará automáticamente
4. Mantener la URL por defecto en `.env`: `amqp://guest:guest@localhost:5672/`

---

## 📧 ADVERTENCIA IMPORTANTE - SEGURIDAD DE EMAIL

**⚠️ La contraseña que proporcionaste NO debería ser tu contraseña real de Gmail.**

Gmail requiere una "Contraseña de Aplicación" para aplicaciones de terceros:

1. Ir a: https://myaccount.google.com/security
2. Habilitar "Verificación en 2 pasos"
3. Ir a: https://myaccount.google.com/apppasswords
4. Crear contraseña de aplicación para "Otra (nombre personalizado)"
5. Nombrarla "BiblioReservas"
6. Copiar la contraseña generada (16 caracteres)
7. Actualizar `.env`:
   ```
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx
   ```

**Si Gmail no permite el login con tu contraseña actual, necesitarás crear una App Password.**

---

## 🔧 Pasos para Completar la Configuración

### Paso 1: Actualizar credenciales
```powershell
# Editar el archivo .env y completar:
# - DATABASE_URL con la contraseña correcta de PostgreSQL
# - RABBITMQ_URL si eliges CloudAMQP
# - SMTP_PASSWORD con App Password de Gmail (recomendado)
```

### Paso 2: Instalar driver de PostgreSQL
```powershell
cd "c:\Users\gabri\OneDrive\Escritorio\Franco\Sistemas Distribuidos\Proyecto\biblioreservas-backend"
pip install psycopg2-binary
```

### Paso 3: Inicializar base de datos AWS
```powershell
python scripts/seed.py
```

### Paso 4: Iniciar servidor backend
```powershell
python main.py
```

### Paso 5: Iniciar worker de emails (en otra terminal)
```powershell
cd "c:\Users\gabri\OneDrive\Escritorio\Franco\Sistemas Distribuidos\Proyecto\biblioreservas-backend"
python utils/email_worker.py
```

### Paso 6: Iniciar frontend (en otra terminal)
```powershell
cd "c:\Users\gabri\OneDrive\Escritorio\Franco\Sistemas Distribuidos\Proyecto\biblioreservas"
npm run dev
```

---

## ✅ Verificación del Sistema

Una vez todo configurado, ejecutar diagnóstico:
```powershell
python scripts/diagnostics.py
```

Deberías ver todos los checks en verde ✅

---

## 🔄 Flujo Completo de Reserva con RabbitMQ

1. **Usuario crea reserva** → Frontend envía POST a `/api/reservations`
2. **Backend guarda en PostgreSQL** → Valida horarios y guarda en AWS RDS
3. **Backend envía a cola RabbitMQ** → Publica tarea de email en cola `email_tasks`
4. **Worker escucha cola** → Recibe mensaje de forma asíncrona
5. **Worker envía email** → Conecta a Gmail SMTP y envía confirmación
6. **Usuario recibe email** → "Tu reserva #123 ha sido confirmada"

**Ventajas:**
- ✅ Respuesta instantánea al usuario (no espera envío de email)
- ✅ Reintentos automáticos si falla el envío
- ✅ Escalable (múltiples workers si es necesario)
- ✅ Logs centralizados de emails enviados

---

## 🐛 Solución de Problemas

### Error: "No module named 'psycopg2'"
```powershell
pip install psycopg2-binary
```

### Error: "Could not connect to RabbitMQ"
- Verificar que Docker/RabbitMQ esté corriendo
- Verificar RABBITMQ_URL en .env
- Si usas Docker: `docker ps` (debe aparecer rabbitmq)

### Error: "535 authentication failed" (Gmail)
- Necesitas App Password de Gmail
- Verificar que 2FA esté habilitado
- Crear nueva App Password en https://myaccount.google.com/apppasswords

### Error: "connection refused" (PostgreSQL)
- Verificar que la IP esté autorizada en AWS RDS Security Group
- Verificar credenciales en DATABASE_URL
- Verificar que la base de datos exista

---

## 📦 Scripts Disponibles

```powershell
# Iniciar backend
python main.py

# Iniciar worker de emails
python utils/email_worker.py

# Poblar base de datos
python scripts/seed.py

# Diagnóstico completo
python scripts/diagnostics.py

# Ayudantes de Windows
start.bat          # Inicia backend
start_worker.bat   # Inicia worker
seed.bat           # Ejecuta seed
```

---

## 📝 Siguiente Pasos

1. **Proporcionarme la contraseña de PostgreSQL**
2. **Elegir e instalar RabbitMQ (Docker recomendado)**
3. **Opcional: Crear App Password de Gmail**
4. Seguir los pasos de configuración
5. ¡Probar el sistema completo!

**¿Tienes la contraseña de PostgreSQL y qué opción prefieres para RabbitMQ?**
