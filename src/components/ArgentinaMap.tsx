import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { 
  MapPin, Bike, TreePine, Utensils, Hospital, ShoppingBag, Landmark, 
  Sun, Moon, Sparkles, Maximize2, Minimize2, CloudRain, Shield, Navigation 
} from 'lucide-react';

interface MarkerProp {
  id: string;
  name: string;
  x: number;
  y: number;
  lat?: number;
  lng?: number;
  type: 'comercio' | 'emprendedor' | 'repartidor' | 'pedido';
  details?: string;
}

interface ArgentinaMapProps {
  gpsSimulating: boolean;
  gpsProgress: number;
  userCoords?: { lat: number; lng: number };
  markers?: MarkerProp[];
}

const createCustomIcon = (iconEle: React.ReactElement, colorClass: string, label: string) => {
  const htmlString = renderToStaticMarkup(
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(6px)', borderRadius: '999px', padding: '5px', border: '1.5px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 16px -2px rgba(0, 0, 0, 0.6)' }}>
        {React.cloneElement(iconEle as React.ReactElement<{ className: string }>, { className: `w-3.5 h-3.5 ${colorClass}` })}
      </div>
      <span className={`text-[10px] font-black leading-none ${colorClass}`} style={{ textShadow: '0px 1.5px 4px rgba(0,0,0,1)' }}>
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

const defaultLocations: MarkerProp[] = [
  { id: '1', x: -27.352, y: -55.897, lat: -27.352, lng: -55.897, name: 'Muelle de Pescadores', type: 'emprendedor', details: 'Feria agroecológica' },
  { id: '2', x: -27.355, y: -55.893, lat: -27.355, lng: -55.893, name: 'Parque de la República', type: 'emprendedor', details: 'Pan artesanal' },
  { id: '3', x: -27.358, y: -55.888, lat: -27.358, lng: -55.888, name: 'La Ruedita', type: 'comercio', details: 'Pizzería B2B' },
  { id: '4', x: -27.362, y: -55.892, lat: -27.362, lng: -55.892, name: 'PATOTÍ Comidas', type: 'comercio', details: 'Minutas' },
  { id: '5', x: -27.369, y: -55.880, lat: -27.369, lng: -55.880, name: 'Costanera Cuarto Tramo', type: 'emprendedor', details: 'Pastelería' },
];

export const ArgentinaMap: React.FC<ArgentinaMapProps> = ({
  gpsSimulating,
  gpsProgress,
  userCoords,
  markers = []
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapTheme, setMapTheme] = useState<'day' | 'night' | 'auto'>('night');
  const [resolvedTheme, setResolvedTheme] = useState<'day' | 'night'>('night');

  useEffect(() => {
    if (mapTheme === 'auto') {
      const hours = new Date().getHours();
      const isNight = hours >= 19 || hours < 7;
      setResolvedTheme(isNight ? 'night' : 'day');
    } else {
      setResolvedTheme(mapTheme);
    }
  }, [mapTheme]);

  const tileUrl = resolvedTheme === 'day'
    ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  const allMarkers = [
    ...defaultLocations,
    ...markers
  ];

  const mapComponent = (
    <div className={`w-full h-full relative transition-all duration-300`}>
      {/* HUD OVERLAYS: Satelital Link status */}
      <div className="absolute top-5 left-5 z-[1000] flex items-center bg-[#07090C]/95 px-4 py-2.5 rounded-xl border border-gray-800/60 shadow-xl gap-3">
        <div className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </div>
        <div className="flex flex-col">
           <span className="text-white font-extrabold text-[10px] tracking-widest uppercase leading-tight font-display">Vínculo Satelital</span>
           <span className="text-gray-500 font-bold text-[8px] tracking-wider uppercase leading-tight">CABA Realtime Link</span>
        </div>
      </div>

      {/* HUD OVERLAYS: Top Right controls */}
      <div className="absolute top-5 right-5 z-[1000] flex items-center gap-2">
        {/* Theme select controls */}
        <div className="flex bg-[#07090C]/95 p-1 rounded-xl border border-gray-800/60 shadow-xl gap-1">
          <button
            onClick={() => setMapTheme('day')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
              mapTheme === 'day' ? 'bg-blue-brand text-white' : 'text-gray-500 hover:text-white'
            }`}
            title="Modo Día (Day Mode)"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMapTheme('night')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
              mapTheme === 'night' ? 'bg-blue-brand text-white' : 'text-gray-500 hover:text-white'
            }`}
            title="Modo Noche (Night Mode)"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMapTheme('auto')}
            className={`p-1.5 rounded-lg text-[9px] font-extrabold px-2 transition-all uppercase ${
              mapTheme === 'auto' ? 'bg-blue-brand text-white' : 'text-gray-500 hover:text-white'
            }`}
            title="Modo Automático"
          >
            Auto
          </button>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-[#07090C]/95 hover:bg-[#151D25] border border-gray-800/60 p-2.5 rounded-xl transition-all cursor-pointer shadow-xl text-white flex items-center gap-1.5 text-xs font-black uppercase tracking-wider select-none active:scale-95"
          title="Expandir mapa a pantalla completa"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4 text-orange-400" />
              <span>Contraer Mapa</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4 text-blue-brand" />
              <span>Expandir Mapa</span>
            </>
          )}
        </button>
      </div>

      {/* Map Container */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={[-27.365, -55.890]} 
          zoom={14.5} 
          scrollWheelZoom={true} 
          style={{ width: '100%', height: '100%', background: resolvedTheme === 'day' ? '#e4e8f0' : '#0a0e17' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url={tileUrl} />
          
          {allMarkers.map((loc, i) => (
            <Marker 
              key={i} 
              position={[loc.lat || loc.x, loc.lng || loc.y]}
              icon={createCustomIcon(
                loc.type === 'comercio' ? <Shield /> : <MapPin />,
                loc.type === 'comercio' ? 'text-yellow-400' : 'text-green-success',
                loc.name
              )}
            />
          ))}

          {userCoords && gpsSimulating && (
            <Marker 
              position={[userCoords.lat, userCoords.lng]} 
              icon={createCustomIcon(<Bike />, 'text-cyan-400 animate-pulse', 'Repartidor Activo (Carlos)')} 
            />
          )}
        </MapContainer>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[99999] bg-[#0A0A0A] flex flex-col p-4 animate-fade-in">
        <div className="flex justify-between items-center bg-[#141414] border border-gray-brand p-4 rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3">
            <BrandLogo variant="main" size="sm" />
            <div>
              <h3 className="font-black text-sm tracking-tight text-white uppercase leading-none font-display">Mapa de Operaciones Expandido</h3>
              <span className="text-[9px] text-gray-500 font-mono">Modo de pantalla completa • CABA</span>
            </div>
          </div>
          <button
            onClick={() => setIsFullscreen(false)}
            className="bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-extrabold px-4 py-2 rounded-xl text-xs uppercase tracking-widest select-none active:scale-95"
          >
            Cerrar Mapa
          </button>
        </div>
        <div className="flex-1 bg-black border-x border-b border-gray-brand rounded-b-3xl overflow-hidden relative">
          {mapComponent}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative rounded-[2rem] overflow-hidden border border-gray-800/80 min-h-[400px] shadow-2xl w-full h-full">
      {mapComponent}
      <style>{`
        .custom-leaflet-icon-wrapper {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};
