import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, ShieldAlert, Sparkles, MapPin, Gauge, Info, HelpCircle, ArrowRight, Eye, RefreshCw, BarChart, Settings, Sliders } from 'lucide-react';
import { ResponsiveContainer, BarChart as RechartBarChart, Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { API } from '../services/api';

export default function AuthorityCommandCenter() {
  const [metrics, setMetrics] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [selectedDest, setSelectedDest] = useState(null);
  
  // Interactive Flow States for SIH Demo
  const [loadingAlts, setLoadingAlts] = useState(false);
  const [alternatives, setAlternatives] = useState([]);
  const [simMode, setSimMode] = useState(false);
  const [redistributePct, setRedistributePct] = useState(30); // 30% load shifting default
  const [simulationData, setSimulationData] = useState(null);
  const [opportunities, setOpportunities] = useState([]);

  // Fetch Dashboard Stats on load
  useEffect(() => {
    API.getAuthorityDashboard().then(setMetrics).catch(console.error);
    API.getDestinations().then(res => {
      const enriched = (res || []).map(d => ({
        ...d,
        current_tourists: d.current_tourists || (d.name === 'Goa' ? 14200 : (d.name === 'Tirupati' ? 23500 : (d.name === 'Varanasi' ? 18900 : 3800))),
        safe_capacity: d.safe_capacity || (d.name === 'Goa' ? 15000 : (d.name === 'Tirupati' ? 25000 : (d.name === 'Varanasi' ? 20000 : 6000)))
      }));
      setDestinations(enriched);
      // Auto-select Goa as default crowded destination for SIH demo flow
      const goa = enriched.find(d => d.name === 'Goa') || enriched[0];
      if (goa) handleSelectDestination(goa);
    }).catch(console.error);
  }, []);

  const handleSelectDestination = (dest) => {
    setSelectedDest(dest);
    setAlternatives([]);
    setSimMode(false);
    setSimulationData(null);
    setOpportunities([]);
  };

  // Step 5: Find Alternative Destinations
  const handleFindAlternatives = async () => {
    if (!selectedDest) return;
    setLoadingAlts(true);
    try {
      const alts = await API.getAlternatives(selectedDest.id);
      setAlternatives(alts);
      
      // Load business opportunities
      const ops = await API.getBusinessOpportunities(selectedDest.id);
      setOpportunities(ops);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAlts(false);
    }
  };

  // Step 7: Simulate Redistribution
  useEffect(() => {
    if (!selectedDest || !simMode) return;
    
    // Call Twin Simulation API
    API.simulateTwin(selectedDest.id, redistributePct).then(setSimulationData).catch(console.error);
  }, [selectedDest, simMode, redistributePct]);

  if (!metrics || destinations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-slate-500 italic">
        Loading Command Center...
      </div>
    );
  }

  // Visual markers based on capacity utilization
  const getCapacityColor = (current, capacity) => {
    const ratio = current / capacity;
    if (ratio >= 0.90) return 'text-rose-500 border-rose-500 bg-rose-950/20'; // Overcrowded
    if (ratio >= 0.75) return 'text-amber-500 border-amber-500 bg-amber-950/20'; // High Demand
    return 'text-emerald-500 border-emerald-500 bg-emerald-950/20'; // Healthy
  };

  const getCapacityBadge = (current, capacity) => {
    const ratio = current / capacity;
    if (ratio >= 0.90) return { label: '🔴 Overcrowded', style: 'text-rose-400 bg-rose-950/40 border border-rose-500/30' };
    if (ratio >= 0.75) return { label: '🟠 High Demand', style: 'text-amber-400 bg-amber-950/40 border border-amber-500/30' };
    return { label: '🟢 Healthy', style: 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30' };
  };

  // Mock comparison chart data
  const comparisonData = [
    { name: 'Goa', Tourists: 13800, Capacity: 15000 },
    { name: 'Araku Valley', Tourists: 1200, Capacity: 4000 },
    { name: 'Vizag', Tourists: 4200, Capacity: 10000 },
    { name: 'Tirupati', Tourists: 23500, Capacity: 25000 },
    { name: 'Ooty', Tourists: 4600, Capacity: 5000 }
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Tourism Intelligence Command Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time capacity tracking, predictive demand warning thresholds, and flow redistribution simulators.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs text-slate-300 font-semibold uppercase">Live Monitor Active</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-5 border border-white/5 space-y-1">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Active Tourists</p>
          <p className="text-2xl font-extrabold text-white">{metrics.total_tourists_today.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500">Tracked across 10 major hubs today</p>
        </div>

        <div className="glass rounded-xl p-5 border border-white/5 space-y-1">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Average Hotel Occupancy</p>
          <p className="text-2xl font-extrabold text-white">{metrics.average_hotel_occupancy_pct}%</p>
          <p className="text-[10px] text-slate-500">Commercial lodging occupancy level</p>
        </div>

        <div className="glass rounded-xl p-5 border border-white/5 space-y-1">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Overcrowd Risks Flagged</p>
          <p className="text-2xl font-extrabold text-rose-500">{metrics.high_risk_destinations.length}</p>
          <p className="text-[10px] text-slate-500">Destinations exceeding 90% capacity</p>
        </div>

        <div className="glass rounded-xl p-5 border border-cyan-500/10 space-y-1 bg-cyan-950/10 glow-cyan">
          <p className="text-[10px] text-cyan-300 uppercase font-semibold">Tracked Tourism Revenue</p>
          <p className="text-2xl font-extrabold text-cyan-400">₹{Math.round(metrics.total_revenue_today / 1000000)}M</p>
          <p className="text-[10px] text-cyan-500/80">Calculated regional economic impact</p>
        </div>
      </div>

      {/* Main Interactive Workspace */}
      <div className="grid lg:grid-cols-5 gap-8 items-stretch">
        
        {/* Left 2 Cols: Live Tourism Map list */}
        <div className="lg:col-span-2 glass rounded-xl p-5 border border-white/5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Destination Density Monitor</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Select a destination to initiate the flow-matching sequence.</p>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {destinations.map(d => {
              const utilPct = Math.round((d.current_tourists / d.safe_capacity) * 100);
              const badge = getCapacityBadge(d.current_tourists, d.safe_capacity);
              return (
                <button
                  key={d.id}
                  onClick={() => handleSelectDestination(d)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                    selectedDest?.id === d.id 
                      ? 'bg-cyan-950/20 border-cyan-500/40 glow-cyan' 
                      : 'bg-slate-900/40 border-white/5 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{d.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {d.current_tourists.toLocaleString()} / {d.safe_capacity.toLocaleString()} visitors
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.style}`}>
                      {badge.label.split(' ')[1]}
                    </span>
                    <span className="text-[10px] text-slate-500">{utilPct}% full</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 3 Cols: AI Redirection Panel (SIH Demo Steps 3 - 10) */}
        <div className="lg:col-span-3 glass-premium rounded-xl p-5 border border-cyan-500/15 flex flex-col justify-between space-y-6">
          {selectedDest ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              
              {/* Step 3 & 4: Destination Capacity Alert */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-4.5 h-4.5 text-cyan-400" />
                    Intelligence for {selectedDest.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedDest.category} hub</p>
                </div>
                
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getCapacityColor(selectedDest.current_tourists, selectedDest.safe_capacity)}`}>
                  {Math.round((selectedDest.current_tourists / selectedDest.safe_capacity) * 100)}% capacity utilized
                </span>
              </div>

              {/* Overcrowding Check Alert */}
              {selectedDest.current_tourists / selectedDest.safe_capacity >= 0.90 && (
                <div className="bg-rose-950/20 border border-rose-500/30 text-rose-300 p-3 rounded-lg flex items-start gap-2.5 text-xs leading-relaxed animate-pulse">
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold uppercase text-[10px]">AI ALERT DETECTED: Capacity Imbalance</strong>
                    <p className="mt-0.5">Predicted weekend traveler demand exceeds safe capacity threshold by {Math.round((selectedDest.current_tourists / selectedDest.safe_capacity) * 100 - 100)}%.</p>
                  </div>
                </div>
              )}

              {/* Action 1: Find Alternative Destinations */}
              {alternatives.length === 0 ? (
                <div className="text-center py-6">
                  <button 
                    onClick={handleFindAlternatives}
                    disabled={loadingAlts}
                    className="px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs transition-all glow-cyan flex items-center gap-1.5 mx-auto"
                  >
                    <Sparkles className="w-4 h-4" />
                    {loadingAlts ? "Evaluating flow coefficients..." : "Find Alternative Destinations"}
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Alternatives List */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      AI Recommended Alternatives
                    </h4>
                    
                    <div className="grid md:grid-cols-3 gap-3">
                      {alternatives.map(alt => (
                        <div key={alt.destination_id} className="bg-slate-950/50 border border-slate-800 rounded p-3 text-xs flex flex-col justify-between space-y-2">
                          <div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white">{alt.name}</span>
                              <span className="text-[10px] text-cyan-400 font-extrabold">{alt.final_score}/100</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">{alt.distance_km} km away</p>
                          </div>
                          
                          <div className="space-y-1 border-t border-white/5 pt-1.5 text-[9px] text-slate-400">
                            <div className="flex justify-between"><span>Similarity:</span><span className="text-slate-300 font-medium">{alt.similarity_score}%</span></div>
                            <div className="flex justify-between"><span>Crowd Reduction:</span><span className="text-brand-secondary font-bold">-{alt.crowd_reduction_score}%</span></div>
                            <div className="flex justify-between"><span>Cost Savings:</span><span className="text-slate-300 font-medium">-{alt.cost_advantage_score}%</span></div>
                          </div>

                          <p className="text-[9px] text-slate-500 leading-normal italic pt-1">{alt.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 7: Simulate Redistribution */}
                  {!simMode ? (
                    <div className="text-center">
                      <button 
                        onClick={() => setSimMode(true)}
                        className="px-4 py-2 rounded border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-400 text-xs font-bold transition-all"
                      >
                        Simulate Redistribution
                      </button>
                    </div>
                  ) : (
                    <div className="border-t border-white/5 pt-4 space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                        <Sliders className="w-4 h-4 text-cyan-400" />
                        Simulate Flow Redistribution Vector
                      </h4>

                      {/* Slider Control */}
                      <div className="flex items-center gap-4 bg-slate-950/30 p-3 rounded-lg border border-white/5">
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                            <span>SHIFT VISITOR LOAD:</span>
                            <span className="text-cyan-400 font-bold">{redistributePct}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={redistributePct} 
                            onChange={(e) => setRedistributePct(parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                        </div>
                      </div>

                      {/* Before / After results */}
                      {simulationData && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-slate-900/50 p-3 rounded border border-white/5 text-xs space-y-1.5">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">BEFORE (Peak Imbalance)</span>
                            <div className="flex justify-between font-bold"><span>Concentration Density:</span><span className="text-rose-400">{simulationData.metrics_before.crowding}%</span></div>
                            <div className="flex justify-between"><span>Lodging Occupancy:</span><span>{simulationData.metrics_before.hotel_occupancy}%</span></div>
                            <div className="flex justify-between"><span>Traffic Pressure:</span><span className="text-rose-400">{simulationData.metrics_before.traffic_pressure}</span></div>
                          </div>

                          <div className="bg-cyan-950/10 p-3 rounded border border-cyan-500/20 text-xs space-y-1.5 glow-cyan">
                            <span className="text-[10px] text-cyan-400 uppercase font-bold">AFTER REDISTRIBUTION</span>
                            <div className="flex justify-between font-bold"><span>Concentration Density:</span><span className="text-emerald-400">{simulationData.metrics_after.crowding}%</span></div>
                            <div className="flex justify-between"><span>Lodging Occupancy:</span><span>{simulationData.metrics_after.hotel_occupancy}%</span></div>
                            <div className="flex justify-between"><span>Traffic Pressure:</span><span className="text-emerald-400">{simulationData.metrics_after.traffic_pressure}</span></div>
                          </div>
                        </div>
                      )}

                      {/* Step 8 & 9: Local Businesses Benefiting */}
                      {opportunities.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-[10px] text-slate-400 uppercase font-bold">Redistribution Business Benefits (Local economic boost)</h5>
                          <div className="grid md:grid-cols-3 gap-2">
                            {opportunities.map(op => (
                              <div key={op.business_id} className="bg-slate-950/40 p-2.5 rounded border border-white/5 text-[10px] space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-slate-200">{op.name.split(' ')[0]} {op.type}</span>
                                  <span className="text-brand-secondary font-bold">{op.opportunity_score} Op Score</span>
                                </div>
                                <p className="text-slate-400 leading-normal text-[9px]">{op.recommended_action}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 10: Authority Recommendations */}
                      {simulationData && (
                        <div className="bg-cyan-950/20 border border-cyan-800/30 p-3 rounded-lg text-xs leading-relaxed text-cyan-300">
                          <strong className="font-bold uppercase text-[9px] tracking-wide block">AI DECISION ADVISORY RECOMMENDATION:</strong>
                          <p className="mt-0.5">{simulationData.ai_advice} Route tourist flows to Araku Valley and promote regional cultural operators.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1 text-slate-500 italic text-xs">
              Select a destination hub from the monitor side-panel to review flow coefficients.
            </div>
          )}
        </div>
      </div>

      {/* Global Dashboard analytics comparisons */}
      <section className="glass rounded-xl p-5 border border-white/5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ecosystem Demand vs Safe Carrying Capacity Comparison</h3>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartBarChart data={comparisonData}>
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.08)' }} 
                labelStyle={{ color: '#F8FAFC' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Tourists" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Capacity" fill="#10B981" radius={[4, 4, 0, 0]} />
            </RechartBarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
