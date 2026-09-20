import json
import urllib.request
import sys

def test_optimization():
    print("Testing YatraSetu Optimization Engine...")
    url = "http://127.0.0.1:8000/api/itineraries/optimize"
    payload = {
        "startingLocation": "Hyderabad",
        "destination": "Hampi",
        "daysCount": 3,
        "travelersCount": 2,
        "budgetLimit": 15000,
        "travelMode": "Train"
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
            
            print("\n[OK] Optimization Response Verified.")
            print(f"  Destination: {data.get('destination')}")
            print(f"  Total Cost Calculated: INR {data.get('totalPlannedCost')}")
            
            # Assertions
            total_planned = data.get('totalPlannedCost', 0)
            budget_limit = data.get('budgetLimit', 15000)
            
            if total_planned <= budget_limit:
                print("  [OK] ASSERTION PASSED: Total cost <= Target Budget constraint.")
            else:
                print("  [ERROR] ASSERTION FAILED: Total cost exceeds budget limits.")
                sys.exit(1)
                
    except Exception as e:
        print(f"[ERROR] Connection to Express backend failed: {e}")
        sys.exit(1)

def test_security_rbac():
    print("\nTesting YatraSetu Security RBAC Guards...")
    # Attempting to call protected admin list with no token (Should return 401)
    url = "http://127.0.0.1:8000/api/admin/vendors"
    
    req = urllib.request.Request(url, method='GET')
    
    try:
        urllib.request.urlopen(req, timeout=5)
        print("[ERROR] Security check failed: Allowed anonymous access to Admin endpoints!")
        sys.exit(1)
    except urllib.error.HTTPError as e:
        if e.code in [401, 403]:
            print(f"  [OK] ASSERTION PASSED: Request rejected with code {e.code} (Unauthorized/Forbidden).")
        else:
            print(f"[ERROR] Security check returned unexpected HTTP code: {e.code}")
            sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Security connection error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_optimization()
    test_security_rbac()
