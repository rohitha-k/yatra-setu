import { MOCK_HOTELS } from '../data/mockData';

export const hotelService = {
  getHotelsByDestination: async (destination = '') => {
    if (!destination) return MOCK_HOTELS.slice(0, 2);
    const destClean = String(destination).trim().toLowerCase();
    
    // Fuzzy match against mock dataset
    const matches = MOCK_HOTELS.filter(h => {
      const hDest = h.destination.toLowerCase();
      return destClean.includes(hDest) || hDest.includes(destClean);
    });

    if (matches.length > 0) return matches;

    // Dynamic fallback for custom/unlisted destinations
    const titleCaseDest = destination.trim().charAt(0).toUpperCase() + destination.trim().slice(1);
    return [
      { id: `h_custom_1`, destination: titleCaseDest, name: `${titleCaseDest} Heritage Stay & Homestay`, pricePerNight: 1200, trustScore: 92, isGovernmentApproved: true, facilities: ['Clean Restrooms', 'Wi-Fi', 'Hot Water'] },
      { id: `h_custom_2`, destination: titleCaseDest, name: `${titleCaseDest} Grand Royal Resort`, pricePerNight: 2400, trustScore: 95, isGovernmentApproved: true, facilities: ['AC Rooms', 'Pool', 'Free Breakfast'] }
    ];
  },
  book: async (hotelId, details) => {
    return {
      success: true,
      bookingId: "HTL-BK-" + Math.floor(100000 + Math.random() * 900000)
    };
  }
};
