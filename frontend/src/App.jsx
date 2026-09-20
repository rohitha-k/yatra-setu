import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartHandshake, LogOut, Lightbulb, LightbulbOff, Loader2, Menu, X, ChevronDown, MapPin, MessageSquare, LayoutDashboard, Home, Compass, Shield, LogIn, User } from 'lucide-react';
import { clearAuthData } from './services/api';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const PlanMyTrip = lazy(() => import('./pages/PlanMyTrip'));
const BudgetResults = lazy(() => import('./pages/BudgetResults'));
const TripDashboard = lazy(() => import('./pages/TripDashboard'));
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TrustVerification = lazy(() => import('./pages/TrustVerification'));
const AuthPortal = lazy(() => import('./pages/AuthPortal'));
const TravelerOnboarding = lazy(() => import('./pages/TravelerOnboarding'));
const DestinationsCatalog = lazy(() => import('./pages/DestinationsCatalog'));
const TripPlanner = lazy(() => import('./pages/TripPlanner'));
const ConnectedPlanner = lazy(() => import('./pages/ConnectedPlanner'));
const AiAssistant = lazy(() => import('./pages/AiAssistant'));
const AuthorityCommandCenter = lazy(() => import('./pages/AuthorityCommandCenter'));
const DigitalTwin = lazy(() => import('./pages/DigitalTwin'));
const BusinessDashboard = lazy(() => import('./pages/BusinessDashboard'));
const TouristDashboard = lazy(() => import('./pages/TouristDashboard'));

/* ────────────────────────────────────────────
   Premium Sticky Navigation Bar
   ──────────────────────────────────────────── */
function Header({ user, setUser, theme, setTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleRoleChange = (role) => {
    let mockUsername = 'tourist_demo';
    if (role === 'HOTEL') mockUsername = 'hotel_manager';
    if (role === 'RESTAURANT') mockUsername = 'eatery_owner';
    if (role === 'GUIDE') mockUsername = 'heritage_guide';
    if (role === 'TRANSPORT') mockUsername = 'cab_driver';
    if (role === 'ADMIN') mockUsername = 'authority_inspector';
    if (role === 'AUTHORITY') mockUsername = 'tourism_commissioner';
    if (role === 'DIGITAL_TWIN') mockUsername = 'simulation_analyst';
    if (role === 'BUSINESS') mockUsername = 'business_analyst';
    
    localStorage.setItem('token', `mock_token_for_${mockUsername}`);
    localStorage.setItem('role', role);
    localStorage.setItem('username', mockUsername);
    
    setUser({ username: mockUsername, role });
    
    if (role === 'TOURIST') navigate('/plan');
    else if (role === 'ADMIN') navigate('/admin');
    else if (role === 'AUTHORITY') navigate('/authority');
    else if (role === 'DIGITAL_TWIN') navigate('/digital-twin');
    else if (role === 'BUSINESS') navigate('/business');
    else navigate('/vendor');
  };

  const handleLogout = () => {
    clearAuthData();
    setUser(null);
    navigate('/');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: <Home className="w-3.5 h-3.5" /> },
    { path: '/destinations', label: 'Explore India', icon: <Compass className="w-3.5 h-3.5" /> },
    { path: '/plan', label: 'Plan My Trip', icon: <Compass className="w-3.5 h-3.5" /> },
    { path: '/trust', label: 'Trust Registry', icon: <Shield className="w-3.5 h-3.5" /> },
    { path: '/dashboard', label: 'My Trips', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { path: '/chat', label: 'AI Assistant', icon: <MessageSquare className="w-3.5 h-3.5" /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header 
        className={`navbar ${scrolled ? 'compact' : ''}`}
        style={{ transition: 'all 0.25s ease' }}
      >
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group" style={{ textDecoration: 'none' }}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
                <HeartHandshake className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <span className="text-base font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>
                  YatraSetu
                </span>
                <span className="text-[10px] font-medium hidden sm:block text-slate-400">
                  Budget Intelligence Ecosystem
                </span>
              </div>
            </Link>

            {/* Center: Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              
              {/* Theme Toggle — Bulb Icon */}
              <div className="tooltip-wrapper">
                <button 
                  onClick={toggleTheme}
                  aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                  className="btn-icon btn-ghost"
                  style={{ borderColor: 'var(--border-default)' }}
                >
                  {theme === 'light' ? (
                    <LightbulbOff className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  ) : (
                    <Lightbulb className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
                  )}
                </button>
                <span className="tooltip">Switch theme</span>
              </div>

              {/* Role Selector (Desktop) */}
              <div className="hidden md:flex items-center">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ 
                  background: 'var(--bg-surface)', 
                  border: '1px solid var(--border-default)' 
                }}>
                  <Shield className="w-3.5 h-3.5" style={{ color: 'var(--brand-primary)' }} />
                  <select 
                    id="desktop-role-select"
                    name="desktopRoleSelect"
                    aria-label="User Role Selection"
                    value={user?.role || ''} 
                    onChange={(e) => handleRoleChange(e.target.value || 'TOURIST')}
                    className="text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                    style={{ 
                      background: 'transparent', 
                      color: 'var(--text-secondary)',
                      border: 'none',
                      fontSize: '0.75rem'
                    }}
                  >
                    <option value="TOURIST">Tourist</option>
                    <option value="HOTEL">Hotel Owner</option>
                    <option value="RESTAURANT">Restaurant</option>
                    <option value="GUIDE">Tour Guide</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="ADMIN">Admin Portal</option>
                    <option value="AUTHORITY">Authority Command</option>
                    <option value="DIGITAL_TWIN">Digital Twin</option>
                    <option value="BUSINESS">Business Analytics</option>
                  </select>
                </div>
              </div>

              {/* Dedicated Login / Sign In Button */}
              <Link
                to="/auth"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive('/auth') 
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-sm hover:shadow'
                }`}
                style={{ textDecoration: 'none' }}
                title="Login or Register"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Login / Sign In</span>
                <span className="sm:hidden">Login</span>
              </Link>

              {/* Logout */}
              {user && (
                <button 
                  onClick={handleLogout}
                  className="btn-icon btn-ghost"
                  style={{ borderColor: 'transparent' }}
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden btn-icon btn-ghost"
                style={{ borderColor: 'transparent' }}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-x-0 top-14 z-40 p-4"
            style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)' }}
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                  style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              
              {/* Mobile Login / Sign In Link */}
              <Link
                to="/auth"
                className={`nav-link ${isActive('/auth') ? 'active' : ''}`}
                style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-primary)' }}
              >
                <LogIn className="w-4 h-4" />
                Login / Sign Up Portal
              </Link>
              
              {/* Mobile Role Selector */}
              <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border-default)' }}>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                  <Shield className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
                  <select 
                    id="mobile-role-select"
                    name="mobileRoleSelect"
                    aria-label="Mobile User Role Selection"
                    value={user?.role || ''} 
                    onChange={(e) => handleRoleChange(e.target.value || 'TOURIST')}
                    className="flex-1 text-sm font-medium focus:outline-none cursor-pointer"
                    style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none' }}
                  >
                    <option value="TOURIST">Tourist Mode</option>
                    <option value="HOTEL">Hotel Owner</option>
                    <option value="RESTAURANT">Restaurant</option>
                    <option value="GUIDE">Tour Guide</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="ADMIN">Admin Portal</option>
                    <option value="AUTHORITY">Authority Command</option>
                    <option value="DIGITAL_TWIN">Digital Twin</option>
                    <option value="BUSINESS">Business Analytics</option>
                  </select>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ────────────────────────────────────────────
   Main Application Shell
   ──────────────────────────────────────────── */
function MainApp() {
  const [user, setUser] = useState(null);
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('yatrasetu-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.className = theme === 'dark' ? 'dark-mode' : 'light-mode';
    localStorage.setItem('yatrasetu-theme', theme);
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    if (token && role && username) {
      setUser({ username, role });
    } else {
      setUser({ username: 'tourist_demo', role: 'TOURIST' });
    }
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
        <Header user={user} setUser={setUser} theme={theme} setTheme={setTheme} />
        
        <main className="flex-1 w-full">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--brand-primary-soft)' }}>
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--brand-primary)' }} />
              </div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Loading…</p>
            </div>
          }>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPortal />} />
              <Route path="/onboarding" element={<TravelerOnboarding />} />
              <Route path="/plan" element={<PlanMyTrip />} />
              <Route path="/destinations" element={<DestinationsCatalog />} />
              <Route path="/planner" element={<ConnectedPlanner />} />
              <Route path="/workspace" element={<ConnectedPlanner />} />
              <Route path="/legacy-planner" element={<TripPlanner />} />
              <Route path="/chat" element={<AiAssistant />} />
              <Route path="/results" element={<BudgetResults />} />
              <Route path="/dashboard" element={<TripDashboard />} />
              <Route path="/vendor" element={<VendorDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/authority" element={<AuthorityCommandCenter />} />
              <Route path="/command-center" element={<AuthorityCommandCenter />} />
              <Route path="/digital-twin" element={<DigitalTwin />} />
              <Route path="/business" element={<BusinessDashboard />} />
              <Route path="/tourist-hub" element={<TouristDashboard />} />
              <Route path="/trust" element={<TrustVerification />} />
            </Routes>
          </Suspense>
        </main>
        
        <footer style={{ 
          borderTop: '1px solid var(--border-default)', 
          background: 'var(--bg-elevated)',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} YatraSetu. All rights reserved.
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default MainApp;
