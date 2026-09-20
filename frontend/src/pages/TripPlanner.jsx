import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, ShieldCheck, Navigation, AlertTriangle, Landmark
} from 'lucide-react';

// Services & providers
import { transportService } from '../services/transportService';
import { hotelService } from '../services/hotelService';
import { restaurantService } from '../services/restaurantService';
import { guideService } from '../services/guideService';
import { mapService } from '../services/mapService';
import { bookingService } from '../services/bookingService';
import YatraMap from '../components/YatraMap';
import { pageVariants, itemFadeUp, staggerContainer } from '../animations/variants';

const ACTIVITIES_DATABASE = {
  "Hampi": [
    { id: "act_h1", name: "Virupaksha Temple & Ruins Entry", price: 100 },
    { id: "act_h2", name: "Coracle Boat Ride (Tungabhadra)", price: 250 },
    { id: "act_h3", name: "ASI Monuments Composite Pass", price: 50 },
    { id: "act_h4", name: "Sunset Hill Trek & Guide Assist", price: 150 }
  ],
  "Araku Valley": [
    { id: "act_a1", name: "Borra Caves Entry ticket", price: 150 },
    { id: "act_a2", name: "Katiki Waterfalls Jeep Ride", price: 300 },
    { id: "act_a3", name: "Coffee Plantation & Tasting", price: 100 }
  ],
  "Tirupati": [
    { id: "act_t1", name: "Special Entry Darshan ticket", price: 300 },
    { id: "act_t2", name: "SV Zoological Park Safari", price: 150 },
    { id: "act_t3", name: "Srivari Mettu Trek assistance", price: 80 }
  ],
  "Varanasi": [
    { id: "act_v1", name: "Subah-e-Banaras Boat Cruise", price: 300 },
    { id: "act_v2", name: "Ganga Aarti VIP Ghat seat", price: 200 },
    { id: "act_v3", name: "Sarnath Museum entry", price: 50 }
  ],
  "Coorg": [
    { id: "act_c1", name: "Abbey Falls Entry & Parking", price: 40 },
    { id: "act_c2", name: "Dubare Elephant Camp ticket", price: 400 },
    { id: "act_c3", name: "Nisargadhama Bamboo Forest", price: 80 }
  ],
  "Jaipur": [
    { id: "act_j1", name: "Amer Fort audio guide tour", price: 200 },
    { id: "act_j2", name: "City Palace composite ticket", price: 450 },
    { id: "act_j3", name: "Hawa Mahal & Jantar Mantar", price: 100 }
  ],
  "Munnar": [
    { id: "act_m1", name: "Eravikulam National Park pass", price: 200 },
    { id: "act_m2", name: "Mattupetty Dam Speedboat Ride", price: 300 },
    { id: "act_m3", name: "Tea Museum entry & tasting", price: 100 }
  ],
  "Varkala": [
    { id: "act_va1", name: "Munroe Island Boat Cruise", price: 350 },
    { id: "act_va2", name: "Varkala Cliff Parasailing", price: 750 },
    { id: "act_va3", name: "Janardhana Swamy Temple tour", price: 80 }
  ]
};

const LOCAL_TRANSIT_DATABASE = [
  { id: "lt_1", name: "Scooter / Moped Self-drive", ratePerDay: 450, details: "Excluding fuel. Ideal for solo or couples." },
  { id: "lt_2", name: "Local Auto Rickshaw Day Tour", ratePerDay: 900, details: "Driver included. Perfect for short distances." },
  { id: "lt_3", name: "AC Sedan Cab Day Booking", ratePerDay: 1700, details: "AC comfort. Best for families." },
  { id: "lt_4", name: "E-Rickshaw Hop-on Shuttle Pass", ratePerDay: 150, details: "Eco-friendly shared local loops." }
];

export function resolveCanonicalDestination(input = '') {
  if (!input) return 'Hampi';
  const clean = String(input).trim().toLowerCase();
  
  if (clean.includes('hampi')) return 'Hampi';
  if (clean.includes('araku')) return 'Araku Valley';
  if (clean.includes('tiru')) return 'Tirupati';
  if (clean.includes('varanasi') || clean.includes('kashi') || clean.includes('banaras')) return 'Varanasi';
  if (clean.includes('coorg') || clean.includes('kodagu')) return 'Coorg';
  if (clean.includes('jaipur') || clean.includes('pink city')) return 'Jaipur';
  if (clean.includes('munnar')) return 'Munnar';
  if (clean.includes('varkala')) return 'Varkala';
  
  return input.trim().charAt(0).toUpperCase() + input.trim().slice(1);
}

export default function TripPlanner() {
  const navigate = useNavigate();
  const [payload, setPayload] = useState(null);
  
  // Wizard Progress
  const [currentStep, setCurrentStep] = useState(1);

  // Data search lists
  const [transportsList, setTransportsList] = useState([]);
  const [staysList, setStaysList] = useState([]);
  const [eateriesList, setEateriesList] = useState([]);
  const [guidesList, setGuidesList] = useState([]);

  // Selected parameters
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [selectedStay, setSelectedStay] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedLocalTransit, setSelectedLocalTransit] = useState(null);
  
  // Activities & Transit Costs
  const [activitiesCost, setActivitiesCost] = useState(0);
  const [localTransitCost, setLocalTransitCost] = useState(0);

  const tCount = payload?.travelersCount || 2;
  const dCount = payload?.daysCount || 3;

  useEffect(() => {
    const actSum = selectedActivities.reduce((sum, act) => sum + act.price * tCount, 0);
    setActivitiesCost(actSum);
  }, [selectedActivities, tCount]);

  useEffect(() => {
    if (selectedLocalTransit) {
      setLocalTransitCost(selectedLocalTransit.ratePerDay * dCount);
    } else {
      setLocalTransitCost(0);
    }
  }, [selectedLocalTransit, dCount]);

  // Own Vehicle Calculator Parameter
  const [mileage, setMileage] = useState(15); 
  const [parkingFee, setParkingFee] = useState(250);

  // Load params
  useEffect(() => {
    const raw = localStorage.getItem('travexa_search');
    if (!raw) {
      navigate('/plan');
    } else {
      try {
        const parsed = JSON.parse(raw);
        setPayload(parsed);

        const start = parsed.startingLocation || 'Hyderabad';
        const rawDest = parsed.destinationPreference || parsed.destination || 'Hampi';
        const dest = resolveCanonicalDestination(rawDest);
        const date = parsed.travelDates || '2026-09-01';

        transportService.search(start, dest, date, 'ALL').then(setTransportsList);
        hotelService.getHotelsByDestination(dest).then(setStaysList);
        restaurantService.getRestaurantsByDestination(dest).then(setEateriesList);
        guideService.getGuidesByDestination(dest).then(setGuidesList);
      } catch (err) {
        console.warn("Failed to parse search criteria, redirecting to plan form", err);
        navigate('/plan');
      }
    }
  }, [navigate]);

  if (!payload) return null;

  const rawDest = payload.destinationPreference || payload.destination || 'Hampi';
  const destination = resolveCanonicalDestination(rawDest);
  const travelers = payload.travelersCount || 2;
  const days = payload.daysCount || 3;
  const roomCount = Math.ceil(travelers / 2);

  let distanceKm = 380;
  let tollFares = 320;
  if (destination === 'Araku Valley') { distanceKm = 620; tollFares = 520; }
  else if (destination === 'Tirupati') { distanceKm = 580; tollFares = 480; }

  const fuelLiters = Math.round(distanceKm / mileage);
  const fuelCostCalculated = fuelLiters * 100; // Rs.100 per liter
  const ownVehicleTotalTransportCost = fuelCostCalculated + tollFares + parkingFee;

  let tCost = ownVehicleTotalTransportCost;
if (selectedTransport && selectedTransport.pricePerSeat) {
  // Assume price per seat applies per traveler
  tCost = selectedTransport.pricePerSeat * travelers;
}
  
  const sCost = selectedStay ? selectedStay.pricePerNight * days * roomCount : 1200 * days * roomCount;
  const fCost = selectedFood ? selectedFood.averageMealCost * travelers * days * 3 : 150 * travelers * days * 3;
  const gCost = selectedGuide ? selectedGuide.pricePerDay * days : 0;

  const totalCost = tCost + sCost + fCost + gCost + activitiesCost + localTransitCost;
  
  const safetyBuffer = payload.requiredBuffer || 2000;
  const spendableBudgetLimit = payload.budgetLimit - safetyBuffer;

  const remaining = payload.budgetLimit - totalCost;
  const isExceeded = totalCost > spendableBudgetLimit;
  const overBudgetAmount = totalCost - spendableBudgetLimit;

  const budgetUtilization = ((totalCost / payload.budgetLimit) * 100).toFixed(1);
  let statusText = "🟢 Comfortable";
  let statusColor = "var(--status-success)";
  if (totalCost > spendableBudgetLimit) {
    statusText = "🔴 Over Budget";
    statusColor = "var(--status-danger)";
  } else if (totalCost > spendableBudgetLimit * 0.85) {
    statusText = "🟡 Tight";
    statusColor = "var(--status-warning)";
  }

  const handleBookComplete = async () => {
    const details = {
      travelMode: 'Own Vehicle',
      selectedTransport: { id: "OWN-CAR", cost: tCost, details: `Own Vehicle: ${distanceKm} km, Tolls: ₹${tollFares}` },
      selectedAccommodation: { 
        name: selectedStay?.name || staysList[0]?.name || "Hampi Heritage Homestay", 
        pricePerNight: selectedStay?.pricePerNight || 1200, 
        cost: sCost,
        latitude: selectedStay?.latitude || staysList[0]?.latitude || 15.3350,
        longitude: selectedStay?.longitude || staysList[0]?.longitude || 76.4600
      },
      selectedFood: { name: selectedFood?.name || eateriesList[0]?.name || "Mango Tree Cuisine Hampi", averageMealCost: selectedFood?.averageMealCost || 200, cost: fCost },
      selectedGuide: selectedGuide ? { name: selectedGuide.name, pricePerDay: selectedGuide.pricePerDay, cost: gCost } : null,
      activitiesCost,
      localTransitCost,
      selectedActivities: selectedActivities.map(a => a.name),
      selectedLocalTransit: selectedLocalTransit ? selectedLocalTransit.name : "Local Transport",
      budgetLimit: payload.budgetLimit,
      daysCount: days,
      travelersCount: travelers,
      startingLocation: payload.startingLocation,
      destination
    };

    try {
      const res = await bookingService.bookCompleteTrip(details);
      if (res.success) {
        localStorage.setItem('travexa_itinerary', JSON.stringify(details));
        localStorage.setItem('travexa_final_trip', JSON.stringify(details));
        navigate('/results');
      } else {
        localStorage.setItem('travexa_itinerary', JSON.stringify(details));
        localStorage.setItem('travexa_final_trip', JSON.stringify(details));
        navigate('/results');
      }
    } catch (err) {
      console.warn("Booking service failed, using client-side fallback navigation:", err);
      localStorage.setItem('travexa_itinerary', JSON.stringify(details));
      localStorage.setItem('travexa_final_trip', JSON.stringify(details));
      navigate('/results');
    }
  };

  const mapData = mapService.getRouteCoordinates(payload.startingLocation, destination);
  const cheaperStays = staysList.filter(s => s.pricePerNight < (selectedStay?.pricePerNight || 4500));

  const steps = [
    { step: 1, label: '01 Transport' },
    { step: 2, label: '02 Stay' },
    { step: 3, label: '03 Dining' },
    { step: 4, label: '04 Guide' },
    { step: 5, label: '05 Activities' },
    { step: 6, label: '06 Preferences' },
    { step: 7, label: '07 Final Itinerary' }
  ];

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 space-y-10"
      style={{ background: 'var(--bg-base)', minHeight: '100vh' }}
    >
      
      {/* 1. PAGE HEADER */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-heading)' }}>Plan Your Journey</h1>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>Design your perfect trip with real-time budget tracking.</p>
      </div>

      {/* 3. STICKY BUDGET SUMMARY */}
      <div 
        className="budget-bar sticky top-4 z-50 p-4 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-md)' }}
      >
        <div className="flex items-center gap-6 text-sm flex-wrap justify-center">
          <div>
            <span style={{ color: 'var(--text-tertiary)' }} className="block text-xs uppercase font-semibold">Budget</span>
            <strong style={{ color: 'var(--text-primary)' }}>₹{payload.budgetLimit.toLocaleString()}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-tertiary)' }} className="block text-xs uppercase font-semibold">Spendable</span>
            <strong style={{ color: 'var(--text-primary)' }}>₹{spendableBudgetLimit.toLocaleString()}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-tertiary)' }} className="block text-xs uppercase font-semibold">Current Spend</span>
            <strong style={{ color: 'var(--brand-primary)' }}>₹{totalCost.toLocaleString()}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-tertiary)' }} className="block text-xs uppercase font-semibold">Remaining</span>
            <strong style={{ color: remaining < 0 ? 'var(--status-danger)' : 'var(--status-success)' }}>
              ₹{remaining.toLocaleString()}
            </strong>
          </div>
        </div>
        <div 
          className="px-3 py-1.5 rounded-full text-sm font-semibold"
          style={{ 
            background: isExceeded ? 'var(--status-danger-soft)' : (totalCost > spendableBudgetLimit * 0.85 ? 'var(--status-warning-soft)' : 'var(--status-success-soft)'),
            color: isExceeded ? 'var(--status-danger)' : (totalCost > spendableBudgetLimit * 0.85 ? 'var(--status-warning)' : 'var(--status-success)'),
            border: `1px solid ${isExceeded ? 'var(--status-danger)' : (totalCost > spendableBudgetLimit * 0.85 ? 'var(--status-warning)' : 'var(--status-success)')}`
          }}
        >
          {statusText}
        </div>
      </div>

      {/* 2. PROGRESS INDICATOR */}
      <div className="py-6 px-4 hidden md:block">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 right-0 h-1 top-1/2 -translate-y-1/2" style={{ background: 'var(--bg-surface)' }} />
          <motion.div 
            className="step-connector absolute left-0 h-1 top-1/2 -translate-y-1/2 origin-left"
            style={{ background: 'var(--brand-primary)' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: (currentStep - 1) / (steps.length - 1) }}
            transition={{ duration: 0.3 }}
          />
          {steps.map(s => {
            const isCompleted = s.step < currentStep;
            const isActive = s.step === currentStep;
            return (
              <div key={s.step} className="relative z-10 flex flex-col items-center gap-2">
                <div 
                  className="step-dot w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm cursor-pointer transition-colors"
                  style={{
                    background: isCompleted ? 'var(--status-success)' : (isActive ? 'var(--brand-primary)' : 'var(--bg-surface)'),
                    color: isCompleted || isActive ? 'var(--text-on-brand)' : 'var(--text-muted)',
                    border: `2px solid ${isCompleted ? 'var(--status-success)' : (isActive ? 'var(--brand-primary)' : 'var(--border-default)')}`
                  }}
                  onClick={() => setCurrentStep(s.step)}
                >
                  {isCompleted ? '✓' : s.step}
                </div>
                <span className="text-xs font-semibold whitespace-nowrap" style={{ color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)' }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Mobile progress */}
      <div className="md:hidden text-center text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
        Step {currentStep} of {steps.length}: {steps[currentStep - 1].label}
      </div>

      {/* 4. STEP CONTENT AREA */}
      <div className="p-6 rounded-xl min-h-[400px]" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Step 1: Transport */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>Transport Details</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Configure your own vehicle settings to calculate route costs.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div className="p-4 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                    <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Distance</span>
                    <p className="text-2xl font-extrabold mt-1" style={{ color: 'var(--text-primary)' }}>{distanceKm} km</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                    <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Estimated Fuel</span>
                    <p className="text-2xl font-extrabold mt-1" style={{ color: 'var(--text-primary)' }}>{fuelLiters} Liters</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                    <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>FASTag Tolls</span>
                    <p className="text-2xl font-extrabold mt-1" style={{ color: 'var(--text-primary)' }}>₹{tollFares.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="flex justify-between text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      <span>Average Mileage</span>
                      <span style={{ color: 'var(--brand-primary)' }}>{mileage} km/liter</span>
                    </label>
                    <input 
                      type="range"
                      min="8" max="28"
                      value={mileage}
                      onChange={(e) => setMileage(parseInt(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Estimated Fuel Cost (₹100/L)</label>
                      <div className="w-full p-2 rounded" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                        ₹{fuelCostCalculated.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Parking & Fees (₹)</label>
                      <input 
                        type="number" 
                        value={parkingFee} 
                        onChange={(e) => setParkingFee(parseInt(e.target.value))}
                        className="w-full p-2 rounded focus:outline-none" 
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Transport Options Listing */}
                {transportsList.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-heading)' }}>
                      🚌 Available Transport Options
                    </h4>
                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                      Choose a transport mode or use own vehicle settings above.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {transportsList.map(t => {
                        const active = selectedTransport?.id === t.id;
                        const name = t.name || t.carrier || 'Transport';
                        return (
                          <div
                            key={t.id}
                            className={`p-4 rounded-xl cursor-pointer transition-all ${active ? 'card-selected' : ''}`}
                            style={{
                              background: active ? 'var(--brand-primary-soft)' : 'var(--bg-elevated)',
                              border: `2px solid ${active ? 'var(--brand-primary)' : 'var(--border-default)'}`
                            }}
                            onClick={() => setSelectedTransport(active ? null : t)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-bold" style={{ color: 'var(--text-heading)' }}>{name}</span>
                                <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                  {t.time || 'Flexible'} • {t.duration || 'Variable'}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>₹{t.pricePerSeat}</span>
                                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>per seat</div>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                              <span className="text-xs font-semibold uppercase" style={{ color: active ? 'var(--brand-primary)' : 'var(--text-tertiary)' }}>
                                {t.type || 'Transport'}
                              </span>
                              <span 
                                className="px-3 py-1 rounded-full text-xs font-bold"
                                style={{ 
                                  background: active ? 'var(--status-success)' : 'transparent',
                                  color: active ? 'var(--text-on-brand)' : 'var(--brand-primary)',
                                  border: `1px solid ${active ? 'var(--status-success)' : 'var(--brand-primary)'}`
                                }}
                              >
                                {active ? '✓ Selected' : 'Select'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Stay */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>Select Accommodation</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Choose a place to stay for {days} nights ({roomCount} rooms needed).</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {staysList.map(h => {
                    const active = selectedStay?.name === h.name;
                    const cost = h.pricePerNight * days * roomCount;
                    return (
                      <div 
                        key={h.name} 
                        className={`p-4 rounded-xl cursor-pointer transition-all ${active ? 'card-selected' : ''}`}
                        style={{ 
                          background: active ? 'var(--brand-primary-soft)' : 'var(--bg-elevated)', 
                          border: `2px solid ${active ? 'var(--brand-primary)' : 'var(--border-default)'}` 
                        }}
                        onClick={() => setSelectedStay(active ? null : h)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg" style={{ color: 'var(--text-heading)' }}>{h.name}</h4>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Verified & Updated</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>₹{cost.toLocaleString()}</div>
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>₹{h.pricePerNight}/night</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Trust Score: 98%</span>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStay(active ? null : h);
                            }}
                            className="px-4 py-1.5 rounded font-bold text-sm"
                            style={{ 
                              background: active ? 'var(--status-success)' : 'transparent', 
                              color: active ? 'var(--text-on-brand)' : 'var(--brand-primary)',
                              border: `1px solid ${active ? 'var(--status-success)' : 'var(--brand-primary)'}`
                            }}
                          >
                            {active ? 'Deselect' : 'Select'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Food */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>Dining Options</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Select preferred eateries for your trip.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {eateriesList.map(r => {
                    const active = selectedFood?.name === r.name;
                    const cost = r.averageMealCost * travelers * days * 3;
                    return (
                      <div 
                        key={r.name} 
                        className={`p-4 rounded-xl cursor-pointer transition-all ${active ? 'card-selected' : ''}`}
                        style={{ 
                          background: active ? 'var(--brand-primary-soft)' : 'var(--bg-elevated)', 
                          border: `2px solid ${active ? 'var(--brand-primary)' : 'var(--border-default)'}` 
                        }}
                        onClick={() => setSelectedFood(active ? null : r)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg" style={{ color: 'var(--text-heading)' }}>{r.name}</h4>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{r.cuisineType} | {r.location || 'Local'}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>₹{cost.toLocaleString()}</div>
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>₹{r.averageMealCost}/meal</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Menu Verified</span>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFood(active ? null : r);
                            }}
                            className="px-4 py-1.5 rounded font-bold text-sm"
                            style={{ 
                              background: active ? 'var(--status-success)' : 'transparent', 
                              color: active ? 'var(--text-on-brand)' : 'var(--brand-primary)',
                              border: `1px solid ${active ? 'var(--status-success)' : 'var(--brand-primary)'}`
                            }}
                          >
                            {active ? 'Deselect' : 'Select'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Guide */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>Local Heritage Guides</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Enhance your trip with an expert local guide.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {guidesList.map(g => {
                    const active = selectedGuide?.name === g.name;
                    const cost = g.pricePerDay * days;
                    return (
                      <div 
                        key={g.name} 
                        className={`p-4 rounded-xl cursor-pointer transition-all ${active ? 'card-selected' : ''}`}
                        style={{ 
                          background: active ? 'var(--brand-primary-soft)' : 'var(--bg-elevated)', 
                          border: `2px solid ${active ? 'var(--brand-primary)' : 'var(--border-default)'}` 
                        }}
                        onClick={() => setSelectedGuide(active ? null : g)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg" style={{ color: 'var(--text-heading)' }}>{g.name}</h4>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Exp: {g.experienceYears || 5} yrs | Lang: {g.languages?.join(', ')}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>₹{cost.toLocaleString()}</div>
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>₹{g.pricePerDay}/day</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Certified Guide</span>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedGuide(active ? null : g);
                            }}
                            className="px-4 py-1.5 rounded font-bold text-sm"
                            style={{ 
                              background: active ? 'var(--status-success)' : 'transparent', 
                              color: active ? 'var(--text-on-brand)' : 'var(--brand-primary)',
                              border: `1px solid ${active ? 'var(--status-success)' : 'var(--brand-primary)'}`
                            }}
                          >
                            {active ? 'Deselect' : 'Select'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 5: Activities */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>Activities & Monument Passes</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Select activities you wish to include.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {(ACTIVITIES_DATABASE[destination] || ACTIVITIES_DATABASE["Hampi"]).map(act => {
                    const active = selectedActivities.some(a => a.id === act.id);
                    const cost = act.price * travelers;
                    return (
                      <div 
                        key={act.id} 
                        className={`p-4 rounded-xl cursor-pointer transition-all ${active ? 'card-selected' : ''}`}
                        style={{ 
                          background: active ? 'var(--brand-primary-soft)' : 'var(--bg-elevated)', 
                          border: `2px solid ${active ? 'var(--brand-primary)' : 'var(--border-default)'}` 
                        }}
                        onClick={() => {
                          if (active) setSelectedActivities(selectedActivities.filter(a => a.id !== act.id));
                          else setSelectedActivities([...selectedActivities, act]);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              checked={active}
                              readOnly
                              className="w-5 h-5 cursor-pointer accent-current text-brand-primary"
                            />
                            <div>
                              <h4 className="font-bold" style={{ color: 'var(--text-heading)' }}>{act.name}</h4>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>₹{cost.toLocaleString()}</div>
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>₹{act.price} pp</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 6: Preferences (Local Transport) */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>Local Transport Preferences</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>How would you like to travel locally at your destination?</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {LOCAL_TRANSIT_DATABASE.map(lt => {
                    const active = selectedLocalTransit?.id === lt.id;
                    const cost = lt.ratePerDay * days;
                    return (
                      <div 
                        key={lt.id} 
                        className={`p-4 rounded-xl cursor-pointer transition-all ${active ? 'card-selected' : ''}`}
                        style={{ 
                          background: active ? 'var(--brand-primary-soft)' : 'var(--bg-elevated)', 
                          border: `2px solid ${active ? 'var(--brand-primary)' : 'var(--border-default)'}` 
                        }}
                        onClick={() => setSelectedLocalTransit(active ? null : lt)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg" style={{ color: 'var(--text-heading)' }}>{lt.name}</h4>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{lt.details}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>₹{cost.toLocaleString()}</div>
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>₹{lt.ratePerDay}/day</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Fixed Tariff</span>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLocalTransit(active ? null : lt);
                            }}
                            className="px-4 py-1.5 rounded font-bold text-sm"
                            style={{ 
                              background: active ? 'var(--status-success)' : 'transparent', 
                              color: active ? 'var(--text-on-brand)' : 'var(--brand-primary)',
                              border: `1px solid ${active ? 'var(--status-success)' : 'var(--brand-primary)'}`
                            }}
                          >
                            {active ? 'Deselect' : 'Select'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 7: Final Itinerary */}
            {currentStep === 7 && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>Review Final Itinerary</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Your personalized trip is ready to be finalized.</p>
                </div>
                
                <div className="space-y-6" style={{ borderLeft: '3px solid var(--brand-primary)', paddingLeft: '24px' }}>
                  {Array.from({ length: days }).map((_, index) => {
                    const dayNum = index + 1;
                    const isFirstDay = dayNum === 1;
                    const isLastDay = dayNum === days && days > 1;
                    
                    return (
                      <div key={dayNum} className="relative">
                        <div className="absolute w-4 h-4 rounded-full -left-[30.5px] top-1" style={{ background: 'var(--brand-primary)' }} />
                        <h4 className="font-bold text-lg" style={{ color: 'var(--text-heading)' }}>
                          DAY {dayNum}: {isFirstDay ? 'Arrival & Check-In' : isLastDay ? 'Activities & Return' : 'Guided Explorations & Transit'}
                        </h4>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                          {isFirstDay ? (
                            <>Travel from {payload.startingLocation} via {selectedTransport?.type || "Own Vehicle"} {tollFares ? `(Tolls: ₹${tollFares.toLocaleString()})` : ''}. Check-in to {selectedStay?.name || "your hotel"}. Dinner at {selectedFood?.name || "local restaurant"}.</>
                          ) : isLastDay ? (
                            <>Conclude morning activities: <strong>{selectedActivities.length > 0 ? selectedActivities.map(a => a.name).join(', ') : "sightseeing"}</strong>. Checkout of hotel and prepare for return journey to {payload.startingLocation}.</>
                          ) : (
                            <>
                              {selectedGuide ? `Meet guide ${selectedGuide.name} at tourist attractions. ` : 'Explore tourist attractions. '}
                              Experience local trails and scenic views utilizing your selected local transit option: <strong>{selectedLocalTransit?.name || "Local Transport"}</strong> {selectedLocalTransit?.details ? `(${selectedLocalTransit.details})` : ''}.
                            </>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                  <h4 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                    <Landmark className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} /> 
                    Interactive Route Map
                  </h4>
                  <div className="rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border-subtle)' }}>
                    <YatraMap 
                      startPoint={mapData.startingPoint}
                      destPoint={mapData.destinationPoint}
                      facilities={mapData.facilities}
                      attractions={mapData.attractions}
                      routePath={mapData.routePath}
                      highwayName={mapData.highwayName}
                      hotelPoint={selectedStay}
                    />
                  </div>
                </div>
                
                {isExceeded && cheaperStays.length > 0 && (
                  <div className="p-4 rounded-xl" style={{ background: 'var(--status-danger-soft)', border: '1px solid var(--status-danger)' }}>
                    <h4 className="font-bold mb-2 text-sm flex items-center gap-2" style={{ color: 'var(--status-danger)' }}>
                      <AlertTriangle className="w-4 h-4" /> You are over budget by ₹{overBudgetAmount.toLocaleString()}. Consider these alternatives:
                    </h4>
                    <div className="space-y-2 mt-3">
                      {cheaperStays.slice(0, 2).map(hotelOption => (
                        <button
                          key={hotelOption.name}
                          onClick={() => { setSelectedStay(hotelOption); setCurrentStep(2); }}
                          className="w-full text-left p-2 rounded text-sm font-semibold hover:opacity-80 transition-opacity"
                          style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
                        >
                          Switch to {hotelOption.name} (₹{hotelOption.pricePerNight.toLocaleString()}/night)
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 5. NAVIGATION BUTTONS */}
      <div className="flex justify-between items-center pt-4">
        <button 
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-opacity disabled:opacity-50"
          style={{ 
            background: 'transparent', 
            color: 'var(--text-primary)', 
            border: '2px solid var(--border-default)'
          }}
        >
          Previous
        </button>
        
        {currentStep < 7 ? (
          <button 
            onClick={() => setCurrentStep(prev => Math.min(7, prev + 1))}
            className="px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wide shadow-md transition-transform hover:scale-105 active:scale-95"
            style={{ 
              background: 'var(--brand-primary)', 
              color: 'var(--text-on-brand)',
              border: 'none'
            }}
          >
            Next Step
          </button>
        ) : (
          <button 
            onClick={handleBookComplete} 
            disabled={isExceeded}
            className="px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wide shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            style={{ 
              background: 'var(--brand-primary)', 
              color: 'var(--text-on-brand)',
              border: 'none'
            }}
          >
            View Results
          </button>
        )}
      </div>

    </motion.div>
  );
}
