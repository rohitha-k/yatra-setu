import React, { useState, useEffect } from 'react';
import { Shield, Video, DollarSign, ListTodo, Activity, Star, AlertTriangle, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { API } from '../services/api';

export default function VendorDashboard() {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [price, setPrice] = useState(1200);
  
  // Video recording simulation
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [msg, setMsg] = useState('');

  const fetchVendorData = async () => {
    try {
      const prof = await API.getVendorProfile();
      setProfile(prof);
      setPrice(prof.type === 'HOTEL' ? 1200 : (prof.type === 'RESTAURANT' ? 200 : 800));

      const list = await API.getVendorBookings();
      setBookings(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, []);

  const handlePriceUpdate = (e) => {
    e.preventDefault();
    setMsg("Inventory pricing updated successfully!");
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSimulateVideo = () => {
    setRecording(true);
    setMsg("Simulating camera recording with GPS coordinate capture...");
    
    setTimeout(() => {
      setRecording(false);
      const simulatedUrl = "https://travexa.gov.in/walkthroughs/v_" + Math.round(Math.random()*100) + ".mp4";
      setVideoUrl(simulatedUrl);
      
      API.submitWalkthroughVideo(simulatedUrl).then(() => {
        fetchVendorData();
        setMsg("Verification walkthrough video uploaded. Status set to UNDER_REVIEW.");
        setTimeout(() => setMsg(''), 4000);
      });
    }, 2000);
  };

  if (!profile) return <div className="text-center text-xs py-12" style={{ color: 'var(--text-muted)' }}>Loading...</div>;

  // Chart Data preparation (Section 3 - Recharts)
  const revenueData = [
    { day: 'Mon', revenue: 2400 },
    { day: 'Tue', revenue: 3600 },
    { day: 'Wed', revenue: 1800 },
    { day: 'Thu', revenue: 4800 },
    { day: 'Fri', revenue: 5400 },
    { day: 'Sat', revenue: 7200 },
    { day: 'Sun', revenue: 6400 }
  ];

  return (
    <div className="space-y-6" style={{ backgroundColor: 'var(--bg-surface)', minHeight: '100vh', padding: '24px' }}>
      {/* Title */}
      <div className="flex justify-between items-end border-b pb-4" style={{ borderColor: 'var(--border-default)' }}>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
            <Shield className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
            {profile.name || 'Vendor Dashboard'}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            <span className="font-semibold uppercase tracking-wider text-xs mr-2 border px-2 py-0.5 rounded-full" style={{ borderColor: 'var(--border-default)' }}>{profile.type || 'PARTNER'}</span>
            Manage your service pricing, check booking reservations, and upload documents.
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Trust Score</div>
          <div className="text-2xl font-bold" style={{ color: 'var(--status-success)' }}>94/100</div>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded text-sm font-medium border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' }}>
          {msg}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border flex items-center justify-between" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
          <div>
            <div className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Total Bookings</div>
            <div className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>{bookings.length || 0}</div>
          </div>
          <ListTodo className="w-8 h-8 opacity-50" style={{ color: 'var(--brand-primary)' }} />
        </div>
        <div className="p-4 rounded-xl border flex items-center justify-between" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
          <div>
            <div className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Active Complaints</div>
            <div className="text-xl font-bold" style={{ color: 'var(--status-danger)' }}>0</div>
          </div>
          <AlertTriangle className="w-8 h-8 opacity-50" style={{ color: 'var(--status-danger)' }} />
        </div>
        <div className="p-4 rounded-xl border flex items-center justify-between" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
          <div>
            <div className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Avg Review</div>
            <div className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>4.8</div>
          </div>
          <Star className="w-8 h-8 opacity-50" style={{ color: 'var(--status-warning)' }} />
        </div>
        <div className="p-4 rounded-xl border flex items-center justify-between" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
          <div>
            <div className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Performance</div>
            <div className="text-xl font-bold" style={{ color: 'var(--status-success)' }}>+12%</div>
          </div>
          <TrendingUp className="w-8 h-8 opacity-50" style={{ color: 'var(--status-success)' }} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Verification & Trust Status */}
        <div className="rounded-xl p-5 border space-y-4" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>Verification Status</h3>
          
          <div className="rounded-lg p-4 border space-y-2 text-center" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>Current State</span>
            <div className="font-extrabold text-lg" style={{ color: profile.verificationStatus === 'VERIFIED' ? 'var(--status-success)' : 'var(--status-warning)' }}>
              {profile.verificationStatus}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-2 rounded border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
              <span className="text-xs font-semibold flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                <Shield className="w-4 h-4" style={{ color: 'var(--status-success)' }} /> Verified Badge
              </span>
              <span className="px-2 py-1 rounded text-[10px] font-bold border" style={{ 
                color: profile.verificationStatus === 'VERIFIED' ? 'var(--status-success)' : 'var(--text-muted)',
                borderColor: profile.verificationStatus === 'VERIFIED' ? 'var(--status-success)' : 'var(--border-default)',
                backgroundColor: 'transparent'
              }}>
                {profile.verificationStatus === 'VERIFIED' ? 'UNLOCKED' : 'LOCKED'}
              </span>
            </div>
          </div>
        </div>

        {/* Walkthrough Video upload */}
        <div className="rounded-xl p-5 border space-y-4" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
            <Video className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
            Walkthrough Video Audit
          </h3>
          
          <div className="rounded aspect-video border flex items-center justify-center text-center p-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
            {recording ? (
              <span className="text-xs font-semibold animate-pulse" style={{ color: 'var(--text-muted)' }}>RECORDING AUDIT...</span>
            ) : profile.walkthroughVideoUrl || videoUrl ? (
              <span className="text-xs font-bold" style={{ color: 'var(--status-success)' }}>✓ Video Uploaded</span>
            ) : (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No walkthrough captured yet.</span>
            )}
          </div>

          <button 
            onClick={handleSimulateVideo} 
            disabled={recording}
            className="w-full py-2 disabled:opacity-50 font-bold text-xs rounded transition-all"
            style={{ backgroundColor: 'var(--brand-primary)', color: '#000' }}
          >
            Record Walkthrough Evidence
          </button>
        </div>

        {/* Bookings */}
        <div className="rounded-xl p-5 border space-y-4" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
            <ListTodo className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
            Recent Bookings
          </h3>

          <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
            {bookings.length === 0 && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>No bookings found.</div>}
            {bookings.map(b => (
              <div key={b.id || b._id} className="border rounded p-3 text-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
                <div className="flex justify-between font-bold mb-1" style={{ color: 'var(--text-heading)' }}>
                  <span>{b.clientName}</span>
                  <span style={{ color: 'var(--status-success)' }}>{b.status}</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  <span>Date: {b.date || b.bookingDate}</span>
                  <span className="font-semibold" style={{ color: 'var(--text-heading)' }}>Amount: ₹{b.totalAmount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recharts Booking Volume */}
        <div className="rounded-xl p-5 border lg:col-span-2 space-y-4" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
            <Activity className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} /> Revenue Flow History
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '6px' }}
                  itemStyle={{ color: 'var(--brand-primary)', fontSize: '12px' }}
                  labelStyle={{ color: 'var(--text-heading)', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--brand-primary)" fill="var(--brand-primary)" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints and Pricing Form Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Complaints Section Mock */}
          <div className="rounded-xl p-5 border space-y-4" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <AlertTriangle className="w-4 h-4" style={{ color: 'var(--status-danger)' }} />
              Complaint Management
            </h3>
            <div className="text-center p-4 border border-dashed rounded" style={{ borderColor: 'var(--border-default)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No active complaints to display. Keep up the good work!</span>
            </div>
          </div>

          {/* Pricing Form */}
          <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <DollarSign className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
              Update Price List
            </h3>
            <form onSubmit={handlePriceUpdate} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs uppercase font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>Price per day/seat/night (INR)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-heading)' }} />
              </div>
              <button type="submit" className="py-2.5 px-6 font-bold text-sm rounded transition-colors w-full" style={{ backgroundColor: 'var(--text-heading)', color: 'var(--bg-surface)' }}>
                Save Pricing
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
