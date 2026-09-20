import { dbAdapter } from '../config/db.js';

class ItineraryConflictService {
  /**
   * Detect conflicts between a proposed booking and the user's existing confirmed bookings
   */
  static async detectConflicts(userId, proposedBooking) {
    const { serviceType, startDate, endDate, resourceId } = proposedBooking;
    const conflicts = [];

    // Get all CONFIRMED bookings for this user
    const existingBookings = await dbAdapter.find('bookings', {
      userId,
      status: 'CONFIRMED'
    });

    const propStart = new Date(startDate);
    const propEnd = new Date(endDate || startDate);

    for (const existing of existingBookings) {
      const exStart = new Date(existing.startDate);
      const exEnd = new Date(existing.endDate || existing.startDate);

      // Check for time overlap
      if (propStart < exEnd && propEnd > exStart) {
        // Same service type overlap
        if (existing.serviceType === serviceType) {
          conflicts.push({
            type: 'SAME_SERVICE_OVERLAP',
            severity: 'HIGH',
            existingBooking: existing,
            message: `You already have a ${serviceType} booking (${existing.resourceId}) from ${exStart.toDateString()} to ${exEnd.toDateString()} that overlaps with this request.`
          });
        }

        // Hotel check-in vs tour time conflict
        if (
          (serviceType === 'TOUR_GUIDE' && existing.serviceType === 'HOTEL') ||
          (serviceType === 'HOTEL' && existing.serviceType === 'TOUR_GUIDE')
        ) {
          // Check if check-in day overlaps with tour start
          if (propStart.toDateString() === exStart.toDateString()) {
            conflicts.push({
              type: 'CHECKIN_TOUR_CONFLICT',
              severity: 'MEDIUM',
              existingBooking: existing,
              message: `Your hotel check-in and tour guide booking overlap on ${propStart.toDateString()}. Consider scheduling the tour for a different time.`
            });
          }
        }

        // Restaurant timing conflict with tours
        if (
          (serviceType === 'RESTAURANT' && existing.serviceType === 'TOUR_GUIDE') ||
          (serviceType === 'TOUR_GUIDE' && existing.serviceType === 'RESTAURANT')
        ) {
          conflicts.push({
            type: 'DINING_TOUR_OVERLAP',
            severity: 'LOW',
            existingBooking: existing,
            message: `Your dining reservation and tour guide session overlap on ${propStart.toDateString()}. The AI recommends adjusting the dining time.`
          });
        }
      }

      // Insufficient travel buffer check (within 2 hours)
      const bufferMs = 2 * 60 * 60 * 1000;
      if (
        Math.abs(propStart.getTime() - exEnd.getTime()) < bufferMs ||
        Math.abs(propEnd.getTime() - exStart.getTime()) < bufferMs
      ) {
        if (existing.serviceType !== serviceType) {
          conflicts.push({
            type: 'INSUFFICIENT_BUFFER',
            severity: 'LOW',
            existingBooking: existing,
            message: `Less than 2 hours between your ${existing.serviceType} and this ${serviceType} booking. Travel time may be tight.`
          });
        }
      }
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      highSeverityCount: conflicts.filter(c => c.severity === 'HIGH').length,
      suggestions: this.generateSuggestions(conflicts)
    };
  }

  static generateSuggestions(conflicts) {
    const suggestions = [];

    for (const conflict of conflicts) {
      switch (conflict.type) {
        case 'SAME_SERVICE_OVERLAP':
          suggestions.push({
            action: 'CHANGE_DATES',
            message: 'Consider selecting different dates to avoid double-booking the same service type.'
          });
          break;
        case 'CHECKIN_TOUR_CONFLICT':
          suggestions.push({
            action: 'RESCHEDULE_TOUR',
            message: 'Schedule the tour to start after hotel check-in (typically 2:00 PM).'
          });
          break;
        case 'DINING_TOUR_OVERLAP':
          suggestions.push({
            action: 'ADJUST_DINING',
            message: 'Move dining to an earlier or later time slot that does not overlap with your tour.'
          });
          break;
        case 'INSUFFICIENT_BUFFER':
          suggestions.push({
            action: 'ADD_BUFFER',
            message: 'Allow at least 2 hours between activities for comfortable travel time.'
          });
          break;
      }
    }

    return suggestions;
  }
}

export default ItineraryConflictService;
