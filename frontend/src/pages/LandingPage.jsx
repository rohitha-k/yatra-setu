import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Map, ShieldCheck, Cpu, RefreshCw, Calendar, ArrowRight, Star, AlertTriangle, 
  UserCheck, Search, Sparkles, MapPin, IndianRupee, Users, CheckCircle2, HeartHandshake,
  Quote, ThumbsUp, Shield, MessageSquare, ExternalLink, Zap, Landmark, Trees, 
  Flame, Waves, Mountain, Sun, Navigation, Award, Fuel, Camera
} from 'lucide-react';
import { pageVariants, staggerContainer, itemFadeUp } from '../animations/variants';

// YatraSetu Featured Destinations Showcase
const HERO_SHOWCASE = [
  {
    id: 'hampi',
    title: 'Hampi — The City of Victory',
    subtitle: 'UNESCO World Heritage • Tungabhadra River Basin, Karnataka',
    image: '/hampi_ruins.jpg',
    tag: 'Heritage & Architecture',
    badge: 'Ministry Approved Stay Hub',
    avgBudget: '₹1,800 / day',
    startingCity: 'Bengaluru'
  },
  {
    id: 'varanasi',
    title: 'Varanasi — Eternal City of Light',
    subtitle: 'Spiritual Ghats & Ganga Aarti • Uttar Pradesh',
    image: '/varanasi_ghats.jpg',
    tag: 'Spiritual Circuit',
    badge: 'Zero-Surge Boat & Stay Index',
    avgBudget: '₹1,500 / day',
    startingCity: 'Delhi'
  },
  {
    id: 'jaipur',
    title: 'Jaipur — The Royal Pink City',
    subtitle: 'Amber Fort & Hawa Mahal • Rajasthan',
    image: '/jaipur_palace.jpg',
    tag: 'Golden Triangle',
    badge: 'FASTag Toll & Fuel Verified',
    avgBudget: '₹2,500 / day',
    startingCity: 'Delhi'
  },
  {
    id: 'araku',
    title: 'Araku Valley — Eastern Ghats Mist',
    subtitle: 'Organic Coffee Plantations & Borra Caves • Andhra Pradesh',
    image: '/araku_valley.jpg',
    tag: 'Nature & Hill Station',
    badge: 'Community Homestays',
    avgBudget: '₹1,600 / day',
    startingCity: 'Visakhapatnam'
  },
  {
    id: 'coorg',
    title: 'Coorg — Scotland of India',
    subtitle: 'Spice Plantations & Abbey Waterfalls • Karnataka',
    image: '/coorg_hills.jpg',
    tag: 'Eco-Tourism',
    badge: 'Pro-Planet Certified',
    avgBudget: '₹2,200 / day',
    startingCity: 'Bengaluru'
  }
];

// Curated Travel Themes
const THEMATIC_CATEGORIES = [
  { id: 'All', label: 'All Experiences', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'Heritage', label: 'Heritage & Forts', icon: <Landmark className="w-4 h-4" /> },
  { id: 'Spiritual', label: 'Spiritual Circuits', icon: <Flame className="w-4 h-4" /> },
  { id: 'Nature', label: 'Mist & Mountains', icon: <Mountain className="w-4 h-4" /> },
  { id: 'Coastal', label: 'Coastal & Backwaters', icon: <Waves className="w-4 h-4" /> },
  { id: 'Wildlife', label: 'Wildlife & Safaris', icon: <Trees className="w-4 h-4" /> }
];

// Rich Curated Destinations Data
const CURATED_DESTINATIONS = [
  { 
    id: 'hampi', 
    name: 'Hampi Ruins', 
    state: 'Karnataka', 
    category: 'Heritage', 
    avgBudgetPerDay: 1800, 
    rating: 4.9, 
    img: '/hampi_ruins.jpg', 
    tag: 'UNESCO Heritage', 
    highlight: 'Virupaksha Temple & Coracle Ride',
    trustScore: 98
  },
  { 
    id: 'araku', 
    name: 'Araku Valley', 
    state: 'Andhra Pradesh', 
    category: 'Nature', 
    avgBudgetPerDay: 1600, 
    rating: 4.7, 
    img: '/araku_valley.jpg', 
    tag: 'Tribal Culture & Coffee', 
    highlight: 'Borra Caves & Vistadome Train',
    trustScore: 96
  },
  { 
    id: 'coorg', 
    name: 'Coorg Hills', 
    state: 'Karnataka', 
    category: 'Nature', 
    avgBudgetPerDay: 2200, 
    rating: 4.9, 
    img: '/coorg_hills.jpg', 
    tag: 'Spices & Estates', 
    highlight: 'Madikeri Fort & Coffee Walks',
    trustScore: 97
  },
  { 
    id: 'tirupati', 
    name: 'Tirupati Hills', 
    state: 'Andhra Pradesh', 
    category: 'Spiritual', 
    avgBudgetPerDay: 1400, 
    rating: 4.8, 
    img: '/tirupati_temple.jpg', 
    tag: 'Sacred Hill Shrine', 
    highlight: 'Venkateswara Temple & Silathoranam',
    trustScore: 99
  },
  { 
    id: 'varanasi', 
    name: 'Varanasi Ghats', 
    state: 'Uttar Pradesh', 
    category: 'Spiritual', 
    avgBudgetPerDay: 1500, 
    rating: 4.9, 
    img: '/varanasi_ghats.jpg', 
    tag: 'Ancient Cultural Capital', 
    highlight: 'Dashashwamedh Aarti & Boat Trail',
    trustScore: 98
  },
  { 
    id: 'jaipur', 
    name: 'Jaipur Forts', 
    state: 'Rajasthan', 
    category: 'Heritage', 
    avgBudgetPerDay: 2500, 
    rating: 4.8, 
    img: '/jaipur_palace.jpg', 
    tag: 'Royal Rajputana', 
    highlight: 'Amer Fort & Chokhi Dhani',
    trustScore: 97
  },
  { 
    id: 'munnar', 
    name: 'Munnar Tea Valleys', 
    state: 'Kerala', 
    category: 'Nature', 
    avgBudgetPerDay: 2100, 
    rating: 4.9, 
    img: '/munnar_hills.jpg', 
    tag: 'High Range Mist', 
    highlight: 'Anamudi Peak & Tea Museums',
    trustScore: 98
  },
  { 
    id: 'varkala', 
    name: 'Varkala Beach & Cliff', 
    state: 'Kerala', 
    category: 'Coastal', 
    avgBudgetPerDay: 1900, 
    rating: 4.8, 
    img: '/varkala_beach.jpg', 
    tag: 'Arabian Sea Cliffs', 
    highlight: 'Papanasam Beach & Ayurvedic Spas',
    trustScore: 95
  }
];

// Popular Indian Tourism Circuits
const ICONIC_CIRCUITS = [
  {
    title: 'The Golden Triangle',
    route: 'Delhi ➔ Agra ➔ Jaipur',
    duration: '5 Days / 4 Nights',
    estBudget: '₹14,500 per traveler',
    highlights: 'Taj Mahal, Amber Fort, Qutub Minar',
    tollFuelEstimate: '₹3,400 (FASTag & Petrol)',
    image: '/jaipur_palace.jpg',
    targetDest: 'Jaipur'
  },
  {
    title: 'Deccan Heritage & Stone Empires',
    route: 'Hyderabad ➔ Hampi ➔ Badami',
    duration: '4 Days / 3 Nights',
    estBudget: '₹9,800 per traveler',
    highlights: 'Vijayanagara Ruins, Cave Temples',
    tollFuelEstimate: '₹2,100 (FASTag & Tolls)',
    image: '/hampi_ruins.jpg',
    targetDest: 'Hampi'
  },
  {
    title: 'Sacred Ganges & Spiritual Hubs',
    route: 'Prayagraj ➔ Varanasi ➔ Ayodhya',
    duration: '4 Days / 3 Nights',
    estBudget: '₹8,400 per traveler',
    highlights: 'Sangam, Kashi Vishwanath, Ram Mandir',
    tollFuelEstimate: '₹1,600 (Train / Cab)',
    image: '/varanasi_ghats.jpg',
    targetDest: 'Varanasi'
  },
  {
    title: 'Spice Coast & Western Ghats Trail',
    route: 'Kochi ➔ Munnar ➔ Alleppey',
    duration: '5 Days / 4 Nights',
    estBudget: '₹13,200 per traveler',
    highlights: 'Tea Estates, Houseboats, Kathakali',
    tollFuelEstimate: '₹2,600 (FASTag Highway)',
    image: '/munnar_hills.jpg',
    targetDest: 'Munnar'
  }
];

// Cultural Festivals & Seasonal Highlights
const SEASONAL_FESTIVALS = [
  { name: 'Dev Deepawali', location: 'Varanasi, UP', timing: 'Nov 2026', desc: '1 Million oil lamps glowing across 84 Ghats.', icon: '🪔' },
  { name: 'Hampi Utsav', location: 'Hampi, Karnataka', timing: 'Nov / Dec', desc: 'Sound, light, classical dance amidst 15th-century ruins.', icon: '🏛️' },
  { name: 'Pushkar Camel Fair', location: 'Pushkar, Rajasthan', timing: 'Nov 2026', desc: 'World’s most colorful desert festival and folk music.', icon: '🐪' },
  { name: 'Hornbill Festival', location: 'Kohima, Nagaland', timing: 'Dec 2026', desc: 'Festival of Festivals celebrating 17 Naga indigenous tribes.', icon: '🪶' }
];

// Verified Human Testimonials
const TESTIMONIALS = [
  {
    name: 'Priya & Rahul Sharma',
    city: 'Bengaluru',
    trip: '3 Days in Hampi Heritage',
    saved: 'Saved ₹4,200',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    comment: 'YatraSetu gave us a verified heritage homestay right near Virupaksha temple for half the price of big commercial apps. The dynamic budget tracker kept us strictly stress-free!',
    rating: 5
  },
  {
    name: 'Anish K. Kulkarni',
    city: 'Hyderabad',
    trip: 'Araku Valley Scenic Drive',
    saved: 'Saved ₹2,800',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    comment: 'The FASTag toll & fuel calculator was spot-on for our drive through the Eastern Ghats. Being able to toggle verified local auto tariffs kept us on budget.',
    rating: 5
  },
  {
    name: 'Sneha & Venkat Reddy',
    city: 'Chennai',
    trip: 'Tirupati Pilgrimage Circuit',
    saved: 'Saved ₹3,500',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    comment: 'The AI Sathi booked verified temple stays and traditional meals without any inflated surge rates. Genuine Ministry-grade transparency!',
    rating: 5
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  
  // Hero slide index
  const [currentSlide, setCurrentSlide] = useState(0);

  // Search Engine State
  const [startingCity, setStartingCity] = useState('Hyderabad');
  const [destination, setDestination] = useState('');
  const [budgetLimit, setBudgetLimit] = useState(15000);
  const [travelersCount, setTravelersCount] = useState(2);
  const [travelMode, setTravelMode] = useState('Car');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('username');
    if (token) {
      setIsLoggedIn(true);
      setUsername(user || 'Traveler');
    }

    // Auto rotate hero slide every 6 seconds
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SHOWCASE.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const targetDest = destination.trim() || HERO_SHOWCASE[currentSlide].id;
    const searchParams = {
      startingLocation: startingCity,
      destination: targetDest,
      daysCount: 3,
      travelersCount: travelersCount,
      budgetLimit: budgetLimit,
      travelMode: travelMode
    };
    localStorage.setItem('travexa_search', JSON.stringify(searchParams));
    navigate('/planner');
  };

  const handleQuickSelect = (destName, defaultCity = 'Hyderabad') => {
    const searchParams = {
      startingLocation: startingCity || defaultCity,
      destination: destName,
      daysCount: 3,
      travelersCount: travelersCount,
      budgetLimit: budgetLimit,
      travelMode: travelMode
    };
    localStorage.setItem('travexa_search', JSON.stringify(searchParams));
    navigate('/planner');
  };

  const filteredDestinations = activeCategory === 'All' 
    ? CURATED_DESTINATIONS 
    : CURATED_DESTINATIONS.filter(d => d.category === activeCategory);

  const activeHero = HERO_SHOWCASE[currentSlide];

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      
      {/* ── 1. CINEMATIC YATRASETU HERO BANNER — FULL SCREEN ── */}
      <section 
        aria-label="YatraSetu Travel Showcase"
        className="relative overflow-hidden w-full min-h-[92vh] flex flex-col justify-between"
      >
        {/* Dynamic Background Image with Smooth Crossfade */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105 transform ease-out"
          style={{ backgroundImage: `url('${activeHero.image}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/45 z-0" />

        {/* Top Header Badge inside Hero */}
        <div className="relative z-10 p-6 sm:p-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Verified Travel Experience
            </span>
            <span className="hidden sm:inline px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-md border border-white/20">
              {activeHero.badge}
            </span>
          </div>

          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-2 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {HERO_SHOWCASE.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'w-6 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Center Hero Heading & Value Proposition */}
        <div className="relative z-10 px-6 sm:px-12 py-4 max-w-4xl text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> {activeHero.tag}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight font-heritage" style={{ color: '#FFFFFF', textShadow: '0 4px 30px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.7)' }}>
            {activeHero.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-200 font-medium max-w-2xl leading-relaxed" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            {activeHero.subtitle}. Plan accommodations, meals, transport, and guide services strictly within your spend limit.
          </p>
        </div>

        {/* Bottom Search & Budget Optimizer Console */}
        <div className="relative z-10 p-4 sm:p-8">
          <form 
            onSubmit={handleHeroSearch}
            className="p-3.5 sm:p-4 rounded-2xl shadow-2xl border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
            style={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.90)', 
              borderColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Field 1: Starting City */}
            <div className="p-2.5 rounded-xl border flex flex-col justify-center" style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <label htmlFor="startCity" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" /> Origin City
              </label>
              <input 
                id="startCity"
                type="text"
                value={startingCity}
                onChange={(e) => setStartingCity(e.target.value)}
                placeholder="e.g. Hyderabad"
                className="bg-transparent text-sm font-bold text-white focus:outline-none mt-0.5"
              />
            </div>

            {/* Field 2: Destination */}
            <div className="p-2.5 rounded-xl border flex flex-col justify-center" style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <label htmlFor="destCity" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" /> Destination / Circuit
              </label>
              <input 
                id="destCity"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Hampi, Varanasi, Araku"
                className="bg-transparent text-sm font-bold text-amber-300 focus:outline-none mt-0.5"
              />
            </div>

            {/* Field 3: Budget Limit */}
            <div className="p-2.5 rounded-xl border flex flex-col justify-center" style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <label htmlFor="budgetInp" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <IndianRupee className="w-3 h-3 text-emerald-400" /> Total Budget (₹)
              </label>
              <input 
                id="budgetInp"
                type="number"
                min="2000"
                step="1000"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(parseInt(e.target.value) || 10000)}
                className="bg-transparent text-sm font-black text-emerald-400 focus:outline-none mt-0.5"
              />
            </div>

            {/* Field 4: Travel Mode */}
            <div className="p-2.5 rounded-xl border flex flex-col justify-center" style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <label htmlFor="travelModeSelect" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Navigation className="w-3 h-3 text-sky-400" /> Mode (FASTag Tolls)
              </label>
              <select
                id="travelModeSelect"
                value={travelMode}
                onChange={(e) => setTravelMode(e.target.value)}
                className="bg-transparent text-sm font-bold text-white focus:outline-none mt-0.5 cursor-pointer"
              >
                <option value="Car" className="bg-slate-900 text-white">Own Car (FASTag & Fuel)</option>
                <option value="Train" className="bg-slate-900 text-white">Indian Railways (IRCTC)</option>
                <option value="Flight" className="bg-slate-900 text-white">Direct Flight</option>
                <option value="Bus" className="bg-slate-900 text-white">State / Luxury Bus</option>
              </select>
            </div>

            {/* Submit Action */}
            <button 
              type="submit"
              className="py-3 px-4 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2 shadow-xl"
              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#0F172A' }}
            >
              <Search className="w-4 h-4" /> Plan Itinerary
            </button>
          </form>

          {/* Quick Cultural Picks Bar */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-300 font-semibold text-[11px] flex items-center gap-1">
              Popular Circuits:
            </span>
            {['Hampi Ruins', 'Varanasi Ghats', 'Araku Valley', 'Jaipur Forts', 'Coorg Hills', 'Munnar Tea'].map(pick => (
              <button
                key={pick}
                type="button"
                onClick={() => {
                  setDestination(pick);
                  handleQuickSelect(pick);
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all hover:border-amber-400 hover:text-amber-300 text-slate-200 bg-slate-900/60 border border-white/15 backdrop-blur-sm"
              >
                {pick}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Constrained Content Container ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-16">

      {/* ── 2. YATRASETU TRUST & SAVINGS STATS STRIP ── */}
      <section 
        className="rounded-2xl p-5 sm:p-6 border shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-5 text-center"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
      >
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-xs uppercase tracking-wider">
            <IndianRupee className="w-3.5 h-3.5" /> Traveler Savings
          </div>
          <p className="text-2xl sm:text-3xl font-black font-heritage" style={{ color: 'var(--brand-primary)' }}>₹1.84 Crore+</p>
          <span className="text-[11px] text-slate-500">Saved through transparent direct booking</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1 text-emerald-500 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Directory
          </div>
          <p className="text-2xl sm:text-3xl font-black font-heritage" style={{ color: 'var(--text-heading)' }}>1,250+ Stays</p>
          <span className="text-[11px] text-slate-500">360° Walkthrough audited homestays</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1 text-sky-500 font-bold text-xs uppercase tracking-wider">
            <Fuel className="w-3.5 h-3.5" /> National Corridors
          </div>
          <p className="text-2xl sm:text-3xl font-black font-heritage" style={{ color: 'var(--text-heading)' }}>340+ Highways</p>
          <span className="text-[11px] text-slate-500">Real-time FASTag toll & fuel calculations</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-xs uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" /> Trust Index Average
          </div>
          <p className="text-2xl sm:text-3xl font-black font-heritage text-emerald-600 dark:text-emerald-400">98.4% Rating</p>
          <span className="text-[11px] text-slate-500">Zero hidden fee & surge protection</span>
        </div>
      </section>

      {/* ── 3. CURATED EXPERIENCES & THEMATIC DISCOVERY ── */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5" /> Curated Indian Journeys
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heritage" style={{ color: 'var(--text-heading)' }}>
              Explore Experiences by Theme
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              From centuries-old temple corridors to high mist valleys, planned with zero budget leakage.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
            {THEMATIC_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-amber-500 text-slate-950 shadow-md' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Destination Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredDestinations.map(dest => (
            <motion.div 
              key={dest.id}
              variants={itemFadeUp}
              className="group rounded-2xl overflow-hidden border shadow-md transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
            >
              <div className="relative h-48 overflow-hidden bg-slate-950">
                <img 
                  src={dest.img} 
                  alt={dest.name} 
                  loading="lazy" 
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-center">
                  <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-slate-900/85 text-amber-300 border border-amber-500/30">
                    {dest.tag}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {dest.trustScore}% Trust
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 flex justify-between items-end">
                  <div>
                    <h3 className="text-base font-black text-white leading-snug">{dest.name}</h3>
                    <p className="text-[11px] text-slate-300 font-medium">{dest.state}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-slate-900/80 px-2 py-0.5 rounded border border-amber-400/20">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {dest.rating}
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-500 line-clamp-1">
                  ✨ {dest.highlight}
                </p>
                <div className="flex justify-between items-center text-xs pt-2 border-t" style={{ borderColor: 'var(--border-default)' }}>
                  <span className="text-slate-400 font-medium">Daily Avg Cost</span>
                  <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400">
                    ₹{dest.avgBudgetPerDay.toLocaleString()} / day
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={() => handleQuickSelect(dest.name)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-heading)' }}
                >
                  Plan Trip <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 4. POPULAR NATIONAL CIRCUITS & HIGHWAY MATH ── */}
      <section className="space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            <Navigation className="w-3.5 h-3.5" /> Iconic Indian Travel Corridors
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heritage" style={{ color: 'var(--text-heading)' }}>
            Curated National Tourism Circuits
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Complete multi-destination itineraries with verified fuel, FASTag tolls, and daily stay allocations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {ICONIC_CIRCUITS.map((circuit, idx) => (
            <div 
              key={idx}
              className="rounded-2xl p-5 border shadow-sm flex flex-col justify-between space-y-4 hover:shadow-lg transition-all"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    {circuit.duration}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {circuit.estBudget}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black" style={{ color: 'var(--text-heading)' }}>
                    {circuit.title}
                  </h3>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                    {circuit.route}
                  </p>
                </div>

                <p className="text-xs text-slate-500">
                  <strong className="text-slate-400 font-semibold">Key Highlights:</strong> {circuit.highlights}
                </p>

                <div className="p-2.5 rounded-lg text-[11px] font-medium bg-slate-900/10 dark:bg-slate-900/60 border border-slate-800/10 flex items-center gap-1.5 text-slate-400">
                  <Fuel className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{circuit.tollFuelEstimate}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleQuickSelect(circuit.targetDest)}
                className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                style={{ background: 'var(--brand-primary)', color: 'var(--text-on-brand)' }}
              >
                Calculate Trip Cost <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. SEASONS & FESTIVALS OF INDIA ── */}
      <section 
        className="rounded-2xl p-6 sm:p-8 border shadow-sm space-y-6"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Cultural Calendar
            </span>
            <h2 className="text-2xl font-black font-heritage mt-0.5" style={{ color: 'var(--text-heading)' }}>
              Festivals &amp; Cultural Wonders of India
            </h2>
          </div>
          <button 
            onClick={() => navigate('/destinations')}
            className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
          >
            Explore All 28 States &amp; 8 UTs <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SEASONAL_FESTIVALS.map((fest, idx) => (
            <div 
              key={idx} 
              className="p-4 rounded-xl border flex flex-col justify-between space-y-2 hover:border-amber-500/50 transition-all"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
            >
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-xl">{fest.icon}</span>
                  <span className="font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded text-[10px]">
                    {fest.timing}
                  </span>
                </div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>{fest.name}</h3>
                <p className="text-[11px] text-slate-400 font-semibold">{fest.location}</p>
                <p className="text-xs text-slate-500 leading-relaxed pt-1">{fest.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. WHY TRAVELERS CHOOSE YATRASETU (OLD WAY vs YATRASETU) ── */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Decision Intelligence Difference
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-heritage" style={{ color: 'var(--text-heading)' }}>
            Why Indian Travelers Trust YatraSetu
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
            Standard OTA websites isolate hotel bookings from ground realities. YatraSetu reverses the flow to protect your total holiday budget.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Traditional Booking Disadvantages */}
          <div 
            className="rounded-2xl p-6 space-y-4 border"
            style={{ backgroundColor: 'var(--status-danger-soft)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <div className="flex items-center gap-2 font-bold text-rose-500 text-sm uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4" /> Traditional Booking Portals
            </div>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span> Forces you to book rooms before knowing local food, toll, and auto tariffs.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span> Hidden convenience fees, platform surcharges, and festive price spikes.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span> Unverified wide-angle promotional photos with zero physical audit proof.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span> If total trip overshoots your budget, you have to cancel everything manually.
              </li>
            </ul>
          </div>

          {/* The YatraSetu Way */}
          <div 
            className="rounded-2xl p-6 space-y-4 border"
            style={{ backgroundColor: 'var(--status-success-soft)', borderColor: 'rgba(16, 185, 129, 0.35)' }}
          >
            <div className="flex items-center gap-2 font-bold text-emerald-500 text-sm uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4" /> The YatraSetu Ecosystem
            </div>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span> <strong>Budget-First Allocation:</strong> Every stay, meal, and transit mode dynamically fits your limit.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span> <strong>Highway Math:</strong> Real-time FASTag toll tariffs and mileage-based fuel estimation.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span> <strong>Ministry Trust Index:</strong> Explainable 0–100% score backed by 360° video audits.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span> <strong>1-Click Budget Recovery:</strong> Instantly replaces components if costs exceed boundaries.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 7. VERIFIED HUMAN TESTIMONIALS ── */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Real Traveler Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-heritage" style={{ color: 'var(--text-heading)' }}>
            Loved by Travelers Across India 🇮🇳
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, idx) => (
            <div 
              key={idx}
              className="rounded-2xl p-5 border flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex gap-0.5 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {t.saved}
                  </span>
                </div>
                <p className="text-xs sm:text-sm italic leading-relaxed text-slate-600 dark:text-slate-300">
                  "{t.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-default)' }}>
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-amber-500/30" />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold" style={{ color: 'var(--text-heading)' }}>{t.name}</h3>
                  <p className="text-[11px] text-slate-400">{t.city} • {t.trip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      </div>{/* End constrained container */}

      {/* ── 8. TRAVEL FOR LIFE & CALL TO ACTION — FULL BLEED ── */}
      <section 
        className="w-full p-8 sm:p-16 text-center space-y-6 relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
        }}
      >
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-amber-500 text-slate-950">
            Travel For LiFE 🌱
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-heritage">
            Ready to Plan Your Next Journey?
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200">
            Plan your next journey with transparent costs, verified local homestays, and automated budget protection.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => navigate('/plan')}
            className="px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-xl"
            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#0F172A' }}
          >
            Start Budget Planning <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => navigate('/chat')}
            className="px-8 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all flex items-center justify-center gap-2 border bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-md"
          >
            <Cpu className="w-4 h-4 text-amber-400" /> Talk to AI Assistant
          </button>
          <button 
            onClick={() => navigate('/auth')}
            className="px-6 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all flex items-center justify-center gap-2 border bg-white/5 text-amber-300 hover:bg-white/15 border-amber-400/30 backdrop-blur-md"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Partner / Sign In
          </button>
        </div>
      </section>

    </motion.div>
  );
}
