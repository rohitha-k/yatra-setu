# YatraSetu External Integrations Status

This document catalogs the state of every integration in the YatraSetu ecosystem.

| Integration | Type | Source / Status | Future / Replacement |
| :--- | :--- | :--- | :--- |
| **Maps & Routing** | LIVE | OpenStreetMap via Leaflet tiles | Commercial Mapbox / Google Maps API |
| **Flight Bookings** | MOCK | `mockFlightProvider.js` | DGCA / Airline reservation API |
| **Train Booking** | MOCK | `mockTrainProvider.js` | IRCTC Partner API integration |
| **Bus Tickets** | MOCK | `mockBusProvider.js` | AbhiBus / redBus API integration |
| **Payments Gateway** | MOCK | simulated UPI / Transaction registers | Razorpay / PayU gateway sandboxes |
| **Highway Services** | SEED | coordinates matching actual NHAI facilities | NHAI live Rest Stop API datasets |
| **Tourism Spots** | SEED | PRASHAD pilgrim and Swadesh Darshan metadata | Ministry of Tourism API catalog |
| **AI NLP Assistant** | MOCK | deterministic regex-based regex mapper | OpenAI / Google Gemini LLM API keys |
