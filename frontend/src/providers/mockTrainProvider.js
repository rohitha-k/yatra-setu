export const mockTrainProvider = {
  name: "Indian Railways IRCTC",
  search: async (from, to, date) => {
    return [
      { id: "TR-12727", name: "Shatabdi Express", pricePerSeat: 850, time: "06:00", duration: "7h" },
      { id: "TR-12759", name: "Vande Bharat Express", pricePerSeat: 1400, time: "15:00", duration: "5.5h" }
    ];
  },
  book: async (trainId, details) => {
    return {
      success: true,
      bookingReference: "TR-PNR-" + Math.floor(1000000000 + Math.random() * 9000000000),
      provider: "Indian Railways IRCTC"
    };
  }
};
