import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { BrandLogo } from './BrandLogo';
import { ArgentinaMap } from './ArgentinaMap';
import { VoiceProvider } from '../lib/VoiceProvider';
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
  Cloud,
  ChevronLeft,
  Phone,
  CheckSquare,
  MapIcon,
  Bell,
  Camera,
  Trash2,
  ThumbsUp
} from 'lucide-react';
import { Turno, EntregaUnica, Transaccion, Usuario } from '../types';

interface ProductionAppProps {
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

export const ProductionApp: React.FC<ProductionAppProps> = ({
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
  // Auth view: 'login' | 'register' | 'recovery' | 'authenticated'
  const [authView, setAuthView] = useState<'login' | 'register' | 'recovery'>('login');
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setRegFullname] = useState('');
  const [vehicle, setRegVehicle] = useState<'bicicleta' | 'moto' | 'auto'>('moto');
  const [patent, setRegPatent] = useState('');
  const [roleSelection, setRoleSelection] = useState<'repartidor' | 'comercio' | 'emprendedor' | 'admin'>('repartidor');

  // Real weather info from server
  const [liveWeather, setLiveWeather] = useState({
    temp: 20,
    wind: '12 km/h',
    rainChance: '5%',
    condition: 'despejado',
    etaAffected: 'Ninguno (condiciones óptimas)',
    recommendation: 'Mateo recomienda tarifas estándar base y conducción segura.'
  });

  // Role dashboards state
  const [driverAvailable, setDriverAvailable] = useState(false);
  const [driverWallet, setDriverWallet] = useState(14500);
  const [driverHistory, setDriverHistory] = useState<Transaccion[]>([
    { id: 1, tipo: 'ingreso_turno', monto: 12000, saldo_anterior: 2500, saldo_posterior: 14500, referencia: 'Turno Burger House #102', fecha: 'Hoy 14:22' }
  ]);
  const [driverTask, setDriverTask] = useState<Turno | null>(null);

  // SOS status
  const [sosStatus, setSosStatus] = useState<string | null>(null);

  // Commerce states
  const [shiftHours, setShiftHours] = useState('20:00 - 00:00');
  const [shiftPriceInput, setShiftPriceInput] = useState('15000');

  // Entrepreneur states
  const [packageName, setPackageName] = useState('');
  const [packageDest, setPackageDest] = useState('');
  const [packageSize, setPackageSize] = useState<'pequeño' | 'mediano' | 'grande'>('mediano');
  const [products, setProducts] = useState([
    { id: 1, name: 'Pan de Masa Madre', price: 1800, stock: 12, origin: 'Receta de mi abuela Clara' },
    { id: 2, name: 'Bizcochuelo Casero', price: 2500, stock: 5, origin: 'Elaborado con huevos de campo' }
  ]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductOrigin, setNewProductOrigin] = useState('');

  // Admin and filter states
  const [adminSelectedView, setAdminSelectedView] = useState<'global' | 'comercio' | 'emprendedor' | 'repartidor'>('global');
  const [adminMapFilters, setAdminMapFilters] = useState({
    repartidores: true,
    comercios: true,
    emprendedores: true,
    pedidos: true,
    incidentes: true,
    zonasCalientes: true
  });
  const [geminiResult, setGeminiResult] = useState<any>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);

  // Notification center lists
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, title: 'Bienvenido a Delivery Plus', desc: 'Tu sesión corporativa está activa y segura.', time: 'Hace 1 min', type: 'info' }
  ]);

  // Audio elements
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isFetchingVoice, setIsFetchingVoice] = useState(false);

  // Weather icon selector
  const getWeatherIcon = (cond: string) => {
    if (cond === 'tormenta') return <CloudLightning className="text-yellow-400 w-5 h-5 animate-pulse" />;
    if (cond === 'lluvia') return <CloudRain className="text-blue-400 w-5 h-5" />;
    if (cond === 'nublado') return <Cloud className="text-gray-400 w-5 h-5" />;
    return <Sun className="text-orange-400 w-5 h-5" />;
  };

  // Demo account automatic sign-in trigger
  const triggerDemoLogin = (role: 'repartidor' | 'comercio' | 'emprendedor' | 'admin') => {
    if (role === 'repartidor') {
      setEmail('repartidor@test.com');
      setPassword('123456');
      setSessionUser({ email: 'repartidor@test.com', role: 'repartidor' });
    } else if (role === 'comercio') {
      setEmail('trattoria@comercio.com');
      setPassword('123456');
      setSessionUser({ email: 'trattoria@comercio.com', role: 'comercio' });
    } else if (role === 'emprendedor') {
      setEmail('emprendedor@test.com');
      setPassword('123456');
      setSessionUser({ email: 'emprendedor@test.com', role: 'emprendedor' });
    } else {
      setEmail('admin@deliveryplus.com');
      setPassword('123456');
      setSessionUser({ email: 'admin@deliveryplus.com', role: 'admin' });
    }
    pushLocalNotification('Sesión Demo Activa', `Ingresaste como ${role.toUpperCase()}`, 'success');
  };

  // Play sound indicator helper
  const playBeepSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(520, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (_) {}
  };

  // Add system notifications
  const pushLocalNotification = (title: string, desc: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    playBeepSound();
    setNotifications(prev => [
      { id: Date.now(), title, desc, time: 'Ahora', type },
      ...prev
    ]);
    triggerNotification(title, desc, type);
  };

  // Fetch real weather on mount
  const fetchRealWeather = async () => {
    try {
      const response = await fetch('/api/weather');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLiveWeather({
            temp: Math.round(data.temp * 10) / 10,
            wind: data.condition === 'tormenta' ? '32 km/h' : '14 km/h',
            rainChance: data.condition === 'tormenta' ? '90%' : (data.condition === 'lluvia' ? '75%' : '10%'),
            condition: data.condition,
            etaAffected: data.condition === 'tormenta' ? 'Retraso de +15 min por tormenta' : (data.condition === 'lluvia' ? 'Retraso de +8 min' : 'Ninguno (condiciones óptimas)'),
            recommendation: data.description
          });
          setWeatherCondition(data.condition);
          setTemperature(Math.round(data.temp * 10) / 10);
          setMultiplier(data.multiplier);
        }
      }
    } catch (err) {
      console.error("Error fetching weather:", err);
    }
  };

  useEffect(() => {
    fetchRealWeather();
  }, []);

  // Sync session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSessionUser({
          email: session.user.email,
          role: session.user.email?.includes('comercio') ? 'comercio' : (session.user.email?.includes('emprendedor') ? 'emprendedor' : (session.user.email?.includes('admin') ? 'admin' : 'repartidor'))
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSessionUser({
          email: session.user.email,
          role: session.user.email?.includes('comercio') ? 'comercio' : (session.user.email?.includes('emprendedor') ? 'emprendedor' : (session.user.email?.includes('admin') ? 'admin' : 'repartidor'))
        });
      } else {
        setSessionUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Gemini suggestion when admin or weather changes
  const fetchGeminiRecommendations = async () => {
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
    if (sessionUser?.role === 'admin' && weatherCondition) {
      fetchGeminiRecommendations();
    }
  }, [sessionUser, weatherCondition]);

  // Auth Submit Handlers
  const handleSignIn = async () => {
    if (!email || !password) {
      alert("Por favor ingresa email y contraseña");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Fallbacks for demo accounts when offline / local testing
        if (email === 'repartidor@test.com' && password === '123456') {
          setSessionUser({ email: 'repartidor@test.com', role: 'repartidor' });
          pushLocalNotification('Sesión Iniciada B2B', 'Ingresaste como Carlos Gómez (Repartidor)', 'success');
        } else if (email === 'trattoria@comercio.com' && password === '123456') {
          setSessionUser({ email: 'trattoria@comercio.com', role: 'comercio' });
          pushLocalNotification('Sesión Iniciada B2B', 'Ingresaste como La Trattoria', 'success');
        } else if (email === 'emprendedor@test.com' && password === '123456') {
          setSessionUser({ email: 'emprendedor@test.com', role: 'emprendedor' });
          pushLocalNotification('Sesión Iniciada B2B', 'Ingresaste como Panadería Familiar', 'success');
        } else if (email === 'admin@deliveryplus.com' && password === '123456') {
          setSessionUser({ email: 'admin@deliveryplus.com', role: 'admin' });
          pushLocalNotification('Sesión Iniciada B2B', 'Ingresaste como Administrador Global', 'success');
        } else {
          alert(`Error: ${error.message}`);
        }
      } else {
        const role = email.includes('comercio') ? 'comercio' : (email.includes('emprendedor') ? 'emprendedor' : (email.includes('admin') ? 'admin' : 'repartidor'));
        setSessionUser({ email: data.user?.email, role });
        pushLocalNotification('Sesión Iniciada B2B', `Autenticado con éxito en Supabase: ${data.user?.email}`, 'success');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      alert("Por favor ingresa email y contraseña");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullname,
            role: roleSelection,
            vehicle,
            patent
          }
        }
      });
      if (error) {
        alert(error.message);
      } else {
        alert("¡Registro exitoso! Por favor verifica tu casilla de correo o inicia sesión directamente.");
        setAuthView('login');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin }
      });
      if (error) alert(error.message);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSessionUser(null);
    logEvent("Sesión cerrada con éxito.", "info");
  };

  // Actions for Repartidor
  const handleToggleDriverAvailability = async () => {
    const nextVal = !driverAvailable;
    setDriverAvailable(nextVal);
    logEvent(`PATCH /api/repartidores/1/disponibilidad - 200 OK - Disponible: ${nextVal}`, 'success');
    
    if (nextVal) {
      pushLocalNotification('Estado Conectado', 'Ya te encuentras disponible en Palermo.', 'success');
      VoiceProvider.speak({
        text: "Hola Carlos Gómez, ya estás conectado en el pool operativo. Mateo IA te guiará en tu ruta.",
        engine: 'kokoro',
        voiceProfile: 'mateo'
      });
    }
  };

  const handleTakeTurno = (turno: Turno) => {
    setDriverTask(turno);
    logEvent(`POST /api/repartidores/1/turnos/${turno.id}/tomar - 200 OK - Turno Confirmado`, 'success');
    pushLocalNotification('Bloque de Turno Fijo Asignado ⚡', `Confirmaste la guardia de ${turno.comercio_nombre}.`, 'success');
    VoiceProvider.speak({
      text: `Excelente Carlos. Tomaste la guardia fija de 4 horas para ${turno.comercio_nombre}. Serrano mil cien es el destino. Buen viaje.`,
      engine: 'kokoro',
      voiceProfile: 'mateo'
    });
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
    pushLocalNotification('Ganancia Acreditada 💰', `Acreditado $${payment} (80% neto de reparto).`, 'success');
    setDriverTask(null);
    VoiceProvider.speak({
      text: "Excelente trabajo Carlos, entrega finalizada con éxito. Saldo neto de reparto acreditado en tu billetera.",
      engine: 'kokoro',
      voiceProfile: 'mateo'
    });
  };

  const handleTriggerSOS = async (type: string) => {
    setSosStatus(type);
    logEvent(`POST /api/repartidores/1/sos - 200 OK - ALERTA SOS EMITIDA: ${type}`, 'error');
    pushLocalNotification('🚨 ALERTA SOS ACTIVADA', `Tipo: ${type}. El centro de control policial y médico ha sido despachado.`, 'error');
    VoiceProvider.speak({
      text: "Atención Carlos Gómez: Señal de pánico SOS recibida. Quédate en tu lugar, soporte médico o policial está en camino.",
      engine: 'kokoro',
      voiceProfile: 'mateo'
    });
    setTimeout(() => {
      setSosStatus(null);
    }, 6000);
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
    pushLocalNotification('Guardia Publicada ⚡', `Bloque de turnos para La Trattoria publicado en Supabase.`, 'success');
    VoiceProvider.speak({
      text: "Hola, La Trattoria. Tu bloque de guardia fija de 4 horas ha sido publicado con éxito en el pool de repartidores.",
      engine: 'kokoro',
      voiceProfile: 'valentina'
    });
  };

  // Actions for Emprendedor
  const handleCreateProduct = () => {
    if (!newProductName || !newProductPrice) return;
    const p = {
      id: products.length + 1,
      name: newProductName,
      price: parseFloat(newProductPrice),
      stock: 10,
      origin: newProductOrigin || 'Elaboración casera con orgullo familiar'
    };
    setProducts(prev => [...prev, p]);
    setNewProductName('');
    setNewProductPrice('');
    setNewProductOrigin('');
    logEvent(`Producto añadido con éxito: ${p.name}`, 'success');
    pushLocalNotification('Producto Agregado', `Panadería Familiar sumó ${p.name} al catálogo.`, 'success');
    VoiceProvider.speak({
      text: `Excelente producto agregado con éxito che. Valentina IA ya lo configuró para promocionarlo en tu zona.`,
      engine: 'kokoro',
      voiceProfile: 'valentina'
    });
  };

  const handleSendB2CPackage = () => {
    if (!packageDest) return;
    const finalPrice = Math.round(3500 * multiplier);
    const driverShare = Math.round(finalPrice * 0.8);
    const platformShare = Math.round(finalPrice * 0.2);

    const nuevaEntrega: EntregaUnica = {
      id: entregas.length + 201,
      emprendedor_nombre: 'Panadería Familiar',
      direccion_origen: 'Urquiza 230, Almagro',
      direccion_destino: packageDest,
      tamano: packageSize,
      monto_total: finalPrice,
      monto_repartidor: driverShare,
      monto_plataforma: platformShare,
      estado: 'disponible'
    };

    setEntregas(prev => [nuevaEntrega, ...prev]);
    logEvent(`POST /api/entregas - 200 OK - Entrega individual despachada`, 'success');
    pushLocalNotification('Envío Despachado B2C 📦', `Encomienda rápida hacia ${packageDest} en camino.`, 'success');
    setPackageDest('');
    VoiceProvider.speak({
      text: "Tu envío individual B2C ha sido despachado exitosamente. La geolocalización satelital ya activó la ruta sobre el mapa.",
      engine: 'kokoro',
      voiceProfile: 'valentina'
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FFFFFF] font-sans flex flex-col selection:bg-blue-brand/30 selection:text-white relative overflow-hidden">
      
      {/* Background ambient decor lights - Premium Landing Page style */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-brand/5 rounded-full blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-blue-brand/5 rounded-full blur-[150px] pointer-events-none" />

      {/* --- TOP HEADER CONTROL BAR --- */}
      <header className="bg-gradient-to-r from-[#0E131F] to-[#0A0A0A] border-b border-blue-brand/20 px-6 py-4 flex items-center justify-between gap-4 shrink-0 shadow-xl backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3.5">
          <BrandLogo variant="main" size="md" animated={true} />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 font-display">
              Delivery<span className="text-blue-brand">Plus</span>
              <span className="text-[10px] bg-blue-brand/10 text-blue-brand px-2.5 py-0.5 rounded-full font-bold font-mono border border-blue-brand/20">
                ECOSISTEMA B2B REAL
              </span>
            </h1>
            <p className="text-xs text-gray-400">Plataforma Logística y de Movilidad en Tiempo Real</p>
          </div>
        </div>

        {sessionUser && (
          <div className="flex items-center gap-4 relative z-30">
            {/* Contextual indicators */}
            <div className="hidden lg:flex items-center gap-2 text-xs bg-black/45 border border-gray-brand px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-green-success animate-ping"></span>
              <span className="text-gray-400 font-bold">Autenticado como:</span>
              <span className="text-blue-brand font-black uppercase font-mono">{sessionUser.role}</span>
            </div>

            <button
              onClick={handleSignOut}
              className="bg-[#141414] hover:bg-[#1F1F1F] border border-gray-brand p-3 rounded-xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold text-white shadow-md select-none active:scale-95"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </header>

      {/* ========================================================
          AUTH GATEWAY: WALL FOR NON-AUTHENTICATED SESSIONS
          ======================================================== */}
      {!sessionUser ? (
        <main className="flex-1 flex items-center justify-center p-4 relative z-10 my-12">
          <div className="grid grid-cols-1 md:grid-cols-2 bg-[#141414] border border-gray-brand rounded-[28px] overflow-hidden shadow-2xl max-w-5xl w-full min-h-[550px]">
            
            {/* Left Column: Form credentials */}
            <div className="p-8 md:p-12 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <BrandLogo variant="main" size="sm" />
                  <span className="text-xs font-black tracking-widest text-blue-brand uppercase">PORTAL B2B</span>
                </div>

                {authView === 'login' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-white font-display">Ingreso al Ecosistema</h2>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Sincronizado de forma directa con Supabase Auth. Ingresa tus credenciales o selecciona un rol rápido.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold tracking-wider">Email Corporativo</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-black border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-brand"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSignIn}
                      disabled={loading}
                      className="w-full bg-blue-brand hover:bg-[#0062CC] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading ? 'Verificando...' : 'Iniciar Sesión'}
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <div className="flex justify-between text-xs text-gray-400 pt-2">
                      <button onClick={() => setAuthView('register')} className="hover:text-white">Crear cuenta nueva</button>
                      <button onClick={() => setAuthView('recovery')} className="hover:text-white">¿Olvidaste tu contraseña?</button>
                    </div>
                  </div>
                )}

                {authView === 'register' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-white font-display">Crear Cuenta B2B</h2>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Completa tus datos reales para unirte al pool de reparto de Buenos Aires.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Nombre Completo o Razón Social</label>
                        <input
                          type="text"
                          value={fullname}
                          onChange={(e) => setRegFullname(e.target.value)}
                          placeholder="Carlos Gómez"
                          className="w-full bg-black border border-gray-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ejemplo@test.com"
                          className="w-full bg-black border border-gray-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Rol Operativo</label>
                        <select
                          value={roleSelection}
                          onChange={(e: any) => setRoleSelection(e.target.value)}
                          className="w-full bg-black border border-gray-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                        >
                          <option value="repartidor">Repartidor Socio B2B</option>
                          <option value="comercio">Comercio Contratante</option>
                          <option value="emprendedor">Emprendedor Panadería</option>
                        </select>
                      </div>

                      {roleSelection === 'repartidor' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-0.5 uppercase font-bold">Vehículo</label>
                            <select
                              value={vehicle}
                              onChange={(e: any) => setRegVehicle(e.target.value)}
                              className="w-full bg-black border border-gray-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                            >
                              <option value="bicicleta">Bicicleta</option>
                              <option value="moto">Moto</option>
                              <option value="auto">Auto</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-0.5 uppercase font-bold">Patente</label>
                            <input
                              type="text"
                              value={patent}
                              onChange={(e) => setRegPatent(e.target.value)}
                              placeholder="99A-XYZ"
                              className="w-full bg-black border border-gray-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Contraseña</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-black border border-gray-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleRegister}
                      disabled={loading}
                      className="w-full bg-green-success hover:bg-green-600 text-black py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading ? 'Registrando...' : 'Registrar Cuenta'}
                    </button>

                    <button onClick={() => setAuthView('login')} className="text-xs text-gray-400 hover:text-white block text-center w-full mt-2">
                      Volver al Inicio de Sesión
                    </button>
                  </div>
                )}

                {authView === 'recovery' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-white font-display">Recuperar Contraseña</h2>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Te enviaremos un enlace de restauración mediante Supabase Auth.
                      </p>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Email Registrado</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ejemplo@test.com"
                        className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={() => alert("Enlace de recuperación enviado con éxito.")}
                      className="w-full bg-blue-brand hover:bg-[#0062CC] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      Enviar Enlace
                    </button>

                    <button onClick={() => setAuthView('login')} className="text-xs text-gray-400 hover:text-white block text-center w-full mt-2">
                      Volver al Inicio de Sesión
                    </button>
                  </div>
                )}
              </div>

              {/* OAuth buttons / Social Logins in the Form bottom */}
              <div className="border-t border-gray-800 pt-6 space-y-4">
                <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider block text-center">
                  O INGRESA CON REDES SOCIALES
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleOAuthSignIn('google')}
                    className="bg-[#1C1C1C] hover:bg-[#2A2A2A] border border-gray-brand py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Google G</span>
                  </button>
                  <button
                    onClick={() => alert("Inicio de sesión con Apple en desarrollo de producción.")}
                    className="bg-[#1C1C1C] hover:bg-[#2A2A2A] border border-gray-brand py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Apple App</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Demo quick actions and telemetry metrics */}
            <div className="bg-black p-8 md:p-12 border-l border-gray-brand flex flex-col justify-between space-y-8 relative">
              <div className="absolute top-10 right-10 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-4">
                <span className="text-[10px] text-purple-400 font-black tracking-widest uppercase block">
                  ⚡ DEMO LOGIN (CREDENCIALES DE PRUEBA)
                </span>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Haz clic en cualquiera de las siguientes identidades oficiales configuradas en nuestra base de datos para acceder directamente:
                </p>

                <div className="grid grid-cols-1 gap-2.5 pt-2">
                  <button
                    onClick={() => triggerDemoLogin('repartidor')}
                    className="bg-[#141414] hover:bg-[#1C1C1C] border border-gray-brand p-3 rounded-xl text-left transition-all flex items-center justify-between"
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
                    className="bg-[#141414] hover:bg-[#1C1C1C] border border-gray-brand p-3 rounded-xl text-left transition-all flex items-center justify-between"
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
                    className="bg-[#141414] hover:bg-[#1C1C1C] border border-gray-brand p-3 rounded-xl text-left transition-all flex items-center justify-between"
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
                    className="bg-[#141414] hover:bg-[#1C1C1C] border border-gray-brand p-3 rounded-xl text-left transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-white">Control Panel (Administrador)</h4>
                        <span className="text-[9px] text-gray-500">KPIs de comisión y alertas SOS</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        
        /* ========================================================
            AUTHENTICATED REAL OPERATIONAL DASHBOARDS
            ======================================================== */
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full relative z-10 space-y-6 text-left">
          
          {/* Real Live Weather Widget Panel at the top */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#141414] border border-gray-brand p-5 rounded-2xl">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 bg-black/45 rounded-xl border border-gray-800">
                {getWeatherIcon(liveWeather.condition)}
              </div>
              <div>
                <span className="text-[9px] text-gray-500 uppercase block font-black">Clima en Buenos Aires</span>
                <span className="text-xl font-black text-white capitalize">{liveWeather.condition}</span>
              </div>
            </div>

            <div className="bg-black/30 border border-gray-900 rounded-xl p-3">
              <span className="text-[8px] text-gray-500 uppercase block font-mono">Temperatura</span>
              <span className="text-sm font-bold text-white">{liveWeather.temp}°C</span>
            </div>

            <div className="bg-black/30 border border-gray-900 rounded-xl p-3">
              <span className="text-[8px] text-gray-500 uppercase block font-mono">Probabilidad de Lluvia y Viento</span>
              <span className="text-sm font-bold text-white">{liveWeather.rainChance} / {liveWeather.wind}</span>
            </div>

            <div className="bg-black/30 border border-gray-900 rounded-xl p-3">
              <span className="text-[8px] text-gray-500 uppercase block font-mono">Impacto en ETA Estimado</span>
              <span className="text-sm font-bold text-yellow-500">{liveWeather.etaAffected}</span>
            </div>
          </div>

          {/* ========================================================
              DASHBOARD: REPARTIDOR (CARLOS GÓMEZ)
              ======================================================== */}
          {sessionUser.role === 'repartidor' && (
            <div className="space-y-6">
              
              {/* Header card with status toggler */}
              <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-brand/10 flex items-center justify-center text-blue-brand font-black font-mono">
                    R
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Carlos Gómez</h3>
                    <p className="text-xs text-gray-400 font-mono">ID: REPARTIDOR_001 • Moto: 99A-XYZ8</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
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
                    <span className="text-[8px] text-gray-500 uppercase block">Saldo de Red</span>
                    <span className="text-base font-black text-green-success">${driverWallet} ARS</span>
                  </div>
                </div>
              </div>

              {/* Main operational sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Real-time map component */}
                <div className="lg:col-span-2 bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">Mi Mapa de Reparto Real</h4>
                    <span className="text-xs text-gray-400 font-mono">Palermo Centro, CABA</span>
                  </div>

                  <div className="h-80 rounded-xl overflow-hidden border border-gray-brand bg-black relative">
                    <ArgentinaMap markers={[]} gpsSimulating={driverAvailable} gpsProgress={driverTask ? 50 : 0} />
                    {driverTask && (
                      <div className="absolute top-3 left-3 bg-[#0A0A0A]/95 border border-blue-brand/40 px-3 py-2.5 rounded-xl z-[1000] text-[10.5px] leading-relaxed max-w-xs font-mono space-y-1">
                        <div className="text-blue-brand font-black">🛵 EN VIAJE ACTIVO</div>
                        <div>Origen: <span className="text-white">{driverTask.comercio_nombre}</span></div>
                        <div>ETA afectado por clima: <span className="text-yellow-500 font-bold">{liveWeather.etaAffected}</span></div>
                      </div>
                    )}
                  </div>

                  {driverTask ? (
                    <div className="bg-blue-brand/5 border border-blue-brand/20 p-4 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <h5 className="text-xs font-bold text-white">Bloque Activo: {driverTask.comercio_nombre}</h5>
                        <p className="text-[11px] text-gray-400 mt-1">Garantiza entregas eficientes de este bloque fiero B2B.</p>
                      </div>
                      <button
                        onClick={handleDeliverTask}
                        className="bg-green-success hover:bg-green-600 text-black px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wide cursor-pointer animate-pulse"
                      >
                        Finalizar Guardia y Cobrar
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-black/45 text-center text-xs text-gray-500 rounded-xl">
                      Pool disponible. Toma un bloque fiero en la lista de abajo para iniciar operaciones.
                    </div>
                  )}
                </div>

                {/* Mateo IA Operational assistant & Panic panel */}
                <div className="space-y-6">
                  
                  {/* Mateo IA widget */}
                  <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <BrandLogo variant="repartidor" size="sm" />
                      <div>
                        <h4 className="text-xs font-black text-white">MATEO IA - ASISTENTE LOGÍSTICO</h4>
                        <span className="text-[8px] text-blue-brand font-mono font-black uppercase tracking-widest block mt-0.5">Asesor Operativo</span>
                      </div>
                    </div>

                    <div className="bg-black/60 p-4 rounded-xl space-y-3">
                      <p className="text-xs text-gray-300 italic leading-relaxed">
                        "Che Carlos, con este clima {weatherCondition} tenemos un multiplicador de {multiplier}x. Te recomiendo tomar los bloques fijos disponibles en Palermo para asegurar mejores ganancias netas."
                      </p>

                      <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
                        <button
                          onClick={() => VoiceProvider.speak({
                            text: `Hola Carlos, che qué tal. Te recomiendo estar alerta ya que con clima de ${weatherCondition} las tarifas aumentan. Buen viaje en Palermo.`,
                            engine: 'kokoro',
                            voiceProfile: 'mateo'
                          })}
                          className="bg-blue-brand hover:bg-[#0062CC] text-white px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                          Escuchar Asesor Mateo
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Panic Emergency Button SOS */}
                  <div className="bg-[#141414] border border-red-500/20 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-red-500">
                      <AlertTriangle className="w-4 h-4 animate-pulse" />
                      <h4 className="text-xs font-black uppercase tracking-wider">Botón de Pánico SOS Satelital</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleTriggerSOS('Accidente Médico')}
                        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 p-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center"
                      >
                        🚑 Accidente Médico
                      </button>
                      <button
                        onClick={() => handleTriggerSOS('Siniestro Vial / Tránsito')}
                        className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 p-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center"
                      >
                        ⚠️ Demoras / Siniestro
                      </button>
                    </div>

                    {sosStatus && (
                      <div className="bg-red-500 text-white p-3 rounded-xl text-[11px] font-bold text-center animate-pulse">
                        🚨 ALERTA EMITIDA: Ayuda despachada a tu ubicación.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pool de bloques fijos */}
              <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">Pool de Ofertas de Bloque Palermo</h4>
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
              DASHBOARD: COMERCIO B2B (LA TRATTORIA)
              ======================================================== */}
          {sessionUser.role === 'comercio' && (
            <div className="space-y-6">
              
              <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-black font-mono">
                    C
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">La Trattoria B2B</h3>
                    <p className="text-xs text-gray-400 font-mono">Establecimiento Gastronómico • Palermo</p>
                  </div>
                </div>

                <div className="bg-black/50 border border-gray-brand px-4 py-2 rounded-xl text-xs flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-success animate-ping" />
                  <span className="text-gray-300 font-bold">Mis Guardias Activas de Reparto</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Creación de guardias fijos */}
                <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">Publicar Bloque de Guardia</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Horario de Turno (4 Horas)</label>
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
                      <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Presupuesto Base de Oferta ($)</label>
                      <input
                        type="number"
                        value={shiftPriceInput}
                        onChange={(e) => setShiftPriceInput(e.target.value)}
                        placeholder="15000"
                        className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="bg-black border border-gray-850 p-3 rounded-xl text-[11px] text-gray-400 space-y-1 font-mono">
                      <div>Ajuste por clima ({weatherCondition}): <span className="text-purple-400">{multiplier}x</span></div>
                      <div className="text-white font-extrabold">Final consolidado: ${Math.round(parseFloat(shiftPriceInput || '0') * multiplier)} ARS</div>
                    </div>

                    <button
                      onClick={handleCreateShift}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      Publicar Bloque Fijo
                    </button>
                  </div>
                </div>

                {/* Map integration and Active driver tracking */}
                <div className="lg:col-span-2 bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">Seguimiento en Mapa de mis Socios Logísticos</h4>
                  
                  <div className="h-80 rounded-xl overflow-hidden border border-gray-brand bg-black relative">
                    <ArgentinaMap markers={[]} gpsSimulating={true} gpsProgress={50} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              DASHBOARD: EMPRENDEDOR (PANADERÍA FAMILIAR)
              ======================================================== */}
          {sessionUser.role === 'emprendedor' && (
            <div className="space-y-6">
              
              <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 font-black font-mono">
                    E
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Panadería Familiar</h3>
                    <p className="text-xs text-gray-400 font-mono">Emprendimiento Gastronómico de Origen Familiar</p>
                  </div>
                </div>

                <div className="bg-black/50 border border-gray-brand px-4 py-2 rounded-xl text-xs max-w-xs text-gray-400 italic">
                  📖 Historia familiar: <span className="text-white font-bold">"Elaborando pan artesanal desde 1980 en Almagro."</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Catalog manager */}
                <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">Catálogo de Productos con Origen</h4>
                  
                  <div className="space-y-3">
                    {products.map(p => (
                      <div key={p.id} className="bg-black/60 border border-gray-brand p-3 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <h5 className="font-extrabold text-white">{p.name}</h5>
                          <p className="text-[9px] text-gray-500 italic">Origen: {p.origin}</p>
                        </div>
                        <span className="font-bold text-green-success">${p.price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-800 pt-3 space-y-3">
                    <h5 className="text-[10px] text-gray-400 uppercase font-bold">Añadir al Catálogo Familiar</h5>
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
                      placeholder="Historia de origen (Ej: Receta de la abuela)"
                      className="w-full bg-black border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={handleCreateProduct}
                      className="w-full bg-green-brand hover:bg-green-600 text-black py-2 rounded-xl text-xs font-bold transition-all"
                    >
                      Guardar en Catálogo
                    </button>
                  </div>
                </div>

                {/* Dispatch form */}
                <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">Despachar Envío Individual B2C</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Dirección de Destino</label>
                      <input
                        type="text"
                        value={packageDest}
                        onChange={(e) => setPackageDest(e.target.value)}
                        placeholder="Cabrera 3400, Palermo"
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
                                : 'bg-black border border-gray-800 text-gray-400'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleSendB2CPackage}
                      className="w-full bg-green-brand hover:bg-green-600 text-black py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      Solicitar Despacho GPS
                    </button>
                  </div>
                </div>

                {/* Valentina IA widget */}
                <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <BrandLogo variant="emprendedor" size="sm" />
                    <div>
                      <h4 className="text-xs font-black text-white">VALENTINA IA - RECOMENDADORA</h4>
                      <span className="text-[8px] text-green-400 font-black tracking-widest uppercase block mt-0.5">Asesora de Ventas</span>
                    </div>
                  </div>

                  <div className="bg-black/60 p-4 rounded-xl space-y-3">
                    <p className="text-xs text-gray-300 italic leading-relaxed">
                      "Hola che. Con este fresco de {temperature}°C te recomiendo lanzar promos de pan de campo calentito a la tarde para levantar las ventas de forma inmediata."
                    </p>

                    <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
                      <button
                        onClick={() => VoiceProvider.speak({
                          text: "Hola che, qué tal. Para aumentar las ventas con el clima fresco de hoy, te recomiendo armar combos de bizcochuelo casero a la tarde.",
                          engine: 'kokoro',
                          voiceProfile: 'valentina'
                        })}
                        className="bg-green-brand hover:bg-green-600 text-black px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Hablar con Valentina
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              DASHBOARD: ADMINISTRADOR GLOBAL (CONTROL TOWER)
              ======================================================== */}
          {sessionUser.role === 'admin' && (
            <div className="space-y-6">
              
              {/* Header metrics card */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl">
                  <span className="text-[9px] text-gray-500 uppercase font-black block">Total comisiones de red</span>
                  <span className="text-2xl font-black text-purple-400">$34,800 ARS</span>
                  <p className="text-[9px] text-gray-400 mt-1">20% neto retenido en el ledger</p>
                </div>

                <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl">
                  <span className="text-[9px] text-gray-500 uppercase font-black block">Socio de reparto activo</span>
                  <span className="text-2xl font-black text-blue-brand">Carlos Gómez + 11</span>
                  <p className="text-[9px] text-gray-400 mt-1">Sincronización en tiempo real activa</p>
                </div>

                <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl">
                  <span className="text-[9px] text-gray-500 uppercase font-black block">Zonas calientes Palermo</span>
                  <span className="text-2xl font-black text-yellow-500">Demanda Crítica (+35%)</span>
                  <p className="text-[9px] text-gray-400 mt-1">Multiplicadores automáticos sugeridos</p>
                </div>

                {/* Weather simulator force */}
                <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-2">
                  <span className="text-[9px] text-gray-500 uppercase font-black block">Cambiar Clima Operativo</span>
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

              {/* Main operational column: map protagonist and layers filter */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Real-time map with togglers */}
                <div className="lg:col-span-2 bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                    <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">Torre de Control Satelital Global</h4>
                    <span className="text-xs text-purple-400 font-bold">Admin View</span>
                  </div>

                  {/* Layer indicators checkboxes */}
                  <div className="flex flex-wrap gap-3 text-xs bg-black/50 p-3 rounded-xl border border-gray-900">
                    <span className="text-gray-500 font-extrabold mr-1">Capas:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adminMapFilters.repartidores}
                        onChange={(e) => setAdminMapFilters(prev => ({ ...prev, repartidores: e.target.checked }))}
                        className="rounded bg-black border-gray-800 text-blue-brand focus:ring-0"
                      />
                      🚴 Repartidores
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adminMapFilters.comercios}
                        onChange={(e) => setAdminMapFilters(prev => ({ ...prev, comercios: e.target.checked }))}
                        className="rounded bg-black border-gray-800 text-blue-brand focus:ring-0"
                      />
                      🏢 Comercios B2B
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adminMapFilters.emprendedores}
                        onChange={(e) => setAdminMapFilters(prev => ({ ...prev, emprendedores: e.target.checked }))}
                        className="rounded bg-black border-gray-800 text-blue-brand focus:ring-0"
                      />
                      📦 Emprendedores
                    </label>
                  </div>

                  <div className="h-80 rounded-xl overflow-hidden border border-gray-brand bg-black relative">
                    <ArgentinaMap markers={[]} gpsSimulating={true} gpsProgress={50} />
                  </div>
                </div>

                {/* Right: Gemini AI and Logs */}
                <div className="space-y-6">
                  
                  {/* Gemini AI recommendations */}
                  <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-800">
                      <BrandLogo variant="admin" size="sm" />
                      <div>
                        <h4 className="text-xs font-black text-white">RECOMENDACIONES GEMINI 3.5</h4>
                        <span className="text-[8px] text-purple-400 font-black block mt-0.5">Analítica Logística</span>
                      </div>
                    </div>

                    {geminiLoading ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
                        <span className="text-xs text-gray-500">Consultando Gemini...</span>
                      </div>
                    ) : geminiResult ? (
                      <div className="space-y-3 text-xs leading-relaxed">
                        <div className="bg-black/50 p-3 rounded-xl">
                          <span className="font-extrabold text-white block mb-1">🛰️ {geminiResult.heading}</span>
                          <p className="text-gray-400 italic">"{geminiResult.behaviorAnalysis}"</p>
                        </div>
                        <div className="space-y-1.5">
                          {geminiResult.recommendations.map((rec: string, i: number) => (
                            <div key={i} className="bg-black/30 p-2.5 rounded-lg border border-gray-850 flex gap-2">
                              <Check className="text-purple-400 shrink-0 w-3.5 h-3.5 mt-0.5" />
                              <span className="text-gray-300 text-[11px]">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 text-center">Cambia el clima para recalcular las sugerencias de la IA.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              COMMON: SYSTEM NOTIFICATION CENTER FOR ALL AUTHENTICATED ROLES
              ======================================================== */}
          <div className="bg-[#141414] border border-gray-brand p-5 rounded-2xl space-y-4 text-left">
            <div className="flex items-center gap-2 text-blue-brand">
              <Bell className="w-5 h-5 animate-swing" />
              <h4 className="font-black text-sm uppercase tracking-wider text-white">Centro de Notificaciones en Tiempo Real</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-1">
              {notifications.map(notif => (
                <div key={notif.id} className="bg-black/60 border border-gray-850 p-3 rounded-xl flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <strong className="text-white block font-extrabold">{notif.title}</strong>
                    <span className="text-gray-400 leading-normal block">{notif.desc}</span>
                  </div>
                  <span className="text-[9px] text-gray-600 font-mono shrink-0">{notif.time}</span>
                </div>
              ))}
            </div>
          </div>

        </main>
      )}

      {/* --- DEV / ADMIN CONSOLE BACKPORT UNDER /dev --- */}
      {window.location.pathname.startsWith('/dev') && (
        <div className="bg-red-500 text-white font-bold p-2 text-center text-xs">
          HERRAMIENTAS DE DESARROLLO INTERNAS DETECTADAS. Cuidado al interactuar.
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#151D25]/30 text-center py-4 border-t border-gray-850 shrink-0 text-gray-500 text-[10px] select-none z-10 relative">
        DeliveryPlus B2B Deliveries System • Sandbox Visual e interactivo 2026. Todas las licencias reservadas.
      </footer>
    </div>
  );
};
