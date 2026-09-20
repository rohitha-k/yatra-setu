from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.AlertOut])
def get_all_active_alerts(db: Session = Depends(get_db)):
    return db.query(models.Alert).filter(models.Alert.is_active == True).all()

@router.get("/destination/{id}", response_model=List[schemas.AlertOut])
def get_destination_alerts(id: int, db: Session = Depends(get_db)):
    return db.query(models.Alert).filter(
        models.Alert.destination_id == id,
        models.Alert.is_active == True
    ).all()
