import { dbAdapter } from '../config/db.js';
import AvailabilityService from './availabilityService.js';

class AlternativeService {
  /**
   * Find alternative options when a booking request is unavailable
   */
  static async findAlternatives(serviceType, resourceId, params = {}) {
    const { startDate, endDate, guests = 1, budget, destination } = params;

    const result = {
      alternativeDates: [],
      similarServices: []
    };

    // 1. Try alternative dates (±7 day window)
    if (startDate) {
      result.alternativeDates = await this.findAlternativeDates(serviceType, resourceId, startDate, endDate, 7, guests);
    }

    // 2. Find similar services in the same destination
    if (destination) {
      switch (serviceType) {
        case 'HOTEL':
          result.similarServices = await this.findAlternativeHotels(destination, startDate, endDate, budget, guests);
          break;
        case 'TOUR_GUIDE':
          result.similarServices = await this.findAlternativeGuides(destination, startDate, endDate, budget);
          break;
        case 'RESTAURANT':
          result.similarServices = await this.findAlternativeRestaurants(destination, startDate, params.timeSlot, guests);
          break;
      }
    }

    // 3. Rank all alternatives
    result.similarServices = this.rankAlternatives(result.similarServices, params);

    return result;
  }

  static async findAlternativeDates(serviceType, resourceId, startDate, endDate, windowDays, guests) {
    const alternatives = [];
    const originalStart = new Date(startDate);
    const duration = endDate ? Math.ceil((new Date(endDate) - originalStart) / (1000 * 60 * 60 * 24)) : 1;

    for (let offset = -windowDays; offset <= windowDays; offset++) {
      if (offset === 0) continue;
      const altStart = new Date(originalStart);
      altStart.setDate(altStart.getDate() + offset);
      
      // Skip past dates
      if (altStart < new Date()) continue;

      const altEnd = new Date(altStart);
      altEnd.setDate(altEnd.getDate() + duration);

      const availability = await AvailabilityService.checkAvailability(serviceType, resourceId, {
        startDate: altStart.toISOString(),
        endDate: altEnd.toISOString(),
        guests
      });

      if (availability.available) {
        alternatives.push({
          type: 'DATE',
          startDate: altStart.toISOString().split('T')[0],
          endDate: altEnd.toISOString().split('T')[0],
          offsetDays: offset,
          resource: availability.resource
        });
      }
    }

    return alternatives.slice(0, 5); // Top 5 date alternatives
  }

  static async findAlternativeHotels(destination, startDate, endDate, budget, guests) {
    const hotels = await dbAdapter.find('hotels', { destination });
    const available = [];

    for (const hotel of hotels) {
      const id = hotel._id?.toString() || hotel._id;
      const check = await AvailabilityService.checkHotelAvailability(id, startDate, endDate, guests);
      if (check.available) {
        const days = endDate ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) : 1;
        const totalCost = hotel.pricePerNight * days * Math.ceil(guests / 2);
        available.push({
          type: 'HOTEL',
          resource: hotel,
          totalCost,
          withinBudget: budget ? totalCost <= budget : true,
          rating: hotel.rating || 4.0
        });
      }
    }

    return available;
  }

  static async findAlternativeGuides(destination, startDate, endDate, budget) {
    const guides = await dbAdapter.find('guides', { destination });
    const available = [];

    for (const guide of guides) {
      const id = guide._id?.toString() || guide._id;
      const check = await AvailabilityService.checkGuideAvailability(id, startDate, endDate);
      if (check.available) {
        const days = endDate ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) : 1;
        available.push({
          type: 'TOUR_GUIDE',
          resource: guide,
          totalCost: guide.pricePerDay * days,
          withinBudget: budget ? (guide.pricePerDay * days) <= budget : true,
          rating: guide.rating || 4.0
        });
      }
    }

    return available;
  }

  static async findAlternativeRestaurants(destination, date, timeSlot, guests) {
    const restaurants = await dbAdapter.find('restaurants', { destination });
    const available = [];

    for (const rest of restaurants) {
      const id = rest._id?.toString() || rest._id;
      const check = await AvailabilityService.checkRestaurantAvailability(id, date, timeSlot, guests);
      if (check.available) {
        available.push({
          type: 'RESTAURANT',
          resource: rest,
          totalCost: rest.averageMealCost * guests,
          rating: rest.rating || 4.0
        });
      }
    }

    return available;
  }

  /**
   * AI ranking score formula (configurable weights)
   */
  static rankAlternatives(alternatives, preferences = {}, weights = {}) {
    const w = {
      availability: weights.availability || 0.35,
      preference: weights.preference || 0.25,
      rating: weights.rating || 0.15,
      price: weights.price || 0.15,
      distance: weights.distance || 0.10
    };

    return alternatives.map(alt => {
      const availabilityScore = 1.0; // Already filtered for available
      const ratingScore = (alt.rating || 4.0) / 5.0;
      const priceScore = alt.withinBudget ? 1.0 : 0.5;
      const preferenceScore = alt.withinBudget ? 0.8 : 0.4;
      const distanceScore = 0.7; // Default for same destination

      alt.aiScore = (
        availabilityScore * w.availability +
        preferenceScore * w.preference +
        ratingScore * w.rating +
        priceScore * w.price +
        distanceScore * w.distance
      );

      return alt;
    }).sort((a, b) => b.aiScore - a.aiScore);
  }
}

export default AlternativeService;
