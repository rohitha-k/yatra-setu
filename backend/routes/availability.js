import express from 'express';
import AvailabilityService from '../services/availabilityService.js';
import AlternativeService from '../services/alternativeService.js';
import ItineraryConflictService from '../services/itineraryConflictService.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

/**
 * POST /api/availability/check
 * Check real-time availability for a service
 */
router.post('/check', async (req, res) => {
  try {
    const { serviceType, resourceId, startDate, endDate, guests, timeSlot, userId, destination, budget } = req.body;

    if (!serviceType || !resourceId || !startDate) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'serviceType, resourceId, and startDate are required' }
      });
    }

    // Step 1: Check availability
    const availability = await AvailabilityService.checkAvailability(serviceType, resourceId, {
      startDate, endDate, guests, timeSlot
    });

    // Step 2: If user is logged in, check itinerary conflicts
    let conflictReport = null;
    if (userId && availability.available) {
      conflictReport = await ItineraryConflictService.detectConflicts(userId, {
        serviceType, resourceId, startDate, endDate
      });
    }

    // Step 3: If unavailable, find alternatives
    let alternatives = null;
    if (!availability.available) {
      alternatives = await AlternativeService.findAlternatives(serviceType, resourceId, {
        startDate, endDate, guests, budget, destination
      });
    }

    res.json({
      success: true,
      available: availability.available,
      details: availability,
      conflicts: conflictReport,
      alternatives,
      holdEligible: availability.holdEligible || false
    });

  } catch (err) {
    console.error('Availability check error:', err);
    res.status(500).json({ success: false, error: { code: 'AVAILABILITY_ERROR', message: err.message } });
  }
});

export default router;
