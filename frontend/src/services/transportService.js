import { mockFlightProvider } from '../providers/mockFlightProvider';
import { mockTrainProvider } from '../providers/mockTrainProvider';
import { mockBusProvider } from '../providers/mockBusProvider';

export const transportService = {
  search: async (from, to, date, mode) => {
    const upperMode = mode ? mode.toUpperCase() : '';
    if (upperMode === 'FLIGHT') {
      return await mockFlightProvider.search(from, to, date);
    } else if (upperMode === 'TRAIN') {
      return await mockTrainProvider.search(from, to, date);
    } else if (upperMode === 'BUS') {
      return await mockBusProvider.search(from, to, date);
    } else if (upperMode === 'ALL' || upperMode === '') {
      // Aggregate all transport options including own vehicle
      const [flights, trains, buses] = await Promise.all([
        mockFlightProvider.search(from, to, date),
        mockTrainProvider.search(from, to, date),
        mockBusProvider.search(from, to, date)
      ]);
      const ownVehicle = [{ id: "VEH-OWN", carrier: "Own Vehicle / Fuel Estimate", pricePerSeat: 1200, time: "Flexible", duration: "8.5h" }];
      return [...flights, ...trains, ...buses, ...ownVehicle];
    } else {
      // Default to own vehicle only
      return [
        { id: "VEH-OWN", carrier: "Own Vehicle / Fuel Estimate", pricePerSeat: 1200, time: "Flexible", duration: "8.5h" }
      ];
    }
  },
  book: async (mode, optionId, details) => {
    if (mode.toUpperCase() === 'FLIGHT') {
      return await mockFlightProvider.book(optionId, details);
    } else if (mode.toUpperCase() === 'TRAIN') {
      return await mockTrainProvider.book(optionId, details);
    } else if (mode.toUpperCase() === 'BUS') {
      return await mockBusProvider.book(optionId, details);
    } else {
      return { success: true, bookingReference: "OWN-VEHICLE-VERIFIED" };
    }
  }
};
