from pydantic import BaseModel, EmailStr, Field, validator
from datetime import date, time, datetime
from typing import Optional


# ============ USER SCHEMAS ============

class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============ ROOM SCHEMAS ============

class RoomBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    library_name: str = Field(..., alias="libraryName")
    capacity: int = Field(..., gt=0)


class RoomCreate(RoomBase):
    pass


class RoomResponse(RoomBase):
    id: int

    class Config:
        from_attributes = True
        populate_by_name = True


# ============ RESERVATION SCHEMAS ============

class ReservationCreate(BaseModel):
    user_id: int = Field(..., alias="userId", gt=0)
    room_id: int = Field(..., alias="roomId", gt=0)
    date: date
    start_time: time = Field(..., alias="startTime")
    end_time: time = Field(..., alias="endTime")

    @validator('end_time')
    def end_time_after_start_time(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time debe ser posterior a start_time')
        return v

    @validator('date')
    def date_not_in_past(cls, v):
        if v < date.today():
            raise ValueError('No se pueden hacer reservas en fechas pasadas')
        return v

    class Config:
        populate_by_name = True


class ReservationRoomInfo(BaseModel):
    """Información de la sala dentro de una reserva"""
    id: int
    name: str
    library_name: str = Field(..., alias="libraryName")

    class Config:
        from_attributes = True
        populate_by_name = True


class ReservationResponse(BaseModel):
    id: int
    room: ReservationRoomInfo
    date: date
    start_time: time = Field(..., alias="startTime")
    end_time: time = Field(..., alias="endTime")
    email_sent: bool = Field(default=True, alias="emailSent")

    class Config:
        from_attributes = True
        populate_by_name = True


# ============ ERROR SCHEMAS ============

class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
