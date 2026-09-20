import assert from 'assert';
import ScheduleService from '../services/scheduleService.js';
import RoutingService from '../services/routingService.js';
import TripRecalculationService from '../services/tripRecalculationService.js';

async function runPhase2Verification() {
  console.log('--- RUNNING PHASE 2 SCHEDULING, ROUTES & WARNINGS VERIFICATION ---');

  const stops = [
    { id: 's1', name: 'Hyderabad Central', lat: 17.3850, lng: 78.4867, category: 'ORIGIN', durationMinutes: 0 },
    { id: 's2', name: 'Kurnool Rock Gardens', lat: 15.8281, lng: 78.0373, category: 'ATTRACTION', durationMinutes: 90 },
    { id: 's3', name: 'Hampi Virupaksha', lat: 15.3350, lng: 76.4600, category: 'DESTINATION', durationMinutes: 720, nights: 1 }
  ];

  // Test 1: RoutingService preferences (F08)
  const standardLegs = RoutingService.computeLegs(stops, { avoidTolls: false, travelMode: 'Own Vehicle' });
  const tollFreeLegs = RoutingService.computeLegs(stops, { avoidTolls: true, travelMode: 'Own Vehicle' });

  assert.strictEqual(standardLegs.length, 2, 'Should have 2 legs');
  assert(standardLegs[0].tollFares > 0, 'Standard highway leg should have tolls estimated');
  assert.strictEqual(tollFreeLegs[0].tollFares, 0, 'Avoid tolls preference should result in 0 toll fares');
  assert(tollFreeLegs[0].distanceMeters > standardLegs[0].distanceMeters, 'Avoid tolls road distance should be longer due to secondary road winding');
  console.log(`✓ Test 1 Passed: Route preferences (Standard Tolls: ₹${standardLegs[0].tollFares}, Avoid Tolls: ₹${tollFreeLegs[0].tollFares}, Distance Delta: +${Math.round((tollFreeLegs[0].distanceMeters - standardLegs[0].distanceMeters)/1000)}km)`);

  // Test 2: ScheduleService calculation & propagation (F05)
  const schedule = ScheduleService.computeSchedule(stops, standardLegs, {
    dayStartTime: '09:00',
    dayEndTime: '20:00',
    daysCount: 2,
    maxDailyDrivingHours: 7
  });

  assert.strictEqual(schedule.scheduledStops.length, 3);
  assert.strictEqual(schedule.scheduledStops[0].departureTime, '09:00', 'Origin departure should be day start time 09:00');
  assert(schedule.scheduledStops[1].arrivalTime !== null, 'Stop 2 should have computed arrival time');
  console.log(`✓ Test 2 Passed: Schedule propagation (Stop 1 Dep: ${schedule.scheduledStops[0].departureTime}, Stop 2 Arr: ${schedule.scheduledStops[1].arrivalTime}, Dep: ${schedule.scheduledStops[1].departureTime})`);

  // Test 3: Locked Appointment Protection & Infeasibility Warning (F07)
  const lockedStops = [
    { ...stops[0] },
    { ...stops[1], isLocked: true, lockedArrivalTime: '09:30' }, // Infeasible! Travel time from Hyderabad is ~3.5h, cannot arrive by 09:30
    { ...stops[2] }
  ];
  const lockedSchedule = ScheduleService.computeSchedule(lockedStops, standardLegs, {
    dayStartTime: '09:00',
    dayEndTime: '20:00',
    daysCount: 2
  });

  assert(lockedSchedule.warnings.some(w => w.type === 'LOCKED_APPOINTMENT_INFEASIBLE'), 'Should emit LOCKED_APPOINTMENT_INFEASIBLE warning');
  console.log('✓ Test 3 Passed: Locked appointment conflict detected (arrival delayed past locked commitment)');

  // Test 4: Automatic Overnight Recommendation (F06)
  const longTrip = {
    title: 'Hyderabad to Varanasi Road Trip',
    startingLocation: 'Hyderabad',
    destination: 'Varanasi',
    budgetLimit: 35000,
    emergencyReserve: 3000,
    travelMode: 'Own Vehicle',
    maxDailyDrivingHours: 6,
    stops: [
      { id: 's_hyd', name: 'Hyderabad', lat: 17.3850, lng: 78.4867, category: 'ORIGIN' },
      { id: 's_var', name: 'Varanasi', lat: 25.3176, lng: 82.9739, category: 'DESTINATION' }
    ]
  };

  const longTripResult = await TripRecalculationService.recalculate(longTrip, { isCommit: false });
  assert(longTripResult.overnightSuggestions.length > 0, 'Should generate overnight rest stop suggestions for 1200km leg');
  console.log(`✓ Test 4 Passed: Automatic overnight suggestion triggered: "${longTripResult.overnightSuggestions[0].suggestedLocation}" (${longTripResult.overnightSuggestions[0].reason})`);

  console.log('\nALL PHASE 2 SCHEDULING & ROUTING TESTS PASSED SUCCESSFULLY!');
}

runPhase2Verification().catch(err => {
  console.error('Phase 2 Verification Failed:', err);
  process.exit(1);
});
