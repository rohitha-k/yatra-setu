# YatraSetu API Reference

This document catalogs the REST endpoints mounted on the Node.js Express server.

---

## 1. Authentication
* **POST `/api/auth/register`**: Registers a new user or partner.
* **POST `/api/auth/login`**: Authenticates credentials and returns a JWT.

## 2. Itinerary & Optimization
* **POST `/api/itineraries/optimize`**: Parses traveler count, starting location, destination, and budget limit, returning an optimized itemized trip.
* **POST `/api/itineraries/reoptimize`**: Recalculates costs when a traveler upgrades a stay or service without silently modifying other selections.
* **POST `/api/itineraries/save`**: Persists an itinerary to the user's account.
* **GET `/api/itineraries/user`**: Retrieves saved itineraries for the logged-in user.

## 3. Vendors & Trust
* **POST `/api/vendors/video`**: Uploads a guesthouse video walkthrough link.
* **GET `/api/vendors/bookings`**: Retrieves active bookings for the partner.

## 4. Admin & Authority Controls
* **GET `/api/admin/vendors`**: Returns all partner accounts for registration license review.
* **POST `/api/admin/verify`**: Sets a partner's verification status (e.g., `VERIFIED`, `REJECTED`).
* **GET `/api/admin/analytics`**: Returns system-wide tourism budgets and metrics.

## 5. Conversational AI Assistant
* **POST `/api/ai/chat`**: Conversational chat interface that extracts travel intents and returns budget recommendations.
