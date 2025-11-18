from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from database.models import Room
from schemas import RoomResponse

router = APIRouter(prefix="/api", tags=["rooms"])


@router.get("/rooms", response_model=List[RoomResponse])
def get_all_rooms(db: Session = Depends(get_db)):
    """
    Obtener todas las salas disponibles para reservar.
    
    Returns:
        List[RoomResponse]: Lista de todas las salas con su información
    """
    rooms = db.query(Room).all()
    return rooms
