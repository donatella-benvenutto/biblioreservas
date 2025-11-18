# Guía de Integración Frontend-Backend

## Estado Actual

### ✅ Backend Completo y Funcionando

- **URL del servidor**: http://localhost:8000
- **Documentación interactiva**: http://localhost:8000/docs
- **Base de datos**: SQLite (`biblioreservas.db`)
- **Usuario de prueba**: 
  - ID: 1
  - Email: demo@ejemplo.com
  - Nombre: Usuario Demo

### 📡 Endpoints Disponibles

#### 1. Listar Salas
```
GET http://localhost:8000/api/rooms
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "Sala 101",
    "libraryName": "Biblioteca Central",
    "capacity": 4
  },
  // ... más salas
]
```

#### 2. Crear Reserva
```
POST http://localhost:8000/api/reservations
Content-Type: application/json
```

**Body:**
```json
{
  "userId": 1,
  "roomId": 1,
  "date": "2025-11-20",
  "startTime": "14:00",
  "endTime": "16:00"
}
```

**Respuesta (201 Created):**
```json
{
  "id": 1,
  "room": {
    "id": 1,
    "name": "Sala 101",
    "libraryName": "Biblioteca Central"
  },
  "date": "2025-11-20",
  "startTime": "14:00",
  "endTime": "16:00",
  "emailSent": true
}
```

**Posibles errores:**
- `400 Bad Request`: Datos inválidos (fecha en el pasado, endTime < startTime)
- `404 Not Found`: Usuario o sala no existen
- `409 Conflict`: Ya existe una reserva para esa sala en ese horario
- `500 Internal Server Error`: Error en el servidor

#### 3. Listar Reservas de un Usuario
```
GET http://localhost:8000/api/users/1/reservations
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "room": {
      "id": 1,
      "name": "Sala 101",
      "libraryName": "Biblioteca Central"
    },
    "date": "2025-11-20",
    "startTime": "14:00",
    "endTime": "16:00",
    "emailSent": true
  }
]
```

## 🔗 Integración con el Frontend Next.js

### Paso 1: Crear un cliente API

Crea un archivo `lib/api.ts` en el proyecto frontend:

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Room {
  id: number;
  name: string;
  libraryName: string;
  capacity: number;
}

export interface ReservationCreate {
  userId: number;
  roomId: number;
  date: string; // formato: "YYYY-MM-DD"
  startTime: string; // formato: "HH:MM"
  endTime: string; // formato: "HH:MM"
}

export interface Reservation {
  id: number;
  room: {
    id: number;
    name: string;
    libraryName: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  emailSent: boolean;
}

// Listar todas las salas
export async function getRooms(): Promise<Room[]> {
  const response = await fetch(`${API_BASE_URL}/api/rooms`);
  if (!response.ok) {
    throw new Error('Error al obtener las salas');
  }
  return response.json();
}

// Crear una reserva
export async function createReservation(data: ReservationCreate): Promise<Reservation> {
  const response = await fetch(`${API_BASE_URL}/api/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al crear la reserva');
  }
  
  return response.json();
}

// Listar reservas de un usuario
export async function getUserReservations(userId: number): Promise<Reservation[]> {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/reservations`);
  if (!response.ok) {
    throw new Error('Error al obtener las reservas');
  }
  return response.json();
}
```

### Paso 2: Usar en los componentes

#### En `app/search/page.tsx`:

```typescript
"use client"

import { useState, useEffect } from "react"
import { getRooms, createReservation } from "@/lib/api"
import type { Room } from "@/lib/api"

export default function SearchPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRooms() {
      try {
        const data = await getRooms()
        setRooms(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRooms()
  }, [])

  const handleReserve = async (roomId: number, date: Date, timeSlot: string) => {
    try {
      const [startTime, endTime] = timeSlot.split('-')
      
      const reservation = await createReservation({
        userId: 1, // TODO: Obtener del usuario logueado
        roomId,
        date: date.toISOString().split('T')[0], // "YYYY-MM-DD"
        startTime: startTime.trim(),
        endTime: endTime.trim(),
      })
      
      alert(`Reserva creada exitosamente! ID: ${reservation.id}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al crear la reserva')
    }
  }

  // ... resto del componente
}
```

#### En `app/reservations/page.tsx`:

```typescript
"use client"

import { useState, useEffect } from "react"
import { getUserReservations } from "@/lib/api"
import type { Reservation } from "@/lib/api"

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReservations() {
      try {
        const data = await getUserReservations(1) // TODO: ID del usuario logueado
        setReservations(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchReservations()
  }, [])

  // ... resto del componente
}
```

### Paso 3: Variables de entorno

Crea un archivo `.env.local` en el proyecto frontend:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🧪 Probar la API con curl

### Listar salas:
```bash
curl http://localhost:8000/api/rooms
```

### Crear una reserva:
```bash
curl -X POST http://localhost:8000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "roomId": 1,
    "date": "2025-11-20",
    "startTime": "14:00",
    "endTime": "16:00"
  }'
```

### Listar reservas del usuario:
```bash
curl http://localhost:8000/api/users/1/reservations
```

## 📧 Configuración de Email (Opcional)

Para que funcione el envío de emails de confirmación:

1. Edita el archivo `.env` en el backend
2. Configura tus credenciales SMTP de Gmail:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu-email@gmail.com
SMTP_PASSWORD=tu-password-de-aplicacion
SMTP_FROM_EMAIL=tu-email@gmail.com
SMTP_FROM_NAME=BiblioReservas
```

**Para Gmail:**
1. Ve a https://myaccount.google.com/security
2. Activa "Verificación en 2 pasos"
3. Ve a https://myaccount.google.com/apppasswords
4. Genera una "Contraseña de aplicación" para "Correo"
5. Usa esa contraseña en `SMTP_PASSWORD`

**Nota:** Si no configuras el email, las reservas igual se guardan, solo que `emailSent` será `false`.

## 🔍 Documentación Interactiva

Abre http://localhost:8000/docs para ver la documentación interactiva de Swagger donde puedes:
- Ver todos los endpoints
- Probar las peticiones directamente
- Ver los esquemas de datos
- Ver ejemplos de respuestas y errores

## ✅ Checklist de Integración

- [ ] Backend corriendo en http://localhost:8000
- [ ] Frontend corriendo en http://localhost:3000
- [ ] Crear `lib/api.ts` con las funciones de API
- [ ] Crear `.env.local` con `NEXT_PUBLIC_API_URL`
- [ ] Modificar `app/search/page.tsx` para usar `getRooms()` y `createReservation()`
- [ ] Modificar `app/reservations/page.tsx` para usar `getUserReservations()`
- [ ] Probar crear una reserva desde el frontend
- [ ] Verificar que aparezca en "Mis Reservas"
- [ ] (Opcional) Configurar SMTP para emails

## 🐛 Troubleshooting

### Error CORS
Si ves errores de CORS en la consola del navegador, verifica que el frontend esté corriendo en `http://localhost:3000` (configurado en el backend).

### Base de datos bloqueada
Si obtienes error de "database is locked", cierra todos los procesos que puedan estar usando la base de datos y vuelve a iniciar el servidor.

### Email no se envía
Es normal. El email solo funcionará si configuras las credenciales SMTP. La reserva igual se guarda exitosamente.
