import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapPin, Navigation, Map, CloudRain, Sun, Wind, Flame, Building2, Package, Bike, TreePine, Utensils, Hospital, ShoppingBag, Landmark } from 'lucide-react';

interface MarkerProp {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'comercio' | 'emprendedor';
}

interface ArgentinaMapProps {
  gpsSimulating: boolean;
  gpsProgress: number;
  userCoords?: { lat: number; lng: number };
  markers: MarkerProp[];
}

const createCustomIcon = (iconEle: React.ReactElement, colorClass: string, label: string) => {
  const htmlString = renderToStaticMarkup(
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', borderRadius: '999px', padding: '4px', border: '1px solid rgba(75,85,99,0.5)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}>
        {React.cloneElement(iconEle as React.ReactElement<{ className: string }>, { className: `w-3 h-3 ${colorClass}` })}
      </div>
      <span className={`text-[11px] font-medium leading-none ${colorClass}`} style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.9)' }}>
        {label}
      </span>
    </div>
  );

  return new L.DivIcon({
    html: htmlString,
    className: 'custom-leaflet-icon-wrapper',
    iconSize: [200, 24],
    iconAnchor: [12, 12],
  });
};

const mapLocations = [
  { lat: -27.352, lng: -55.897, title: 'Muelle de Pescadores', icon: <TreePine />, color: 'text-emerald-500' },
  { lat: -27.355, lng: -55.893, title: 'Parque República del Paraguay', icon: <TreePine />, color: 'text-emerald-500' },
  { lat: -27.358, lng: -55.888, title: 'La Ruedita', icon: <Utensils />, color: 'text-orange-500' },
  { lat: -27.362, lng: -55.892, title: 'PATOTÍ', icon: <MapPin />, color: 'text-gray-400' },
  { lat: -27.366, lng: -55.896, title: 'VILLA DE LA CHACRA 65', icon: <MapPin />, color: 'text-gray-400' },
  { lat: -27.363, lng: -55.884, title: 'CERRO PELÓN', icon: <MapPin />, color: 'text-gray-400' },
  { lat: -27.366, lng: -55.892, title: 'Plaza San Martín', icon: <TreePine />, color: 'text-emerald-500' },
  { lat: -27.364, lng: -55.888, title: 'Plaza 9 de Julio', icon: <TreePine />, color: 'text-emerald-500' },
  { lat: -27.367, lng: -55.887, title: 'Anyway', icon: <ShoppingBag />, color: 'text-blue-400' },
  { lat: -27.371, lng: -55.891, title: 'Sanatorio Boratti', icon: <Hospital />, color: 'text-red-400' },
  { lat: -27.369, lng: -55.880, title: 'Cuarto Tramo, Costanera', icon: <Landmark />, color: 'text-[#E066FF]' },
  { lat: -27.375, lng: -55.884, title: 'Costanera Posadas', icon: <Landmark />, color: 'text-[#E066FF]' },
];

export const ArgentinaMap: React.FC<ArgentinaMapProps> = ({
  gpsSimulating,
  gpsProgress,
  userCoords,
  markers
}) => {
  return (
    <div className="flex-1 flex flex-col relative rounded-[2rem] overflow-hidden border border-gray-800/80 min-h-[400px] shadow-2xl w-full h-full">
      {/* HUD OVERLAYS */}
      <div className="absolute top-5 left-5 z-[1000] flex items-center bg-[#07090C]/95 px-4 py-2.5 rounded-xl border border-gray-800/60 shadow-xl gap-3">
        <div className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </div>
        <div className="flex flex-col">
           <span className="text-white font-extrabold text-[10px] tracking-widest uppercase leading-tight font-display">Vínculo Satelital</span>
           <span className="text-gray-500 font-bold text-[8px] tracking-wider uppercase leading-tight">Sincronización: 14ms</span>
        </div>
      </div>

      <div className="absolute bottom-5 right-5 z-[1000] flex items-center bg-black/95 px-5 py-3 rounded-full border border-gray-800/80 shadow-xl gap-2.5">
        <Bike className="w-4 h-4 text-cyan-400" />
        <span className="text-white text-[11px] font-black tracking-widest uppercase font-display">Simulador</span>
      </div>

      {/* LEAFLET MAP */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={[-27.365, -55.890]} 
          zoom={14.5} 
          scrollWheelZoom={true} 
          style={{ width: '100%', height: '100%', background: '#0a0e17' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {mapLocations.map((loc, i) => (
            <Marker 
              key={i} 
              position={[loc.lat, loc.lng]}
              icon={createCustomIcon(loc.icon, loc.color, loc.title)}
            />
          ))}

          {userCoords && gpsSimulating && (
            <Marker position={[userCoords.lat, userCoords.lng]} icon={createCustomIcon(<Bike />, 'text-cyan-400', 'Repartidor')} />
          )}
        </MapContainer>
      </div>
      
      {/* CSS to remove leaflet background to make badges visible properly */}
      <style>{`
        .custom-leaflet-icon-wrapper {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          background: #0a0e17 !important;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};

