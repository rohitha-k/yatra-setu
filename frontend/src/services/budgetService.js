import { MOCK_HOTELS, MOCK_RESTAURANTS, MOCK_GUIDES, MOCK_TRANSPORTS } from '../data/mockData';

export const calculateRemainingBudget = (params) => {
  const {
    totalBudget,
    transportCost = 0,
    stayCost = 0,
    foodCost = 0,
    guideCost = 0
  } = params;

  return totalBudget - (transportCost + stayCost + foodCost + guideCost);
};

export const optimizeBudgetTrip = (params) => {
  const {
    startingLocation,
    destination,
    daysCount = 3,
    travelersCount = 2,
    budgetLimit = 15000,
    travelMode = 'Train'
  } = params;

  // Filter items
  const transports = MOCK_TRANSPORTS.filter(t => t.source === startingLocation && t.destination === destination);
  const hotels = MOCK_HOTELS.filter(h => h.destination === destination);
  const eateries = MOCK_RESTAURANTS.filter(r => r.destination === destination);
  const guides = MOCK_GUIDES.filter(g => g.destination === destination);

  const selectedTransport = transports.find(t => t.type.toUpperCase() === travelMode.toUpperCase()) || transports[0];
  const transportCost = selectedTransport ? selectedTransport.pricePerSeat * travelersCount : 350 * travelersCount;

  const roomCount = Math.ceil(travelersCount / 2);
  const selectedAccommodation = hotels[0] || { name: "Local Homestay", pricePerNight: 1200, facilities: ['Wi-Fi'] };
  const stayCost = selectedAccommodation.pricePerNight * daysCount * roomCount;

  const selectedFood = eateries[0] || { name: "Local Restaurant", averageMealCost: 150 };
  const foodCost = selectedFood.averageMealCost * travelersCount * daysCount * 3;

  const selectedGuide = budgetLimit > 12000 && guides.length > 0 ? guides[0] : null;
  const guideCost = selectedGuide ? selectedGuide.pricePerDay * daysCount : 0;

  const totalCost = transportCost + stayCost + foodCost + guideCost;

  return {
    totalBudget: budgetLimit,
    transportCost,
    stayCost,
    foodCost,
    guideCost,
    remainingBudget: budgetLimit - totalCost,
    selectedAccommodation,
    selectedFood,
    selectedGuide,
    selectedTransport
  };
};
