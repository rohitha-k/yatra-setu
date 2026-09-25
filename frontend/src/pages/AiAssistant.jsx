import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, Send, Bot, Sparkles, User, AlertCircle, ArrowRight, 
  CheckCircle, Loader2, Calendar, ShieldCheck, MapPin, AlertTriangle, Info
} from 'lucide-react';
import { hotelService } from '../services/hotelService';
import { guideService } from '../services/guideService';

export default function AiAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'AI', 
      type: 'TEXT',
      text: "Hello! I am Travexa's AI Booking Concierge.\n\nI dynamically verify real-time availability and handle bookings for certified hotels and local guides across Varanasi, Munnar, Varkala, Coorg, Hampi, Araku, Tirupati, and Jaipur.\n\nTry typing a booking request, e.g. \"Book a hotel in Munnar for 2 guests\" or click an interactive preset below!" 
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultItinerary, setResultItinerary] = useState(null);

  // Active planning state tracking for conflict resolution
  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('travexa_search');
    if (raw) {
      setActivePlan(JSON.parse(raw));
    }
  }, []);

  const presets = [
    { label: "Plan a 3-day Hampi trip for ₹12,000", text: "Plan a 3-day Hampi trip for ₹12,000" },
    { label: "Make my trip cheaper", text: "Make my trip cheaper" },
    { label: "Keep ₹2,000 as emergency buffer", text: "Keep ₹2,000 as emergency buffer" },
    { label: "Use my own vehicle", text: "Use my own vehicle" },
    { label: "Book Homestay in Munnar", text: "Book a hotel stay in Munnar from Sept 10 to Sept 13 for 2 guests" },
    { label: "Book Resort in Hampi", text: "Book Vijayanagara Royal Resort in Hampi for Sept 10 for 2 guests" },
    { label: "Reserve Guide in Varkala", text: "Reserve local tour guide in Varkala on Sept 12" }
  ];

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userText = textToSend;
    const msgId = Date.now();
    setMessages(prev => [...prev, { id: msgId, sender: 'USER', type: 'TEXT', text: userText }]);
    setInputMsg('');
    setLoading(true);

    const clean = userText.toLowerCase();

    // Extract destination name
    let dest = "Hampi";
    const destinationsList = [
      "Hampi", "Araku Valley", "Tirupati", "Varanasi", "Coorg", "Jaipur",
      "Munnar", "Varkala", "Goa", "Ooty", "Rishikesh", "Udaipur",
      "Alleppey", "Pondicherry", "Agra"
    ];
    for (const d of destinationsList) {
      if (clean.includes(d.toLowerCase())) {
        dest = d;
        break;
      }
    }

    // Extract travelers count
    let guests = 2;
    const guestMatch = clean.match(/(\d+)\s?(?:guest|people|traveler|person|adult)/);
    if (guestMatch) guests = parseInt(guestMatch[1]);

    // Extract days count
    let days = 3;
    const daysMatch = clean.match(/(\d+)\s?day/);
    if (daysMatch) days = parseInt(daysMatch[1]);

    // 1. Handle Stay Booking Queries
    if (clean.includes("book") || clean.includes("stay") || clean.includes("hotel") || clean.includes("accommodation") || clean.includes("resort")) {
      try {
        const stays = await hotelService.getHotelsByDestination(dest);
        if (stays.length > 0) {
          const hasResort = stays.find(s => s.name.toLowerCase().includes("resort"));
          const targetStay = hasResort && clean.includes("resort") ? hasResort : stays[0];

          setTimeout(() => {
            if (hasResort && clean.includes("resort")) {
              // Resort Fully Booked Scenario with Alternatives
              const otherStays = stays.filter(s => s.id !== targetStay.id);
              setMessages(prev => [...prev, {
                id: msgId + 1,
                sender: 'AI',
                type: 'BOOKING_ALTERNATIVES',
                details: {
                  serviceType: 'HOTEL',
                  name: targetStay.name,
                  pricePerNight: targetStay.pricePerNight,
                  nights: days,
                  guests: guests,
                  dates: 'Sept 10 - Sept 13',
                  total: targetStay.pricePerNight * days,
                  facilities: 'Premium AC Rooms, Swimming Pool, Dining Room'
                },
                alternatives: [
                  {
                    type: 'DATE',
                    title: `Alternative Dates (${targetStay.name})`,
                    details: 'Sept 11 - Sept 14 (3 Nights)',
                    price: targetStay.pricePerNight * days,
                    badge: '✓ Verified Dates',
                    recommendation: `Recommended because ${targetStay.name} is fully booked on Sept 10, but has availability starting Sept 11.`
                  },
                  ...otherStays.map(s => ({
                    type: 'HOTEL',
                    title: s.name,
                    details: `Sept 10 - Sept 13 (${days} Nights)`,
                    price: s.pricePerNight * days,
                    badge: `✓ Verified Stay`,
                    recommendation: `Highly rated homestay nearby, immediately available, and saves you ₹${((targetStay.pricePerNight - s.pricePerNight) * days).toLocaleString()}.`
                  }))
                ]
              }]);
            } else {
              // Available Stay Scenario
              setMessages(prev => [...prev, {
                id: msgId + 1,
                sender: 'AI',
                type: 'BOOKING_AVAILABLE',
                details: {
                  serviceType: 'HOTEL',
                  name: targetStay.name,
                  pricePerNight: targetStay.pricePerNight,
                  nights: days,
                  guests: guests,
                  dates: `Sept 10 - Sept ${10 + days}`,
                  total: targetStay.pricePerNight * days,
                  facilities: targetStay.facilities?.join(', ') || 'Clean Restrooms, Wi-Fi, Parking'
                }
              }]);
            }
            setLoading(false);
          }, 1200);
          return;
        }
      } catch (err) {
        console.error("Hotel lookup failed", err);
      }
    }

    // 2. Handle Guide Reserving Queries
    if (clean.includes("guide") || clean.includes("reserve") || clean.includes("hire") || clean.includes("kiran")) {
      try {
        const guides = await guideService.getGuidesByDestination(dest);
        if (guides.length > 0) {
          const targetGuide = guides[0];
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: msgId + 1,
              sender: 'AI',
              type: 'BOOKING_AVAILABLE',
              details: {
                serviceType: 'GUIDE',
                name: targetGuide.name,
                pricePerDay: targetGuide.pricePerDay,
                nights: 1,
                guests: guests,
                dates: 'Sept 12',
                total: targetGuide.pricePerDay * days,
                facilities: `Fluent in local languages, certified regional heritage guide`
              }
            }]);
            setLoading(false);
          }, 1200);
          return;
        }
      } catch (err) {
        console.error("Guide lookup failed", err);
      }
    }

    // Fallback: Default Chat response from backend AI
    try {
      const response = await fetch('http://localhost:8000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, { id: msgId + 2, sender: 'AI', type: 'TEXT', text: data.message }]);
        if (data.itinerary) {
          setResultItinerary(data.itinerary);
        }
      } else {
        setMessages(prev => [...prev, { id: msgId + 2, sender: 'AI', type: 'TEXT', text: "I detected your intent but could not find matching stays or guides for this destination. Try choosing Hampi, Munnar, Varkala, or Jaipur." }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: msgId + 2, sender: 'AI', type: 'TEXT', text: "Service lookup failed. Let's redirect your criteria to the budget optimizer page." }]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-booking Confirmation handler
  const handleConfirmBooking = (msgId, details) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          type: 'BOOKING_CONFIRMED',
          bookingId: "BK-" + Math.floor(100000 + Math.random() * 900000),
          confirmedDetails: details
        };
      }
      return m;
    }));

    // Sync to dashboard localstorage
    const currentTrip = localStorage.getItem('travexa_final_trip');
    let parsedTrip = currentTrip ? JSON.parse(currentTrip) : {
      travelMode: 'Own Vehicle',
      selectedTransport: { id: "OWN-CAR", cost: 1000, details: "Own Car Route" },
      activitiesCost: 1500,
      localTransitCost: 800,
      budgetLimit: 15000,
      daysCount: 3,
      travelersCount: 2,
      startingLocation: 'Hyderabad',
      destination: 'Hampi'
    };

    if (details.serviceType === 'HOTEL') {
      parsedTrip.selectedAccommodation = {
        name: details.name,
        pricePerNight: details.pricePerNight,
        cost: details.total
      };
    } else if (details.serviceType === 'GUIDE') {
      parsedTrip.selectedGuide = {
        name: details.name,
        pricePerDay: details.pricePerDay,
        cost: details.total
      };
    }

    localStorage.setItem('travexa_final_trip', JSON.stringify(parsedTrip));
  };

  // Alternative Selection Handler (Triggers multi-service check)
  const handleSelectAlternative = (msgId, alt, originalDetails) => {
    if (alt.type === 'DATE') {
      // DATE change conflicts with transport (September 10 vs September 11) - Trigger Conflict Resolution!
      setMessages(prev => prev.map(m => {
        if (m.id === msgId) {
          return {
            ...m,
            type: 'BOOKING_CONFLICT',
            conflictDetails: {
              targetService: 'Hotel: ' + originalDetails.name,
              targetDates: 'Sept 11 - Sept 14',
              conflictReason: 'Rescheduling stay to Sept 11 conflicts with your pre-planned Train tickets departing on Sept 10.',
              rescheduleCost: originalDetails.total + 1050,
              originalDetails,
              alt
            }
          };
        }
        return m;
      }));
    } else {
      // Just a different hotel on same dates - confirm directly!
      const newDetails = {
        ...originalDetails,
        name: alt.title,
        pricePerNight: alt.price / originalDetails.nights,
        total: alt.price
      };
      handleConfirmBooking(msgId, newDetails);
    }
  };

  // Bulk Conflict Reschedule Confirmation
  const handleConfirmConflictResolution = (msgId, conflict) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          type: 'BOOKING_CONFIRMED',
          bookingId: "BK-" + Math.floor(100000 + Math.random() * 900000),
          confirmedDetails: {
            serviceType: 'HOTEL & TRANSIT',
            name: `${conflict.alt.title} & Train Seats Rescheduled`,
            dates: conflict.targetDates,
            total: conflict.rescheduleCost,
            facilities: 'Train seats rescheduled to Sept 11, Stay dates locked to Sept 11 - Sept 14'
          }
        };
      }
      return m;
    }));

    // Update localStorage
    const currentTrip = localStorage.getItem('travexa_final_trip');
    let parsedTrip = currentTrip ? JSON.parse(currentTrip) : {};
    parsedTrip.selectedAccommodation = {
      name: conflict.alt.title,
      pricePerNight: 4500,
      cost: 13500
    };
    parsedTrip.selectedTransport = {
      id: "TRN-RESCH",
      cost: 700,
      details: "Rescheduled Train Seats: Hyderabad to Hampi (Sept 11)"
    };
    localStorage.setItem('travexa_final_trip', JSON.stringify(parsedTrip));
  };

  return (
    <div className="max-w-6xl mx-auto py-8 grid md:grid-cols-4 gap-8">
      
      {/* Left Chat Window */}
      <div 
        className="md:col-span-3 flex flex-col h-[650px] justify-between relative overflow-hidden rounded-2xl shadow-xl"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
      >
        
        {/* Header */}
        <div 
          className="p-5 flex items-center justify-between z-10 relative"
          style={{ backgroundColor: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-xl shadow-sm flex items-center justify-center" 
              style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-heading)' }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight" style={{ color: 'var(--text-heading)' }}>
                AI Travel Concierge
              </h3>
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Your premium booking co-pilot
              </span>
            </div>
          </div>
          <span 
            className="text-[10px] px-3 py-1.5 rounded-full font-bold uppercase flex items-center gap-1.5 shadow-sm"
            style={{ backgroundColor: 'var(--status-success)', color: '#fff' }}
          >
            <span style={{ fontSize: '10px' }}>●</span> Online
          </span>
        </div>

        {/* Quick Prompts */}
        <div 
          className="p-3 flex gap-2 overflow-x-auto scrollbar-none z-10 relative shadow-sm"
          style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}
        >
          {presets.map((p, i) => (
            <button 
              key={i} 
              onClick={() => handleSendMessage(p.text)}
              className="text-xs px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              style={{ 
                backgroundColor: 'var(--bg-elevated)', 
                color: 'var(--text-primary)', 
                border: '1px solid var(--border-default)' 
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm scrollbar-thin scroll-smooth relative z-0">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-4 max-w-[85%] ${m.sender === 'USER' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm shrink-0`}
                style={{ 
                  backgroundColor: m.sender === 'USER' ? 'var(--brand-primary)' : 'var(--bg-elevated)', 
                  color: m.sender === 'USER' ? '#fff' : 'var(--brand-primary)',
                  border: m.sender === 'USER' ? 'none' : '1px solid var(--border-default)'
                }}
              >
                {m.sender === 'USER' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* RENDER TYPE 1: TEXT MESSAGE */}
              {m.type === 'TEXT' && (
                <div 
                  className="p-4 rounded-2xl whitespace-pre-line leading-relaxed shadow-sm text-sm"
                  style={{ 
                    backgroundColor: m.sender === 'USER' ? 'var(--brand-primary)' : 'var(--bg-elevated)',
                    color: m.sender === 'USER' ? '#fff' : 'var(--text-primary)',
                    border: m.sender === 'USER' ? 'none' : '1px solid var(--border-default)',
                    borderTopRightRadius: m.sender === 'USER' ? '4px' : '16px',
                    borderTopLeftRadius: m.sender === 'AI' ? '4px' : '16px',
                  }}
                >
                  {m.text}
                </div>
              )}

              {/* RENDER TYPE 2: BOOKING AVAILABLE WIDGET */}
              {m.type === 'BOOKING_AVAILABLE' && (
                <div 
                  className="card rounded-2xl p-5 shadow-sm space-y-4 w-full"
                  style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
                >
                  <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <span 
                      className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase flex items-center gap-1.5"
                      style={{ backgroundColor: 'var(--status-success)', color: '#fff' }}
                    >
                      <span>●</span> Available
                    </span>
                    <strong className="text-lg" style={{ color: 'var(--text-heading)' }}>
                      ₹{(m.details.pricePerNight || m.details.pricePerDay || 0).toLocaleString()}/day
                    </strong>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-base" style={{ color: 'var(--text-heading)' }}>{m.details.name}</h4>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Dates: <strong style={{ color: 'var(--text-primary)' }}>{m.details.dates}</strong></p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Travelers: <strong style={{ color: 'var(--text-primary)' }}>{m.details.guests} Guests</strong></p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Facilities: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{m.details.facilities}</span></p>
                  </div>
                  <div className="flex justify-between items-center pt-3 mt-1" style={{ borderTop: '1px solid var(--border-default)' }}>
                    <div>
                      <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-secondary)' }}>Total Cost:</span>
                      <p className="font-bold text-lg" style={{ color: 'var(--text-heading)' }}>₹{m.details.total.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => handleConfirmBooking(m.id, m.details)}
                      className="px-5 py-2.5 font-bold uppercase rounded-lg text-xs transition-transform hover:scale-105 shadow-sm"
                      style={{ backgroundColor: 'var(--brand-primary)', color: '#fff' }}
                    >
                      Confirm Booking
                    </button>
                  </div>
                </div>
              )}

              {/* RENDER TYPE 3: RANKED ALTERNATIVES WIDGET */}
              {m.type === 'BOOKING_ALTERNATIVES' && (
                <div 
                  className="card rounded-2xl p-5 shadow-sm space-y-4 w-full"
                  style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
                >
                  <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <span 
                      className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase flex items-center gap-1.5"
                      style={{ backgroundColor: 'var(--status-danger)', color: '#fff' }}
                    >
                      <span>●</span> Fully Booked
                    </span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--status-danger)' }}>{m.details.name}</span>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>Intelligent Concierge Recommendations:</h4>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      The requested stay is fully booked for Sept 10. I searched similar nearby hotels and alternative date slots. Select one to proceed:
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {m.alternatives.map((alt, idx) => (
                      <div 
                        key={idx} 
                        className="p-4 rounded-xl space-y-3 transition-colors"
                        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span 
                              className="text-[10px] px-2 py-1 rounded uppercase font-bold"
                              style={{ backgroundColor: 'var(--brand-primary)', color: '#fff' }}
                            >
                              {alt.badge}
                            </span>
                            <h5 className="font-bold text-sm mt-2.5" style={{ color: 'var(--text-heading)' }}>{alt.title}</h5>
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{alt.details}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>₹{alt.price.toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="text-xs italic p-2.5 rounded-md" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                          💡 {alt.recommendation}
                        </p>
                        <div className="text-right">
                          <button 
                            onClick={() => handleSelectAlternative(m.id, alt, m.details)}
                            className="px-4 py-2 font-bold text-xs uppercase rounded-lg shadow-sm transition-transform hover:scale-105"
                            style={{ backgroundColor: 'var(--brand-primary)', color: '#fff' }}
                          >
                            Select Alternative
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RENDER TYPE 4: MULTI-SERVICE SCHEDULING CONFLICT RESOLUTION */}
              {m.type === 'BOOKING_CONFLICT' && (
                <div 
                  className="card rounded-2xl p-5 shadow-sm space-y-4 w-full"
                  style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
                >
                  <div className="flex items-center gap-2 font-bold text-sm pb-3" style={{ color: 'var(--status-danger)', borderBottom: '1px solid var(--border-default)' }}>
                    <AlertTriangle className="w-5 h-5" />
                    <span>Scheduling Conflict Detected</span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
                    {m.conflictDetails.conflictReason}
                  </p>
                  <div className="p-4 rounded-xl space-y-2 text-xs" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                    <p>• Stay Rescheduled to: <strong style={{ color: 'var(--text-primary)' }}>{m.conflictDetails.targetDates}</strong></p>
                    <p>• Transit Seats Rescheduled to: <strong style={{ color: 'var(--text-primary)' }}>Sept 11 Departure</strong></p>
                    <p className="font-bold text-sm mt-2" style={{ color: 'var(--brand-primary)' }}>
                      Total Rescheduled Booking Value: ₹{m.conflictDetails.rescheduleCost.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-3 justify-end pt-3 mt-1" style={{ borderTop: '1px solid var(--border-default)' }}>
                    <button 
                      onClick={() => handleConfirmConflictResolution(m.id, m.conflictDetails)}
                      className="px-5 py-2.5 font-bold uppercase rounded-lg text-xs shadow-sm transition-transform hover:scale-105"
                      style={{ backgroundColor: 'var(--brand-primary)', color: '#fff' }}
                    >
                      Reschedule & Book All
                    </button>
                  </div>
                </div>
              )}

              {/* RENDER TYPE 5: BOOKING CONFIRMED SUCCESS STATUS */}
              {m.type === 'BOOKING_CONFIRMED' && (
                <div 
                  className="card rounded-2xl p-5 shadow-sm space-y-4 w-full animate-pulse-once"
                  style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
                >
                  <div className="flex items-center gap-2 font-bold text-sm pb-3" style={{ color: 'var(--status-success)', borderBottom: '1px solid var(--border-default)' }}>
                    <CheckCircle className="w-5 h-5" />
                    <span>Booking Confirmed successfully!</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <p style={{ color: 'var(--text-secondary)' }}>Item Booked: <strong style={{ color: 'var(--text-heading)' }}>{m.confirmedDetails.name}</strong></p>
                    <p style={{ color: 'var(--text-secondary)' }}>Dates Locked: <span style={{ color: 'var(--text-primary)' }}>{m.confirmedDetails.dates}</span></p>
                    <p style={{ color: 'var(--text-secondary)' }}>Total Charged: <span className="font-bold text-sm" style={{ color: 'var(--status-success)' }}>₹{m.confirmedDetails.total.toLocaleString()}</span></p>
                    <p style={{ color: 'var(--text-secondary)' }}>Booking Reference: <strong style={{ color: 'var(--brand-primary)' }}>{m.bookingId}</strong></p>
                  </div>
                  <div className="p-3 rounded-xl text-xs flex items-center gap-2" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                    <Info className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
                    <span>Itinerary updated. Confirmed bookings will display on your route map and itineraries feed.</span>
                  </div>
                </div>
              )}

            </div>
          ))}

          {loading && (
            <div className="flex gap-4 max-w-[85%] items-center">
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm shrink-0"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
              >
                <Bot className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
              </div>
              <div 
                className="p-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
              >
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--brand-primary)' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--brand-primary)', animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--brand-primary)', animationDelay: '0.2s' }}></div>
                </div>
                <span className="ml-2">Checking Availability...</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div 
          className="p-5 z-10 relative"
          style={{ backgroundColor: 'var(--bg-elevated)', borderTop: '1px solid var(--border-default)' }}
        >
          <div className="flex gap-3">
            <input 
              id="ai-chat-input"
              name="aiChatInput"
              aria-label="Ask AI Booking Concierge"
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputMsg)}
              placeholder="Ask AI Booking Concierge to plan your trip, book stays, or optimize budget..."
              className="flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--bg-surface)', 
                border: '1px solid var(--border-default)', 
                color: 'var(--text-primary)',
                '--tw-ring-color': 'var(--brand-primary)' 
              }}
            />
            <button 
              onClick={() => handleSendMessage(inputMsg)}
              className="px-5 rounded-xl transition-colors flex items-center justify-center shadow-sm hover:opacity-90"
              style={{ backgroundColor: 'var(--brand-primary)', color: '#fff' }}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar: AI Parsed Results */}
      <div 
        className="card rounded-2xl p-6 flex flex-col justify-between h-[650px] shadow-xl"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
      >
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 pb-4" style={{ color: 'var(--text-heading)', borderBottom: '1px solid var(--border-default)' }}>
            <Sparkles className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
            Interactive Agent Info
          </h3>

          <div className="space-y-5 text-sm">
            <div 
              className="rounded-xl p-4 space-y-3 leading-relaxed"
              style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
            >
              <h4 className="font-bold uppercase text-xs" style={{ color: 'var(--text-heading)' }}>Concierge Features:</h4>
              <p>• <strong>Availability verification</strong>: Queries the local MongoDB/mock services list to fetch live entries.</p>
              <p>• <strong>Intelligent fallback</strong>: Recommends alternative options in the same city.</p>
              <p>• <strong>Multi-service rescheduling</strong>: Resolves scheduling conflicts automatically.</p>
            </div>
            
            {activePlan && (
              <div 
                className="rounded-xl p-5 space-y-3"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
              >
                <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-secondary)' }}>Active Search Profile</span>
                <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                  <span>Destination:</span>
                  <strong style={{ color: 'var(--text-heading)' }}>{activePlan.destinationPreference || 'Hampi'}</strong>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                  <span>Travelers:</span>
                  <strong style={{ color: 'var(--text-heading)' }}>{activePlan.travelersCount || 2} Guests</strong>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                  <span>Budget Limit:</span>
                  <strong className="text-base" style={{ color: 'var(--brand-primary)' }}>₹{(activePlan.budgetLimit || 15000).toLocaleString()}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3.5 font-bold text-sm uppercase rounded-xl transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 mt-4"
          style={{ 
            backgroundColor: 'var(--bg-elevated)', 
            border: '1px solid var(--border-default)', 
            color: 'var(--text-heading)' 
          }}
        >
          View Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
