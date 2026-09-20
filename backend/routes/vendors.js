import express from 'express';
import { authenticateToken, authorizeRoles } from './auth.js';
import { dbAdapter } from '../config/db.js';
import TrustEngine from '../services/trustEngine.js';

const router = express.Router();

// Get Vendor Profile with Trust Score breakdown
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    let vendor = await dbAdapter.findOne('vendors', { userId: req.user.id });
    if (!vendor) {
      // Seed a default vendor shell for testing if none exists
      vendor = await dbAdapter.create('vendors', {
        userId: req.user.id,
        name: `${req.user.username.charAt(0).toUpperCase() + req.user.username.slice(1)} Hospitality Services`,
        type: req.user.role, // HOTEL, RESTAURANT, GUIDE, TRANSPORT
        verificationStatus: 'PENDING',
        trustScore: 72,
        lastVerified: null
      });
    }

    const scoring = TrustEngine.calculateScore(vendor);
    res.json({
      ...vendor,
      trustScoreDetails: scoring
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mock Walkthrough Video Upload (updates verification status to UNDER_REVIEW)
router.post('/video', authenticateToken, authorizeRoles('HOTEL', 'VENDOR'), async (req, res) => {
  const { videoUrl } = req.body;
  try {
    let vendor = await dbAdapter.findOne('vendors', { userId: req.user.id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    // Update video and verification status to UNDER_REVIEW
    const updated = await dbAdapter.findByIdAndUpdate('vendors', vendor._id || vendor.id, {
      walkthroughVideoUrl: videoUrl,
      verificationStatus: 'UNDER_REVIEW'
    });

    res.json({
      message: 'Video walkthrough submitted successfully. Verification status changed to UNDER_REVIEW.',
      vendor: updated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Vendor Inventory/Price details
router.put('/inventory', authenticateToken, authorizeRoles('HOTEL', 'RESTAURANT', 'GUIDE', 'TRANSPORT', 'VENDOR'), async (req, res) => {
  const { price, facilities, menuItems } = req.body;
  try {
    const vendor = await dbAdapter.findOne('vendors', { userId: req.user.id });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    let updatedInventory = null;
    
    // Change accommodations to hotels collection matching mongoose schemas
    if (vendor.type === 'HOTEL') {
      const hotel = await dbAdapter.findOne('hotels', { vendorId: vendor._id || vendor.id });
      if (hotel) {
        updatedInventory = await dbAdapter.findByIdAndUpdate('hotels', hotel._id || hotel.id, {
          pricePerNight: price,
          facilities: facilities || hotel.facilities
        });
      }
    } else if (vendor.type === 'RESTAURANT') {
      const rest = await dbAdapter.findOne('restaurants', { vendorId: vendor._id || vendor.id });
      if (rest) {
        updatedInventory = await dbAdapter.findByIdAndUpdate('restaurants', rest._id || rest.id, {
          averageMealCost: price,
          menuItems: menuItems || rest.menuItems,
          lastMenuUpdate: new Date().toISOString()
        });
      }
    } else if (vendor.type === 'GUIDE') {
      const guide = await dbAdapter.findOne('guides', { vendorId: vendor._id || vendor.id });
      if (guide) {
        updatedInventory = await dbAdapter.findByIdAndUpdate('guides', guide._id || guide.id, {
          pricePerDay: price
        });
      }
    }

    res.json({ message: 'Inventory updated successfully', inventory: updatedInventory });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get Vendor Bookings from database
router.get('/bookings', authenticateToken, authorizeRoles('HOTEL', 'RESTAURANT', 'GUIDE', 'TRANSPORT', 'VENDOR'), async (req, res) => {
  try {
    const vendor = await dbAdapter.findOne('vendors', { userId: req.user.id });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    
    const dbBookings = await dbAdapter.find('bookings', { vendorId: vendor._id || vendor.id });
    if (dbBookings.length === 0) {
      const mockBookings = [
        { id: 'b1', clientName: 'Amit Sharma', date: '2026-09-12', travelers: 2, totalAmount: 3600, status: 'CONFIRMED' },
        { id: 'b2', clientName: 'Sneha Reddy', date: '2026-09-15', travelers: 3, totalAmount: 5400, status: 'PENDING' }
      ];
      return res.json(mockBookings);
    }
    res.json(dbBookings);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
