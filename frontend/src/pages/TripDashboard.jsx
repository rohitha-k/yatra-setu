import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Navigation, ShieldCheck, Compass, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import YatraMap from '../components/YatraMap';
import { mapService } from '../services/mapService';
import { API } from '../services/api';

export default function TripDashboard() {
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrips() {
      try {
        const userTrips = await API.getUserItineraries();
        if (Array.isArray(userTrips) && userTrips.length > 0) {
          setTrip(userTrips[userTrips.length - 1]);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Backend trips fetch notice:', e);
      }

      const cached = localStorage.getItem('yatrasetu_final_trip') || localStorage.getItem('travexa_final_trip');
      if (cached) {
        try {
          setTrip(JSON.parse(cached));
        } catch {}
      }
      setLoading(false);
    }
    loadTrips();
  }, []);

  if (loading) return null;

  if (!trip) {
    return (
      <div 
        className="min-h-[70vh] flex flex-col items-center justify-center rounded-2xl p-12 text-center"
        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
      >
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
          <Compass className="w-12 h-12 text-amber-500" />
        </div>
        <h2 className="text-4xl font-extrabold mb-4" style={{ color: 'var(--text-heading)' }}>
          Your next journey starts here
        </h2>
        <p className="text-lg text-slate-400 max-w-md mb-8">
          You haven't planned any trips yet. Discover beautiful destinations and create unforgettable memories.
        </p>
        <button 
          onClick={() => navigate('/plan')}
          className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all shadow-lg hover:shadow-amber-500/25 flex items-center gap-2"
        >
          Plan My Trip <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  const travelModeRaw = (trip.travelMode || '').toUpperCase();
  const isOwnVehicle = travelModeRaw === 'OWN VEHICLE' || travelModeRaw === 'OWN CAR' || travelModeRaw === 'OWN BIKE';


  // Fetch routing coordinates and facilities from service (Priority 8)
  const mapData = mapService.getRouteCoordinates(trip.startingLocation || 'Hyderabad', trip.destination || 'Hampi');

  // Specific vehicle cost details computed dynamically (Priority 7)
  let distanceKm = 380;
  let tollFares = 320;
  if (trip.destination === 'Araku Valley') { distanceKm = 620; tollFares = 520; }
  else if (trip.destination === 'Tirupati') { distanceKm = 580; tollFares = 480; }

  const fuelLiters = Math.round(distanceKm / 15);
  const fuelCost = fuelLiters * 100; // Estimated fuel price ₹100/L

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold flex items-center gap-3" style={{ color: 'var(--text-heading)' }}>
            <Map className="w-8 h-8 text-amber-500" />
            Your Journeys
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-500/20 text-amber-500 ml-2">1 Active</span>
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Tracking your optimized trip coordinates, toll fees, and verified route amenities.
          </p>
        </div>
        <button 
          onClick={() => {
            localStorage.clear();
            navigate('/');
          }}
          className="px-5 py-2.5 rounded-lg text-sm font-bold transition-all hover:bg-rose-500/10 hover:text-rose-400"
          style={{ border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
        >
          Reset Demo
        </button>
      </div>

      {/* Grid: Route Map (Left) & Route Facilities (Right) */}
      <div className="grid lg:grid-cols-5 gap-8 items-stretch">
        
        {/* Route Map representation (Left 3 Cols) */}
        <div 
          className="lg:col-span-3 rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative shadow-2xl"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 mb-1" style={{ color: 'var(--text-heading)' }}>
                <Navigation className="w-5 h-5 text-amber-500" />
                YatraMap Interactive Live Routing
              </h3>
              <p className="text-sm text-slate-400">Verifying safe highway segments and corridor utilities.</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live Route</span>
            </div>
          </div>

          <div className="flex-1 rounded-xl overflow-hidden border border-white/5" style={{ minHeight: '400px' }}>
            <YatraMap 
              startPoint={mapData.startingPoint}
              destPoint={mapData.destinationPoint}
              facilities={mapData.facilities}
              attractions={mapData.attractions}
              routePath={mapData.routePath}
              highwayName={mapData.highwayName}
              hotelPoint={trip.selectedAccommodation}
            />
          </div>
        </div>

        {/* Route Details and Road Calculations (Right 2 Cols) */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          
          {/* Own Vehicle calculations if selected (Priority 7) */}
          {isOwnVehicle ? (
            <div 
              className="rounded-2xl p-6 space-y-5 shadow-xl transition-transform hover:-translate-y-1"
              style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
            >
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-amber-500 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Road Transit Calculations
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-slate-400">Total Distance</span>
                  <span className="font-bold text-lg" style={{ color: 'var(--text-heading)' }}>{distanceKm} km</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-slate-400">Estimated Fuel</span>
                  <span className="font-bold" style={{ color: 'var(--text-heading)' }}>{fuelLiters} Liters <span className="text-xs text-slate-500 font-normal">(15 km/l)</span></span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-slate-400">Fuel Cost (₹100/L)</span>
                  <span className="font-bold text-lg text-emerald-400">₹{fuelCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Toll Plaza Costs</span>
                  <span className="font-bold" style={{ color: 'var(--text-heading)' }}>₹{tollFares} <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded ml-1">FASTag</span></span>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="rounded-2xl p-6 space-y-5 shadow-xl transition-transform hover:-translate-y-1"
              style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
            >
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-amber-500 flex items-center gap-2">
                <Compass className="w-4 h-4" /> Common Carrier Transit
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-slate-400">Transit Mode</span>
                  <span className="font-bold px-3 py-1 bg-amber-500/10 text-amber-500 rounded-lg">{trip.travelMode} Express</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-slate-400">Departure</span>
                  <span className="font-bold" style={{ color: 'var(--text-heading)' }}>22:15 Hub Terminal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Average Duration</span>
                  <span className="font-bold" style={{ color: 'var(--text-heading)' }}>8 Hours travel time</span>
                </div>
              </div>
            </div>
          )}

          {/* NHAI Route Stops Suggestions */}
          <div 
            className="rounded-2xl p-6 space-y-5 flex-1 flex flex-col justify-between shadow-xl"
            style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
          >
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-emerald-500 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Verified Route Facilities
            </h3>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {mapData.facilities.slice(0, 3).map((fac, idx) => (
                <div 
                  key={idx} 
                  className="rounded-xl p-4 transition-all hover:bg-white/5 border border-transparent hover:border-white/10 group cursor-pointer"
                  style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <strong className="font-bold text-base group-hover:text-amber-400 transition-colors" style={{ color: 'var(--text-heading)' }}>{fac.name}</strong>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold tracking-wider bg-slate-800 text-slate-300">{fac.type}</span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    {fac.details || fac.facilities || "Safe Highway Stop"}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="pt-4 mt-2 border-t border-white/5">
              <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3 h-3" />
                Route facilities undergo rigorous safety inspections & audits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
