import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Plus, Trash2, ArrowUp, ArrowDown, Undo2, Redo2,
  Save, CheckCircle2, AlertTriangle, Clock, Calendar, Users,
  Compass, DollarSign, Shield, Copy, RefreshCw, Car, Train,
  Bus, Plane, ChevronRight, ChevronDown, Sparkles, Navigation,
  Sliders, MoreVertical, Eye, Layers, Lock, Unlock, EyeOff,
  Utensils, Bed, UserCheck, Map
} from 'lucide-react';
import YatraMap from '../components/YatraMap';
import { API, MOCK_DESTINATIONS } from '../services/api';
import { transportService } from '../services/transportService';
import { hotelService } from '../services/hotelService';
import { restaurantService } from '../services/restaurantService';
import { guideService } from '../services/guideService';
import { resolveCanonicalDestination } from './TripPlanner';

export default function ConnectedPlanner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('id');

  // ── Core Trip State — seeded from PlanMyTrip form if available ─────────────
  const [trip, setTrip] = useState(() => {
    // Read user inputs passed from PlanMyTrip via localStorage
    let saved = {};
    try {
      const raw = localStorage.getItem('travexa_search');
      if (raw && raw !== 'undefined' && raw !== 'null') saved = JSON.parse(raw);
    } catch (_) {}

    const origin = saved.startingLocation || 'Hyderabad';
    const dest = saved.destinationPreference || 'Hampi';
    const travelers = Number(saved.travelersCount) || 2;
    const days = Number(saved.daysCount) || 3;
    const budget = Number(saved.budgetLimit) || 18000;
    const reserve = Number(saved.requiredBuffer) || 2000;
    const travelDate = saved.travelDates || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

    return {
      title: dest ? `${origin} → ${dest} Journey` : 'Deccan Heritage & Scenic Circuit',
      startingLocation: origin,
      destination: dest || 'Hampi',
      intermediateCities: [],
      travelersCount: travelers,
      daysCount: days,
      travelDates: travelDate,
      openEnded: false,
      budgetLimit: budget,
      emergencyReserve: reserve,
      spendableBudget: budget - reserve,
      travelMode: 'Train',
      units: 'km',
      currency: 'INR',
      isOneWay: false,
      tags: saved.interests && saved.interests.length ? saved.interests : ['Heritage', 'Scenic', 'Weekend'],
      revision: 1,
      stops: [
        {
          id: 'stop_orig_1',
          name: `${origin} (Departure)`,
          category: 'ORIGIN',
          lat: 17.3850,
          lng: 78.4867,
          durationMinutes: 0,
          nights: 0,
          notes: 'Trip Departure Point',
          isLocked: true,
          isSkipped: false
        },
        {
          id: 'stop_dest_1',
          name: `${dest || 'Hampi'} (Destination)`,
          category: 'DESTINATION',
          lat: 15.3350,
          lng: 76.4600,
          durationMinutes: 720,
          nights: days - 1,
          notes: 'Main Destination',
          isLocked: false,
          isSkipped: false
        }
      ],
      routePreferences: {
        avoidTolls: false,
        highwayPriority: true
      },
      routeLegs: [],
      days: [],
      ledger: null,
      warnings: [],
      overnightSuggestions: [],
      alternatives: []
    };
  });

  // Active day filter tab (F05)
  const [activeDayTab, setActiveDayTab] = useState('ALL'); // 'ALL' | 1 | 2 | 3 ...

  // ── Right Panel Tab: 'map' | 'services' ───────────────────────────────────
  const [rightPanelTab, setRightPanelTab] = useState('map');

  // ── Service Selection State (merged from TripPlanner) ─────────────────────
  const [transportsList, setTransportsList] = useState([]);
  const [staysList, setStaysList] = useState([]);
  const [eateriesList, setEateriesList] = useState([]);
  const [guidesList, setGuidesList] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [selectedStay, setSelectedStay] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [mileage, setMileage] = useState(15);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Load services whenever destination changes
  useEffect(() => {
    const dest = resolveCanonicalDestination(trip.destination);
    const origin = trip.startingLocation || 'Hyderabad';
    const date = trip.travelDates || new Date().toISOString().split('T')[0];
    setServicesLoading(true);
    Promise.all([
      transportService.search(origin, dest, date, 'ALL'),
      hotelService.getHotelsByDestination(dest),
      restaurantService.getRestaurantsByDestination(dest),
      guideService.getGuidesByDestination(dest)
    ]).then(([t, h, r, g]) => {
      setTransportsList(t || []);
      setStaysList(h || []);
      setEateriesList(r || []);
      setGuidesList(g || []);
    }).finally(() => setServicesLoading(false));
  }, [trip.destination, trip.startingLocation]);

  // Compute service costs
  const travelers = trip.travelersCount || 2;
  const days = trip.daysCount || 3;
  const rooms = Math.ceil(travelers / 2);
  const distKm = 380;
  const tollFares = 320;
  const fuelCost = Math.round(distKm / mileage) * 100;
  const ownVehicleCost = fuelCost + tollFares + 250;
  const tCost = selectedTransport?.pricePerSeat ? selectedTransport.pricePerSeat * travelers : ownVehicleCost;
  const sCost = (selectedStay?.pricePerNight || 1200) * days * rooms;
  const fCost = (selectedFood?.averageMealCost || 150) * travelers * days * 3;
  const gCost = selectedGuide ? selectedGuide.pricePerDay * days : 0;
  const servicesTotalCost = tCost + sCost + fCost + gCost;

  // Remaining spendable after services (used in Services tab)
  const serviceSpendableBudget = trip.budgetLimit - trip.emergencyReserve;
  const serviceRemaining = serviceSpendableBudget - servicesTotalCost;

  const handleFinalizeTrip = () => {
    const details = {
      startingLocation: trip.startingLocation,
      destination: trip.destination,
      travelersCount: travelers,
      daysCount: days,
      budgetLimit: trip.budgetLimit,
      requiredBuffer: trip.emergencyReserve,
      travelMode: selectedTransport?.carrier || 'Own Vehicle',
      selectedTransport: { id: selectedTransport?.id || 'OWN', cost: tCost, details: selectedTransport?.carrier || `Own Vehicle: ${distKm}km`, type: selectedTransport?.carrier || 'Own Vehicle' },
      selectedAccommodation: { name: selectedStay?.name || staysList[0]?.name || 'Heritage Homestay', pricePerNight: selectedStay?.pricePerNight || 1200, cost: sCost },
      selectedFood: { name: selectedFood?.name || eateriesList[0]?.name || 'Local Cuisine', averageMealCost: selectedFood?.averageMealCost || 150, cost: fCost },
      selectedGuide: selectedGuide ? { name: selectedGuide.name, pricePerDay: selectedGuide.pricePerDay, cost: gCost } : null,
      activitiesCost: 0,
      localTransitCost: 0,
      stops: trip.stops,
      routeLegs: trip.routeLegs
    };
    localStorage.setItem('travexa_itinerary', JSON.stringify(details));
    localStorage.setItem('travexa_final_trip', JSON.stringify(details));
    navigate('/results');
  };

  // ── History & Autosave Stack (F04) ─────────────────────────────────────────
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [autosaveStatus, setAutosaveStatus] = useState('saved'); // 'saved' | 'saving' | 'dirty' | 'conflict'
  const isInternalUpdate = useRef(false);

  // Selected stop in timeline / map sync (F02, F03)
  const [selectedStopId, setSelectedStopId] = useState('stop_orig_1');
  const [isSetupDrawerOpen, setIsSetupDrawerOpen] = useState(false);
  const [isAddStopModalOpen, setIsAddStopModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newStopForm, setNewStopForm] = useState({
    name: '',
    category: 'ATTRACTION',
    lat: 15.5,
    lng: 77.0,
    durationMinutes: 60,
    nights: 0,
    notes: ''
  });

  // ── Recalculate Trip from Backend Service ──────────────────────────────────
  const triggerRecalculate = useCallback(async (candidateTrip, isCommit = false) => {
    setAutosaveStatus('saving');
    try {
      const res = await API.recalculateTrip(candidateTrip);
      setTrip(prev => ({
        ...prev,
        ...res,
        revision: isCommit ? (res.revision || prev.revision + 1) : prev.revision
      }));
      setAutosaveStatus('saved');
    } catch (err) {
      console.error("Recalculation error:", err);
      setAutosaveStatus('saved');
    }
  }, []);

  // Push new state snapshot to Undo/Redo stack
  const pushHistory = (newState) => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const newStack = history.slice(0, historyIndex + 1);
    newStack.push(JSON.stringify(newState));
    if (newStack.length > 25) newStack.shift();
    setHistory(newStack);
    setHistoryIndex(newStack.length - 1);
  };

  // Initial load
  useEffect(() => {
    triggerRecalculate(trip, false);
    pushHistory(trip);
  }, []);

  // ── Undo / Redo Controllers ────────────────────────────────────────────────
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevState = JSON.parse(history[prevIndex]);
      isInternalUpdate.current = true;
      setHistoryIndex(prevIndex);
      setTrip(prevState);
      triggerRecalculate(prevState, false);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextState = JSON.parse(history[nextIndex]);
      isInternalUpdate.current = true;
      setHistoryIndex(nextIndex);
      setTrip(nextState);
      triggerRecalculate(nextState, false);
    }
  };

  // ── Stop Operations (F03) ──────────────────────────────────────────────────
  const handleUpdateStop = (stopId, patch) => {
    const updatedStops = trip.stops.map(s => s.id === stopId ? { ...s, ...patch } : s);
    const updatedTrip = { ...trip, stops: updatedStops };
    setTrip(updatedTrip);
    pushHistory(updatedTrip);
    triggerRecalculate(updatedTrip, true);
  };

  const handleMoveStop = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= trip.stops.length) return;
    const newStops = [...trip.stops];
    const temp = newStops[index];
    newStops[index] = newStops[targetIndex];
    newStops[targetIndex] = temp;

    // Preserve first as origin and last as destination categories if appropriate
    const updatedTrip = { ...trip, stops: newStops };
    setTrip(updatedTrip);
    pushHistory(updatedTrip);
    triggerRecalculate(updatedTrip, true);
  };

  const handleDeleteStop = (stopId) => {
    if (trip.stops.length <= 2) {
      alert("A trip must have at least an origin and a destination.");
      return;
    }
    const filtered = trip.stops.filter(s => s.id !== stopId);
    const updatedTrip = { ...trip, stops: filtered };
    setTrip(updatedTrip);
    pushHistory(updatedTrip);
    triggerRecalculate(updatedTrip, true);
    if (selectedStopId === stopId) {
      setSelectedStopId(filtered[0]?.id || null);
    }
  };

  const handleToggleSkipStop = (stopId) => {
    const updatedStops = trip.stops.map(s => s.id === stopId ? { ...s, isSkipped: !s.isSkipped } : s);
    const updatedTrip = { ...trip, stops: updatedStops };
    setTrip(updatedTrip);
    pushHistory(updatedTrip);
    triggerRecalculate(updatedTrip, true);
  };

  // Map Click to Add Stop (F02)
  const handleMapClick = (coords) => {
    setNewStopForm({
      name: `Waypoint at ${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`,
      category: 'WAYPOINT',
      lat: Number(coords.lat.toFixed(5)),
      lng: Number(coords.lng.toFixed(5)),
      durationMinutes: 60,
      nights: 0,
      notes: 'Added via map click'
    });
    setIsAddStopModalOpen(true);
  };

  // Marker Drag End (F03)
  const handleStopDragEnd = (stopId, newCoords) => {
    handleUpdateStop(stopId, { lat: newCoords.lat, lng: newCoords.lng });
  };

  const handleCreateStopSubmit = (e) => {
    e.preventDefault();
    const newStop = {
      id: `stop_${Date.now()}`,
      name: newStopForm.name || 'New Stop',
      category: newStopForm.category,
      lat: Number(newStopForm.lat),
      lng: Number(newStopForm.lng),
      durationMinutes: Number(newStopForm.durationMinutes || 60),
      nights: Number(newStopForm.nights || 0),
      notes: newStopForm.notes || '',
      isLocked: false,
      isSkipped: false
    };

    // Insert before destination
    const newStops = [...trip.stops];
    newStops.splice(Math.max(1, newStops.length - 1), 0, newStop);
    const updatedTrip = { ...trip, stops: newStops };
    setTrip(updatedTrip);
    pushHistory(updatedTrip);
    triggerRecalculate(updatedTrip, true);
    setSelectedStopId(newStop.id);
    setIsAddStopModalOpen(false);
  };

  // Accept Automatic Overnight Suggestion (F06)
  const handleAddOvernightStop = (suggestion) => {
    if (!suggestion || !suggestion.suggestedStop) return;
    const newStop = {
      id: `stop_overnight_${Date.now()}`,
      ...suggestion.suggestedStop,
      isLocked: false,
      isSkipped: false
    };

    const newStops = [...trip.stops];
    newStops.splice(Math.max(1, newStops.length - 1), 0, newStop);
    const updatedTrip = { ...trip, stops: newStops };
    setTrip(updatedTrip);
    pushHistory(updatedTrip);
    triggerRecalculate(updatedTrip, true);
    setSelectedStopId(newStop.id);
  };

  // Toggle Route Preferences (F08)
  const handleTogglePreference = (key) => {
    const newPrefs = {
      ...trip.routePreferences,
      [key]: !trip.routePreferences?.[key]
    };
    const updatedTrip = { ...trip, routePreferences: newPrefs };
    setTrip(updatedTrip);
    pushHistory(updatedTrip);
    triggerRecalculate(updatedTrip, true);
  };

  // ── Duplicate Trip (F32) ───────────────────────────────────────────────────
  const handleDuplicateTrip = async () => {
    const cloned = {
      ...trip,
      title: `Copy of ${trip.title}`,
      revision: 1
    };
    setTrip(cloned);
    pushHistory(cloned);
    triggerRecalculate(cloned, true);
    alert("Trip duplicated successfully as a new workspace revision.");
  };

  const selectedStop = trip.stops.find(s => s.id === selectedStopId) || trip.stops[0];
  const spendableBudget = trip.budgetLimit - trip.emergencyReserve;
  const projectedCost = trip.ledger?.totalProjectedCost || 0;
  const remainingSpendable = spendableBudget - projectedCost;
  const budgetStatus = trip.ledger?.budgetStatus || 'Comfortable';

  return (
    <div 
      className="w-full min-h-[calc(100vh-64px)] flex flex-col transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      
      {/* ── Tiranga Indian Flag Accent Strip ───────────────────────────── */}
      <div className="tiranga-accent-strip" />

      {/* ── Top Bar: Workspace Controls & Status ──────────────────────────── */}
      <header 
        className="sticky top-16 z-30 backdrop-blur px-4 py-3 shadow-xs transition-colors duration-200 border-b"
        style={{ backgroundColor: 'var(--bg-glass-heavy)', borderColor: 'var(--border-default)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Trip Title & Badges */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-500/20 shadow-xs">
              <Compass className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heritage font-extrabold text-lg sm:text-xl tracking-tight" style={{ color: 'var(--text-heading)' }}>
                  {trip.title}
                </h1>
                <span className="text-[11px] font-mono bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60 font-semibold">
                  Rev #{trip.revision}
                </span>
                {/* Autosave badge */}
                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  {autosaveStatus === 'saving' ? (
                    <span className="flex items-center gap-1 text-amber-600 animate-pulse font-semibold">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs flex items-center gap-2 mt-0.5 font-medium" style={{ color: 'var(--text-tertiary)' }}>
                <span>{trip.travelDates} ({trip.daysCount} Days)</span>
                <span>•</span>
                <span>{trip.travelersCount} Traveler{trip.travelersCount > 1 ? 's' : ''}</span>
                <span>•</span>
                <span>{trip.stops.length} Stops</span>
              </p>
            </div>
          </div>

          {/* Center / Right: Live Budget & Reserve Meter (F16) */}
          <div className="flex items-center gap-3">
            
            {/* Spendable Budget Pill */}
            <div 
              className="hidden sm:flex flex-col items-end px-3 py-1.5 rounded-lg border"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                <span>Spendable: ₹{spendableBudget.toLocaleString('en-IN')}</span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1 rounded font-semibold">
                  Safe ₹{trip.emergencyReserve.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center gap-2 font-bold text-xs">
                <span className={budgetStatus === 'Over Budget' ? 'text-rose-600' : ''} style={{ color: budgetStatus === 'Over Budget' ? undefined : 'var(--text-heading)' }}>
                  Projected: ₹{projectedCost.toLocaleString('en-IN')}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                  budgetStatus === 'Over Budget' ? 'bg-rose-100 text-rose-700' :
                  budgetStatus === 'Tight' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {budgetStatus}
                </span>
              </div>
            </div>

            {/* Undo / Redo Controls (F04) */}
            <div 
              className="flex items-center rounded-lg p-0.5 border"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
            >
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                title="Undo (Ctrl+Z)"
                className="p-1.5 rounded disabled:opacity-40 transition-colors cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                title="Redo (Ctrl+Y)"
                className="p-1.5 rounded disabled:opacity-40 transition-colors cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Trip Settings Drawer Toggle (F01) */}
            <button
              onClick={() => setIsSetupDrawerOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-heading)' }}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-600" />
              <span>Trip Setup</span>
            </button>

            {/* Duplicate Trip (F32) */}
            <button
              onClick={handleDuplicateTrip}
              title="Duplicate trip as new revision"
              className="p-2 rounded-lg border transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Add Stop Button */}
            <button
              onClick={() => {
                setNewStopForm({
                  name: '',
                  category: 'ATTRACTION',
                  lat: 15.3350,
                  lng: 76.4600,
                  durationMinutes: 60,
                  nights: 0,
                  notes: ''
                });
                setIsAddStopModalOpen(true);
              }}
              className="flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-brand transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stop</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Workspace Body: Split Panels ─────────────────────────────── */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Timeline & Stop Editor (Cols 1-5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">

          {/* Route Preferences Bar (F08) */}
          <div 
            className="rounded-xl border p-2.5 flex items-center justify-between text-xs shadow-xs"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
          >
            <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--text-heading)' }}>
              <Sliders className="w-3.5 h-3.5 text-amber-600" />
              <span>Route Options:</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={!!trip.routePreferences?.avoidTolls}
                  onChange={() => handleTogglePreference('avoidTolls')}
                  className="rounded text-amber-600 focus:ring-0 text-xs cursor-pointer"
                />
                <span className="text-[11px] font-medium">Avoid Tolls</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={trip.routePreferences?.highwayPriority !== false}
                  onChange={() => handleTogglePreference('highwayPriority')}
                  className="rounded text-amber-600 focus:ring-0 text-xs cursor-pointer"
                />
                <span className="text-[11px] font-medium">Highway Priority</span>
              </label>
            </div>
          </div>

          {/* Automatic Overnight Suggestions Card (F06) */}
          {trip.overnightSuggestions && trip.overnightSuggestions.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl p-3.5 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Automatic Overnight Recommendation (F06)</span>
                </div>
                <span className="text-[10px] bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-1.5 py-0.5 rounded font-bold">
                  Fatigue Safety
                </span>
              </div>
              {trip.overnightSuggestions.map(sugg => (
                <div 
                  key={sugg.id} 
                  className="rounded-lg p-2.5 border flex items-center justify-between gap-3"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
                >
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-heading)' }}>{sugg.suggestedLocation}</p>
                    <p className="text-[11px] text-purple-700 dark:text-purple-400">{sugg.reason}</p>
                  </div>
                  <button
                    onClick={() => handleAddOvernightStop(sugg)}
                    className="shrink-0 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    + Add Stay
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Active Warnings Banner (F10) */}
          {trip.warnings && trip.warnings.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3.5 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Trip Schedule & Budget Advisory ({trip.warnings.length})</span>
              </div>
              <div className="space-y-1.5">
                {trip.warnings.map(w => (
                  <div key={w.id} className="text-[11px] text-amber-900 dark:text-amber-200/90 pl-6 relative">
                    <span className="absolute left-1 top-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <p className="font-semibold">{w.message}</p>
                    {w.correctiveAction && (
                      <p className="text-amber-700 dark:text-amber-400 text-[10px]">Action: {w.correctiveAction}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Schedule Tabs Bar (F05) */}
          {trip.days && trip.days.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveDayTab('ALL')}
                className="px-3 py-1 text-xs font-bold rounded-lg shrink-0 transition-colors cursor-pointer border"
                style={activeDayTab === 'ALL' ? {
                  backgroundColor: 'var(--brand-primary)',
                  borderColor: 'var(--brand-primary)',
                  color: 'var(--text-on-brand)'
                } : {
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-secondary)'
                }}
              >
                All Days
              </button>
              {trip.days.map(d => (
                <button
                  key={d.dayIndex}
                  onClick={() => setActiveDayTab(d.dayIndex)}
                  className="px-3 py-1 text-xs font-bold rounded-lg shrink-0 transition-colors cursor-pointer border"
                  style={activeDayTab === d.dayIndex ? {
                    backgroundColor: 'var(--brand-primary)',
                    borderColor: 'var(--brand-primary)',
                    color: 'var(--text-on-brand)'
                  } : {
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  Day {d.dayIndex} ({d.drivingHours || 0}h • {d.distanceKm || 0}km)
                </button>
              ))}
            </div>
          )}

          {/* Stops Timeline List (F03) */}
          <div 
            className="rounded-2xl border shadow-xs p-4 flex flex-col gap-3"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <h2 className="font-heritage font-bold text-sm" style={{ color: 'var(--text-heading)' }}>Trip Timeline</h2>
                <span className="text-[11px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-full font-bold">
                  {trip.stops.length} Waypoints
                </span>
              </div>
              <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Click stop to inspect on map</span>
            </div>

            <div className="space-y-2.5">
              {trip.stops
                .filter(s => activeDayTab === 'ALL' || s.scheduledDay === activeDayTab || !s.scheduledDay)
                .map((stop, idx) => {
                const isSelected = selectedStopId === stop.id;
                return (
                  <div
                    key={stop.id}
                    onClick={() => setSelectedStopId(stop.id)}
                    className="p-3 rounded-xl border transition-all cursor-pointer"
                    style={isSelected ? {
                      backgroundColor: 'var(--brand-primary-soft)',
                      borderColor: 'var(--brand-primary)',
                      boxShadow: '0 0 0 1px var(--brand-primary)'
                    } : stop.isSkipped ? {
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-default)',
                      opacity: 0.6
                    } : {
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-default)'
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                              {stop.name}
                            </h3>
                            {stop.isLocked && (
                              <Lock className="w-3 h-3 text-amber-500" title={`Locked arrival: ${stop.lockedArrivalTime || 'Set'}`} />
                            )}
                            {stop.isSkipped && (
                              <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 px-1 rounded font-mono">
                                Skipped
                              </span>
                            )}
                          </div>
                          
                          {/* Schedule & Timing Badges (F05) */}
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                              {stop.category}
                            </span>
                            {stop.arrivalTime && (
                              <span className="text-amber-700 dark:text-amber-400 font-semibold">
                                🕒 {stop.arrivalTime} - {stop.departureTime}
                              </span>
                            )}
                            {stop.durationMinutes > 0 && <span>⏱ {stop.durationMinutes}m</span>}
                            {stop.nights > 0 && <span className="text-purple-600 font-semibold">🛏 {stop.nights} night(s)</span>}
                          </div>
                        </div>
                      </div>

                      {/* Reorder and Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleMoveStop(idx, -1)}
                          disabled={idx === 0}
                          title="Move Up"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveStop(idx, 1)}
                          disabled={idx === trip.stops.length - 1}
                          title="Move Down"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleSkipStop(stop.id)}
                          title={stop.isSkipped ? "Restore Stop" : "Skip Stop (F14)"}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
                        >
                          {stop.isSkipped ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteStop(stop.id)}
                          title="Remove Stop"
                          className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Quick Edit for Selected Stop */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5" onClick={e => e.stopPropagation()}>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Dwell Duration</label>
                            <select
                              value={stop.durationMinutes}
                              onChange={(e) => handleUpdateStop(stop.id, { durationMinutes: Number(e.target.value) })}
                              className="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white mt-0.5"
                            >
                              <option value="30">30 mins</option>
                              <option value="60">1 hour</option>
                              <option value="90">1.5 hours</option>
                              <option value="120">2 hours</option>
                              <option value="240">Half day (4h)</option>
                              <option value="720">Full day (12h)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Overnight Stay</label>
                            <input
                              type="number"
                              min="0"
                              max="14"
                              value={stop.nights || 0}
                              onChange={(e) => handleUpdateStop(stop.id, { nights: Number(e.target.value) })}
                              className="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white mt-0.5"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Stop Notes</label>
                          <input
                            type="text"
                            placeholder="Add notes, entrance hours, or reservations..."
                            value={stop.notes || ''}
                            onChange={(e) => handleUpdateStop(stop.id, { notes: e.target.value })}
                            className="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white mt-0.5"
                          />
                        </div>

                        {/* Fixed Appointment Lock Controls (F07) */}
                        <div className="pt-1 flex flex-col gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                          <label className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-200 cursor-pointer font-bold">
                            <input
                              type="checkbox"
                              checked={!!stop.isLocked}
                              onChange={(e) => handleUpdateStop(stop.id, { isLocked: e.target.checked })}
                              className="rounded text-amber-600 focus:ring-0 cursor-pointer"
                            />
                            <span>Lock Arrival Time (F07 Fixed Appointment)</span>
                          </label>
                          {stop.isLocked && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-slate-500">Target Time:</span>
                              <input
                                type="time"
                                value={stop.lockedArrivalTime || stop.arrivalTime || '12:00'}
                                onChange={(e) => handleUpdateStop(stop.id, { lockedArrivalTime: e.target.value })}
                                className="text-xs p-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
                              />
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                Infeasibility reported if delayed
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Map + Services Tabs (Cols 6-12) */}
        <div className="lg:col-span-7 flex flex-col gap-4">

          {/* Tab Switcher: Segmented Pill */}
          <div
            className="flex p-1.5 rounded-2xl border shadow-xs gap-1.5 transition-all"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
          >
            <button
              onClick={() => setRightPanelTab('map')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                rightPanelTab === 'map'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-sm scale-[1.01]'
                  : 'hover:opacity-90'
              }`}
              style={{ color: rightPanelTab === 'map' ? '#FFFFFF' : 'var(--text-secondary)' }}
            >
              <Map className="w-4 h-4" />
              <span>Route Map</span>
            </button>
            <button
              onClick={() => setRightPanelTab('services')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                rightPanelTab === 'services'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-sm scale-[1.01]'
                  : 'hover:opacity-90'
              }`}
              style={{ color: rightPanelTab === 'services' ? '#FFFFFF' : 'var(--text-secondary)' }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Choose Services</span>
              <span 
                className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full uppercase"
                style={{
                  backgroundColor: rightPanelTab === 'services' ? 'rgba(255,255,255,0.25)' : 'var(--brand-primary-soft)',
                  color: rightPanelTab === 'services' ? '#FFFFFF' : 'var(--brand-primary)'
                }}
              >
                Booking
              </span>
            </button>
          </div>

          {/* MAP TAB */}
          {rightPanelTab === 'map' && (
            <div
              className="rounded-2xl border shadow-xs p-3.5 relative overflow-hidden transition-all"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center justify-between pb-3 mb-2.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2">
                  <h2 className="font-heritage font-bold text-sm" style={{ color: 'var(--text-heading)' }}>Route Navigation Map</h2>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-tertiary)' }}>
                    {trip.summary?.totalDistanceKm || 380} {trip.units} • ~{trip.summary?.totalTravelTimeHours || 6.2} hrs
                  </span>
                </div>
                <p className="text-[11px] font-semibold flex items-center gap-1" style={{ color: 'var(--brand-primary)' }}>
                  <span>📍 Click map to drop waypoint</span>
                </p>
              </div>
              <YatraMap
                stops={trip.stops}
                routeLegs={trip.routeLegs}
                selectedStopId={selectedStopId}
                onSelectStop={(stop) => setSelectedStopId(stop.id)}
                onMapClick={handleMapClick}
                onStopDragEnd={handleStopDragEnd}
                height="460px"
              />
            </div>
          )}

          {/* SERVICES TAB */}
          {rightPanelTab === 'services' && (
            <div 
              className="rounded-2xl border shadow-xs flex flex-col gap-4 p-4 transition-all" 
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
            >

              {servicesLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
                  <span className="font-medium">Fetching verified services for {trip.destination}...</span>
                </div>
              )}

              {!servicesLoading && (
                <>
                  {/* TRANSPORT SECTION */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold uppercase flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                        <Car className="w-4 h-4 text-amber-600" />
                        <span>Transport & Route Transit</span>
                      </h3>
                      <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                        {trip.startingLocation} → {trip.destination}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {/* Own Vehicle option */}
                      <div
                        onClick={() => setSelectedTransport(null)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          !selectedTransport 
                            ? 'border-amber-500 shadow-xs' 
                            : 'hover:border-amber-400'
                        }`}
                        style={{
                          backgroundColor: !selectedTransport ? 'var(--brand-primary-soft)' : 'var(--bg-elevated)',
                          borderColor: !selectedTransport ? 'var(--brand-primary)' : 'var(--border-default)'
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs" style={{ color: 'var(--text-heading)' }}>🚗 Own Vehicle / Self-Drive</span>
                            {!selectedTransport && (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-600 text-white flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Selected
                              </span>
                            )}
                          </div>
                          <span className="font-extrabold text-sm text-amber-600">₹{ownVehicleCost.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                          Estimated fuel ({mileage} km/l) + Fastag Toll ₹{tollFares} + Parking
                        </div>
                        {!selectedTransport && (
                          <div className="flex items-center gap-3 mt-2.5 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                            <label className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Mileage:</label>
                            <input
                              type="range" min="8" max="30" step="1"
                              value={mileage}
                              onChange={e => setMileage(Number(e.target.value))}
                              className="flex-1 accent-amber-600 cursor-pointer"
                              onClick={e => e.stopPropagation()}
                            />
                            <span className="font-bold text-xs text-amber-600 font-mono">{mileage} km/l</span>
                          </div>
                        )}
                      </div>

                      {/* Provider Transports */}
                      {transportsList.slice(0, 4).map(t => {
                        const isSelected = selectedTransport?.id === t.id;
                        return (
                          <div
                            key={t.id}
                            onClick={() => setSelectedTransport(t)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-amber-500 shadow-xs' 
                                : 'hover:border-amber-400'
                            }`}
                            style={{
                              backgroundColor: isSelected ? 'var(--brand-primary-soft)' : 'var(--bg-elevated)',
                              borderColor: isSelected ? 'var(--brand-primary)' : 'var(--border-default)'
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs" style={{ color: 'var(--text-heading)' }}>{t.carrier}</span>
                                {isSelected && (
                                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-600 text-white flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Selected
                                  </span>
                                )}
                              </div>
                              <span className="font-extrabold text-sm text-amber-600">₹{(t.pricePerSeat * travelers).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                              <span>{t.time}</span>
                              <span>•</span>
                              <span>{t.duration}</span>
                              <span>•</span>
                              <span>₹{t.pricePerSeat.toLocaleString('en-IN')}/seat × {travelers} seats</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-px my-1" style={{ backgroundColor: 'var(--border-default)' }} />

                  {/* STAY SECTION */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold uppercase flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                        <Bed className="w-4 h-4 text-blue-500" />
                        <span>Accommodation</span>
                      </h3>
                      <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                        {days} nights • {rooms} room{rooms > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {staysList.slice(0, 4).map(h => {
                        const isSelected = selectedStay?.id === h.id;
                        return (
                          <div
                            key={h.id}
                            onClick={() => setSelectedStay(h)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-blue-500 shadow-xs' 
                                : 'hover:border-blue-400'
                            }`}
                            style={{
                              backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-elevated)',
                              borderColor: isSelected ? '#3B82F6' : 'var(--border-default)'
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs" style={{ color: 'var(--text-heading)' }}>{h.name}</span>
                                {isSelected && (
                                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-600 text-white flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Selected
                                  </span>
                                )}
                              </div>
                              <span className="font-extrabold text-sm text-blue-600">₹{(h.pricePerNight * days * rooms).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                              <span>₹{h.pricePerNight.toLocaleString('en-IN')}/night</span>
                              <span>•</span>
                              <span className="text-amber-600 font-semibold">★ {h.trustScore || 92}% Trust</span>
                              {h.isGovernmentApproved && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-600 font-semibold">🛡️ Govt Approved</span>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-px my-1" style={{ backgroundColor: 'var(--border-default)' }} />

                  {/* FOOD SECTION */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold uppercase flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                        <Utensils className="w-4 h-4 text-emerald-500" />
                        <span>Dining & Meals</span>
                      </h3>
                      <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                        {travelers} travelers × {days} days (3 meals/day)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {eateriesList.slice(0, 3).map(r => {
                        const isSelected = selectedFood?.id === r.id;
                        return (
                          <div
                            key={r.id}
                            onClick={() => setSelectedFood(r)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-emerald-500 shadow-xs' 
                                : 'hover:border-emerald-400'
                            }`}
                            style={{
                              backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-elevated)',
                              borderColor: isSelected ? '#10B981' : 'var(--border-default)'
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs" style={{ color: 'var(--text-heading)' }}>{r.name}</span>
                                {isSelected && (
                                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Selected
                                  </span>
                                )}
                              </div>
                              <span className="font-extrabold text-sm text-emerald-600">₹{(r.averageMealCost * travelers * days * 3).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                              <span>~₹{r.averageMealCost}/meal/person</span>
                              <span>•</span>
                              <span className="text-amber-600 font-semibold">★ {r.trustScore || 88}% Rating</span>
                              {r.cuisine && (
                                <>
                                  <span>•</span>
                                  <span>{r.cuisine}</span>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-px my-1" style={{ backgroundColor: 'var(--border-default)' }} />

                  {/* GUIDE SECTION */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold uppercase flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                        <UserCheck className="w-4 h-4 text-purple-500" />
                        <span>Certified Tour Guide (Optional)</span>
                      </h3>
                      <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                        Local Expert Assistance
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      <div
                        onClick={() => setSelectedGuide(null)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          !selectedGuide 
                            ? 'border-purple-500 shadow-xs' 
                            : 'hover:border-purple-400'
                        }`}
                        style={{
                          backgroundColor: !selectedGuide ? 'rgba(168, 85, 247, 0.08)' : 'var(--bg-elevated)',
                          borderColor: !selectedGuide ? '#A855F7' : 'var(--border-default)'
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs" style={{ color: 'var(--text-heading)' }}>No Guide (Self-Guided Adventure)</span>
                            {!selectedGuide && (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-purple-600 text-white flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Selected
                              </span>
                            )}
                          </div>
                          <span className="font-extrabold text-sm text-purple-600">₹0</span>
                        </div>
                        <div className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                          Explore independently at your own pace
                        </div>
                      </div>

                      {guidesList.slice(0, 3).map(g => {
                        const isSelected = selectedGuide?.id === g.id;
                        return (
                          <div
                            key={g.id}
                            onClick={() => setSelectedGuide(g)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-purple-500 shadow-xs' 
                                : 'hover:border-purple-400'
                            }`}
                            style={{
                              backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.08)' : 'var(--bg-elevated)',
                              borderColor: isSelected ? '#A855F7' : 'var(--border-default)'
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs" style={{ color: 'var(--text-heading)' }}>{g.name}</span>
                                {isSelected && (
                                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-purple-600 text-white flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Selected
                                  </span>
                                )}
                              </div>
                              <span className="font-extrabold text-sm text-purple-600">₹{(g.pricePerDay * days).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                              <span>₹{g.pricePerDay.toLocaleString('en-IN')}/day</span>
                              <span>•</span>
                              <span className="text-amber-600 font-semibold">★ {g.trustScore || 95}% Verified</span>
                              {g.languages && <span>• {g.languages.slice(0, 2).join(', ')}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* COST SUMMARY + FINALIZE */}
                  <div 
                    className="rounded-2xl p-4.5 border transition-all mt-2 shadow-xs" 
                    style={{ 
                      backgroundColor: 'var(--bg-surface)', 
                      borderColor: serviceRemaining < 0 ? 'var(--status-danger)' : 'var(--border-default)' 
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                        Services Cost Breakdown
                      </p>
                      <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        Spendable: ₹{serviceSpendableBudget.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs mb-3.5">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                          <Car className="w-3.5 h-3.5 text-amber-600" /> Transport
                        </span>
                        <span className="font-semibold">₹{tCost.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                          <Bed className="w-3.5 h-3.5 text-blue-500" /> Accommodation
                        </span>
                        <span className="font-semibold">₹{sCost.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                          <Utensils className="w-3.5 h-3.5 text-emerald-500" /> Dining & Food
                        </span>
                        <span className="font-semibold">₹{fCost.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                          <UserCheck className="w-3.5 h-3.5 text-purple-500" /> Guide Services
                        </span>
                        <span className="font-semibold">₹{gCost.toLocaleString('en-IN')}</span>
                      </div>

                      {/* Total line */}
                      <div className="flex justify-between items-center pt-2 border-t font-bold text-sm" style={{ borderColor: 'var(--border-default)' }}>
                        <span style={{ color: 'var(--text-heading)' }}>Total Estimated Cost</span>
                        <span className={serviceRemaining < 0 ? 'text-rose-600' : 'text-amber-600'}>
                          ₹{servicesTotalCost.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar for Budget */}
                    <div className="mb-3.5">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            serviceRemaining < 0 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.round((servicesTotalCost / (serviceSpendableBudget || 1)) * 100))}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1.5 text-[11px]">
                        <span style={{ color: 'var(--text-tertiary)' }}>
                          {Math.round((servicesTotalCost / (serviceSpendableBudget || 1)) * 100)}% of spendable
                        </span>
                        <span className={`font-bold ${serviceRemaining < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                          {serviceRemaining < 0 
                            ? `₹${Math.abs(serviceRemaining).toLocaleString('en-IN')} Exceeded` 
                            : `₹${serviceRemaining.toLocaleString('en-IN')} Buffer Remaining`}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleFinalizeTrip}
                      className="w-full py-3 rounded-xl text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.01] cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #d97706, #ea580c)' }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Finalize Trip & View Itinerary</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Budget Stats Row (always visible below tabs) */}
          <div
            className="rounded-2xl border shadow-xs p-4 grid grid-cols-1 md:grid-cols-3 gap-4"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
          >
            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
              <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Total Distance</span>
              <p className="font-extrabold text-base mt-0.5" style={{ color: 'var(--text-heading)' }}>
                {trip.summary?.totalDistanceKm || 380} {trip.units}
              </p>
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                Mode: {selectedTransport?.carrier || 'Own Vehicle'} ({trip.isOneWay ? 'One Way' : 'Round Trip'})
              </span>
            </div>
            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
              <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Emergency Reserve</span>
              <p className="font-extrabold text-base text-emerald-600 mt-0.5">₹{trip.emergencyReserve.toLocaleString('en-IN')}</p>
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Protected & untouched</span>
            </div>
            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
              <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Remaining Spendable</span>
              <p className={`font-extrabold text-base mt-0.5 ${remainingSpendable < 0 ? 'text-rose-600' : 'text-amber-600 dark:text-amber-400'}`}>
                ₹{remainingSpendable.toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Limit: ₹{spendableBudget.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trip Setup Drawer Modal (F01) ─────────────────────────────────── */}
      <AnimatePresence>
        {isSetupDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <h3 className="font-heritage font-extrabold text-base" style={{ color: 'var(--text-heading)' }}>
                  Trip Setup & Preferences (F01)
                </h3>
                <button
                  onClick={() => setIsSetupDrawerOpen(false)}
                  className="text-lg font-bold cursor-pointer"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Trip Name</label>
                  <input
                    type="text"
                    value={trip.title}
                    onChange={(e) => setTrip(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Total Budget (₹)</label>
                    <input
                      type="number"
                      step="500"
                      value={trip.budgetLimit}
                      onChange={(e) => setTrip(prev => ({ ...prev, budgetLimit: Number(e.target.value) }))}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Emergency Reserve (₹)</label>
                    <input
                      type="number"
                      step="500"
                      value={trip.emergencyReserve}
                      onChange={(e) => setTrip(prev => ({ ...prev, emergencyReserve: Number(e.target.value) }))}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-emerald-600 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Travelers Count</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={trip.travelersCount}
                      onChange={(e) => setTrip(prev => ({ ...prev, travelersCount: Number(e.target.value) }))}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Days Count</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={trip.daysCount}
                      onChange={(e) => setTrip(prev => ({ ...prev, daysCount: Number(e.target.value) }))}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Units</label>
                    <select
                      value={trip.units}
                      onChange={(e) => setTrip(prev => ({ ...prev, units: e.target.value }))}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value="km">Kilometres (km)</option>
                      <option value="miles">Miles (mi)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Currency</label>
                    <select
                      value={trip.currency}
                      onChange={(e) => setTrip(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={trip.isOneWay}
                      onChange={(e) => setTrip(prev => ({ ...prev, isOneWay: e.target.checked }))}
                      className="rounded text-amber-600 focus:ring-0 cursor-pointer"
                    />
                    <span>One-Way Trip Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={trip.openEnded}
                      onChange={(e) => setTrip(prev => ({ ...prev, openEnded: e.target.checked }))}
                      className="rounded text-amber-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Open-ended end date</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => setIsSetupDrawerOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsSetupDrawerOpen(false);
                    pushHistory(trip);
                    triggerRecalculate(trip, true);
                  }}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-brand transition-colors cursor-pointer"
                >
                  Save & Recalculate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Add Stop Modal (F02 / F03) ─────────────────────────────────────── */}
      <AnimatePresence>
        {isAddStopModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 border"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <h3 className="font-heritage font-extrabold text-sm" style={{ color: 'var(--text-heading)' }}>
                  Add Destination or Route Waypoint
                </h3>
                <button
                  onClick={() => setIsAddStopModalOpen(false)}
                  className="font-bold cursor-pointer"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateStopSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Stop Name / Landmark</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Badami Cave Temples"
                    value={newStopForm.name}
                    onChange={(e) => setNewStopForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={newStopForm.category}
                      onChange={(e) => setNewStopForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value="ATTRACTION">Attraction / POI</option>
                      <option value="HOTEL">Hotel / Stay</option>
                      <option value="RESTAURANT">Dining / Food</option>
                      <option value="WAYPOINT">Route Rest Stop</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Dwell Duration</label>
                    <select
                      value={newStopForm.durationMinutes}
                      onChange={(e) => setNewStopForm(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value="30">30 mins</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="240">Half day (4h)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newStopForm.lat}
                      onChange={(e) => setNewStopForm(prev => ({ ...prev, lat: Number(e.target.value) }))}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newStopForm.lng}
                      onChange={(e) => setNewStopForm(prev => ({ ...prev, lng: Number(e.target.value) }))}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="Entry fee, hours, special tips..."
                    value={newStopForm.notes}
                    onChange={(e) => setNewStopForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddStopModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-brand transition-colors cursor-pointer"
                  >
                    Add to Timeline
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
