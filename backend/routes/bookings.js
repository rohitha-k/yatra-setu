import express from 'express';
import BookingService from '../services/bookingService.js';
import { authenticateToken } from './auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply stricter rate limiting to booking endpoints
const bookingRateLimit = rateLimiter(20, 60 * 1000);

/**
 * POST /api/bookings/hold
 * Create a temporary hold on a resource
 */
router.post('/hold', authenticateToken, bookingRateLimit, async (req, res) => {
  try {
    const { serviceType, resourceId, startDate, endDate, guests, totalAmount, metadata } = req.body;

    if (!serviceType || !resourceId || !startDate) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'serviceType, resourceId, and startDate are required' }
      });
    }

    const result = await BookingService.createHold(req.user.id, serviceType, resourceId, {
      startDate, endDate, guests, totalAmount, metadata
    });

    if (!result.success) {
      return res.status(409).json({ success: false, error: { code: 'HOLD_FAILED', message: result.reason } });
    }

    res.status(201).json({ success: true, ...result });
  } catch (err) {
    console.error('Hold creation error:', err);
    res.status(500).json({ success: false, error: { code: 'HOLD_ERROR', message: err.message } });
  }
});

/**
 * POST /api/bookings/:id/confirm
 * Confirm a held booking
 */
router.post('/:id/confirm', authenticateToken, bookingRateLimit, async (req, res) => {
  try {
    const result = await BookingService.confirmBooking(req.params.id, req.user.id);

    if (!result.success) {
      return res.status(400).json({ success: false, error: { code: 'CONFIRM_FAILED', message: result.reason } });
    }

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Booking confirmation error:', err);
    res.status(500).json({ success: false, error: { code: 'CONFIRM_ERROR', message: err.message } });
  }
});

/**
 * POST /api/bookings/:id/cancel
 * Cancel a booking
 */
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const result = await BookingService.cancelBooking(req.params.id, req.user.id, req.body.reason);

    if (!result.success) {
      return res.status(400).json({ success: false, error: { code: 'CANCEL_FAILED', message: result.reason } });
    }

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Booking cancellation error:', err);
    res.status(500).json({ success: false, error: { code: 'CANCEL_ERROR', message: err.message } });
  }
});

/**
 * POST /api/bookings/multi
 * Multi-service atomic booking
 */
router.post('/multi', authenticateToken, bookingRateLimit, async (req, res) => {
  try {
    const { services } = req.body;

    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_SERVICES', message: 'services array is required' }
      });
    }

    const result = await BookingService.createMultiServiceBooking(req.user.id, services);

    if (!result.success) {
      return res.status(409).json({ success: false, ...result });
    }

    res.status(201).json({ success: true, ...result });
  } catch (err) {
    console.error('Multi-service booking error:', err);
    res.status(500).json({ success: false, error: { code: 'MULTI_BOOKING_ERROR', message: err.message } });
  }
});

/**
 * GET /api/bookings/user
 * Get authenticated user's booking history
 */
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const bookings = await BookingService.getUserBookings(req.user.id);
    res.json({ success: true, bookings });
  } catch (err) {
    console.error('Booking history error:', err);
    res.status(500).json({ success: false, error: { code: 'HISTORY_ERROR', message: err.message } });
  }
});

export default router;
