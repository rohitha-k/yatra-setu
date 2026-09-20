# YatraSetu AI Assistant Integration

This document describes how the AI conversational travel planner works.

---

## 1. Natural Language Parser Intent Extraction

The conversational interface maps natural language user queries to structured travel parameters:

* **Destination Mapping**: RegEx patterns parse mentions of popular destinations (Hampi, Araku Valley, Tirupati).
* **Budget Extraction**: Matches currency symbols and numeric values (e.g. "₹12,000" or "15000").
* **Duration Parsing**: Identifies target trip lengths (e.g. "3 days" or "5 days").
* **Travelers Count**: Infers counts from context keywords (e.g., "solo" = 1, "couple" = 2, "family" = 4).

---

## 2. API Schema Validation

1. **Submit**: The user inputs a message in the chat assistant.
2. **Intent Parsing**: The `/api/ai/chat` endpoint processes the text.
3. **Execution**: The extracted parameters are validated and passed to the budget optimization engine.
4. **Response**: The AI returns a natural text explanation showing cost breakdowns, alongside structured itinerary payloads.
