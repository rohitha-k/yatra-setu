/**
 * Schedule Service (F05, F06, F07, F10)
 * 
 * Computes deterministic daily scheduling, arrival/departure timestamps,
 * propagates timeline across stops, protects locked appointments,
 * and detects schedule conflicts.
 */
class ScheduleService {
  /**
   * Computes day-by-day timetable and stop arrival/departure times
   * @param {Array} stops 
   * @param {Array} routeLegs 
   * @param {Object} options 
   */
  static computeSchedule(stops, routeLegs, options = {}) {
    const {
      travelDates = new Date().toISOString().split('T')[0],
      daysCount = 1,
      dayStartTime = '09:00',
      dayEndTime = '20:00',
      maxDailyDrivingHours = 7
    } = options;

    const baseDate = new Date(travelDates);
    const dayStartMinutes = this.timeToMinutes(dayStartTime);
    const dayEndMinutes = this.timeToMinutes(dayEndTime);
    const maxDrivingSeconds = maxDailyDrivingHours * 3600;

    const scheduledStops = [];
    const days = [];
    const warnings = [];

    // Initialize day buckets
    for (let d = 0; d < daysCount; d++) {
      const dDate = new Date(baseDate);
      dDate.setDate(dDate.getDate() + d);
      days.push({
        dayIndex: d + 1,
        date: dDate.toISOString().split('T')[0],
        label: `Day ${d + 1}`,
        startTime: dayStartTime,
        endTime: dayEndTime,
        maxDrivingHours: maxDailyDrivingHours,
        totalDrivingSeconds: 0,
        totalDistanceMeters: 0,
        stopIds: [],
        warnings: []
      });
    }

    let currentDayIdx = 0;
    let currentMinute = dayStartMinutes;

    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      if (stop.isSkipped) {
        scheduledStops.push({ ...stop, scheduledDay: null, arrivalTime: null, departureTime: null });
        continue;
      }

      // If there was a previous active stop, add travel time from the connecting leg
      if (i > 0) {
        const prevStop = stops[i - 1];
        const leg = routeLegs.find(l => l.fromStopId === prevStop.id && l.toStopId === stop.id) || routeLegs[i - 1];
        const travelSeconds = leg ? leg.durationSeconds : 1800;
        const travelMinutes = Math.ceil(travelSeconds / 60);

        currentMinute += travelMinutes;
        if (days[currentDayIdx]) {
          days[currentDayIdx].totalDrivingSeconds += travelSeconds;
          days[currentDayIdx].totalDistanceMeters += (leg?.distanceMeters || 0);
        }
      }

      const arrivalTimeStr = this.minutesToTime(currentMinute);

      // Check for locked appointment conflict (F07)
      if (stop.isLocked && stop.lockedArrivalTime) {
        const lockedMin = this.timeToMinutes(stop.lockedArrivalTime);
        if (currentMinute > lockedMin) {
          const delayMin = currentMinute - lockedMin;
          warnings.push({
            id: `warn_lock_${stop.id}`,
            severity: 'HIGH',
            type: 'LOCKED_APPOINTMENT_INFEASIBLE',
            message: `Locked arrival at ${stop.name} (${stop.lockedArrivalTime}) is infeasible; arrival is delayed by ${delayMin} mins (${arrivalTimeStr}).`,
            correctiveAction: 'Shift locked time or depart earlier'
          });
        }
      }

      // Add dwell duration (respect 0 minutes for origin or quick drive-bys)
      const dwellMinutes = stop.durationMinutes !== undefined ? Number(stop.durationMinutes) : 60;
      currentMinute += dwellMinutes;
      const departureTimeStr = this.minutesToTime(currentMinute);

      // Check for late arrival past day end time (F10)
      if (currentMinute > dayEndMinutes) {
        const lateMin = currentMinute - dayEndMinutes;
        warnings.push({
          id: `warn_late_${stop.id}`,
          severity: 'MEDIUM',
          type: 'LATE_ARRIVAL',
          message: `Arrival/dwell at ${stop.name} extends ${lateMin} minutes past daily end time (${dayEndTime}).`,
          correctiveAction: 'Shorten stop duration or move stop to next day'
        });
      }

      // Assign to day
      if (days[currentDayIdx]) {
        days[currentDayIdx].stopIds.push(stop.id);
      }

      scheduledStops.push({
        ...stop,
        scheduledDay: currentDayIdx + 1,
        arrivalTime: arrivalTimeStr,
        departureTime: departureTimeStr
      });

      // If stop has overnight stay, advance to next day
      if (stop.nights > 0) {
        currentDayIdx = Math.min(daysCount - 1, currentDayIdx + stop.nights);
        currentMinute = dayStartMinutes;
      }
    }

    // Check for excess driving on each day (F05, F06, F10)
    days.forEach(day => {
      const driveHours = parseFloat((day.totalDrivingSeconds / 3600).toFixed(1));
      day.drivingHours = driveHours;
      day.distanceKm = Math.round(day.totalDistanceMeters / 1000);

      if (day.totalDrivingSeconds > maxDrivingSeconds) {
        const overHours = parseFloat(((day.totalDrivingSeconds - maxDrivingSeconds) / 3600).toFixed(1));
        warnings.push({
          id: `warn_excess_drive_${day.dayIndex}`,
          severity: 'HIGH',
          type: 'EXCESS_DRIVING',
          message: `${day.label} has ${driveHours} hrs of travel (exceeds ${maxDailyDrivingHours}h limit by ${overHours}h).`,
          correctiveAction: 'Add an overnight rest stop along the route'
        });
      }
    });

    return {
      scheduledStops,
      days,
      warnings
    };
  }

  static timeToMinutes(timeStr = '09:00') {
    const [h, m] = String(timeStr).split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  static minutesToTime(totalMinutes) {
    const normalized = totalMinutes % (24 * 60);
    const h = Math.floor(normalized / 60);
    const m = Math.floor(normalized % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
}

export default ScheduleService;
