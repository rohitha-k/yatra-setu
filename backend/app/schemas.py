from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import datetime

# --- AUTH SCHEMAS ---
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str # TOURIST, BUSINESS, AUTHORITY, ADMIN

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- DESTINATION SCHEMAS ---
class AttractionOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    capacity: int
    rating: float
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

class DestinationOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    category: Optional[str] = None
    safe_capacity: int
    current_tourists: int
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

class DestinationDetailOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    category: Optional[str] = None
    safe_capacity: int
    current_tourists: int
    image_url: Optional[str] = None
    tis_score: int
    sustainability_score: int
    tourist_satisfaction: float
    local_business_activity_score: int
    attractions: List[AttractionOut]

    class Config:
        from_attributes = True

# --- RECOMMENDATION SCHEMAS ---
class AlternativeDestinationOut(BaseModel):
    destination_id: int
    name: str
    distance_km: float
    final_score: int
    similarity_score: int
    capacity_availability_score: int
    crowd_reduction_score: int
    cost_advantage_score: int
    sustainability_score: int
    reasoning: str

# --- ITINERARY SCHEMAS ---
class ItineraryRequest(BaseModel):
    destination_id: int
    duration_days: int
    budget: float
    guests: int
    interests: List[str]
    travel_style: str # Leisure, Adventure, Budget, Luxury
    crowd_preference: str # Low, Moderate, High

class ItineraryDay(BaseModel):
    day: int
    location: str
    morning: str
    afternoon: str
    evening: str
    sustainability_tips: str

class ItineraryOut(BaseModel):
    destination_name: str
    alternative_used: Optional[str] = None
    duration_days: int
    crowd_reduction_pct: int
    sustainability_score: int
    budget_breakdown: Dict[str, int]
    itinerary_days: List[ItineraryDay]

# --- BUSINESS SCHEMAS ---
class BusinessOut(BaseModel):
    id: int
    name: str
    type: str
    description: Optional[str] = None
    capacity: int
    current_utilization: int
    rating: float
    price_range: str

    class Config:
        from_attributes = True

class BusinessOpportunityOut(BaseModel):
    business_id: int
    name: str
    type: str
    opportunity_score: int
    recommended_action: str

class BusinessDashboardData(BaseModel):
    revenue: float
    bookings_count: int
    occupancy_rate_pct: int
    demand_forecast_pct: int
    satisfaction_score: float
    predicted_revenue: float
    sentiment_positive_pct: int
    sentiment_neutral_pct: int
    sentiment_negative_pct: int
    top_complaints: List[str]
    ai_insights: List[str]

# --- REVIEW SCHEMAS ---
class ReviewOut(BaseModel):
    id: int
    text: str
    rating: int
    sentiment: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- SIMULATION SCHEMAS ---
class SimulationRequest(BaseModel):
    load_increase_pct: float

class SimulationMetricState(BaseModel):
    crowding: int
    hotel_occupancy: int
    traffic_pressure: str
    environmental_pressure: str
    tourist_satisfaction: Optional[int] = None

class SimulationOut(BaseModel):
    load_increase_pct: float
    metrics_before: SimulationMetricState
    metrics_after: SimulationMetricState
    redistribution_needed: int
    ai_advice: str

# --- FORECAST SCHEMAS ---
class DemandForecastPoint(BaseModel):
    date: str
    visitor_count: int
    predicted_visitor_count: int

class ForecastOut(BaseModel):
    forecast_7_day: List[Dict[str, Any]]
    growth_rate_pct: int

# --- ALERT SCHEMAS ---
class AlertOut(BaseModel):
    id: int
    type: str
    message: str
    severity: str
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True
