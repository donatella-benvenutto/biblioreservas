from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
import logging
import os

from database import get_db
from database.models import Reservation, User, Room
from schemas import ReservationCreate, ReservationResponse, ReservationRoomInfo
from utils.email_service import send_reservation_confirmation_email
from utils.rabbitmq import publish_email_task, check_rabbitmq_connection

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Verificar si RabbitMQ está habilitado
EMAIL_QUEUE_ENABLED = os.getenv("EMAIL_QUEUE_ENABLED", "false").lower() == "true"

router = APIRouter(prefix="/api", tags=["reservations"])


@router.post("/reservations", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
def create_reservation(
    reservation_data: ReservationCreate,
    db: Session = Depends(get_db)
):
    """
    Crear una nueva reserva de sala.
    
    Valida que:
    - El usuario exista
    - La sala exista
    - No haya conflictos de horario para esa sala
    
    Después de crear la reserva, envía un email de confirmación.
    
    Args:
        reservation_data: Datos de la reserva (userId, roomId, date, startTime, endTime)
        
    Returns:
        ReservationResponse: Datos de la reserva creada
        
    Raises:
        400: Si los datos son inválidos
        404: Si el usuario o sala no existen
        409: Si hay un conflicto de horario
        500: Si hay un error en el servidor
    """
    
    # Validar que el usuario existe
    user = db.query(User).filter(User.id == reservation_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {reservation_data.user_id} no encontrado"
        )
    
    # Validar que la sala existe
    room = db.query(Room).filter(Room.id == reservation_data.room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sala con ID {reservation_data.room_id} no encontrada"
        )
    
    # Crear la reserva
    new_reservation = Reservation(
        user_id=reservation_data.user_id,
        room_id=reservation_data.room_id,
        date=reservation_data.date,
        start_time=reservation_data.start_time,
        end_time=reservation_data.end_time
    )
    
    try:
        db.add(new_reservation)
        db.commit()
        db.refresh(new_reservation)
        
        logger.info(f"Reserva creada exitosamente: ID {new_reservation.id}")
        
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Error de integridad al crear reserva: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una reserva para esta sala en el horario seleccionado"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error inesperado al crear reserva: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al crear la reserva"
        )
    
    # Enviar email de confirmación
    email_sent = False
    
    if EMAIL_QUEUE_ENABLED and check_rabbitmq_connection():
        # Envío asíncrono con RabbitMQ
        try:
            email_data = {
                'user_email': user.email,
                'user_name': user.name,
                'room_name': room.name,
                'library_name': room.library_name,
                'reservation_date': new_reservation.date.isoformat(),
                'start_time': new_reservation.start_time.isoformat(),
                'end_time': new_reservation.end_time.isoformat(),
                'reservation_id': new_reservation.id
            }
            
            if publish_email_task(email_data):
                email_sent = True
                logger.info(f"Email task enqueued in RabbitMQ for reservation #{new_reservation.id}")
            else:
                logger.warning("Failed to enqueue email task, falling back to direct send")
                # Fallback: enviar directo si falla la cola
                send_reservation_confirmation_email(
                    user_email=user.email,
                    user_name=user.name,
                    room_name=room.name,
                    library_name=room.library_name,
                    reservation_date=new_reservation.date,
                    start_time=new_reservation.start_time,
                    end_time=new_reservation.end_time,
                    reservation_id=new_reservation.id
                )
                email_sent = True
        except Exception as e:
            logger.error(f"Error with email queue, trying direct send: {str(e)}")
            try:
                # Fallback: enviar directo
                send_reservation_confirmation_email(
                    user_email=user.email,
                    user_name=user.name,
                    room_name=room.name,
                    library_name=room.library_name,
                    reservation_date=new_reservation.date,
                    start_time=new_reservation.start_time,
                    end_time=new_reservation.end_time,
                    reservation_id=new_reservation.id
                )
                email_sent = True
            except:
                email_sent = False
    else:
        # Envío síncrono tradicional (sin RabbitMQ)
        try:
            send_reservation_confirmation_email(
                user_email=user.email,
                user_name=user.name,
                room_name=room.name,
                library_name=room.library_name,
                reservation_date=new_reservation.date,
                start_time=new_reservation.start_time,
                end_time=new_reservation.end_time,
                reservation_id=new_reservation.id
            )
            email_sent = True
            logger.info(f"Email de confirmación enviado directamente a {user.email}")
        except Exception as e:
            # Si falla el email, la reserva igual queda guardada
            logger.error(f"Error al enviar email de confirmación: {str(e)}")
            email_sent = False
    
    # Preparar respuesta
    response = ReservationResponse(
        id=new_reservation.id,
        room=ReservationRoomInfo(
            id=room.id,
            name=room.name,
            libraryName=room.library_name
        ),
        date=new_reservation.date,
        startTime=new_reservation.start_time,
        endTime=new_reservation.end_time,
        emailSent=email_sent
    )
    
    return response


@router.get("/users/{user_id}/reservations", response_model=List[ReservationResponse])
def get_user_reservations(user_id: int, db: Session = Depends(get_db)):
    """
    Obtener todas las reservas activas de un usuario.
    
    Args:
        user_id: ID del usuario
        
    Returns:
        List[ReservationResponse]: Lista de reservas del usuario con información de la sala
        
    Raises:
        404: Si el usuario no existe
    """
    
    # Validar que el usuario existe
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {user_id} no encontrado"
        )
    
    # Obtener reservas del usuario con join a Room
    reservations = (
        db.query(Reservation)
        .filter(Reservation.user_id == user_id)
        .join(Room)
        .order_by(Reservation.date.desc(), Reservation.start_time.desc())
        .all()
    )
    
    # Formatear respuesta
    response = []
    for reservation in reservations:
        response.append(
            ReservationResponse(
                id=reservation.id,
                room=ReservationRoomInfo(
                    id=reservation.room.id,
                    name=reservation.room.name,
                    libraryName=reservation.room.library_name
                ),
                date=reservation.date,
                startTime=reservation.start_time,
                endTime=reservation.end_time,
                emailSent=True  # Ya fue enviado al crear
            )
        )
    
    return response
