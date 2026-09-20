export const mockFlightProvider = {
  name: "SkyIndia Flights",
  search: async (from, to, date) => {
    return [
      { id: "FL-101", carrier: "IndiGo", pricePerSeat: 3500, time: "07:30", duration: "1.5h" },
      { id: "FL-202", carrier: "Air India", pricePerSeat: 4200, time: "14:15", duration: "1.5h" }
    ];
  },
  book: async (flightId, details) => {
    return {
      success: true,
      bookingReference: "FL-BK-" + Math.floor(100000 + Math.random() * 900000),
      provider: "SkyIndia Flights"
    };
  }
};
