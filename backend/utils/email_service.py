import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import date, time
import os
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)


def send_reservation_confirmation_email(
    user_email: str,
    user_name: str,
    room_name: str,
    library_name: str,
    reservation_date: date,
    start_time: time,
    end_time: time,
    reservation_id: int
):
    """
    Envía un email de confirmación de reserva al usuario.
    
    La configuración SMTP debe estar en variables de entorno:
    - SMTP_HOST
    - SMTP_PORT
    - SMTP_USERNAME
    - SMTP_PASSWORD
    - SMTP_FROM_EMAIL
    - SMTP_FROM_NAME
    
    Args:
        user_email: Email del usuario
        user_name: Nombre del usuario
        room_name: Nombre de la sala
        library_name: Nombre de la biblioteca
        reservation_date: Fecha de la reserva
        start_time: Hora de inicio
        end_time: Hora de fin
        reservation_id: ID de la reserva
        
    Raises:
        Exception: Si falla el envío del email
    """
    
    # Obtener configuración de SMTP desde variables de entorno
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM_EMAIL")
    from_name = os.getenv("SMTP_FROM_NAME", "BiblioReservas")
    
    # Validar que existan las variables de entorno
    if not all([smtp_host, smtp_username, smtp_password, from_email]):
        logger.warning("Configuración SMTP incompleta. Email no enviado.")
        raise Exception("Configuración SMTP no disponible")
    
    # Formatear fecha y hora para el email
    formatted_date = reservation_date.strftime("%d/%m/%Y")
    formatted_start = start_time.strftime("%H:%M")
    formatted_end = end_time.strftime("%H:%M")
    
    # Crear el mensaje
    message = MIMEMultipart("alternative")
    message["Subject"] = "Confirmación de Reserva de Sala - BiblioReservas"
    message["From"] = f"{from_name} <{from_email}>"
    message["To"] = user_email
    
    # Contenido en texto plano
    text_content = f"""
Hola {user_name},

Tu reserva ha sido confirmada exitosamente.

DETALLES DE LA RESERVA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID de Reserva: #{reservation_id}
Biblioteca: {library_name}
Sala: {room_name}
Fecha: {formatted_date}
Horario: {formatted_start} - {formatted_end}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Por favor, llega puntualmente a tu reserva.

Si necesitas cancelar tu reserva, puedes hacerlo desde la sección "Mis Reservas" en la plataforma.

Gracias por usar BiblioReservas.

Saludos,
El equipo de BiblioReservas
"""
    
    # Contenido en HTML
    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }}
        .details-box {{ background-color: white; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb; border-radius: 4px; }}
        .detail-row {{ padding: 8px 0; border-bottom: 1px solid #e5e7eb; }}
        .detail-row:last-child {{ border-bottom: none; }}
        .label {{ font-weight: bold; color: #374151; }}
        .value {{ color: #1f2937; }}
        .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ Reserva Confirmada</h1>
        </div>
        <div class="content">
            <p>Hola <strong>{user_name}</strong>,</p>
            <p>Tu reserva ha sido confirmada exitosamente.</p>
            
            <div class="details-box">
                <h3 style="margin-top: 0; color: #2563eb;">Detalles de la Reserva</h3>
                <div class="detail-row">
                    <span class="label">ID de Reserva:</span>
                    <span class="value">#{reservation_id}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Biblioteca:</span>
                    <span class="value">{library_name}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Sala:</span>
                    <span class="value">{room_name}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Fecha:</span>
                    <span class="value">{formatted_date}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Horario:</span>
                    <span class="value">{formatted_start} - {formatted_end}</span>
                </div>
            </div>
            
            <p>Por favor, llega puntualmente a tu reserva.</p>
            <p>Si necesitas cancelar tu reserva, puedes hacerlo desde la sección <strong>"Mis Reservas"</strong> en la plataforma.</p>
            
            <p style="margin-top: 30px;">Gracias por usar BiblioReservas.</p>
        </div>
        <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>&copy; 2025 BiblioReservas - Sistema de Reservas de Salas</p>
        </div>
    </div>
</body>
</html>
"""
    
    # Adjuntar ambas versiones del mensaje
    part1 = MIMEText(text_content, "plain")
    part2 = MIMEText(html_content, "html")
    message.attach(part1)
    message.attach(part2)
    
    try:
        # Enviar el email de forma síncrona (para simplificar)
        import smtplib
        
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(message)
            
        logger.info(f"Email enviado exitosamente a {user_email}")
        
    except Exception as e:
        logger.error(f"Error al enviar email: {str(e)}")
        raise Exception(f"Error al enviar email: {str(e)}")
