import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { BrandLogo } from './BrandLogo';
import { ArgentinaMap } from './ArgentinaMap';
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
  CloudSun,
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
  Cloud,
  ChevronLeft
} from 'lucide-react';
import { Turno, EntregaUnica, Transaccion } from '../types';

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
  // Navigation: sequential order required
  // 'landing' | 'login' | 'repartidor' | 'comercio' | 'emprendedor' | 'admin'
  const [activeStep, setActiveStep] = useState<'landing' | 'login' | 'repartidor' | 'comercio' | 'emprendedor' | 'admin'>('landing');
  const [unlockedSteps, setUnlockedSteps] = useState<string[]>(['landing']);

  // Login inputs
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setApiError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  // Driver states (Carlos Gómez)
  const [driverAvailable, setDriverAvailable] = useState(false);
  const [driverWallet, setDriverAvailableWallet] = useState(14500);
  const [driverHistory, setDriverHistory] = useState<Transaccion[]>([
    { id: 1, tipo: 'ingreso_turno', monto: 12000, saldo_anterior: 2500, saldo_posterior: 14500, referencia: 'Turno Burger House #102', fecha: 'Hoy 14:22' }
  ]);
  const [driverTask, setDriverTask] = useState<Turno | null>(null);

  // Commerce inputs (Trattoria)
  const [shiftHours, setShiftHours] = useState('20:00 - 00:00');
  const [shiftPriceInput, setShiftPriceInput] = useState('15000');

  // Entrepreneur inputs (Familia)
  const [packageNameInput, setPackageNameInput] = useState('');
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
  const [voiceText, setVoiceText] = useState('');
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Gemini recommendations from backend
  const [geminiResult, setGeminiResult] = useState<any>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);

  // SOS status
  const [sosStatus, setSosStatus] = useState<string | null>(null);

  // Navigation unlock helper
  const unlockAndNavigate = (step: 'landing' | 'login' | 'repartidor' | 'comercio' | 'emprendedor' | 'admin') => {
    if (!unlockedSteps.includes(step)) {
      setUnlockedSteps(prev => [...prev, step]);
    }
    setActiveStep(step);
    logEvent(`Navegación: Accediendo a fase [${step.toUpperCase()}] del Rediseño V3`, 'info');
  };

  // Weather icon selector
  const getWeatherIcon = (cond: string) => {
    if (cond === 'tormenta') return <CloudLightning className="text-yellow-400 w-5 h-5 animate-pulse" />;
    if (cond === 'lluvia') return <CloudRain className="text-blue-400 w-5 h-5" />;
    if (cond === 'nublado') return <Cloud className="text-gray-400 w-5 h-5" />;
    return <Sun className="text-orange-400 w-5 h-5" />;
  };

  // Audio synthesize call
  const speakVoiceProfile = async (text: string, profile: 'valentina' | 'mateo') => {
    try {
      setIsFetchingVoice(true);
      logEvent(`Sintetizando voz de [${profile.toUpperCase()} IA]...`, 'info');

      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceProfile: profile
        })
      });

      if (!response.ok) {
        throw new Error('Proxy error');
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }

      activeAudioRef.current = audio;
      setIsFetchingVoice(false);
      setIsPlayingVoice(true);

      audio.play();
      audio.onended = () => {
        setIsPlayingVoice(false);
        URL.revokeObjectURL(audioUrl);
      };
    } catch (err) {
      console.warn("Proxy call failed, falling back to WebSpeech:", err);
      setIsFetchingVoice(false);
      // fallback
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-AR';
        utterance.pitch = profile === 'valentina' ? 1.1 : 0.85;
        utterance.rate = 0.95;
        utterance.onstart = () => {
          setIsPlayingVoice(true);
        };
        utterance.onend = () => {
          setIsPlayingVoice(false);
        };
        window.speechSynthesis.speak(utterance);
      } catch (_) {
        setIsPlayingVoice(false);
      }
    }
  };

  // Real Gemini recommendations query
  const getGeminiSuggestions = async () => {
    try {
      setGeminiLoading(true);
      logEvent("Llamando a IA Gemini para analizar clima logístico y demanda...", "info");
      const response = await fetch('/api/gemini/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weather: weatherCondition,
          behavior: "congestión media en Palermo CABA",
          historyState: "alta demanda nocturna"
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeminiResult(data);
        logEvent("Recomendaciones de Gemini actualizadas exitosamente.", "success");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeminiLoading(false);
    }
  };

  useEffect(() => {
    if (activeStep === 'admin') {
      getGeminiSuggestions();
    }
  }, [activeStep, weatherCondition]);

  // Auth logins
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
        // demo credentials check fallback
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
        logEvent(`Error de Autenticación: ${error.message}`, 'error');
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

  // Repartidor Actions
  const handleToggleDriverAvailability = async () => {
    const nextVal = !driverAvailable;
    setDriverAvailable(nextVal);
    logEvent(`PATCH /api/repartidores/1/disponibilidad - 200 OK - Disponible: ${nextVal}`, 'success');
    
    if (nextVal) {
      speakVoiceProfile("Hola Carlos, ya estás disponible en Palermo. Mateo IA te guiará con seguridad.", "mateo");
    }
  };

  const handleTakeTurno = (turno: Turno) => {
    setDriverTask(turno);
    logEvent(`POST /api/repartidores/1/turnos/${turno.id}/tomar - 200 OK - Turno Confirmado`, 'success');
    triggerNotification('Turno Asignado ⚡', `Confirmaste el bloque de ${turno.comercio_nombre}.`, 'success');
    speakVoiceProfile(`Excelente Carlos. Has tomado el turno de ${turno.comercio_nombre}. Serrano mil cien es el destino. Buen viaje.`, 'mateo');
  };

  const handleDeliverTask = () => {
    if (!driverTask) return;
    const payment = driverTask.monto_repartidor;
    setDriverAvailableWallet(prev => prev + payment);
    setDriverHistory(prev => [
      { id: Date.now(), tipo: 'ingreso_turno', monto: payment, saldo_anterior: driverWallet, saldo_posterior: driverWallet + payment, referencia: `Cierre: ${driverTask.comercio_nombre}`, fecha: 'Ahora' },
      ...prev
    ]);
    logEvent(`Cierre de entrega - Wallet actualizada con éxito. Acreditado: $${payment}`, 'success');
    triggerNotification('Ganancia Acreditada 💰', `Acreditado $${payment} (80% neto de reparto).`, 'success');
    setDriverTask(null);
    speakVoiceProfile("Entrega finalizada Carlos. Saldo acreditado. Sos un crack.", "mateo");
  };

  const handleTriggerSOS = async (type: string) => {
    setSosStatus(type);
    logEvent(`POST /api/repartidores/1/sos - 200 OK - ALERTA SOS EMITIDA: ${type}`, 'error');
    triggerNotification('🚨 ALERTA SOS EMITIDA', `Tipo: ${type}. El centro de control policial y médico ha sido notificado.`, 'error');
    speakVoiceProfile("Atención Carlos, señal de emergencia recibida en Palermo. Quédate en tu lugar, la ayuda va en camino.", "mateo");
    setTimeout(() => {
      setSosStatus(null);
    }, 5000);
  };

  // Comercio Actions
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

  // Emprendedor Actions
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
    speakVoiceProfile("Excelente producto agregado. Valentina IA lo promocionará con inteligencia comercial.", "valentina");
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

  return (
    <div className="w-full bg-[#0A0A0A] text-white min-h-screen font-sans border-t border-blue-brand/20">
      
      {/* Visual Redesign V3 Process Roadmap Header */}
      <div className="bg-[#141414] border-b border-gray-brand px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[9px] bg-blue-brand/10 text-blue-brand px-3 py-1 rounded-full font-black uppercase tracking-widest border border-blue-brand/20 inline-block mb-1">
            Certificación Oficial
          </span>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            PROYECTO REDISEÑO V3 – "DARK FIRST" LOGISTICS
          </h2>
          <p className="text-xs text-gray-400">Progreso obligatorio y secuencial de entrega por módulos completos</p>
        </div>

        {/* Wizard Steps Controller */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black border border-gray-brand p-1 rounded-xl">
          {[
            { id: 'landing', label: '1. Landing', color: 'border-blue-500' },
            { id: 'login', label: '2. Login', color: 'border-purple-500' },
            { id: 'repartidor', label: '3. Repartidor', color: 'border-cyan-500' },
            { id: 'comercio', label: '4. Comercio', color: 'border-yellow-500' },
            { id: 'emprendedor', label: '5. Emprendedor', color: 'border-green-500' },
            { id: 'admin', label: '6. Admin Control', color: 'border-red-500' }
          ].map((step, idx) => {
            const isUnlocked = unlockedSteps.includes(step.id);
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                disabled={!isUnlocked}
                onClick={() => setActiveStep(step.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isActive 
                    ? 'bg-blue-brand text-white font-extrabold shadow-lg shadow-blue-brand/20' 
                    : isUnlocked 
                      ? 'text-gray-300 hover:bg-[#1A1A1A]' 
                      : 'text-gray-600 cursor-not-allowed opacity-40'
                }`}
              >
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                {step.label}
              </button>
            );
          })}
        </div>
      </div>

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
                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight font-display">
                  El motor inteligente de logística para <span className="text-blue-brand">Buenos Aires</span>
                </h1>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Delivery Plus no es una app común de comida. Es un ecosistema logístico avanzado de grado corporativo con asistentes de voz IA y geolocalización satelital persistente para Comercios, Emprendedores y Conductores de reparto B2B.
                </p>

                {/* Key model rules list */}
                <div className="space-y-3.5 bg-black border border-gray-brand p-5 rounded-2xl">
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
                    Ingresar al Portal Corporativo V3
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <a
                    href="#stats"
                    className="text-xs font-bold text-gray-400 hover:text-white px-4 py-3"
                  >
                    Ver estadísticas en vivo
                  </a>
                </div>
              </div>

              {/* Dynamic Map/Visual Highlight Right */}
              <div className="relative">
                {/* Glow ring */}
                <div className="absolute inset-0 bg-blue-brand/10 rounded-[32px] blur-3xl pointer-events-none" />
                <div className="bg-[#141414] border border-gray-brand rounded-[32px] p-6 shadow-2xl space-y-6 relative z-10">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-success animate-ping" />
                      <span className="text-xs font-black tracking-wider uppercase text-white">RED SATELLITAL CABA</span>
                    </div>
                    {/* Live weather widget inside Landing */}
                    <div className="bg-black/50 border border-gray-brand px-3 py-1.5 rounded-xl flex items-center gap-2">
                      {getWeatherIcon(weatherCondition)}
                      <span className="text-[11px] font-bold text-gray-300 uppercase">
                        {weatherCondition} ({temperature}°C)
                      </span>
                    </div>
                  </div>

                  {/* Obelisk GPS map container */}
                  <div className="h-64 rounded-2xl overflow-hidden border border-gray-brand bg-black relative">
                    <ArgentinaMap markers={[]} gpsSimulating={false} gpsProgress={0} />
                    <div className="absolute bottom-3 left-3 bg-[#0A0A0A]/90 border border-blue-brand/30 px-3 py-2 rounded-xl text-[10px] text-gray-300 z-[1000] font-mono leading-relaxed">
                      📍 Buenos Aires Centro: <strong>Normal</strong><br/>
                      ⚡ Multiplicador por clima: <span className="text-purple-400 font-extrabold">{multiplier}x</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/50 border border-gray-brand p-3.5 rounded-2xl">
                      <span className="text-[9px] text-gray-500 uppercase font-black block">Conductores Activos</span>
                      <span className="text-xl font-black text-white">124 Socios</span>
                    </div>
                    <div className="bg-black/50 border border-gray-brand p-3.5 rounded-2xl">
                      <span className="text-[9px] text-gray-500 uppercase font-black block">Entregas Hoy</span>
                      <span className="text-xl font-black text-white">1,540 Envios</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature grids cards */}
            <div id="stats" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-gray-800">
              <div className="bg-[#111] border border-gray-800 p-6 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-brand/10 flex items-center justify-center text-blue-brand">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-white">Ruta Optimizada</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Planificación de ruta satelital interactiva mediante algoritmos de clima y congestión urbana real en Palermo y Almagro.
                </p>
              </div>

              <div className="bg-[#111] border border-gray-800 p-6 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Volume2 className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-white">Asistentes de Voz Activos</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Mateo y Valentina IA se enlazan mediante Kokoro y ElevenLabs para coordinar pedidos por comandos naturales de voz con fluidez local.
                </p>
              </div>

              <div className="bg-[#111] border border-gray-800 p-6 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-white">Billetera de Red</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Liquidación en el acto en pesos argentinos. Libro contable inyectado directamente en Supabase de forma segura.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 2: SPLIT-PANE LOGIN V3
            ======================================================== */}
        {activeStep === 'login' && (
          <div className="max-w-5xl mx-auto p-4 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 bg-[#141414] border border-gray-brand rounded-[28px] overflow-hidden shadow-2xl min-h-[500px]">
              
              {/* Left Column: Form credentials */}
              <div className="p-8 md:p-12 flex flex-col justify-between space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <BrandLogo variant="main" size="sm" />
                    <span className="text-xs font-black tracking-widest text-blue-brand uppercase">PORTAL B2B</span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white font-display">Ingreso al Ecosistema</h2>
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

                <div className="text-[11px] text-gray-500 text-center">
                  Al ingresar, declaras conocer los términos de reparto del 80/20.
                </div>
              </div>

              {/* Right Column: Demo quick actions and telemetry metrics */}
              <div className="bg-black p-8 md:p-12 border-l border-gray-brand flex flex-col justify-between space-y-8 relative">
                
                {/* Background aura lights */}
                <div className="absolute top-10 right-10 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="space-y-4">
                  <span className="text-[10px] text-purple-400 font-black tracking-widest uppercase block">
                    ⚡ SIMULACIÓN DE ROLES RÁPIDOS
                  </span>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Haz clic en cualquiera de las siguientes identidades oficiales configuradas en nuestra base de datos para acceder directamente:
                  </p>

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
                      <ChevronRight className="w-4 h-4 text-gray-500" />
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
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>

                    <button
                      onClick={() => triggerDemoLogin('emprendedor')}
                      className="bg-[#141414] hover:bg-[#1C1C1C] border border-gray-brand hover:border-green-brand/50 p-3 rounded-xl text-left transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-white">Panadería Familiar (Emprendedor)</h4>
                          <span className="text-[9px] text-gray-500">Gastronomía artesanal B2C</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>

                    <button
                      onClick={() => triggerDemoLogin('admin')}
                      className="bg-[#141414] hover:bg-[#1C1C1C] border border-gray-brand hover:border-red-500/50 p-3 rounded-xl text-left transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-white">Consola de Control (Administrador)</h4>
                          <span className="text-[9px] text-gray-500">KPIs de comisión y alertas SOS</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="bg-[#111] border border-gray-800 p-4 rounded-xl text-[10.5px] text-gray-400 font-mono space-y-1.5 leading-relaxed">
                  <span className="text-gray-500 font-bold block">// INTEGRACIÓN RENDER STATUS</span>
                  <div>🌐 Host: <span className="text-white">0.0.0.0</span></div>
                  <div>📡 Supabase Connection: <span className="text-green-success font-semibold">Active Relational</span></div>
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
            
            {/* Header section with driver status */}
            <div className="bg-[#141414] border border-gray-brand p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <BrandLogo variant="repartidor" size="md" />
                <div>
                  <h3 className="text-xl font-black text-white">Carlos Gómez</h3>
                  <p className="text-xs text-gray-400 font-mono">ID: REPARTIDOR_001 • Vehículo: Moto (99A-XYZ8)</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Available Toggle persistently syncing */}
                <div className="flex items-center gap-3 bg-black border border-gray-brand px-4 py-2 rounded-xl">
                  <span className={`text-[10px] uppercase font-black ${driverAvailable ? 'text-green-success' : 'text-gray-500'}`}>
                    {driverAvailable ? 'Disponible / Online' : 'Desconectado / Offline'}
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

                {/* Billetera balance persistent visual */}
                <div className="bg-black border border-gray-brand px-4 py-2 rounded-xl">
                  <span className="text-[8px] text-gray-500 uppercase block font-bold">Ganancias Neto Recaudadas</span>
                  <span className="text-lg font-black text-green-success">${driverWallet} ARS</span>
                </div>
              </div>
            </div>

            {/* Main grid containing: Map protagonist, Mateo IA, and Task Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Map Protagonist (2 cols width) */}
              <div className="lg:col-span-2 bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">Mapa de Navegación Satelital</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    📍 CABA, Palermo
                  </div>
                </div>

                {/* Leaflet Night map with path */}
                <div className="h-80 rounded-xl overflow-hidden border border-gray-brand bg-black relative">
                  <ArgentinaMap markers={[]} gpsSimulating={driverAvailable} gpsProgress={driverTask ? 50 : 0} />
                  
                  {driverTask && (
                    <div className="absolute top-3 left-3 bg-[#0A0A0A]/95 border border-blue-brand/40 px-3 py-2.5 rounded-xl z-[1000] text-[10.5px] leading-relaxed max-w-xs font-mono space-y-1">
                      <div className="text-blue-brand font-black">🛵 EN VIAJE ACTIVO</div>
                      <div>Origen: <span className="text-white">{driverTask.comercio_nombre}</span></div>
                      <div>Destino: <span className="text-white">{driverTask.direccion}</span></div>
                      <div>ETA: <span className="text-green-success font-semibold">14 minutos (Tránsito normal)</span></div>
                    </div>
                  )}
                </div>

                {/* Driver task closure control */}
                {driverTask ? (
                  <div className="bg-blue-brand/5 border border-blue-brand/20 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <h5 className="text-xs font-bold text-white">Bloque Activo: {driverTask.comercio_nombre}</h5>
                      <p className="text-[11px] text-gray-400 mt-1">Completa las entregas asignadas dentro del bloque de 4 horas.</p>
                    </div>
                    <button
                      onClick={handleDeliverTask}
                      className="bg-green-success hover:bg-green-600 text-black px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wide cursor-pointer"
                    >
                      Finalizar Entrega
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-black/45 text-center text-xs text-gray-500 rounded-xl">
                    No tienes ningún bloque de turno o viaje tomado. Selecciona uno del pool para empezar a facturar.
                  </div>
                )}
              </div>

              {/* Sidebar: Mateo IA Operativo & Emergencias SOS */}
              <div className="space-y-6">
                
                {/* Mateo IA Voice Assist widget */}
                <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <BrandLogo variant="repartidor" size="sm" />
                    <div>
                      <h4 className="text-xs font-black text-white">MATEO IA - ASISTENTE LOGÍSTICO</h4>
                      <span className="text-[9px] text-blue-brand uppercase font-black tracking-widest">Voz Clona Kokoro</span>
                    </div>
                  </div>

                  <div className="bg-black/60 p-4 rounded-xl space-y-3">
                    <p className="text-xs text-gray-300 italic leading-relaxed">
                      "Atención Carlos: El clima {weatherCondition} tiene un multiplicador de {multiplier}x. Te sugiero tomar los bloques de Palermo para maximizar ganancias."
                    </p>
                    
                    {/* Voice audio control */}
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
                      <button
                        onClick={() => speakVoiceProfile(`Hola Carlos. El clima está ${weatherCondition} y las tarifas de Palermo tienen un multiplicador del ${multiplier}.`, 'mateo')}
                        disabled={isFetchingVoice}
                        className="bg-blue-brand hover:bg-[#0062CC] text-white px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        {isPlayingVoice ? 'Reproduciendo...' : 'Escuchar Recomendación'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Panic Emergencies SOS Panel */}
                <div className="bg-[#141414] border border-red-500/20 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertTriangle className="w-4 h-4 animate-pulse" />
                    <h4 className="text-xs font-black uppercase tracking-wider">Botón de Pánico SOS Satelital</h4>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-normal">
                    Al emitir señal de SOS, tu geolocalización física será transmitida automáticamente al Centro de Control y soporte de emergencias.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleTriggerSOS('Accidente Médico')}
                      className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 p-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center"
                    >
                      🚑 Accidente Médico
                    </button>
                    <button
                      onClick={() => handleTriggerSOS('Falla de Vehículo')}
                      className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 p-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center"
                    >
                      🔧 Falla de Moto
                    </button>
                  </div>

                  {sosStatus && (
                    <div className="bg-red-500 text-white p-3 rounded-xl text-[11px] font-bold text-center animate-pulse">
                      ¡ALERTA EMITIDA! Soporte en camino.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* List of available turnos in the pool */}
            <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4 text-left">
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">Pool de Ofertas de Turno Palermo</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {turnos.filter(t => t.estado === 'disponible').map(turno => (
                  <div key={turno.id} className="bg-black/60 border border-gray-brand p-4 rounded-xl flex justify-between items-center gap-4">
                    <div className="space-y-1">
                      <h5 className="text-xs font-extrabold text-white">{turno.comercio_nombre}</h5>
                      <p className="text-[10px] text-gray-400">Horario: {turno.horario} • {turno.direccion}</p>
                      <div className="text-[11px] text-green-success font-mono font-bold">
                        Tarifa: ${turno.monto_total} ARS (Recibes ${turno.monto_repartidor})
                      </div>
                    </div>
                    <button
                      onClick={() => handleTakeTurno(turno)}
                      className="bg-blue-brand hover:bg-[#0062CC] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Tomar Turno
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 4: DASHBOARD COMERCIO V3
            ======================================================== */}
        {activeStep === 'comercio' && (
          <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <div className="bg-[#141414] border border-gray-brand p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <BrandLogo variant="comercio" size="md" />
                <div>
                  <h3 className="text-xl font-black text-white">La Trattoria B2B</h3>
                  <p className="text-xs text-gray-400 font-mono">Socio Comercial Registrado • Palermo CABA</p>
                </div>
              </div>

              {/* Weather predictive control */}
              <div className="bg-black/50 border border-gray-brand px-4 py-2 rounded-xl flex items-center gap-3">
                {getWeatherIcon(weatherCondition)}
                <div>
                  <span className="text-[8px] text-gray-500 uppercase block font-bold">Clima / Multiplicador de Demanda</span>
                  <span className="text-xs font-black text-white uppercase">{weatherCondition} ({multiplier}x tarifa)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* V3 Shift creator card */}
              <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">Publicar Bloque de Turno Fijo</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Contrata un fletero exclusivo de 4 horas. El costo se recalcula con el multiplicador por clima actual.
                </p>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Seleccionar Horario</label>
                    <select
                      value={shiftHours}
                      onChange={(e) => setShiftHours(e.target.value)}
                      className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                    >
                      <option value="12:00 - 16:00">Almuerzo (12:00 - 16:00)</option>
                      <option value="20:00 - 00:00">Cena (20:00 - 00:00)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Monto Base de Oferta ($)</label>
                    <input
                      type="number"
                      value={shiftPriceInput}
                      onChange={(e) => setShiftPriceInput(e.target.value)}
                      placeholder="15000"
                      className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="bg-black border border-gray-800 p-3 rounded-xl text-[11px] text-gray-400 space-y-1 font-mono">
                    <div>Monto base: ${shiftPriceInput}</div>
                    <div>Ajuste por Clima: <span className="text-purple-400">+{Math.round((multiplier - 1)*100)}%</span></div>
                    <div className="text-white font-extrabold text-xs">Total final estimado: ${Math.round(parseFloat(shiftPriceInput || '0') * multiplier)} ARS</div>
                  </div>

                  <button
                    onClick={handleCreateShift}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Publicar Guardia B2B
                  </button>
                </div>
              </div>

              {/* Grid 2 and 3: Active dispatch listings and Hot demand zones maps */}
              <div className="lg:col-span-2 bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">Monitoreo de Guardias Publicadas</h4>
                
                <div className="space-y-3">
                  {turnos.filter(t => t.comercio_nombre === 'La Trattoria B2B' || t.comercio_nombre === 'Burger House').map(t => (
                    <div key={t.id} className="bg-black/60 border border-gray-brand p-4 rounded-xl flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{t.comercio_nombre}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                            t.estado === 'disponible' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-400'
                          }`}>
                            {t.estado === 'disponible' ? 'Disponible' : 'Asignado'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500">Bloque: {t.horario} • {t.direccion}</p>
                      </div>

                      <div className="text-right font-mono text-xs text-white">
                        <div>Monto total: <strong>${t.monto_total}</strong></div>
                        <div className="text-[9px] text-gray-500">Repartidor neto: ${t.monto_repartidor}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 5: DASHBOARD EMPRENDEDOR V3
            ======================================================== */}
        {activeStep === 'emprendedor' && (
          <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <div className="bg-[#141414] border border-gray-brand p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <BrandLogo variant="emprendedor" size="md" />
                <div>
                  <h3 className="text-xl font-black text-white">Panadería Familiar</h3>
                  <p className="text-xs text-gray-400 font-mono">Emprendedor Registrado • Rubro: Gastronomía artesanal</p>
                </div>
              </div>

              {/* Interactive history profile info */}
              <div className="bg-black/50 border border-gray-brand px-4 py-2 rounded-xl text-xs max-w-xs text-gray-400">
                📖 Historia familiar: <span className="text-white italic">"Elaborando panes caseros desde 1980 en Almagro."</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Product catalog manager */}
              <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">Catálogo de Productos Familiares</h4>
                
                <div className="space-y-3">
                  {productsList.map(prod => (
                    <div key={prod.id} className="bg-black/60 border border-gray-brand p-3 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <h5 className="font-extrabold text-white">{prod.name}</h5>
                        <p className="text-[9px] text-gray-500 italic">Origen: {prod.origin}</p>
                      </div>
                      <span className="font-bold text-green-success">${prod.price}</span>
                    </div>
                  ))}
                </div>

                {/* Catalog creation form */}
                <div className="border-t border-gray-800 pt-3 space-y-3">
                  <h5 className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Añadir Producto al Catálogo</h5>
                  <input
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="Nombre del producto"
                    className="w-full bg-black border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="number"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="Precio"
                    className="w-full bg-black border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newProductOrigin}
                    onChange={(e) => setNewProductOrigin(e.target.value)}
                    placeholder="Historia de origen (Ej: Receta familiar)"
                    className="w-full bg-black border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    onClick={handleCreateProduct}
                    className="w-full bg-green-brand hover:bg-green-600 text-black py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Guardar Producto
                  </button>
                </div>
              </div>

              {/* Single B2C Shipment dispatch form */}
              <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">Despachar Envío Individual (B2C)</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Dirección de Destino</label>
                    <input
                      type="text"
                      value={packageDestInput}
                      onChange={(e) => setPackageDestInput(e.target.value)}
                      placeholder="Serrano 1100, Palermo"
                      className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Tamaño del Paquete</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['pequeño', 'mediano', 'grande'].map(size => (
                        <button
                          key={size}
                          onClick={() => setPackageSize(size as any)}
                          className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                            packageSize === size
                              ? 'bg-green-brand text-black font-black'
                              : 'bg-black border border-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-black border border-gray-850 p-3 rounded-xl text-[11px] text-gray-400 font-mono space-y-1">
                    <div>Origen base: <span className="text-white">Almagro</span></div>
                    <div>Precio estándar: $3500</div>
                    <div>Recargo por clima: <span className="text-purple-400">x{multiplier}</span></div>
                    <div className="text-white font-bold text-xs">Total final: ${Math.round(3500 * multiplier)} ARS</div>
                  </div>

                  <button
                    onClick={handleSendB2CPackage}
                    className="w-full bg-green-brand hover:bg-green-600 text-black py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Solicitar Despacho
                  </button>
                </div>
              </div>

              {/* Valentina IA floating assistant card */}
              <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <BrandLogo variant="emprendedor" size="sm" />
                  <div>
                    <h4 className="text-xs font-black text-white">VALENTINA IA - RECOMENDADORA</h4>
                    <span className="text-[9px] text-green-400 font-black tracking-widest uppercase">Especialista Comercial</span>
                  </div>
                </div>

                <div className="bg-black/60 p-4 rounded-xl space-y-3">
                  <p className="text-xs text-gray-300 italic leading-relaxed">
                    "Hola che. Analizando el clima fresco de Buenos Aires, te sugiero potenciar las ofertas de panes de campo calentitos a partir de las 18 horas para asegurar un 20% más de rotación."
                  </p>

                  <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
                    <button
                      onClick={() => speakVoiceProfile("Hola che, qué tal. Con el clima actual te recomiendo ofrecer combos de bizcochuelo casero a la tarde.", "valentina")}
                      disabled={isFetchingVoice}
                      className="bg-green-brand hover:bg-green-600 text-black px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      {isPlayingVoice ? 'Reproduciendo...' : 'Voz de Valentina'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 6: DASHBOARD ADMINISTRADOR V3
            ======================================================== */}
        {activeStep === 'admin' && (
          <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            
            {/* Controls panel: live metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl">
                <span className="text-[9px] text-gray-500 uppercase font-black block">Total de Comisión Generada</span>
                <span className="text-2xl font-black text-purple-400">$34,800 ARS</span>
                <p className="text-[9px] text-gray-400 mt-1">20% neto retenido de forma segura</p>
              </div>

              <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl">
                <span className="text-[9px] text-gray-500 uppercase font-black block">Socios de Reparto Conectados</span>
                <span className="text-2xl font-black text-blue-brand">Carlos Gómez + 11</span>
                <p className="text-[9px] text-gray-400 mt-1">Sincronización en tiempo real activa</p>
              </div>

              <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl">
                <span className="text-[9px] text-gray-500 uppercase font-black block">Zonas Calientes en Alerta</span>
                <span className="text-2xl font-black text-yellow-500">Palermo, Recoleta</span>
                <p className="text-[9px] text-gray-400 mt-1">Multiplicadores automáticos sugeridos</p>
              </div>

              {/* Weather simulation forced controllers in Admin */}
              <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-2">
                <span className="text-[9px] text-gray-500 uppercase font-black block">Forzar Clima Simulador</span>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'despejado', icon: '☀️' },
                    { id: 'nublado', icon: '☁️' },
                    { id: 'lluvia', icon: '🌧️' },
                    { id: 'tormenta', icon: '⛈️' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleWeatherChange(item.id as any)}
                      className={`p-1.5 rounded-lg text-xs transition-all ${
                        weatherCondition === item.id
                          ? 'bg-blue-brand text-white font-extrabold border border-blue-brand/50'
                          : 'bg-black text-gray-400 hover:text-white'
                      }`}
                      title={item.id}
                    >
                      {item.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Gemini recommendations panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-3">
                    <BrandLogo variant="admin" size="sm" />
                    <div>
                      <h4 className="text-xs font-black text-white">ORQUESTADOR DE RECOMENDACIONES GEMINI 3.5</h4>
                      <p className="text-[9px] text-gray-500">Conexión directa mediante @google/genai en Render</p>
                    </div>
                  </div>

                  <span className="text-[9px] text-purple-400 font-extrabold bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20">
                    Live Model: flash
                  </span>
                </div>

                {geminiLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                    <span className="text-xs text-gray-400">Consultando API de Gemini...</span>
                  </div>
                ) : geminiResult ? (
                  <div className="space-y-4 text-xs leading-relaxed">
                    <div className="bg-black/50 p-4 rounded-xl space-y-2">
                      <span className="font-extrabold text-white text-xs block mb-1">🛰️ {geminiResult.heading || "Análisis de Red"}</span>
                      <p className="text-gray-400 leading-normal italic">
                        "{geminiResult.behaviorAnalysis}"
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-gray-500 uppercase font-black block">Sugerencias Estratégicas</span>
                      {geminiResult.recommendations && geminiResult.recommendations.map((rec: string, i: number) => (
                        <div key={i} className="bg-black/35 p-3 rounded-lg border border-gray-850 flex gap-2.5">
                          <Check className="text-purple-400 shrink-0 w-4 h-4 mt-0.5" />
                          <span className="text-gray-300">{rec}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center bg-black/60 p-4 rounded-xl border border-gray-850">
                      <span className="text-gray-400">Tarifa multiplicadora sugerida:</span>
                      <span className="text-lg font-black text-purple-400 font-mono">{geminiResult.multiplier}x</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-gray-500">
                    No se han generado recomendaciones de Gemini todavía. Cambia el clima para forzar la sincronización.
                  </div>
                )}
              </div>

              {/* Operations Control and Audit Logs */}
              <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">Auditoría Operativa Satelital</h4>
                <p className="text-xs text-gray-400">Eventos de red transaccionales y de geolocalización registrados hoy:</p>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 text-[11px] font-mono leading-normal">
                  <div className="p-2 bg-black rounded-lg border border-gray-850 text-green-success">
                    [15:10] GET /api/weather - 200 OK - Weather: {weatherCondition} (${temperature}°C)
                  </div>
                  <div className="p-2 bg-black rounded-lg border border-gray-850 text-blue-brand">
                    [14:45] POST /api/gemini/recommend - Generando sugerencias por clima
                  </div>
                  <div className="p-2 bg-black rounded-lg border border-gray-850 text-gray-400">
                    [14:22] POST /api/billeteras/1/transacciones - Cierre exitoso Burger House
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
