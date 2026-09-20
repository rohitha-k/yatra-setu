import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Search } from 'lucide-react';
import { pageVariants, staggerContainer, itemFadeUp } from '../animations/variants';

export default function DestinationsCatalog() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('travexa_search');
    if (raw) {
      setSearchParams(JSON.parse(raw));
    }
  }, []);

  const handlePlanDestination = (destinationName) => {
    const startingLoc = searchParams?.startingLocation || 'Hyderabad';
    const travelers = searchParams?.travelersCount || 2;
    const days = searchParams?.daysCount || 3;
    const budget = searchParams?.budgetLimit || 15000;

    const payload = {
      startingLocation: startingLoc,
      destinationPreference: destinationName,
      travelersCount: travelers,
      daysCount: days,
      budgetLimit: budget,
      travelMode: 'Train'
    };

    localStorage.setItem('travexa_search', JSON.stringify(payload));
    navigate('/planner');
  };

  const catalogDestinations = [
    {
      name: "Hampi",
      category: "Heritage",
      state: "Karnataka",
      days: 3,
      estCost: 12600,
      image: "/hampi_ruins.jpg",
      attractions: ["Virupaksha Temple", "Stone Chariot", "Hampi Ruins"],
      tags: { hotel: true, homestay: true, food: true, guide: true, transit: true }
    },
    {
      name: "Araku Valley",
      category: "Nature",
      state: "Andhra Pradesh",
      days: 3,
      estCost: 11000,
      image: "/araku_valley.jpg",
      attractions: ["Borra Caves", "Katiki Waterfalls", "Coffee Plantations"],
      tags: { hotel: true, homestay: true, food: true, guide: false, transit: true }
    },
    {
      name: "Tirupati",
      category: "Spiritual",
      state: "Andhra Pradesh",
      days: 2,
      estCost: 8000,
      image: "/tirupati_temple.jpg",
      attractions: ["Venkateswara Temple", "Silathoranam", "Kapila Theertham"],
      tags: { hotel: true, homestay: false, food: true, guide: true, transit: true }
    },
    {
      name: "Varanasi",
      category: "Spiritual",
      state: "Uttar Pradesh",
      days: 3,
      estCost: 10000,
      image: "/varanasi_ghats.jpg",
      attractions: ["Kashi Vishwanath Temple", "Dashashwamedh Ghat", "Sarnath"],
      tags: { hotel: true, homestay: true, food: true, guide: true, transit: true }
    },
    {
      name: "Coorg",
      category: "Nature",
      state: "Karnataka",
      days: 3,
      estCost: 14000,
      image: "/coorg_hills.jpg",
      attractions: ["Abbey Falls", "Raja's Seat", "Golden Temple"],
      tags: { hotel: true, homestay: true, food: true, guide: false, transit: true }
    },
    {
      name: "Jaipur",
      category: "Heritage",
      state: "Rajasthan",
      days: 4,
      estCost: 18000,
      image: "/jaipur_palace.jpg",
      attractions: ["Hawa Mahal", "Amer Fort", "City Palace"],
      tags: { hotel: true, homestay: true, food: true, guide: true, transit: true }
    },
    {
      name: "Munnar",
      category: "Nature",
      state: "Kerala",
      days: 3,
      estCost: 15000,
      image: "/munnar_hills.jpg",
      attractions: ["Eravikulam National Park", "Mattupetty Dam", "Tea Gardens"],
      tags: { hotel: true, homestay: true, food: true, guide: false, transit: true }
    },
    {
      name: "Varkala",
      category: "Beach",
      state: "Kerala",
      days: 3,
      estCost: 13000,
      image: "/varkala_beach.jpg",
      attractions: ["Varkala Beach", "Janardhana Swamy Temple", "Varkala Cliff"],
      tags: { hotel: true, homestay: true, food: true, guide: false, transit: true }
    },
    {
      name: "Goa",
      category: "Beach",
      state: "Goa",
      days: 4,
      estCost: 16500,
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
      attractions: ["Calangute Beach", "Basilica of Bom Jesus", "Dudhsagar Falls"],
      tags: { hotel: true, homestay: true, food: true, guide: true, transit: true }
    },
    {
      name: "Ooty",
      category: "Nature",
      state: "Tamil Nadu",
      days: 3,
      estCost: 12500,
      image: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=800",
      attractions: ["Ooty Lake", "Doddabetta Peak", "Nilgiri Toy Train"],
      tags: { hotel: true, homestay: true, food: true, guide: false, transit: true }
    },
    {
      name: "Rishikesh",
      category: "Spiritual",
      state: "Uttarakhand",
      days: 3,
      estCost: 9500,
      image: "https://images.unsplash.com/photo-1600100397990-a4b3d70f2d51?w=800",
      attractions: ["Laxman Jhula", "Triveni Ghat Aarti", "River Rafting"],
      tags: { hotel: true, homestay: true, food: true, guide: true, transit: true }
    },
    {
      name: "Udaipur",
      category: "Heritage",
      state: "Rajasthan",
      days: 3,
      estCost: 17500,
      image: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800",
      attractions: ["City Palace", "Lake Pichola Boat Ride", "Jagmandir"],
      tags: { hotel: true, homestay: true, food: true, guide: true, transit: true }
    },
    {
      name: "Alleppey",
      category: "Nature",
      state: "Kerala",
      days: 2,
      estCost: 14500,
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
      attractions: ["Backwater Houseboat Cruise", "Alappuzha Beach", "Punnamada Lake"],
      tags: { hotel: true, homestay: true, food: true, guide: true, transit: true }
    },
    {
      name: "Pondicherry",
      category: "Heritage",
      state: "Puducherry",
      days: 3,
      estCost: 13500,
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
      attractions: ["Promenade Beach", "French Quarter", "Auroville Dome"],
      tags: { hotel: true, homestay: true, food: true, guide: false, transit: true }
    },
    {
      name: "Agra",
      category: "Heritage",
      state: "Uttar Pradesh",
      days: 2,
      estCost: 10500,
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800",
      attractions: ["Taj Mahal", "Agra Fort", "Fatehpur Sikri"],
      tags: { hotel: true, homestay: true, food: true, guide: true, transit: true }
    }
  ];

  const userBudget = searchParams?.budgetLimit || 30000;
  const filtered = catalogDestinations.filter(d => {
    const fitsBudget = d.estCost <= userBudget + 10000; 
    const fitsCategory = activeCategory === 'ALL' || d.category.toUpperCase() === activeCategory.toUpperCase();
    const fitsQuery = !searchQuery.trim() || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.state.toLowerCase().includes(searchQuery.toLowerCase());
    return fitsBudget && fitsCategory && fitsQuery;
  });

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 space-y-10"
    >
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6" style={{ borderColor: 'var(--border-default)' }}>
        <div>
          <h2 className="text-3xl font-extrabold flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
            <Sparkles className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
            Indian Destinations Catalog
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose from 15+ curated heritage, hill station, coastal, and spiritual destinations.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            id="catalog-search"
            name="catalogSearch"
            aria-label="Search Destinations Catalog"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city or state..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border bg-slate-900/60 focus:outline-none focus:border-amber-500 text-white"
            style={{ borderColor: 'var(--border-default)' }}
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'Heritage', 'Nature', 'Spiritual', 'Beach'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === cat 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Catalog Grid */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filtered.map(dest => (
          <motion.div 
            key={dest.name} 
            variants={itemFadeUp}
            className="rounded-2xl overflow-hidden flex flex-col justify-between border shadow-lg transition-all hover:-translate-y-1"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
          >
            {/* Image banner */}
            <div className="w-full h-48 relative overflow-hidden bg-slate-950">
              <motion.img 
                src={dest.image}
                alt={dest.name}
                loading="lazy"
                decoding="async"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500 text-slate-950 shadow-sm">
                {dest.category}
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                <div>
                  <h3 className="text-xl font-black text-white">{dest.name}</h3>
                  <p className="text-xs text-slate-300 font-medium">{dest.state}</p>
                </div>
              </div>
            </div>

            <div className="p-5 flex flex-col flex-grow space-y-4">
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Top Attractions</p>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {dest.attractions.join(' • ')}
                </p>
              </div>

              {/* Verified Checks */}
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-300">
                {dest.tags.hotel && <span className="text-emerald-400">✓ Hotels</span>}
                {dest.tags.homestay && <span className="text-emerald-400">✓ Homestays</span>}
                {dest.tags.food && <span className="text-emerald-400">✓ Eateries</span>}
                {dest.tags.guide && <span className="text-emerald-400">✓ Guides</span>}
                {dest.tags.transit && <span className="text-emerald-400">✓ Transit</span>}
              </div>
            </div>

            {/* Price & action */}
            <div className="p-5 pt-0 mt-auto flex justify-between items-center border-t pt-4" style={{ borderColor: 'var(--border-default)' }}>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Est {dest.days}-Day Budget</p>
                <p className="text-lg font-black text-emerald-400">₹{dest.estCost.toLocaleString()}</p>
              </div>
              <button 
                type="button"
                onClick={() => handlePlanDestination(dest.name)}
                className="px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md hover:scale-105"
                style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-on-brand)' }}
              >
                Plan Trip
              </button>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 rounded-2xl text-center border space-y-3" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
            <h3 className="text-xl font-bold text-white">No destinations match your criteria</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">Try clearing your search query or selecting a different category filter.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
