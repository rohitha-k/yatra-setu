import { dbAdapter, isUsingMongo } from '../config/db.js';
import mongoose from 'mongoose';
import AvailabilityService from './availabilityService.js';
import { getRedisClient } from '../config/redis.js';

const HOLD_DURATION_MS = 10 * 60 * 1000; // 10 minutes

class BookingService {
  /**
   * Create a temporary HOLD on a resource
   */
  static async createHold(userId, serviceType, resourceId, params = {}) {
    const { startDate, endDate, guests = 1, totalAmount, metadata } = params;

    // Step 1: Verify availability
    const availability = await AvailabilityService.checkAvailability(serviceType, resourceId, { startDate, endDate, guests });

    if (!availability.available) {
      return { success: false, reason: availability.reason, available: false };
    }

    // Step 2: Create HOLD booking
    const holdExpiresAt = new Date(Date.now() + HOLD_DURATION_MS);

    const booking = await dbAdapter.create('bookings', {
      userId,
      resourceId,
      serviceType,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : new Date(startDate),
      guests,
      totalAmount: totalAmount || 0,
      status: 'HOLD',
      holdExpiresAt,
      metadata: metadata || {}
    });

    return {
      success: true,
      booking,
      holdExpiresAt,
      message: `Hold created. Expires at ${holdExpiresAt.toISOString()}`
    };
  }

  /**
   * Confirm a HOLD booking → CONFIRMED
   */
  static async confirmBooking(bookingId, userId) {
    const booking = await dbAdapter.findOne('bookings', { _id: bookingId });

    if (!booking) {
      return { success: false, reason: 'Booking not found' };
    }
    if (booking.userId?.toString() !== userId?.toString()) {
      return { success: false, reason: 'Unauthorized' };
    }
    if (booking.status !== 'HOLD') {
      return { success: false, reason: `Cannot confirm booking with status: ${booking.status}` };
    }
    if (booking.holdExpiresAt && new Date(booking.holdExpiresAt) < new Date()) {
      await dbAdapter.findByIdAndUpdate('bookings', bookingId, { status: 'EXPIRED' });
      return { success: false, reason: 'Hold has expired. Please create a new booking.' };
    }

    // Re-check availability before confirming
    const availability = await AvailabilityService.checkAvailability(
      booking.serviceType, booking.resourceId,
      { startDate: booking.startDate, endDate: booking.endDate, guests: booking.guests }
    );

    if (!availability.available) {
      await dbAdapter.findByIdAndUpdate('bookings', bookingId, { status: 'FAILED' });
      return { success: false, reason: 'Resource no longer available. Booking failed.' };
    }

    // Confirm
    const updated = await dbAdapter.findByIdAndUpdate('bookings', bookingId, {
      status: 'CONFIRMED',
      confirmedAt: new Date(),
      holdExpiresAt: null
    });

    // Invalidate related cache
    try {
      const cache = getRedisClient();
      const keys = await cache.keys(`items:${booking.serviceType}:*`);
      for (const key of keys) await cache.del(key);
    } catch (e) { /* cache invalidation is best-effort */ }

    return { success: true, booking: updated, message: 'Booking confirmed successfully' };
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(bookingId, userId, reason = '') {
    const booking = await dbAdapter.findOne('bookings', { _id: bookingId });

    if (!booking) return { success: false, reason: 'Booking not found' };
    if (booking.userId?.toString() !== userId?.toString()) return { success: false, reason: 'Unauthorized' };
    if (['CANCELLED', 'EXPIRED', 'FAILED'].includes(booking.status)) {
      return { success: false, reason: `Booking already ${booking.status.toLowerCase()}` };
    }

    const updated = await dbAdapter.findByIdAndUpdate('bookings', bookingId, {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancellationReason: reason,
      holdExpiresAt: null
    });

    return { success: true, booking: updated, message: 'Booking cancelled successfully' };
  }

  /**
   * Multi-service atomic booking
   */
  static async createMultiServiceBooking(userId, services = []) {
    const holds = [];
    const errors = [];

    // Step 1: Create holds for all services
    for (const svc of services) {
      const result = await this.createHold(userId, svc.serviceType, svc.resourceId, svc);
      if (result.success) {
        holds.push(result.booking);
      } else {
        errors.push({ service: svc.serviceType, reason: result.reason });
      }
    }

    // If any hold failed, cancel all successful holds
    if (errors.length > 0) {
      for (const hold of holds) {
        await this.cancelBooking(hold._id, userId, 'Multi-service booking failed: partial rollback');
      }
      return {
        success: false,
        reason: 'One or more services unavailable',
        errors,
        message: 'All reservations have been reverted.'
      };
    }

    // Step 2: Confirm all holds
    const confirmed = [];
    for (const hold of holds) {
      const result = await this.confirmBooking(hold._id, userId);
      if (result.success) {
        confirmed.push(result.booking);
      } else {
        errors.push({ bookingId: hold._id, reason: result.reason });
      }
    }

    if (errors.length > 0) {
      // Cancel any that were confirmed
      for (const c of confirmed) {
        await this.cancelBooking(c._id, userId, 'Multi-service booking partially failed');
      }
      return { success: false, reason: 'Multi-service confirmation failed', errors };
    }

    return { success: true, bookings: confirmed, message: `${confirmed.length} services booked successfully` };
  }

  /**
   * Get user booking history
   */
  static async getUserBookings(userId) {
    return await dbAdapter.findWithOptions('bookings', { userId }, { sort: { createdAt: -1 } });
  }
}

export default BookingService;
