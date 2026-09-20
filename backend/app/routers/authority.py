from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ..database import get_db
from .. import models, schemas

router = APIRouter()

@router.get("/dashboard")
def get_authority_dashboard(db: Session = Depends(get_db)):
    destinations = db.query(models.Destination).all()
    
    total_tourists = 0
    high_risk = []
    underutilized = []
    total_capacity = 0
    total_occupancy_ratio_sum = 0
    
    for d in destinations:
        total_tourists += d.current_tourists
        total_capacity += d.safe_capacity
        
        utilization = d.current_tourists / d.safe_capacity if d.safe_capacity else 0
        total_occupancy_ratio_sum += utilization
        
        dest_summary = {
            "id": d.id,
            "name": d.name,
            "category": d.category,
            "current_tourists": d.current_tourists,
            "safe_capacity": d.safe_capacity,
            "utilization_pct": int(utilization * 100)
        }
        
        if utilization >= 0.90:
            high_risk.append(dest_summary)
        elif utilization < 0.40:
            underutilized.append(dest_summary)
            
    # Calculate averages
    count = len(destinations) if destinations else 1
    avg_occupancy = int((total_occupancy_ratio_sum / count) * 100)
    avg_spending = 4500.0 # mock average in INR
    total_revenue = total_tourists * avg_spending
    
    # AI recommendations for flow optimization
    ai_recommendations = [
        "Goa is currently exceeding capacity by 12%. Promote Araku Valley and Ooty to redistribute flow.",
        "Infrastructure alert: Road density in Tirupati region is High. Increase public bus shuttle frequency.",
        "Underutilization opportunity: Araku Valley has 70% available capacity. Launch regional nature-tourism campaigns."
    ]
    
    return {
        "total_tourists_today": total_tourists,
        "total_revenue_today": total_revenue,
        "average_hotel_occupancy_pct": avg_occupancy,
        "average_tourist_spending": avg_spending,
        "high_risk_destinations": high_risk,
        "underutilized_destinations": underutilized,
        "ai_recommendations": ai_recommendations
    }
