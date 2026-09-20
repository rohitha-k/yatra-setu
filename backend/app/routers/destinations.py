from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas, ml_models

router = APIRouter()

@router.get("/", response_model=List[schemas.DestinationOut])
def get_destinations(db: Session = Depends(get_db)):
    return db.query(models.Destination).all()

@router.get("/{id}", response_model=schemas.DestinationDetailOut)
def get_destination_detail(id: int, db: Session = Depends(get_db)):
    destination = db.query(models.Destination).filter(models.Destination.id == id).first()
    if not destination:
        raise HTTPException(status_code=404, detail="Destination not found")
        
    # Get attractions
    attractions = db.query(models.Attraction).filter(models.Attraction.destination_id == id).all()
    
    # Get sustainability metrics
    sustainability_metric = db.query(models.SustainabilityMetric).filter(
        models.SustainabilityMetric.destination_id == id
    ).order_by(models.SustainabilityMetric.date.desc()).first()
    
    # Get reviews
    reviews = db.query(models.Review).filter(models.Review.destination_id == id).all()
    
    # Calculate Tourism Impact Score (TIS)
    tis_data = ml_models.TourismImpactService.calculate_tis(destination, sustainability_metric, reviews)
    
    # Local business count & utilization
    businesses = db.query(models.Business).filter(models.Business.destination_id == id).all()
    biz_utilization = 50 # baseline
    if businesses:
        total_cap = sum(b.capacity for b in businesses)
        total_util = sum(b.current_utilization for b in businesses)
        if total_cap > 0:
            biz_utilization = int((total_util / total_cap) * 100)
            
    # Format detailed response
    avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 4.0
    
    return {
        "id": destination.id,
        "name": destination.name,
        "description": destination.description,
        "latitude": destination.latitude,
        "longitude": destination.longitude,
        "category": destination.category,
        "safe_capacity": destination.safe_capacity,
        "current_tourists": destination.current_tourists,
        "image_url": destination.image_url,
        "tis_score": tis_data["overall_tis"],
        "sustainability_score": tis_data["sustainability"],
        "tourist_satisfaction": round(avg_rating, 2),
        "local_business_activity_score": biz_utilization,
        "attractions": attractions
    }
