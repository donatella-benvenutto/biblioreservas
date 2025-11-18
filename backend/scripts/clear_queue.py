"""
Script para limpiar la cola de RabbitMQ
"""
import pika
import os
from dotenv import load_dotenv

load_dotenv()

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")

try:
    # Conectar a RabbitMQ
    connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
    channel = connection.channel()
    
    # Purgar (limpiar) la cola
    channel.queue_purge('email_notifications')
    
    print("✅ Cola 'email_notifications' limpiada exitosamente")
    
    connection.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
