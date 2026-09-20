const BASE_URL = 'http://localhost:8000/api';

// Simple token storage
let authToken = localStorage.getItem('token') || '';
let userRole = localStorage.getItem('role') || '';
let username = localStorage.getItem('username') || '';

export const setAuthData = (token, role, name) => {
  authToken = token;
  userRole = role;
  username = name;
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  localStorage.setItem('username', name);
};

export const clearAuthData = () => {
  authToken = '';
  userRole = '';
  username = '';
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('username');
};

export const getAuthToken = () => authToken;
export const getUserRole = () => userRole;
export const getUsername = () => username;

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  };

  const config = {
    method: options.method || 'GET',
    headers,
    ...options,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      if (response.status === 401) {
        clearAuthData();
      }
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Network response error');
    }
    return await response.json();
  } catch (error) {
    console.warn(`Express backend fetch failed for ${endpoint}, using client-side fallback. Error: ${error.message}`);
    throw error;
  }
}

// Fallback Mock Data for Zero-Failure YatraSetu Demos
export const MOCK_DESTINATIONS = [
  { id: 1, name: "Hampi", state: "Karnataka", description: "UNESCO World Heritage site of temples and ruins.", category: "Heritage", latitude: 15.3350, longitude: 76.4600, current_tourists: 3800, safe_capacity: 8000, isGovernmentPromoted: true, imageUrl: "https://images.unsplash.com/photo-1600100397990-a4b3d70f2d51?w=800" },
  { id: 2, name: "Araku Valley", state: "Andhra Pradesh", description: "Scenic valley of coffee gardens and caves.", category: "Nature", latitude: 18.2748, longitude: 82.8711, current_tourists: 1400, safe_capacity: 4500, isGovernmentPromoted: true, imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800" },
  { id: 3, name: "Tirupati", state: "Andhra Pradesh", description: "Venkateswara spiritual temple hills.", category: "Spiritual", latitude: 13.6288, longitude: 79.4192, current_tourists: 23500, safe_capacity: 25000, isGovernmentPromoted: true, imageUrl: "https://images.unsplash.com/photo-1600100397990-a4b3d70f2d51?w=800" },
  { id: 4, name: "Varanasi", state: "Uttar Pradesh", description: "Ganges river ghats and spiritual culture.", category: "Spiritual", latitude: 25.3176, longitude: 82.9739, current_tourists: 18900, safe_capacity: 20000, isGovernmentPromoted: true, imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0db?w=800" },
  { id: 5, name: "Coorg", state: "Karnataka", description: "Lush coffee hills and scenic streams.", category: "Nature", latitude: 12.3375, longitude: 75.8069, current_tourists: 4200, safe_capacity: 6000, isGovernmentPromoted: false, imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800" },
  { id: 6, name: "Goa", state: "Goa", description: "Coastal beaches, heritage churches, and vibrant seaside markets.", category: "Coastal", latitude: 15.2993, longitude: 74.1240, current_tourists: 14200, safe_capacity: 15000, isGovernmentPromoted: false, imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800" }
];

export const API = {
  // Auth
  async login(username, password) {
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: { username, password }
      });
      setAuthData(data.token, data.role, data.username);
      return data;
    } catch (err) {
      // Mock login for offline demo
      let role = 'TOURIST';
      if (username.includes('hotel')) role = 'HOTEL';
      if (username.includes('restaurant')) role = 'RESTAURANT';
      if (username.includes('guide')) role = 'GUIDE';
      if (username.includes('driver')) role = 'TRANSPORT';
      if (username.includes('admin')) role = 'ADMIN';
      
      const dummyToken = `dummy_token_for_${username}`;
      setAuthData(dummyToken, role, username);
      return { token: dummyToken, role, username };
    }
  },

  async register(username, email, password, role) {
    try {
      return await request('/auth/register', {
        method: 'POST',
        body: { username, email, password, role }
      });
    } catch (e) {
      return { username, email, role };
    }
  },

  // Itineraries & Budget Optimization
  async getOptimizeTrip(params) {
    try {
      return await request('/itineraries/optimize', {
        method: 'POST',
        body: params
      });
    } catch {
      // Offline fallback optimizer math
      const limit = params.budgetLimit || 15000;
      const days = params.daysCount || 3;
      const travelers = params.travelersCount || 2;
      const buffer = Math.round(limit * 0.15);
      
      let hotelPrice = 1200;
      let foodPrice = 200;
      let guidePrice = 800;

      // Select hotel price tier based on budget
      if (limit > 30000) {
        hotelPrice = 4500; // Premium
        foodPrice = 500;
      } else if (limit < 8000) {
        hotelPrice = 600; // Budget
        foodPrice = 100;
        guidePrice = 0;
      }

      const hotelCost = hotelPrice * days * Math.ceil(travelers / 2);
      const foodCost = foodPrice * travelers * days * 3;
      const transportCost = params.travelMode === 'Flight' ? 4200 * travelers : (params.travelMode === 'Bus' ? 800 * travelers : 350 * travelers);
      const guideCost = guidePrice * days;
      const localTransit = 400 * days;
      const activityCost = 350 * travelers;

      const total = hotelCost + foodCost + transportCost + guideCost + localTransit + activityCost;

      return {
        startingLocation: params.startingLocation,
        destination: "Hampi",
        travelersCount: travelers,
        daysCount: days,
        budgetLimit: limit,
        emergencyBuffer: buffer,
        totalPlannedCost: total,
        remainingBudget: limit - total,
        travelMode: params.travelMode || 'Train',
        selectedTransport: { type: params.travelMode || 'Train', cost: transportCost },
        selectedAccommodation: { name: "Hampi Heritage Homestay", pricePerNight: hotelPrice, trustScore: 94, cost: hotelCost, isGovernmentApproved: true },
        selectedFood: { name: "Mango Tree Cuisine Hampi", averageMealCost: foodPrice, trustScore: 92, cost: foodCost },
        selectedGuide: guidePrice > 0 ? { name: "Ramesh Hampi Heritage Guide", pricePerDay: guidePrice, trustScore: 95, cost: guideCost } : null,
        selectedActivities: [
          { name: "Guided Heritage Walk", cost: activityCost, rating: 4.5, isGovernmentApproved: true }
        ],
        localTransitCost: localTransit,
        governmentHighlights: ["Hampi Ruins UNESCO Site"]
      };
    }
  },

  async saveItinerary(itinerary) {
    try {
      return await request('/itineraries/save', {
        method: 'POST',
        body: itinerary
      });
    } catch {
      return itinerary;
    }
  },

  // Furkot Connected Planning Engine APIs
  async recalculateTrip(payload) {
    try {
      return await request('/itineraries/recalculate', {
        method: 'POST',
        body: payload
      });
    } catch (err) {
      console.warn("Using client-side fallback trip recalculation", err);
      // Deterministic client fallback calculation
      const totalBudget = Number(payload.budgetLimit || 15000);
      const emergencyReserve = Number(payload.emergencyReserve !== undefined ? payload.emergencyReserve : 2000);
      const spendableBudget = Math.max(0, totalBudget - emergencyReserve);
      const travelersCount = Number(payload.travelersCount || 1);
      const daysCount = Number(payload.daysCount || 1);
      const stops = payload.stops || [
        { id: 'stop_1', name: payload.startingLocation || 'Hyderabad', lat: 17.3850, lng: 78.4867, category: 'ORIGIN' },
        { id: 'stop_2', name: payload.destination || 'Hampi', lat: 15.3350, lng: 76.4600, category: 'DESTINATION' }
      ];

      const stayCost = 1200 * daysCount * Math.ceil(travelersCount / 2);
      const foodCost = 180 * travelersCount * daysCount * 3;
      const transportCost = 380 * travelersCount;
      const totalPlanned = stayCost + foodCost + transportCost;

      return {
        ...payload,
        revision: (payload.revision || 1),
        totalBudget,
        emergencyReserve,
        spendableBudget,
        travelersCount,
        daysCount,
        stops,
        routeLegs: [
          {
            id: 'leg_fallback',
            fromStopId: stops[0]?.id,
            toStopId: stops[stops.length - 1]?.id,
            distanceMeters: 380000,
            durationSeconds: 22800,
            polyline: stops.map(s => ({ lat: s.lat, lng: s.lng }))
          }
        ],
        ledger: {
          totalBudget,
          emergencyReserve,
          spendableBudget,
          totalProjectedCost: totalPlanned,
          remainingSpendable: spendableBudget - totalPlanned,
          budgetStatus: totalPlanned > spendableBudget ? 'Over Budget' : 'Comfortable',
          breakdown: {
            transport: { final: transportCost },
            accommodation: { final: stayCost },
            food: { final: foodCost },
            guide: { final: 0 },
            stopsAndActivities: { final: 0 }
          }
        },
        warnings: totalPlanned > spendableBudget ? [{
          id: 'warn_over_budget',
          message: 'Trip exceeds spendable budget limit.',
          severity: 'HIGH'
        }] : [],
        alternatives: []
      };
    }
  },

  async saveTripRevision(id, payload, expectedRevision) {
    try {
      return await request(`/itineraries/${id}`, {
        method: 'PATCH',
        body: {
          ...payload,
          expectedRevision
        }
      });
    } catch (err) {
      console.warn("Failed to patch revision on server, caching locally", err);
      return { ...payload, revision: (expectedRevision || 1) + 1 };
    }
  },

  async getTripById(id) {
    try {
      return await request(`/itineraries/${id}`);
    } catch {
      return null;
    }
  },

  async duplicateTrip(id) {
    try {
      return await request(`/itineraries/${id}/duplicate`, { method: 'POST' });
    } catch {
      return null;
    }
  },

  async getUserItineraries() {
    try {
      return await request('/itineraries/user');
    } catch {
      return [];
    }
  },

  // Marketplace
  async getDestinations() {
    try {
      return await request('/marketplace/destinations');
    } catch {
      return MOCK_DESTINATIONS;
    }
  },

  async getMarketplaceItems(dest, category) {
    try {
      return await request(`/marketplace/items?destination=${dest}&category=${category}`);
    } catch {
      if (category === 'HOTEL') {
        return [
          { id: 1, name: "Hampi Heritage Homestay", pricePerNight: 1200, trustScore: 94, facilities: ['Wi-Fi', 'Parking'], isGovernmentApproved: true },
          { id: 2, name: "Vijayanagara Royal Resort", pricePerNight: 4500, trustScore: 96, facilities: ['AC', 'Pool'], isGovernmentApproved: true }
        ];
      }
      if (category === 'RESTAURANT') {
        return [
          { id: 3, name: "Mango Tree Cuisine Hampi", averageMealCost: 200, trustScore: 92 }
        ];
      }
      if (category === 'GUIDE') {
        return [
          { id: 4, name: "Ramesh Hampi Heritage Guide", pricePerDay: 800, trustScore: 95 }
        ];
      }
      return [];
    }
  },

  // Vendor Portal
  async getVendorProfile() {
    try {
      return await request('/vendors/profile');
    } catch {
      let role = userRole || 'HOTEL';
      return {
        name: `${username || 'Vendor'} Local Services`,
        type: role,
        verificationStatus: localStorage.getItem('mockVideoUrl') ? 'UNDER_REVIEW' : 'VERIFIED',
        trustScore: 92,
        trustScoreDetails: {
          trustScore: 92,
          breakdown: { documentVerification: 30, customerReviews: 24, recentMaintenance: 18, priceTransparency: 10, bookingReliability: 10 },
          badges: ["Identity Verified", "Documents Verified", "Recent Facility Verified", "Transparent Pricing", "Highly Reliable"]
        }
      };
    }
  },

  async submitWalkthroughVideo(videoUrl) {
    try {
      return await request('/vendors/video', {
        method: 'POST',
        body: { videoUrl }
      });
    } catch {
      localStorage.setItem('mockVideoUrl', videoUrl);
      return { message: "Video uploaded." };
    }
  },

  async getVendorBookings() {
    try {
      return await request('/vendors/bookings');
    } catch {
      return [
        { id: 'b1', clientName: 'Amit Sharma', date: '2026-09-12', travelers: 2, totalAmount: 3600, status: 'CONFIRMED' },
        { id: 'b2', clientName: 'Sneha Reddy', date: '2026-09-15', travelers: 3, totalAmount: 5400, status: 'PENDING' }
      ];
    }
  },

  // Admin / Government
  async getAdminVendors() {
    try {
      return await request('/admin/vendors');
    } catch {
      return [
        { _id: 'v1', name: 'Hampi Heritage Homestay', type: 'HOTEL', verificationStatus: localStorage.getItem('mockVideoUrl') ? 'UNDER_REVIEW' : 'VERIFIED', trustScore: 94, walkthroughVideoUrl: localStorage.getItem('mockVideoUrl') || null },
        { _id: 'v2', name: 'Mango Tree Cuisine Hampi', type: 'RESTAURANT', verificationStatus: 'VERIFIED', trustScore: 92 },
        { _id: 'v3', name: 'YatraSetu Route Transit Corp', type: 'TRANSPORT', verificationStatus: 'PENDING', trustScore: 72 }
      ];
    }
  },

  async verifyVendor(vendorId, status) {
    try {
      return await request('/admin/verify', {
        method: 'POST',
        body: { vendorId, status }
      });
    } catch {
      if (status === 'VERIFIED') localStorage.removeItem('mockVideoUrl');
      return { message: "Verified." };
    }
  },

  async getAdminAnalytics() {
    try {
      return await request('/admin/analytics');
    } catch {
      return {
        totalTourists: 954,
        popularDestinations: [{ name: 'Hampi', visits: 310 }, { name: 'Araku Valley', visits: 180 }, { name: 'Tirupati', visits: 140 }],
        averageTripBudget: 14850,
        totalMoneySaved: 54800,
        verifiedVendorsCount: 14,
        governmentDestinationVisits: 320,
        localBusinessGrowthPct: 18
      };
    }
  },

  // Authority & Governance Decision Intelligence
  async getAuthorityDashboard() {
    try {
      return await request('/authority/dashboard');
    } catch {
      return {
        total_tourists_today: 47250,
        average_hotel_occupancy_pct: 78.4,
        total_revenue_today: 212500000,
        high_risk_destinations: [
          { id: 6, name: 'Goa', current_tourists: 14200, safe_capacity: 15000, risk_level: 'HIGH' },
          { id: 3, name: 'Tirupati', current_tourists: 23500, safe_capacity: 25000, risk_level: 'HIGH' }
        ]
      };
    }
  },

  async getAlternatives(destId) {
    try {
      return await request(`/recommendations/alternatives/${destId}`);
    } catch {
      return [
        {
          id: 2,
          name: "Araku Valley",
          final_score: 94,
          distance_km: 180,
          similarity_score: 88,
          crowd_reduction_score: 42,
          cost_advantage_score: 35,
          reasoning: "Scenic green valley with rich coffee heritage, 60% lower crowd density, and significant budget advantages."
        },
        {
          id: 1,
          name: "Hampi Ruins",
          final_score: 91,
          distance_km: 340,
          similarity_score: 85,
          crowd_reduction_score: 38,
          cost_advantage_score: 28,
          reasoning: "Sprawling UNESCO heritage site offering high-capacity cultural tourism and comfortable homestay availability."
        }
      ];
    }
  },

  async getBusinessOpportunities(destId) {
    try {
      return await request(`/business/opportunities/${destId}`);
    } catch {
      return [
        { name: "Araku Valley Eco-Stays", type: "Homestay Operator", opportunity_score: 95, recommended_action: "Expand heritage homestay capacity by 25 rooms to absorb redirected high-season coastal flows." },
        { name: "Coffee Trail Shuttles", type: "Local Transit", opportunity_score: 91, recommended_action: "Deploy 8-seater clean shuttles linking Vistadome train arrivals directly to valley plantations." },
        { name: "Tribal Artisan Collective", type: "Cultural Guides", opportunity_score: 88, recommended_action: "Partner with government tourism office for certified local culinary and craft workshops." }
      ];
    }
  },

  async simulateTwin(destId, redistributePct = 30) {
    try {
      return await request('/simulation/twin', {
        method: 'POST',
        body: { destination_id: destId, redistribution_pct: redistributePct }
      });
    } catch {
      const shift = (redistributePct || 30) / 100;
      const initialCrowd = 94;
      const initialHotel = 88;
      const finalCrowd = Math.max(45, Math.round(initialCrowd * (1 - shift * 0.5)));
      const finalHotel = Math.max(50, Math.round(initialHotel * (1 - shift * 0.3)));
      return {
        metrics_before: { crowding: initialCrowd, hotel_occupancy: initialHotel },
        metrics_after: { crowding: finalCrowd, hotel_occupancy: finalHotel },
        ai_advice: `Redistributing ${redistributePct}% of visitor traffic lowers concentration from ${initialCrowd}% to ${finalCrowd}%, preventing municipal gridlock while boosting revenue in secondary corridors.`
      };
    }
  },

  // Business Demand Portal
  async getBusinessDashboard() {
    try {
      return await request('/business/dashboard');
    } catch {
      return {
        bookings_count: 34,
        occupancy_rate_pct: 82,
        demand_forecast_pct: 24,
        predicted_revenue: 184500,
        sentiment_positive_pct: 78,
        sentiment_neutral_pct: 16,
        sentiment_negative_pct: 6,
        top_complaints: [
          "Check-in delays during Friday peak arrival hours",
          "Hot water supply pressure lower in morning hours",
          "Limited parking space for larger SUVs"
        ],
        ai_insights: [
          "Weekend demand surges by 24%—increase Friday afternoon check-in desk capacity.",
          "High positive sentiment on organic breakfast buffet and heritage walking recommendations.",
          "Dynamic pricing opportunity: Raising rates by 8% during festive weekends maintains >90% occupancy."
        ]
      };
    }
  },

  // Safety Alerts
  async getAlerts() {
    try {
      return await request('/alerts');
    } catch {
      return [
        { id: 1, severity: 'CRITICAL', message: 'Tirupati Alipiri Footpath: Heavy pilgrim rush, slot-based token entry required.' },
        { id: 2, severity: 'WARNING', message: 'NH44 Bellary Highway: Lane maintenance near Kurnool bypass, expect 15 min delays.' },
        { id: 3, severity: 'ADVISORY', message: 'Araku Valley: Evening mist on ghat roads, drivers advised to use fog lamps after 6 PM.' }
      ];
    }
  },

  // Dynamic Flow & Sustainability Itinerary Generation
  async generateItinerary(params) {
    try {
      return await request('/itineraries/generate', {
        method: 'POST',
        body: params
      });
    } catch {
      const destId = params.destination_id || 1;
      const days = params.duration_days || 3;
      const budget = params.budget || 15000;
      const destName = MOCK_DESTINATIONS.find(d => d.id === destId)?.name || "Hampi";
      const totalEstimated = Math.min(budget, Math.round(budget * 0.88));
      const perDayAcc = Math.round((totalEstimated * 0.4) / days);
      const perDayFood = Math.round((totalEstimated * 0.25) / days);
      const actTotal = Math.round(totalEstimated * 0.18);
      const transTotal = Math.round(totalEstimated * 0.17);

      const itineraryDays = Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        location: `${destName} - Sector ${i + 1}`,
        morning: i === 0 ? "Arrival & check-in to verified eco-homestay" : "Early morning temple / scenic viewpoint walking trail",
        afternoon: "Authentic local thali dining & certified artisan handicraft market visit",
        evening: "Sunset viewpoint observation followed by cultural folk performance",
        sustainability_tips: "Carry refillable water bottles and hire certified local guides to support community tourism."
      }));

      return {
        alternative_used: destName === 'Goa' ? 'Araku Valley' : null,
        crowd_reduction_pct: destName === 'Goa' ? 35 : 0,
        sustainability_score: 94,
        itinerary_days: itineraryDays,
        budget_breakdown: {
          accommodation_per_day: perDayAcc,
          food_per_day: perDayFood,
          activities_total: actTotal,
          transport_total: transTotal,
          total_estimated: totalEstimated
        }
      };
    }
  },

  // Transactional Atomic Multi-Service Booking
  async createMultiBooking(services) {
    try {
      return await request('/bookings/multi', {
        method: 'POST',
        body: { services }
      });
    } catch {
      return {
        success: true,
        bookingId: `BK-MULTI-${Date.now()}`,
        message: "Multi-service booking processed successfully."
      };
    }
  }
};
