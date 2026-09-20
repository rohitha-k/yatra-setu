import React from 'react';
import { HelpCircle, Star, Sparkles, AlertCircle, RefreshCw, BarChart2, ShieldAlert } from 'lucide-react';

export default function WhyTourismOS() {
  const categories = [
    {
      title: "Predictive Tourism Demand",
      tourismos: "Forecasts visitor densities 7 days in advance based on seasonal lags, calendar indexes, and weather alerts.",
      traditional: "Only records historical bookings; does not forecast macro crowding waves."
    },
    {
      title: "Tourism Flow Optimization",
      tourismos: "Actively matches and redirects flows to nearby alternative hubs using experience similarity and distance algorithms.",
      traditional: "Recommends only popular, highly-congested destinations, worsening overcrowding."
    },
    {
      title: "Destination Digital Twin",
      tourismos: "Provides destination managers with stress-test sliders to simulate grids, transit, and water lines.",
      traditional: "No simulation capacity; authorities operate reactively after congestion has peaked."
    },
    {
      title: "Local Economy Intelligence",
      tourismos: "Channels redirected visitor traffic directly to small homestays, local guides, and handicraft operators.",
      traditional: "Monopolized by large commercial travel entities and aggregators."
    },
    {
      title: "Command Center and TIS",
      tourismos: "Integrates environmental pressure, local economic participation, and satisfaction into a unified Tourism Impact Score.",
      traditional: "No macro score; platforms measure success solely by booking transaction volumes."
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-cyan-400" />
          Why TourismOS?
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          TourismOS is a Tourism Decision Intelligence Platform, engineered to balance regional ecosystems.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid md:grid-cols-2 gap-8 items-start">
        
        {/* TourismOS Column */}
        <div className="glass-premium rounded-xl p-6 border-l-4 border-cyan-500 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            TourismOS Ecosystem Focus
          </h3>

          <div className="space-y-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wide">
                  {idx + 1}. {cat.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pl-3 border-l border-slate-800">
                  {cat.tourismos}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Traditional Platforms Column */}
        <div className="glass rounded-xl p-6 border-l-4 border-rose-500/40 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            Traditional Booking Platforms (OTAs)
          </h3>

          <div className="space-y-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {idx + 1}. {cat.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed pl-3 border-l border-slate-800">
                  {cat.traditional}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Advisory Statement */}
      <div className="glass rounded-xl p-5 border border-white/5 text-center max-w-3xl mx-auto">
        <p className="text-sm text-slate-300 leading-relaxed italic">
          "TourismOS does not merely help tourists travel. It helps destinations intelligently manage where tourists go, 
          when they go, how businesses prepare, and how tourism benefits are distributed."
        </p>
      </div>
    </div>
  );
}
