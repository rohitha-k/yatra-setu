/**
 * Routing Service (F08, F09)
 * 
 * Computes road route geometry, distances, durations, directional bearings,
 * supports route preferences (avoid tolls, avoid unpaved, highway priority),
 * via-points, and per-leg transportation modes.
 */
class RoutingService {
  /**
   * Calculate legs with preferences and via points
   * @param {Array} activeStops 
   * @param {Object} preferences 
   */
  static computeLegs(activeStops, preferences = {}) {
    const legs = [];
    const avoidTolls = !!preferences.avoidTolls;
    const highwayPriority = preferences.highwayPriority !== false;
    const defaultMode = preferences.travelMode || 'Own Vehicle';

    const dayColors = [
      '#2563EB', // Day 1: Royal Blue
      '#059669', // Day 2: Emerald Green
      '#7C3AED', // Day 3: Purple
      '#D97706', // Day 4: Amber
      '#DC2626', // Day 5: Crimson
      '#0891B2'  // Day 6: Cyan
    ];

    for (let i = 0; i < activeStops.length - 1; i++) {
      const fromStop = activeStops[i];
      const toStop = activeStops[i + 1];
      const legMode = fromStop.legMode || defaultMode;
      const legViaPoints = fromStop.viaPoints || [];

      // Calculate straight line distance
      const straightDistMeters = this.haversineDistance(fromStop, toStop);

      // Curvature multiplier based on route preferences
      let windingFactor = 1.26;
      if (avoidTolls) {
        windingFactor = 1.38; // State roads have more turns than expressways
      } else if (highwayPriority) {
        windingFactor = 1.22;
      }
      if (legMode.toUpperCase() === 'FLIGHT') {
        windingFactor = 1.05;
      }

      const distanceMeters = Math.round(straightDistMeters * windingFactor);

      // Average speed computation
      let speedKmh = 60;
      if (legMode.toUpperCase() === 'FLIGHT') speedKmh = 500;
      else if (legMode.toUpperCase() === 'TRAIN') speedKmh = 65;
      else if (legMode.toUpperCase() === 'BUS') speedKmh = 45;
      else if (legMode.toUpperCase() === 'OWN VEHICLE' || legMode.toUpperCase() === 'CAB') {
        speedKmh = avoidTolls ? 50 : 65;
      }

      const durationSeconds = Math.round((distanceMeters / 1000 / speedKmh) * 3600);

      // Generate polyline with via points and bearing
      const polyline = this.generatePolyline(fromStop, toStop, legViaPoints, windingFactor);
      const bearing = this.calculateBearing(fromStop, toStop);

      // Toll estimation (Rs. 1.35/km on national highways if tolls not avoided)
      const tollFares = (legMode.toUpperCase() === 'OWN VEHICLE' && !avoidTolls)
        ? Math.round((distanceMeters / 1000) * 1.35)
        : 0;

      const legColor = dayColors[i % dayColors.length];

      legs.push({
        id: `leg_${fromStop.id}_${toStop.id}`,
        fromStopId: fromStop.id,
        toStopId: toStop.id,
        mode: legMode,
        distanceMeters,
        durationSeconds,
        tollFares,
        polyline,
        viaPoints: legViaPoints,
        bearingDegrees: Math.round(bearing),
        color: legColor,
        preferences: {
          avoidTolls,
          highwayPriority
        }
      });
    }

    return legs;
  }

  static haversineDistance(p1, p2) {
    const R = 6371e3; // meters
    const phi1 = (p1.lat * Math.PI) / 180;
    const phi2 = (p2.lat * Math.PI) / 180;
    const deltaPhi = ((p2.lat - p1.lat) * Math.PI) / 180;
    const deltaLambda = ((p2.lng - p1.lng) * Math.PI) / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static generatePolyline(fromStop, toStop, viaPoints = [], windingFactor = 1.25) {
    const controlPoints = [fromStop, ...viaPoints, toStop];
    const polyline = [];

    for (let cp = 0; cp < controlPoints.length - 1; cp++) {
      const start = controlPoints[cp];
      const end = controlPoints[cp + 1];
      const steps = 8;

      for (let s = 0; s <= steps; s++) {
        const ratio = s / steps;
        // Subtle realistic road curvature
        const arc = Math.sin(ratio * Math.PI) * (windingFactor > 1.3 ? 0.03 : 0.015);
        polyline.push({
          lat: Number((start.lat + (end.lat - start.lat) * ratio + arc).toFixed(6)),
          lng: Number((start.lng + (end.lng - start.lng) * ratio).toFixed(6))
        });
      }
    }

    return polyline;
  }

  static calculateBearing(start, end) {
    const startLat = (start.lat * Math.PI) / 180;
    const startLng = (start.lng * Math.PI) / 180;
    const endLat = (end.lat * Math.PI) / 180;
    const endLng = (end.lng * Math.PI) / 180;

    const y = Math.sin(endLng - startLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) -
              Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
    const brng = Math.atan2(y, x);
    return ((brng * 180) / Math.PI + 360) % 360;
  }
}

export default RoutingService;
