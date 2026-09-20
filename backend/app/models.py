from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Date, Text, Table
from sqlalchemy.orm import relationship
import datetime
from .database import Base

# Many-to-many relationship helper for business-user links if needed
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="TOURIST") # TOURIST, BUSINESS, AUTHORITY, ADMIN
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    bookings = relationship("Booking", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    itineraries = relationship("Itinerary", back_populates="user")
    businesses = relationship("Business", back_populates="owner")

class Destination(Base):
    __tablename__ = "destinations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    category = Column(String, nullable=True) # Hill Station, Beach, Cultural, Nature
    safe_capacity = Column(Integer, nullable=False, default=10000)
    current_tourists = Column(Integer, default=0)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    attractions = relationship("Attraction", back_populates="destination")
    businesses = relationship("Business", back_populates="destination")
    demands = relationship("TourismDemand", back_populates="destination")
    weather = relationship("Weather", back_populates="destination")
    events = relationship("Event", back_populates="destination")
    sustainability_metrics = relationship("SustainabilityMetric", back_populates="destination")
    alerts = relationship("Alert", back_populates="destination")

class Attraction(Base):
    __tablename__ = "attractions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    destination_id = Column(Integer, ForeignKey("destinations.id"))
    capacity = Column(Integer, default=1000)
    rating = Column(Float, default=4.0)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    destination = relationship("Destination", back_populates="attractions")

class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False) # HOTEL, HOMESTAY, RESTAURANT, GUIDE, TOUR_OPERATOR, LOCAL_EXPERIENCE, TRANSPORT
    description = Column(Text, nullable=True)
    destination_id = Column(Integer, ForeignKey("destinations.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Owner account
    capacity = Column(Integer, default=50) # Rooms for hotel, seats for restaurant, etc.
    current_utilization = Column(Integer, default=0)
    rating = Column(Float, default=4.0)
    address = Column(String, nullable=True)
    price_range = Column(String, default="Medium") # Budget, Medium, Premium
    contact_info = Column(String, nullable=True)

    destination = relationship("Destination", back_populates="businesses")
    owner = relationship("User", back_populates="businesses")
    bookings = relationship("Booking", back_populates="business")
    reviews = relationship("Review", back_populates="business")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    business_id = Column(Integer, ForeignKey("businesses.id"))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    guests = Column(Integer, default=1)
    status = Column(String, default="CONFIRMED") # CONFIRMED, CANCELLED, COMPLETED
    amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="bookings")
    business = relationship("Business", back_populates="bookings")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    destination_id = Column(Integer, ForeignKey("destinations.id"), nullable=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=True)
    text = Column(Text, nullable=False)
    rating = Column(Integer, default=5)
    sentiment = Column(String, default="Positive") # Positive, Neutral, Negative
    
    # NLP Topic classifications (float score 0.0 to 1.0 or binary indicator)
    topic_cleanliness = Column(Float, default=0.0)
    topic_food = Column(Float, default=0.0)
    topic_staff = Column(Float, default=0.0)
    topic_wifi = Column(Float, default=0.0)
    topic_location = Column(Float, default=0.0)
    topic_safety = Column(Float, default=0.0)
    topic_accessibility = Column(Float, default=0.0)
    topic_pricing = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="reviews")
    business = relationship("Business", back_populates="reviews")

class TourismDemand(Base):
    __tablename__ = "tourism_demands"

    id = Column(Integer, primary_key=True, index=True)
    destination_id = Column(Integer, ForeignKey("destinations.id"))
    date = Column(Date, nullable=False)
    visitor_count = Column(Integer, nullable=False)
    predicted_visitor_count = Column(Integer, nullable=True)
    season = Column(String, nullable=True) # Summer, Monsoon, Winter
    is_holiday = Column(Boolean, default=False)
    weather_condition = Column(String, default="Sunny")
    temperature = Column(Float, default=25.0)
    average_hotel_occupancy = Column(Float, default=0.5) # 0.0 to 1.0
    average_price = Column(Float, default=2000.0)
    transport_availability = Column(Float, default=0.8) # Score 0 to 1

    destination = relationship("Destination", back_populates="demands")

class Weather(Base):
    __tablename__ = "weather"

    id = Column(Integer, primary_key=True, index=True)
    destination_id = Column(Integer, ForeignKey("destinations.id"))
    date = Column(Date, nullable=False)
    condition = Column(String, default="Clear")
    temperature = Column(Float, default=25.0)
    precipitation = Column(Float, default=0.0)
    alert_level = Column(String, default="NONE") # NONE, LOW, MEDIUM, HIGH
    advisory_text = Column(String, nullable=True)

    destination = relationship("Destination", back_populates="weather")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    destination_id = Column(Integer, ForeignKey("destinations.id"))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    impact_factor = Column(Float, default=1.2) # demand multiplier

    destination = relationship("Destination", back_populates="events")

class Transport(Base):
    __tablename__ = "transports"

    id = Column(Integer, primary_key=True, index=True)
    source_destination_id = Column(Integer, ForeignKey("destinations.id"))
    target_destination_id = Column(Integer, ForeignKey("destinations.id"))
    mode = Column(String, nullable=False) # BUS, TRAIN, FLIGHT, CAB
    capacity = Column(Integer, default=100)
    cost = Column(Float, default=500.0)
    duration_minutes = Column(Integer, default=60)
    availability_score = Column(Float, default=1.0)

class TouristFlow(Base):
    __tablename__ = "tourist_flows"

    id = Column(Integer, primary_key=True, index=True)
    source_destination_id = Column(Integer, ForeignKey("destinations.id"))
    target_destination_id = Column(Integer, ForeignKey("destinations.id"))
    current_flow = Column(Integer, default=0)
    capacity = Column(Integer, default=1000)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class SustainabilityMetric(Base):
    __tablename__ = "sustainability_metrics"

    id = Column(Integer, primary_key=True, index=True)
    destination_id = Column(Integer, ForeignKey("destinations.id"))
    date = Column(Date, nullable=False)
    crowd_density = Column(Float, default=0.5) # 0 to 1
    environmental_pressure = Column(Float, default=0.5)
    public_transport_usage = Column(Float, default=0.6)
    local_business_participation = Column(Float, default=0.7)
    waste_indicator = Column(Float, default=50.0) # metric tonnes or index
    water_indicator = Column(Float, default=60.0)
    renewable_energy_ratio = Column(Float, default=0.2)
    overall_sustainability_score = Column(Float, default=70.0)

    destination = relationship("Destination", back_populates="sustainability_metrics")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    destination_id = Column(Integer, ForeignKey("destinations.id"))
    alternative_destination_id = Column(Integer, ForeignKey("destinations.id"))
    score = Column(Float, default=0.0)
    similarity_score = Column(Float, default=0.0)
    crowd_reduction_score = Column(Float, default=0.0)
    capacity_availability_score = Column(Float, default=0.0)
    cost_advantage_score = Column(Float, default=0.0)
    sustainability_score = Column(Float, default=0.0)
    reasoning_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    destination_id = Column(Integer, ForeignKey("destinations.id"))
    type = Column(String, nullable=False) # WEATHER, CROWD, SAFETY, INFRASTRUCTURE
    message = Column(String, nullable=False)
    severity = Column(String, default="INFO") # INFO, WARNING, CRITICAL
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    destination = relationship("Destination", back_populates="alerts")

class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    destination_id = Column(Integer, ForeignKey("destinations.id"))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    budget = Column(Float, default=10000.0)
    guests = Column(Integer, default=1)
    interests = Column(String, nullable=True) # Comma-separated list
    travel_style = Column(String, default="Leisure") # Leisure, Adventure, Budget, Luxury
    crowd_preference = Column(String, default="Moderate") # Low, Moderate, High
    generated_content = Column(Text, nullable=True) # JSON dump of the itinerary details
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="itineraries")
