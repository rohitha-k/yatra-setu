# YatraSetu — SIH Jury Demonstration Script

Use this structured walkthrough to deliver a 3-minute, high-impact demonstration of the YatraSetu platform to the Smart India Hackathon jury.

---

## 1. Opening — The Problem Statement
> *"Jury members, tourists often plan trips service-by-service. They search for transport, hotel, dining, and activities separately, hoping it all fits their budget. More often than not, this leads to budget inflation, unexpected toll charges, and unverified local guides. YatraSetu reverses the process: Instead of starting with a booking, the traveler starts with a budget."*

---

## 2. Step 1: Starting the Sandbox (Plan My Trip)
1. Navigate to the homepage. Show the clean entry screen with the tagline: **"Plan Your Journey Within Your Budget."**
2. Show the **DEMO PORTAL** role switcher in the top right. Select **Tourist (Plan Trip)**.
3. On the planning parameters form, input:
   - **Starting From**: `Hyderabad`
   - **Preferred Destination**: `Hampi` (PRASHAD pilgrim and heritage destination)
   - **Travelers Count**: `3`
   - **Number of Days**: `3`
   - **Travel Dates**: (Pick any future date)
   - **Total Budget**: `₹15,000`
   - **Emergency Buffer**: `₹2,000` (Sets the spendable budget threshold to ₹13,000)
4. Click **Find Destinations**.

---

## 3. Step 2: The Budget Wizard & Own Vehicle Heuristics
1. From the Destinations Catalog, click **Hampi**.
2. Explain that the user is now in the **YatraSetu Wizard**:
   - **Step 1 (Transport)**: Explain that the traveler is using their own car. Point to the **Own Vehicle Route Calculator** displaying:
     - Distance: **380 km**
     - Fuel needed: **25 Liters**
     - Fuel cost (calculated at ₹100/L): **₹2,500**
     - NHAI Toll Plaza fees: **₹320**
     - Slide the mileage slider to **15 km/l** to show dynamic cost updating.
   - **Steps 2 to 6 (Stays, Food, Guides)**: Show how verified local services are chosen. Highlight the **✓ Verified** badges and point to the **Trust Scores (e.g. 94/100)**.
   - **Step 7 (Final Itinerary)**: Highlight the **Interactive YatraMap** (rendered using Leaflet) showing route lines and safety stops (restrooms, EV fast chargers, mechanics).
3. Click **Confirm & Book Services**.

---

## 4. Step 3: Upgrading and Recalculations ("Find Alternatives")
1. On the optimized itinerary screen, show that the cost is ₹12,600, which fits under the spendable limit of ₹13,000 (Status: **🟢 Comfortable**).
2. Click **Upgrade Stay** to Vijayanagara Royal Resort.
3. Show that the total used cost jumps to **₹22,500**, which exceeds the limit (Status changes to **🔴 Over Budget**).
4. Point to the dynamic warning box: **"Trip exceeds your current budget by ₹9,500."**
5. Point to the **Find Cheaper Stays** alternative panel:
   - Click **Matanga Hill Guesthouse (₹600/n)**.
   - Show that the budget status immediately recalculates and reverts back to **🟢 Comfortable (₹10,800 used)**.

---

## 5. Step 4: The Conversational AI Assistant
1. Navigate to the **AI Assistant** tab.
2. Click the preset: *"I have ₹12,000 for 3 days in Hampi"*.
3. Show how the parser extracts structured parameters and queries the YatraSetu engine to draft a plan.
