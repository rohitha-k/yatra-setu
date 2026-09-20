import datetime
import random
import math
from sqlalchemy.orm import Session
from .database import SessionLocal, Base, engine
from . import models, auth, ml_models

# Indian destination coordinates and details
INDIAN_DESTINATIONS = [
    {
        "name": "Goa",
        "description": "Famous for its pristine beaches, vibrant nightlife, and Portuguese architectural heritage.",
        "latitude": 15.2993,
        "longitude": 74.1240,
        "category": "Beach",
        "safe_capacity": 15000,
        "current_tourists": 13800,
        "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
    },
    {
        "name": "Araku Valley",
        "description": "A scenic hill station in Andhra Pradesh surrounded by coffee plantations, waterfalls, and dense forests.",
        "latitude": 18.2748,
        "longitude": 82.8711,
        "category": "Hill Station",
        "safe_capacity": 4000,
        "current_tourists": 1200,
        "image_url": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800"
    },
    {
        "name": "Visakhapatnam",
        "description": "A coastal port city in Andhra Pradesh, combining beaches, scenic hills, and submarine museums.",
        "latitude": 17.6868,
        "longitude": 83.2185,
        "category": "Beach",
        "safe_capacity": 10000,
        "current_tourists": 4200,
        "image_url": "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=800"
    },
    {
        "name": "Tirupati",
        "description": "A historic spiritual town famous for the hill temple of Lord Venkateswara, drawing millions of pilgrims.",
        "latitude": 13.6288,
        "longitude": 79.4192,
        "category": "Cultural",
        "safe_capacity": 25000,
        "current_tourists": 23500,
        "image_url": "https://images.unsplash.com/photo-1600100397990-a4b3d70f2d51?w=800"
    },
    {
        "name": "Vijayawada",
        "description": "A bustling city on the banks of Krishna River, home to Kanaka Durga Temple and Undavalli Caves.",
        "latitude": 16.5062,
        "longitude": 80.6480,
        "category": "Cultural",
        "safe_capacity": 8000,
        "current_tourists": 3100,
        "image_url": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800"
    },
    {
        "name": "Hyderabad",
        "description": "A major tech center blended with rich history, iconic Charminar, and world-famous Biryani.",
        "latitude": 17.3850,
        "longitude": 78.4867,
        "category": "Urban",
        "safe_capacity": 20000,
        "current_tourists": 11500,
        "image_url": "https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=800"
    },
    {
        "name": "Jaipur",
        "description": "The capital of Rajasthan, known as the Pink City, boasting majestic palaces, forts, and vibrant markets.",
        "latitude": 26.9124,
        "longitude": 75.7873,
        "category": "Cultural",
        "safe_capacity": 18000,
        "current_tourists": 16500,
        "image_url": "https://images.unsplash.com/photo-1477587458883-47135dcdb7ae?w=800"
    },
    {
        "name": "Kerala Backwaters",
        "description": "A serene network of lakes, canals, and rivers, famous for luxurious houseboat cruising.",
        "latitude": 9.4981,
        "longitude": 76.3388,
        "category": "Nature",
        "safe_capacity": 6000,
        "current_tourists": 5700,
        "image_url": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800"
    },
    {
        "name": "Mysuru",
        "description": "Known as the Palace City of India, rich in royal heritage, heritage buildings, and Mysuru silk.",
        "latitude": 12.2958,
        "longitude": 76.6394,
        "category": "Cultural",
        "safe_capacity": 7000,
        "current_tourists": 2400,
        "image_url": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800"
    },
    {
        "name": "Ooty",
        "description": "The Queen of Hill Stations in Tamil Nadu, popular for its toy train, tea estates, and cool climate.",
        "latitude": 11.4102,
        "longitude": 76.6950,
        "category": "Hill Station",
        "safe_capacity": 5000,
        "current_tourists": 4600,
        "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
    }
]

ATTRACTIONS = {
    "Goa": [
        {"name": "Calangute Beach", "category": "Beach", "capacity": 5000, "rating": 4.2},
        {"name": "Dudhsagar Falls", "category": "Nature", "capacity": 2000, "rating": 4.7},
        {"name": "Basilica of Bom Jesus", "category": "Cultural", "capacity": 3000, "rating": 4.5}
    ],
    "Araku Valley": [
        {"name": "Borra Caves", "category": "Nature", "capacity": 1500, "rating": 4.6},
        {"name": "Chaparai Water Cascades", "category": "Nature", "capacity": 1200, "rating": 4.1},
        {"name": "Coffee Plantations", "category": "Nature", "capacity": 2000, "rating": 4.4}
    ],
    "Visakhapatnam": [
        {"name": "RK Beach", "category": "Beach", "capacity": 8000, "rating": 4.3},
        {"name": "INS Kurusura Submarine Museum", "category": "Cultural", "capacity": 2000, "rating": 4.8},
        {"name": "Kailasagiri Hilltop Park", "category": "Nature", "capacity": 4000, "rating": 4.4}
    ],
    "Tirupati": [
        {"name": "Tirumala Venkateswara Temple", "category": "Cultural", "capacity": 50000, "rating": 4.9},
        {"name": "Kapila Theertham Waterfalls", "category": "Nature", "capacity": 2000, "rating": 4.3},
        {"name": "Chandragiri Fort", "category": "Cultural", "capacity": 3000, "rating": 4.2}
    ],
    "Ooty": [
        {"name": "Ooty Botanical Gardens", "category": "Nature", "capacity": 4000, "rating": 4.5},
        {"name": "Doddabetta Peak", "category": "Nature", "capacity": 3000, "rating": 4.6},
        {"name": "Ooty Lake Toy Train", "category": "Leisure", "capacity": 2000, "rating": 4.4}
    ]
}

MOCK_REVIEWS = [
    "The room view was beautiful and staff was friendly. Cleanliness is top notch. Highly recommended!",
    "Amazing experience, but the room Wi-Fi connection was very weak and slow. The food was okay.",
    "Very overcrowded during weekends, parking is a huge mess. Pricing is overpriced. Staff were polite though.",
    "Excellent service, clean rooms, good wifi signal. The location is peaceful and safe.",
    "Great restaurant with delicious food, but staff response is extremely slow. Clean place.",
    "The tour guide was extremely helpful, but accessibility for elderly could be improved as there are no elevators.",
    "Decent stay. Good location, but room service pricing is too high. Wifi is fine.",
    "Beautiful scenery. Highly recommend the sunset view. Safe atmosphere and clean guidelines."
]

def seed_db():
    print("Initializing Database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if database is already seeded
        if db.query(models.User).first():
            print("Database already seeded. Skipping.")
            return

        print("Seeding Users...")
        # Create default logins
        users = [
            models.User(username="tourist", email="tourist@tourismos.gov.in", hashed_password=auth.get_password_hash("password123"), role="TOURIST"),
            models.User(username="business", email="business@tourismos.gov.in", hashed_password=auth.get_password_hash("password123"), role="BUSINESS"),
            models.User(username="authority", email="authority@tourismos.gov.in", hashed_password=auth.get_password_hash("password123"), role="AUTHORITY"),
            models.User(username="admin", email="admin@tourismos.gov.in", hashed_password=auth.get_password_hash("password123"), role="ADMIN")
        ]
        db.add_all(users)
        db.commit()

        # Load users back
        user_tourist = db.query(models.User).filter(models.User.username == "tourist").first()
        user_business = db.query(models.User).filter(models.User.username == "business").first()

        print("Seeding Destinations...")
        db_destinations = []
        for dest in INDIAN_DESTINATIONS:
            d = models.Destination(**dest)
            db.add(d)
            db_destinations.append(d)
        db.commit()

        # Mapping for easy access
        dest_map = {d.name: d for d in db_destinations}

        print("Seeding Attractions...")
        for dest_name, attrs in ATTRACTIONS.items():
            dest = dest_map.get(dest_name)
            if dest:
                for attr in attrs:
                    a = models.Attraction(**attr, destination_id=dest.id)
                    db.add(a)
        db.commit()

        print("Seeding Businesses...")
        types = ["HOTEL", "RESTAURANT", "GUIDE", "LOCAL_EXPERIENCE", "TRANSPORT"]
        for d in db_destinations:
            # Create a premium hotel
            hotel = models.Business(
                name=f"{d.name} Grand Palace Resort",
                type="HOTEL",
                description=f"A luxury stay experience nestled in the heart of {d.name}.",
                destination_id=d.id,
                user_id=user_business.id,
                capacity=120,
                current_utilization=int(120 * (d.current_tourists / d.safe_capacity)),
                rating=4.5,
                price_range="Premium"
            )
            db.add(hotel)

            # Create a restaurant
            restaurant = models.Business(
                name=f"{d.name} Heritage Kitchen",
                type="RESTAURANT",
                description=f"Authentic local cuisine featuring the signature flavors of {d.name}.",
                destination_id=d.id,
                capacity=80,
                current_utilization=int(80 * (d.current_tourists / d.safe_capacity)),
                rating=4.2,
                price_range="Medium"
            )
            db.add(restaurant)

            # Create local guide
            guide = models.Business(
                name=f"Explore {d.name} Guides Association",
                type="GUIDE",
                description="Professional certified local guides specialized in nature and culture trails.",
                destination_id=d.id,
                capacity=30,
                current_utilization=min(30, int(30 * (d.current_tourists / d.safe_capacity))),
                rating=4.7,
                price_range="Budget"
            )
            db.add(guide)
        db.commit()

        print("Seeding Reviews & Analyzing Sentiments...")
        businesses = db.query(models.Business).all()
        for b in businesses:
            for _ in range(5):
                text = random.choice(MOCK_REVIEWS)
                rating = random.choice([3, 4, 5]) if "clean" in text.lower() or "beautiful" in text.lower() else random.choice([1, 2, 3])
                
                # Use review service to extract
                analysis = ml_models.ReviewIntelligenceService.analyze_sentiment_and_topics(text)
                
                rev = models.Review(
                    user_id=user_tourist.id,
                    business_id=b.id,
                    destination_id=b.destination_id,
                    text=text,
                    rating=rating,
                    sentiment=analysis["sentiment"],
                    topic_cleanliness=analysis["topics"]["cleanliness"],
                    topic_food=analysis["topics"]["food"],
                    topic_staff=analysis["topics"]["staff"],
                    topic_wifi=analysis["topics"]["wifi"],
                    topic_location=analysis["topics"]["location"],
                    topic_safety=analysis["topics"]["safety"],
                    topic_accessibility=analysis["topics"]["accessibility"],
                    topic_pricing=analysis["topics"]["pricing"]
                )
                db.add(rev)
        db.commit()

        print("Seeding Sustainability Metrics...")
        today = datetime.date.today()
        for d in db_destinations:
            # high current tourists density
            density = d.current_tourists / d.safe_capacity
            score = 90 - (density * 30) # lower score if overcrowding
            
            s = models.SustainabilityMetric(
                destination_id=d.id,
                date=today,
                crowd_density=density,
                environmental_pressure=min(1.0, density * 1.1),
                public_transport_usage=0.7 - (density * 0.2), # drops if too crowded
                local_business_participation=0.75,
                waste_indicator=float(d.current_tourists * 0.05), # tonnes of waste
                water_indicator=float(d.current_tourists * 0.12),
                renewable_energy_ratio=0.35,
                overall_sustainability_score=max(10, min(100, score))
            )
            db.add(s)
        db.commit()

        print("Seeding Demand History (60 Days)...")
        # Generate 60 days of historical visitor counts for model forecasting
        for d in db_destinations:
            base_capacity = d.safe_capacity
            for offset in range(60, 0, -1):
                hist_date = today - datetime.timedelta(days=offset)
                
                # Seasonality: weekends have higher traffic
                weekday = hist_date.weekday()
                weekend_multiplier = 1.6 if weekday >= 5 else 0.8
                
                # Random fluctuations
                variation = random.uniform(0.85, 1.15)
                
                # Overall load: Goa/Tirupati are naturally more crowded
                load_factor = 0.9 if d.name in ["Goa", "Tirupati"] else 0.4
                if d.name == "Araku Valley":
                    load_factor = 0.25 # underutilized
                
                visitors = int(base_capacity * load_factor * weekend_multiplier * variation)
                
                # Ensure values stay bound
                visitors = max(100, min(int(base_capacity * 1.5), visitors))
                
                # Mock occupancy
                occupancy = min(0.98, (visitors / base_capacity) * 0.7)
                
                # Weather simulation
                weather_choice = "Rainy" if offset in [10, 11, 45, 46] else "Sunny"
                temp = 32.0 if weather_choice == "Sunny" else 24.0
                
                # Predicted visitors is lagged version for simulated model checks
                pred_visitors = int(visitors * random.uniform(0.95, 1.05))

                demand = models.TourismDemand(
                    destination_id=d.id,
                    date=hist_date,
                    visitor_count=visitors,
                    predicted_visitor_count=pred_visitors,
                    season="Monsoon" if hist_date.month in [6,7,8] else "Winter",
                    is_holiday=(weekday >= 5),
                    weather_condition=weather_choice,
                    temperature=temp,
                    average_hotel_occupancy=occupancy,
                    average_price=float(2000 + visitors * 0.1),
                    transport_availability=float(0.8 + 0.1 * math.cos(offset))
                )
                db.add(demand)
        db.commit()

        print("Seeding Transport Connections...")
        # Add connections for alternative recommendation routing
        # Araku is close to Visakhapatnam
        db.add(models.Transport(source_destination_id=dest_map["Visakhapatnam"].id, target_destination_id=dest_map["Araku Valley"].id, mode="TRAIN", capacity=500, cost=120, duration_minutes=180))
        db.add(models.Transport(source_destination_id=dest_map["Visakhapatnam"].id, target_destination_id=dest_map["Araku Valley"].id, mode="CAB", capacity=80, cost=2500, duration_minutes=120))
        
        # Tirupati to Vijayawada
        db.add(models.Transport(source_destination_id=dest_map["Tirupati"].id, target_destination_id=dest_map["Vijayawada"].id, mode="TRAIN", capacity=1200, cost=350, duration_minutes=360))
        
        # Ooty to Mysuru
        db.add(models.Transport(source_destination_id=dest_map["Ooty"].id, target_destination_id=dest_map["Mysuru"].id, mode="BUS", capacity=150, cost=200, duration_minutes=240))
        db.add(models.Transport(source_destination_id=dest_map["Ooty"].id, target_destination_id=dest_map["Mysuru"].id, mode="CAB", capacity=40, cost=3500, duration_minutes=150))
        db.commit()

        print("Seeding Alerts...")
        # Active safety warnings
        db.add(models.Alert(destination_id=dest_map["Goa"].id, type="CROWD", message="Goa beach zones are currently at peak capacity. Redistribution advised.", severity="WARNING", is_active=True))
        db.add(models.Alert(destination_id=dest_map["Tirupati"].id, type="CROWD", message="Tirupati temple complex reporting 94% queue lines saturation.", severity="WARNING", is_active=True))
        db.add(models.Alert(destination_id=dest_map["Ooty"].id, type="WEATHER", message="Heavy rainfall warnings in the hill ranges. Landslide hazard: HIGH.", severity="CRITICAL", is_active=True))
        db.commit()

        print("Pre-calculating Recommendations...")
        # Precompute initial alternative links
        # Goa alternatives -> Kerala, Visakhapatnam
        for parent, alt, dist in [
            ("Goa", "Visakhapatnam", 820.0),
            ("Tirupati", "Vijayawada", 350.0),
            ("Visakhapatnam", "Araku Valley", 110.0),
            ("Goa", "Kerala Backwaters", 650.0),
            ("Ooty", "Mysuru", 125.0),
            ("Jaipur", "Mysuru", 1600.0) # distant
        ]:
            d_p = dest_map.get(parent)
            d_a = dest_map.get(alt)
            if d_p and d_a:
                metrics = ml_models.DestinationRecommendationService.calculate_alternative_score(d_p, d_a, dist)
                rec = models.Recommendation(
                    destination_id=d_p.id,
                    alternative_destination_id=d_a.id,
                    score=metrics["final_score"],
                    similarity_score=metrics["similarity_score"],
                    crowd_reduction_score=metrics["crowd_reduction_score"],
                    capacity_availability_score=metrics["capacity_availability_score"],
                    cost_advantage_score=metrics["cost_advantage_score"],
                    sustainability_score=metrics["sustainability_score"],
                    reasoning_text=metrics["reasoning"]
                )
                db.add(rec)
        db.commit()

        print("Database Seed Successful!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
