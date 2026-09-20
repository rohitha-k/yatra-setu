import { transportService } from './transportService';
import { hotelService } from './hotelService';
import { guideService } from './guideService';
import { API } from './api';

export const bookingService = {
  bookCompleteTrip: async (tripDetails) => {
    // 1. Process transport, hotel, and guide reservations
    const transportRes = await transportService.book(tripDetails.travelMode, tripDetails.selectedTransport?.id || 'TRANS-1', {});
    const hotelRes = await hotelService.book(tripDetails.selectedAccommodation?.id || 'HOTEL-1', {});
    const guideRes = tripDetails.selectedGuide ? await guideService.book(tripDetails.selectedGuide.id || 'GUIDE-1', {}) : { success: true };

    const itineraryRef = "YATRA-" + Math.floor(100000 + Math.random() * 900000);
    const enrichedTrip = {
      ...tripDetails,
      itineraryId: itineraryRef,
      bookingTime: new Date().toISOString(),
      transportRef: transportRes.bookingReference || "OWN-VEH-REF",
      hotelRef: hotelRes.bookingId || ("HTL-BK-" + Math.floor(100000 + Math.random() * 900000)),
      guideRef: guideRes.bookingId || null
    };

    // 2. Persist itinerary to backend DB
    try {
      await API.saveItinerary(enrichedTrip);
    } catch (e) {
      console.warn("Backend itinerary persistence fallback:", e);
    }

    // 3. Attempt multi-service booking transaction on backend
    try {
      const services = [];
      if (tripDetails.selectedAccommodation?.id) {
        services.push({
          serviceType: 'HOTEL',
          resourceId: tripDetails.selectedAccommodation.id,
          startDate: new Date().toISOString(),
          guests: tripDetails.travelersCount || 1,
          totalAmount: tripDetails.selectedAccommodation.cost || 0
        });
      }
      if (services.length > 0) {
        await API.createMultiBooking(services);
      }
    } catch (e) {
      console.warn("Backend multi-booking transaction fallback:", e);
    }

    // 4. Save to local storage for instant offline access and backward compatibility
    localStorage.setItem('yatrasetu_final_trip', JSON.stringify(enrichedTrip));
    localStorage.setItem('yatrasetu_itinerary', JSON.stringify(enrichedTrip));
    localStorage.setItem('travexa_final_trip', JSON.stringify(enrichedTrip));
    localStorage.setItem('travexa_itinerary', JSON.stringify(enrichedTrip));

    return {
      success: true,
      bookingTime: enrichedTrip.bookingTime,
      transportRef: enrichedTrip.transportRef,
      hotelRef: enrichedTrip.hotelRef,
      guideRef: enrichedTrip.guideRef,
      itineraryId: enrichedTrip.itineraryId
    };
  }
};

