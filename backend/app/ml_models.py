import numpy as np
import json
import re
import datetime

# Import ML libraries if available, otherwise use high-fidelity math fallbacks
try:
    import pandas as pd
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.feature_extraction.text import TfidfVectorizer
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

class TourismDemandService:
    @staticmethod
    def forecast_7_day(destination, historical_data):
        """
        Forecasts visitor demand for the next 7 days.
        If sklearn is available, trains a RandomForestRegressor on historical demand.
        Else, uses a robust seasonal-trend decomposition regression model in numpy.
        """
        if not historical_data:
            # Seed default forecast values if no data exists
            return [int(destination.safe_capacity * 0.7 * (1 + 0.05 * np.sin(i))) for i in range(7)]
        
        # Extrapolate days
        base_visitors = [d.visitor_count for d in historical_data]
        dates = [d.date for d in historical_data]
        
        if len(base_visitors) < 7:
            # Simple average fallback
            avg = np.mean(base_visitors) if base_visitors else 1000
            return [int(avg * (1 + 0.03 * np.sin(i))) for i in range(7)]
            
        if HAS_SKLEARN:
            try:
                # Prepare training df
                df = pd.DataFrame([{
                    "visitors": d.visitor_count,
                    "day_of_week": d.date.weekday(),
                    "month": d.date.month,
                    "is_holiday": int(d.is_holiday),
                    "temp": d.temperature
                } for d in historical_data])
                
                X = df[["day_of_week", "month", "is_holiday", "temp"]]
                y = df["visitors"]
                
                model = RandomForestRegressor(n_estimators=30, random_state=42)
                model.fit(X, y)
                
                # Predict next 7 days
                future_X = []
                today = datetime.date.today()
                for i in range(1, 8):
                    future_date = today + datetime.timedelta(days=i)
                    future_X.append({
                        "day_of_week": future_date.weekday(),
                        "month": future_date.month,
                        "is_holiday": 1 if future_date.weekday() >= 5 else 0, # Simple holiday guess
                        "temp": 28.0 # default temp
                    })
                
                pred_df = pd.DataFrame(future_X)
                predictions = model.predict(pred_df)
                return [max(0, int(p)) for p in predictions]
            except Exception:
                pass
                
        # Pure Numpy Fallback: Seasonal Exponential Smoothing with Trend
        # Y_t = Base + Trend * t + Seasonal(t)
        t = np.arange(len(base_visitors))
        poly = np.polyfit(t, base_visitors, 1) # Linear trend: slope, intercept
        slope, intercept = poly
        
        # Calculate daily averages for seasonality (mod 7)
        residuals = np.array(base_visitors) - (slope * t + intercept)
        seasonal_factors = {}
        for day in range(7):
            indices = [i for i in range(len(residuals)) if dates[i].weekday() == day]
            seasonal_factors[day] = np.mean(residuals[indices]) if indices else 0.0
            
        today = datetime.date.today()
        predictions = []
        for i in range(1, 8):
            future_date = today + datetime.timedelta(days=i)
            t_future = len(base_visitors) + i
            trend_val = slope * t_future + intercept
            season_val = seasonal_factors.get(future_date.weekday(), 0)
            pred = max(0, int(trend_val + season_val))
            predictions.append(pred)
            
        return predictions

class DestinationRecommendationService:
    @staticmethod
    def calculate_alternative_score(destination, alternative, distance_km):
        """
        Calculates similarity & alternative score using multi-criteria matrix.
        Returns detailed scoring breakdown.
        """
        # Distance penalty: closer is better up to a point, but needs to be accessible
        # Normalize distance: 0 to 100km. If distance > 100km, penalize heavily.
        dist_score = max(0, 100 - (distance_km * 0.8))
        
        # Capacity availability score: (Safe Capacity - Current Visitors) / Safe Capacity * 100
        cap_avail_pct = max(0, min(100, ((alternative.safe_capacity - alternative.current_tourists) / alternative.safe_capacity) * 100))
        
        # Crowd reduction score: how much lower is the current density at the alternative
        dest_density = (destination.current_tourists / destination.safe_capacity) if destination.safe_capacity else 1
        alt_density = (alternative.current_tourists / alternative.safe_capacity) if alternative.safe_capacity else 1
        crowd_red_pct = max(0, min(100, (dest_density - alt_density) * 100))
        
        # Experience Similarity: category matching (e.g. Hill Station == Hill Station -> 90%)
        similarity = 95.0 if destination.category == alternative.category else 65.0
        
        # Cost advantage: let's assume alternative has some price advantage or dynamic score
        cost_advantage = 75.0 # default baseline advantage
        
        # Sustainability score: placeholder index out of 100
        sustainability = 85.0
        
        # Weighted matching
        # Score = 0.3 * similarity + 0.2 * capacity_availability + 0.2 * crowd_reduction + 0.1 * dist_score + 0.1 * cost_advantage + 0.1 * sustainability
        final_score = (
            0.30 * similarity +
            0.20 * cap_avail_pct +
            0.20 * crowd_red_pct +
            0.10 * dist_score +
            0.10 * cost_advantage +
            0.10 * sustainability
        )
        
        reasoning = (
            f"Recommended alternative because it offers a {similarity:.0f}% experience match "
            f"with {crowd_red_pct:.0f}% lower crowd levels and is located just {distance_km:.1f} km away."
        )
        
        return {
            "destination_id": alternative.id,
            "name": alternative.name,
            "distance_km": distance_km,
            "final_score": int(final_score),
            "similarity_score": int(similarity),
            "capacity_availability_score": int(cap_avail_pct),
            "crowd_reduction_score": int(crowd_red_pct),
            "cost_advantage_score": int(cost_advantage),
            "sustainability_score": int(sustainability),
            "reasoning": reasoning
        }

class CrowdPredictionService:
    @staticmethod
    def predict_risk(current_visitors, safe_capacity, predicted_visitors_tomorrow):
        """
        Analyzes and detects overcrowding risks.
        """
        capacity_utilization = (current_visitors / safe_capacity) if safe_capacity else 0
        predicted_utilization = (predicted_visitors_tomorrow / safe_capacity) if safe_capacity else 0
        
        risk_level = "GREEN" # Healthy
        if predicted_utilization >= 1.2:
            risk_level = "RED" # Overcrowded
        elif predicted_utilization >= 0.9:
            risk_level = "ORANGE" # High Demand
            
        return {
            "capacity_utilization_pct": int(capacity_utilization * 100),
            "predicted_utilization_pct": int(predicted_utilization * 100),
            "risk_level": risk_level,
            "is_imbalanced": risk_level in ["ORANGE", "RED"]
        }

class ReviewIntelligenceService:
    # Key terms for rule-based topics extraction
    TOPIC_KEYWORDS = {
        "cleanliness": ["clean", "dirty", "hygiene", "garbage", "trash", "washroom", "toilet", "dusty", "neat"],
        "food": ["food", "restaurant", "taste", "breakfast", "dinner", "lunch", "delicious", "menu", "spice"],
        "staff": ["staff", "service", "manager", "host", "friendly", "polite", "helper", "reception"],
        "wifi": ["wifi", "internet", "signal", "connection", "net", "network", "router"],
        "location": ["location", "view", "scenery", "far", "close", "beach", "hill", "accessible"],
        "safety": ["safe", "scared", "security", "dark", "police", "guard", "harass"],
        "accessibility": ["wheelchair", "stairs", "ramp", "elderly", "lift", "elevator", "parking"],
        "pricing": ["price", "cost", "expensive", "cheap", "charge", "value", "money", "overpriced"]
    }
    
    POSITIVE_WORDS = ["good", "great", "excellent", "beautiful", "amazing", "friendly", "clean", "love", "perfect", "delicious", "pleasant"]
    NEGATIVE_WORDS = ["bad", "worst", "dirty", "slow", "broken", "wifi", "poor", "expensive", "hate", "rude", "noisy", "disappointed"]

    @staticmethod
    def analyze_sentiment_and_topics(review_text):
        """
        Heuristic sentiment analysis and topic matching.
        Classifies reviews into Positive, Neutral, Negative, and scores individual topics.
        """
        text_lower = review_text.lower()
        
        # Calculate sentiment score
        pos_count = sum(1 for w in ReviewIntelligenceService.POSITIVE_WORDS if w in text_lower)
        neg_count = sum(1 for w in ReviewIntelligenceService.NEGATIVE_WORDS if w in text_lower)
        
        diff = pos_count - neg_count
        if diff > 0:
            sentiment = "Positive"
        elif diff < 0:
            sentiment = "Negative"
        else:
            sentiment = "Neutral"
            
        # Analyze topics
        topics = {}
        for topic, keywords in ReviewIntelligenceService.TOPIC_KEYWORDS.items():
            match_score = 0.0
            for kw in keywords:
                if kw in text_lower:
                    match_score += 1.0
            # Normalize match score between 0.0 and 1.0
            topics[topic] = min(1.0, match_score * 0.5)
            
        return {
            "sentiment": sentiment,
            "topics": topics
        }

class TourismImpactService:
    @staticmethod
    def calculate_tis(destination, sustainability_metric, reviews):
        """
        Computes Tourism Impact Score (TIS).
        Formula represents balanced tourism: TIS = W1*Satisfaction + W2*Economy + W3*Sustainability + W4*Infra + W5*Capacity
        """
        # Average ratings from reviews
        avg_rating = np.mean([r.rating for r in reviews]) if reviews else 4.0
        tourist_satisfaction = int(avg_rating * 20) # scale to 100
        
        # Sustainability score
        sustainability = int(sustainability_metric.overall_sustainability_score) if sustainability_metric else 75
        
        # Economy (local participation, occupancy)
        local_economy = int((sustainability_metric.local_business_participation if sustainability_metric else 0.7) * 100)
        
        # Infrastructure (public transport, reverse of waste/water pressure)
        public_transport = int((sustainability_metric.public_transport_usage if sustainability_metric else 0.6) * 100)
        infra_score = int(0.6 * public_transport + 0.4 * 80) # 80 is placeholder baseline
        
        # Capacity balance
        crowd_density = sustainability_metric.crowd_density if sustainability_metric else 0.5
        capacity_balance = int((1.0 - abs(crowd_density - 0.5) * 2) * 100) # optimal density is 0.5
        
        # TIS score computation
        tis = int(
            0.20 * tourist_satisfaction +
            0.20 * local_economy +
            0.25 * sustainability +
            0.15 * infra_score +
            0.20 * capacity_balance
        )
        
        return {
            "overall_tis": tis,
            "satisfaction": tourist_satisfaction,
            "economy": local_economy,
            "sustainability": sustainability,
            "infrastructure": infra_score,
            "capacity_balance": capacity_balance
        }

class LocalEconomyService:
    @staticmethod
    def score_business_opportunities(business, demand_increase_pct):
        """
        Computes Local Tourism Opportunity Score for businesses.
        If demand is growing, hotels should prepare capacity, restaurants prep inventory, etc.
        """
        base_opportunity = 50.0
        
        # Demand boost multiplier
        demand_factor = demand_increase_pct * 0.8
        
        # Rating boost (lower rated gets high opportunity to improve, higher rated gets load demand)
        rating_factor = (5.0 - business.rating) * 10.0
        
        # Capacity utilization pressure: if current utilization is low, high opportunity to load
        utilization_factor = (1.0 - (business.current_utilization / business.capacity if business.capacity else 0.5)) * 20.0
        
        opportunity_score = base_opportunity + demand_factor + rating_factor + utilization_factor
        opportunity_score = max(10, min(99, int(opportunity_score)))
        
        # Generate actionable advice
        advice = ""
        if business.type == "HOTEL" or business.type == "HOMESTAY":
            if demand_increase_pct > 20:
                advice = f"Increase staff by 15% and prepare {int(business.capacity * 0.15)} additional rooms for next weekend."
            else:
                advice = "Optimize weekend dynamic pricing structure for moderate occupancy increase."
        elif business.type == "RESTAURANT":
            advice = f"Increase raw ingredient inventory by {int(demand_increase_pct)}% to prevent weekend ingredient shortage."
        elif business.type == "GUIDE":
            advice = "High demand expected! Open bookings for cultural tour slots."
        else:
            advice = "Prepare promotional materials and coordinate transport schedules."
            
        return {
            "business_id": business.id,
            "name": business.name,
            "type": business.type,
            "opportunity_score": opportunity_score,
            "recommended_action": advice
        }

class AITravelPlannerService:
    @staticmethod
    def generate_distributed_itinerary(destination, alternative_recommendations, duration_days, budget, interests_list, travel_style, crowd_pref):
        """
        Generates a customized travel itinerary based on intelligence data.
        Smart redistribution: if user prefers low crowd, integrates alternative destinations into the itinerary.
        """
        # Determine target destinations
        visited_spots = [destination.name]
        alt_used = None
        
        if crowd_pref.lower() in ["low", "moderate"] and alternative_recommendations:
            # Integrate the top alternative destination
            top_alt = alternative_recommendations[0]
            alt_used = top_alt
            visited_spots.append(alt_used["name"])
            
        # Formulate daily itineraries
        days = []
        activities_pool = {
            "nature": ["Nature trail hike", "Waterfall sightseeing", "Forest photography walks", "Scenic viewpoints exploration"],
            "culture": ["Heritage temple visits", "Local handicraft workshop", "Traditional art museum", "Culinary street-walks"],
            "adventure": ["Zipline trekking", "Rock climbing activity", "River drafting", "Offroad ATV rides"],
            "leisure": ["Gardens stroll", "Sunset lakeside relaxation", "Spa & Wellness center", "Art gallery viewing"]
        }
        
        # Pick relevant activities based on interests
        selected_cats = [c.strip().lower() for c in interests_list] if interests_list else ["nature", "culture"]
        
        # Construct dynamic layout
        for day_num in range(1, duration_days + 1):
            dest_for_day = visited_spots[0] if day_num == 1 or not alt_used else visited_spots[1]
            
            # Select activities
            act_cat = selected_cats[(day_num - 1) % len(selected_cats)]
            pool = activities_pool.get(act_cat, activities_pool["leisure"])
            
            day_itinerary = {
                "day": day_num,
                "location": dest_for_day,
                "morning": f"{pool[0]} at {dest_for_day}",
                "afternoon": f"{pool[1]} & Local lunch experience",
                "evening": f"{pool[2]} & Cultural market visit",
                "sustainability_tips": "Prefer local electrical rickshaws for transport to reduce emission footprint."
            }
            days.append(day_itinerary)
            
        # Calculate budget divisions
        hotel_cost = budget * 0.4 / duration_days
        food_cost = budget * 0.25 / duration_days
        activities_cost = budget * 0.20
        transport_cost = budget * 0.15
        
        estimated_crowd_reduction = 0
        if alt_used:
            estimated_crowd_reduction = alt_used["crowd_reduction_score"]
            
        sustainability_score = 88 if alt_used else 72
        
        return {
            "destination_name": destination.name,
            "alternative_used": alt_used["name"] if alt_used else None,
            "duration_days": duration_days,
            "crowd_reduction_pct": estimated_crowd_reduction,
            "sustainability_score": sustainability_score,
            "budget_breakdown": {
                "accommodation_per_day": int(hotel_cost),
                "food_per_day": int(food_cost),
                "activities_total": int(activities_cost),
                "transport_total": int(transport_cost),
                "total_estimated": int(duration_days * (hotel_cost + food_cost) + activities_cost + transport_cost)
            },
            "itinerary_days": days
        }

class SimulationService:
    @staticmethod
    def run_twin_scenario(destination, sustainability_metric, base_businesses, load_increase_pct):
        """
        Simulates the effect of scaling visitor load on infrastructure and environment.
        Uses deterministic equations to calculate stress indicators.
        """
        multiplier = 1.0 + (load_increase_pct / 100.0)
        
        # Base indicators
        base_crowding = (destination.current_tourists / destination.safe_capacity) * 100 if destination.safe_capacity else 50
        base_occupancy = (sustainability_metric.crowd_density if sustainability_metric else 0.6) * 100
        
        # Simulate indicators
        sim_crowd = min(100, base_crowding * multiplier)
        sim_occupancy = min(100, base_occupancy * (1.0 + 0.5 * (load_increase_pct / 100.0)))
        
        traffic_val = 40 + (load_increase_pct * 0.55)
        traffic_pressure = "Low"
        if traffic_val > 75:
            traffic_pressure = "High"
        elif traffic_val > 50:
            traffic_pressure = "Medium"
            
        env_val = 30 + (load_increase_pct * 0.6)
        env_pressure = "Low"
        if env_val > 70:
            env_pressure = "High"
        elif env_val > 45:
            env_pressure = "Medium"
            
        sat_val = max(10, 90 - (load_increase_pct * 0.45))
        
        # Redistribution recommendation
        redistribute_visitors = 0
        advice = "Tourist concentrations are stable."
        
        projected_visitors = int(destination.current_tourists * multiplier)
        if projected_visitors > destination.safe_capacity:
            redistribute_visitors = projected_visitors - destination.safe_capacity
            advice = f"Redistribute approximately {redistribute_visitors:,} tourists to nearby alternative destinations to reduce crowding risk."
            
        return {
            "load_increase_pct": load_increase_pct,
            "metrics_before": {
                "crowding": int(base_crowding),
                "hotel_occupancy": int(base_occupancy),
                "traffic_pressure": "Medium" if base_crowding > 60 else "Low",
                "environmental_pressure": "Low"
            },
            "metrics_after": {
                "crowding": int(sim_crowd),
                "hotel_occupancy": int(sim_occupancy),
                "traffic_pressure": traffic_pressure,
                "environmental_pressure": env_pressure,
                "tourist_satisfaction": int(sat_val)
            },
            "redistribution_needed": redistribute_visitors,
            "ai_advice": advice
        }
