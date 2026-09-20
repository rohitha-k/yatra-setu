# TourismOS API Documentation

All endpoints are hosted locally at `http://127.0.0.1:8000` by default.

---

## 1. Authentication (`/api/auth`)

### Register User
* **URL**: `/api/auth/register`
* **Method**: `POST`
* **Payload**:
  ```json
  {
    "username": "new_user",
    "email": "user@tourismos.gov.in",
    "password": "password123",
    "role": "TOURIST"
  }
  ```

### User Login
* **URL**: `/api/auth/login`
* **Method**: `POST` (Form Urlencoded)
* **Parameters**: `username`, `password`
* **Response**:
  ```json
  {
    "access_token": "jwt_token_string",
    "token_type": "bearer",
    "role": "TOURIST",
    "username": "new_user"
  }
  ```

---

## 2. Destinations (`/api/destinations`)

### List Destinations
* **URL**: `/api/destinations/`
* **Method**: `GET`
* **Response**: Array of destination indicators (safe capacity, current count).

### Detailed Destination Health
* **URL**: `/api/destinations/{id}`
* **Method**: `GET`
* **Response**: Breakdown of Tourism Impact Score (TIS), local economic benefits, and points of interest.

---

## 3. Flow Intelligence & Recommendations (`/api/recommendations`)

### Get Match Alternatives
* **URL**: `/api/recommendations/alternatives`
* **Method**: `GET`
* **Parameters**: `destination_id=int`
* **Response**: Details on why 3 alternative spots are recommended (similarity, distance, savings).

---

## 4. Digital Twin Simulation (`/api/simulation`)

### Run Stress Simulation
* **URL**: `/api/simulation/twin`
* **Method**: `GET`
* **Parameters**: `destination_id=int`, `load_increase_pct=float`
* **Response**: Simulates water capacity, electricity grid strain, road delays, and provides redistribution advice.
