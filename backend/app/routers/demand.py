from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import datetime
from typing import Dict, Any

from ..database import get_db
from .. import models, schemas, ml_models

router = APIRouter()

@router.get("/forecast", response_model=schemas.ForecastOut)
def get_demand_forecast(destination_id: int, db: Session = Depends(get_db)):
    destination = db.query(models.Destination).filter(models.Destination.id == destination_id).first()
    if not destination:
        raise HTTPException(status_code=404, detail="Destination not found")
        
    # Get historical records (last 60 records)
    historical_records = db.query(models.TourismDemand).filter(
        models.TourismDemand.destination_id == destination_id
    ).order_by(models.TourismDemand.date.desc()).limit(60).all()
    
    # Reverse so it's chronological for the forecaster
    historical_records.reverse()
    
    # Forecast next 7 days
    future_predictions = ml_models.TourismDemandService.forecast_7_day(destination, historical_records)
    
    # Format forecast output
    today = datetime.date.today()
    forecast_points = []
    for i, pred in enumerate(future_predictions):
        future_date = today + datetime.timedelta(days=i+1)
        forecast_points.append({
            "date": future_date.strftime("%Y-%m-%d"),
            "visitor_count": int(pred),
            "predicted_visitor_count": int(pred)
        })
        
    # Calculate historical vs predicted growth rate
    avg_hist = sum(r.visitor_count for r in historical_records[-7:]) / 7 if len(historical_records) >= 7 else 1000
    avg_pred = sum(future_predictions) / 7
    
    growth_rate = int(((avg_pred - avg_hist) / avg_hist) * 100) if avg_hist > 0 else 0
    
    return {
        "forecast_7_day": forecast_points,
        "growth_rate_pct": growth_rate
    }
