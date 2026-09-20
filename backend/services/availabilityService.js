import { dbAdapter, isUsingMongo } from '../config/db.js';
import mongoose from 'mongoose';

class AvailabilityService {
  /**
   * Unified availability check dispatcher
   */
  static async checkAvailability(serviceType, resourceId, params = {}) {
    const { startDate, endDate, guests = 1, timeSlot } = params;

    switch (serviceType) {
      case 'HOTEL':
        return this.checkHotelAvailability(resourceId, startDate, endDate, guests);
      case 'RESTAURANT':
        return this.checkRestaurantAvailability(resourceId, startDate, timeSlot, guests);
      case 'TOUR_GUIDE':
        return this.checkGuideAvailability(resourceId, startDate, endDate);
      case 'TRANSPORT':
        return this.checkTransportAvailability(resourceId, startDate, guests);
      default:
        throw new Error(`Unknown service type: ${serviceType}`);
    }
  }

  static async checkHotelAvailability(resourceId, startDate, endDate, guests) {
    // Get hotel details
    const hotel = await dbAdapter.findOne('hotels', isUsingMongo ? { _id: resourceId } : { _id: resourceId });
    if (!hotel) return { available: false, reason: 'Hotel not found' };

    const totalRooms = hotel.availableRooms || 5;
    const roomsNeeded = Math.ceil(guests / 2);

    // Count overlapping active bookings (HOLD or CONFIRMED)
    const overlapping = await dbAdapter.find('bookings', {
      resourceId: resourceId,
      serviceType: 'HOTEL',
      status: { $in: ['HOLD', 'CONFIRMED'] }
    });

    // For JSON fallback, filter by date overlap manually
    const start = new Date(startDate);
    const end = new Date(endDate);
    const activeBookings = overlapping.filter(b => {
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      return bStart < end && bEnd > start;
    });

    const bookedRooms = activeBookings.reduce((sum, b) => sum + Math.ceil((b.guests || 1) / 2), 0);
    const availableRooms = totalRooms - bookedRooms;

    if (availableRooms >= roomsNeeded) {
      return {
        available: true,
        resource: hotel,
        availableRooms,
        roomsNeeded,
        holdEligible: true
      };
    }

    return {
      available: false,
      reason: `Only ${availableRooms} rooms available, but ${roomsNeeded} needed`,
      resource: hotel,
      availableRooms
    };
  }

  static async checkGuideAvailability(resourceId, startDate, endDate) {
    const guide = await dbAdapter.findOne('guides', isUsingMongo ? { _id: resourceId } : { _id: resourceId });
    if (!guide) return { available: false, reason: 'Guide not found' };

    // Check guide's own unavailability calendar
    const start = new Date(startDate);
    const end = new Date(endDate || startDate);
    const unavailableDates = (guide.availabilityCalendar || []).map(d => new Date(d).toDateString());

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (unavailableDates.includes(d.toDateString())) {
        return { available: false, reason: `Guide unavailable on ${d.toDateString()}`, resource: guide };
      }
    }

    // Check existing bookings
    const overlapping = await dbAdapter.find('bookings', {
      resourceId: resourceId,
      serviceType: 'TOUR_GUIDE',
      status: { $in: ['HOLD', 'CONFIRMED'] }
    });

    const conflict = overlapping.find(b => {
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate || b.startDate);
      return bStart < end && bEnd > start;
    });

    if (conflict) {
      return { available: false, reason: 'Guide already booked for these dates', resource: guide };
    }

    return { available: true, resource: guide, holdEligible: true };
  }

  static async checkRestaurantAvailability(resourceId, date, timeSlot, guests) {
    const restaurant = await dbAdapter.findOne('restaurants', isUsingMongo ? { _id: resourceId } : { _id: resourceId });
    if (!restaurant) return { available: false, reason: 'Restaurant not found' };

    const maxCapacity = restaurant.maxCapacity || 30;
    const targetDate = new Date(date).toDateString();

    const existingBookings = await dbAdapter.find('bookings', {
      resourceId: resourceId,
      serviceType: 'RESTAURANT',
      status: { $in: ['HOLD', 'CONFIRMED'] }
    });

    const sameSlot = existingBookings.filter(b => {
      return new Date(b.startDate).toDateString() === targetDate && (b.metadata?.timeSlot === timeSlot || !timeSlot);
    });

    const bookedGuests = sameSlot.reduce((sum, b) => sum + (b.guests || 1), 0);

    if (bookedGuests + guests <= maxCapacity) {
      return { available: true, resource: restaurant, remainingCapacity: maxCapacity - bookedGuests, holdEligible: true };
    }

    return { available: false, reason: `Only ${maxCapacity - bookedGuests} seats remaining`, resource: restaurant };
  }

  static async checkTransportAvailability(resourceId, date, guests) {
    const transport = await dbAdapter.findOne('transports', isUsingMongo ? { _id: resourceId } : { _id: resourceId });
    if (!transport) return { available: false, reason: 'Transport not found' };

    return { available: true, resource: transport, holdEligible: true };
  }
}

export default AvailabilityService;
