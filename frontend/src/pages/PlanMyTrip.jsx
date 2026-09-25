import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, AlertTriangle } from 'lucide-react';
import { pageVariants } from '../animations/variants';

export default function PlanMyTrip() {
  const navigate = useNavigate();

  // Trip details form parameters (Section 3)
  const [startingLocation, setStartingLocation] = useState('Hyderabad');
  const [destinationPreference, setDestinationPreference] = useState('');
  const [travelersCount, setTravelersCount] = useState(2);
  const [daysCount, setDaysCount] = useState(3);
  const [travelDates, setTravelDates] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 3);
    return d.toISOString().split('T')[0];
  });
  const [budgetLimit, setBudgetLimit] = useState(15000);
  const [requiredBuffer, setRequiredBuffer] = useState(2000); // Optional Buffer (Priority 11)
  const [interests, setInterests] = useState([]);

  // Validation States (Edge Cases)
  const [dateError, setDateError] = useState('');
  const [durationError, setDurationError] = useState('');

  const toggleInterest = (tag) => {
    if (interests.includes(tag)) {
      setInterests(interests.filter(i => i !== tag));
    } else {
      setInterests([...interests, tag]);
    }
  };

  const handleDateChange = (val) => {
    setTravelDates(val);
    if (!val) {
      setDateError('');
      return;
    }
    
    // Check if selected date is in the past (completed date - Edge Case)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(val);
    
    if (isNaN(selectedDate.getTime())) {
      setDateError('Invalid travel date.');
    } else if (selectedDate < today) {
      setDateError('Selected travel date is in the past or already completed.');
    } else {
      setDateError('');
    }
  };

  const handleDurationChange = (val) => {
    const days = parseInt(val);
    setDaysCount(days || 0);
    
    if (isNaN(days) || days < 1 || days > 30) {
      setDurationError('Number of days must be between 1 and 30.');
    } else {
      setDurationError('');
    }
  };

  const handleFindDestinations = (e) => {
    e.preventDefault();

    // Final Validation check prior to routing
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(travelDates);

    if (!travelDates || isNaN(selectedDate.getTime()) || selectedDate < today) {
      setDateError('Selected travel date is in the past or already completed.');
      return;
    }

    if (daysCount < 1 || daysCount > 30) {
      setDurationError('Number of days must be between 1 and 30.');
      return;
    }

    const searchParams = {
      startingLocation,
      destinationPreference,
      travelersCount,
      daysCount,
      travelDates,
      budgetLimit,
      requiredBuffer,
      interests
    };

    localStorage.setItem('travexa_search', JSON.stringify(searchParams));
    if (destinationPreference && destinationPreference.trim() !== '') {
      navigate('/planner');
    } else {
      navigate('/destinations');
    }
  };

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-10 space-y-10"
    >
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 
          className="text-3xl font-bold flex items-center justify-center gap-2"
          style={{ color: 'var(--text-heading)' }}
        >
          <Compass style={{ color: 'var(--brand-primary)', width: '28px', height: '28px' }} />
          Plan Your Journey
        </h2>
        <p style={{ color: 'var(--text-tertiary)' }}>
          Specify your budget and parameters to discover personalized destinations.
        </p>
      </div>

      {/* Input Form */}
      <form 
        onSubmit={handleFindDestinations} 
        className="rounded-2xl p-8 space-y-8"
        style={{ 
          backgroundColor: 'var(--bg-elevated)', 
          border: '1px solid var(--border-default)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}
      >
        
        {/* Section: Location */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg" style={{ color: 'var(--text-heading)' }}>Location Details</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="startingLocation" className="block text-xs uppercase font-semibold" style={{ color: 'var(--text-tertiary)' }}>Starting From</label>
              <input 
                id="startingLocation"
                name="startingLocation"
                type="text" 
                required
                value={startingLocation} 
                onChange={(e) => setStartingLocation(e.target.value)} 
                className="w-full rounded px-4 py-2.5 focus:outline-none focus:ring-1 transition-all"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-body)' }} 
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="destinationPreference" className="block text-xs uppercase font-semibold" style={{ color: 'var(--text-tertiary)' }}>Preferred Destination (Optional)</label>
              <input 
                id="destinationPreference"
                name="destinationPreference"
                type="text" 
                value={destinationPreference} 
                onChange={(e) => setDestinationPreference(e.target.value)} 
                placeholder="e.g. Hampi, Araku"
                className="w-full rounded px-4 py-2.5 focus:outline-none focus:ring-1 transition-all"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-body)' }} 
              />
            </div>
          </div>
        </div>

        <div className="w-full h-px" style={{ backgroundColor: 'var(--border-default)' }}></div>

        {/* Section: Travel Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg" style={{ color: 'var(--text-heading)' }}>Travel Details</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="travelersCount" className="block text-xs uppercase font-semibold" style={{ color: 'var(--text-tertiary)' }}>Travelers Count</label>
              <input 
                id="travelersCount"
                name="travelersCount"
                type="number" 
                required
                min="1"
                value={travelersCount} 
                onChange={(e) => setTravelersCount(parseInt(e.target.value))} 
                className="w-full rounded px-4 py-2.5 focus:outline-none focus:ring-1 transition-all"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-body)' }} 
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="daysCount" className="block text-xs uppercase font-semibold" style={{ color: 'var(--text-tertiary)' }}>Number of Days</label>
              <input 
                id="daysCount"
                name="daysCount"
                type="number" 
                required
                min="1"
                max="30"
                value={daysCount} 
                onChange={(e) => handleDurationChange(e.target.value)} 
                className="w-full rounded px-4 py-2.5 focus:outline-none focus:ring-1 transition-all"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-body)' }} 
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="travelDates" className="block text-xs uppercase font-semibold" style={{ color: 'var(--text-tertiary)' }}>Travel Dates</label>
              <input 
                id="travelDates"
                name="travelDates"
                type="date" 
                required
                value={travelDates} 
                onChange={(e) => handleDateChange(e.target.value)} 
                className="w-full rounded px-4 py-2.5 focus:outline-none focus:ring-1 transition-all"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-body)' }} 
              />
            </div>
          </div>
        </div>

        {/* Validation Alerts (Edge Case Check) */}
        {(dateError || durationError) && (
          <div className="space-y-3">
            {dateError && (
              <div 
                className="p-4 rounded-lg text-sm flex items-center gap-2 border"
                style={{ color: 'var(--status-danger)', borderColor: 'var(--status-danger)', backgroundColor: 'transparent' }}
              >
                <AlertTriangle className="w-5 h-5" style={{ color: 'var(--status-danger)' }} />
                <span>{dateError}</span>
              </div>
            )}
            {durationError && (
              <div 
                className="p-4 rounded-lg text-sm flex items-center gap-2 border"
                style={{ color: 'var(--status-danger)', borderColor: 'var(--status-danger)', backgroundColor: 'transparent' }}
              >
                <AlertTriangle className="w-5 h-5" style={{ color: 'var(--status-danger)' }} />
                <span>{durationError}</span>
              </div>
            )}
          </div>
        )}

        <div className="w-full h-px" style={{ backgroundColor: 'var(--border-default)' }}></div>

        {/* Section: Budget */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg" style={{ color: 'var(--text-heading)' }}>Budget</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="budgetLimit" className="block text-xs uppercase font-semibold" style={{ color: 'var(--text-tertiary)' }}>Total Travel Budget (INR)</label>
              <input 
                id="budgetLimit"
                name="budgetLimit"
                type="number" 
                required
                min="1000"
                value={budgetLimit} 
                onChange={(e) => setBudgetLimit(parseInt(e.target.value))} 
                className="w-full rounded px-4 py-3 focus:outline-none focus:ring-1 transition-all font-bold text-lg"
                style={{ 
                  backgroundColor: 'var(--bg-input)', 
                  border: '2px solid var(--brand-primary)', 
                  color: 'var(--brand-primary)' 
                }} 
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="requiredBuffer" className="block text-xs uppercase font-semibold" style={{ color: 'var(--text-tertiary)' }}>Emergency Buffer Target (INR)</label>
              <input 
                id="requiredBuffer"
                name="requiredBuffer"
                type="number" 
                required
                min="0"
                value={requiredBuffer} 
                onChange={(e) => setRequiredBuffer(parseInt(e.target.value))} 
                className="w-full rounded px-4 py-3 focus:outline-none focus:ring-1 transition-all font-semibold"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-body)' }} 
              />
            </div>
          </div>
        </div>

        <div className="w-full h-px" style={{ backgroundColor: 'var(--border-default)' }}></div>

        {/* Section: Interests */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg" style={{ color: 'var(--text-heading)' }}>Interests & Vibes</h3>
          <div className="space-y-2">
            <label className="block text-xs uppercase font-semibold" style={{ color: 'var(--text-tertiary)' }}>Select all that apply</label>
            <div className="flex flex-wrap gap-3">
              {['Heritage', 'Nature', 'Spiritual', 'Adventure', 'Family'].map(tag => {
                const active = interests.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleInterest(tag)}
                    className="px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer"
                    style={{
                      backgroundColor: active ? 'var(--brand-primary)' : 'var(--bg-input)',
                      borderColor: active ? 'var(--brand-primary)' : 'var(--border-input)',
                      color: active ? 'var(--bg-elevated)' : 'var(--text-body)'
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit (Disabled if parameters are invalid) */}
        <button
          type="submit"
          disabled={!!dateError || !!durationError || !travelDates}
          className="w-full py-4 font-bold text-sm uppercase rounded-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          style={{
            backgroundColor: 'var(--brand-primary)',
            color: 'var(--bg-elevated)'
          }}
        >
          Find Destinations
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </form>
    </motion.div>
  );
}

function ArrowRightIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}
