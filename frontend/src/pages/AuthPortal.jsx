import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Compass, Shield, Building2, User, CheckCircle, ArrowRight, ShieldAlert, Lock, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { API } from '../services/api';

export default function AuthPortal() {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  // Pick initial states from route navigation state
  const [roleMode, setRoleMode] = useState('TRAVELER'); // 'TRAVELER', 'PARTNER', 'ADMIN'
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    if (routeLocation.state) {
      if (routeLocation.state.roleMode) setRoleMode(routeLocation.state.roleMode);
      if (routeLocation.state.isSignup !== undefined) setIsSignup(routeLocation.state.isSignup);
    }
  }, [routeLocation]);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Vendor Onboarding Parameters
  const [vendorType, setVendorType] = useState('Hotel'); // Hotel, Homestay, Restaurant, Guide, Transport
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [location, setLocation] = useState('');
  const [partnerStep, setPartnerStep] = useState(1); // Onboarding Steps: 1 -> 2 -> 3 -> 4 -> 5 (Submit)

  // Step 2 & 3 custom details
  const [facilities, setFacilities] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [rate, setRate] = useState(1200);

  // Auto-fill sandbox demo credentials for easier evaluation
  useEffect(() => {
    if (roleMode === 'TRAVELER') {
      setEmail('tourist@yatrasetu.gov.in');
      setPassword('password123');
    } else if (roleMode === 'ADMIN') {
      setEmail('admin@yatrasetu.gov.in');
      setPassword('password123');
      setIsSignup(false); // Admin cannot signup
    } else {
      setEmail('vendor@yatrasetu.gov.in');
      setPassword('password123');
    }
  }, [roleMode]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (roleMode === 'TRAVELER') {
      if (isSignup) {
        try {
          await API.register(name, email, password, 'TOURIST');
          await API.login(email.split('@')[0] || 'tourist', password || 'password123');
          navigate('/onboarding');
        } catch (err) {
          alert(err.message || "Registration failed");
        }
      } else {
        try {
          await API.login(email.split('@')[0] || 'tourist', password || 'password123');
          window.location.href = '/planner'; // Land directly in full Trip Planner workspace
        } catch (err) {
          alert(err.message || "Login failed");
        }
      }
    } else if (roleMode === 'ADMIN') {
      try {
        await API.login('admin', password || 'password123');
        window.location.href = '/admin'; // Reload app state with admin
      } catch (err) {
        alert(err.message || "Admin login failed");
      }
    } else {
      if (isSignup) {
        setPartnerStep(2);
      } else {
        try {
          let defaultVendor = 'vendor';
          if (email.includes('hotel')) defaultVendor = 'hotel_owner';
          if (email.includes('restaurant')) defaultVendor = 'eatery_owner';
          if (email.includes('guide')) defaultVendor = 'heritage_guide';
          if (email.includes('transport')) defaultVendor = 'cab_driver';

          await API.login(email.split('@')[0] || defaultVendor, password || 'password123');
          window.location.href = '/vendor'; // Reload app state with vendor
        } catch (err) {
          alert(err.message || "Vendor login failed");
        }
      }
    }
  };

  const handleNextPartnerStep = () => {
    if (partnerStep < 5) {
      setPartnerStep(prev => prev + 1);
    } else {
      const mappedRole = vendorType.toUpperCase() === 'GUIDE' ? 'GUIDE' 
                       : (vendorType.toUpperCase() === 'RESTAURANT' ? 'RESTAURANT' 
                       : (vendorType.toUpperCase() === 'TRANSPORT' ? 'TRANSPORT' : 'HOTEL'));
      
      API.register(businessName, email, password, mappedRole).then(() => {
        API.login(email.split('@')[0] || 'hotel_owner', 'password123').then(() => {
          window.location.href = '/vendor';
        });
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 space-y-8 animate-fade-in-up">
      
      {/* Header Back Link */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-amber-500"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
        </button>
        <span 
          className="text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-sm"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-heading)' }}
        >
          {roleMode} Portal
        </span>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold" style={{ color: 'var(--text-heading)' }}>Welcome to YatraSetu</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Secure authentication for travelers, partners, and authorities.</p>
      </div>

      {/* Role Selection Group */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: 'TRAVELER', label: 'Tourist', desc: 'Plan & Book', icon: Compass },
          { id: 'PARTNER', label: 'Partner', desc: 'List Service', icon: Building2 },
          { id: 'ADMIN', label: 'Authority', desc: 'Audit & Verify', icon: Shield }
        ].map(role => {
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => {
                setRoleMode(role.id);
                setPartnerStep(1);
              }}
              className={`p-4 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                roleMode === role.id 
                  ? 'bg-amber-500 shadow-lg shadow-amber-500/20 border-amber-500 text-slate-950 translate-y-[-2px]' 
                  : 'bg-transparent hover:bg-white/5'
              }`}
              style={roleMode !== role.id ? { borderColor: 'var(--border-default)', color: 'var(--text-muted)' } : {}}
            >
              <Icon className={`w-6 h-6 ${roleMode === role.id ? 'text-slate-950' : 'text-slate-400'}`} />
              <div>
                <p className={`text-sm uppercase font-extrabold tracking-wide ${roleMode === role.id ? 'text-slate-950' : 'text-white'}`}>{role.label}</p>
                <p className={`text-[10px] mt-0.5 font-medium ${roleMode === role.id ? 'text-slate-800' : 'text-slate-500'}`}>{role.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* stepper status indicators */}
      {roleMode === 'PARTNER' && partnerStep > 1 && (
        <div 
          className="rounded-2xl p-6 shadow-xl animate-fade-in-up"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
            <span>Partner Onboarding</span>
            <span className="text-amber-500">Step {partnerStep} of 5</span>
          </div>
          
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`h-2 rounded-full transition-all duration-500 ${
                  partnerStep >= s ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>

          <p className="text-sm font-bold uppercase text-white tracking-widest text-center">
            {partnerStep === 2 && "Step 2: Service Details Setup"}
            {partnerStep === 3 && "Step 3: Upload Documents"}
            {partnerStep === 4 && "Step 4: Pricing & Availability"}
            {partnerStep === 5 && "Step 5: Submit for Verification"}
          </p>
        </div>
      )}

      {/* Main Form container */}
      <div 
        className="rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
      >
        {/* Glow effect behind form */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-32 bg-amber-500/5 blur-[80px] pointer-events-none"></div>
        
        {/* Render stepper steps 2-5 for partners */}
        {roleMode === 'PARTNER' && partnerStep > 1 ? (
          <div className="space-y-6 relative z-10">
            
            {/* Step 2: Service details */}
            {partnerStep === 2 && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="space-y-1 mb-6">
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>Service Details</h3>
                  <p className="text-xs text-slate-400">Describe what you offer to travelers.</p>
                </div>
                <div>
                  <label htmlFor="facilities" className="block text-xs uppercase font-bold tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                    {vendorType === 'Hotel' || vendorType === 'Homestay' ? 'Available Rooms / Units' : 'Service Description'}
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      id="facilities"
                      name="facilities"
                      type="text" 
                      value={facilities} 
                      onChange={(e) => setFacilities(e.target.value)}
                      placeholder="e.g. Deluxe Rooms, 3 bedrooms, AC transport"
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-white placeholder-slate-600" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Documents Upload */}
            {partnerStep === 3 && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="space-y-1 mb-6">
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>Registration Licenses</h3>
                  <p className="text-xs text-slate-400">Official documentation for verification.</p>
                </div>
                <div>
                  <label htmlFor="licenseNumber" className="block text-xs uppercase font-bold tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>License / Document Registration Code</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      id="licenseNumber"
                      name="licenseNumber"
                      type="text" 
                      value={licenseNumber} 
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="e.g. REG-7193-IND"
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-white placeholder-slate-600" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Pricing & Availability */}
            {partnerStep === 4 && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="space-y-1 mb-6">
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>Pricing Configuration</h3>
                  <p className="text-xs text-slate-400">Set your base rates for the services.</p>
                </div>
                <div>
                  <label htmlFor="rate" className="block text-xs uppercase font-bold tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Price per night / seat / day (INR)</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      id="rate"
                      name="rate"
                      type="number" 
                      value={rate} 
                      onChange={(e) => setRate(parseInt(e.target.value))}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-white placeholder-slate-600" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Submit for review */}
            {partnerStep === 5 && (
              <div className="text-center py-8 space-y-4 animate-fade-in-up">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                  <ShieldCheck className="w-10 h-10 animate-pulse" />
                </div>
                <h3 className="text-xl font-extrabold" style={{ color: 'var(--text-heading)' }}>Ready to Submit</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                  Your business services will be listed publicly with verification status set to <span className="text-amber-500 font-semibold">Pending Review</span>.
                </p>
              </div>
            )}

            <button 
              onClick={handleNextPartnerStep}
              className="w-full py-4 mt-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg hover:shadow-amber-500/25 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {partnerStep === 5 ? "Submit For Review" : "Continue"}
              {partnerStep < 5 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          
          /* Step 1: Base login / signups */
          <form onSubmit={handleAuthSubmit} className="space-y-5 relative z-10">
            
            {/* Show Login/Signup Tab only if not Admin */}
            {roleMode !== 'ADMIN' ? (
              <div className="flex p-1 bg-slate-900/80 rounded-xl border border-white/5 mb-8">
                <button 
                  type="button" 
                  onClick={() => setIsSignup(false)} 
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 ${!isSignup ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Login
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsSignup(true)} 
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 ${isSignup ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Create Account
                </button>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-xs text-amber-200/80 flex items-center gap-3 mb-6 shadow-inner">
                <ShieldAlert className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <span className="leading-relaxed font-medium">Authority accounts require pre-seeded credentials provided by the regional administrator to sign in.</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Service selector for partners */}
              {roleMode === 'PARTNER' && isSignup && (
                <div className="space-y-1.5">
                  <label htmlFor="vendorType" className="block text-[10px] uppercase font-bold tracking-widest ml-1" style={{ color: 'var(--text-muted)' }}>Select service type</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                    <select 
                      id="vendorType"
                      name="vendorType"
                      value={vendorType} 
                      onChange={(e) => setVendorType(e.target.value)} 
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-10 py-3.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-white appearance-none"
                    >
                      <option value="Hotel">Hotel / Resort</option>
                      <option value="Homestay">Verified Homestay</option>
                      <option value="Restaurant">Restaurant / Eatery</option>
                      <option value="Guide">Certified Tour Guide</option>
                      <option value="Transport">Transport Provider</option>
                    </select>
                  </div>
                </div>
              )}

              {isSignup && (
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="block text-[10px] uppercase font-bold tracking-widest ml-1" style={{ color: 'var(--text-muted)' }}>
                    {roleMode === 'PARTNER' ? 'Business Name' : 'Full Name'}
                  </label>
                  <div className="relative">
                    {roleMode === 'PARTNER' ? 
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" /> : 
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    }
                    <input 
                      id="fullName"
                      name="fullName"
                      type="text" 
                      required 
                      value={roleMode === 'PARTNER' ? businessName : name} 
                      onChange={(e) => roleMode === 'PARTNER' ? setBusinessName(e.target.value) : setName(e.target.value)} 
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-white placeholder-slate-600"
                      placeholder={roleMode === 'PARTNER' ? "Enter business registered name" : "Enter your full name"} 
                    />
                  </div>
                </div>
              )}

              {roleMode === 'PARTNER' && isSignup && (
                <div className="space-y-1.5">
                  <label htmlFor="ownerName" className="block text-[10px] uppercase font-bold tracking-widest ml-1" style={{ color: 'var(--text-muted)' }}>Owner Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      id="ownerName"
                      name="ownerName"
                      type="text" 
                      required 
                      value={ownerName} 
                      onChange={(e) => setOwnerName(e.target.value)} 
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-white placeholder-slate-600" 
                      placeholder="Name of primary contact"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="authEmail" className="block text-[10px] uppercase font-bold tracking-widest ml-1" style={{ color: 'var(--text-muted)' }}>Email / Username</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    id="authEmail"
                    name="authEmail"
                    type="text" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-white placeholder-slate-600" 
                    placeholder="Enter your email or username"
                  />
                </div>
              </div>

              {isSignup && (
                <div className="space-y-1.5">
                  <label htmlFor="authPhone" className="block text-[10px] uppercase font-bold tracking-widest ml-1" style={{ color: 'var(--text-muted)' }}>Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      id="authPhone"
                      name="authPhone"
                      type="text" 
                      required 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-white placeholder-slate-600" 
                      placeholder="+91"
                    />
                  </div>
                </div>
              )}

              {roleMode === 'PARTNER' && isSignup && (
                <div className="space-y-1.5">
                  <label htmlFor="authLocation" className="block text-[10px] uppercase font-bold tracking-widest ml-1" style={{ color: 'var(--text-muted)' }}>Business Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      id="authLocation"
                      name="authLocation"
                      type="text" 
                      required 
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)} 
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-white placeholder-slate-600" 
                      placeholder="City or Area"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="authPassword" className="block text-[10px] uppercase font-bold tracking-widest ml-1" style={{ color: 'var(--text-muted)' }}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    id="authPassword"
                    name="authPassword"
                    type="password" 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-white placeholder-slate-600" 
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 mt-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg hover:shadow-amber-500/25 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {isSignup ? (roleMode === 'PARTNER' ? 'Start Partner Onboarding' : 'Create Account') : 'Sign In Securely'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
