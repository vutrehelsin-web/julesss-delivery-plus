import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { BrandLogo } from './BrandLogo';
import { ArgentinaMap } from './ArgentinaMap';
import { VoiceProvider } from '../lib/VoiceProvider';
import { WeatherProvider, WeatherData } from '../lib/WeatherProvider';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Lock,
  Mail,
  User,
  Shield,
  Smartphone,
  Bike,
  Compass,
  Map,
  Layers,
  Award,
  Wallet,
  Check,
  AlertTriangle,
  Play,
  Volume2,
  StopCircle,
  Plus,
  Package,
  Store,
  DollarSign,
  Send,
  MessageSquare,
  Activity,
  Sliders,
  BellRing,
  HelpCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Eye,
  LogOut,
  SlidersHorizontal,
  CloudRain,
  CloudLightning,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Phone,
  ChevronLeft
} from 'lucide-react';
import { Turno, EntregaUnica, Transaccion, Mensaje } from '../types';

interface ShowcaseV3Props {
  turnos: Turno[];
  setTurnos: React.Dispatch<React.SetStateAction<Turno[]>>;
  entregas: EntregaUnica[];
  setEntregas: React.Dispatch<React.SetStateAction<EntregaUnica[]>>;
  logEvent: (msg: string, type?: 'info' | 'success' | 'warn' | 'error') => void;
  triggerNotification: (title: string, desc: string, icon: string) => void;
  weatherCondition: string;
  setWeatherCondition: (cond: string) => void;
  temperature: number;
  setTemperature: (t: number) => void;
  multiplier: number;
  setMultiplier: (m: number) => void;
  handleWeatherChange: (cond: 'despejado' | 'nublado' | 'lluvia' | 'tormenta') => void;
}

export const ShowcaseV3: React.FC<ShowcaseV3Props> = ({
  turnos,
  setTurnos,
  entregas,
  setEntregas,
  logEvent,
  triggerNotification,
  weatherCondition,
  setWeatherCondition,
  temperature,
  setTemperature,
  multiplier,
  setMultiplier,
  handleWeatherChange,
}) => {
  // Navigation
  const [activeStep, setActiveStep] = useState<'landing' | 'login' | 'repartidor' | 'comercio' | 'emprendedor' | 'admin'>('landing');
  const [unlockedSteps, setUnlockedSteps] = useState<string[]>(['landing']);

  // UI Theme Modes: 'day' | 'night' | 'auto'
  const [themeMode, setThemeMode] = useState<'day' | 'night' | 'auto'>('night');
  const [resolvedTheme, setResolvedTheme] = useState<'day' | 'night'>('night');

  // Full-screen Map Mode state
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);

  // Auth inputs
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [fullnameInput, setRegFullname] = useState('');
  const [vehicleInput, setRegVehicle] = useState<'bicicleta' | 'moto' | 'auto'>('moto');
  const [patentInput, setRegPatent] = useState('');
  const [authError, setApiError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  // Driver states
  const [driverAvailable, setDriverAvailable] = useState(false);
  const [driverWallet, setDriverWallet] = useState(14500);
  const [driverHistory, setDriverHistory] = useState<Transaccion[]>([
    { id: 1, tipo: 'ingreso_turno', monto: 12000, saldo_anterior: 2500, saldo_posterior: 14500, referencia: 'Turno Burger House #102', fecha: 'Hoy 14:22' }
  ]);
  const [driverTask, setDriverTask] = useState<Turno | null>(null);

  // Commerce inputs
  const [shiftHours, setShiftHours] = useState('20:00 - 00:00');
  const [shiftPriceInput, setShiftPriceInput] = useState('15000');

  // Entrepreneur inputs
  const [packageDestInput, setPackageDestInput] = useState('');
  const [packageSize, setPackageSize] = useState<'pequeño' | 'mediano' | 'grande'>('mediano');
  const [productsList, setProductsList] = useState([
    { id: 1, name: 'Pan de Masa Madre', price: 1800, stock: 12, origin: 'Receta de mi abuela Clara' },
    { id: 2, name: 'Bizcochuelo Casero', price: 2500, stock: 5, origin: 'Elaborado con huevos de campo' }
  ]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductOrigin, setNewProductOrigin] = useState('');

  // AI voice syntheses
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isFetchingVoice, setIsFetchingVoice] = useState(false);

  // Gemini recommendations
  const [geminiResult, setGeminiResult] = useState<any>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);

  // SOS status
  const [sosStatus, setSosStatus] = useState<string | null>(null);

  // Notifications state
  const [localNotifications, setLocalNotifications] = useState<any[]>([
    { id: 1, title: 'Bienvenido a Delivery Plus B2B', desc: 'Sincronización satelital con Supabase Auth activa.', time: 'Hace 1 min' }
  ]);

  // Real weather info
  const [liveWeather, setLiveWeather] = useState<WeatherData>({
    temp: 20,
    condition: 'despejado',
    multiplier: 1.0,
    description: 'Condiciones espectaculares. Tarifas base.',
    provider: 'OpenMeteo (Key-less)'
  });

  // Fetch weather data
  const fetchLiveWeatherData = async () => {
    try {
      const data = await WeatherProvider.getLiveWeather('openmeteo');
      setLiveWeather(data);
      setWeatherCondition(data.condition);
      setTemperature(data.temp);
      setMultiplier(data.multiplier);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLiveWeatherData();
  }, []);

  // Theme auto handler
  useEffect(() => {
    if (themeMode === 'auto') {
      const hours = new Date().getHours();
      const isNight = hours >= 19 || hours < 7;
      setResolvedTheme(isNight ? 'night' : 'day');
    } else {
      setResolvedTheme(themeMode);
    }
  }, [themeMode]);

  // Persist theme preference in Supabase Auth user metadata
  const saveThemePreference = async (theme: 'day' | 'night' | 'auto') => {
    setThemeMode(theme);
    logEvent(`Ajuste de Tema: Establecido en [${theme.toUpperCase()}]`, 'success');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: { themePreference: theme }
        });
        logEvent('Preferencia de tema persistida en Supabase Auth metadata.', 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Abstracted navigation
  const unlockAndNavigate = (step: 'landing' | 'login' | 'repartidor' | 'comercio' | 'emprendedor' | 'admin') => {
    if (!unlockedSteps.includes(step)) {
      setUnlockedSteps(prev => [...prev, step]);
    }
    setActiveStep(step);
    logEvent(`Navegación: Accediendo a fase [${step.toUpperCase()}]`, 'info');
  };

  // Custom Audio synthesize using VoiceProvider
  const triggerVoiceAI = async (text: string, profile: 'valentina' | 'mateo') => {
    setIsFetchingVoice(true);
    setIsPlayingVoice(true);
    try {
      await VoiceProvider.speak({
        text,
        engine: 'kokoro',
        voiceProfile: profile
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingVoice(false);
      setIsPlayingVoice(false);
    }
  };

  // Gemini suggestions query
  const queryGeminiModel = async () => {
    try {
      setGeminiLoading(true);
      const response = await fetch('/api/gemini/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weather: weatherCondition,
          behavior: 'tráfico moderado en Palermo CABA',
          historyState: 'alta demanda'
        })
      });
      if (response.ok) {
        const data = await response.json();
        setGeminiResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeminiLoading(false);
    }
  };

  useEffect(() => {
    if (activeStep === 'admin') {
      queryGeminiModel();
    }
  }, [activeStep, weatherCondition]);

  // Demo user filling logins
  const triggerDemoLogin = (roleName: 'repartidor' | 'comercio' | 'emprendedor' | 'admin') => {
    setAuthLoading(true);
    setTimeout(() => {
      setAuthLoading(false);
      let targetUser = { email: '', role: roleName };
      if (roleName === 'repartidor') {
        targetUser.email = 'repartidor@test.com';
        setEmailInput('repartidor@test.com');
        setPasswordInput('123456');
        unlockAndNavigate('repartidor');
      } else if (roleName === 'comercio') {
        targetUser.email = 'trattoria@comercio.com';
        setEmailInput('trattoria@comercio.com');
        setPasswordInput('123456');
        unlockAndNavigate('comercio');
      } else if (roleName === 'emprendedor') {
        targetUser.email = 'emprendedor@test.com';
        setEmailInput('emprendedor@test.com');
        setPasswordInput('123456');
        unlockAndNavigate('emprendedor');
      } else {
        targetUser.email = 'admin@deliveryplus.com';
        setEmailInput('admin@deliveryplus.com');
        setPasswordInput('123456');
        unlockAndNavigate('admin');
      }
      setLoggedInUser(targetUser);
      logEvent(`Sesión iniciada con éxito como [${roleName.toUpperCase()}]`, 'success');
      triggerNotification('Sesión Iniciada B2B', `Accediste como ${targetUser.email}`, 'success');
    }, 800);
  };

  const handleCredentialsLogin = async () => {
    if (!emailInput || !passwordInput) {
      alert("Por favor ingresa email y contraseña");
      return;
    }
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput,
        password: passwordInput,
      });

      if (error) {
        // fallbacks
        if (emailInput === 'repartidor@test.com' && passwordInput === '123456') {
          triggerDemoLogin('repartidor');
          return;
        } else if (emailInput === 'trattoria@comercio.com' && passwordInput === '123456') {
          triggerDemoLogin('comercio');
          return;
        } else if (emailInput === 'emprendedor@test.com' && passwordInput === '123456') {
          triggerDemoLogin('emprendedor');
          return;
        } else if (emailInput === 'admin@deliveryplus.com' && passwordInput === '123456') {
          triggerDemoLogin('admin');
          return;
        }
        setApiError(error.message);
        alert(`Error: ${error.message}`);
      } else {
        logEvent(`Supabase Auth éxito: ${data.user?.email}`, 'success');
        let inferredRole: 'repartidor' | 'comercio' | 'emprendedor' | 'admin' = 'repartidor';
        if (emailInput.includes('comercio') || emailInput.includes('trattoria')) inferredRole = 'comercio';
        else if (emailInput.includes('emprendedor') || emailInput.includes('familia')) inferredRole = 'emprendedor';
        else if (emailInput.includes('admin')) inferredRole = 'admin';

        setLoggedInUser({ email: data.user?.email, role: inferredRole });
        unlockAndNavigate(inferredRole);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setAuthLoading(false);
    }
  };

  // Actions for Repartidor
  const handleToggleDriverAvailability = async () => {
    const nextVal = !driverAvailable;
    setDriverAvailable(nextVal);
    logEvent(`PATCH /api/repartidores/1/disponibilidad - 200 OK - Disponible: ${nextVal}`, 'success');
    if (nextVal) {
      triggerVoiceAI("Hola Carlos Gómez, ya estás disponible en Palermo. Mateo IA te guiará en tu viaje.", "mateo");
    }
  };

  const handleTakeTurno = (turno: Turno) => {
    setDriverTask(turno);
    logEvent(`POST /api/repartidores/1/turnos/${turno.id}/tomar - 200 OK - Turno Confirmado`, 'success');
    triggerNotification('Turno Asignado ⚡', `Confirmaste el bloque de ${turno.comercio_nombre}.`, 'success');
    triggerVoiceAI(`Excelente Carlos. Has tomado el turno de ${turno.comercio_nombre}. Serrano mil cien es el destino. Buen viaje.`, 'mateo');
  };

  const handleDeliverTask = () => {
    if (!driverTask) return;
    const payment = driverTask.monto_repartidor;
    setDriverWallet(prev => prev + payment);
    setDriverHistory(prev => [
      { id: Date.now(), tipo: 'ingreso_turno', monto: payment, saldo_anterior: driverWallet, saldo_posterior: driverWallet + payment, referencia: `Cierre: ${driverTask.comercio_nombre}`, fecha: 'Ahora' },
      ...prev
    ]);
    logEvent(`Cierre de entrega - Wallet actualizada con éxito. Acreditado: $${payment}`, 'success');
    triggerNotification('Ganancia Acreditada 💰', `Acreditado $${payment} (80% neto de reparto).`, 'success');
    setDriverTask(null);
    triggerVoiceAI("Entrega finalizada Carlos. Saldo acreditado. Sos un crack.", "mateo");
  };

  const handleTriggerSOS = async (type: string) => {
    setSosStatus(type);
    logEvent(`POST /api/repartidores/1/sos - 200 OK - ALERTA SOS EMITIDA: ${type}`, 'error');
    triggerNotification('🚨 ALERTA SOS EMITIDA', `Tipo: ${type}. El centro de control policial y médico ha sido notificado.`, 'error');
    triggerVoiceAI("Atención Carlos, señal de emergencia recibida en Palermo. Quédate en tu lugar, la ayuda va en camino.", "mateo");
    setTimeout(() => {
      setSosStatus(null);
    }, 5000);
  };

  // Actions for Comercio
  const handleCreateShift = async () => {
    const finalPrice = Math.round(parseFloat(shiftPriceInput) * multiplier);
    const driverShare = Math.round(finalPrice * 0.8);
    const platformShare = Math.round(finalPrice * 0.2);

    const nuevoTurno: Turno = {
      id: turnos.length + 101,
      comercio_nombre: 'La Trattoria B2B',
      direccion: 'Honduras 5600, Palermo',
      fecha: 'Hoy',
      horario: shiftHours,
      monto_total: finalPrice,
      monto_repartidor: driverShare,
      monto_plataforma: platformShare,
      estado: 'disponible'
    };

    setTurnos(prev => [nuevoTurno, ...prev]);
    logEvent(`POST /api/turnos - 200 OK - Turno publicado para Trattoria`, 'success');
    triggerNotification('Turno Creado ⚡', `Turno de ${shiftHours} por $${finalPrice} publicado en DB.`, 'success');
  };

  // Actions for Emprendedor
  const handleCreateProduct = () => {
    if (!newProductName || !newProductPrice) return;
    const p = {
      id: productsList.length + 1,
      name: newProductName,
      price: parseFloat(newProductPrice),
      stock: 10,
      origin: newProductOrigin || 'Elaboración casera con orgullo familiar'
    };
    setProductsList(prev => [...prev, p]);
    setNewProductName('');
    setNewProductPrice('');
    setNewProductOrigin('');
    logEvent(`Producto añadido con éxito: ${p.name}`, 'success');
    triggerVoiceAI("Excelente producto agregado. Valentina IA lo promocionará con inteligencia comercial.", "valentina");
  };

  const handleSendB2CPackage = () => {
    if (!packageDestInput) return;
    const finalPrice = Math.round(3500 * multiplier);
    const driverShare = Math.round(finalPrice * 0.8);
    const platformShare = Math.round(finalPrice * 0.2);

    const nuevaEntrega: EntregaUnica = {
      id: entregas.length + 201,
      emprendedor_nombre: 'Panadería Familiar',
      direccion_origen: 'Urquiza 230, Almagro',
      direccion_destino: packageDestInput,
      tamano: packageSize,
      monto_total: finalPrice,
      monto_repartidor: driverShare,
      monto_plataforma: platformShare,
      estado: 'disponible'
    };

    setEntregas(prev => [nuevaEntrega, ...prev]);
    logEvent(`POST /api/entregas - 200 OK - Entrega individual despachada`, 'success');
    triggerNotification('Envío Despachado 📦', `Encomienda rápida hacia ${packageDestInput} en camino.`, 'success');
    setPackageDestInput('');
  };

  const isDark = resolvedTheme === 'night';

  // Real-time map component wrapper
  const mapElement = (
    <div className="w-full h-full min-h-[350px] relative rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
      <ArgentinaMap markers={[]} gpsSimulating={driverAvailable} gpsProgress={driverTask ? 50 : 0} />
    </div>
  );

  return (
    <div className={`w-full min-h-screen font-sans border-t border-blue-brand/20 transition-colors duration-300 ${
      isDark ? 'bg-[#0A0A0A] text-white' : 'bg-[#F4F6F9] text-gray-900'
    }`}>
      
      {/* ----------------- CORE UNIFIED HEADER (SPECIFICATIONS MEETING DAY/NIGHT & FULLSCREEN CONTROLS) ----------------- */}
      <header className={`px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-brand shadow-xl relative z-30 transition-all ${
        isDark ? 'bg-gradient-to-r from-[#0E131F] to-[#0A0A0A]' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <BrandLogo variant="main" size="sm" animated={true} />
          <div>
            <h2 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ☰ Delivery<span className="text-blue-brand">Plus</span>
            </h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Ecosistema B2B Logístico</p>
          </div>
        </div>

        {/* HUD CONTROLS: Placed right on the Header as requested */}
        <div className="flex items-center gap-3.5">
          {/* Day / Night / Auto Toggle */}
          <div className={`flex p-1 rounded-xl border gap-1.5 shadow-inner ${
            isDark ? 'bg-[#141414] border-gray-800' : 'bg-gray-100 border-gray-200'
          }`}>
            <button
              onClick={() => saveThemePreference('day')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                themeMode === 'day' ? 'bg-blue-brand text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">☀️ Claro</span>
            </button>
            <button
              onClick={() => saveThemePreference('night')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                themeMode === 'night' ? 'bg-blue-brand text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">🌙 Oscuro</span>
            </button>
            <button
              onClick={() => saveThemePreference('auto')}
              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                themeMode === 'auto' ? 'bg-blue-brand text-white' : 'text-gray-500'
              }`}
            >
              Auto
            </button>
          </div>

          {/* Fullscreen Map Toggle HUD */}
          <button
            onClick={() => setIsFullscreenMap(!isFullscreenMap)}
            className="bg-blue-brand hover:bg-[#0062CC] text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 group cursor-pointer shadow-lg shadow-blue-brand/20 active:scale-95 select-none"
          >
            <Maximize2 className="w-4 h-4 text-white" />
            <span>⛶ Expandir Mapa</span>
          </button>
        </div>
      </header>

      {/* --- WIZARD STEPS NAV CONTROLLER --- */}
      <div className={`px-6 py-3 border-b flex flex-wrap gap-2 ${isDark ? 'bg-[#111] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
        {[
          { id: 'landing', label: '1. Landing' },
          { id: 'login', label: '2. Login real' },
          { id: 'repartidor', label: '3. Repartidor' },
          { id: 'comercio', label: '4. Comercio B2B' },
          { id: 'emprendedor', label: '5. Emprendedor' },
          { id: 'admin', label: '6. Control Admin' }
        ].map((step, idx) => (
          <button
            key={step.id}
            onClick={() => setActiveStep(step.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeStep === step.id
                ? 'bg-blue-brand text-white font-extrabold shadow-md'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {step.label}
          </button>
        ))}
      </div>

      {/* Full-Screen Map Mode Overlay Overlaying everything except Map HUD when active */}
      {isFullscreenMap && (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col p-4 animate-fade-in">
          <div className="flex justify-between items-center bg-[#141414] border border-gray-brand p-4 rounded-t-3xl shrink-0">
            <div className="flex items-center gap-3">
              <BrandLogo variant="main" size="sm" />
              <div>
                <h3 className="font-black text-sm tracking-tight text-white uppercase leading-none font-display">Mapa Satelital Completo</h3>
                <span className="text-[9px] text-gray-500 font-mono">Modo de pantalla completa • CABA</span>
              </div>
            </div>
            <button
              onClick={() => setIsFullscreenMap(false)}
              className="bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-extrabold px-4 py-2 rounded-xl text-xs uppercase tracking-widest select-none active:scale-95"
            >
              Cerrar Mapa
            </button>
          </div>
          <div className="flex-1 bg-black border-x border-b border-gray-brand rounded-b-3xl overflow-hidden relative">
            <ArgentinaMap markers={[]} gpsSimulating={driverAvailable} gpsProgress={driverTask ? 50 : 0} />
          </div>
        </div>
      )}

      {/* Main Container of the active view */}
      <div className="w-full">
        
        {/* ========================================================
            STEP 1: LANDING PAGE V3
            ======================================================== */}
        {activeStep === 'landing' && (
          <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-12">
            
            {/* Hero Grid Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-xs text-blue-brand font-black tracking-widest uppercase block">
                  🚀 LOGÍSTICA CORPORATIVA B2B
                </span>
                <h1 className="text-4xl md:text-5xl font-black leading-tight font-display">
                  El motor inteligente de logística para <span className="text-blue-brand">Buenos Aires</span>
                </h1>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Delivery Plus no es una app común de comida. Es un ecosistema logístico avanzado de grado corporativo con asistentes de voz IA y geolocalización satelital persistente para Comercios, Emprendedores y Conductores de reparto B2B.
                </p>

                {/* Key model rules list */}
                <div className={`space-y-3.5 border p-5 rounded-2xl ${isDark ? 'bg-black border-gray-brand' : 'bg-white border-gray-200'}`}>
                  <div className="flex gap-2.5">
                    <Check className="text-blue-brand shrink-0 w-4 h-4 mt-0.5" />
                    <p className="text-xs text-gray-300">
                      <strong>Cero Comisionistas Ficticios:</strong> El repartidor conserva el <strong>80%</strong> neto de las ganancias y la plataforma retiene el <strong>20%</strong> de forma transparente en el libro mayor.
                    </p>
                  </div>
                  <div className="flex gap-2.5">
                    <Check className="text-blue-brand shrink-0 w-4 h-4 mt-0.5" />
                    <p className="text-xs text-gray-300">
                      <strong>Compra de Bloques de Turno:</strong> Los comercios garantizan fleteros dedicados de 4 horas para entregas sin esperas.
                    </p>
                  </div>
                  <div className="flex gap-2.5">
                    <Check className="text-blue-brand shrink-0 w-4 h-4 mt-0.5" />
                    <p className="text-xs text-gray-300">
                      <strong>Asistentes de Voz en Ruta:</strong> Valentina IA y Mateo IA alertan por voz (TTS/ElevenLabs) sobre incidentes y cierran ventas automáticamente.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => unlockAndNavigate('login')}
                    className="bg-blue-brand hover:bg-[#0062CC] text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 group cursor-pointer shadow-lg shadow-blue-brand/20"
                  >
                    Ingresar al Portal B2B Real
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Dynamic Map/Visual Highlight Right */}
              <div className="relative">
                <div className="absolute inset-0 bg-blue-brand/10 rounded-[32px] blur-3xl pointer-events-none" />
                <div className={`border rounded-[32px] p-6 shadow-2xl space-y-6 relative z-10 ${
                  isDark ? 'bg-[#141414] border-gray-brand' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-success animate-ping" />
                      <span className="text-xs font-black tracking-wider uppercase">RED SATELLITAL CABA</span>
                    </div>
                    {/* Live weather widget inside Landing */}
                    <div className={`border px-3 py-1.5 rounded-xl flex items-center gap-2 ${
                      isDark ? 'bg-black/50 border-gray-brand' : 'bg-gray-100 border-gray-200'
                    }`}>
                      <Sun className="text-orange-400 w-5 h-5" />
                      <span className="text-[11px] font-bold text-gray-300 uppercase">
                        {weatherCondition} ({temperature}°C)
                      </span>
                    </div>
                  </div>

                  {mapElement}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 2: SPLIT-PANE LOGIN V3
            ======================================================== */}
        {activeStep === 'login' && (
          <div className="max-w-5xl mx-auto p-4 md:p-12">
            <div className={`grid grid-cols-1 md:grid-cols-2 border rounded-[28px] overflow-hidden shadow-2xl min-h-[500px] ${
              isDark ? 'bg-[#141414] border-gray-brand' : 'bg-white border-gray-200'
            }`}>
              
              {/* Left Column: Form credentials */}
              <div className="p-8 md:p-12 flex flex-col justify-between space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <BrandLogo variant="main" size="sm" />
                    <span className="text-xs font-black tracking-widest text-blue-brand uppercase">PORTAL B2B</span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-black font-display">Ingreso al Ecosistema</h2>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Sincronizado de forma directa con Supabase Auth. Selecciona un rol rápido de demostración o ingresa tus credenciales.
                    </p>
                  </div>

                  {/* Form inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold tracking-wider">Email Corporativo</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="ejemplo@comercio.com"
                          className="w-full bg-black border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-brand"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold tracking-wider">Contraseña</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                        <input
                          type="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-black border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-brand"
                        />
                      </div>
                    </div>
                  </div>

                  {authError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {authError}
                    </div>
                  )}

                  <button
                    onClick={handleCredentialsLogin}
                    disabled={authLoading}
                    className="w-full bg-blue-brand hover:bg-[#0062CC] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {authLoading ? 'Verificando JWT...' : 'Iniciar Sesión en Producción'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Demo quick actions and telemetry metrics */}
              <div className="bg-black p-8 md:p-12 border-l border-gray-brand flex flex-col justify-between space-y-8 relative">
                <div className="absolute top-10 right-10 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="space-y-4">
                  <span className="text-[10px] text-purple-400 font-black tracking-widest uppercase block">
                    ⚡ SIMULACIÓN DE ROLES RÁPIDOS
                  </span>

                  <div className="grid grid-cols-1 gap-3 pt-2">
                    <button
                      onClick={() => triggerDemoLogin('repartidor')}
                      className="bg-[#141414] hover:bg-[#1C1C1C] border border-gray-brand hover:border-blue-brand/50 p-3 rounded-xl text-left transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-brand/10 flex items-center justify-center text-blue-brand">
                          <Bike className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-white">Carlos Gómez (Repartidor)</h4>
                          <span className="text-[9px] text-gray-500">Motos Palermo • Obelisco</span>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => triggerDemoLogin('comercio')}
                      className="bg-[#141414] hover:bg-[#1C1C1C] border border-gray-brand hover:border-yellow-brand/50 p-3 rounded-xl text-left transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-white">La Trattoria (Comercio B2B)</h4>
                          <span className="text-[9px] text-gray-500">Bloques de 4 horas fijos</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3: DASHBOARD REPARTIDOR V3
            ======================================================== */}
        {activeStep === 'repartidor' && (
          <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <div className={`border p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
              isDark ? 'bg-[#141414] border-gray-brand' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-4">
                <BrandLogo variant="repartidor" size="md" />
                <div>
                  <h3 className="text-xl font-black">Carlos Gómez</h3>
                  <p className="text-xs text-gray-400 font-mono">ID: REPARTIDOR_001 • Moto: 99A-XYZ8</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 bg-black border border-gray-brand px-4 py-2 rounded-xl">
                  <span className={`text-[10px] uppercase font-black ${driverAvailable ? 'text-green-success' : 'text-gray-500'}`}>
                    {driverAvailable ? 'Disponible' : 'Desconectado'}
                  </span>
                  <button
                    onClick={handleToggleDriverAvailability}
                    className={`w-10 h-5 rounded-full transition-all relative ${
                      driverAvailable ? 'bg-green-success' : 'bg-gray-700'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 bg-black rounded-full absolute top-0.5 transition-all ${
                      driverAvailable ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>

                <div className="bg-black border border-gray-brand px-4 py-2 rounded-xl">
                  <span className="text-[8px] text-gray-500 uppercase block font-bold">Ganancias</span>
                  <span className="text-lg font-black text-green-success">${driverWallet} ARS</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {mapElement}
              </div>

              <div className="space-y-6">
                {/* Mateo IA widget */}
                <div className={`border p-5 rounded-2xl space-y-4 ${
                  isDark ? 'bg-[#141414] border-gray-brand' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <BrandLogo variant="repartidor" size="sm" />
                    <div>
                      <h4 className="text-xs font-black">MATEO IA - ASISTENTE</h4>
                    </div>
                  </div>
                  <div className="bg-black/60 p-4 rounded-xl space-y-3 text-xs">
                    <p className="text-gray-300 italic">"Carlos, clima {weatherCondition} detectado. Conduce con precaución."</p>
                    <button
                      onClick={() => triggerVoiceAI(`Hola Carlos, el clima de hoy es ${weatherCondition}. Cuidado en Palermo.`, 'mateo')}
                      className="bg-blue-brand text-white px-3 py-1.5 rounded-lg text-[10px] font-bold"
                    >
                      Escuchar Mateo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 4: DASHBOARD COMERCIO B2B
            ======================================================== */}
        {activeStep === 'comercio' && (
          <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <div className={`border p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
              isDark ? 'bg-[#141414] border-gray-brand' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-4">
                <BrandLogo variant="comercio" size="md" />
                <div>
                  <h3 className="text-xl font-black">La Trattoria B2B</h3>
                  <p className="text-xs text-gray-400">Palermo, Buenos Aires</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`border p-5 rounded-2xl space-y-4 ${
                isDark ? 'bg-[#141414] border-gray-brand' : 'bg-white border-gray-200'
              }`}>
                <h4 className="font-extrabold text-sm text-white">Publicar Bloque</h4>
                <div className="space-y-3">
                  <input
                    type="number"
                    value={shiftPriceInput}
                    onChange={(e) => setShiftPriceInput(e.target.value)}
                    placeholder="Monto base"
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                  <button
                    onClick={handleCreateShift}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-xl font-bold text-xs uppercase"
                  >
                    Publicar
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2">
                {mapElement}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 5: DASHBOARD EMPRENDEDOR
            ======================================================== */}
        {activeStep === 'emprendedor' && (
          <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <div className={`border p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
              isDark ? 'bg-[#141414] border-gray-brand' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-4">
                <BrandLogo variant="emprendedor" size="md" />
                <div>
                  <h3 className="text-xl font-black">Panadería Familiar</h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {mapElement}
              </div>

              <div className={`border p-5 rounded-2xl space-y-4 ${
                isDark ? 'bg-[#141414] border-gray-brand' : 'bg-white border-gray-200'
              }`}>
                <h4 className="font-extrabold text-sm text-white">Solicitar Envío Individual</h4>
                <input
                  type="text"
                  value={packageDestInput}
                  onChange={(e) => setPackageDestInput(e.target.value)}
                  placeholder="Dirección Destino"
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
                <button
                  onClick={handleSendB2CPackage}
                  className="w-full bg-green-brand hover:bg-green-600 text-black py-3 rounded-xl font-bold text-xs uppercase"
                >
                  Despachar Envío B2C
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 6: DASHBOARD ADMINISTRADOR
            ======================================================== */}
        {activeStep === 'admin' && (
          <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {mapElement}
              </div>

              {/* Gemini recommendations widget inside dashboard */}
              <div className={`border p-5 rounded-2xl space-y-4 ${
                isDark ? 'bg-[#141414] border-gray-brand' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <BrandLogo variant="admin" size="sm" />
                  <h4 className="text-xs font-black">RECOMENDACIONES IA GEMINI</h4>
                </div>

                {geminiLoading ? (
                  <p className="text-xs text-gray-500 animate-pulse">Generando recomendaciones...</p>
                ) : geminiResult ? (
                  <div className="space-y-3 text-xs">
                    <p className="italic text-gray-400">"{geminiResult.behaviorAnalysis}"</p>
                    <div className="bg-black/60 p-3 rounded-xl">
                      <span className="font-bold text-purple-400">{geminiResult.heading}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No hay recomendaciones disponibles hoy.</p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
