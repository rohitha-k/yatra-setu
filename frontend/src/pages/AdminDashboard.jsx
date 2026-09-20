import React, { useState, useEffect } from 'react';
import { Landmark, CheckCircle, XCircle, Users, Building, Wallet, TrendingDown, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { API } from '../services/api';

export default function AdminDashboard() {
  const [vendors, setVendors] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [msg, setMsg] = useState('');

  const fetchAdminData = async () => {
    try {
      const list = await API.getAdminVendors();
      setVendors(list);

      const stats = await API.getAdminAnalytics();
      setAnalytics(stats);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprove = async (vendorId) => {
    try {
      await API.verifyVendor(vendorId, 'VERIFIED');
      setMsg("Vendor license approved.");
      fetchAdminData();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (vendorId) => {
    try {
      await API.verifyVendor(vendorId, 'REJECTED');
      setMsg("Vendor license rejected.");
      fetchAdminData();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (!analytics) return <div className="text-center text-xs py-12" style={{ color: 'var(--text-muted)' }}>Loading Admin Console...</div>;

  // Chart Data preparation (Section 3 - Recharts)
  const chartData = [
    { name: 'Hampi', visits: 310, savings: 12500 },
    { name: 'Araku Valley', visits: 180, savings: 9400 },
    { name: 'Tirupati', visits: 140, savings: 6800 },
    { name: 'Varanasi', visits: 240, savings: 11000 },
    { name: 'Coorg', visits: 90, savings: 4500 }
  ];

  return (
    <div className="space-y-6" style={{ backgroundColor: 'var(--bg-surface)', minHeight: '100vh', padding: '24px' }}>
      {/* Title */}
      <div className="border-b pb-4" style={{ borderColor: 'var(--border-default)' }}>
        <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
          <Landmark className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
          Administration Panel
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
          Centralized authority dashboard for registration licensing, compliance auditing, and analytics.
        </p>
      </div>

      {msg && (
        <div className="p-3 rounded text-sm font-medium border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--status-success)', color: 'var(--status-success)' }}>
          {msg}
        </div>
      )}

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        <div className="rounded-xl p-5 border space-y-2 flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Tourists Listed</span>
            <Users className="w-5 h-5 opacity-70" style={{ color: 'var(--text-heading)' }} />
          </div>
          <p className="text-2xl font-black" style={{ color: 'var(--text-heading)' }}>{analytics.totalTourists}</p>
        </div>
        <div className="rounded-xl p-5 border space-y-2 flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Verified Partners</span>
            <Building className="w-5 h-5 opacity-70" style={{ color: 'var(--status-success)' }} />
          </div>
          <p className="text-2xl font-black" style={{ color: 'var(--status-success)' }}>{analytics.verifiedVendorsCount}</p>
        </div>
        <div className="rounded-xl p-5 border space-y-2 flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Avg Budget</span>
            <Wallet className="w-5 h-5 opacity-70" style={{ color: 'var(--text-heading)' }} />
          </div>
          <p className="text-2xl font-black" style={{ color: 'var(--text-heading)' }}>₹{analytics.averageTripBudget.toLocaleString()}</p>
        </div>
        <div className="rounded-xl p-5 border space-y-2 flex flex-col justify-between" style={{ backgroundColor: 'var(--brand-primary)', color: '#000', borderColor: 'var(--brand-primary)' }}>
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold tracking-wider opacity-80">Total Saved (INR)</span>
            <TrendingDown className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-black">₹{analytics.totalMoneySaved.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recharts Graphical Analytics */}
        <div className="rounded-xl p-5 border lg:col-span-2 space-y-4" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>Destination Visit Analytics</h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '6px' }}
                  itemStyle={{ color: 'var(--brand-primary)', fontSize: '12px' }}
                  labelStyle={{ color: 'var(--text-heading)', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="visits" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaint Management Mock */}
        <div className="rounded-xl p-5 border space-y-4" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
            <AlertCircle className="w-4 h-4" style={{ color: 'var(--status-danger)' }} />
            Active Complaints
          </h3>
          <div className="text-center p-6 border border-dashed rounded h-64 flex flex-col items-center justify-center" style={{ borderColor: 'var(--border-default)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>No unresolved complaints in the queue.</span>
          </div>
        </div>
      </div>

      {/* Staging applications */}
      <div className="rounded-xl p-5 border space-y-4" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>Vendor Verification Queue</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wider" style={{ borderColor: 'var(--border-default)', color: 'var(--text-tertiary)' }}>
                <th className="pb-3 px-4 font-semibold">Vendor Name</th>
                <th className="pb-3 px-4 font-semibold">Business Type</th>
                <th className="pb-3 px-4 font-semibold">Status</th>
                <th className="pb-3 px-4 font-semibold">Audit File</th>
                <th className="pb-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {vendors.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>No partners pending review.</td>
                </tr>
              )}
              {vendors.map((v) => (
                <tr key={v._id || v.id} className="border-b last:border-0 hover:bg-black/10 transition-colors" style={{ borderColor: 'var(--border-default)' }}>
                  <td className="py-4 px-4 font-bold" style={{ color: 'var(--text-heading)' }}>{v.name}</td>
                  <td className="py-4 px-4">
                    <span className="text-[10px] border px-2 py-1 rounded uppercase font-bold" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
                      {v.type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-xs" style={{ color: v.verificationStatus === 'VERIFIED' ? 'var(--status-success)' : 'var(--status-warning)' }}>
                      {v.verificationStatus}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {v.walkthroughVideoUrl ? (
                      <span className="text-xs font-semibold" style={{ color: 'var(--brand-primary)' }}>Attached</span>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>None</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    {v.verificationStatus === 'UNDER_REVIEW' && (
                      <>
                        <button onClick={() => handleApprove(v._id || v.id)} className="font-bold px-3 py-1.5 rounded text-[10px] uppercase transition-opacity hover:opacity-80 inline-flex items-center gap-1" style={{ backgroundColor: 'var(--status-success)', color: '#000' }}>
                          <CheckCircle className="w-3 h-3 inline-block" /> Approve
                        </button>
                        <button onClick={() => handleReject(v._id || v.id)} className="font-bold px-3 py-1.5 rounded text-[10px] uppercase transition-opacity hover:opacity-80 inline-flex items-center gap-1" style={{ backgroundColor: 'var(--status-danger)', color: '#fff' }}>
                          <XCircle className="w-3 h-3 inline-block" /> Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
