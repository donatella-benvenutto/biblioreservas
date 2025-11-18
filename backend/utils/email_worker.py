"""
Worker de RabbitMQ para procesar emails en segundo plano.

Este script debe ejecutarse como un proceso independiente que escucha
mensajes de la cola de RabbitMQ y envía los emails correspondientes.

Para ejecutar:
    python utils/email_worker.py

El worker estará corriendo continuamente, procesando emails a medida
que lleguen a la cola.
"""

import pika
import json
import sys
import os
import logging
from datetime import datetime, date, time

# Añadir el directorio raíz al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils.rabbitmq import get_rabbitmq_connection
from utils.email_service import send_reservation_confirmation_email
from dotenv import load_dotenv

load_dotenv()

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def parse_date(date_str: str) -> date:
    """Parsea una fecha en formato ISO"""
    return datetime.fromisoformat(date_str).date()


def parse_time(time_str: str) -> time:
    """Parsea una hora en formato HH:MM o HH:MM:SS"""
    if 'T' in time_str:  # Si viene como datetime completo
        return datetime.fromisoformat(time_str).time()
    # Manejar formato HH:MM o HH:MM:SS
    parts = time_str.split(':')
    hour = int(parts[0])
    minute = int(parts[1])
    second = int(parts[2]) if len(parts) > 2 else 0
    return time(hour, minute, second)


def process_email_task(ch, method, properties, body):
    """
    Callback que procesa cada mensaje de la cola.
    
    Esta función se ejecuta cada vez que llega un mensaje a la cola.
    Intenta enviar el email y confirma (ACK) el mensaje si es exitoso.
    """
    try:
        # Parsear el mensaje JSON
        email_data = json.loads(body)
        
        logger.info(f"Processing email task for reservation #{email_data.get('reservation_id')}")
        
        # Convertir strings a objetos date/time
        reservation_date = parse_date(email_data['reservation_date'])
        start_time = parse_time(email_data['start_time'])
        end_time = parse_time(email_data['end_time'])
        
        # Enviar el email
        send_reservation_confirmation_email(
            user_email=email_data['user_email'],
            user_name=email_data['user_name'],
            room_name=email_data['room_name'],
            library_name=email_data['library_name'],
            reservation_date=reservation_date,
            start_time=start_time,
            end_time=end_time,
            reservation_id=email_data['reservation_id']
        )
        
        logger.info(f"Email sent successfully for reservation #{email_data['reservation_id']}")
        
        # Confirmar el mensaje (ACK)
        # Esto le dice a RabbitMQ que el mensaje fue procesado correctamente
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except Exception as e:
        logger.error(f"Error processing email task: {str(e)}")
        
        # Rechazar el mensaje y reencolarlo
        # Si el email falla, se puede reintentar
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


def start_email_worker():
    """
    Inicia el worker que escucha la cola de emails.
    
    Este proceso se mantiene corriendo y procesa emails a medida que
    llegan a la cola de RabbitMQ.
    """
    queue_name = os.getenv("EMAIL_QUEUE_NAME", "email_notifications")
    
    logger.info("=" * 60)
    logger.info("📧 Email Worker - RabbitMQ Consumer")
    logger.info("=" * 60)
    logger.info(f"Queue: {queue_name}")
    logger.info(f"RabbitMQ Host: {os.getenv('RABBITMQ_HOST', 'localhost')}")
    logger.info("Waiting for email tasks...")
    logger.info("Press CTRL+C to exit")
    logger.info("=" * 60)
    
    try:
        # Conectar a RabbitMQ
        connection = get_rabbitmq_connection()
        channel = connection.channel()
        
        # Declarar la cola (debe coincidir con la del publisher)
        channel.queue_declare(queue=queue_name, durable=True)
        
        # Configurar prefetch: solo procesar 1 mensaje a la vez
        # Esto asegura distribución equitativa entre workers
        channel.basic_qos(prefetch_count=1)
        
        # Configurar el consumer
        channel.basic_consume(
            queue=queue_name,
            on_message_callback=process_email_task,
            auto_ack=False  # Confirmación manual después de procesar
        )
        
        # Empezar a consumir mensajes (bloquea aquí)
        channel.start_consuming()
        
    except KeyboardInterrupt:
        logger.info("\n\n🛑 Worker stopped by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"❌ Worker error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    start_email_worker()
