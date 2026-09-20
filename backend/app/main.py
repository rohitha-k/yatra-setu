from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .database import engine, Base
from .seed import seed_db
from .routers import (
    auth, destinations, recommendations, demand, 
    business, reviews, authority, simulation, 
    sustainability, alerts, itineraries
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Run seed check (automatically seeds database if empty on startup)
try:
    seed_db()
except Exception as e:
    print(f"Startup seeding notice: {e}")

app = FastAPI(
    title="TourismOS API",
    description="AI-powered tourism decision intelligence platform API",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(destinations.router, prefix="/api/destinations", tags=["Destinations"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Flow Intelligence"])
app.include_router(demand.router, prefix="/api/demand", tags=["Demand Forecasting"])
app.include_router(business.router, prefix="/api/business", tags=["Local Economy Booster"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["Review NLP Intelligence"])
app.include_router(authority.router, prefix="/api/authority", tags=["Authority Command Center"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["Digital Twin Simulation"])
app.include_router(sustainability.router, prefix="/api/sustainability", tags=["Sustainability Indicators"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Safety Alerts"])
app.include_router(itineraries.router, prefix="/api/itineraries", tags=["Tourist Itineraries"])

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "TourismOS Intelligence Platform",
        "version": "1.0.0"
    }
