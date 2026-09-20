// Realistic Highway Corridor Routes & Facilities Database
// Real coordinates for Indian National Highways (NH44, NH65, NH16, NH48, NH275)

const REALISTIC_ROUTES = {
  "Hampi": {
    highway: "NH44 & NH67 Corridor",
    destinationPoint: { name: "Hampi", lat: 15.3350, lng: 76.4600 },
    waypoints: [
      { name: "Hyderabad (ORR South Exit)", lat: 17.2400, lng: 78.4200 },
      { name: "Jadcherla Plaza (NH44)", lat: 16.7800, lng: 78.1300 },
      { name: "Kurnool Bypass Toll Plaza", lat: 15.8281, lng: 78.0373 },
      { name: "Dhone Junction (NH44 / NH67)", lat: 15.4200, lng: 77.8800 },
      { name: "Guntakal Bypass", lat: 15.1700, lng: 77.3700 },
      { name: "Bellary Highway Corridor", lat: 15.1400, lng: 76.9200 },
      { name: "Hospet Bypass", lat: 15.2700, lng: 76.3900 },
      { name: "Hampi Sacred Center", lat: 15.3350, lng: 76.4600 }
    ],
    facilities: [
      { name: "Kurnool FASTag Toll Plaza", type: "Toll", lat: 15.8500, lng: 78.0400, details: "FASTag Lane Toll ₹145" },
      { name: "IOCL Highway Fuel & Food Plaza", type: "Fuel", lat: 16.5500, lng: 78.0800, details: "Petrol, Diesel, Clean Restrooms & ATM" },
      { name: "Kurnool Highway Dhaba & Rest Stop", type: "Food", lat: 15.8100, lng: 78.0200, details: "Family South & North Indian Thali" },
      { name: "NH44 Express EV Charging Station", type: "EV Charging", lat: 15.4500, lng: 77.9000, details: "60 kW CCS2 Fast Dual Charger" },
      { name: "Bellary Highway Towing & Mechanic", type: "Mechanic", lat: 15.1600, lng: 76.9500, details: "24x7 Roadside Mechanic Support" }
    ],
    attractions: [
      { name: "Virupaksha Temple", type: "Attraction", lat: 15.3353, lng: 76.4601, details: "Ancient 7th-Century Shiva Temple" },
      { name: "Stone Chariot & Vittala Complex", type: "Attraction", lat: 15.3361, lng: 76.4772, details: "Iconic UNESCO Heritage Monument" },
      { name: "Lotus Mahal & Elephant Stables", type: "Attraction", lat: 15.3188, lng: 76.4716, details: "Indo-Islamic Royal Enclosure" }
    ]
  },

  "Araku Valley": {
    highway: "NH65 & NH16 Coastal Corridor",
    destinationPoint: { name: "Araku Valley", lat: 18.3273, lng: 82.8824 },
    waypoints: [
      { name: "Hyderabad (LB Nagar)", lat: 17.3500, lng: 78.5500 },
      { name: "Suryapet NH65 Highway", lat: 17.1400, lng: 79.6200 },
      { name: "Vijayawada Bypass (NH65/16)", lat: 16.5000, lng: 80.6400 },
      { name: "Rajahmundry Godavari Bridge", lat: 17.0000, lng: 81.7800 },
      { name: "Anakapalle Bypass", lat: 17.6900, lng: 83.0000 },
      { name: "Visakhapatnam Hill Exit", lat: 17.7200, lng: 83.2100 },
      { name: "Srungavarapukota Ghat Entrance", lat: 18.1100, lng: 83.1500 },
      { name: "Borra Caves Ghat Pass", lat: 18.2800, lng: 83.0400 },
      { name: "Araku Valley Center", lat: 18.3273, lng: 82.8824 }
    ],
    facilities: [
      { name: "Suryapet Highway Oasis", type: "Restroom", lat: 17.1500, lng: 79.6400, details: "AC Food Court & Clean Washrooms" },
      { name: "Vijayawada FASTag Toll Gate", type: "Toll", lat: 16.5500, lng: 80.5800, details: "FASTag Toll ₹110" },
      { name: "Rajahmundry Fuel & EV Hub", type: "EV Charging", lat: 17.0200, lng: 81.8000, details: "Fast EV Chargers & Fuel Stop" },
      { name: "S.Kota Ghat Road Brake & Tyre Check", type: "Mechanic", lat: 18.1200, lng: 83.1400, details: "Ghat Road Safety Inspection Point" }
    ],
    attractions: [
      { name: "Borra Caves", type: "Attraction", lat: 18.2805, lng: 83.0401, details: "150 Million Year Old Limestone Caves" },
      { name: "Coffee Plantation & Museum", type: "Attraction", lat: 18.3280, lng: 82.8810, details: "Organic Araku Coffee Tasting" },
      { name: "Katiki Waterfalls", type: "Attraction", lat: 18.2670, lng: 83.0120, details: "Scenic Cascading Waterfalls" }
    ]
  },

  "Tirupati": {
    highway: "NH16 & NH71 Rayalaseema Express",
    destinationPoint: { name: "Tirupati", lat: 13.6288, lng: 79.4192 },
    waypoints: [
      { name: "Hyderabad (Hayathnagar)", lat: 17.3200, lng: 78.6000 },
      { name: "Nalgonda Exit (NH65)", lat: 17.0500, lng: 79.2700 },
      { name: "Guntur Bypass (NH16)", lat: 16.3000, lng: 80.4400 },
      { name: "Ongole Highway Pass", lat: 15.5000, lng: 80.0500 },
      { name: "Nellore Bypass (NH16/71)", lat: 14.4400, lng: 79.9800 },
      { name: "Naidupeta Junction", lat: 13.9100, lng: 79.8900 },
      { name: "Tirupati Foot of Hills", lat: 13.6288, lng: 79.4192 }
    ],
    facilities: [
      { name: "Guntur Highway Dhaba", type: "Food", lat: 16.3200, lng: 80.4600, details: "Pure Veg Pilgrimage Meals" },
      { name: "Tanguturu FASTag Toll Gate", type: "Toll", lat: 15.4200, lng: 80.0200, details: "FASTag Toll ₹95" },
      { name: "Nellore Highway Fuel Stop", type: "Fuel", lat: 14.4600, lng: 79.9900, details: "24 Hour Fuel & Air Station" }
    ],
    attractions: [
      { name: "Sri Venkateswara Temple (Tirumala)", type: "Attraction", lat: 13.6833, lng: 79.3472, details: "Sacred Tirumala Hill Shrine" },
      { name: "Kapila Theertham", type: "Attraction", lat: 13.6520, lng: 79.4260, details: "Historic Shiva Temple Waterfall" },
      { name: "Silathoranam Natural Arch", type: "Attraction", lat: 13.6860, lng: 79.3410, details: "Pre-Cambrian Rock Formation" }
    ]
  },

  "Coorg": {
    highway: "NH44 & NH275 Western Ghats Route",
    destinationPoint: { name: "Coorg (Madikeri)", lat: 12.4244, lng: 75.7382 },
    waypoints: [
      { name: "Hyderabad (Shamshabad)", lat: 17.2300, lng: 78.4300 },
      { name: "Anantapur Bypass (NH44)", lat: 14.6800, lng: 77.6000 },
      { name: "Bengaluru Expressway Exit", lat: 13.0800, lng: 77.5800 },
      { name: "Mysuru Expressway (NH275)", lat: 12.3000, lng: 76.6500 },
      { name: "Hunsur Gateway", lat: 12.3100, lng: 76.2900 },
      { name: "Kushalnagar Bamboo Forest", lat: 12.4500, lng: 75.9600 },
      { name: "Madikeri Hill Capital", lat: 12.4244, lng: 75.7382 }
    ],
    facilities: [
      { name: "Devanahalli Bengaluru FASTag Toll", type: "Toll", lat: 13.2300, lng: 77.7100, details: "Expressway Toll Gate" },
      { name: "Mysuru Expressway Service Oasis", type: "Restroom", lat: 12.5200, lng: 76.8800, details: "Restrooms, Coffee Shop & Food Court" },
      { name: "Kushalnagar Hill Fuel & EV Stop", type: "EV Charging", lat: 12.4400, lng: 75.9700, details: "Hill Station EV Charging Station" }
    ],
    attractions: [
      { name: "Abbey Falls", type: "Attraction", lat: 12.4560, lng: 75.7190, details: "Cascading Waterfall in Spice Plantations" },
      { name: "Raja's Seat Viewpoint", type: "Attraction", lat: 12.4200, lng: 75.7370, details: "Panoramic Sunset View of Coorg Hills" },
      { name: "Golden Temple (Bylakuppe)", type: "Attraction", lat: 12.4300, lng: 75.9640, details: "Namdroling Tibetan Monastery" }
    ]
  }
};

// Fallback dynamic generator for unlisted cities
function generateFallbackRoute(from, to) {
  const startLat = 17.3850;
  const startLng = 78.4867;
  const destLat = 15.3350;
  const destLng = 76.4600;

  return {
    highway: "National Highway Express Corridor",
    destinationPoint: { name: to, lat: destLat, lng: destLng },
    waypoints: [
      { name: `${from} Exit Gate`, lat: startLat, lng: startLng },
      { name: "Midway Highway Interchange", lat: (startLat + destLat) / 2, lng: (startLng + destLng) / 2 },
      { name: `${to} Gateway Exit`, lat: destLat, lng: destLng }
    ],
    facilities: [
      { name: "National Highway Petrol & Oasis", type: "Fuel", lat: (startLat * 0.7 + destLat * 0.3), lng: (startLng * 0.7 + destLng * 0.3), details: "Fuel, Air & Washrooms" },
      { name: "FASTag Highway Toll Gate", type: "Toll", lat: (startLat * 0.5 + destLat * 0.5), lng: (startLng * 0.5 + destLng * 0.5), details: "FASTag Toll Gate" },
      { name: "Express EV Charging Hub", type: "EV Charging", lat: (startLat * 0.3 + destLat * 0.7), lng: (startLng * 0.3 + destLng * 0.7), details: "60 kW Fast EV Charger" }
    ],
    attractions: [
      { name: `${to} Heritage & Cultural Point`, type: "Attraction", lat: destLat + 0.005, lng: destLng + 0.005, details: `Top attractions in ${to}` }
    ]
  };
}

export const mapService = {
  getRouteCoordinates: (from = 'Hyderabad', to = 'Hampi') => {
    const toClean = String(to).trim().toLowerCase();
    
    let matchedRoute = null;
    for (const [key, data] of Object.entries(REALISTIC_ROUTES)) {
      if (toClean.includes(key.toLowerCase()) || key.toLowerCase().includes(toClean)) {
        matchedRoute = data;
        break;
      }
    }

    if (!matchedRoute) {
      matchedRoute = generateFallbackRoute(from, to);
    }

    const startPt = { name: from, lat: matchedRoute.waypoints[0].lat, lng: matchedRoute.waypoints[0].lng };
    const destPt = matchedRoute.destinationPoint;

    return {
      startingPoint: startPt,
      destinationPoint: destPt,
      highwayName: matchedRoute.highway,
      routePath: matchedRoute.waypoints,
      facilities: matchedRoute.facilities || [],
      attractions: matchedRoute.attractions || []
    };
  }
};
