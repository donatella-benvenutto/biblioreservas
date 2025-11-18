"""
Sistema de colas con RabbitMQ para emails asíncronos.

Este módulo maneja la cola de mensajes para enviar emails de forma asíncrona.
Cuando se crea una reserva, en lugar de enviar el email inmediatamente (bloqueando),
se publica un mensaje en RabbitMQ y un worker independiente lo procesa.
"""

import pika
import json
import os
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)


def get_rabbitmq_connection():
    """
    Crea y retorna una conexión a RabbitMQ.
    
    Intenta usar RABBITMQ_URL primero (para CloudAMQP u otros servicios),
    si no existe, usa los parámetros individuales.
    """
    rabbitmq_url = os.getenv("RABBITMQ_URL")
    
    if rabbitmq_url:
        # Usar URL completa (útil para CloudAMQP, AWS MQ, etc.)
        parameters = pika.URLParameters(rabbitmq_url)
    else:
        # Usar parámetros individuales
        parameters = pika.ConnectionParameters(
            host=os.getenv("RABBITMQ_HOST", "localhost"),
            port=int(os.getenv("RABBITMQ_PORT", 5672)),
            virtual_host=os.getenv("RABBITMQ_VHOST", "/"),
            credentials=pika.PlainCredentials(
                os.getenv("RABBITMQ_USER", "guest"),
                os.getenv("RABBITMQ_PASSWORD", "guest")
            )
        )
    
    return pika.BlockingConnection(parameters)


def publish_email_task(email_data: dict):
    """
    Publica una tarea de envío de email en la cola de RabbitMQ.
    
    Esta función se llama después de crear una reserva exitosamente.
    En lugar de enviar el email inmediatamente, lo encola para que
    un worker lo procese de forma asíncrona.
    
    Args:
        email_data (dict): Diccionario con los datos del email:
            - user_email: str
            - user_name: str
            - room_name: str
            - library_name: str
            - reservation_date: str (ISO format)
            - start_time: str
            - end_time: str
            - reservation_id: int
    
    Returns:
        bool: True si se publicó exitosamente, False si falló
    """
    queue_name = os.getenv("EMAIL_QUEUE_NAME", "email_notifications")
    
    try:
        # Conectar a RabbitMQ
        connection = get_rabbitmq_connection()
        channel = connection.channel()
        
        # Declarar la cola (se crea si no existe)
        # durable=True asegura que la cola sobreviva reinicios del servidor
        channel.queue_declare(queue=queue_name, durable=True)
        
        # Serializar los datos a JSON
        message = json.dumps(email_data)
        
        # Publicar el mensaje
        # delivery_mode=2 hace que el mensaje sea persistente
        channel.basic_publish(
            exchange='',
            routing_key=queue_name,
            body=message,
            properties=pika.BasicProperties(
                delivery_mode=2,  # Mensaje persistente
                content_type='application/json'
            )
        )
        
        logger.info(f"Email task published to queue: {queue_name}")
        connection.close()
        return True
        
    except Exception as e:
        logger.error(f"Error publishing email task to RabbitMQ: {str(e)}")
        return False


def check_rabbitmq_connection():
    """
    Verifica si RabbitMQ está disponible y accesible.
    
    Returns:
        bool: True si la conexión es exitosa, False si falla
    """
    try:
        connection = get_rabbitmq_connection()
        connection.close()
        return True
    except Exception as e:
        logger.warning(f"RabbitMQ connection check failed: {str(e)}")
        return False
