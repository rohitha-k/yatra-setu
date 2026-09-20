import express from 'express';
import { dbAdapter } from '../config/db.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Get Destinations List (cached for 10 minutes)
router.get('/destinations', cacheMiddleware(600), async (req, res) => {
  try {
    const list = await dbAdapter.find('destinations');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Query items inside a destination (cached for 5 minutes)
router.get('/items', cacheMiddleware(300, (req) => `items:${req.query.destination}:${req.query.category || 'ALL'}`), async (req, res) => {
  const { destination, category, minTrust = 0, maxPrice } = req.query;
  try {
    let items = [];
    if (!category || category === 'HOTEL') {
      const hotels = await dbAdapter.find('hotels', { destination });
      items.push(...hotels.map(h => ({ ...h, category: 'HOTEL' })));
    }
    if (!category || category === 'RESTAURANT') {
      const rest = await dbAdapter.find('restaurants', { destination });
      items.push(...rest.map(r => ({ ...r, category: 'RESTAURANT' })));
    }
    if (!category || category === 'GUIDE') {
      const guides = await dbAdapter.find('guides', { destination });
      items.push(...guides.map(g => ({ ...g, category: 'GUIDE' })));
    }
    if (!category || category === 'TRANSPORT') {
      const trans = await dbAdapter.find('transports', { destination });
      items.push(...trans.map(t => ({ ...t, category: 'TRANSPORT' })));
    }

    // Apply Filters
    let filtered = items.filter(item => (item.trustScore || item.rating * 18 || 70) >= parseInt(minTrust));
    if (maxPrice) {
      filtered = filtered.filter(item => {
        const price = item.pricePerNight || item.averageMealCost || item.pricePerDay || item.pricePerSeat || 0;
        return price <= parseInt(maxPrice);
      });
    }

    res.json(filtered);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
