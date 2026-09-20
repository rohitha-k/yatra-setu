import React, { useState } from 'react';
import { Compass, Shield, Wallet, Navigation, Landmark, RefreshCw, ArrowRight, Check } from 'lucide-react';
import { getRouteDetails } from '../../services/routeService';
import { getGovernmentCircuits } from '../../services/tourismService';

// 1. CinematicHero Component
export function CinematicHero({ onStart }) {
  return (
    <div className="text-center py-12 max-w-4xl mx-auto space-y-4 relative z-10">
      <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
        <Compass className="w-3.5 h-3.5" /> Budget Decision Intelligence
      </div>
      
      <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-white leading-none">
        TRAVEXA
      </h1>
      <p className="text-sm sm:text-lg text-amber-400 uppercase tracking-widest font-extrabold">
        "Travel Smart. Travel with Confidence."
      </p>

      <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto pt-2">
        Everything you need for your journey. In one place. Plan your route, select verified homestays, and manage expenses.
      </p>

      <div className="pt-6">
        <button 
          onClick={onStart}
          className="px-8 py-3.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition-all hover:scale-105 duration-300 glow-amber flex items-center gap-2 mx-auto uppercase tracking-wider"
        >
          Explore Travexa
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// 2. IndiaTourismNetwork Component
export function IndiaTourismNetwork() {
  return (
    <div className="w-full max-w-lg h-[240px] mx-auto relative z-10 flex items-center justify-center bg-slate-950/20 rounded-xl border border-white/5 p-4">
      <svg viewBox="0 0 400 240" className="w-full h-full text-slate-700">
        <path d="M 240 70 L 160 180" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1.5" strokeDasharray="5,5" className="animate-[dash_10s_linear_infinite]" />
        <path d="M 160 180 L 220 190" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1.5" strokeDasharray="5,5" />
        <path d="M 220 190 L 260 140" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1.5" strokeDasharray="5,5" />
        <path d="M 260 140 L 240 70" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1.5" strokeDasharray="5,5" />

        {/* Nodes */}
        <circle cx="240" cy="70" r="5" fill="#F59E0B" className="animate-ping" />
        <circle cx="240" cy="70" r="3.5" fill="#F59E0B" />
        <text x="248" y="74" fill="#94A3B8" fontSize="8" fontWeight="bold">Varanasi</text>

        <circle cx="160" cy="180" r="5" fill="#EF4444" className="animate-ping" />
        <circle cx="160" cy="180" r="3.5" fill="#EF4444" />
        <text x="114" y="184" fill="#94A3B8" fontSize="8" fontWeight="bold">Hampi</text>

        <circle cx="220" cy="190" r="5" fill="#10B981" className="animate-ping" />
        <circle cx="220" cy="190" r="3.5" fill="#10B981" />
        <text x="228" y="194" fill="#94A3B8" fontSize="8" fontWeight="bold">Tirupati</text>

        <circle cx="260" cy="140" r="5" fill="#3B82F6" className="animate-ping" />
        <circle cx="260" cy="140" r="3.5" fill="#3B82F6" />
        <text x="268" y="144" fill="#94A3B8" fontSize="8" fontWeight="bold">Araku Valley</text>
      </svg>
    </div>
  );
}

// 3. ProblemSolutionStory Component
export function ProblemSolutionStory() {
  return (
    <div className="glass rounded-xl p-6 border border-white/5 text-xs max-w-4xl mx-auto space-y-4">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider text-center">How Travexa Helps Tourists</h3>
      <p className="text-slate-400 text-center max-w-xl mx-auto leading-relaxed">
        Instead of getting overwhelmed by booking multiple services across scattered sites, Travexa links verified stays, transport seats, and tourist guides under one budget dashboard.
      </p>
    </div>
  );
}

// 4. FeatureShowcase (Budget, Verified Services, Routes, Partners)
export function FeatureShowcase() {
  // Budget Demo States
  const [roomCost, setRoomCost] = useState(4500);
  const [totalUsed, setTotalUsed] = useState(11000);
  const [remainingBudget, setRemainingBudget] = useState(4000);

  const handleRoomUpgrade = () => {
    setRoomCost(5500);
    setTotalUsed(12000);
    setRemainingBudget(3000);
  };

  const handleResetUpgrade = () => {
    setRoomCost(4500);
    setTotalUsed(11000);
    setRemainingBudget(4000);
  };

  const route = getRouteDetails("Hyderabad", "Hampi", "Own Vehicle");
  const circuits = getGovernmentCircuits();

  return (
    <div className="space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-amber-500 font-bold">Showcase Overview</h3>
        <p className="text-xl sm:text-2xl font-extrabold text-white">Interactive Modules</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Plan Your Trip */}
        <div className="glass rounded-xl p-6 border border-white/5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Compass className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Plan Your Trip</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Enter target dates, travelers, and set your spending limits.
            </p>
          </div>
          <div className="bg-slate-950/60 border border-white/5 rounded p-3 text-[10px] text-slate-500">
            From: Hyderabad ➔ Destination: Hampi
          </div>
        </div>

        {/* Card 2: Find Verified Services */}
        <div className="glass rounded-xl p-6 border border-white/5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Find Verified Services</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Explore hotels, guide schedules, and drivers with clear security indicators.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            <span className="text-[8px] bg-emerald-950/30 text-brand-secondary border border-emerald-800/30 px-2 py-0.5 rounded font-bold">✓ Verified</span>
            <span className="text-[8px] bg-emerald-950/30 text-brand-secondary border border-emerald-800/30 px-2 py-0.5 rounded font-bold">✓ Updated Info</span>
            <span className="text-[8px] bg-emerald-950/30 text-brand-secondary border border-emerald-800/30 px-2 py-0.5 rounded font-bold">✓ Transparent Details</span>
          </div>
        </div>

        {/* Card 3: Manage Your Budget (Interactive Demo) */}
        <div className="glass rounded-xl p-6 border border-white/5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Manage Your Budget</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Recalculate balances automatically when changing categories.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-white/5 rounded-lg p-3 text-[10px] space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Lodging Stay:</span>
              <strong className="text-white">₹{roomCost}</strong>
            </div>
            <div className="flex justify-between font-bold text-amber-400 border-t border-white/5 pt-1.5">
              <span>Total Spent: ₹{totalUsed}</span>
              <span>Remaining: ₹{remainingBudget}</span>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleRoomUpgrade} className="bg-amber-500 text-slate-950 text-[8px] font-bold px-2 py-0.5 rounded">Upgrade (+1000)</button>
              <button onClick={handleResetUpgrade} className="bg-slate-800 text-slate-300 text-[8px] font-bold px-2 py-0.5 rounded">Reset</button>
            </div>
          </div>
        </div>

        {/* Card 4: Explore Destinations */}
        <div className="glass rounded-xl p-6 border border-white/5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Explore Destinations</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Discover cultural points, nature trails, and state promotions.
            </p>
          </div>
          <div className="bg-slate-950/60 border border-white/5 rounded p-2 text-[9px] text-slate-400 flex justify-between items-center">
            <span>🏛 {circuits[0]?.name || "Hampi Ruins"}</span>
            <span className="text-[8px] text-amber-400 font-bold uppercase">Gov Highlight</span>
          </div>
        </div>

        {/* Card 5: Smart Routes */}
        <div className="glass rounded-xl p-6 border border-white/5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Smart Routes</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Locate highway petrol pumps, safe rest stops, and mechanics.
            </p>
          </div>
          <div className="bg-slate-950/60 border border-white/5 rounded p-2 text-[9px] text-slate-500">
            NH65 Rest Plaza Oasis Stop (1.8 km off route)
          </div>
        </div>

        {/* Card 6: Tourism Partner Platform */}
        <div className="glass rounded-xl p-6 border border-white/5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Partner Network</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Local guesthouses and guides can list and manage prices directly.
            </p>
          </div>
          <div className="text-[9px] text-slate-500 font-bold uppercase">
            ✓ Dashboard Panel Staged
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. HowItWorks Component
export function HowItWorks() {
  return (
    <div className="glass rounded-xl p-6 border border-white/5 space-y-6 max-w-4xl mx-auto relative overflow-hidden">
      <div className="text-center space-y-1">
        <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">Visual Guide</span>
        <h3 className="text-sm font-bold text-white uppercase tracking-wide">How It Works</h3>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-slate-400">
        <div className="space-y-1">
          <span className="text-amber-500 font-extrabold">STEP 1</span>
          <h4 className="font-bold text-white">Tell Us Your Trip</h4>
          <p className="text-[10px]">Enter route, dates, and budget limits.</p>
        </div>
        <div className="space-y-1">
          <span className="text-amber-500 font-extrabold">STEP 2</span>
          <h4 className="font-bold text-white">Set Preferences</h4>
          <p className="text-[10px]">Select lodging types and transit choices.</p>
        </div>
        <div className="space-y-1">
          <span className="text-amber-500 font-extrabold">STEP 3</span>
          <h4 className="font-bold text-white">Explore Verified Assets</h4>
          <p className="text-[10px]">Compare prices and safety certificates.</p>
        </div>
        <div className="space-y-1">
          <span className="text-amber-500 font-extrabold">STEP 4</span>
          <h4 className="font-bold text-white">Confirm & Travel</h4>
          <p className="text-[10px]">Recalculate balances dynamically on details updates.</p>
        </div>
      </div>
    </div>
  );
}
