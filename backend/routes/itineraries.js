import express from 'express';
import { authenticateToken } from './auth.js';
import BudgetOptimizer from '../services/budgetOptimizer.js';
import TripRecalculationService from '../services/tripRecalculationService.js';
import { dbAdapter } from '../config/db.js';

const router = express.Router();

// Canonical Trip Recalculation Preview Endpoint (Furkot Connected Engine)
router.post('/recalculate', async (req, res) => {
  try {
    const preview = await TripRecalculationService.recalculate(req.body, { isCommit: false });
    res.json(preview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/recalculate', async (req, res) => {
  try {
    const payload = { ...req.body, _id: req.params.id, id: req.params.id };
    const preview = await TripRecalculationService.recalculate(payload, { isCommit: false });
    res.json(preview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Run Budget Optimization Engine
router.post('/optimize', async (req, res) => {
  const { travelDates, daysCount } = req.body;

  if (travelDates) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(travelDates);
    
    if (isNaN(selectedDate.getTime()) || selectedDate < today) {
      return res.status(400).json({ message: "Invalid travel date: cannot plan a journey for a past or completed date." });
    }
  }

  if (daysCount !== undefined) {
    const days = parseInt(daysCount);
    if (isNaN(days) || days < 1 || days > 30) {
      return res.status(400).json({ message: "Invalid travel duration: number of days must be between 1 and 30." });
    }
  }

  try {
    const itinerary = await BudgetOptimizer.optimizeTrip(req.body);
    res.json(itinerary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save Itinerary
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const calculated = await TripRecalculationService.recalculate(req.body, { isCommit: true });
    const record = await dbAdapter.create('itineraries', {
      userId: req.user.id,
      ...calculated
    });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Atomically Save Accepted Revision with Optimistic Concurrency Protection
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { expectedRevision } = req.body;

    const existing = await dbAdapter.findOne('itineraries', { _id: id }) || await dbAdapter.findOne('itineraries', { id });
    if (!existing) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    // Revision conflict check
    if (expectedRevision !== undefined && existing.revision !== undefined) {
      if (Number(expectedRevision) !== Number(existing.revision)) {
        return res.status(409).json({
          message: `Revision conflict: server is at revision ${existing.revision}, your edit was based on revision ${expectedRevision}.`,
          serverRevision: existing.revision,
          conflict: true
        });
      }
    }

    const calculated = await TripRecalculationService.recalculate({
      ...existing,
      ...req.body
    }, { isCommit: true });

    const updated = await dbAdapter.findByIdAndUpdate('itineraries', existing._id || id, calculated);
    res.json(updated || calculated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Single Itinerary by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbAdapter.findOne('itineraries', { _id: id }) || await dbAdapter.findOne('itineraries', { id });
    if (!existing) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    const refreshed = await TripRecalculationService.recalculate(existing, { isCommit: false });
    res.json(refreshed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Duplicate Itinerary (F14 & F32)
router.post('/:id/duplicate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbAdapter.findOne('itineraries', { _id: id }) || await dbAdapter.findOne('itineraries', { id });
    if (!existing) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    const cloneData = {
      ...existing,
      _id: undefined,
      id: undefined,
      title: `Copy of ${existing.title || existing.destination || 'Trip'}`,
      revision: 1,
      userId: req.user.id,
      createdAt: new Date().toISOString()
    };

    const newRecord = await dbAdapter.create('itineraries', cloneData);
    res.json(newRecord);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get User Saved Itineraries
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const list = await dbAdapter.find('itineraries', { userId: req.user.id });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Recalculate/Reoptimize itinerary when item is modified (Legacy compatibility)
router.post('/reoptimize', async (req, res) => {
  const { budgetLimit, travelersCount, daysCount, currentTrip, updatedItem, category } = req.body;
  try {
    let newCost = 0;
    if (category === 'selectedAccommodation') {
      const roomCount = Math.ceil(travelersCount / 2);
      newCost = updatedItem.pricePerNight * daysCount * roomCount;
    } else if (category === 'selectedFood') {
      newCost = updatedItem.averageMealCost * travelersCount * daysCount * 3;
    } else if (category === 'selectedGuide') {
      newCost = updatedItem.pricePerDay * daysCount;
    } else if (category === 'selectedTransport') {
      newCost = updatedItem.cost;
    }

    const modifiedItem = { ...updatedItem, cost: newCost };
    const updatedItinerary = await BudgetOptimizer.reoptimizeTrip({
      budgetLimit,
      travelersCount,
      daysCount,
      currentTrip
    }, modifiedItem, category);
    
    res.json(updatedItinerary);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
