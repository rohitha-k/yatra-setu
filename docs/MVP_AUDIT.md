# YatraSetu MVP Audit Report

This report presents the final capability audit, database integrations review, security verification, and the recommended demonstration flow for the **YatraSetu** platform.

---

## 1. Implemented (Genuinely Work & Connected to DB)
* **Register, Login & Logout**: Secure credentials hashing, token storage, and authentication using JWT.
* **Role-Based Access Control (RBAC)**: Backend role guards (`authorizeRoles`) block unauthorized actions.
* **Budget Planning Wizard**: Dynamically matches transport, stay, guide, and eateries to fit under budget targets.
* **Dynamic Budget Recalculations**: Modifying selections immediately updates the total cost and displays status badges:
  - 🟢 **Comfortable**: Cost utilizes $< 85\%$ of the budget.
  - 🟡 **Tight**: Cost utilizes between $85\%$ and $100\%$ of the budget.
  - 🔴 **Over Budget**: Cost exceeds the budget limit (triggers action prompts).
* **Own-Vehicle Heuristics**: Computes distance, mileage-based fuel consumption, fuel costs (₹100/L), and toll fares.
* **Leaflet Map Routing**: Interactively renders paths, coordinate markers, and NHAI highway facilities overlays (⛽ Fuel, 🚻 Restrooms, 🛠 Mechanics).
* **Trust Score Breaks (0–100)**: Backend `TrustEngine` evaluates point scores (GST verify, walkthrough video, ratings, complaints).

---

## 2. Partially Implemented (UI & Database Connected)
* **Bookings & complaints**: Database models exist and are queried. Mocks act as fallbacks if the collection is empty.
* **Admin verification**: The authority panel can Verify or Reject guesthouses, updating MongoDB/JSON.

---

## 3. Demo / Mock Details
* **External APIs**: Flights search and payment confirmations are simulated using mock providers to ensure reliability.
* **AI Chat Intent Parsing**: Regex parser extracts destination, days, travelers, and budget goals, feeding them directly to the optimizer.

---

## 4. External Dependencies
* **OpenStreetMap Tile Server**: Used for rendering interactive dark maps.
* **Google Fonts**: Inter font family styles.

---

## 5. Known Limitations
* Real-world GPS mapping requires external commercial API keys (e.g., Google Maps API or Mapbox) which are mocked for local testing.

---

## 6. Testing Results
* **Backend Verification**: `verify_yatrasetu.py` tests executed successfully:
  - Asserted total trip cost is within the target budget constraint.
  - Verification response parsed with code `0`.
* **Frontend compilation**: Compiles clean without warnings.

---

## 7. Recommended SIH Demonstration Flow ("Golden Path")
1. **Login**: Access the entry screen. Log in using `tourist@yatrasetu.gov.in` (password `password123`).
2. **Setup Trip**: Enter starting city: **Hyderabad**, destination: **Hampi**, Budget Limit: **₹15,000**, travel mode: **Own Vehicle**.
3. **Planner**:
   - Check Step 1 (Transport): Toggle the mileage slider (e.g., 15 km/l). Notice the fuel usage and toll fares updating.
   - Proceed through Steps 2-6 (Stays, Dining, Guide).
   - Check Step 7 (Final Itinerary): View the interactive **Leaflet YatraMap** showing the route path and nearby amenities.
4. **Upgrade Stay**: On the results page, click **Upgrade Stay** to Vijayanagara Royal Resort.
   - The budget status updates to **🔴 Over Budget**.
   - Click **Increase Budget (+₹6,000)**.
   - The status reverts to **🟢 Comfortable**.
5. **AI Assistant**: Navigate to the **AI Assistant** tab. Click the preset: *"I have ₹12,000 for 3 days in Hampi"*.
   - The AI parses the parameters, processes the optimization, and renders the matched cost breakdown.
