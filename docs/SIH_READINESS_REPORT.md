# YatraSetu — SIH Demo Readiness Report

This report confirms the validation of YatraSetu's MVP capabilities for the Smart India Hackathon jury review.

---

## 1. Feature Status & Verification

| Module / Feature | Backend Schema | Verification Status | Notes |
| :--- | :--- | :--- | :--- |
| **Budget Planning Wizard** | `trips`, `itineraries` | **PASSING** | Correctly maps starting location and limit inputs. |
| **Budget Status Badges** | calculated inline | **PASSING** | Renders 🟢 Comfortable, 🟡 Tight, or 🔴 Over Budget. |
| **Own-Vehicle Calculator** | computed inline | **PASSING** | Calculates fuel litrage, cost (₹100/L), and toll fares. |
| **Leaflet Maps Routing** | interactive map | **PASSING** | Renders starting and ending nodes, polyline, and NHAI pins. |
| **AI Travel Assistant** | `/api/ai/chat` | **PASSING** | Regex extracts intents (family, solo) and queries the optimizer. |
| **Trust Score Breakdown** | `trustScores` | **PASSING** | Backend `TrustEngine` computes score details out of 100 points. |
| **Access Guards (RBAC)** | `/me`, `/admin/*` | **PASSING** | Unauthorized calls reject with code `401`/`403`. |

---

## 2. Test Results

### Automated Backend Tests (`verify_yatrasetu.py`)
- **Optimization engine**: Cost calculation matches limits (Hampi 3-day target budget ₹15,000, computed ₹12,600).
- **Access control**: Request to `/api/admin/vendors` without authorization header rejected with code `401`.

### Frontend Compilations
- React frontend compiled successfully under Vite with zero dependency resolution errors.

---

## 3. Demo Credentials
* **Tourist**: `tourist@yatrasetu.gov.in` (password `password123`)
* **Vendor**: `vendor@yatrasetu.gov.in` (password `password123`)
* **Admin**: `admin@yatrasetu.gov.in` (password `password123`)

---

## 4. Golden Path Instructions
1. Navigate to `http://localhost:5173`.
2. Select **Tourist (Plan Trip)** from the Sandbox role-switcher.
3. Input:
   - Starting City: **Hyderabad**
   - Destination: **Hampi**
   - travelers: **3**
   - Duration: **3 days**
   - Budget: **₹15,000**
   - Travel Mode: **Own Vehicle**
4. Click **Plan My Budget Trip**.
5. Step through the wizard:
   - Step 1 (Transport): Set mileage slider to **15 km/l**. Estimated fuel cost is ₹2,500, tolls ₹320.
   - Step 2 (Stays): Select **Hampi Heritage Homestay** (₹1,200/night).
   - Step 3 (Dining): Select **Mango Tree Cuisine Hampi** (₹200/meal).
   - Step 4 (Guides): Select **Ramesh Hampi Heritage Guide** (₹800/day).
   - Steps 5 & 6 (Activities & Local Transit): Verify defaults are computed.
   - Step 7 (Final Itinerary): View interactive Leaflet Map routing.
6. Click **Confirm & Book Services**.
7. Navigate to **Optimized Itinerary** page.
8. Click **Upgrade Stay** to Vijayanagara Royal Resort. The status badge will change to **🔴 Over Budget**.
9. Click **Increase Budget** to set the new limit. The badge immediately updates.
10. Navigate to **AI Assistant** tab and input: *"I have ₹12,000 for 3 days in Hampi as a family trip with my own car"*. Verify the extracted params.
