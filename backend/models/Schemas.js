import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// 1. User Schema
const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: 'TOURIST' } // TOURIST, VENDOR, ADMIN
}, { timestamps: true });

// 2. Vendor Schema
const VendorSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  type: { type: String, required: true }, // HOTEL, HOMESTAY, RESTAURANT, GUIDE, TRANSPORT
  verificationStatus: { type: String, default: 'PENDING' }, // PENDING, UNDER_REVIEW, VERIFIED, REJECTED, SUSPENDED
  trustScore: { type: Number, default: 70 },
  gstin: String,
  licenseNumber: String,
  lastVerified: Date,
  walkthroughVideoUrl: String,
  registeredCoordinates: { lat: Number, lng: Number }
}, { timestamps: true });

// 3. Destination Schema
const DestinationSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  state: String,
  district: String,
  category: String, // Heritage, Nature, Spiritual, Adventure, Family
  latitude: Number,
  longitude: Number,
  isGovernmentPromoted: { type: Boolean, default: false },
  heritageStatus: String, // UNESCO, ASI, State Heritage, None
  rating: { type: Number, default: 4.0 },
  imageUrl: String,
  entryFees: { type: Number, default: 0 },
  bestVisitingTime: String,
  attractions: [String]
}, { timestamps: true });

// 4. Hotel Schema
const HotelSchema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  destination: { type: String, required: true },
  name: String,
  pricePerNight: { type: Number, required: true },
  availableRooms: { type: Number, default: 5 },
  facilities: [String],
  isHomestay: { type: Boolean, default: false },
  rating: { type: Number, default: 4.0 },
  reviewsCount: { type: Number, default: 0 }
}, { timestamps: true });

// 5. Restaurant Schema
const RestaurantSchema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  destination: { type: String, required: true },
  name: String,
  averageMealCost: { type: Number, required: true },
  cuisineType: String,
  menuItems: [{ name: String, price: Number, isAvailable: { type: Boolean, default: true } }],
  rating: { type: Number, default: 4.0 }
}, { timestamps: true });

// 6. Guide Schema
const GuideSchema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  destination: { type: String, required: true },
  name: String,
  pricePerDay: { type: Number, required: true },
  languages: [String],
  experienceYears: Number,
  availabilityCalendar: [String] // Array of unavailable dates
}, { timestamps: true });

// 7. Transport Schema & Extended Multi-Modal Options
const TransportSchema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  type: { type: String, required: true }, // TRAIN, BUS_GOVT, BUS_PRIVATE, FLIGHT, CAB_OUTSTATION, RENTAL_CAR, RENTAL_BIKE, OWN_CAR, OWN_BIKE
  subType: String, // Express, Vande Bharat, AC Sleeper, Semi-Sleeper, Non-AC, Economy, Sedan, SUV, EV, etc.
  operatorName: String,
  source: { type: String, required: true },
  destination: { type: String, required: true },
  pricePerSeat: { type: Number, required: true },
  fixedCharges: { type: Number, default: 0 },
  departureTime: String,
  arrivalTime: String,
  durationMinutes: Number,
  availableSeats: { type: Number, default: 40 },
  travelClass: { type: String, default: 'Standard' }, // General, Sleeper, 3A, 2A, 1A, Chair Car, AC, Non-AC, Economy, Business
  comfortLevel: { type: String, default: 'Comfortable' }, // Basic, Standard, Comfortable, Premium
  reliabilityScore: { type: Number, default: 85 }, // 0-100
  trustScore: { type: Number, default: 88 },
  transferCount: { type: Number, default: 0 },
  stationTransferCost: { type: Number, default: 0 },
  amenities: [String],
  accessibilityFeatures: { type: Boolean, default: false },
  estimatedCarbonCategory: { type: String, default: 'Moderate' }, // Very Low, Low, Moderate, High
  isEstimated: { type: Boolean, default: true },
  dataSource: { type: String, default: 'demo' },
  lastUpdatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// 7a. Vehicle Schema (For Vendor & Registered Vehicles)
const VehicleSchema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  registrationNumber: { type: String, required: true },
  vehicleType: { type: String, required: true }, // CAB_SEDAN, CAB_SUV, CAB_HATCHBACK, RENTAL_CAR, RENTAL_BIKE, AUTO_RICKSHAW, E_RICKSHAW, BUS
  modelName: String,
  fuelType: { type: String, default: 'Petrol' }, // Petrol, Diesel, CNG, Electric, Hybrid
  seatingCapacity: { type: Number, default: 4 },
  perKmRate: { type: Number, default: 12 },
  dailyRentalRate: { type: Number, default: 0 },
  driverAllowancePerDay: { type: Number, default: 400 },
  refundableDeposit: { type: Number, default: 0 },
  mileageKmPerUnit: { type: Number, default: 15 },
  insuranceValidUntil: Date,
  permitValidUntil: Date,
  fitnessValidUntil: Date,
  verificationStatus: { type: String, default: 'PENDING' }, // PENDING, VERIFIED, REJECTED, EXPIRED
  routeCoverage: [String],
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

// 7b. Local Transit Option Schema
const LocalTransitSchema = new Schema({
  destination: { type: String, required: true },
  mode: { type: String, required: true }, // METRO, CITY_BUS, AUTO_RICKSHAW, E_RICKSHAW, LOCAL_TAXI, APP_CAB, SHARED_CAB, RENTAL_SCOOTER, WALKING, CYCLING
  name: String,
  ratePerDay: { type: Number, default: 0 },
  ratePerKm: { type: Number, default: 0 },
  passPrice: { type: Number, default: 0 },
  details: String,
  comfortScore: { type: Number, default: 75 },
  carbonEmission: { type: String, default: 'Low' },
  isEstimated: { type: Boolean, default: true }
}, { timestamps: true });

// 8. Verification Schema
const VerificationSchema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  documentType: String, // GST, Registration License, FSSAI
  documentNumber: String,
  fileUrl: String,
  status: { type: String, default: 'PENDING' }, // PENDING, UNDER_REVIEW, VERIFIED, REJECTED
  verificationDate: Date,
  reviewer: String,
  rejectionReason: String
}, { timestamps: true });

// 9. Review Schema
const ReviewSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  text: String,
  rating: Number,
  sentiment: String, // Positive, Neutral, Negative
  evidenceUrl: String
}, { timestamps: true });

// 10. TrustScore Schema
const TrustScoreSchema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  score: { type: Number, default: 70 },
  documentCheck: { type: Number, default: 30 },
  videoCheck: { type: Number, default: 20 },
  reviewsCheck: { type: Number, default: 30 },
  priceConsistency: { type: Number, default: 10 },
  complaintsCheck: { type: Number, default: 10 }
}, { timestamps: true });

// 11. Trip Schema
const TripSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  revision: { type: Number, default: 1 },
  title: String,
  startingLocation: String,
  destination: String,
  intermediateCities: [String],
  travelersCount: { type: Number, default: 1 },
  daysCount: { type: Number, default: 1 },
  travelDates: String,
  openEnded: { type: Boolean, default: false },
  budgetLimit: Number, // in minor units (paise) or standard units
  emergencyReserve: { type: Number, default: 2000 },
  travelMode: { type: String, default: 'Train' },
  units: { type: String, default: 'km' }, // 'km' | 'miles'
  currency: { type: String, default: 'INR' }, // 'INR' | 'USD'
  isOneWay: { type: Boolean, default: false },
  interests: [String],
  tags: [String],
  stops: [Schema.Types.Mixed], // Array of stable-id stop objects
  routeLegs: [Schema.Types.Mixed], // Array of leg geometries and via-points
  days: [Schema.Types.Mixed], // Day schedule configuration
  collaborators: [Schema.Types.Mixed], // [{ userId, email, role: 'OWNER'|'EDITOR'|'VIEWER' }]
  expenses: [Schema.Types.Mixed], // Actual recorded expenses
  isDeleted: { type: Boolean, default: false },
  isPublicSnapshot: { type: Boolean, default: false }
}, { timestamps: true });

// 12. Itinerary Schema
const ItinerarySchema = new Schema({
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  revision: { type: Number, default: 1 },
  destination: String,
  daysCount: Number,
  travelersCount: Number,
  budgetLimit: Number,
  emergencyReserve: { type: Number, default: 2000 },
  spendableBudget: Number,
  totalActualCost: Number,
  remainingBudget: Number,
  stops: [Schema.Types.Mixed],
  routeLegs: [Schema.Types.Mixed],
  days: [Schema.Types.Mixed],
  selectedTransport: Schema.Types.Mixed,
  selectedAccommodation: Schema.Types.Mixed,
  selectedFood: Schema.Types.Mixed,
  selectedGuide: Schema.Types.Mixed,
  activitiesCost: Number,
  localTransitCost: Number,
  warnings: [Schema.Types.Mixed],
  alternatives: [Schema.Types.Mixed],
  isPublicSnapshot: { type: Boolean, default: false }
}, { timestamps: true });

// 13. Booking Schema
const BookingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  resourceId: { type: Schema.Types.ObjectId, required: true },
  serviceType: { type: String, enum: ['HOTEL', 'RESTAURANT', 'TOUR_GUIDE', 'TRANSPORT'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  guests: { type: Number, default: 1 },
  totalAmount: Number,
  status: { type: String, enum: ['PENDING', 'HOLD', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'FAILED'], default: 'PENDING' },
  holdExpiresAt: { type: Date },
  confirmedAt: { type: Date },
  cancelledAt: { type: Date },
  cancellationReason: String,
  metadata: Schema.Types.Mixed
}, { timestamps: true });

// 14. Payment Schema
const PaymentSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
  amount: Number,
  transactionId: String,
  status: { type: String, default: 'PENDING' }, // PENDING, SUCCESS, FAILED
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// 15. Complaint Schema
const ComplaintSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  title: String,
  description: String,
  evidenceUrl: String,
  status: { type: String, default: 'PENDING' }, // PENDING, RESOLVED, DISMISSED
  vendorResponse: String
}, { timestamps: true });

// 16. Notification Schema
const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  title: String,
  message: String,
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

// Hotel indexes
HotelSchema.index({ destination: 1 });
HotelSchema.index({ destination: 1, pricePerNight: 1 });
HotelSchema.index({ destination: 1, rating: -1 });
HotelSchema.index({ vendorId: 1 });
HotelSchema.index({ name: 'text', destination: 'text' });

// Restaurant indexes
RestaurantSchema.index({ destination: 1 });
RestaurantSchema.index({ vendorId: 1 });
RestaurantSchema.index({ destination: 1, rating: -1 });
RestaurantSchema.index({ destination: 1, averageMealCost: 1 });

// Guide indexes
GuideSchema.index({ destination: 1 });
GuideSchema.index({ destination: 1, pricePerDay: 1 });
GuideSchema.index({ vendorId: 1 });

// Transport indexes
TransportSchema.index({ source: 1, destination: 1 });
TransportSchema.index({ vendorId: 1 });

// Booking indexes
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ vendorId: 1, createdAt: -1 });
BookingSchema.index({ resourceId: 1, serviceType: 1, status: 1, startDate: 1, endDate: 1 });
BookingSchema.index({ holdExpiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { status: 'HOLD' } });

// Initialize Mongoose models if using Mongo
export const registerMongoModels = () => {
  if (mongoose.models.User) return;
  mongoose.model('User', UserSchema);
  mongoose.model('Vendor', VendorSchema);
  mongoose.model('Destination', DestinationSchema);
  mongoose.model('Hotel', HotelSchema);
  mongoose.model('Restaurant', RestaurantSchema);
  mongoose.model('Guide', GuideSchema);
  mongoose.model('Transport', TransportSchema);
  mongoose.model('Verification', VerificationSchema);
  mongoose.model('Review', ReviewSchema);
  mongoose.model('TrustScore', TrustScoreSchema);
  mongoose.model('Trip', TripSchema);
  mongoose.model('Itinerary', ItinerarySchema);
  mongoose.model('Booking', BookingSchema);
  mongoose.model('Payment', PaymentSchema);
  mongoose.model('Complaint', ComplaintSchema);
  mongoose.model('Notification', NotificationSchema);
};
