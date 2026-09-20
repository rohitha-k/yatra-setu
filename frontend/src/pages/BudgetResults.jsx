import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Train, ArrowRight, ShieldCheck, AlertTriangle, Bed, Utensils, UserPlus, Car, MapPin, CheckCircle2 } from 'lucide-react';

export default function BudgetResults() {
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  
  // Staging UI states
  const [isUpgraded, setIsUpgraded] = useState(false);
  const [isExceeded, setIsExceeded] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState('');

  useEffect(() => {
    const rawItin = localStorage.getItem('travexa_itinerary');
    const rawParams = localStorage.getItem('travexa_search');
    
    // Fallback Mock Itinerary for direct access
    const defaultItin = {
      startingLocation: "Hyderabad",
      destination: "Hampi",
      travelersCount: 2,
      daysCount: 3,
      budgetLimit: 15000,
      requiredBuffer: 2000,
      travelMode: 'Own Vehicle',
      selectedTransport: { id: "OWN-CAR", cost: 1300, details: "Own Vehicle: 380 km, Tolls: ₹320", type: "Own Vehicle" },
      selectedAccommodation: { name: "Hampi Heritage Homestay", pricePerNight: 1200, cost: 3600 },
      selectedFood: { name: "Mango Tree Cuisine Hampi", averageMealCost: 200, cost: 3600 },
      selectedGuide: { name: "Ramesh Hampi Heritage Guide", pricePerDay: 800, cost: 2400 },
      activitiesCost: 1500,
      localTransitCost: 800,
      selectedActivities: ["Guided Heritage Walk", "Vijaya Vittala Temple Tour"],
      selectedLocalTransit: "Local Auto rickshaw"
    };

    let parsedItin = defaultItin;
    let parsedParams = {
      startingLocation: "Hyderabad",
      destination: "Hampi",
      travelersCount: 2,
      daysCount: 3,
      budgetLimit: 15000,
      requiredBuffer: 2000,
      travelMode: 'Own Vehicle'
    };

    try {
      if (rawItin && rawItin !== 'undefined' && rawItin !== 'null') {
        parsedItin = JSON.parse(rawItin);
      }
    } catch (e) {
      console.warn("Failed to parse itinerary details, falling back to default.", e);
    }

    try {
      if (rawParams && rawParams !== 'undefined' && rawParams !== 'null') {
        parsedParams = JSON.parse(rawParams);
      } else {
        parsedParams = {
          startingLocation: parsedItin.startingLocation || "Hyderabad",
          destination: parsedItin.destination || "Hampi",
          travelersCount: parsedItin.travelersCount || 2,
          daysCount: parsedItin.daysCount || 3,
          budgetLimit: parsedItin.budgetLimit || 15000,
          requiredBuffer: parsedItin.requiredBuffer || 2000,
          travelMode: parsedItin.travelMode || 'Own Vehicle'
        };
      }
    } catch (e) {
      console.warn("Failed to parse search params, falling back.", e);
    }

    setItinerary(parsedItin);
    setSearchParams(parsedParams);
  }, []);

  // Total planned cost calculations
  const totalSpend = Number(itinerary?.selectedTransport?.cost || 0) + 
                     Number(itinerary?.selectedAccommodation?.cost || 0) + 
                     Number(itinerary?.selectedFood?.cost || 0) + 
                     Number(itinerary?.selectedGuide?.cost || 0) +
                     Number(itinerary?.activitiesCost || 0) +
                     Number(itinerary?.localTransitCost || 0);

  const budgetLimitVal = Number(itinerary?.budgetLimit || 15000);
  const safetyBuffer = itinerary?.requiredBuffer !== undefined 
    ? Number(itinerary.requiredBuffer) 
    : (searchParams?.requiredBuffer !== undefined ? Number(searchParams.requiredBuffer) : budgetLimitVal * 0.1);
    
  const spendable = Math.max(budgetLimitVal - safetyBuffer, 0);
  const remainingSpendable = spendable - totalSpend;
  const totalRemaining = budgetLimitVal - totalSpend;
  const overBudgetAmount = totalSpend - spendable;

  // Keep track of budget bounds (unconditional Hook call)
  useEffect(() => {
    if (itinerary) {
      setIsExceeded(totalSpend > spendable);
    }
  }, [itinerary, totalSpend, spendable]);

  if (!itinerary || !searchParams) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <div className="w-8 h-8 animate-spin border-4 border-t-transparent rounded-full" style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Loading your optimized itinerary...</p>
      </div>
    );
  }

  // Upgrade stay selection
  const handleHotelUpgrade = () => {
    setIsUpgraded(true);
    const days = Number(itinerary?.daysCount || 3);
    const travelers = Number(itinerary?.travelersCount || 2);
    const roomCount = Math.ceil(travelers / 2);

    setItinerary(prev => ({
      ...prev,
      selectedAccommodation: {
        ...prev?.selectedAccommodation,
        name: "Vijayanagara Royal Resort",
        pricePerNight: 4500,
        cost: 4500 * days * roomCount
      }
    }));
    setRecoveryMessage('Upgraded stay to Vijayanagara Royal Resort.');
  };

  const handleResetHotel = () => {
    setIsUpgraded(false);
    const days = Number(itinerary?.daysCount || 3);
    const travelers = Number(itinerary?.travelersCount || 2);
    const roomCount = Math.ceil(travelers / 2);

    setItinerary(prev => ({
      ...prev,
      selectedAccommodation: {
        ...prev?.selectedAccommodation,
        name: "Hampi Heritage Homestay",
        pricePerNight: 1200,
        cost: 1200 * days * roomCount
      }
    }));
    setRecoveryMessage('Switched stay to Hampi Heritage Homestay (₹1,200/night).');
  };

  const handleRemoveGuide = () => {
    setItinerary(prev => ({
      ...prev,
      selectedGuide: null
    }));
    setRecoveryMessage('Removed optional heritage guide service.');
  };

  const handleOptimizeTransport = () => {
    const travelers = Number(itinerary?.travelersCount || 2);
    setItinerary(prev => ({
      ...prev,
      selectedTransport: {
        id: "BUS-EXP",
        name: "KSRTC Sleeper Bus",
        type: "Express Bus",
        cost: 450 * travelers,
        details: "Express Bus: ₹450/seat x " + travelers
      }
    }));
    setRecoveryMessage('Optimized transport to KSRTC Express Bus.');
  };

  const handleIncreaseBudget = () => {
    setItinerary(prev => ({
      ...prev,
      budgetLimit: totalSpend + safetyBuffer
    }));
    setRecoveryMessage('Increased budget limit to cover current trip parameters.');
  };

  const handleSaveAndProceed = () => {
    localStorage.setItem('travexa_final_trip', JSON.stringify(itinerary));
    localStorage.setItem('travexa_itinerary', JSON.stringify(itinerary));
    navigate('/dashboard');
  };

  // Determine Budget status classifications
  const utilizationPct = spendable > 0 ? ((totalSpend / spendable) * 100).toFixed(1) : "0.0";
  let statusText = "🟢 Comfortable";
  let statusColor = "var(--status-success)";
  let statusBadgeBg = "rgba(16, 185, 129, 0.1)";
  
  if (totalSpend > spendable) {
    statusText = "🔴 Over Budget";
    statusColor = "var(--status-danger)";
    statusBadgeBg = "rgba(239, 68, 68, 0.1)";
  } else if (remainingSpendable < spendable * 0.15) {
    statusText = "🟡 Tight";
    statusColor = "var(--status-warning)";
    statusBadgeBg = "rgba(245, 158, 11, 0.1)";
  }

  const fillPercentage = Math.min((totalSpend / spendable) * 100, 100);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 space-y-10">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
            <Sparkles className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
            Your Optimized Journey
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Destination: {itinerary?.destination || "Hampi"} · {itinerary?.daysCount || 3} Days · {itinerary?.travelersCount || 2} Travelers
          </p>
        </div>
      </div>

      {/* RECOVERY NOTIFICATION BANNER */}
      {recoveryMessage && (
        <div className="p-3.5 rounded-lg border flex items-center gap-2.5 text-xs font-semibold"
          style={{ background: 'var(--brand-primary-soft)', borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' }}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{recoveryMessage}</span>
        </div>
      )}

      {/* BUDGET OVERVIEW CARD */}
      <div className="w-full rounded-2xl p-6 border shadow-sm space-y-6" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>Budget Overview</h3>
          <span className="text-xs px-3.5 py-1.5 rounded-full border font-bold" style={{ color: statusColor, backgroundColor: statusBadgeBg, borderColor: statusColor }}>
            {statusText} ({utilizationPct}%)
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div className="flex flex-col p-3 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
            <span className="text-[10px] font-extrabold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Total Budget</span>
            <span className="text-lg font-extrabold" style={{ color: 'var(--text-heading)' }}>₹{Number(budgetLimitVal).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex flex-col p-3 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
            <span className="text-[10px] font-extrabold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Safety Buffer</span>
            <span className="text-lg font-extrabold" style={{ color: 'var(--text-secondary)' }}>₹{Number(safetyBuffer).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex flex-col p-3 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
            <span className="text-[10px] font-extrabold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Spendable Limit</span>
            <span className="text-lg font-extrabold" style={{ color: 'var(--brand-primary)' }}>₹{Number(spendable).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex flex-col p-3 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
            <span className="text-[10px] font-extrabold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Estimated Cost</span>
            <span className="text-lg font-extrabold" style={{ color: isExceeded ? 'var(--status-danger)' : 'var(--text-heading)' }}>₹{Number(totalSpend).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex flex-col p-3 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
            <span className="text-[10px] font-extrabold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Remaining Spendable</span>
            <span className="text-lg font-extrabold" style={{ color: remainingSpendable < 0 ? 'var(--status-danger)' : 'var(--status-success)' }}>
              ₹{Number(remainingSpendable).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
            <span>Spendable Progress</span>
            <span>₹{Number(totalSpend).toLocaleString('en-IN')} / ₹{Number(spendable).toLocaleString('en-IN')}</span>
          </div>
          <div className="budget-bar w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div 
              className="budget-bar-fill h-full transition-all duration-500" 
              style={{ width: `${fillPercentage}%`, backgroundColor: statusColor }}
            />
          </div>
        </div>
      </div>

      {/* OVER-BUDGET RECOVERY EXPERIENCE */}
      {isExceeded && (
        <div className="rounded-2xl p-6 border flex flex-col gap-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.06)', borderColor: 'var(--status-danger)' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold flex items-center gap-2 text-base" style={{ color: 'var(--status-danger)' }}>
                <AlertTriangle className="w-5 h-5 shrink-0" />
                Trip Exceeds Your Spendable Budget
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Current spend is <strong style={{ color: 'var(--status-danger)' }}>₹{Number(totalSpend).toLocaleString('en-IN')}</strong> vs spendable limit <strong style={{ color: 'var(--brand-primary)' }}>₹{Number(spendable).toLocaleString('en-IN')}</strong> (₹{Number(overBudgetAmount).toLocaleString('en-IN')} over limit).
              </p>
            </div>
            <span className="badge badge-danger">🔴 Over Budget</span>
          </div>

          <div className="pt-2 border-t" style={{ borderColor: 'rgba(239, 68, 68, 0.15)' }}>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-heading)' }}>
              YatraSetu Budget Recovery Options
            </h4>
            <div className="flex flex-wrap gap-2.5">
              <button 
                onClick={handleResetHotel}
                className="btn btn-sm btn-ghost"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
              >
                Find Cheaper Stay
              </button>
              {itinerary?.selectedGuide && (
                <button 
                  onClick={handleRemoveGuide}
                  className="btn btn-sm btn-ghost"
                  style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
                >
                  Remove Optional Guide
                </button>
              )}
              <button 
                onClick={handleOptimizeTransport}
                className="btn btn-sm btn-ghost"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
              >
                Optimize Transport
              </button>
              <button 
                onClick={handleIncreaseBudget}
                className="btn btn-sm btn-primary"
              >
                Increase Budget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COST BREAKDOWN CARDS */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>Itemized Cost Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Lodging */}
          <div className="rounded-xl p-5 border flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Lodging</span>
                </div>
                <ShieldCheck className="w-4 h-4" style={{ color: 'var(--status-success)' }} />
              </div>
              <h4 className="text-base font-bold" style={{ color: 'var(--text-heading)' }}>{itinerary?.selectedAccommodation?.name || "Local Stay"}</h4>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>₹{Number(itinerary?.selectedAccommodation?.pricePerNight || 0).toLocaleString('en-IN')}/night</p>
            </div>
            <div className="flex justify-between items-center pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
              {!isUpgraded ? (
                <button onClick={handleHotelUpgrade} className="text-xs font-bold uppercase underline" style={{ color: 'var(--brand-primary)' }}>
                  Upgrade Stay
                </button>
              ) : (
                <button onClick={handleResetHotel} className="text-xs font-bold uppercase underline" style={{ color: 'var(--text-muted)' }}>
                  Revert Stay
                </button>
              )}
              <span className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>₹{Number(itinerary?.selectedAccommodation?.cost || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Transit */}
          <div className="rounded-xl p-5 border flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Train className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Transit</span>
                </div>
              </div>
              <h4 className="text-base font-bold" style={{ color: 'var(--text-heading)' }}>{itinerary?.selectedTransport?.type || itinerary?.selectedTransport?.name || "Transport"}</h4>
              <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{itinerary?.selectedTransport?.details || "Direct routes"}</p>
            </div>
            <div className="flex justify-between items-center pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Travelers: {Number(itinerary?.travelersCount || 1)}</span>
              <span className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>₹{Number(itinerary?.selectedTransport?.cost || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Dining */}
          <div className="rounded-xl p-5 border flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Dining</span>
                </div>
              </div>
              <h4 className="text-base font-bold" style={{ color: 'var(--text-heading)' }}>{itinerary?.selectedFood?.name || "Local Eateries"}</h4>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>₹{Number(itinerary?.selectedFood?.averageMealCost || 200).toLocaleString('en-IN')}/meal avg</p>
            </div>
            <div className="flex justify-between items-center pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{Number(itinerary?.daysCount || 1)} Days</span>
              <span className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>₹{Number(itinerary?.selectedFood?.cost || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Heritage Guide */}
          {itinerary?.selectedGuide ? (
            <div className="rounded-xl p-5 border flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                    <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Heritage Guide</span>
                  </div>
                </div>
                <h4 className="text-base font-bold" style={{ color: 'var(--text-heading)' }}>{itinerary.selectedGuide.name}</h4>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>₹{Number(itinerary.selectedGuide.pricePerDay || 0).toLocaleString('en-IN')}/day</p>
              </div>
              <div className="flex justify-between items-center pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
                <button onClick={handleRemoveGuide} className="text-xs font-bold uppercase underline" style={{ color: 'var(--status-danger)' }}>
                  Remove
                </button>
                <span className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>₹{Number(itinerary.selectedGuide.cost || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl p-5 border border-dashed flex flex-col justify-center items-center text-center space-y-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
              <UserPlus className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>No Guide Allocated</span>
              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Saved ₹2,400</span>
            </div>
          )}

          {/* Local Transit */}
          <div className="rounded-xl p-5 border flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Local Transit</span>
                </div>
              </div>
              <h4 className="text-base font-bold" style={{ color: 'var(--text-heading)' }}>{itinerary?.selectedLocalTransit || "Local Transport"}</h4>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Local sight-seeing contract</p>
            </div>
            <div className="flex justify-between items-center pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{Number(itinerary?.daysCount || 3)} Days</span>
              <span className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>₹{Number(itinerary?.localTransitCost || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Activities */}
          <div className="rounded-xl p-5 border flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Activities</span>
                </div>
              </div>
              <h4 className="text-base font-bold" style={{ color: 'var(--text-heading)' }}>Entry & Sightseeing</h4>
              <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                {itinerary?.selectedActivities && itinerary.selectedActivities.length > 0 
                  ? itinerary.selectedActivities.join(', ') 
                  : "General entry passes"}
              </p>
            </div>
            <div className="flex justify-between items-center pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Tickets x{Number(itinerary?.travelersCount || 2)}</span>
              <span className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>₹{Number(itinerary?.activitiesCost || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

        </div>
      </div>

      {/* DYNAMIC ITINERARY OVERVIEW */}
      <div className="mt-12 mb-8">
        <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-heading)' }}>Day-by-Day Itinerary</h3>
        <div className="space-y-6" style={{ borderLeft: '3px solid var(--brand-primary)', paddingLeft: '24px' }}>
          {Array.from({ length: Number(itinerary?.daysCount || 3) }).map((_, index) => {
            const dayNum = index + 1;
            const daysCount = Number(itinerary?.daysCount || 3);
            const isFirstDay = dayNum === 1;
            const isLastDay = dayNum === daysCount && daysCount > 1;
            
            return (
              <div key={dayNum} className="relative">
                <div className="absolute w-4 h-4 rounded-full -left-[30.5px] top-1" style={{ background: 'var(--brand-primary)' }} />
                <h4 className="font-bold text-lg" style={{ color: 'var(--text-heading)' }}>
                  DAY {dayNum}: {isFirstDay ? 'Arrival & Check-In' : isLastDay ? 'Activities & Return' : 'Guided Explorations & Transit'}
                </h4>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {isFirstDay ? (
                    <>Travel from {itinerary?.startingLocation} via {itinerary?.selectedTransport?.type || itinerary?.selectedTransport?.name || "Own Vehicle"}. Check-in to {itinerary?.selectedAccommodation?.name || "your hotel"}. Dinner at {itinerary?.selectedFood?.name || "local restaurant"}.</>
                  ) : isLastDay ? (
                    <>Conclude morning activities: <strong>{itinerary?.selectedActivities && itinerary.selectedActivities.length > 0 ? itinerary.selectedActivities.join(', ') : "sightseeing"}</strong>. Checkout of hotel and prepare for return journey to {itinerary?.startingLocation}.</>
                  ) : (
                    <>
                      {itinerary?.selectedGuide ? `Meet guide ${itinerary.selectedGuide.name} at tourist attractions. ` : 'Explore tourist attractions. '}
                      Experience local trails and scenic views utilizing your selected local transit option: <strong>{itinerary?.selectedLocalTransit || "Local Transport"}</strong>.
                    </>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t" style={{ borderColor: 'var(--border-default)' }}>
        <button 
          onClick={() => navigate('/planner')}
          className="btn btn-ghost w-full sm:w-auto"
        >
          Modify Selections
        </button>
        <button 
          onClick={handleSaveAndProceed}
          className="btn btn-primary btn-lg w-full sm:w-auto"
        >
          Confirm Trip
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
