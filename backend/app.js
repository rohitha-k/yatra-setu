import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, dbAdapter } from './config/db.js';
import { connectRedis } from './config/redis.js';
import seedData from './config/seed.js';
import { registerMongoModels } from './models/Schemas.js';

// Route Imports
import authRouter from './routes/auth.js';
import itineraryRouter from './routes/itineraries.js';
import vendorRouter from './routes/vendors.js';
import adminRouter from './routes/admin.js';
import marketplaceRouter from './routes/marketplace.js';
import aiRouter from './routes/ai.js';
import availabilityRouter from './routes/availability.js';
import bookingsRouter from './routes/bookings.js';

// Middleware Imports
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.BACKEND_PORT || 8000;

app.use(cors());
app.use(express.json());

// Global rate limiter: 100 requests/min per IP
app.use(rateLimiter(100, 60 * 1000));

// Boot Database & Cache
const boot = async () => {
  await connectDB();
  registerMongoModels();
  await connectRedis();
  
  try {
    const users = await dbAdapter.find('users');
    if (users.length === 0) {
      await seedData();
    }
  } catch (err) {
    console.error("Auto-seeding error:", err);
  }
};
boot();

// Mount Routers
app.use('/api/auth', authRouter);
app.use('/api/itineraries', itineraryRouter);
app.use('/api/vendors', vendorRouter);
app.use('/api/admin', adminRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/ai', aiRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/bookings', bookingsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'YatraSetu Decision Intelligence Engine',
    version: '2.0.0',
    features: [
      'Real-Time Availability Verification',
      'Concurrency-Safe Booking Holds',
      'Multi-Service Atomic Transactions',
      'Intelligent Alternative Recommendations',
      'Itinerary Conflict Detection',
      'Redis Cache Layer',
      'Rate Limiting'
    ]
  });
});

// 404 handler (must come after all routes)
app.use(notFoundHandler);

// Global error handler (must be last middleware)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 YatraSetu Backend v2.0 listening on port ${PORT}`);
});
export default app;
