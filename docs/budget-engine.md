# YatraSetu Budget Optimization Engine

This document details the cost optimization and recalculation mechanics of the **YatraSetu** platform.

---

## 1. Multi-tier Cost Allocations

The optimization engine calculates a trip proposal based on target bounds:

- **Accommodation**: Rooms needed are calculated as `Math.ceil(travelersCount / 2)`. Pricing tier is matched based on the budget limit:
  - Low budget (< ₹8,000): Budget Homestay
  - Standard (₹8,000 to ₹30,000): Standard Guesthouse
  - Premium (> ₹30,000): Premium Resort
- **Dining**: Allocated at 3 meals per traveler per day.
- **Transport**: Calculated based on the user's travel mode (Flight, Train, Bus, or Own Vehicle).
- **Tour Guide**: Added dynamically if the budget exceeds ₹12,000.

---

## 2. Interactive Recalculation Flow

When a user modifies a travel option:
1. The new price is captured.
2. The total trip cost is recalculated.
3. The remaining budget is adjusted.
4. If the updated cost exceeds the budget, the system displays a warning block and offers options to choose lower-cost stays, review details, or increase the budget by ₹5,000.
5. No other categories (food, activities, transit) are altered without the user's explicit consent.
