# YatraSetu — Budget-First Trusted Tourism Ecosystem

### "Plan Your Journey Within Your Budget."

**Budget-first. Verified. Intelligent. Connected.**

YatraSetu is a decision intelligence travel ecosystem designed for the **Smart India Hackathon (SIH)**. Unlike standard booking websites, YatraSetu reverses the flow: travelers input their budget first, and the system dynamically recommends verified local accommodations, dining plans, transit modes, and tour guides that strictly fit their budget boundaries.

---

## 1. Core Problem & Innovation

### The Problem
Tourists face budget inflation during trips because they book accommodations, transit, and guide services in isolation. Furthermore, travelers face safety concerns due to unverified listings, hidden highway toll charges, and non-transparent pricing.

### The Solution
YatraSetu reverse-engineers the planning process:
1. **Budget-First Design**: Fits all travel components dynamically within the traveler's spendable limits.
2. **Explainable Trust Scoring (0–100)**: Computes trust indices using credentials, walkthrough video audits, and ratings.
3. **Interactive Mapping**: Renders route polylines and highway safety facilities (charging hubs, restrooms, mechanics).

---

## 2. Key Innovation Features
* **Own-Vehicle Calculator**: Computes fuel usage and toll fares dynamically based on mileage sliders.
* **Emergency Buffer Support**: Travelers can specify a safety buffer (e.g., ₹2,000) that the engine respects before allocating costs.
* **Find Alternatives**: Suggests lower-cost stays instantly if upgrades push the trip over budget.
* **Intelligent Travel Assistant**: Conversational chat interface parses travel parameters and maps them to optimization calculations.

---

## 3. Technology Stack
* **Frontend**: React (Vite), Tailwind CSS, Recharts, Leaflet/React Leaflet.
* **Backend**: Node.js, Express, Mongoose, JWT, Bcryptjs.
* **Database**: MongoDB (with local filesystem `db.json` fallback).

---

## 4. Database & Collection Schema
Includes 16 collections: `users`, `vendors`, `destinations`, `hotels`, `restaurants`, `guides`, `transports`, `verifications`, `reviews`, `trustScores`, `trips`, `itineraries`, `bookings`, `payments`, `complaints`, and `notifications`.

---

## 5. Setup & Running Instructions

### Installation
1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install --legacy-peer-deps
   ```

### Execution
1. Run backend server:
   ```bash
   cd backend
   node app.js
   ```
2. Run React frontend:
   ```bash
   cd frontend
   npm run dev
   ```

---

## 6. Demo Credentials 
Use the header dropdown switcher, or log in manually with the password **`password123`**:

* **Tourist Account**: `tourist@yatrasetu.gov.in`
* **Vendor Account**: `vendor@yatrasetu.gov.in`
* **Admin Account**: `admin@yatrasetu.gov.in`

*Note: These credentials are seeded automatically on database startup.*
