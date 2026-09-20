from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas, ml_models

router = APIRouter()

@router.get("/twin", response_model=schemas.SimulationOut)
def simulate_twin(destination_id: int, load_increase_pct: float, db: Session = Depends(get_db)):
    destination = db.query(models.Destination).filter(models.Destination.id == destination_id).first()
    if not destination:
        raise HTTPException(status_code=404, detail="Destination not found")
        
    # Get sustainability metrics for base stats
    sustainability_metric = db.query(models.SustainabilityMetric).filter(
        models.SustainabilityMetric.destination_id == destination_id
    ).order_by(models.SustainabilityMetric.date.desc()).first()
    
    # Get base businesses to check occupancy capacity
    businesses = db.query(models.Business).filter(models.Business.destination_id == destination_id).all()
    
    # Run simulation
    simulation_results = ml_models.SimulationService.run_twin_scenario(
        destination, sustainability_metric, businesses, load_increase_pct
    )
    
    return simulation_results
