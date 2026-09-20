from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ..database import get_db
from .. import models, schemas

router = APIRouter()

@router.get("/summary")
def get_review_sentiment_summary(destination_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(models.Review.destination_id == destination_id).all()
    if not reviews:
        return {
            "positive_pct": 75,
            "neutral_pct": 18,
            "negative_pct": 7,
            "total_count": 0,
            "topics": {
                "cleanliness": 0.8,
                "food": 0.7,
                "staff": 0.9,
                "wifi": 0.4,
                "location": 0.8,
                "safety": 0.9,
                "accessibility": 0.5,
                "pricing": 0.6
            }
        }
        
    pos = sum(1 for r in reviews if r.sentiment == "Positive")
    neu = sum(1 for r in reviews if r.sentiment == "Neutral")
    neg = sum(1 for r in reviews if r.sentiment == "Negative")
    total = len(reviews)
    
    # Calculate topic averages
    topics = {
        "cleanliness": round(sum(r.topic_cleanliness for r in reviews) / total, 2),
        "food": round(sum(r.topic_food for r in reviews) / total, 2),
        "staff": round(sum(r.topic_staff for r in reviews) / total, 2),
        "wifi": round(sum(r.topic_wifi for r in reviews) / total, 2),
        "location": round(sum(r.topic_location for r in reviews) / total, 2),
        "safety": round(sum(r.topic_safety for r in reviews) / total, 2),
        "accessibility": round(sum(r.topic_accessibility for r in reviews) / total, 2),
        "pricing": round(sum(r.topic_pricing for r in reviews) / total, 2),
    }
    
    return {
        "positive_pct": int(pos / total * 100),
        "neutral_pct": int(neu / total * 100),
        "negative_pct": int(neg / total * 100),
        "total_count": total,
        "topics": topics
    }
