from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas, ml_models

router = APIRouter()

# Distances between Indian destinations for demo routing (mocked matrices)
MOCK_DISTANCES = {
    ("Goa", "Kerala Backwaters"): 650.0,
    ("Goa", "Visakhapatnam"): 820.0,
    ("Goa", "Ooty"): 780.0,
    ("Araku Valley", "Visakhapatnam"): 110.0,
    ("Araku Valley", "Ooty"): 950.0,
    ("Visakhapatnam", "Araku Valley"): 110.0,
    ("Visakhapatnam", "Goa"): 820.0,
    ("Tirupati", "Vijayawada"): 350.0,
    ("Tirupati", "Mysuru"): 420.0,
    ("Tirupati", "Araku Valley"): 620.0,
    ("Vijayawada", "Tirupati"): 350.0,
    ("Vijayawada", "Visakhapatnam"): 340.0,
    ("Ooty", "Mysuru"): 125.0,
    ("Ooty", "Kerala Backwaters"): 280.0,
    ("Ooty", "Araku Valley"): 950.0,
    ("Mysuru", "Ooty"): 125.0,
    ("Mysuru", "Kerala Backwaters"): 320.0,
    ("Kerala Backwaters", "Ooty"): 280.0,
    ("Kerala Backwaters", "Mysuru"): 320.0,
}

def get_demo_distance(name_a: str, name_b: str) -> float:
    if name_a == name_b:
        return 0.0
    # Lookup in mock dictionary or generate based on random seed for mock scalability
    dist = MOCK_DISTANCES.get((name_a, name_b)) or MOCK_DISTANCES.get((name_b, name_a))
    if dist is None:
        # Pseudo-distance based on coordinates
        dist = 250.0 # fallback average
    return dist

@router.get("/alternatives", response_model=List[schemas.AlternativeDestinationOut])
def get_alternatives(destination_id: int, db: Session = Depends(get_db)):
    destination = db.query(models.Destination).filter(models.Destination.id == destination_id).first()
    if not destination:
        raise HTTPException(status_code=404, detail="Primary destination not found")
        
    # Get other destinations
    alternatives = db.query(models.Destination).filter(models.Destination.id != destination_id).all()
    
    scored_alternatives = []
    for alt in alternatives:
        dist_km = get_demo_distance(destination.name, alt.name)
        score_breakdown = ml_models.DestinationRecommendationService.calculate_alternative_score(
            destination, alt, dist_km
        )
        scored_alternatives.append(score_breakdown)
        
    # Sort by final score descending, return top 3
    scored_alternatives.sort(key=lambda x: x["final_score"], reverse=True)
    return scored_alternatives[:3]
