from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from database.connection import Base


class User(Base):
    """Modelo de usuario del sistema"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relación con reservas
    reservations = relationship("Reservation", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', email='{self.email}')>"


class Room(Base):
    """Modelo de sala de estudio"""
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    library_name = Column(String(255), nullable=False)  # Nombre de la biblioteca
    capacity = Column(Integer, nullable=False)  # Capacidad de personas

    # Relación con reservas
    reservations = relationship("Reservation", back_populates="room", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Room(id={self.id}, name='{self.name}', library='{self.library_name}', capacity={self.capacity})>"


class Reservation(Base):
    """Modelo de reserva de sala"""
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False, index=True)  # Fecha de la reserva
    start_time = Column(Time, nullable=False)  # Hora de inicio
    end_time = Column(Time, nullable=False)  # Hora de fin
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    user = relationship("User", back_populates="reservations")
    room = relationship("Room", back_populates="reservations")

    # Constraint único para evitar dobles reservas de la misma sala en el mismo horario
    __table_args__ = (
        UniqueConstraint('room_id', 'date', 'start_time', 'end_time', 
                        name='uq_room_datetime'),
    )

    def __repr__(self):
        return f"<Reservation(id={self.id}, room_id={self.room_id}, date={self.date}, time={self.start_time}-{self.end_time})>"
