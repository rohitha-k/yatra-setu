import { dbAdapter } from '../config/db.js';

class BudgetOptimizer {
  static async optimizeTrip(params) {
    const {
      startingLocation = "Hyderabad",
      destination = "Hampi",
      travelersCount = 1,
      daysCount = 1,
      budgetLimit = 15000,
      travelMode = 'Train',
      mileage = 15,
      activitiesCost = 1500,
      localTransitCost = 800
    } = params;

    // Fetch options from database adapter
    const allTransports = await dbAdapter.find('transports', { source: startingLocation, destination: destination });
    const allAccommodations = await dbAdapter.find('hotels', { destination: destination });
    const allRestaurants = await dbAdapter.find('restaurants', { destination: destination });
    const allGuides = await dbAdapter.find('guides', { destination: destination });

    // 1. Calculate Transport Cost (Priority 7 - Own Vehicle calculations)
    let transportCost = 0;
    let tollFares = 0;
    let distanceKm = 380; // Default Hyderabad to Hampi

    if (destination === 'Araku Valley') { distanceKm = 620; tollFares = 520; }
    else if (destination === 'Tirupati') { distanceKm = 580; tollFares = 480; }
    else if (destination === 'Varanasi') { distanceKm = 1100; tollFares = 950; }

    const isOwnVehicle = travelMode.toUpperCase() === 'OWN VEHICLE';

    if (isOwnVehicle) {
      const fuelLiters = Math.round(distanceKm / mileage);
      const fuelCost = fuelLiters * 100; // Rs.100 per liter
      const parkingFee = 250;
      transportCost = fuelCost + tollFares + parkingFee;
    } else {
      const selectedTransport = allTransports.find(t => t.type.toUpperCase() === travelMode.toUpperCase()) || allTransports[0];
      transportCost = selectedTransport ? selectedTransport.pricePerSeat * travelersCount : 350 * travelersCount;
    }

    // 2. Stay Cost (default rooms: 1 per 2 travelers)
    const selectedAccommodation = allAccommodations.find(h => h.pricePerNight * daysCount * Math.ceil(travelersCount / 2) <= budgetLimit * 0.4) || allAccommodations[0] || { name: "Local Homestay", pricePerNight: 1200 };
    const roomCount = Math.ceil(travelersCount / 2);
    let stayCost = selectedAccommodation.pricePerNight * daysCount * roomCount;

    // 3. Food Cost (3 meals per day)
    const selectedFood = allRestaurants[0] || { name: "Local Restaurant", averageMealCost: 150 };
    let foodCost = selectedFood.averageMealCost * travelersCount * daysCount * 3;

    // 4. Guide Cost (Optional based on budget threshold)
    const selectedGuide = budgetLimit > 12000 && allGuides.length > 0 ? allGuides[0] : null;
    let guideCost = selectedGuide ? selectedGuide.pricePerDay * daysCount : 0;

    // 5. Total Sum (Priority 2 cost equations)
    const totalPlannedCost = transportCost + stayCost + foodCost + guideCost + activitiesCost + localTransitCost;
    const remaining = budgetLimit - totalPlannedCost;

    // 6. Budget Status Classification (Comfortable, Tight, Over Budget)
    const utilizationPct = parseFloat(((totalPlannedCost / budgetLimit) * 100).toFixed(2));
    let budgetStatus = "Comfortable";
    if (totalPlannedCost > budgetLimit) {
      budgetStatus = "Over Budget";
    } else if (totalPlannedCost > budgetLimit * 0.85) {
      budgetStatus = "Tight";
    }

    return {
      startingLocation,
      destination,
      travelersCount,
      daysCount,
      budgetLimit,
      totalPlannedCost,
      remainingBudget: remaining,
      budgetUtilization: utilizationPct,
      budgetStatus,
      travelMode,
      selectedTransport: {
        type: travelMode,
        cost: transportCost,
        details: isOwnVehicle ? `Own Vehicle: ${distanceKm} km, Tolls: ₹${tollFares}` : "Transit Seats"
      },
      selectedAccommodation: {
        name: selectedAccommodation.name,
        pricePerNight: selectedAccommodation.pricePerNight,
        cost: stayCost
      },
      selectedFood: {
        name: selectedFood.name,
        averageMealCost: selectedFood.averageMealCost,
        cost: foodCost
      },
      selectedGuide: selectedGuide ? {
        name: selectedGuide.name,
        pricePerDay: selectedGuide.pricePerDay,
        cost: guideCost
      } : null,
      activitiesCost,
      localTransitCost
    };
  }

  static async reoptimizeTrip(params, updatedItem, category) {
    const { budgetLimit, currentTrip } = params;
    const updatedTrip = {
      ...currentTrip,
      [category]: updatedItem
    };

    const total = (updatedTrip.selectedTransport?.cost || 0) +
                  (updatedTrip.selectedAccommodation?.cost || 0) +
                  (updatedTrip.selectedFood?.cost || 0) +
                  (updatedTrip.selectedGuide?.cost || 0) +
                  (updatedTrip.activitiesCost || 1500) +
                  (updatedTrip.localTransitCost || 800);

    const utilizationPct = parseFloat(((total / budgetLimit) * 100).toFixed(2));
    let budgetStatus = "Comfortable";
    if (total > budgetLimit) {
      budgetStatus = "Over Budget";
    } else if (total > budgetLimit * 0.85) {
      budgetStatus = "Tight";
    }

    return {
      ...updatedTrip,
      totalPlannedCost: total,
      remainingBudget: budgetLimit - total,
      budgetUtilization: utilizationPct,
      budgetStatus
    };
  }
}

export default BudgetOptimizer;
