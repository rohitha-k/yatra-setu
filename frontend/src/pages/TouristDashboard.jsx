import React, { useState, useEffect } from 'react';
import { Sparkles, Navigation, Calendar, IndianRupee, Users, Compass, CompassIcon, ShieldAlert, Languages, Info, CloudSun, MapPin, Gauge } from 'lucide-react';
import { API, MOCK_DESTINATIONS } from '../services/api';

export default function TouristDashboard() {
  const [destinations, setDestinations] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  
  // Itinerary Form State
  const [selectedDest, setSelectedDest] = useState('1'); // Goa default
  const [duration, setDuration] = useState(3);
  const [budget, setBudget] = useState(15000);
  const [guests, setGuests] = useState(2);
  const [interests, setInterests] = useState(['nature', 'culture']);
  const [style, setStyle] = useState('Leisure');
  const [crowdPref, setCrowdPref] = useState('Low');
  
  const [isPlanning, setIsPlanning] = useState(false);
  const [itineraryResult, setItineraryResult] = useState(null);

  // Multilingual assistant state
  const [language, setLanguage] = useState('English');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: "Namaste! I am your TourismOS AI assistant. Select a language and ask me about nearby destinations, crowd congestion warnings, or safety alerts!" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    API.getDestinations().then(setDestinations).catch(() => {});
    API.getAlerts().then(setActiveAlerts).catch(() => {});
  }, []);

  const handleInterestToggle = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleGenerateItinerary = async (e) => {
    e.preventDefault();
    setIsPlanning(true);
    try {
      const result = await API.generateItinerary({
        destination_id: parseInt(selectedDest),
        duration_days: duration,
        budget: parseFloat(budget),
        guests: parseInt(guests),
        interests,
        travel_style: style,
        crowd_preference: crowdPref
      });
      setItineraryResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlanning(false);
    }
  };

  // Multilingual response mapping for demo
  const MULTILINGUAL_ANSWERS = {
    English: {
      crowd: "Araku Valley currently has a moderate load (30% utilization). Goa is extremely high (92% utilization). We recommend shifting towards Araku Valley or Visakhapatnam to avoid peak crowds.",
      safety: "Heavy rainfall alert is active for Ooty. High landslide risk. Beach warnings are active in Goa due to high winds.",
      fallback: "I have registered your request. According to our TourismOS flow engine, alternative spots are available with a 35% cost advantage."
    },
    Telugu: {
      crowd: "అరకు వ్యాలీ ప్రస్తుతం తక్కువ రద్దీతో ఉంది (30% వినియోగం). గోవాలో అత్యధిక రద్దీ ఉంది (92%). కాబట్టి అరకు వ్యాలీని సందర్శించాల్సిందిగా సిఫార్సు చేస్తున్నాము.",
      safety: "ఊటీలో భారీ వర్షాల హెచ్చరిక ఉంది. భూకుంపాల ప్రమాదం ఎక్కువ. ప్రయాణాలు వాయిదా వేసుకోవడం మంచిది.",
      fallback: "మీరు కోరిన వివరాలు అందాయి. అరకు సమీపంలో రద్దీ లేని పర్యాటక ప్రాంతాలు అందుబాటులో ఉన్నాయి."
    },
    Hindi: {
      crowd: "अराकू घाटी में वर्तमान में कम भीड़ है (30% क्षमता)। गोवा में भीड़ बहुत अधिक है (92% क्षमता)। हम सुझाव देते हैं कि आप शांत अनुभव के लिए अराकू या विशाखापत्तनम जाएं।",
      safety: "ऊटी में भारी बारिश की चेतावनी दी गई है। भूस्खलन का खतरा अधिक है। कृपया सुरक्षित स्थानों पर रहें।",
      fallback: "आपके प्रश्न के अनुसार, हमारे फ्लो इंजन ने विशाखापत्तनम के पास कम भीड़ वाले 3 विकल्पों की पहचान की है।"
    },
    Tamil: {
      crowd: "அரக்கு பள்ளத்தாக்கில் தற்போது மிதமான கூட்டம் உள்ளது (30%). கோவாவில் கூட்டம் மிக அதிகம் (92%). கூட்டத்தை தவிர்க்க அரக்கு செல்ல பரிந்துரைக்கிறோம்.",
      safety: "ஊட்டியில் பலத்த மழை எச்சரிக்கை விடுக்கப்பட்டுள்ளது. நிலச்சரிவு அபாயம் அதிகம் உள்ளது. கவனமாக இருக்கவும்.",
      fallback: "எங்கள் சுற்றுலாத் தகவல் எஞ்சின் படி, ஊட்டியை விட மைசூர் குறைந்த செலவில் சிறந்த தேர்வாக இருக்கும்."
    },
    Kannada: {
      crowd: "ಅರಕು ಕಣಿವೆಯಲ್ಲಿ ಪ್ರವಾಸಿಗರ ಸಂಖ್ಯೆ ಕಡಿಮೆ ಇದೆ (30%). ಗೋವಾದಲ್ಲಿ ಅತಿ ಹೆಚ್ಚು ಜನದಟ್ಟಣೆ ಇದೆ (92%). ಆದ್ದರಿಂದ ಅರಕು ಕಣಿವೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.",
      safety: "ಊಟಿಯಲ್ಲಿ ಭಾರಿ ಮಳೆ ಎಚ್ಚರಿಕೆ ನೀಡಲಾಗಿದೆ. ಭೂಕುಸಿತದ ಸಾಧ್ಯತೆ ಇದ್ದು ಜಾಗರೂಕರಾಗಿರಿ.",
      fallback: "ಕಡಿಮೆ ಜನದಟ್ಟಣೆ ಇರುವ ಸುಸ್ಥಿರ ತಾಣಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ."
    },
    Malayalam: {
      crowd: "അരക്കു താഴ്‌വരയിൽ ഇപ്പോൾ തിരക്ക് കുറവാണ് (30%). ഗോവയിൽ അതീവ തിരക്കാണ് (92%). തിരക്ക് ഒഴിവാക്കാൻ അരക്കു തിരഞ്ഞെടുക്കൂ.",
      safety: "ഊട്ടിയിൽ ശക്തമായ മഴ മുന്നറിയിപ്പുണ്ട്. ഉരുൾപൊട്ടൽ സാധ്യതയുള്ളതിനാൽ യാത്ര ഒഴിവാക്കുക.",
      fallback: "നിങ്ങൾക്കായി സുസ്ഥിര വിനോദസഞ്ചാര പാക്കേജുകൾ തയ്യാറാക്കിയിട്ടുണ്ട്."
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim().toLowerCase();
    setChatHistory(prev => [...prev, { sender: 'user', text: chatInput }]);
    setChatInput('');
    setChatLoading(true);

    setTimeout(() => {
      let replyText = "";
      const langAnswers = MULTILINGUAL_ANSWERS[language] || MULTILINGUAL_ANSWERS['English'];

      if (userMsg.includes('crowd') || userMsg.includes('congest') || userMsg.includes('traffic') || userMsg.includes('రద్దీ') || userMsg.includes('भीड़') || userMsg.includes('கூட்டம்') || userMsg.includes('ದಟ್ಟಣೆ')) {
        replyText = langAnswers.crowd;
      } else if (userMsg.includes('safe') || userMsg.includes('rain') || userMsg.includes('weather') || userMsg.includes('వర్షం') || userMsg.includes('बारिश') || userMsg.includes('மழை') || userMsg.includes('ಮಳೆ')) {
        replyText = langAnswers.safety;
      } else {
        replyText = langAnswers.fallback;
      }

      setChatHistory(prev => [...prev, { sender: 'ai', text: replyText }]);
      setChatLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Compass className="w-6 h-6 text-cyan-400" />
          Tourist Decision Portal
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Generate smart, crowd-redistributed travel itineraries and chat with our localized AI assistant.
        </p>
      </div>

      {/* Grid: Left Column (Itinerary), Right Column (Alerts & Multilingual Assistant) */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Travel Planner */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-premium rounded-xl p-5 border border-white/5">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              AI Distributed Itinerary Planner
            </h3>
            
            <form onSubmit={handleGenerateItinerary} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Primary Target Destination</label>
                <select 
                  value={selectedDest} 
                  onChange={(e) => setSelectedDest(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/60 rounded px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  {destinations.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Duration (Days)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="14" 
                  value={duration} 
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/60 rounded px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Budget Limit (INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-semibold">₹</span>
                  <input 
                    type="number" 
                    min="1000" 
                    value={budget} 
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/60 rounded pl-7 pr-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Number of Travelers</label>
                <input 
                  type="number" 
                  min="1" 
                  value={guests} 
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/60 rounded px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Crowd Preference</label>
                <select 
                  value={crowdPref} 
                  onChange={(e) => setCrowdPref(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/60 rounded px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Low">Low Crowd (Redistribution Active)</option>
                  <option value="Moderate">Moderate Capacity</option>
                  <option value="High">No Preference</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Travel Style</label>
                <select 
                  value={style} 
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/60 rounded px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Leisure">Leisure & Comfort</option>
                  <option value="Adventure">Outdoor Adventure</option>
                  <option value="Budget">Backpacker Budget</option>
                  <option value="Luxury">Premium Luxury</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {['nature', 'culture', 'adventure', 'leisure'].map(interest => (
                    <button
                      type="button"
                      key={interest}
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-3 py-1.5 rounded text-xs font-medium border capitalize transition-all ${
                        interests.includes(interest)
                          ? "bg-cyan-950/40 border-cyan-400 text-cyan-400"
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={isPlanning}
                  className="w-full py-2.5 rounded bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold transition-all glow-cyan flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {isPlanning ? "Processing Flow Matrix..." : "Generate AI Distributed Itinerary"}
                </button>
              </div>
            </form>
          </div>

          {/* Itinerary Output Panel */}
          {itineraryResult && (
            <div className="glass-premium rounded-xl p-5 border border-cyan-500/20 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h4 className="text-lg font-bold text-white flex items-center gap-1.5">
                    Itinerary for {itineraryResult.destination_name}
                  </h4>
                  {itineraryResult.alternative_used && (
                    <p className="text-xs text-cyan-400 font-medium mt-0.5">
                      ★ Crowding Imbalance Detected: Swapped day schedules to <span className="font-bold underline">{itineraryResult.alternative_used}</span> to reduce overcrowding!
                    </p>
                  )}
                </div>
                
                {/* Stats */}
                <div className="flex gap-4">
                  {itineraryResult.crowd_reduction_pct > 0 && (
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Crowd Reduction</p>
                      <p className="text-sm font-extrabold text-brand-secondary">-{itineraryResult.crowd_reduction_pct}%</p>
                    </div>
                  )}
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Sustainability Score</p>
                    <p className="text-sm font-extrabold text-cyan-400">{itineraryResult.sustainability_score}/100</p>
                  </div>
                </div>
              </div>

              {/* Day Details */}
              <div className="space-y-4">
                {itineraryResult.itinerary_days.map(d => (
                  <div key={d.day} className="border-l-2 border-cyan-500 pl-4 py-1 space-y-1.5 bg-slate-950/20 pr-2">
                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Day {d.day} - {d.location}</h5>
                    <div className="grid md:grid-cols-3 gap-2 text-xs text-slate-400">
                      <div><strong className="text-slate-200">Morning:</strong> {d.morning}</div>
                      <div><strong className="text-slate-200">Afternoon:</strong> {d.afternoon}</div>
                      <div><strong className="text-slate-200">Evening:</strong> {d.evening}</div>
                    </div>
                    <p className="text-[10px] text-cyan-500/80 italic flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      {d.sustainability_tips}
                    </p>
                  </div>
                ))}
              </div>

              {/* Budget Breakdown */}
              <div className="bg-slate-950/50 rounded-lg p-4 border border-white/5 space-y-3">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">Dynamic Budget Distribution Breakdown</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="border-r border-white/5">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Accommodation / Day</p>
                    <p className="text-sm font-bold text-white">₹{itineraryResult.budget_breakdown.accommodation_per_day.toLocaleString()}</p>
                  </div>
                  <div className="border-r border-white/5">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Dining / Day</p>
                    <p className="text-sm font-bold text-white">₹{itineraryResult.budget_breakdown.food_per_day.toLocaleString()}</p>
                  </div>
                  <div className="border-r border-white/5">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Experiences Total</p>
                    <p className="text-sm font-bold text-white">₹{itineraryResult.budget_breakdown.activities_total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Transport Est.</p>
                    <p className="text-sm font-bold text-white">₹{itineraryResult.budget_breakdown.transport_total.toLocaleString()}</p>
                  </div>
                </div>
                <div className="border-t border-white/5 pt-2 text-right">
                  <span className="text-xs text-slate-400 font-semibold mr-2">Total Project Cost:</span>
                  <span className="text-sm font-extrabold text-cyan-400">₹{itineraryResult.budget_breakdown.total_estimated.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Alerts & Multilingual AI Assistant */}
        <div className="space-y-6">
          {/* Active Warnings Cards */}
          <div className="glass rounded-xl p-5 border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Safety Advisories & Warnings
            </h3>
            <div className="space-y-3">
              {activeAlerts.map(alert => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border text-xs leading-relaxed ${
                    alert.severity === 'CRITICAL' 
                      ? 'bg-rose-950/20 border-rose-500/30 text-rose-300' 
                      : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                  }`}
                >
                  <div className="font-bold uppercase flex items-center gap-1 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                    {alert.severity} Alert
                  </div>
                  {alert.message}
                </div>
              ))}
            </div>
          </div>

          {/* Multilingual Assistant Panel */}
          <div className="glass rounded-xl p-5 border border-white/5 flex flex-col h-[380px] justify-between">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-cyan-400" />
                Multilingual Assistant
              </h3>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-900 border border-slate-700/60 rounded px-2 py-1 text-[10px] text-cyan-400 font-semibold focus:outline-none"
              >
                <option value="English">English</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="Tamil">தமிழ் (Tamil)</option>
                <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                <option value="Malayalam">മലയാളം (Malayalam)</option>
              </select>
            </div>

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto my-3 space-y-3 pr-1 text-xs">
              {chatHistory.map((c, idx) => (
                <div key={idx} className={`flex ${c.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] p-2.5 rounded-lg leading-relaxed ${
                      c.sender === 'user' 
                        ? 'bg-cyan-950/30 border border-cyan-500/20 text-cyan-300'
                        : 'bg-slate-950/60 border border-white/5 text-slate-300'
                    }`}
                  >
                    {c.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-950/60 border border-white/5 p-2 rounded-lg text-slate-500 italic">
                    AI is writing in {language}...
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ask about crowd levels or rain warnings..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700/60 rounded px-2 py-1.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
              <button 
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-3 py-1.5 rounded text-xs transition-colors shrink-0"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
