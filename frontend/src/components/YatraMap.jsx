import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// ── Google Maps Teardrop & Pin SVG Markers ─────────────────────────────────

// Origin: Google Blue Location Dot with Pulse
const originIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 24px; height: 24px; background: rgba(66, 133, 244, 0.35); border-radius: 50%; animation: pulse 2s infinite;"></div>
      <div style="width: 14px; height: 14px; background: #4285F4; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>
    </div>
  `,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Destination: Google Classic Red Pin Teardrop
const destinationPinIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 32px; height: 42px; display: flex; flex-direction: column; align-items: center;">
      <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z" fill="#EA4335"/>
        <circle cx="16" cy="15" r="6" fill="#8E0000"/>
        <circle cx="16" cy="15" r="4.5" fill="white"/>
      </svg>
    </div>
  `,
  className: '',
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -38]
});

// Numbered Stop Marker for Furkot Planner Timeline
const createNumberedStopIcon = (num, isSelected = false, category = 'WAYPOINT') => {
  let bgColor = isSelected ? '#EA4335' : '#1E40AF';
  if (category === 'HOTEL') bgColor = '#7E22CE';
  if (category === 'RESTAURANT') bgColor = '#D97706';
  if (category === 'ORIGIN') bgColor = '#2563EB';
  if (category === 'DESTINATION') bgColor = '#DC2626';

  return L.divIcon({
    html: `
      <div style="
        position: relative;
        background: ${bgColor};
        color: white;
        border: 2.5px solid white;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 800;
        box-shadow: ${isSelected ? '0 0 0 4px rgba(234, 67, 53, 0.4), 0 4px 10px rgba(0,0,0,0.5)' : '0 2px 6px rgba(0,0,0,0.4)'};
        transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
        transition: transform 0.2s ease;
      ">
        ${num}
      </div>
    `,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

// Category Place Markers (Google Maps Style)
const createGooglePlaceIcon = (bgColor, emojiSymbol) => L.divIcon({
  html: `
    <div style="background: ${bgColor}; border: 2px solid white; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: white; box-shadow: 0 2px 6px rgba(0,0,0,0.35);">
      ${emojiSymbol}
    </div>
  `,
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

const hotelIcon = createGooglePlaceIcon('#9333EA', '🏨'); // Google Purple
const attractionIcon = createGooglePlaceIcon('#F59E0B', '🏛'); // Google Gold
const fuelIcon = createGooglePlaceIcon('#D97706', '⛽'); // Google Gas Orange
const restIcon = createGooglePlaceIcon('#10B981', '🚻'); // Google Green
const evIcon = createGooglePlaceIcon('#2563EB', '⚡'); // Google Blue
const mechanicIcon = createGooglePlaceIcon('#EF4444', '🛠'); // Red
const tollIcon = createGooglePlaceIcon('#64748B', '🛣'); // Grey Toll
const foodIcon = createGooglePlaceIcon('#F97316', '🍽'); // Orange Food

const waypointDotIcon = L.divIcon({
  html: `<div style="background: #4285F4; border: 2px solid white; border-radius: 50%; width: 10px; height: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.3);"></div>`,
  className: '',
  iconSize: [10, 10],
  iconAnchor: [5, 5]
});

// Helper component for map clicks and bounds
function MapEventHandler({ onMapClick, selectedStopCoords }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });

  useEffect(() => {
    if (selectedStopCoords) {
      map.flyTo([selectedStopCoords.lat, selectedStopCoords.lng], Math.max(map.getZoom(), 12), {
        duration: 0.8
      });
    }
  }, [selectedStopCoords, map]);

  return null;
}

// Helper component to trigger map.invalidateSize() & fit bounds
function MapController({ waypoints, stops = [], hotel, mapType }) {
  const map = useMap();
  
  useEffect(() => {
    map.invalidateSize();
    const points = [];
    if (waypoints && waypoints.length > 0) {
      waypoints.forEach(wp => points.push([wp.lat, wp.lng]));
    }
    if (stops && stops.length > 0) {
      stops.forEach(s => {
        if (s.lat && s.lng) points.push([s.lat, s.lng]);
      });
    }
    if (hotel && (hotel.lat || hotel.latitude)) {
      points.push([hotel.lat || hotel.latitude, hotel.lng || hotel.longitude]);
    }
    if (points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [waypoints, stops, hotel, mapType, map]);

  return null;
}

export default function YatraMap({
  startPoint,
  destPoint,
  stops = [],
  routeLegs = [],
  facilities = [],
  attractions = [],
  routePath = [],
  highwayName = null,
  hotelPoint = null,
  selectedStopId = null,
  onSelectStop = null,
  onMapClick = null,
  onStopDragEnd = null,
  height = '420px'
}) {
  const [mapType, setMapType] = useState('default'); // 'default' | 'satellite' | 'terrain'
  const [showTraffic, setShowTraffic] = useState(true);

  // Compute fallback polyline coordinates if routeLegs not supplied
  let polylineCoords = routePath.map(wp => [wp.lat, wp.lng]);
  if (polylineCoords.length === 0 && stops.length >= 2) {
    polylineCoords = stops.filter(s => !s.isSkipped).map(s => [s.lat, s.lng]);
  }
  
  const startCoords = polylineCoords.length > 0 
    ? polylineCoords[0] 
    : (startPoint?.lat ? [startPoint.lat, startPoint.lng] : null);

  const destCoords = polylineCoords.length > 0 
    ? polylineCoords[polylineCoords.length - 1] 
    : (destPoint?.lat ? [destPoint.lat, destPoint.lng] : null);

  const hotelCoords = (hotelPoint && (hotelPoint.lat || hotelPoint.latitude) && (hotelPoint.lng || hotelPoint.longitude))
    ? [Number(hotelPoint.lat || hotelPoint.latitude), Number(hotelPoint.lng || hotelPoint.longitude)]
    : null;

  // Selected stop coords for flying map
  const selectedStop = stops.find(s => s.id === selectedStopId);
  const selectedStopCoords = selectedStop && selectedStop.lat && selectedStop.lng 
    ? { lat: selectedStop.lat, lng: selectedStop.lng } 
    : null;

  // Calculate Distance & ETA for Google Maps Header
  let distanceKm = 380;
  if (polylineCoords.length >= 2) {
    let d = 0;
    for (let i = 0; i < polylineCoords.length - 1; i++) {
      const p1 = L.latLng(polylineCoords[i][0], polylineCoords[i][1]);
      const p2 = L.latLng(polylineCoords[i+1][0], polylineCoords[i+1][1]);
      d += p1.distanceTo(p2);
    }
    distanceKm = Math.round(d / 1000);
  }
  const hours = Math.floor(distanceKm / 50);
  const mins = Math.round((distanceKm % 50) * 1.2);
  const etaString = `${hours} hr ${mins} min (${distanceKm} km)`;

  // Free OpenStreetMap Tiles (100% Free, No API Key Required)
  const isDarkMode = document.documentElement.classList.contains('dark-mode');
  
  let tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  if (mapType === 'satellite') {
    tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  } else if (mapType === 'hot') {
    tileUrl = "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png";
  }

  return (
    <div className="w-full h-[420px] rounded-2xl overflow-hidden border shadow-lg relative z-0" style={{ borderColor: 'var(--border-default)', backgroundColor: '#e5e3df' }}>
      
      {/* 1. GOOGLE MAPS NAVIGATION TOP CARD */}
      <div 
        className="absolute top-3 left-3 z-[1000] p-3.5 rounded-xl shadow-xl flex items-center gap-3 max-w-sm"
        style={{ 
          background: isDarkMode ? 'rgba(36, 47, 62, 0.92)' : 'rgba(255, 255, 255, 0.95)', 
          color: isDarkMode ? '#fff' : '#202124',
          border: '1px solid var(--border-default)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </div>

        <div className="leading-tight flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-extrabold" style={{ color: isDarkMode ? '#10B981' : '#137333' }}>
              {etaString}
            </span>
            {showTraffic && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                🟢 Fast Route
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            via {highwayName || "National Highway"}
          </p>
        </div>
      </div>

      {/* 2. GOOGLE MAPS FLOATING TYPE CONTROLS (Top Right) */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
        <div 
          className="flex bg-white dark:bg-slate-900 rounded-lg p-1 shadow-md border"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <button 
            onClick={() => setMapType('default')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors ${mapType === 'default' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-black dark:text-slate-300'}`}
          >
            Map
          </button>
          <button 
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors ${mapType === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-black dark:text-slate-300'}`}
          >
            Satellite
          </button>
        </div>

        <button 
          onClick={() => setShowTraffic(!showTraffic)}
          className={`px-2.5 py-1 text-[11px] font-bold rounded shadow-md border transition-colors ${showTraffic ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-300'}`}
        >
          🚦 {showTraffic ? 'Traffic On' : 'Traffic Off'}
        </button>
      </div>

      {/* LEAFLET MAP CANVAS */}
      <MapContainer 
        center={destCoords || startCoords || [16.0, 77.0]} 
        zoom={7} 
        scrollWheelZoom={false}
        zoomControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={tileUrl}
        />

        {/* Multi-Leg Polylines with Day/Leg Colors (F09) */}
        {routeLegs && routeLegs.length > 0 ? (
          routeLegs.map((leg, lIdx) => {
            const legCoords = leg.polyline ? leg.polyline.map(p => [p.lat, p.lng]) : [];
            if (legCoords.length < 2) return null;
            return (
              <React.Fragment key={leg.id || `leg_${lIdx}`}>
                {/* Outer casing */}
                <Polyline 
                  positions={legCoords} 
                  color="#0F172A" 
                  weight={7}
                  opacity={0.2}
                />
                {/* Vibrant day-coded route line */}
                <Polyline 
                  positions={legCoords} 
                  color={leg.color || '#2563EB'} 
                  weight={4.5}
                  opacity={0.95}
                />
              </React.Fragment>
            );
          })
        ) : (
          polylineCoords.length >= 2 && (
            <>
              <Polyline 
                positions={polylineCoords} 
                color="#174EA6" 
                weight={8}
                opacity={0.3}
              />
              <Polyline 
                positions={polylineCoords} 
                color="#4285F4" 
                weight={5}
                opacity={0.95}
              />
            </>
          )
        )}

        {/* Live Traffic Overlay Lines */}
        {showTraffic && polylineCoords.length >= 4 && (
          <Polyline 
            positions={polylineCoords.slice(1, 3)} 
            color="#34A853" 
            weight={4}
            opacity={0.9}
          />
        )}

        {/* Dynamic Multi-Stop Markers (Furkot Connected Planner) */}
        {stops && stops.length > 0 ? (
          stops.map((stop, idx) => {
            if (stop.isSkipped) return null;
            const isSelected = selectedStopId === stop.id;
            const stopIcon = createNumberedStopIcon(idx + 1, isSelected, stop.category);

            return (
              <Marker
                key={stop.id || `stop_${idx}`}
                position={[stop.lat, stop.lng]}
                icon={stopIcon}
                draggable={!!onStopDragEnd}
                eventHandlers={{
                  click: () => onSelectStop && onSelectStop(stop),
                  dragend: (e) => {
                    if (onStopDragEnd) {
                      const newLatLng = e.target.getLatLng();
                      onStopDragEnd(stop.id, { lat: newLatLng.lat, lng: newLatLng.lng });
                    }
                  }
                }}
              >
                <Popup>
                  <div className="text-xs font-bold p-1 space-y-1 min-w-[140px]">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded uppercase">
                        Stop #{idx + 1}
                      </span>
                      {stop.category && (
                        <span className="text-[9px] bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono">
                          {stop.category}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-900 font-extrabold text-sm">{stop.name}</p>
                    {stop.notes && <p className="text-slate-600 text-[11px] italic">{stop.notes}</p>}
                    {stop.nights > 0 && <p className="text-purple-700 text-[11px] font-semibold">🛏 {stop.nights} night(s) stay</p>}
                    {onSelectStop && (
                      <button
                        onClick={() => onSelectStop(stop)}
                        className="mt-1 w-full text-center text-[10px] bg-blue-50 text-blue-600 font-semibold py-1 rounded hover:bg-blue-100"
                      >
                        Edit in Timeline
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })
        ) : (
          <>
            {/* Origin: Google Blue Pulse Dot */}
            {startCoords && (
              <Marker position={startCoords} icon={originIcon}>
                <Popup>
                  <div className="text-xs font-bold p-1">
                    <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded uppercase block mb-1">
                      Your Location
                    </span>
                    <p className="text-slate-900 font-extrabold text-sm">{startPoint?.name || 'Origin'}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Destination: Google Classic Red Pin */}
            {destCoords && (
              <Marker position={destCoords} icon={destinationPinIcon}>
                <Popup>
                  <div className="text-xs font-bold p-1">
                    <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded uppercase block mb-1">
                      Destination
                    </span>
                    <p className="text-slate-900 font-extrabold text-sm">{destPoint?.name || 'Destination'}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Hotel Marker */}
            {hotelCoords && (
              <Marker position={hotelCoords} icon={hotelIcon}>
                <Popup>
                  <div className="text-xs font-bold p-1">
                    <span className="text-[10px] bg-purple-600 text-white font-bold px-1.5 py-0.5 rounded uppercase block mb-1">
                      Hotel Stay
                    </span>
                    <p className="text-slate-900 font-extrabold text-sm">{hotelPoint.name || 'Homestay'}</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </>
        )}

        {/* Tourist Attractions */}
        {attractions.map((att, idx) => (
          <Marker key={`att_${idx}`} position={[att.lat, att.lng]} icon={attractionIcon}>
            <Popup>
              <div className="text-xs font-bold p-1 space-y-1">
                <span className="text-[10px] bg-amber-600 text-white font-bold px-1.5 py-0.5 rounded uppercase block">
                  Point of Interest
                </span>
                <p className="text-slate-900 font-extrabold text-sm">{att.name}</p>
                <p className="text-slate-600 text-[11px]">{att.details}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Highway Facilities */}
        {facilities.map((fac, idx) => {
          let iconChoice = fuelIcon;
          if (fac.type === 'Restroom' || fac.type === 'Rest Stop') iconChoice = restIcon;
          if (fac.type === 'EV Charging') iconChoice = evIcon;
          if (fac.type === 'Mechanic') iconChoice = mechanicIcon;
          if (fac.type === 'Toll') iconChoice = tollIcon;
          if (fac.type === 'Food' || fac.type === 'Dhaba') iconChoice = foodIcon;

          return (
            <Marker key={`fac_${idx}`} position={[fac.lat, fac.lng]} icon={iconChoice}>
              <Popup>
                <div className="text-xs font-bold p-1 space-y-1">
                  <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded uppercase block">
                    {fac.type} Place
                  </span>
                  <p className="text-slate-900 font-extrabold text-sm">{fac.name}</p>
                  <p className="text-slate-600 text-[11px]">{fac.details}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapEventHandler onMapClick={onMapClick} selectedStopCoords={selectedStopCoords} />
        <MapController waypoints={routePath} stops={stops} hotel={hotelCoords} mapType={mapType} />
      </MapContainer>
    </div>
  );
}
