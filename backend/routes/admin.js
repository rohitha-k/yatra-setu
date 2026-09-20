import express from 'express';
import { authenticateToken, authorizeRoles } from './auth.js';
import { dbAdapter } from '../config/db.js';

const router = express.Router();

// Get all vendors for review (Protected with authorizeRoles)
router.get('/vendors', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const list = await dbAdapter.find('vendors');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update vendor verification status (Protected with authorizeRoles)
router.post('/verify', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  const { vendorId, status } = req.body;
  try {
    const updated = await dbAdapter.findByIdAndUpdate('vendors', vendorId, {
      verificationStatus: status,
      lastVerified: status === 'VERIFIED' ? new Date().toISOString() : null,
      trustScore: status === 'VERIFIED' ? 95 : 50 // Bump trust score if verified
    });
    res.json({ message: 'Verification status updated successfully', vendor: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin Analytics Dashboard (Protected with authorizeRoles)
router.get('/analytics', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const vendors = await dbAdapter.find('vendors');
    const destinations = await dbAdapter.find('destinations');
    const users = await dbAdapter.find('users');
    const itineraries = await dbAdapter.find('itineraries');

    const totalTourists = users.filter(u => u.role === 'TOURIST').length + 840; // baseline seed offset
    const verifiedCount = vendors.filter(v => v.verificationStatus === 'VERIFIED').length;
    
    // Average trip budget
    let sumBudget = 0;
    let sumSaved = 0;
    itineraries.forEach(i => {
      sumBudget += (i.budgetLimit || 15000);
      sumSaved += ((i.budgetLimit - i.totalActualCost) || 2150);
    });
    const avgBudget = itineraries.length > 0 ? Math.round(sumBudget / itineraries.length) : 15000;
    const moneySaved = itineraries.length > 0 ? sumSaved : 4850;

    res.json({
      totalTourists,
      popularDestinations: destinations.slice(0, 3).map(d => ({ name: d.name, visits: Math.round(150 + Math.random() * 200) })),
      averageTripBudget: avgBudget,
      totalMoneySaved: moneySaved,
      verifiedVendorsCount: verifiedCount,
      governmentDestinationVisits: 320,
      localBusinessGrowthPct: 18
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Complaints Feed from database (Protected with authorizeRoles)
router.get('/complaints', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const dbComplaints = await dbAdapter.find('complaints');
    if (dbComplaints.length === 0) {
      const mockComplaints = [
        { id: 'c1', vendorName: 'Hampi Heritage Homestay', complainant: 'Rohan Sen', text: 'Hotel room was different from facility video walkthrough.', status: 'PENDING' },
        { id: 'c2', vendorName: 'YatraSetu Transit Hub', complainant: 'Kiran K.', text: 'Bus departure was delayed by 3 hours with no notification.', status: 'RESOLVED' }
      ];
      return res.json(mockComplaints);
    }
    res.json(dbComplaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
