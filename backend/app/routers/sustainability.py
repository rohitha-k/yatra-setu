from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import datetime

from ..database import get_db
from .. import models

router = APIRouter()

@router.get("/metrics")
def get_sustainability_metrics(destination_id: int, db: Session = Depends(get_db)):
    metrics = db.query(models.SustainabilityMetric).filter(
        models.SustainabilityMetric.destination_id == destination_id
    ).order_by(models.SustainabilityMetric.date.desc()).first()
    
    if not metrics:
        # Default placeholder if none exists
        return {
            "destination_id": destination_id,
            "crowd_density": 0.5,
            "environmental_pressure": 0.4,
            "public_transport_usage": 0.65,
            "local_business_participation": 0.8,
            "waste_indicator": 12.5,
            "water_indicator": 45.0,
            "renewable_energy_ratio": 0.3,
            "overall_sustainability_score": 75.0,
            "recommendations": [
                "Increase electrical charging slots in regional tourist parking clusters.",
                "Promote public shuttles to decrease particulate emissions by 14%."
            ]
        }
        
    # Standard recommendations based on metrics
    recommendations = []
    if metrics.crowd_density > 0.8:
        recommendations.append("Apply visitor booking caps to slow down environmental strain.")
    if metrics.public_transport_usage < 0.5:
        recommendations.append("Increase public electric bus shuttles to reduce particulate emissions by 18%.")
    if metrics.renewable_energy_ratio < 0.25:
        recommendations.append("Offer business subsidy incentives for solar panels installations.")
        
    if not recommendations:
        recommendations = ["Sustainability metrics are aligned with regional eco-friendly targets."]
        
    return {
        "destination_id": metrics.destination_id,
        "crowd_density": round(metrics.crowd_density, 2),
        "environmental_pressure": round(metrics.environmental_pressure, 2),
        "public_transport_usage": round(metrics.public_transport_usage, 2),
        "local_business_participation": round(metrics.local_business_participation, 2),
        "waste_indicator": round(metrics.waste_indicator, 2),
        "water_indicator": round(metrics.water_indicator, 2),
        "renewable_energy_ratio": round(metrics.renewable_energy_ratio, 2),
        "overall_sustainability_score": int(metrics.overall_sustainability_score),
        "recommendations": recommendations
    }
