import React from 'react';
import { ShieldCheck, Award, Shield, FileText, Video, ThumbsUp, DollarSign, AlertCircle, Eye, CheckCircle2 } from 'lucide-react';

export default function TrustVerification() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 py-10 px-4 animate-fade-in-up">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 mb-2">
          <ShieldCheck className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-4xl font-extrabold" style={{ color: 'var(--text-heading)' }}>
          YatraSetu <span className="text-amber-500">Trust & Verification</span>
        </h2>
        <p className="text-base text-slate-400 leading-relaxed">
          Discover how our platform ensures safety, transparency, and high quality for every journey by strictly auditing local tourism partners.
        </p>
      </div>

      {/* Trust Badges Breakdown */}
      <div 
        className="rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden"
        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex items-center gap-3 border-b border-white/5 pb-6 mb-8 relative z-10">
          <Award className="w-6 h-6 text-amber-500" />
          <h3 className="text-xl font-extrabold tracking-wide" style={{ color: 'var(--text-heading)' }}>Our Triple-Badge Verification Standards</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          
          <div className="bg-slate-900/50 p-8 border border-white/5 rounded-2xl text-center space-y-5 transition-transform hover:-translate-y-2 hover:shadow-xl hover:border-emerald-500/30 group">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <strong className="block text-lg font-bold" style={{ color: 'var(--text-heading)' }}>Verified Identity</strong>
            <p className="text-sm text-slate-400 leading-relaxed">
              Awarded to service providers who pass complete GSTIN verification, official tourism business license verification, and authority background reviews.
            </p>
          </div>

          <div className="bg-slate-900/50 p-8 border border-white/5 rounded-2xl text-center space-y-5 transition-transform hover:-translate-y-2 hover:shadow-xl hover:border-cyan-500/30 group">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-8 h-8 text-cyan-400" />
            </div>
            <strong className="block text-lg font-bold" style={{ color: 'var(--text-heading)' }}>Updated & Active</strong>
            <p className="text-sm text-slate-400 leading-relaxed">
              Confirms that the vendor's active room inventory, pricing tables, operating hours, and contact channels have been verified within the last 30 days.
            </p>
          </div>

          <div className="bg-slate-900/50 p-8 border border-white/5 rounded-2xl text-center space-y-5 transition-transform hover:-translate-y-2 hover:shadow-xl hover:border-blue-500/30 group">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform">
              <Eye className="w-8 h-8 text-blue-400" />
            </div>
            <strong className="block text-lg font-bold" style={{ color: 'var(--text-heading)' }}>100% Transparent</strong>
            <p className="text-sm text-slate-400 leading-relaxed">
              Guarantees the listing contains no hidden costs, cleaning fees, or unexpected rates, backed by customer reviews and certified media records.
            </p>
          </div>

        </div>
      </div>

      {/* Grid: Additional Info */}
      <div className="grid md:grid-cols-3 gap-6">
        <div 
          className="rounded-2xl p-8 space-y-4 shadow-lg hover:shadow-xl transition-all border border-transparent hover:border-white/10"
          style={{ backgroundColor: 'var(--bg-elevated)' }}
        >
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-2">
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-base font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>Authority Auditing</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Local authority administrators review partner applications, verify licenses against municipal databases, and toggle status badges publicly for complete safety.
          </p>
        </div>
        
        <div 
          className="rounded-2xl p-8 space-y-4 shadow-lg hover:shadow-xl transition-all border border-transparent hover:border-white/10"
          style={{ backgroundColor: 'var(--bg-elevated)' }}
        >
          <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center mb-2">
            <Video className="w-6 h-6 text-pink-400" />
          </div>
          <h3 className="text-base font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>Spatial Walkthroughs</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Partners upload immersive walkthrough videos of their premises (rooms, lobbies, or vehicles) to offer travelers transparent, unfiltered views of amenities.
          </p>
        </div>
        
        <div 
          className="rounded-2xl p-8 space-y-4 shadow-lg hover:shadow-xl transition-all border border-transparent hover:border-white/10"
          style={{ backgroundColor: 'var(--bg-elevated)' }}
        >
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
            <ThumbsUp className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="text-base font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>Traveler Feedback</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Traveler ratings and reviews are linked directly to each provider card. We ensure that only authentic, verified guests can post reviews to maintain quality.
          </p>
        </div>
      </div>
    </div>
  );
}
