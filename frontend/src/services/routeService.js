export const getRouteDetails = (from, to, mode) => {
  const isOwnVehicle = mode.toUpperCase() === 'OWN VEHICLE' || mode.toUpperCase() === 'OWN CAR' || mode.toUpperCase() === 'OWN BIKE';
  
  const distanceKm = 380;
  const timeHours = 8.5;
  const tollFares = 320;
  const fuelLiter = isOwnVehicle ? Math.round(distanceKm / 15) : 0;
  const fuelCost = isOwnVehicle ? fuelLiter * 100 : 0;

  const stops = [
    { name: "NH65 Highway Oasis (Safe Rest Stop)", type: "Rest Stop", distanceOffRoute: "1.8 km", facilities: "Clean Restrooms, Cafe, EV Charging, Nursing Room" },
    { name: "Reliance Petrol & EV Charging Station", type: "Fuel", distanceOffRoute: "0.5 km", facilities: "Petrol, Diesel, EV Fast Charger" },
    { name: "Government Toll Plaza Cafe & Mechanic", type: "Mechanic / Food", distanceOffRoute: "2.1 km", facilities: "Car Repair, Safe NHAI Rest Rooms, Local Tea Stalls" }
  ];

  return {
    distanceKm,
    timeHours,
    tollFares,
    fuelCost,
    fuelLiter,
    stops
  };
};
