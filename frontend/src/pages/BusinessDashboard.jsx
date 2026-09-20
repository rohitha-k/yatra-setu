import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Star, AlertTriangle, Compass, CheckCircle2, MessageSquareText, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { API } from '../services/api';

export default function BusinessDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.getBusinessDashboard().then(res => {
      setData(res);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-slate-500 italic">
        Loading business metrics...
      </div>
    );
  }

  // Recharts configurations
  const sentimentData = [
    { name: 'Positive', value: data.sentiment_positive_pct, color: '#10B981' },
    { name: 'Neutral', value: data.sentiment_neutral_pct, color: '#F59E0B' },
    { name: 'Negative', value: data.sentiment_negative_pct, color: '#EF4444' }
  ];

  const occupancyChartData = [
    { name: 'Mon', Occupancy: 62, Capacity: 100 },
    { name: 'Tue', Occupancy: 58, Capacity: 100 },
    { name: 'Wed', Occupancy: 65, Capacity: 100 },
    { name: 'Thu', Occupancy: 70, Capacity: 100 },
    { name: 'Fri', Occupancy: 84, Capacity: 100 },
    { name: 'Sat', Occupancy: 96, Capacity: 100 },
    { name: 'Sun', Occupancy: data.occupancy_rate_pct, Capacity: 100 }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Business Demand Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Predictive local booking analytics, occupancy trends, and NLP customer review insights.
          </p>
        </div>

        {/* Business Type tag */}
        <div className="bg-cyan-950/40 border border-cyan-800/30 px-3 py-1.5 rounded-lg text-xs text-cyan-400 font-semibold uppercase">
          Portal: Accommodation Operator
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-5 border border-white/5 space-y-1">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Active Bookings</p>
          <p className="text-2xl font-extrabold text-white">{data.bookings_count}</p>
          <p className="text-[10px] text-slate-500 font-medium">Currently registered check-ins</p>
        </div>

        <div className="glass rounded-xl p-5 border border-white/5 space-y-1">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Occupancy Rate</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{data.occupancy_rate_pct}%</span>
            <span className="text-[10px] text-brand-secondary font-bold">Stable</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Out of total active room counts</p>
        </div>

        <div className="glass rounded-xl p-5 border border-white/5 space-y-1">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Weekend Demand Forecast</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-brand-primary">+{data.demand_forecast_pct}%</span>
            <span className="text-[10px] text-brand-primary font-bold">High Surge</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">AI forecast compared to last weekend</p>
        </div>

        <div className="glass rounded-xl p-5 border border-cyan-500/10 space-y-1 bg-cyan-950/10 glow-cyan">
          <p className="text-[10px] text-slate-300 uppercase font-semibold">Predicted Month Revenue</p>
          <p className="text-2xl font-extrabold text-cyan-400">₹{Math.round(data.predicted_revenue).toLocaleString()}</p>
          <p className="text-[10px] text-cyan-500/80 font-medium">Including redirected flow boost</p>
        </div>
      </div>

      {/* Grid: Charts vs Recommendations */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Occupancy Trend & Sentiment Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Occupancy Chart */}
          <div className="glass rounded-xl p-5 border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Weekly Occupancy Ratio vs Safe Capacity</h3>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyChartData}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.08)' }} 
                    labelStyle={{ color: '#F8FAFC' }}
                  />
                  <Bar dataKey="Occupancy" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sentiment Analysis Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="glass rounded-xl p-5 border border-white/5 flex flex-col justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">NLP Review Sentiment Analysis</h3>
              <div className="h-[140px] flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      innerRadius={45}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center text */}
                <div className="absolute text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Positive</p>
                  <p className="text-sm font-extrabold text-emerald-400">{data.sentiment_positive_pct}%</p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex justify-around text-[10px] mt-2 border-t border-white/5 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-300 font-medium">Positive ({data.sentiment_positive_pct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-300 font-medium">Neutral ({data.sentiment_neutral_pct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-300 font-medium">Negative ({data.sentiment_negative_pct}%)</span>
                </div>
              </div>
            </div>

            {/* Complaints */}
            <div className="glass rounded-xl p-5 border border-white/5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  Top Extracted NLP Complaints
                </h3>
                <div className="space-y-2.5 text-xs text-slate-400">
                  {data.top_complaints.map((c, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-slate-950/30 p-2 border border-white/5 rounded">
                      <span className="text-rose-500 font-bold">#{idx+1}</span>
                      <p>{c}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 italic mt-3">
                Extracted from recent traveler text feedback utilizing topic sentiment filters.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: AI Insights and Staffing Suggestions */}
        <div className="glass-premium rounded-xl p-5 border border-cyan-500/10 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquareText className="w-4 h-4 text-cyan-400" />
              AI Advisory Insights
            </h3>
            
            <div className="space-y-4 text-xs">
              {data.ai_insights.map((insight, idx) => (
                <div key={idx} className="flex gap-2.5 bg-slate-900/60 border border-slate-800 p-3 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-slate-300 leading-normal">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-4">
            <h4 className="text-[11px] text-slate-500 uppercase font-semibold">Recommended Staffing Levels</h4>
            <div className="flex items-center justify-between mt-2 bg-slate-950/60 border border-white/5 px-4 py-2.5 rounded-lg">
              <span className="text-xs text-slate-300 font-bold">Standard Staffing:</span>
              <span className="text-sm font-extrabold text-cyan-400">8 shifts</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal mt-2">
              Based on predicted weekend demand increases, maintaining active shifts prevents customer delays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
