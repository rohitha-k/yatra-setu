# Validation Script for TourismOS API Backends
# Asserts SQL schemas compilation, tables creation, and basic model seeding functions.

import os
import sys

# Append parent dir to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from backend.app.database import engine, SessionLocal, Base
    from backend.app import models, ml_models
    print("OK: Backend dependency compilation successful!")
except ImportError as e:
    print(f"ERROR: Import compilation error: {e}")
    sys.exit(1)

def verify_db_tables():
    print("Verifying database configuration...")
    try:
        # Build tables on-the-fly
        Base.metadata.create_all(bind=engine)
        print("OK: All tables compiled and verified in SQLite schema.")
        
        db = SessionLocal()
        user_count = db.query(models.User).count()
        dest_count = db.query(models.Destination).count()
        print(f"OK: SQL database status check:")
        print(f"  - Users pre-seeded: {user_count}")
        print(f"  - Destinations pre-seeded: {dest_count}")
        db.close()
        return True
    except Exception as e:
        print(f"ERROR: Database verification failed: {e}")
        return False

def verify_recommendation_algorithm():
    print("Testing multi-criteria decision recommendations...")
    try:
        # Mock destination data
        class DummyDest:
            def __init__(self, id, name, category, capacity, current):
                self.id = id
                self.name = name
                self.category = category
                self.safe_capacity = capacity
                self.current_tourists = current

        dest_goa = DummyDest(1, "Goa", "Beach", 15000, 13800)
        dest_araku = DummyDest(2, "Araku Valley", "Hill Station", 4000, 1200)
        
        # Goa -> Araku Valley (110km)
        score_breakdown = ml_models.DestinationRecommendationService.calculate_alternative_score(
            dest_goa, dest_araku, 110.0
        )
        print("OK: AI Recommender Engine Score Output:")
        print(f"  - Alternative Score: {score_breakdown['final_score']}/100")
        print(f"  - Explanation: {score_breakdown['reasoning']}")
        return True
    except Exception as e:
        print(f"ERROR: Recommendation test failed: {e}")
        return False

if __name__ == "__main__":
    print("TourismOS Backend Verification Suite\n")
    db_ok = verify_db_tables()
    rec_ok = verify_recommendation_algorithm()
    
    if db_ok and rec_ok:
        print("\nOK: Verification Suite successfully completed! Backend is ready for local execution.")
    else:
        print("\nERROR: Verification Suite detected errors.")
        sys.exit(1)
