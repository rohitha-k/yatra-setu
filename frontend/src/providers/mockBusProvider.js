export const mockBusProvider = {
  name: "RedBus Partner Connect",
  search: async (from, to, date) => {
    return [
      { id: "BS-303", operator: "KSRTC", pricePerSeat: 450, time: "22:00", duration: "8h" },
      { id: "BS-404", operator: "APSRTC AC Sleeper", pricePerSeat: 950, time: "21:30", duration: "7.5h" }
    ];
  },
  book: async (busId, details) => {
    return {
      success: true,
      bookingReference: "BS-TKT-" + Math.floor(100000 + Math.random() * 900000),
      provider: "RedBus Partner Connect"
    };
  }
};
