from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
import datetime

from ..database import get_db
from .. import models, schemas, auth, ml_models
from .recommendations import get_demo_distance

router = APIRouter()

@router.post("/generate", response_model=schemas.ItineraryOut)
def generate_itinerary(
    req: schemas.ItineraryRequest, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    destination = db.query(models.Destination).filter(models.Destination.id == req.destination_id).first()
    if not destination:
        raise HTTPException(status_code=404, detail="Destination not found")
        
    # Get alternatives (simulated logic)
    alternatives = db.query(models.Destination).filter(models.Destination.id != req.destination_id).all()
    scored_alts = []
    for alt in alternatives:
        # standard lookup
        dist = get_demo_distance(destination.name, alt.name)
        score_breakdown = ml_models.DestinationRecommendationService.calculate_alternative_score(
            destination, alt, dist
        )
        scored_alts.append(score_breakdown)
    scored_alts.sort(key=lambda x: x["final_score"], reverse=True)
    
    # Call planner
    itinerary_data = ml_models.AITravelPlannerService.generate_distributed_itinerary(
        destination=destination,
        alternative_recommendations=scored_alts,
        duration_days=req.duration_days,
        budget=req.budget,
        interests_list=req.interests,
        travel_style=req.travel_style,
        crowd_pref=req.crowd_preference
    )
    
    # Save to Database
    db_itinerary = models.Itinerary(
        user_id=current_user.id,
        destination_id=req.destination_id,
        start_date=datetime.date.today(), # placeholder
        end_date=datetime.date.today() + datetime.timedelta(days=req.duration_days),
        budget=req.budget,
        guests=req.guests,
        interests=",".join(req.interests),
        travel_style=req.travel_style,
        crowd_preference=req.crowd_preference,
        generated_content=json.dumps(itinerary_data)
    )
    db.add(db_itinerary)
    db.commit()
    
    return itinerary_data
