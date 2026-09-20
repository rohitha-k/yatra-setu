import assert from 'assert';
import TripRecalculationService from '../services/tripRecalculationService.js';

async function runPhase1Verification() {
  console.log('--- RUNNING PHASE 1 RECALCULATION & EDITOR VERIFICATION ---');

  // Test 1: Reserve is deducted first
  const testTrip = {
    title: 'Hyderabad to Hampi Test Trip',
    startingLocation: 'Hyderabad',
    destination: 'Hampi',
    budgetLimit: 20000,
    emergencyReserve: 2500,
    travelersCount: 2,
    daysCount: 3,
    travelMode: 'Train',
    revision: 1
  };

  const result1 = await TripRecalculationService.recalculate(testTrip, { isCommit: false });
  assert.strictEqual(result1.totalBudget, 20000, 'Total budget should be 20000');
  assert.strictEqual(result1.emergencyReserve, 2500, 'Emergency reserve should be 2500');
  assert.strictEqual(result1.spendableBudget, 17500, 'Spendable budget should be 20000 - 2500 = 17500');
  assert(result1.stops.length >= 2, 'Should build default origin and destination stops');
  assert.strictEqual(result1.stops[0].category, 'ORIGIN', 'First stop should be ORIGIN');
  assert.strictEqual(result1.stops[result1.stops.length - 1].category, 'DESTINATION', 'Last stop should be DESTINATION');
  console.log('✓ Test 1 Passed: Reserve deducted first (Spendable: ₹17,500, Reserve: ₹2,500)');

  // Test 2: Monotonic revision increment on commit
  const result2 = await TripRecalculationService.recalculate(result1, { isCommit: true });
  assert.strictEqual(result2.revision, 2, 'Revision should increment monotonically on commit to 2');
  console.log('✓ Test 2 Passed: Monotonic revision increment to', result2.revision);

  // Test 3: Stop reordering and leg recalculation
  const customStops = [
    { id: 's1', name: 'Hyderabad', lat: 17.3850, lng: 78.4867, category: 'ORIGIN' },
    { id: 's2', name: 'Kurnool', lat: 15.8281, lng: 78.0373, category: 'ATTRACTION' },
    { id: 's3', name: 'Hampi', lat: 15.3350, lng: 76.4600, category: 'DESTINATION' }
  ];

  const result3 = await TripRecalculationService.recalculate({
    ...result2,
    stops: customStops
  }, { isCommit: false });

  assert.strictEqual(result3.routeLegs.length, 2, 'Should have 2 legs for 3 stops');
  assert.strictEqual(result3.routeLegs[0].fromStopId, 's1');
  assert.strictEqual(result3.routeLegs[0].toStopId, 's2');
  assert.strictEqual(result3.routeLegs[1].fromStopId, 's2');
  assert.strictEqual(result3.routeLegs[1].toStopId, 's3');
  assert(result3.summary.totalDistanceKm > 0, 'Total distance should be calculated');
  console.log(`✓ Test 3 Passed: 3 stops generate 2 legs with ${result3.summary.totalDistanceKm} km total routed distance`);

  // Test 4: Over-budget warning preservation of reserve
  const expensiveTrip = {
    ...testTrip,
    budgetLimit: 5000,
    emergencyReserve: 2000 // spendable is 3000, but trip costs ~6000
  };
  const result4 = await TripRecalculationService.recalculate(expensiveTrip, { isCommit: false });
  assert.strictEqual(result4.ledger.budgetStatus, 'Over Budget', 'Should flag over budget');
  assert(result4.warnings.some(w => w.type === 'BUDGET_OVERRUN'), 'Should include BUDGET_OVERRUN warning');
  console.log('✓ Test 4 Passed: Over-budget detected, preserving emergency reserve');

  console.log('\nALL PHASE 1 BACKEND CHECKS PASSED SUCCESSFULLY!');
}

runPhase1Verification().catch(err => {
  console.error('Phase 1 Verification Failed:', err);
  process.exit(1);
});
