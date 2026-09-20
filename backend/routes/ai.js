import express from 'express';
import BudgetOptimizer from '../services/budgetOptimizer.js';

const router = express.Router();

// AI conversational parser & explainer endpoint (Priority 6 / 10)
router.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: "Empty conversational prompt." });
  }

  const cleanMessage = message.toLowerCase();

  // Heuristic Natural Language intent extraction (Priority 6)
  let destination = "Hampi";
  if (cleanMessage.includes("araku")) destination = "Araku Valley";
  if (cleanMessage.includes("tirupati")) destination = "Tirupati";
  if (cleanMessage.includes("varanasi")) destination = "Varanasi";

  let budgetLimit = 15000;
  const budgetMatch = message.match(/₹?\s?(\d{2,3},?\d{3})/);
  if (budgetMatch) {
    budgetLimit = parseInt(budgetMatch[1].replace(/,/g, ''));
  }

  let daysCount = 3;
  const daysMatch = message.match(/(\d+)\s?days?/);
  if (daysMatch) {
    daysCount = parseInt(daysMatch[1]);
  }

  let travelersCount = 3; // Default 3 for golden path
  if (cleanMessage.includes("family")) travelersCount = 3;
  if (cleanMessage.includes("couple")) travelersCount = 2;
  if (cleanMessage.includes("solo")) travelersCount = 1;

  // Extract travel mode
  let travelMode = "Train";
  if (cleanMessage.includes("own vehicle") || cleanMessage.includes("car") || cleanMessage.includes("vehicle") || cleanMessage.includes("drive")) {
    travelMode = "Own Vehicle";
  } else if (cleanMessage.includes("flight") || cleanMessage.includes("plane")) {
    travelMode = "Flight";
  } else if (cleanMessage.includes("bus")) {
    travelMode = "Bus";
  }

  // Extract emergency buffer (Priority 10)
  let requiredBuffer = 2000; // Default buffer ₹2000
  const bufferMatch = message.match(/(?:keep|buffer|safety)\s?₹?\s?(\d{1,3},?\d{3})/i);
  if (bufferMatch) {
    requiredBuffer = parseInt(bufferMatch[1].replace(/,/g, ''));
  }

  try {
    // Run actual budget optimizer
    const result = await BudgetOptimizer.optimizeTrip({
      startingLocation: "Hyderabad",
      destination,
      travelersCount,
      daysCount,
      budgetLimit,
      travelMode,
      activitiesCost: 1500,
      localTransitCost: 800
    });

    const totalSpent = result.totalPlannedCost;
    const remaining = result.remainingBudget;

    // Generate AI explanation from actual system data (Priority 6)
    let aiExplanation = `I detected your intent to plan a trip to **${destination}** for **${travelersCount} travelers** over **${daysCount} days** via **${travelMode}** with a budget of **₹${budgetLimit.toLocaleString()}** and safety buffer **₹${requiredBuffer.toLocaleString()}**.\n\n`;
    aiExplanation += `According to YatraSetu's database, the total cost will be **₹${totalSpent.toLocaleString()}**, leaving you with a remaining balance of **₹${remaining.toLocaleString()}**.\n\n`;
    
    if (result.selectedAccommodation) {
      aiExplanation += `• **Stay**: ${result.selectedAccommodation.name} (₹${result.selectedAccommodation.pricePerNight}/night)\n`;
    }
    if (result.selectedFood) {
      aiExplanation += `• **Dining**: ${result.selectedFood.name} (₹${result.selectedFood.averageMealCost}/meal avg)\n`;
    }
    if (result.selectedGuide) {
      aiExplanation += `• **Guide**: ${result.selectedGuide.name} (₹${result.selectedGuide.pricePerDay}/day)\n`;
    }
    aiExplanation += `• **Activities & Local Transit**: Selected (₹2,300 total)\n`;

    res.json({
      success: true,
      extractedParams: { destination, budgetLimit, daysCount, travelersCount, travelMode, requiredBuffer },
      itinerary: result,
      message: aiExplanation
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
