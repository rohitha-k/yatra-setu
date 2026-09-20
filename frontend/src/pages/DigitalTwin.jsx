import React, { useState, useEffect } from 'react';
import { Sliders, HelpCircle, Activity, LayoutGrid, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { API, MOCK_DESTINATIONS } from '../services/api';

export default function DigitalTwin() {
  const [destinations, setDestinations] = useState([]);
  const [selectedId, setSelectedId] = useState('1'); // Goa default
  const [loadPct, setLoadPct] = useState(30);
  const [results, setResults] = useState(null);

  useEffect(() => {
    API.getDestinations().then(res => {
      setDestinations(res);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    API.simulateTwin(selectedId, loadPct).then(setResults).catch(console.error);
  }, [selectedId, loadPct]);

  if (destinations.length === 0 || !results) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-slate-500 italic">
        Booting digital twin models...
      </div>
    );
  }

  // Dynamic values based on load percentage
  const chartData = [
    { name: '0%', Crowd: results.metrics_before.crowding, Hotel: results.metrics_before.hotel_occupancy },
    { name: '25%', Crowd: Math.round(results.metrics_before.crowding * 1.15), Hotel: Math.round(results.metrics_before.hotel_occupancy * 1.05) },
    { name: '50%', Crowd: Math.round(results.metrics_before.crowding * 1.3), Hotel: Math.round(results.metrics_before.hotel_occupancy * 1.1) },
    { name: '75%', Crowd: Math.round(results.metrics_before.crowding * 1.45), Hotel: Math.round(results.metrics_before.hotel_occupancy * 1.15) },
    { name: '100%', Crowd: results.metrics_after.crowding, Hotel: results.metrics_after.hotel_occupancy }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-cyan-400" />
          Destination Digital Twin & Simulation Sandbox
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          A dynamic digital twin mapping environment. Adjust visitor volumes to stress-test regional infrastructure.
        </p>
      </div>

      {/* Selector & Slider Layout */}
      <div className="grid lg:grid-cols-3 gap-8 items-stretch">
        
        {/* Sim controls */}
        <div className="glass rounded-xl p-5 border border-white/5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Simulation Settings
            </h3>

            {/* Destination Selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Select Digital Model Target</label>
              <select 
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/60 rounded px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                {destinations.map(d => (
                  <option key={d.id} value={d.id}>{d.name} Twin Model</option>
                ))}
              </select>
            </div>

            {/* Slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>SCALED VISITOR INCREASE:</span>
                <span className="text-cyan-400 font-extrabold">+{loadPct}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="100"
                value={loadPct}
                onChange={(e) => setLoadPct(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <p className="text-[9px] text-slate-500 leading-normal">
                Increases simulated checks on local hotel beds, utilities, and transit grids.
              </p>
            </div>
          </div>

          {/* AI Simulation recommendation output */}
          <div className="bg-cyan-950/20 border border-cyan-800/30 p-4 rounded-lg text-xs leading-relaxed text-cyan-300">
            <strong className="font-bold uppercase text-[9px] tracking-wide block">AI REDIRECTION THRESHOLD RECOMMENDATION:</strong>
            <p className="mt-1">{results.ai_advice}</p>
          </div>
        </div>

        {/* Digital Twin Map representation & Stress indicators */}
        <div className="lg:col-span-2 glass-premium rounded-xl p-5 border border-cyan-500/15 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Simulated Asset Metrics</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Real-time pressure readings calculated by Twin model equations.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* Asset card 1 */}
            <div className="bg-slate-950/50 p-4 border border-white/5 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-semibold">
                <span>Crowding Index</span>
                <span className={`text-[10px] font-bold ${results.metrics_after.crowding > 85 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {results.metrics_after.crowding > 85 ? 'Overlimit' : 'Nominal'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-white">{results.metrics_after.crowding}%</span>
                <span className="text-[9px] text-slate-500">Before: {results.metrics_before.crowding}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${results.metrics_after.crowding > 80 ? 'bg-rose-500' : (results.metrics_after.crowding > 50 ? 'bg-amber-500' : 'bg-emerald-500')}`}
                  style={{ width: `${results.metrics_after.crowding}%` }}
                />
              </div>
            </div>

            {/* Asset card 2 */}
            <div className="bg-slate-950/50 p-4 border border-white/5 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-semibold">
                <span>Hotel Occupancy Index</span>
                <span className="text-[10px] text-slate-300 font-bold">Loding Saturation</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-white">{results.metrics_after.hotel_occupancy}%</span>
                <span className="text-[9px] text-slate-500">Before: {results.metrics_before.hotel_occupancy}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-cyan-500"
                  style={{ width: `${results.metrics_after.hotel_occupancy}%` }}
                />
              </div>
            </div>

            {/* Asset card 3 */}
            <div className="bg-slate-950/50 p-4 border border-white/5 rounded-lg space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Grid & Transit Pressure</span>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-slate-300">Transit Load:</span>
                <span className={`font-bold ${results.metrics_after.traffic_pressure === 'High' ? 'text-rose-400' : 'text-slate-200'}`}>
                  {results.metrics_after.traffic_pressure}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Waste Level:</span>
                <span className="text-slate-200 font-medium">Medium</span>
              </div>
            </div>

            {/* Asset card 4 */}
            <div className="bg-slate-950/50 p-4 border border-white/5 rounded-lg space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Ecology & Experience</span>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-slate-300">Environmental strain:</span>
                <span className="text-slate-200 font-medium">{results.metrics_after.environmental_pressure}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Satisfaction:</span>
                <span className="text-brand-secondary font-bold">{results.metrics_after.tourist_satisfaction}/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Stress Charts */}
      <section className="glass rounded-xl p-5 border border-white/5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
          <Activity className="w-4 h-4 text-cyan-400" />
          Simulated Load Testing Curve
        </h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.08)' }} 
                labelStyle={{ color: '#F8FAFC' }}
              />
              <Area type="monotone" dataKey="Crowd" stroke="#EF4444" fill="rgba(239, 68, 68, 0.08)" strokeWidth={2} />
              <Area type="monotone" dataKey="Hotel" stroke="#06B6D4" fill="rgba(6, 182, 212, 0.08)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
