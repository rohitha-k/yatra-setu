from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from .. import models, schemas, auth, ml_models

router = APIRouter()

@router.get("/dashboard", response_model=schemas.BusinessDashboardData)
def get_business_dashboard(
    business_id: Optional[int] = None, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.RoleChecker(["BUSINESS", "ADMIN"]))
):
    # If no business_id is passed, fetch the first business owned by the user
    if business_id is None:
        business = db.query(models.Business).filter(models.Business.user_id == current_user.id).first()
        if not business:
            # Seed a default dummy business for this user if they don't have one
            # to prevent dashboard empty states during testing
            default_dest = db.query(models.Destination).first()
            business = models.Business(
                name=f"{current_user.username.capitalize()}'s Cozy Homestay",
                type="HOMESTAY",
                description="A beautiful homestay managed with care.",
                destination_id=default_dest.id if default_dest else 1,
                user_id=current_user.id,
                capacity=15,
                current_utilization=10,
                rating=4.6,
                price_range="Medium"
            )
            db.add(business)
            db.commit()
            db.refresh(business)
    else:
        business = db.query(models.Business).filter(models.Business.id == business_id).first()
        
    if not business:
        raise HTTPException(status_code=404, detail="No business listing found")

    # Fetch reviews for the business
    reviews = db.query(models.Review).filter(models.Review.business_id == business.id).all()
    
    # Calculate occupancy and revenue
    occupancy_pct = int((business.current_utilization / business.capacity) * 100) if business.capacity else 70
    daily_price = 2500.0 if business.price_range == "Premium" else (1500.0 if business.price_range == "Medium" else 800.0)
    
    # Static revenue calculation for MVP
    base_revenue = business.current_utilization * daily_price * 25 # mock monthly revenue
    
    # Calculate sentiment distribution
    pos_count = sum(1 for r in reviews if r.sentiment == "Positive")
    neu_count = sum(1 for r in reviews if r.sentiment == "Neutral")
    neg_count = sum(1 for r in reviews if r.sentiment == "Negative")
    total = len(reviews) if reviews else 1
    
    # Extraction of complaints based on topic scores
    complaints = []
    wifi_issues = sum(r.topic_wifi for r in reviews)
    cleanliness_issues = sum(1 for r in reviews if r.sentiment == "Negative" and r.topic_cleanliness > 0.3)
    price_issues = sum(r.topic_pricing for r in reviews)
    staff_issues = sum(r.topic_staff for r in reviews)
    
    if wifi_issues > 0.5:
        complaints.append("Weak room Wi-Fi connectivity")
    if cleanliness_issues > 0:
        complaints.append("Cleanliness in bathroom areas")
    if price_issues > 0.5:
        complaints.append("Room service pricing concerns")
    if staff_issues > 0.5:
        complaints.append("Slow restaurant response timings")
        
    if not complaints:
        complaints = ["No significant issues detected by AI NLP engine"]
        
    # Demand prediction context (e.g. +27% growth)
    demand_growth = 27
    predicted_rev = base_revenue * (1 + (demand_growth / 100.0))
    
    # Generate insights
    insights = [
        f"Demand in this sub-region is expected to increase by {demand_growth}% next weekend.",
        f"Staffing recommendations: Maintain {max(2, int(business.capacity * 0.08))} active shifts for optimal traveler satisfaction.",
        "AI Sentiment Tip: Resolving Wi-Fi routers could boost review ratings by 0.4 stars."
    ]

    return {
        "revenue": base_revenue,
        "bookings_count": int(business.current_utilization * 1.8),
        "occupancy_rate_pct": occupancy_pct,
        "demand_forecast_pct": demand_growth,
        "satisfaction_score": business.rating,
        "predicted_revenue": predicted_rev,
        "sentiment_positive_pct": int(pos_count / total * 100) if reviews else 80,
        "sentiment_neutral_pct": int(neu_count / total * 100) if reviews else 15,
        "sentiment_negative_pct": int(neg_count / total * 100) if reviews else 5,
        "top_complaints": complaints,
        "ai_insights": insights
    }

@router.get("/opportunities", response_model=List[schemas.BusinessOpportunityOut])
def get_opportunities(destination_id: int, db: Session = Depends(get_db)):
    destination = db.query(models.Destination).filter(models.Destination.id == destination_id).first()
    if not destination:
        raise HTTPException(status_code=404, detail="Destination not found")
        
    # Get businesses in this destination
    businesses = db.query(models.Business).filter(models.Business.destination_id == destination_id).all()
    
    # Simulated demand growth (e.g., if Goa is +38%, we pass that)
    growth_multiplier = 38.0
    if destination.name == "Araku Valley":
        growth_multiplier = 48.0 # High growth since it receives redirected flow
        
    opportunities = []
    for b in businesses:
        op_data = ml_models.LocalEconomyService.score_business_opportunities(b, growth_multiplier)
        opportunities.append(op_data)
        
    # Sort by opportunity score
    opportunities.sort(key=lambda x: x["opportunity_score"], reverse=True)
    return opportunities
