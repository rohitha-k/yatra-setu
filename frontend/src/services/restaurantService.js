import { MOCK_RESTAURANTS } from '../data/mockData';

export const restaurantService = {
  getRestaurantsByDestination: async (destination = '') => {
    if (!destination) return MOCK_RESTAURANTS.slice(0, 2);
    const destClean = String(destination).trim().toLowerCase();

    const matches = MOCK_RESTAURANTS.filter(r => {
      const rDest = r.destination.toLowerCase();
      return destClean.includes(rDest) || rDest.includes(destClean);
    });

    if (matches.length > 0) return matches;

    const titleCaseDest = destination.trim().charAt(0).toUpperCase() + destination.trim().slice(1);
    return [
      { id: `r_custom_1`, destination: titleCaseDest, name: `${titleCaseDest} Heritage Cuisine`, averageMealCost: 180, trustScore: 92 },
      { id: `r_custom_2`, destination: titleCaseDest, name: `${titleCaseDest} Udupi Pure Veg Diner`, averageMealCost: 120, trustScore: 90 }
    ];
  },
  bookTable: async (restaurantId, details) => {
    return {
      success: true,
      reservationId: "RST-RES-" + Math.floor(100000 + Math.random() * 900000)
    };
  }
};
