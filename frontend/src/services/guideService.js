import { MOCK_GUIDES } from '../data/mockData';

export const guideService = {
  getGuidesByDestination: async (destination = '') => {
    if (!destination) return MOCK_GUIDES.slice(0, 2);
    const destClean = String(destination).trim().toLowerCase();

    const matches = MOCK_GUIDES.filter(g => {
      const gDest = g.destination.toLowerCase();
      return destClean.includes(gDest) || gDest.includes(destClean);
    });

    if (matches.length > 0) return matches;

    const titleCaseDest = destination.trim().charAt(0).toUpperCase() + destination.trim().slice(1);
    return [
      { id: `g_custom_1`, destination: titleCaseDest, name: `Ramesh ${titleCaseDest} Heritage Guide`, pricePerDay: 750, trustScore: 94 }
    ];
  },
  book: async (guideId, details) => {
    return {
      success: true,
      bookingId: "GDE-BK-" + Math.floor(100000 + Math.random() * 900000)
    };
  }
};
