import { dbAdapter } from '../config/db.js';
import TrustEngine from './trustEngine.js';
import ScheduleService from './scheduleService.js';
import RoutingService from './routingService.js';

/**
 * Canonical Trip Recalculation Service
 * 
 * Enforces one unified trip revision as the input/output of all calculations.
 * Ensures map geometry, schedule, cost ledger, warnings, and alternatives
 * remain perfectly synchronized.
 */
class TripRecalculationService {
  /**
   * Recalculate candidate trip changes and produce a preview revision
   * @param {Object} trip Current or candidate trip payload
   * @param {Object} options Calculation options (e.g. isCommit: boolean)
   */
  static async recalculate(trip, options = {}) {
    const isCommit = !!options.isCommit;
    const currentRevision = Number(trip.revision || 1);
    const nextRevision = isCommit ? currentRevision + 1 : currentRevision;

    // 1. Budget & Reserve Validation (Deduct reserve first)
    const totalBudget = Math.max(0, Number(trip.budgetLimit || 15000));
    const emergencyReserve = Math.max(0, Math.min(totalBudget, Number(trip.emergencyReserve !== undefined ? trip.emergencyReserve : 2000)));
    const spendableBudget = totalBudget - emergencyReserve;

    const travelersCount = Math.max(1, Number(trip.travelersCount || 1));
    const daysCount = Math.max(1, Number(trip.daysCount || 1));
    const travelMode = trip.travelMode || 'Train';
    const units = trip.units || 'km';
    const currency = trip.currency || 'INR';

    // 2. Normalization of Stops (Ensure stable IDs and coordinates)
    let stops = Array.isArray(trip.stops) && trip.stops.length > 0 
      ? [...trip.stops] 
      : this.buildDefaultStops(trip);

    // Filter out deleted/skipped stops for active routing, but retain skipped stops in list
    stops = stops.map((stop, index) => ({
      id: stop.id || `stop_${Date.now()}_${index}`,
      sequence: index,
      name: stop.name || `Waypoint ${index + 1}`,
      address: stop.address || '',
      category: stop.category || (index === 0 ? 'ORIGIN' : index === stops.length - 1 ? 'DESTINATION' : 'WAYPOINT'),
      lat: Number(stop.lat || stop.latitude || (index === 0 ? 17.3850 : 15.3350)),
      lng: Number(stop.lng || stop.longitude || (index === 0 ? 78.4867 : 76.4600)),
      durationMinutes: Number(stop.durationMinutes || (stop.category === 'HOTEL' ? 720 : 60)),
      nights: Number(stop.nights || 0),
      isLocked: !!stop.isLocked,
      lockedArrivalTime: stop.lockedArrivalTime || null,
      isSkipped: !!stop.isSkipped,
      notes: stop.notes || '',
      contact: stop.contact || '',
      tags: Array.isArray(stop.tags) ? stop.tags : [],
      estimatedCost: stop.estimatedCost !== undefined ? Number(stop.estimatedCost) : null
    }));

    // 3. Compute Route Legs using RoutingService (F08, F09)
    const activeStops = stops.filter(s => !s.isSkipped);
    const routeLegs = RoutingService.computeLegs(activeStops, {
      ...trip.routePreferences,
      travelMode
    });

    let totalDistanceMeters = 0;
    let totalDurationSeconds = 0;
    routeLegs.forEach(leg => {
      totalDistanceMeters += leg.distanceMeters;
      totalDurationSeconds += leg.durationSeconds;
    });

    // 4. Daily Scheduling and Timeline using ScheduleService (F05, F07, F10)
    const scheduleResult = ScheduleService.computeSchedule(stops, routeLegs, {
      travelDates: trip.travelDates,
      daysCount,
      dayStartTime: trip.dayStartTime || '09:00',
      dayEndTime: trip.dayEndTime || '20:00',
      maxDailyDrivingHours: Number(trip.maxDailyDrivingHours || 7)
    });

    const scheduledStops = scheduleResult.scheduledStops;
    const days = scheduleResult.days;

    // 5. Automatic Overnight Suggestions (F06)
    const overnightSuggestions = await this.findOvernightSuggestions({
      days,
      routeLegs,
      stops: scheduledStops,
      maxDailyDrivingHours: Number(trip.maxDailyDrivingHours || 7)
    });

    // 6. Cost Ledger & Expenditure Calculation
    const ledger = await this.calculateLedger({
      totalBudget,
      emergencyReserve,
      spendableBudget,
      travelersCount,
      daysCount,
      travelMode,
      totalDistanceKm: totalDistanceMeters / 1000,
      stops: scheduledStops,
      expenses: trip.expenses || [],
      selectedAccommodation: trip.selectedAccommodation,
      selectedFood: trip.selectedFood,
      selectedGuide: trip.selectedGuide,
      mileage: Number(trip.mileage || 15),
      destination: trip.destination || stops[stops.length - 1]?.name || 'Hampi'
    });

    // 7. Constraints & Warnings Evaluation
    const generalWarnings = this.evaluateWarnings({
      spendableBudget,
      totalProjectedCost: ledger.totalProjectedCost,
      days,
      stops: scheduledStops,
      routeLegs,
      maxDailyDrivingHours: Number(trip.maxDailyDrivingHours || 7)
    });

    // Merge schedule-specific warnings with budget/general warnings
    const combinedWarnings = [
      ...scheduleResult.warnings,
      ...generalWarnings
    ];

    // 8. Alternatives & Suggestions
    const alternatives = await this.generateAlternatives({
      spendableBudget,
      totalProjectedCost: ledger.totalProjectedCost,
      destination: trip.destination || 'Hampi',
      travelersCount,
      daysCount,
      currentAccommodation: ledger.selectedAccommodation
    });

    return {
      ...trip,
      revision: nextRevision,
      totalBudget,
      emergencyReserve,
      spendableBudget,
      travelersCount,
      daysCount,
      travelMode,
      units,
      currency,
      stops: scheduledStops,
      routeLegs,
      days,
      ledger,
      warnings: combinedWarnings,
      overnightSuggestions,
      alternatives,
      summary: {
        totalDistanceKm: Math.round(totalDistanceMeters / 1000),
        totalTravelTimeHours: parseFloat((totalDurationSeconds / 3600).toFixed(1)),
        stopsCount: stops.length,
        activeStopsCount: activeStops.length,
        budgetStatus: ledger.budgetStatus,
        calculatedAt: new Date().toISOString()
      }
    };
  }

  static async findOvernightSuggestions(params) {
    const { days, routeLegs, stops, maxDailyDrivingHours } = params;
    const suggestions = [];

    // Find days exceeding max driving hours or legs > 5 hours
    for (const leg of routeLegs) {
      const legHours = leg.durationSeconds / 3600;
      if (legHours >= 5.5) {
        // Compute midway point
        const fromStop = stops.find(s => s.id === leg.fromStopId);
        const toStop = stops.find(s => s.id === leg.toStopId);
        if (!fromStop || !toStop) continue;

        const midLat = (fromStop.lat + toStop.lat) / 2;
        const midLng = (fromStop.lng + toStop.lng) / 2;

        // Suggested town candidates along popular corridors
        let townName = 'Midway Transit Town';
        if (Math.abs(midLat - 15.8) < 1.0) townName = 'Kurnool / Anantapur Hub';
        else if (Math.abs(midLat - 20.0) < 2.0) townName = 'Nagpur Highway Oasis';
        else if (Math.abs(midLat - 14.0) < 1.0) townName = 'Chitradurga Heritage Stay';

        suggestions.push({
          id: `overnight_${leg.id}`,
          reason: `Leg driving time is ${legHours.toFixed(1)} hrs (exceeds safe driving fatigue limit).`,
          suggestedLocation: townName,
          coordinates: { lat: Number(midLat.toFixed(4)), lng: Number(midLng.toFixed(4)) },
          suggestedStop: {
            name: `${townName} Overnight Rest`,
            category: 'HOTEL',
            lat: Number(midLat.toFixed(4)),
            lng: Number(midLng.toFixed(4)),
            durationMinutes: 600,
            nights: 1,
            notes: 'Recommended overnight stop to prevent driver fatigue'
          }
        });
      }
    }

    return suggestions;
  }

  static buildDefaultStops(trip) {
    const origin = trip.startingLocation || 'Hyderabad';
    const dest = trip.destination || 'Hampi';

    const coordsMap = {
      'Hyderabad': { lat: 17.3850, lng: 78.4867 },
      'Hampi': { lat: 15.3350, lng: 76.4600 },
      'Araku Valley': { lat: 18.2748, lng: 82.8711 },
      'Tirupati': { lat: 13.6288, lng: 79.4192 },
      'Varanasi': { lat: 25.3176, lng: 82.9739 },
      'Coorg': { lat: 12.3375, lng: 75.8069 },
      'Jaipur': { lat: 26.9124, lng: 75.7873 },
      'Goa': { lat: 15.2993, lng: 74.1240 }
    };

    const startCoord = coordsMap[origin] || { lat: 17.3850, lng: 78.4867 };
    const destCoord = coordsMap[dest] || { lat: 15.3350, lng: 76.4600 };

    const intermediateStops = Array.isArray(trip.intermediateCities) 
      ? trip.intermediateCities.map((city, idx) => ({
          id: `stop_inter_${idx}`,
          name: city,
          category: 'ATTRACTION',
          lat: coordsMap[city]?.lat || (startCoord.lat + (destCoord.lat - startCoord.lat) * ((idx + 1) / (trip.intermediateCities.length + 1))),
          lng: coordsMap[city]?.lng || (startCoord.lng + (destCoord.lng - startCoord.lng) * ((idx + 1) / (trip.intermediateCities.length + 1))),
          durationMinutes: 90,
          nights: 0
        }))
      : [];

    return [
      {
        id: 'stop_origin',
        name: origin,
        category: 'ORIGIN',
        lat: startCoord.lat,
        lng: startCoord.lng,
        durationMinutes: 0,
        nights: 0
      },
      ...intermediateStops,
      {
        id: 'stop_dest',
        name: dest,
        category: 'DESTINATION',
        lat: destCoord.lat,
        lng: destCoord.lng,
        durationMinutes: 720,
        nights: Math.max(1, (trip.daysCount || 1) - 1)
      }
    ];
  }

  static calculateLeg(fromStop, toStop, mode, preferences = {}) {
    // Great circle distance with road winding multiplier (approx 1.25 for Indian highways)
    const R = 6371e3; // metres
    const phi1 = (fromStop.lat * Math.PI) / 180;
    const phi2 = (toStop.lat * Math.PI) / 180;
    const deltaPhi = ((toStop.lat - fromStop.lat) * Math.PI) / 180;
    const deltaLambda = ((toStop.lng - fromStop.lng) * Math.PI) / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDistMeters = R * c;

    // Road curvature factor
    const roadFactor = mode.toUpperCase() === 'FLIGHT' ? 1.05 : 1.28;
    const distanceMeters = Math.round(straightDistMeters * roadFactor);

    // Average speeds by mode
    let avgSpeedKmh = 60;
    if (mode.toUpperCase() === 'FLIGHT') avgSpeedKmh = 500;
    else if (mode.toUpperCase() === 'TRAIN') avgSpeedKmh = 65;
    else if (mode.toUpperCase() === 'BUS') avgSpeedKmh = 45;
    else if (mode.toUpperCase() === 'OWN VEHICLE' || mode.toUpperCase() === 'CAB') avgSpeedKmh = 60;

    const durationSeconds = Math.round((distanceMeters / 1000 / avgSpeedKmh) * 3600);

    // Generate intermediate route polyline points
    const steps = 8;
    const polyline = [];
    for (let s = 0; s <= steps; s++) {
      const ratio = s / steps;
      // Introduce subtle curvature for realistic road rendering
      const arcOffset = Math.sin(ratio * Math.PI) * 0.02;
      polyline.push({
        lat: Number((fromStop.lat + (toStop.lat - fromStop.lat) * ratio + arcOffset).toFixed(6)),
        lng: Number((fromStop.lng + (toStop.lng - fromStop.lng) * ratio).toFixed(6))
      });
    }

    return {
      id: `leg_${fromStop.id}_${toStop.id}`,
      fromStopId: fromStop.id,
      toStopId: toStop.id,
      mode,
      distanceMeters,
      durationSeconds,
      polyline,
      viaPoints: [],
      tollsEstimated: mode.toUpperCase() === 'OWN VEHICLE' ? Math.round((distanceMeters / 1000) * 1.35) : 0
    };
  }

  static calculateSchedule(stops, routeLegs, config) {
    const days = [];
    const totalDays = config.daysCount;
    const baseDate = config.travelDates ? new Date(config.travelDates) : new Date();

    for (let d = 0; d < totalDays; d++) {
      const dayDate = new Date(baseDate);
      dayDate.setDate(dayDate.getDate() + d);
      const dateStr = dayDate.toISOString().split('T')[0];

      // Distribute stops across days
      const dayStops = stops.filter((_, idx) => {
        if (totalDays === 1) return true;
        const targetDay = Math.min(totalDays - 1, Math.floor((idx / stops.length) * totalDays));
        return targetDay === d;
      });

      let dayDriveSeconds = 0;
      routeLegs.forEach((leg, idx) => {
        if (idx % totalDays === d) {
          dayDriveSeconds += leg.durationSeconds;
        }
      });

      days.push({
        dayIndex: d + 1,
        date: dateStr,
        label: `Day ${d + 1}: ${dayStops[0]?.name || 'Transit'}`,
        startTime: config.dayStartTime,
        endTime: config.dayEndTime,
        travelDurationHours: parseFloat((dayDriveSeconds / 3600).toFixed(1)),
        stopsCount: dayStops.length,
        stopIds: dayStops.map(s => s.id)
      });
    }

    return days;
  }

  static async calculateLedger(params) {
    const {
      totalBudget,
      emergencyReserve,
      spendableBudget,
      travelersCount,
      daysCount,
      travelMode,
      totalDistanceKm,
      stops,
      expenses,
      selectedAccommodation,
      selectedFood,
      selectedGuide,
      mileage,
      destination
    } = params;

    // 1. Transport Cost
    let transportCost = 0;
    let tollFares = 0;
    if (travelMode.toUpperCase() === 'OWN VEHICLE') {
      const fuelLiters = Math.round(totalDistanceKm / (mileage || 15));
      const fuelCost = fuelLiters * 102; // Current avg petrol/diesel in INR
      tollFares = Math.round(totalDistanceKm * 1.3);
      transportCost = fuelCost + tollFares + 300; // parking
    } else if (travelMode.toUpperCase() === 'FLIGHT') {
      transportCost = 4200 * travelersCount;
    } else if (travelMode.toUpperCase() === 'BUS') {
      transportCost = 750 * travelersCount;
    } else {
      transportCost = 380 * travelersCount; // Train default
    }

    // 2. Stay Cost
    let stayCost = 0;
    let stayItem = selectedAccommodation;
    if (!stayItem) {
      const hotels = await dbAdapter.find('hotels', { destination });
      stayItem = hotels[0] || { name: `${destination} Heritage Homestay`, pricePerNight: 1200 };
    }
    const rooms = Math.ceil(travelersCount / 2);
    stayCost = (stayItem.pricePerNight || 1200) * daysCount * rooms;

    // 3. Food Cost
    let foodCost = 0;
    let foodItem = selectedFood;
    if (!foodItem) {
      const restaurants = await dbAdapter.find('restaurants', { destination });
      foodItem = restaurants[0] || { name: `${destination} Traditional Thali`, averageMealCost: 180 };
    }
    foodCost = (foodItem.averageMealCost || 180) * travelersCount * daysCount * 3;

    // 4. Guide & Activity Costs
    let guideCost = 0;
    let guideItem = selectedGuide;
    if (spendableBudget > 12000 && !guideItem) {
      const guides = await dbAdapter.find('guides', { destination });
      guideItem = guides[0] || null;
    }
    if (guideItem && guideItem.pricePerDay) {
      guideCost = guideItem.pricePerDay * daysCount;
    }

    // 5. Explicit stop costs (admissions, entry fees)
    let stopsCost = 0;
    stops.forEach(s => {
      if (s.estimatedCost !== null && !isNaN(s.estimatedCost)) {
        stopsCost += Number(s.estimatedCost) * travelersCount;
      }
    });

    // 6. Reconcile Actual Recorded Expenses against Planned Items (Avoid double-counting)
    let actualExpensesTotal = 0;
    const recordedActualsByCategory = {};

    if (Array.isArray(expenses)) {
      expenses.forEach(exp => {
        const amt = Number(exp.amount || 0);
        actualExpensesTotal += amt;
        const cat = exp.category || 'OTHER';
        recordedActualsByCategory[cat] = (recordedActualsByCategory[cat] || 0) + amt;
      });
    }

    // Reconcile planned remaining: if actual accommodation is recorded, use actual; otherwise planned
    const finalStayCost = recordedActualsByCategory['ACCOMMODATION'] !== undefined ? recordedActualsByCategory['ACCOMMODATION'] : stayCost;
    const finalTransportCost = recordedActualsByCategory['TRANSPORT'] !== undefined ? recordedActualsByCategory['TRANSPORT'] : transportCost;
    const finalFoodCost = recordedActualsByCategory['FOOD'] !== undefined ? recordedActualsByCategory['FOOD'] : foodCost;
    const finalGuideCost = recordedActualsByCategory['GUIDE'] !== undefined ? recordedActualsByCategory['GUIDE'] : guideCost;

    const totalProjectedCost = finalStayCost + finalTransportCost + finalFoodCost + finalGuideCost + stopsCost;
    const remainingSpendable = spendableBudget - totalProjectedCost;

    let budgetStatus = 'Comfortable';
    if (totalProjectedCost > spendableBudget) {
      budgetStatus = 'Over Budget';
    } else if (totalProjectedCost > spendableBudget * 0.88) {
      budgetStatus = 'Tight';
    }

    return {
      totalBudget,
      emergencyReserve,
      spendableBudget,
      totalProjectedCost,
      remainingSpendable,
      budgetStatus,
      utilizationPercentage: parseFloat(((totalProjectedCost / spendableBudget) * 100).toFixed(1)),
      breakdown: {
        transport: { planned: transportCost, actual: recordedActualsByCategory['TRANSPORT'] || 0, final: finalTransportCost },
        accommodation: { planned: stayCost, actual: recordedActualsByCategory['ACCOMMODATION'] || 0, final: finalStayCost, item: stayItem },
        food: { planned: foodCost, actual: recordedActualsByCategory['FOOD'] || 0, final: finalFoodCost, item: foodItem },
        guide: { planned: guideCost, actual: recordedActualsByCategory['GUIDE'] || 0, final: finalGuideCost, item: guideItem },
        stopsAndActivities: { planned: stopsCost, actual: recordedActualsByCategory['ACTIVITIES'] || 0, final: stopsCost }
      },
      selectedAccommodation: stayItem,
      selectedFood: foodItem,
      selectedGuide: guideItem
    };
  }

  static evaluateWarnings(params) {
    const { spendableBudget, totalProjectedCost, days, stops, maxDailyDrivingHours } = params;
    const warnings = [];

    // Over-budget warning
    if (totalProjectedCost > spendableBudget) {
      const overBy = totalProjectedCost - spendableBudget;
      warnings.push({
        id: 'warn_over_budget',
        severity: 'HIGH',
        type: 'BUDGET_OVERRUN',
        message: `Trip exceeds spendable limit by ₹${overBy.toLocaleString('en-IN')} (preserving your ₹${(params.emergencyReserve || 2000).toLocaleString('en-IN')} emergency reserve).`,
        correctiveAction: 'Downgrade accommodation or replace transit mode'
      });
    }

    // Excess driving hours per day
    days.forEach(d => {
      if (d.travelDurationHours > maxDailyDrivingHours) {
        warnings.push({
          id: `warn_drive_day_${d.dayIndex}`,
          severity: 'MEDIUM',
          type: 'EXCESS_DRIVING',
          message: `${d.label} has ${d.travelDurationHours} hrs of travel (exceeds ${maxDailyDrivingHours}h limit).`,
          correctiveAction: 'Add an overnight rest stop along the route'
        });
      }
    });

    // Unresolved overnight warning
    const multiDay = days.length > 1;
    const hasOvernightStay = stops.some(s => s.nights > 0 || s.category === 'HOTEL');
    if (multiDay && !hasOvernightStay) {
      warnings.push({
        id: 'warn_no_overnight',
        severity: 'MEDIUM',
        type: 'UNRESOLVED_OVERNIGHT',
        message: 'No overnight lodging selected for this multi-day journey.',
        correctiveAction: 'Select a verified hotel or homestay'
      });
    }

    return warnings;
  }

  static async generateAlternatives(params) {
    const { spendableBudget, totalProjectedCost, destination, travelersCount, daysCount, currentAccommodation } = params;
    if (totalProjectedCost <= spendableBudget) return [];

    const alternatives = [];
    const allHotels = await dbAdapter.find('hotels', { destination });
    const rooms = Math.ceil(travelersCount / 2);

    for (const h of allHotels) {
      if (currentAccommodation && h.name === currentAccommodation.name) continue;
      const altStayCost = h.pricePerNight * daysCount * rooms;
      const currentCost = (currentAccommodation?.pricePerNight || 1500) * daysCount * rooms;
      const savings = currentCost - altStayCost;

      if (savings > 0) {
        alternatives.push({
          type: 'ACCOMMODATION_SUBSTITUTION',
          title: `Switch to ${h.name}`,
          item: h,
          savings,
          newProjectedCost: totalProjectedCost - savings,
          explanation: `Saves ₹${savings.toLocaleString('en-IN')} to bring trip within spendable budget.`
        });
      }
    }

    return alternatives.slice(0, 3);
  }
}

export default TripRecalculationService;
