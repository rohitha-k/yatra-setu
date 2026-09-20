import json
import urllib.request
import sys

def test_optimization():
    print("Testing Travexa Optimization Engine...")
    url = "http://127.0.0.1:8000/api/itineraries/optimize"
    payload = {
        "startingLocation": "Hyderabad",
        "destination": "Hampi",
        "daysCount": 3,
        "travelersCount": 2,
        "budgetLimit": 15000,
        "travelMode": "Train",
        "preferences": {
            "classTier": "Standard",
            "companion": "Friends",
            "foodPreference": "Veg",
            "governmentPriority": True
        }
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            
            print("\nOptimization Response Verified:")
            print("====================================")
            print(f"Destination: {data.get('destination')}")
            print(f"Travelers: {data.get('travelersCount')}")
            print(f"Days: {data.get('daysCount')}")
            print(f"Target Budget Limit: INR {data.get('budgetLimit')}")
            print(f"Total Cost Calculated: INR {data.get('totalPlannedCost')}")
            print(f"Remaining Budget: INR {data.get('remainingBudget')}")
            print(f"Emergency Buffer: INR {data.get('emergencyBuffer')}")
            
            # Assertions
            total_planned = data.get('totalPlannedCost', 0)
            budget_limit = data.get('budgetLimit', 15000)
            
            if total_planned <= budget_limit:
                print("\n[OK] ASSERTION PASSED: Total cost <= Target Budget constraint.")
            else:
                print("\n[ERROR] ASSERTION FAILED: Total cost exceeds budget limits.")
                sys.exit(1)
                
            if data.get('selectedAccommodation') is not None:
                print("[OK] Selected verified accommodation.")
            else:
                print("[ERROR] Failed to match suitable accommodation.")
                sys.exit(1)
                
    except Exception as e:
        print(f"[ERROR] Connection to Express backend failed: {e}")
        print("Please ensure the Node Express server is running on port 8000.")
        sys.exit(1)

if __name__ == "__main__":
    test_optimization()
