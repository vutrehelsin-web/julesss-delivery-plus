import { useState, useEffect, useRef, useMemo } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { MainDashboard } from './components/MainDashboard';
import {
  Bike,
  Calendar,
  TrendingUp,
  Wallet,
  User,
  Star,
  Cloud,
  CloudRain,
  CloudLightning,
  Sun,
  Phone,
  MapPin,
  AlertCircle,
  Terminal,
  FileCode,
  Database,
  Plus,
  Search,
  MessageSquare,
  Send,
  Play,
  Square,
  Check,
  CheckSquare,
  Sparkles,
  Clock,
  ArrowUpRight,
  Download,
  Upload,
  RefreshCw,
  LogOut,
  Sliders,
  ChevronRight,
  Map,
  Layers,
  Heart,
  Award,
  Volume2,
  Trash2,
  Lock,
  Smartphone,
  Eye,
  Menu,
  Camera,
  Mic,
  Compass,
  BellRing,
  Package,
  Navigation
} from 'lucide-react';
import { FLUTTER_CODE_FILES, BACKEND_CODE_FILES } from './code_repository';
import { BrandLogo } from './components/BrandLogo';
import { ArgentinaMap } from './components/ArgentinaMap';
import { AIChatAssistant } from './components/AIChatAssistant';
import { AdminChartsCard, MPWalletCard, IARecommendsCard } from './components/AdminComponents';

import { Usuario, Repartidor, Turno, EntregaUnica, Transaccion, Mensaje } from './types';

// Helper to retrieve initial states from sync storage
const getInitialSyncState = () => {
  try {
    const saved = localStorage.getItem('deliveryplus_synced_state');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading initial sync state:", e);
  }
  return null;
};

// Play a synthesized futuristic push alert sound chime via Web Audio API 
const playBeepChime = (type: 'success' | 'warning' | 'info') => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioCtx.currentTime;
    
    if (type === 'success') {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.35); // A5
      
      osc2.frequency.setValueAtTime(659.25, now); // E5
      osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.35); // C6
      
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      osc1.start(now);
      osc2.start(now);
      
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } else if (type === 'warning') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(293.66, now + 0.3); // D4
      
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc.start(now);
      osc.stop(now + 0.3);
    } else {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(554.37, now + 0.1); // C#5
      
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (err) {
    console.warn("Audio Context not supported or allowed yet.", err);
  }
};

const initialSyncState = getInitialSyncState();

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Core state
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [repartidor, setRepartidor] = useState<Repartidor | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [entregas, setEntregas] = useState<EntregaUnica[]>([]);
  const [walletSaldo, setWalletSaldo] = useState<number>(0);
  const [adminSaldo, setAdminSaldo] = useState<number>(0);
  const [adminMpSaldo, setAdminMpSaldo] = useState<number>(0);
  const [mpHistorial, setMpHistorial] = useState<any[]>([]);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<any[]>([]);
  
  // Portal state
  const [activePortalView, setActivePortalView] = useState<'dashboard' | 'sandbox' | 'descarga' | 'comercio' | 'emprendedor' | 'repartidor' | 'admin'>('dashboard');
  
  // Custom Voice for Assistant
  const [customVoiceId, setCustomVoiceId] = useState<string>('ByVRQtaK1WDOvTmP1PKO');

  // Weather/Context Simulation placeholders
  const [weatherCondition, setWeatherCondition] = useState('despejado');
  const [temperature, setTemperature] = useState(20);
  const [multiplier, setMultiplier] = useState(1);
  const [activeTab, setActiveTab] = useState<'disponibles' | 'mision' | 'historial'>('disponibles');
  const [phoneScreen, setPhoneScreen] = useState('home');
  const [activeTurnoTab, setActiveTurnoTab] = useState('disponibles');
  const [activeDeliveryId, setActiveDeliveryId] = useState<number | null>(null);
  const [gpsSimulating, setGpsSimulating] = useState(false);
  const [chatMessages, setChatMessages] = useState<Mensaje[]>([]);
  const [newMsgText, setNewMsgText] = useState('');
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioRecordingTimer, setAudioRecordingTimer] = useState(0);
  const audioIntervalRef = useRef<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('mockups');
  const [activeCodeModule, setActiveCodeModule] = useState('flutter');
  const [selectedCodeFile, setSelectedCodeFile] = useState('home_screen.dart');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [dbSearchTerm, setDbSearchTerm] = useState('');
  const [activeDbTable, setActiveDbTable] = useState('usuarios');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraScanned, setCameraScanned] = useState(false);
  const [micRecording, setMicRecording] = useState(false);
  const [micResult, setMicResult] = useState('');
  const [gpsCoords, setGpsCoords] = useState({ lat: -34.6037, lng: -58.3816 });
  const [gyroForces, setGyroForces] = useState({ x: 0, y: 0, z: 0 });
  const [emprendedorNombre, setEmprendedorNombre] = useState('Pastas de la Nona');
  const [entregaOrigen, setEntregaOrigen] = useState('Av. Corrientes 1000');
  const [entregaDestino, setEntregaDestino] = useState('Av. Corrientes 2000');
  const [entregaTamano, setEntregaTamano] = useState<'pequeño' | 'mediano' | 'grande'>('pequeño');
  const [entregaMontoBase, setEntregaMontoBase] = useState('3500');
  const [comercioNombre, setComercioNombre] = useState('Burger House');
  const [comercioHorario, setComercioHorario] = useState('20:00 a 00:00');
  const [comercioMonto, setComercioMonto] = useState('15000');
  const [isShaking, setIsShaking] = useState(false);
  const [phoneTheme, setPhoneTheme] = useState('dark');
  const [phoneNotification, setPhoneNotification] = useState<any>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regSurname, setRegSurname] = useState('');
  const [regVehicle, setRegVehicle] = useState<'bicicleta' | 'moto' | 'auto'>('moto');
  const [regPatent, setRegPatent] = useState('');
  const [regPhone, setRegPhone] = useState('11223344');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [gpsProgress, setGpsProgress] = useState(0);
  
  // --- MARKER MAPPING HELPER ---
  const mapMarkers = useMemo(() => {
    return [
      ...turnos.map(t => ({ id: `c_${t.id}`, name: t.comercio_nombre, x: 67 + (Math.random() - 0.5) * 10, y: 46 + (Math.random() - 0.5) * 10, type: 'comercio' as const })),
      ...entregas.map(e => ({ id: `e_${e.id}`, name: e.emprendedor_nombre, x: 60 + (Math.random() - 0.5) * 15, y: 39 + (Math.random() - 0.5) * 15, type: 'emprendedor' as const }))
    ];
  }, [turnos, entregas]);

  // Load initial portal view from URL query param (e.g. ?portal=repartidor)
  useEffect(() => {
    // Auth Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const params = new URLSearchParams(window.location.search);
    const portal = params.get('portal');
    if (portal && ['sandbox', 'comercio', 'emprendedor', 'repartidor', 'admin'].includes(portal)) {
      setActivePortalView(portal as any);
    }
    
    return () => subscription.unsubscribe();
  }, []);

  // Native Sensors Update Loop (GPS and Gyroscope)
  useEffect(() => {
    const sensorInterval = setInterval(() => {
      // Fluctuate GPS slightly around Buenos Aires Obelisk
      setGpsCoords(prev => {
        const dLat = (Math.random() - 0.5) * 0.00015;
        const dLng = (Math.random() - 0.5) * 0.00015;
        return { lat: prev.lat + dLat, lng: prev.lng + dLng };
      });

      // Fluctuate Gyroscope 3-axis forces
      setGyroForces(prev => {
        const dx = (Math.random() - 0.5) * 0.04;
        const dy = (Math.random() - 0.5) * 0.04;
        const dz = (Math.random() - 0.5) * 0.02;
        return {
          x: parseFloat((Math.min(1.5, Math.max(-1.5, prev.x + dx))).toFixed(3)),
          y: parseFloat((Math.min(1.5, Math.max(-1.5, prev.y + dy))).toFixed(3)),
          z: parseFloat((Math.min(1.5, Math.max(0.2, prev.z + dz))).toFixed(3)),
        };
      });
    }, 1500);

    return () => clearInterval(sensorInterval);
  }, []);

  // Save states to local storage for real-time multi-session sync
  useEffect(() => {
    const stateObj = {
      usuarios,
      repartidor,
      turnos,
      entregas,
      walletSaldo,
      adminSaldo,
      adminMpSaldo,
      mpHistorial,
      transacciones,
      consoleLogs,
      weatherCondition,
      temperature,
      multiplier,
      chatMessages
    };
    localStorage.setItem('deliveryplus_synced_state', JSON.stringify(stateObj));
  }, [
    usuarios,
    repartidor,
    turnos,
    entregas,
    walletSaldo,
    adminSaldo,
    adminMpSaldo,
    mpHistorial,
    transacciones,
    consoleLogs,
    weatherCondition,
    temperature,
    multiplier,
    chatMessages
  ]);

  // Listen to storage events to immediately replicate writes made by other tabs/sessions
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'deliveryplus_synced_state' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.usuarios) setUsuarios(data.usuarios);
          if (data.repartidor) setRepartidor(data.repartidor);
          if (data.turnos) setTurnos(data.turnos);
          if (data.entregas) setEntregas(data.entregas);
          if (data.walletSaldo !== undefined) setWalletSaldo(data.walletSaldo);
          if (data.adminSaldo !== undefined) setAdminSaldo(data.adminSaldo);
          if (data.adminMpSaldo !== undefined) setAdminMpSaldo(data.adminMpSaldo);
          if (data.mpHistorial) setMpHistorial(data.mpHistorial);
          if (data.transacciones) setTransacciones(data.transacciones);
          if (data.consoleLogs) setConsoleLogs(data.consoleLogs);
          if (data.weatherCondition) setWeatherCondition(data.weatherCondition);
          if (data.temperature !== undefined) setTemperature(data.temperature);
          if (data.multiplier !== undefined) setMultiplier(data.multiplier);
          if (data.chatMessages) setChatMessages(data.chatMessages);
        } catch (err) {
          console.error("Error sync state:", err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Cashier modal inside wallet
  const [walletAmountInput, setWalletAmountInput] = useState<string>('10000');
  const [cashierModal, setCashierModal] = useState<'retiro' | 'deposito' | null>(null);

  // --- COMPONENT LEVEL SOUNDS & LOG HELPERS ---
  const logEvent = (text: string, type: 'success' | 'info' | 'warn' | 'error' = 'info') => {
    const timeNow = new Date().toLocaleTimeString('es-AR', { hour12: false });
    setConsoleLogs((prev) => [
      { id: Date.now().toString() + Math.random(), time: timeNow, text, type },
      ...prev
    ]);
  };

  const getMultiplierIcon = () => {
    if (weatherCondition === 'tormenta') return <CloudLightning className="text-yellow-400 w-5 h-5 animate-pulse" />;
    if (weatherCondition === 'lluvia') return <CloudRain className="text-blue-400 w-5 h-5" />;
    if (weatherCondition === 'nublado') return <Cloud className="text-gray-400 w-5 h-5" />;
    return <Sun className="text-orange-400 w-5 h-5" />;
  };

  // --- ACTIONS ---
  // Change weather forecast state
  const handleWeatherChange = (cond: 'despejado' | 'nublado' | 'lluvia' | 'tormenta') => {
    let temp = 22.0;
    let mult = 1.0;
    let impactText = 'Condiciones espectaculares. Tarifas estándar base.';
    if (cond === 'nublado') {
      temp = 18.2;
      mult = 1.05;
      impactText = 'Nublado. Demanda estable de almuerzos B2B.';
    } else if (cond === 'lluvia') {
      temp = 14.5;
      mult = 1.25;
      impactText = 'Lluvia persistente detectada. Bono climático +25% activo para conductores.';
    } else if (cond === 'tormenta') {
      temp = 11.0;
      mult = 1.40;
      impactText = 'Tormenta eléctrica severa. Multiplicador de tarifa subió a 1.40x. Tiempos estimados incrementan +12 min.';
    }
    setWeatherCondition(cond);
    setTemperature(temp);
    setMultiplier(mult);
    logEvent(`GET /api/ia/clima - 200 OK - Weather changed: ${cond.toUpperCase()} (${temp}°C, Rate: ${mult}x)`, 'success');
    logEvent(`[IA Prediction] Forecast recalculated. ${impactText}`, 'info');

    // Trigger phone notification
    triggerNotification('Alerta de Clima IA', `Tarifa multiplicada por ${mult}x en zonas calientes.`);
  };

  // Place a new simulated merchant order
  const handleSimulatedOrder = (type: 'turno' | 'entrega') => {
    if (type === 'turno') {
      const newTurnoId = turnos.length + 1;
      const hours = ['19:00 - 23:00', '20:00 - 00:00', '11:00 - 15:00'];
      const hour = hours[Math.floor(Math.random() * hours.length)];
      const rates = [14000, 15000, 16000, 18000];
      const rate = rates[Math.floor(Math.random() * rates.length)];
      const newTurno: Turno = {
        id: newTurnoId,
        comercio_nombre: 'Burger House',
        direccion: 'Av. Córdoba 3900, Almagro',
        fecha: 'Hoy',
        horario: hour,
        monto_total: rate,
        monto_repartidor: rate * 0.8,
        monto_plataforma: rate * 0.2,
        estado: 'disponible'
      };

      setTurnos((prev) => [newTurno, ...prev]);
      logEvent(`POST /api/turnos - 201 Created - New shift block by Burger House ID: ${newTurnoId}`, 'success');
      triggerNotification('Nuevo Turno Disponible', `Burger House ofrece turno de 4 horas por $${newTurno.monto_repartidor}`);
    } else {
      const newEntregaId = entregas.length + 1;
      const newEntrega: EntregaUnica = {
        id: newEntregaId,
        emprendedor_nombre: 'Pastas de la Nona',
        direccion_origen: 'Serrano 1230, Villa Crespo',
        direccion_destino: 'Gurruchaga 1550, Palermo',
        tamano: 'pequeño',
        monto_total: 3800,
        monto_repartidor: Math.round(3800 * multiplier * 0.8),
        monto_plataforma: Math.round(3800 * multiplier * 0.2),
        estado: 'disponible'
      };
      setEntregas((prev) => [newEntrega, ...prev]);
      logEvent(`POST /api/entregas - 201 Created - Individual parcel dispatched by Pastas de la Nona`, 'success');
      triggerNotification('Nueva Entrega Cercana', `Sugerida por IA: $${newEntrega.monto_repartidor} de Pastas de la Nona.`);
    }
  };

  const playNotificationChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      
      osc2.frequency.setValueAtTime(659.25, now + 0.05); // E5
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.2); // D6
      
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      osc1.start(now);
      osc2.start(now + 0.05);
      
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);
    } catch (e) {
      console.log('Audio chiming not allowed or blocked by context.', e);
    }
  };

  const triggerNotification = (title: string, body: string) => {
    setPhoneNotification({ title, body });
    playNotificationChime();
    // Autohide notification after 4.5 seconds
    setTimeout(() => {
      setPhoneNotification(null);
    }, 4500);
  };

  // Login handler with real Supabase Auth integration
  const handlePhoneLogin = async () => {
    if (!loginEmail.includes('@')) {
      alert('Email inválido.');
      return;
    }
    logEvent(`POST /api/auth/login - Initiating Supabase Auth Verification...`, 'info');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        // High-fidelity fallback for offline / mock testing
        if (loginEmail === 'repartidor@test.com' && loginPassword === '123456') {
          setIsLoggedIn(true);
          setPhoneScreen('home');
          logEvent(`POST /api/auth/login - 200 OK - (Fallback) Authorized Carlos Gómez. JWT signed successfully.`, 'success');
          return;
        }
        logEvent(`POST /api/auth/login - 401 Unauthorized - Supabase Auth Error: ${error.message}`, 'error');
        alert(`Error al iniciar sesión: ${error.message}`);
        return;
      }

      setIsLoggedIn(true);
      setPhoneScreen('home');
      logEvent(`POST /api/auth/login - 200 OK - Authorized ${data.user?.email}. JWT Session active.`, 'success');
      logEvent(`GET /api/auth/profile - 200 OK - User profile synchronized with Supabase Auth`, 'info');
    } catch (err: any) {
      logEvent(`POST /api/auth/login - 500 Server Error - ${err.message}`, 'error');
    }
  };

  // Register with real Supabase Auth integration
  const handlePhoneRegister = async () => {
    if (!regEmail || !regPassword) {
      alert('Por favor completa los campos de registro.');
      return;
    }
    logEvent(`POST /api/auth/register - Initiating Supabase Auth SignUp...`, 'info');
    try {
      const { data, error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            nombre: regName,
            apellido: regSurname,
            tipo_vehiculo: regVehicle,
            patente: regPatent || 'S/P'
          }
        }
      });

      if (error) {
        logEvent(`POST /api/auth/register - 400 Bad Request - Supabase Auth Error: ${error.message}`, 'error');
        alert(`Error al registrar usuario: ${error.message}`);
        return;
      }

      const newUserId = usuarios.length + 1;
      setUsuarios((prev) => [
        ...prev,
        { id: newUserId, email: regEmail, telefono: regPhone, rol: 'Repartidor', activo: true }
      ]);
      setRepartidor({
        id: newUserId,
        nombre: regName,
        apellido: regSurname,
        tipo_vehiculo: regVehicle,
        patente: regPatent || 'S/P',
        disponible: true,
        verificado: true,
        calificacion: 5.00,
        total_entregas: 0,
        entregas_a_tiempo: 0
      });

      setIsLoggedIn(true);
      setPhoneScreen('home');
      logEvent(`POST /api/auth/register - 201 Created - Real user registered on Supabase Auth: ${data.user?.email}`, 'success');
      alert('Registro completado de forma real en Supabase Auth.');
    } catch (err: any) {
      logEvent(`POST /api/auth/register - 500 Server Error - ${err.message}`, 'error');
    }
  };

  // Toggle availability with real PostgreSQL integration
  const toggleAvailability = async () => {
    if (!repartidor) return;
    const nextVal = !repartidor.disponible;
    try {
      const response = await fetch(`/api/repartidores/${repartidor.id}/disponibilidad`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ disponible: nextVal })
      });
      const result = await response.json();
      console.log('PostgreSQL availability sync:', result);
    } catch (err) {
      console.error('Error syncing availability with backend:', err);
    }
    setRepartidor((prev) => prev ? { ...prev, disponible: nextVal } : null);
    logEvent(`PATCH /api/repartidores/disponibilidad - 200 OK - Disponibilidad de Carlos: ${nextVal ? 'ACTIVO' : 'DESCONECTADO'} (Persistido en DB)`, 'success');
  };

  // Accept Shift Box (Turno Bloque)
  const acceptShift = (id: number) => {
    setTurnos((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          logEvent(`PATCH /api/turnos/${id}/aceptar - 200 OK - Block designated. Status updated to CONFIRMADO (Simulado)`, 'success');
          triggerNotification('Turno Asignado', `¡Turno de ${t.comercio_nombre} asignado! Debes presentarte a la hora acordada.`);
          return { ...t, estado: 'confirmado', repartidor_id: 1 };
        }
        return t;
      })
    );
  };

  const finishShift = (id: number) => {
    const item = turnos.find(t => t.id === id);
    if (!item || item.estado === 'completado') return;
    
    setTurnos((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          logEvent(`PATCH /api/turnos/${id}/finalizar - 200 OK - Block finished`, 'success');
          const shareRepartidor = t.monto_repartidor;
          const sharePlataforma = t.monto_plataforma;

          setTimeout(() => {
            setWalletSaldo((prevSal) => prevSal + shareRepartidor);
            setAdminSaldo((prevAdm) => prevAdm + sharePlataforma);

            setTransacciones((trans) => [
              {
                id: trans.length + 1,
                tipo: 'ingreso_turno',
                monto: shareRepartidor,
                saldo_anterior: walletSaldo,
                saldo_posterior: walletSaldo + shareRepartidor,
                referencia: `turno_${t.id}`,
                fecha: new Date().toISOString().replace('T', ' ').slice(0, 16)
              },
              {
                id: trans.length + 2,
                tipo: 'comision_plataforma',
                monto: sharePlataforma,
                saldo_anterior: adminSaldo,
                saldo_posterior: adminSaldo + sharePlataforma,
                referencia: `turno_${t.id}`,
                fecha: new Date().toISOString().replace('T', ' ').slice(0, 16)
              },
              ...trans
            ]);

            logEvent(`[Billetera Split] 80% paid to Repartidor (+$${shareRepartidor}). 20% commission paid to Platform (+$${sharePlataforma})`, 'info');
          }, 600);

          return { ...t, estado: 'completado', repartidor_id: 1 };
        }
        return t;
      })
    );
  };

  // Accept Delivery (Entrega Única)
  const acceptDelivery = (id: number) => {
    setEntregas((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          logEvent(`PATCH /api/entregas/${id}/aceptar - 200 OK - Delivery assigned code signed`, 'success');
          setActiveDeliveryId(id);
          setActiveTab('mision'); // Switch to active trip
          return { ...e, estado: 'asignado', repartidor_id: 1 };
        }
        return e;
      })
    );
  };

  const finishDelivery = (id: number) => {
    const item = entregas.find(e => e.id === id);
    if (!item || item.estado === 'entregado') return;

    setEntregas((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          logEvent(`PATCH /api/entregas/${id}/estado - Status: ENTREGADO`, 'success');
          const shareRep = e.monto_repartidor;
          const sharePlat = e.monto_plataforma;

          setWalletSaldo((wallet) => wallet + shareRep);
          setAdminSaldo((adm) => adm + sharePlat);

          setTransacciones((trans) => [
            {
              id: trans.length + 1,
              tipo: 'ingreso_envio',
              monto: shareRep,
              saldo_anterior: walletSaldo,
              saldo_posterior: walletSaldo + shareRep,
              referencia: `envio_${e.id}`,
              fecha: new Date().toISOString().replace('T', ' ').slice(0, 16)
            },
            {
               id: trans.length + 2,
               tipo: 'comision_plataforma',
               monto: sharePlat,
               saldo_anterior: adminSaldo,
               saldo_posterior: adminSaldo + sharePlat,
               referencia: `envio_${e.id}`,
               fecha: new Date().toISOString().replace('T', ' ').slice(0, 16)
            },
            ...trans
          ]);
          logEvent(`[Billetera Split] Paid +$${shareRep} to rider, +$${sharePlat} to platform.`, 'info');
          return { ...e, estado: 'entregado' };
        }
        return e;
      })
    );
  };

  // Perform GPS Simulation routes
  const startGpsTracking = () => {
    if (!activeDeliveryId) return;
    setGpsSimulating(true);
    setGpsProgress(5);
    logEvent(`GET /api/repartidores/gps-route - Initialized live route tracking to source address`, 'info');

    // 1. Recolectado
    setTimeout(() => {
      setGpsProgress(35);
      setEntregas((prev) =>
        prev.map((e) => (e.id === activeDeliveryId ? { ...e, estado: 'recolectado' } : e))
      );
      logEvent(`PATCH /api/entregas/${activeDeliveryId}/estado - Status: RECOLECTADO. Cargo retirado del local.`, 'success');
      
      // Auto merchant response chat triggered
      setChatMessages((messages) => [
        ...messages,
        { id: messages.length + 1, sender: 'emprendedor', tipo: 'texto', contenido: 'Perfecto Carlos! Por favor ten cuidado con los cruces en la avenida.' }
      ]);
    }, 2500);

    // 2. En Camino
    setTimeout(() => {
      setGpsProgress(70);
      setEntregas((prev) =>
        prev.map((e) => (e.id === activeDeliveryId ? { ...e, estado: 'en_camino' } : e))
      );
      logEvent(`PATCH /api/entregas/${activeDeliveryId}/estado - Status: EN_CAMINO. Geolocalización en la ruta más rápida.`, 'success');
    }, 5500);

    // 3. Entregado
    setTimeout(() => {
      setGpsProgress(100);
      setGpsSimulating(false);

      const item = entregas.find((e) => e.id === activeDeliveryId);
      if (item) {
        const shareRep = item.monto_repartidor;
        const sharePlat = item.monto_plataforma;

        setWalletSaldo((prev) => prev + shareRep);
        setAdminSaldo((prev) => prev + sharePlat);

        setTransacciones((trans) => [
          {
            id: trans.length + 1,
            tipo: 'ingreso_entrega',
            monto: shareRep,
            saldo_anterior: walletSaldo,
            saldo_posterior: walletSaldo + shareRep,
            referencia: `entrega_${item.id}`,
            fecha: new Date().toISOString().replace('T', ' ').slice(0, 16)
          },
          {
            id: trans.length + 2,
            tipo: 'comision_plataforma',
            monto: sharePlat,
            saldo_anterior: adminSaldo,
            saldo_posterior: adminSaldo + sharePlat,
            referencia: `entrega_${item.id}`,
            fecha: new Date().toISOString().replace('T', ' ').slice(0, 16)
          },
          ...trans
        ]);

        setEntregas((prev) =>
          prev.map((e) => (e.id === activeDeliveryId ? { ...e, estado: 'entregado' } : e))
        );

        logEvent(`PATCH /api/entregas/${activeDeliveryId}/estado - Status: ENTREGADO. Destino alcanzado con éxito.`, 'success');
        logEvent(`[Billetera Split] split complete. Carlos earned 80% (+$${shareRep}). Platform fee 20% (+$${sharePlat}).`, 'success');
        
        triggerNotification('Entrega Exitosa', `¡Felicidades! Se depositaron $${shareRep} en tu billetera.`);
      }

      setActiveDeliveryId(null);
      setActiveTab('disponibles');
    }, 9000);
  };

  // Chat texting
  const sendChatMessage = () => {
    if (!newMsgText.trim()) return;
    const msgId = chatMessages.length + 1;
    const newMsg: Mensaje = {
      id: msgId,
      sender: 'repartidor',
      tipo: 'texto',
      contenido: newMsgText
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setNewMsgText('');
    logEvent(`POST /api/chat/mensaje - Mensaje de texto enviado por el repartidor`, 'success');

    // Simulated respondent answers
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'emprendedor',
          tipo: 'texto',
          contenido: 'Excelente Carlos! El cliente va a estar esperándote en la puerta de entrada.'
        }
      ]);
      logEvent(`[Webhook Inbound] Respuesta de Pastas de la Nona procesada`, 'info');
    }, 2000);
  };

  // Simulate push-to-talk audio
  const startRecordingAudio = () => {
    setIsRecordingAudio(true);
    setAudioRecordingTimer(0);
    audioIntervalRef.current = setInterval(() => {
      setAudioRecordingTimer((p) => p + 1);
    }, 1000);
  };

  const stopRecordingAudio = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    setIsRecordingAudio(false);
    if (audioRecordingTimer > 0) {
      const msgId = chatMessages.length + 1;
      setChatMessages((prev) => [
        ...prev,
        {
          id: msgId,
          sender: 'repartidor',
          tipo: 'audio',
          contenido: `Mensaje de voz grabado`,
          audio_segundos: audioRecordingTimer
        }
      ]);
      logEvent(`POST /api/chat/mensaje - Mensaje de audio (${audioRecordingTimer}s) subido al Bucket de adjuntos`, 'success');
    }
  };

  // Withdraw/Deposit controls
  const handleCashierSubmit = () => {
    const val = parseFloat(walletAmountInput);
    if (isNaN(val) || val <= 0) {
      alert('Monto inválido.');
      return;
    }

    if (cashierModal === 'retiro') {
      if (val > walletSaldo) {
        alert('Saldo insuficiente para retiro.');
        return;
      }
      const newSaldo = walletSaldo - val;
      
      // PostgreSQL backend sync
      fetch(`/api/billeteras/2/transacciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'retiro', monto: val })
      }).then(res => res.json()).then(data => {
        console.log('PostgreSQL wallet withdrawal sync:', data);
        // Trigger voice and push notification flow
        fetch('/api/notifications/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'WALLET_UPDATED', details: { tipo: 'retiro', amount: val } })
        });
      });

      setWalletSaldo(newSaldo);
      setTransacciones((t) => [
        {
          id: t.length + 1,
          tipo: 'retiro',
          monto: -val,
          saldo_anterior: walletSaldo,
          saldo_posterior: newSaldo,
          referencia: 'retiro_banco (Persistido)',
          fecha: new Date().toISOString().replace('T', ' ').slice(0, 16)
        },
        ...t
      ]);
      logEvent(`POST /api/billetera/retirar - 200 OK - Retiro de -$${val} exitoso. Liquidado a cuenta bancaria (Persistido en DB)`, 'success');
    } else if (cashierModal === 'deposito') {
      const newSaldo = walletSaldo + val;

      // PostgreSQL backend sync
      fetch(`/api/billeteras/2/transacciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'deposito', monto: val })
      }).then(res => res.json()).then(data => {
        console.log('PostgreSQL wallet deposit sync:', data);
        // Trigger voice and push notification flow
        fetch('/api/notifications/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'WALLET_UPDATED', details: { tipo: 'deposito', amount: val } })
        });
      });

      setWalletSaldo(newSaldo);
      setTransacciones((t) => [
        {
          id: t.length + 1,
          tipo: 'deposito',
          monto: val,
          saldo_anterior: walletSaldo,
          saldo_posterior: newSaldo,
          referencia: 'carga_tarjeta (Persistido)',
          fecha: new Date().toISOString().replace('T', ' ').slice(0, 16)
        },
        ...t
      ]);
      logEvent(`POST /api/billetera/depositar - 200 OK - Carga de +$${val} por pasarela de pagos B2B.`, 'success');
    }
    setCashierModal(null);
  };

  // --- SOURCE CODE EXPLORATION DATA ---
  const activeCodeFilesList = useMemo(() => {
    if (activeCodeModule === 'flutter') return FLUTTER_CODE_FILES;
    if (activeCodeModule === 'backend') return BACKEND_CODE_FILES;
    return [];
  }, [activeCodeModule]);

  const activeFileContent = useMemo(() => {
    if (activeCodeModule === 'sql') {
      // Find the loaded SQL file
      return {
        name: 'deliveryplus.sql',
        path: 'database/deliveryplus.sql',
        content: `CREATE DATABASE IF NOT EXISTS \`deliveryplus\`;
USE \`deliveryplus\`;

-- Roles: 1=Admin, 2=Comercio, 3=Emprendedor, 4=Repartidor
CREATE TABLE \`usuarios\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`email\` VARCHAR(150) UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`rol_id\` INT NOT NULL
);

-- Liquidación de Pagos B2B: 80% Repartidor, 20% Plataforma
CREATE TABLE \`turnos\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`comercio_id\` INT NOT NULL,
  \`monto_total\` DECIMAL(10,2),
  \`monto_repartidor\` DECIMAL(10,2), -- 80% Neto
  \`monto_plataforma\` DECIMAL(10,2), -- 20% Fee
  \`estado\` ENUM('disponible','confirmado','completado')
);`,
        description: 'Estructura e inicializadores de base de datos local sin dependencias Docker.'
      };
    }
    const found = activeCodeFilesList.find((f) => f.name === selectedCodeFile);
    return found || activeCodeFilesList[0] || { name: '', path: '', content: '', description: '' };
  }, [activeCodeModule, selectedCodeFile, activeCodeFilesList]);

  // Adjust Code Selection when code tab changes
  useEffect(() => {
    if (activeCodeModule === 'flutter') {
      setSelectedCodeFile('home_screen.dart');
    } else if (activeCodeModule === 'backend') {
      setSelectedCodeFile('authController.js');
    }
  }, [activeCodeModule]);

  // Copy code utility
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Filter tables in explorer
  const filteredDbRows = useMemo(() => {
    if (activeDbTable === 'usuarios') {
      return usuarios.filter((u) => u.email.toLowerCase().includes(dbSearchTerm.toLowerCase()) || u.rol.toLowerCase().includes(dbSearchTerm.toLowerCase()));
    } else if (activeDbTable === 'repartidores') {
      return [repartidor].filter((r) => r.nombre.toLowerCase().includes(dbSearchTerm.toLowerCase()) || r.patente.toLowerCase().includes(dbSearchTerm.toLowerCase()));
    } else if (activeDbTable === 'turnos') {
      return turnos.filter((t) => t.comercio_nombre.toLowerCase().includes(dbSearchTerm.toLowerCase()) || t.estado.toLowerCase().includes(dbSearchTerm.toLowerCase()));
    } else if (activeDbTable === 'entregas_unicas') {
      return entregas.filter((e) => e.emprendedor_nombre.toLowerCase().includes(dbSearchTerm.toLowerCase()) || e.estado.toLowerCase().includes(dbSearchTerm.toLowerCase()));
    } else if (activeDbTable === 'billeteras') {
      return [
        { id: 1, email: 'repartidor@test.com', propietario: 'Carlos Gómez (Repartidor)', saldo: walletSaldo },
        { id: 2, email: 'admin@deliveryplus.com', propietario: 'DeliveryPlus Admin (Fee 20%)', saldo: adminSaldo }
      ].filter((b) => b.propietario.toLowerCase().includes(dbSearchTerm.toLowerCase()));
    } else if (activeDbTable === 'transacciones') {
      return transacciones.filter((t) => t.referencia.toLowerCase().includes(dbSearchTerm.toLowerCase()) || t.tipo.toLowerCase().includes(dbSearchTerm.toLowerCase()));
    }
    return [];
  }, [activeDbTable, usuarios, repartidor, turnos, entregas, walletSaldo, adminSaldo, transacciones, dbSearchTerm]);


  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FFFFFF] font-sans flex flex-col selection:bg-blue-brand/30 selection:text-white-brand relative overflow-hidden">
      
      {/* Background ambient decor lights - Premium Landing Page style */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-brand/5 rounded-full blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-blue-brand/5 rounded-full blur-[150px] pointer-events-none" />

      {/* --- TOP CONTROL BAR --- */}
      <header className="bg-gradient-to-r from-[#0E131F] to-[#0A0A0A] border-b border-blue-brand/20 px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4 shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.7)] backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3.5">
          {/* Unified dynamic logo: combination of lightning bolt ⚡ + pin 📍 + AI circle */}
          <BrandLogo variant="main" size="md" animated={true} />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 font-display">
              Delivery<span className="text-blue-brand">Plus</span>
              <span className="text-[10px] bg-blue-brand/10 text-blue-brand px-2.5 py-0.5 rounded-full font-bold font-mono border border-blue-brand/20">
                ECOSISTEMA B2B
              </span>
            </h1>
            <p className="text-xs text-gray-400">Sandbox Visual e Interactivo – Sincronización en Tiempo Real</p>
          </div>
        </div>

        {/* Workspace views segmented controller matching landing UI */}
        <div className="flex bg-[#141414] border border-gray-brand p-1.5 rounded-2xl shrink-0 shadow-inner gap-1">
          <button
            onClick={() => {
              setActiveWorkspaceTab('mockups');
              logEvent('Configuración: Redirigiendo a Galería de Mockups Nocturnos', 'info');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 select-none duration-250 cursor-pointer ${
              activeWorkspaceTab === 'mockups'
                ? 'bg-gradient-to-r from-blue-brand to-[#0051A8] text-white shadow-lg shadow-blue-brand/20 font-extrabold'
                : 'text-gray-400 hover:text-white hover:bg-[#1F1F1F]/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-405 text-yellow-400" />
            ✨ Maquetas Premium
          </button>
          <button
            onClick={() => {
              setActiveWorkspaceTab('consola');
              logEvent('Configuración: Redirigiendo a Consola de Desarrollo', 'info');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 select-none duration-250 cursor-pointer ${
              activeWorkspaceTab === 'consola'
                ? 'bg-gradient-to-r from-blue-brand to-[#0051A8] text-white shadow-lg shadow-blue-brand/20 font-extrabold'
                : 'text-gray-400 hover:text-white hover:bg-[#1F1F1F]/40'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-blue-brand" />
            Consola de Simulación
          </button>
          <button
            onClick={() => {
              setActiveWorkspaceTab('modulos');
              logEvent('Configuración: Abriendo Visor de Módulos del Ecosistema B2B', 'success');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 select-none duration-250 cursor-pointer ${
              activeWorkspaceTab === 'modulos'
                ? 'bg-gradient-to-r from-blue-brand to-[#0051A8] text-white shadow-lg shadow-blue-brand/20 font-extrabold'
                : 'text-gray-400 hover:text-white hover:bg-[#1F1F1F]/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-brand" />
            Estructura Código
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="bg-green-success/10 text-green-success px-3 py-1.5 rounded-lg border border-green-success/15 flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-success animate-ping"></span>
            Database Local: On
          </div>
          <div className="bg-blue-brand/10 text-white px-3 py-1.5 rounded-lg border border-blue-brand/15 flex items-center gap-1.5 font-mono text-[10px]">
            <Terminal className="w-3.5 h-3.5 text-blue-brand" />
            Port: N/A
          </div>
        </div>
      </header>

      {/* --- MULTI-SESSION PORTAL NAVIGATION BAR (Landing page style) --- */}
      <div className="bg-[#1F1F1F] border-b border-gray-brand px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 text-xs shadow-md shrink-0">
        <div className="flex items-center gap-2 text-gray-400">
          <Sparkles className="w-4 h-4 text-blue-brand animate-pulse shrink-0" />
          <span className="font-semibold text-white whitespace-nowrap font-display">Simulador Multi-Sesión B2B:</span>
          <span className="hidden sm:inline">Abre estos portales en pestañas independientes para simular el ecosistema logístico en tiempo real:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-semibold">
          {/* Master Consola */}
          <div className={`flex items-center bg-[#0A0A0A] border p-0.5 rounded-xl transition-all ${activePortalView === 'sandbox' ? 'border-blue-brand/30' : 'border-gray-brand'}`}>
            <button
              onClick={() => setActivePortalView('sandbox')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all text-[11px] font-bold cursor-pointer ${
                activePortalView === 'sandbox'
                  ? 'bg-blue-brand/10 text-blue-brand'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-blue-brand" />
              Consola Master (Todo)
            </button>
          </div>

          {/* Comercio */}
          <div className={`flex items-center bg-[#0A0A0A] border p-0.5 rounded-xl transition-all ${activePortalView === 'comercio' ? 'border-blue-brand/30' : 'border-gray-brand'}`}>
            <button
              onClick={() => setActivePortalView('comercio')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all text-[11px] font-bold cursor-pointer ${
                activePortalView === 'comercio'
                  ? 'bg-blue-brand/10 text-blue-brand'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-blue-brand" />
              🏢 Comercios
            </button>
            <a
              href="/?portal=comercio"
              target="_blank"
              title="Abrir Portal Comercios en nueva pestaña"
              className="p-1 text-gray-500 hover:text-blue-brand hover:bg-[#1F1F1F] rounded-lg transition-all"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Emprendedor */}
          <div className={`flex items-center bg-[#0A0A0A] border p-0.5 rounded-xl transition-all ${activePortalView === 'emprendedor' ? 'border-green-success/30' : 'border-gray-brand'}`}>
            <button
              onClick={() => setActivePortalView('emprendedor')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all text-[11px] font-bold cursor-pointer ${
                activePortalView === 'emprendedor'
                  ? 'bg-green-success/10 text-green-success'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-green-success" />
              📦 Emprendedores
            </button>
            <a
              href="/?portal=emprendedor"
              target="_blank"
              title="Abrir Portal Emprendedores en nueva pestaña"
              className="p-1 text-gray-500 hover:text-green-success hover:bg-[#1F1F1F] rounded-lg transition-all"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Repartidor */}
          <div className={`flex items-center bg-[#0A0A0A] border p-0.5 rounded-xl transition-all ${activePortalView === 'repartidor' ? 'border-blue-brand/30' : 'border-gray-brand'}`}>
            <button
              onClick={() => setActivePortalView('repartidor')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all text-[11px] font-bold cursor-pointer ${
                activePortalView === 'repartidor'
                  ? 'bg-blue-brand/10 text-blue-brand'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Bike className="w-3.5 h-3.5 text-blue-brand" />
              🚴 Repartidor (Carlos)
            </button>
            <a
              href="/?portal=repartidor"
              target="_blank"
              title="Abrir App de Carlos en nueva pestaña"
              className="p-1 text-gray-500 hover:text-blue-brand hover:bg-[#1F1F1F] rounded-lg transition-all"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Admin */}
          <div className={`flex items-center bg-[#0A0A0A] border p-0.5 rounded-xl transition-all ${activePortalView === 'admin' ? 'border-cyan-500/30' : 'border-gray-brand'}`}>
            <button
              onClick={() => setActivePortalView('admin')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all text-[11px] font-bold cursor-pointer ${
                activePortalView === 'admin'
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              👑 Admin & Split
            </button>
            <a
              href="/?portal=admin"
              target="_blank"
              title="Abrir Portal de Administrador en nueva pestaña"
              className="p-1 text-gray-500 hover:text-cyan-400 hover:bg-[#1F1F1F] rounded-lg transition-all"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>


      {/* --- STANDALONE EXCLUSIVE VIEWPORT ROUTING --- */}
      {activePortalView === 'dashboard' && <MainDashboard />}
      {activePortalView === 'comercio' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full relative z-10 space-y-6 text-left">
          <ArgentinaMap 
            gpsSimulating={gpsSimulating}
            gpsProgress={gpsProgress}
            userCoords={gpsCoords}
            markers={mapMarkers}
          />
          <div className="bg-gradient-to-r from-[#141B25] to-[#1A2534] rounded-2xl p-6 border border-orange-500/20 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Award className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-bold text-white tracking-tight uppercase">Portal de Comercios Contratados B2B</h2>
              </div>
              <p className="text-xs text-gray-400">Publica turnos de 4 horas fijos y haz seguimiento del reparto. El repartidor recibe un 80% neto de la tarifa.</p>
            </div>
            <div className="flex gap-2.5 font-mono text-xs">
              <div className="bg-black/30 border border-gray-800 rounded-xl px-4 py-2 text-center">
                <span className="text-[10px] text-gray-500 block uppercase">Establecimiento</span>
                <span className="text-white font-bold">{comercioNombre}</span>
              </div>
              <div className="bg-[#1C1310] border border-orange-500/20 rounded-xl px-4 py-2 text-center text-orange-400">
                <span className="text-[10px] text-gray-500 block uppercase">Clima IA</span>
                <span className="font-bold flex items-center justify-center gap-1 uppercase">
                  {weatherCondition} ({multiplier}x)
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Empleado del Mes */}
            <div className="lg:col-span-12 bg-gradient-to-r from-[#141B25] to-[#1A2534] border border-orange-500/20 p-5 rounded-2xl flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-orange-500/10 p-3 rounded-full">
                  <Award className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Empleado del Mes: Carlos Gómez</h3>
                  <p className="text-xs text-gray-400">Excelente desempeño en entregas nocturnas. +380 entregas este mes.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-orange-400 font-bold">Ranking #1</span>
                <div className="text-2xl font-black text-white">4.9/5</div>
              </div>
            </div>

            {/* Form to Publish shift block */}
            <div className="lg:col-span-4 bg-[#111720]/80 border border-gray-800 p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
                <Plus className="w-4 h-4 text-orange-500" />
                Contratar Turno Nuevo
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Nombre del Comercio</label>
                  <select
                    value={comercioNombre}
                    onChange={(e) => setComercioNombre(e.target.value)}
                    className="w-full bg-[#1A2530] border border-gray-800 text-white rounded-xl p-2.5 outline-none focus:border-orange-500"
                  >
                    <option value="Burger House">Burger House (Hamburguesas)</option>
                    <option value="La Trattoria">La Trattoria (Pastas)</option>
                    <option value="Sushi Bar">Sushi Bar (Premium)</option>
                    <option value="Verde Orgánico">Verde Orgánico (Ensaladas)</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Bloque Horario (4 Horas)</label>
                  <select
                    value={comercioHorario}
                    onChange={(e) => setComercioHorario(e.target.value)}
                    className="w-full bg-[#1A2530] border border-gray-800 text-white rounded-xl p-2.5 outline-none focus:border-orange-500"
                  >
                    <option value="12:00 - 16:00">Mediodía (12:00 - 16:00)</option>
                    <option value="16:00 - 20:00">Tarde (16:00 - 20:00)</option>
                    <option value="20:00 - 00:00">Noche (20:00 - 00:00)</option>
                    <option value="00:00 - 04:00">Madrugada (00:00 - 04:00)</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Tarifa Sugerida ($ ARS)</label>
                  <input
                    type="number"
                    value={comercioMonto}
                    onChange={(e) => setComercioMonto(e.target.value)}
                    className="w-full bg-[#1A2530] border border-gray-800 text-white rounded-xl p-2.5 outline-none focus:border-orange-500 font-mono font-bold"
                  />
                </div>

                {/* Rates Split Summary */}
                <div className="bg-black/30 p-3 rounded-xl border border-gray-900 space-y-1.5 font-mono text-[10.5px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monto del Comercio:</span>
                    <span className="text-white font-bold">${Number(comercioMonto).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-orange-400">
                    <span>Neto Repartidor (80%):</span>
                    <span className="font-bold">${Math.round(Number(comercioMonto) * 0.8).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-cyan-400">
                    <span>SaaS Fee Plataforma (20%):</span>
                    <span className="font-bold">${Math.round(Number(comercioMonto) * 0.2).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const rate = Number(comercioMonto) || 15000;
                    const nextId = turnos.length > 0 ? Math.max(...turnos.map(t => t.id)) + 1 : 1;
                    const newT: Turno = {
                      id: nextId,
                      comercio_nombre: comercioNombre,
                      direccion: comercioNombre === 'Burger House' ? 'Av. Córdoba 3900, Almagro' : 'Av. Santa Fe 2345, Palermo',
                      fecha: 'Hoy',
                      horario: comercioHorario,
                      monto_total: rate,
                      monto_repartidor: rate * 0.8,
                      monto_plataforma: rate * 0.2,
                      estado: 'disponible'
                    };
                    setTurnos(prev => [newT, ...prev]);
                    logEvent(`POST /api/turnos - 201 Created - New shift block by Comercios portal: ${comercioNombre}`, 'success');
                    triggerNotification('Nuevo Turno Disponible', `${comercioNombre} ofrece un bloque de 4 horas por $${newT.monto_repartidor}`);
                  }}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2.5 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/10 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Publicar Alerta de Turno
                </button>
              </div>
            </div>

            {/* List of custom turnos */}
            <div className="lg:col-span-8 bg-[#111720]/80 border border-gray-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  Turnos fijos en Base de Datos Real-Time
                </h3>
                <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded font-mono font-bold">
                  {turnos.length} Turnos publicados
                </span>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {turnos.map((t) => (
                  <div key={t.id} className="bg-black/20 hover:bg-black/45 border border-gray-900 hover:border-gray-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-extrabold text-sm">{t.comercio_nombre}</span>
                        <span className="text-[10px] text-gray-500 font-mono font-bold">ID: {t.id}</span>
                      </div>
                      <p className="text-gray-400 text-[11px]">{t.direccion}</p>
                      <div className="flex items-center gap-3 text-[10.5px] font-mono text-gray-500 pt-1">
                        <span>Horario: <strong className="text-gray-300">{t.horario}</strong></span>
                        <span>•</span>
                        <span>Fecha: <strong className="text-gray-300">{t.fecha}</strong></span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-gray-900 pt-2 sm:pt-0">
                      <div className="text-right font-mono">
                        <span className="text-[10px] text-gray-500 block">Tarifa total</span>
                        <strong className="text-emerald-400 font-bold">${t.monto_total.toLocaleString()} ARS</strong>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wide border ${
                        t.estado === 'completado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        t.estado === 'en_progreso' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      }`}>
                        {t.estado === 'disponible' ? 'Pendiente Chofer' : t.estado === 'en_progreso' ? 'En reparto' : 'Cobrado fidedigno'}
                      </span>
                    </div>
                  </div>
                ))}

                {turnos.length === 0 && (
                  <p className="text-center text-gray-500 py-6">No hay turnos fijos publicados en la base de datos.</p>
                )}
              </div>
            </div>
          </div>

          {/* ASISTENTE INTELIGENTE VOZ/TEXTO B2B DE DELIVERYPLUS */}
          <div className="bg-[#121A26] border border-blue-brand/20 p-5 rounded-2xl space-y-4">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2 font-display">
              <Sparkles className="w-4 h-4 text-blue-brand animate-pulse" />
              Asistente Conversacional B2B de Turnos Fijos (IA Voice & Text)
            </h3>
            <p className="text-xs text-gray-400">Pide y contrata turnos rápidamente por audio hablando natural o escribiendo un mensaje libre.</p>
            <AIChatAssistant 
              turnos={turnos}
              setTurnos={setTurnos}
              entregas={entregas}
              setEntregas={setEntregas}
              logEvent={logEvent}
              triggerNotification={triggerNotification}
              weatherCondition={weatherCondition}
              multiplier={multiplier}
              role="comercio"
            />
          </div>
        </div>
      )}

      {activePortalView === 'descarga' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full relative z-10 space-y-6 text-left flex items-center justify-center">
          <div className="bg-gradient-to-r from-[#141B25] to-[#1A2534] rounded-2xl p-12 border border-purple-500/20 shadow-xl flex flex-col items-center gap-6 text-center max-w-lg">
            <h2 className="text-3xl font-bold text-white">Descarga nuestra App</h2>
            <p className="text-gray-400 text-lg">Escanea el código QR para obtener la aplicación oficial y gestionar tus entregas logísticas en tiempo real.</p>
            <div className="bg-white p-4 rounded-xl">
               <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://landing-deliveryplus-1nvy.vercel.app/" alt="QR de descarga" width="250" height="250" />
            </div>
            <a href="https://landing-deliveryplus-1nvy.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-purple-400 font-bold hover:text-purple-300 text-lg underline">Ir a la landing page oficial</a>
          </div>
        </div>
      )}

      {activePortalView === 'emprendedor' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full relative z-10 space-y-6 text-left">
          <ArgentinaMap 
            gpsSimulating={gpsSimulating}
            gpsProgress={gpsProgress}
            userCoords={gpsCoords}
            markers={mapMarkers}
          />
          <div className="bg-gradient-to-r from-[#141B25] to-[#1A2534] rounded-2xl p-6 border border-emerald-500/20 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white tracking-tight uppercase">Portal de Emprendedores Locales On-Demand</h2>
              </div>
              <p className="text-xs text-gray-400">Despacha encomiendas rápidas sueltas. El sistema estima la tarifa según kilometraje, bulto, y multiplicador dinámico por clima de IA.</p>
            </div>
            <div className="flex gap-2.5 font-mono text-xs">
              <div className="bg-black/30 border border-gray-800 rounded-xl px-4 py-2 text-center">
                <span className="text-[10px] text-gray-500 block uppercase">Establecimiento</span>
                <span className="text-white font-bold">{emprendedorNombre}</span>
              </div>
              <div className="bg-[#101918] border border-emerald-500/20 rounded-xl px-4 py-2 text-center text-emerald-400">
                <span className="text-[10px] text-gray-500 block uppercase">Multiplicador Climático</span>
                <span className="font-bold flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {multiplier}x Activo
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form to Dispatch shipment */}
            <div className="lg:col-span-5 bg-[#111720]/80 border border-gray-800 p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
                <Send className="w-4 h-4 text-emerald-400 animate-pulse" />
                Despachar Nueva Encomienda Expres
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Negocio Despachante</label>
                  <select
                    value={emprendedorNombre}
                    onChange={(e) => setEmprendedorNombre(e.target.value)}
                    className="w-full bg-[#1A2530] border border-gray-800 text-white rounded-xl p-2.5 outline-none focus:border-emerald-500"
                  >
                    <option value="Pastas de la Nona">Pastas de la Nona (Familiar)</option>
                    <option value="Huerta Orgánica">Huerta Orgánica (Fresco)</option>
                    <option value="Panadería San Telmo">Panadería San Telmo (Despacho)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-gray-400 block mb-1">Dirección de Origen</label>
                    <input
                      type="text"
                      value={entregaOrigen}
                      onChange={(e) => setEntregaOrigen(e.target.value)}
                      className="w-full bg-[#1A2530] border border-gray-800 text-white rounded-xl p-2.5 outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Dirección de Destino</label>
                    <input
                      type="text"
                      value={entregaDestino}
                      onChange={(e) => setEntregaDestino(e.target.value)}
                      className="w-full bg-[#1A2530] border border-gray-800 text-white rounded-xl p-2.5 outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-gray-400 block mb-1">Tamaño del Paquete</label>
                    <select
                      value={entregaTamano}
                      onChange={(e) => setEntregaTamano(e.target.value as any)}
                      className="w-full bg-[#1A2530] border border-gray-800 text-white rounded-xl p-2.5 outline-none focus:border-emerald-500"
                    >
                      <option value="pequeño">Pequeño (Bolsa)</option>
                      <option value="mediano">Mediano (Caja)</option>
                      <option value="grande">Grande (Furgón)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Precio Base Estimado ($)</label>
                    <input
                      type="number"
                      value={entregaMontoBase}
                      onChange={(e) => setEntregaMontoBase(e.target.value)}
                      className="w-full bg-[#1A2530] border border-gray-800 text-white rounded-xl p-2.5 outline-none focus:border-emerald-500 font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Split calculation detail */}
                <div className="bg-black/30 p-3.5 rounded-xl border border-gray-900 space-y-1.5 font-mono text-[10.5px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monto Base:</span>
                    <span>${Number(entregaMontoBase).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Multiplicador Climático:</span>
                    <span className="text-yellow-550">x{multiplier} ({weatherCondition})</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-900 pt-1.5 font-bold text-white">
                    <span>Monto Final Estimado:</span>
                    <span>${Math.round(Number(entregaMontoBase) * multiplier).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-orange-400 text-[10px]">
                    <span>Pago Neto Chofer (80%):</span>
                    <span>${Math.round(Number(entregaMontoBase) * multiplier * 0.8).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-cyan-400 text-[10px]">
                    <span>Plataforma Fee (20%):</span>
                    <span>${Math.round(Number(entregaMontoBase) * multiplier * 0.2).toLocaleString()}</span>
                  </div>
                </div>

                <AIChatAssistant 
                  turnos={turnos}
                  setTurnos={setTurnos}
                  entregas={entregas}
                  setEntregas={setEntregas}
                  logEvent={logEvent}
                  triggerNotification={triggerNotification}
                  weatherCondition={weatherCondition}
                  multiplier={multiplier}
                  role="emprendedor"
                />

                <button
                  onClick={() => {
                    const base = Number(entregaMontoBase) || 3500;
                    const finalMonto = Math.round(base * multiplier);
                    const nextId = entregas.length > 0 ? Math.max(...entregas.map(e => e.id)) + 1 : 1;
                    const newE: EntregaUnica = {
                      id: nextId,
                      emprendedor_nombre: emprendedorNombre,
                      direccion_origen: entregaOrigen,
                      direccion_destino: entregaDestino,
                      tamano: entregaTamano,
                      monto_total: finalMonto,
                      monto_repartidor: Math.round(finalMonto * 0.8),
                      monto_plataforma: Math.round(finalMonto * 0.2),
                      estado: 'disponible'
                    };
                    setEntregas(prev => [newE, ...prev]);
                    logEvent(`POST /api/entregas - 201 Dispatched - Despachado individual express por Emprendedores: ${emprendedorNombre}`, 'success');
                    triggerNotification('Nueva Entrega Cercana', `${emprendedorNombre} despachó encomienda por $${newE.monto_repartidor}`);
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-2.5 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Despachar Encomienda Expres
                </button>
              </div>
            </div>

            {/* List and live Chat with Carlos wrapper */}
            <div className="lg:col-span-7 space-y-6">
              {/* Deliveries tracked */}
              <div className="bg-[#111720]/80 border border-gray-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                    <Bike className="w-4 h-4 text-emerald-400" />
                    Tus Despachos On-Demand
                  </h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                    {entregas.length} Encomiendas totales
                  </span>
                </div>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {entregas.map((e) => (
                    <div key={e.id} className="bg-black/20 border border-gray-900 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{e.emprendedor_nombre}</span>
                          <span className="text-[9px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-400 font-mono font-bold">ID: {e.id}</span>
                        </div>
                        <p className="text-gray-400 text-[10.5px] mt-0.5 truncate max-w-[240px]">A: {e.direccion_destino}</p>
                        <span className="text-[10px] text-gray-500 mt-1 block">Bulto: <strong className="text-gray-305 capitalize">{e.tamano}</strong></span>
                      </div>
                      
                      <div className="text-right space-y-1.5">
                        <span className="text-emerald-400 font-bold font-mono block">${e.monto_total}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wide border block text-center ${
                          e.estado === 'entregado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          e.estado === 'en_camino' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>
                          {e.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat channel module */}
              <div className="bg-[#111720]/80 border border-gray-800 p-5 rounded-2xl flex flex-col h-[280px]">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Chat Coordinación Sincronizado</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] text-gray-400 font-mono">Conectado Carlos Gómez</span>
                  </div>
                </div>

                {/* Scoped Chat Box */}
                <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-[160px] text-[11px] pr-1">
                  {chatMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.sender === 'emprendedor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`p-2.5 rounded-2xl max-w-[85%] ${
                        m.sender === 'emprendedor'
                          ? 'bg-emerald-500/15 border border-emerald-500/20 text-white rounded-tr-none'
                          : 'bg-[#151D25] border border-gray-800 text-[#DFE4E9] rounded-tl-none'
                      }`}>
                        {m.tipo === 'texto' ? (
                          <p>{m.contenido}</p>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                              <Volume2 className="w-3.5 h-3.5" />
                            </span>
                            <span>Mensaje de Voz ({m.audio_segundos}s)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 border-t border-gray-800 pt-2 shrink-0">
                  <input
                    type="text"
                    value={newMsgText}
                    onChange={(e) => setNewMsgText(e.target.value)}
                    placeholder="Escribe un mensaje de chat para enviarlo a Carlos..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newMsgText.trim()) {
                        const newId = chatMessages.length + 1;
                        const newMsg: Mensaje = { id: newId, sender: 'emprendedor', tipo: 'texto', contenido: newMsgText };
                        setChatMessages((prev) => [...prev, newMsg]);
                        setNewMsgText('');
                        logEvent('Chat: Emprendedor envía mensaje de chat al repartidor.', 'info');
                      }
                    }}
                    className="flex-1 bg-[#1A2530] border border-gray-800 text-white rounded-xl px-3 py-2 text-[11px] outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => {
                      if (newMsgText.trim()) {
                        const newId = chatMessages.length + 1;
                        const newMsg: Mensaje = { id: newId, sender: 'emprendedor', tipo: 'texto', contenido: newMsgText };
                        setChatMessages((prev) => [...prev, newMsg]);
                        setNewMsgText('');
                        logEvent('Chat: Emprendedor envía mensaje de chat al repartidor.', 'info');
                      }
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ASISTENTE INTELIGENTE VOZ/TEXTO ON-DEMAND DE DELIVERYPLUS */}
          <div className="bg-[#121A26] border border-blue-brand/20 p-5 rounded-2xl space-y-4">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2 font-display">
              <Sparkles className="w-4 h-4 text-blue-brand animate-pulse" />
              Asistente Inteligente de Envíos On-Demand (IA Voice & Text)
            </h3>
            <p className="text-xs text-gray-400">Despacha tus envías rápidos al instante por audio hablando natural o con mensajes de texto.</p>
            <AIChatAssistant 
              turnos={turnos}
              setTurnos={setTurnos}
              entregas={entregas}
              setEntregas={setEntregas}
              logEvent={logEvent}
              triggerNotification={triggerNotification}
              weatherCondition={weatherCondition}
              multiplier={multiplier}
              role="emprendedor"
            />
          </div>
        </div>
      )}

      {activePortalView === 'repartidor' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full relative z-10 space-y-6 text-left">
          <ArgentinaMap 
            gpsSimulating={gpsSimulating}
            gpsProgress={gpsProgress}
            userCoords={gpsCoords}
            markers={mapMarkers}
          />
          <div className="bg-gradient-to-r from-[#141B25] to-[#1A2534] rounded-2xl p-6 border border-cyan-500/20 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Bike className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white tracking-tight uppercase">Portal de Repartidor Independiente</h2>
              </div>
              <p className="text-xs text-gray-400">Acepta turnos o encomiendas y gestiona tu balance financiero de inmediato (Split 80/20).</p>
            </div>
            <div className="flex gap-2.5 font-mono text-xs">
              <div className="bg-black/30 border border-gray-800 rounded-xl px-4 py-2 text-center">
                <span className="text-[10px] text-gray-500 block uppercase">Repartidor</span>
                <span className="text-white font-bold">Carlos Gómez</span>
              </div>
              <div className="bg-[#101918] border border-cyan-500/20 rounded-xl px-4 py-2 text-center text-cyan-400">
                <span className="text-[10px] text-gray-500 block uppercase">Billetera Activa (80%)</span>
                <span className="font-bold flex items-center justify-center gap-1">
                  <Wallet className="w-3.5 h-3.5" />
                  {walletSaldo.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLUMN 1: JOBS AVAILABLE */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              <div className="bg-[#111720]/80 border border-gray-800 p-5 rounded-2xl space-y-4">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Turnos B2B Disponibles
                </h3>
                <div className="space-y-3">
                  {turnos.filter(t => t.estado === 'disponible').length === 0 ? (
                    <p className="text-gray-500 text-xs italic">No hay bloques fijos B2B disponibles por ahora.</p>
                  ) : (
                    turnos.filter(t => t.estado === 'disponible').map(t => (
                      <div key={t.id} className="bg-black/30 p-3 rounded-xl border border-gray-800 flex justify-between items-center gap-3">
                        <div className="flex flex-col">
                           <span className="text-xs font-bold text-white">{t.comercio_nombre}</span>
                           <span className="text-[10px] text-gray-400 capitalize">{t.horario}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-orange-400 font-bold text-xs">${t.monto_repartidor}</span>
                           <button onClick={() => acceptShift(t.id)} className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-[10px] px-3 py-1.5 rounded-lg active:scale-95 transition-all">
                             ACEPTAR
                           </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="bg-[#111720]/80 border border-gray-800 p-5 rounded-2xl space-y-4">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
                  <Package className="w-4 h-4 text-cyan-400" />
                  Entregas Express Libres
                </h3>
                <div className="space-y-3">
                  {entregas.filter(e => e.estado === 'buscando_repartidor').length === 0 ? (
                    <p className="text-gray-500 text-xs italic">No hay entregas pendientes en la zona.</p>
                  ) : (
                    entregas.filter(e => e.estado === 'buscando_repartidor').map(e => (
                      <div key={e.id} className="bg-black/30 p-3 rounded-xl border border-gray-800 flex justify-between items-center gap-3">
                        <div className="flex flex-col">
                           <span className="text-xs font-bold text-white max-w-[120px] truncate">{e.direccion_destino}</span>
                           <span className="text-[10px] text-gray-400 capitalize">{e.tamano}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-orange-400 font-bold text-xs">${e.monto_repartidor}</span>
                           <button onClick={() => acceptDelivery(e.id)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg active:scale-95 transition-all">
                             ACEPTAR
                           </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN 2: ACTIVE JOBS & WALLET */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              <div className="bg-[#111720]/80 border border-emerald-500/20 p-5 rounded-2xl space-y-4 shadow-lg shadow-emerald-500/5">
                <h3 className="font-bold text-emerald-400 text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
                  <Navigation className="w-4 h-4" />
                  Tareas en Curso
                </h3>
                <div className="space-y-3">
                  {/* Active Shifts */}
                  {turnos.filter(t => t.estado === 'confirmado').map(t => (
                    <div key={t.id} className="bg-emerald-900/10 p-3 rounded-xl border border-emerald-500/20 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                           <span className="text-xs font-bold text-white">Bloque en {t.comercio_nombre}</span>
                           <span className="text-[10px] text-emerald-400 capitalize">En proceso ({t.horario})</span>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Asignado</span>
                      </div>
                      <button onClick={() => finishShift(t.id)} className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs w-full py-2 rounded-lg active:scale-95 transition-all">
                        FINALIZAR TURNO
                      </button>
                    </div>
                  ))}
                  
                  {/* Active Deliveries */}
                  {entregas.filter(e => ['asignado', 'recolectado', 'en_camino'].includes(e.estado)).map(e => (
                    <div key={e.id} className="bg-orange-900/10 p-3 rounded-xl border border-orange-500/20 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                           <span className="text-xs font-bold text-white">Entrega #{e.id}</span>
                           <span className="text-[10px] text-orange-400 capitalize">{e.direccion_destino}</span>
                        </div>
                        <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{e.estado.replace('_', ' ')}</span>
                      </div>
                      <button onClick={() => finishDelivery(e.id)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs w-full py-2 rounded-lg active:scale-95 transition-all">
                        FINALIZAR Y COBRAR
                      </button>
                    </div>
                  ))}

                  {turnos.filter(t => t.estado === 'confirmado').length === 0 && entregas.filter(e => ['asignado', 'recolectado', 'en_camino'].includes(e.estado)).length === 0 && (
                    <p className="text-gray-500 text-xs italic text-center py-2">No tienes tareas en curso en este momento.</p>
                  )}
                </div>
              </div>

              {/* Billetera Detail */}
              <div className="bg-[#111720]/80 border border-gray-800 p-5 rounded-2xl space-y-4">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
                  <Wallet className="w-4 h-4 text-cyan-400" />
                  Billetera Express
                </h3>
                <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-xl border border-gray-800 mb-2">
                  <span className="text-xs text-gray-500 font-mono mb-1 uppercase">Saldo Disponible (80%)</span>
                  <span className="text-3xl font-black text-white font-display text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    {walletSaldo.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}
                  </span>
                </div>
                
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-4">Últimas Transacciones</h4>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                  {transacciones.filter(t => t.tipo.includes('ingreso')).length === 0 ? (
                    <p className="text-gray-500 text-xs italic">Aún no hay ingresos de tareas finalizadas.</p>
                  ) : (
                    transacciones.filter(t => t.tipo.includes('ingreso')).slice(0, 5).map(tx => (
                      <div key={tx.id} className="flex justify-between items-center bg-black/30 p-2.5 rounded-lg border border-gray-800/50">
                        <div className="flex items-center gap-2">
                           <div className="bg-emerald-500/20 p-1.5 rounded-md text-emerald-400">
                             {tx.tipo === 'ingreso_turno' ? <Calendar className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                           </div>
                           <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-gray-300 uppercase">{tx.tipo.replace('_', ' ')}</span>
                             <span className="text-[9px] text-gray-500">{tx.fecha.split(' ')[1]}</span>
                           </div>
                        </div>
                        <span className="text-emerald-400 font-bold text-xs">+{tx.monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN 3: ASISTENTE INTELIGENTE VOZ/TEXTO ON-DEMAND DE DELIVERYPLUS */}
            <div className="lg:col-span-4 bg-[#121A26] border border-blue-brand/20 p-5 rounded-2xl space-y-4">
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2 font-display">
                <Sparkles className="w-4 h-4 text-blue-brand animate-pulse" />
                Asistente Trabajo
              </h3>
              <p className="text-[11px] leading-tight text-gray-400">Recibe tareas, coordina rutas y conversa en modo manos libres con el sistema.</p>
              <AIChatAssistant 
                turnos={turnos}
                setTurnos={setTurnos}
                entregas={entregas}
                setEntregas={setEntregas}
                logEvent={logEvent}
                triggerNotification={triggerNotification}
                weatherCondition={weatherCondition}
                multiplier={multiplier}
                role="repartidor"
              />
            </div>
          </div>
        </div>
      )}

      {activePortalView === 'admin' && (

        <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-7xl mx-auto w-full relative z-10 space-y-5 text-left">
          {/* Header row – Advanced National Portal */}
          <div className="bg-gradient-to-r from-[#01020d] via-[#12132C] to-[#01020d] rounded-2xl p-6 border border-purple-500/25 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Database className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white tracking-tight uppercase">Panel de Administración Global & Split Financiero</h2>
              </div>
              <p className="text-xs text-gray-400">Auditoría en tiempo real de transacciones, saldos, base de datos y logs de servidores Cloud Run.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2.5 font-mono text-xs w-full md:w-auto shrink-0">
              <div className="bg-[#05060F] border border-gray-800/80 rounded-xl px-4 py-2.5 text-center flex-1 sm:flex-initial">
                <span className="text-[9.5px] text-gray-500 block uppercase font-bold tracking-wider mb-0.5">Saldo Mercado Pago</span>
                <span className="text-purple-400 font-black text-sm">
                  {adminMpSaldo.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}
                </span>
              </div>
              <div className="bg-[#05060F] border border-gray-800/80 rounded-xl px-4 py-2.5 text-center flex-1 sm:flex-initial">
                <span className="text-[9.5px] text-gray-500 block uppercase font-bold tracking-wider mb-0.5">SaaS Comisiones (20%)</span>
                <span className="text-cyan-400 font-black text-sm">
                  {adminSaldo.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time National Statistics Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Pedidos Diarios */}
            <div className="bg-[#030409]/95 border border-purple-500/10 p-4.5 rounded-2xl relative overflow-hidden group hover:border-purple-500/25 transition-all shadow-md">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">Pedidos Diarios</span>
                <span className="text-[9px] bg-purple-950/40 border border-purple-900 text-purple-300 font-mono font-bold px-2 py-0.5 rounded-full">+18.4%</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white tracking-tight font-sans">142</span>
                <span className="text-[10px] text-gray-500 font-semibold uppercase">en tránsito</span>
              </div>
              <div className="w-full bg-gray-900 h-1 mt-3 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full" style={{ width: '74%' }} />
              </div>
            </div>

            {/* Card 2: Comercios Activos */}
            <div className="bg-[#030409]/95 border border-cyan-500/10 p-4.5 rounded-2xl relative overflow-hidden group hover:border-cyan-500/25 transition-all shadow-md">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-600/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">Comercios Activos</span>
                <span className="text-[9px] bg-cyan-950/40 border border-cyan-900 text-cyan-300 font-mono font-bold px-2 py-0.5 rounded-full">Estable</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white tracking-tight font-sans">48</span>
                <span className="text-[10px] text-gray-500 font-semibold uppercase">locales B2B</span>
              </div>
              <div className="w-full bg-gray-900 h-1 mt-3 rounded-full overflow-hidden">
                <div className="bg-[#00f0ff] h-full rounded-full" style={{ width: '82%' }} />
              </div>
            </div>

            {/* Card 3: Emprendedores Activos */}
            <div className="bg-[#030409]/95 border border-purple-500/10 p-4.5 rounded-2xl relative overflow-hidden group hover:border-purple-500/25 transition-all shadow-md">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">Emprendedores</span>
                <span className="text-[9px] bg-purple-950/40 border border-purple-900 text-purple-300 font-mono font-bold px-2 py-0.5 rounded-full">+12.5%</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white tracking-tight font-sans">89</span>
                <span className="text-[10px] text-gray-500 font-semibold uppercase">marcas activas</span>
              </div>
              <div className="w-full bg-gray-900 h-1 mt-3 rounded-full overflow-hidden">
                <div className="bg-[#a200ff] h-full rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            {/* Card 4: Repartidores Activos */}
            <div className="bg-[#030409]/95 border border-cyan-500/10 p-4.5 rounded-2xl relative overflow-hidden group hover:border-cyan-500/25 transition-all shadow-md">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-600/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">Repartidores Activos</span>
                <span className="text-[9px] bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-full">● En línea</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white tracking-tight font-sans">36</span>
                <span className="text-[10px] text-gray-500 font-semibold uppercase">choferes on duty</span>
              </div>
              <div className="w-full bg-gray-900 h-1 mt-3 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: '88%' }} />
              </div>
            </div>
          </div>

          {/* Master Grid: Columns map, wallet, charts, AI recommends */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: INTERACTIVE MAP & PERFORMANCE CHARTS */}
            <div className="lg:col-span-7 space-y-5">
              {/* Interactive National Map Card */}
              <div className="bg-[#05060F]/90 border border-purple-500/15 p-5 rounded-2xl relative overflow-hidden shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-800/80 pb-3 mb-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <Map className="w-5 h-5 text-purple-400 animate-pulse" />
                    <span className="text-sm font-extrabold text-white uppercase tracking-wider font-sans ml-1">Mapa Logístico Nacional de Argentina</span>
                  </div>
                  <span className="text-[9.5px] bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff] font-mono px-2.5 py-0.5 rounded-full font-bold">
                    GPS TRACKING ACTIVO
                  </span>
                </div>

                <p className="text-[11.5px] text-gray-450 text-gray-400 leading-relaxed mb-4">
                  Haz clic en las ciudades activas del mapa para monitorizar en tiempo real el tráfico, clima predictivo de IA, repartidores disponibles y tarifas consolidadas de cada sector de operaciones en Argentina.
                </p>

                {/* Simulated National Map Container */}
                <div className="bg-[#04050a]/80 border border-gray-850 rounded-2xl p-4 flex flex-col items-center justify-center relative shadow-inner overflow-hidden min-h-[300px]">
                  <ArgentinaMap 
                    gpsSimulating={false}
                    gpsProgress={0}
                    userCoords={gpsCoords}
                    markers={mapMarkers}
                  />
                </div>
              </div>

              {/* Multi-mode charts card */}
              <AdminChartsCard />

            </div>

            {/* RIGHT COLUMN: PERSONAL MERCADO PAGO WALLET & IA ADVICE */}
            <div className="lg:col-span-5 space-y-5">
              <MPWalletCard 
                adminMpSaldo={adminMpSaldo} 
                setAdminMpSaldo={setAdminMpSaldo}
                mpHistorial={mpHistorial}
                setMpHistorial={setMpHistorial}
                triggerNotification={triggerNotification}
              />
              <IARecommendsCard 
                temperature={temperature} 
                weatherCondition={weatherCondition} 
                multiplier={multiplier} 
                setMultiplier={setMultiplier}
                triggerNotification={triggerNotification}
              />
            </div>

          </div>

          {/* Consistent brand visual watermark */}
          <div className="flex justify-end pt-2">
            <div className="flex items-center gap-2 bg-[#030712]/95 backdrop-blur-md px-4 py-2 rounded-full border border-purple-500/40 text-white select-none pointer-events-auto shadow-[0_4px_20px_rgba(162,0,255,0.3)] transition-all hover:scale-105">
              <div className="flex flex-col text-right leading-none">
                <span className="text-[6.5px] text-gray-400 uppercase tracking-widest font-black block mb-0.5">Peluquería Canina</span>
                <span className="text-[9.5px] font-black text-white tracking-tight font-sans block">
                  Gustavo Bettiol
                </span>
              </div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-600 to-purple-600 flex items-center justify-center p-0.5 border border-cyan-400/40">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5c-1.5 0-3 1.2-3 3v2c0 .8-.5 1.5-1.2 1.8C7 12 6.5 12.5 6.5 13.5c0 1.5 2 2.5 5.5 2.5s5.5-1 5.5-2.5c0-1-.5-1.5-1.3-1.7-.7-.3-1.2-1-1.2-1.8V8c0-1.8-1.5-3-3-3z"/>
                  <circle cx="12" cy="11.5" r="1" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Hiding legacy viewer wrapper */}
          <div className="hidden pointer-events-none select-none opacity-0 max-h-0 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
          {/* Gestión de Base de Datos en la Nube (Firebase) */}
          <div className="lg:col-span-12 bg-[#111720]/80 border border-gray-800 p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
              <Database className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">Gestión de Base de Datos en la Nube (Firebase)</span>
            </div>
            <p className="text-xs text-gray-400">Ahora utilizando Firebase para persistencia real y escalabilidad.</p>
          </div>
                  <input
                    type="text"
                    value={dbSearchTerm}
                    onChange={(e) => setDbSearchTerm(e.target.value)}
                    placeholder="Buscar registros..."
                    className="bg-[#1A2530] border border-gray-800 text-white rounded-xl pl-9 pr-4 py-1.5 text-xs outline-none focus:border-cyan-500 w-full sm:w-48"
                  />
                </div>
              </div>

              {/* Table SELECT selector */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-[11px] font-mono">
                <button
                  onClick={() => setActiveDbTable('repartidores')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                    activeDbTable === 'repartidores' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-bold' : 'bg-[#1A2530] border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  repartidores ({[repartidor].length})
                </button>
                <button
                  onClick={() => setActiveDbTable('turnos')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                    activeDbTable === 'turnos' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-bold' : 'bg-[#1A2530] border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  turnos ({turnos.length})
                </button>
                <button
                  onClick={() => setActiveDbTable('entregas_unicas')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                    activeDbTable === 'entregas_unicas' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-bold' : 'bg-[#1A2530] border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  entregas_unicas ({entregas.length})
                </button>
                <button
                  onClick={() => setActiveDbTable('transacciones')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                    activeDbTable === 'transacciones' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-bold' : 'bg-[#1A2530] border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  transacciones ({transacciones.length})
                </button>
                <button
                  onClick={() => setActiveDbTable('billeteras')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                    activeDbTable === 'billeteras' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-bold' : 'bg-[#1A2530] border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  billeteras (2)
                </button>
                <button
                  onClick={() => setActiveDbTable('usuarios')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                    activeDbTable === 'usuarios' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-bold' : 'bg-[#1A2530] border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  usuarios ({usuarios.length})
                </button>
              </div>

              {/* Simulated SQL Table Render */}
              <div className="bg-black/30 rounded-2xl border border-gray-900 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] text-left font-mono border-collapse">
                    <thead>
                      <tr className="bg-gray-900 border-b border-gray-850 text-gray-500">
                        {activeDbTable === 'usuarios' && (
                          <>
                            <th className="p-3">id</th>
                            <th className="p-3">email</th>
                            <th className="p-3">telefono</th>
                            <th className="p-3">rol</th>
                            <th className="p-3">activo</th>
                          </>
                        )}
                        {activeDbTable === 'repartidores' && (
                          <>
                            <th className="p-3">id</th>
                            <th className="p-3">nombre_completo</th>
                            <th className="p-3">vehiculo</th>
                            <th className="p-3">patente</th>
                            <th className="p-3">calif</th>
                            <th className="p-3">disponible</th>
                          </>
                        )}
                        {activeDbTable === 'turnos' && (
                          <>
                            <th className="p-3">id</th>
                            <th className="p-3">comercio</th>
                            <th className="p-3">horario</th>
                            <th className="p-3">total</th>
                            <th className="p-3">chofer_80</th>
                            <th className="p-3">estado</th>
                          </>
                        )}
                        {activeDbTable === 'entregas_unicas' && (
                          <>
                            <th className="p-3">id</th>
                            <th className="p-3">emprendedor</th>
                            <th className="p-3">destino</th>
                            <th className="p-3">bulto</th>
                            <th className="p-3">total</th>
                            <th className="p-3">estado</th>
                          </>
                        )}
                        {activeDbTable === 'transacciones' && (
                          <>
                            <th className="p-3">id</th>
                            <th className="p-3">tipo</th>
                            <th className="p-3">monto</th>
                            <th className="p-3">referencia</th>
                            <th className="p-3">fecha</th>
                          </>
                        )}
                        {activeDbTable === 'billeteras' && (
                          <>
                            <th className="p-3">id</th>
                            <th className="p-3">propietario</th>
                            <th className="p-3">saldo_ARS</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDbRows.map((row: any) => (
                        <tr key={row.id} className="border-b border-gray-950 hover:bg-black/10 text-gray-300">
                          {activeDbTable === 'usuarios' && (
                            <>
                              <td className="p-3 text-cyan-400 font-bold">{row.id}</td>
                              <td className="p-3 text-white">{row.email}</td>
                              <td className="p-3">{row.telefono}</td>
                              <td className="p-3">{row.rol}</td>
                              <td className="p-3">{row.activo ? 'YES' : 'NO'}</td>
                            </>
                          )}
                          {activeDbTable === 'repartidores' && (
                            <>
                              <td className="p-3 text-cyan-400 font-bold">{row.id}</td>
                              <td className="p-3 text-white font-bold">{row.nombre} {row.apellido}</td>
                              <td className="p-3 uppercase">{row.tipo_vehiculo}</td>
                              <td className="p-3 text-gray-400">{row.patente}</td>
                              <td className="p-3 text-yellow-400">★ {row.calificacion}</td>
                              <td className="p-3 text-emerald-400">{row.disponible ? 'YES' : 'NO'}</td>
                            </>
                          )}
                          {activeDbTable === 'turnos' && (
                            <>
                              <td className="p-3 text-cyan-400 font-bold">{row.id}</td>
                              <td className="p-3 text-white font-bold">{row.comercio_nombre}</td>
                              <td className="p-3">{row.horario}</td>
                              <td className="p-3 text-emerald-400">${row.monto_total}</td>
                              <td className="p-3 text-orange-400">${row.monto_repartidor}</td>
                              <td className="p-3">
                                <span className="text-[10px] uppercase font-bold">{row.estado}</span>
                              </td>
                            </>
                          )}
                          {activeDbTable === 'entregas_unicas' && (
                            <>
                              <td className="p-3 text-cyan-400 font-bold">{row.id}</td>
                              <td className="p-3 text-white font-bold">{row.emprendedor_nombre}</td>
                              <td className="p-3 truncate max-w-[120px]" title={row.direccion_destino}>{row.direccion_destino}</td>
                              <td className="p-3 capitalize">{row.tamano}</td>
                              <td className="p-3 text-emerald-400">${row.monto_total}</td>
                              <td className="p-3">
                                <span className="text-[10px] uppercase font-bold text-gray-400">{row.estado}</span>
                              </td>
                            </>
                          )}
                          {activeDbTable === 'transacciones' && (
                            <>
                              <td className="p-3 text-cyan-400 font-bold">{row.id}</td>
                              <td className="p-3 text-white uppercase text-[10px]">{row.tipo}</td>
                              <td className="p-3 text-orange-405 text-orange-400 font-bold">${row.monto}</td>
                              <td className="p-3 text-gray-400">{row.referencia}</td>
                              <td className="p-3 text-gray-500">{row.fecha}</td>
                            </>
                          )}
                          {activeDbTable === 'billeteras' && (
                            <>
                              <td className="p-3 text-cyan-400 font-bold">{row.id}</td>
                              <td className="p-3 text-white">{row.propietario}</td>
                              <td className="p-3 text-emerald-400 font-bold">${row.saldo.toLocaleString()} ARS</td>
                            </>
                          )}
                        </tr>
                      ))}

                      {filteredDbRows.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500">
                            No se encontraron registros en el SELECT de esta tabla.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            {/* Right: API Logs scroll console & financial summary (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Financial express split card */}
              <div className="bg-[#111720]/80 border border-gray-800 p-5 rounded-2xl space-y-3">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
                  <Wallet className="w-4 h-4 text-cyan-400" />
                  SaaS Core Split Engine (80/20)
                </h3>
                <p className="text-xs text-gray-400 leading-normal">
                  Todas las pasarelas financieras de DeliveryPlus dividen la tarifa automáticamente: el <strong>80%</strong> transfiere directamente a Carlos Gómez, y el <strong>20%</strong> va a la cuenta SaaS para sostén.
                </p>

                <div className="bg-black/30 border border-gray-900 rounded-2xl p-4 text-xs font-mono space-y-2">
                  <div className="flex justify-between text-orange-400">
                    <span>Acumulado Choferes (80%):</span>
                    <span className="font-extrabold">${walletSaldo} ARS</span>
                  </div>
                  <div className="flex justify-between text-cyan-400">
                    <span>Acumulado Plataforma (20%):</span>
                    <span className="font-extrabold">${adminSaldo} ARS</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setWalletAmountInput('10000');
                      setCashierModal('retiro');
                      logEvent('SaaS Control: Simulación de liquidación de haberes para Carlos', 'info');
                    }}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all active:scale-95 text-center shadow-lg shadow-orange-500/10 cursor-pointer"
                  >
                    Simular Retiro Carlos
                  </button>
                  <button
                    onClick={() => {
                      setWalletSaldo(24000);
                      setAdminSaldo(5000);
                      setTransacciones([
                        { id: 1, tipo: 'ingreso_turno', monto: 12000, saldo_anterior: 12000, saldo_posterior: 24000, referencia: 'turno_2', fecha: '2026-06-11 01:12' },
                        { id: 2, tipo: 'comision_plataforma', monto: 0, saldo_anterior: 2000, saldo_posterior: 5000, referencia: 'turno_2', fecha: '2026-06-11 01:12' }
                      ]);
                      logEvent('Base de datos: Reset financiero ejecutado con éxito', 'warn');
                    }}
                    className="bg-transparent border border-gray-700 hover:bg-gray-800 text-gray-400 font-bold text-xs py-2 px-3 rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    Resetear
                  </button>
                </div>
              </div>

              {/* Live server API logs stream */}
              <div className="bg-[#111720]/80 border border-gray-800 p-5 rounded-2xl flex flex-col h-[280px]">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">REST API Server Logs</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
                    Escuchando
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto py-3 space-y-2 font-mono text-[9.5px] leading-normal text-left max-h-[200px]">
                  {consoleLogs.map((log) => (
                    <div key={log.id} className="flex gap-1.5 items-start">
                      <span className="text-gray-500 shrink-0 select-none">{log.time}</span>
                      <span className={`break-all ${
                        log.type === 'success' ? 'text-emerald-400' :
                        log.type === 'warn' ? 'text-yellow-400' :
                        log.type === 'error' ? 'text-red-400' : 'text-cyan-400'
                      }`}>
                        {log.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

          </div>
        </main>
      )}

      {/* --- MAIN WORKSPACE MULTI-COLUMNS GRIDS --- */}
      {(activePortalView === 'sandbox') && (
        <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 p-4 gap-4 relative z-10">

          {/* ================= LEFT COLUMN: IA & SIMULATOR CONTROL CENTER (Only in Dev Console Mode) ================= */}
          {activeWorkspaceTab === 'consola' && (
            <section className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-100px)] pr-1">
            
            {/* AI Weather widget & control center */}
            <div className="bg-[#151D25] rounded-2xl p-5 border border-gray-800 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <CloudLightning className="w-4 h-4 text-yellow-500" />
                  IA Clima y Multiplicadores
                </h2>
              <span className="text-xs bg-gray-800 text-gray-400 px-2.5 py-0.5 rounded-full font-mono">
                API Clima Activa
              </span>
            </div>
            
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              El clima incide directamente sobre la demanda de entregas y el riesgo vial. La IA de DeliveryPlus calcula un multiplicador especial que premia al repartidor. Cambia el clima para ver variar las tarifas de la app del teléfono en tiempo real:
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button 
                onClick={() => handleWeatherChange('despejado')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  weatherCondition === 'despejado' 
                    ? 'bg-orange-500/10 border-orange-500 text-orange-500' 
                    : 'bg-gray-800/40 border-transparent hover:bg-gray-800 text-gray-300'
                }`}
              >
                <Sun className="w-4 h-4" />
                Soleado (1.0x)
              </button>
              
              <button 
                onClick={() => handleWeatherChange('nublado')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  weatherCondition === 'nublado' 
                    ? 'bg-[#4E4376]/20 border-[#4E4376] text-purple-400' 
                    : 'bg-gray-800/40 border-transparent hover:bg-gray-800 text-gray-300'
                }`}
              >
                <Cloud className="w-4 h-4" />
                Nublado (1.05x)
              </button>

              <button 
                onClick={() => handleWeatherChange('lluvia')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  weatherCondition === 'lluvia' 
                    ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                    : 'bg-gray-800/40 border-transparent hover:bg-gray-800 text-gray-300'
                }`}
              >
                <CloudRain className="w-4 h-4" />
                Lluvia (1.25x)
              </button>

              <button 
                onClick={() => handleWeatherChange('tormenta')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  weatherCondition === 'tormenta' 
                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 animate-pulse' 
                    : 'bg-gray-800/40 border-transparent hover:bg-gray-800 text-gray-300'
                }`}
              >
                <CloudLightning className="w-4 h-4" />
                Tormenta (1.40x)
              </button>
            </div>

            <div className="bg-[#1A2530] p-4 rounded-xl border border-gray-800 flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-gray-400 block mb-1">Impacto de Tarifa de IA</span>
                <span className="text-base font-bold text-white flex items-center gap-2">
                  {getMultiplierIcon()}
                  Con clima {weatherCondition.toUpperCase()} (+{Math.round((multiplier - 1) * 100)}%)
                </span>
                <span className="text-[10px] text-gray-500 block mt-1">
                  * 80% repartidor, 20% plataforma se mantienen íntegros.
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-500 block text-[10px]">Temp Promedio</span>
                <span className="text-lg font-bold text-orange-500 font-mono">{temperature}°C</span>
              </div>
            </div>
          </div>

          {/* Place order interactive simulated actions */}
          <div className="bg-[#151D25] rounded-2xl p-5 border border-gray-800 shadow-md">
            <h2 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4 text-orange-500" />
              Simular Pedidos B2B
            </h2>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Simula que los comercios y emprendimientos de la zona publican ofertas furgón. Estos aparecerán de inmediato como alertas push y en la sección del celular:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleSimulatedOrder('turno')}
                className="w-full bg-[#1A2530] hover:bg-[#233140] text-white border border-gray-800 p-3 rounded-xl text-xs font-semibold text-left flex items-center justify-between transition-colors"
              >
                <div className="flex gap-3 items-center">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block text-white">Comercio: Pedir Bloque 4 Horas</span>
                    <span className="text-[10px] text-gray-400 block">Simula que "Burger House" abre un turno fijo nocturno</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>

              <button
                onClick={() => handleSimulatedOrder('entrega')}
                className="w-full bg-[#1A2530] hover:bg-[#233140] text-white border border-gray-800 p-3 rounded-xl text-xs font-semibold text-left flex items-center justify-between transition-colors"
              >
                <div className="flex gap-3 items-center">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Bike className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block text-white">Emprendedor: Pedir Entrega Única</span>
                    <span className="text-[10px] text-gray-400 block">Simula que "Pastas de la Nona" despacha ravioles calientes</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Database Table Explorer */}
          <div className="bg-[#151D25] rounded-2xl p-5 border border-gray-800 shadow-md flex-1 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                Explorador de Tablas
              </h2>
              <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-mono">
                deliveryplus.sql
              </span>
            </div>
            
            <p className="text-[11px] text-gray-400 mb-4 leading-normal">
              Representación visual viva de la base de datos MySQL local. Los datos reaccionan instantáneamente a las acciones que realices en el visualizador del teléfono:
            </p>

            {/* List tables tab chip */}
            <div className="flex flex-wrap gap-1.5 mb-3 bg-gray-900 p-1.5 rounded-xl border border-gray-800 shrink-0">
              {(['repartidores', 'turnos', 'entregas_unicas', 'billeteras', 'transacciones', 'usuarios'] as const).map((table) => (
                <button
                  key={table}
                  onClick={() => {
                    setActiveDbTable(table);
                    setDbSearchTerm('');
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono leading-none transition-all ${
                    activeDbTable === table
                      ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                      : 'border border-transparent bg-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {table}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative mb-3 shrink-0">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder={`SELECT * FROM ${activeDbTable} WHERE...`}
                value={dbSearchTerm}
                onChange={(e) => setDbSearchTerm(e.target.value)}
                className="w-full bg-[#1A2530] text-xs pl-9 pr-4 py-2 border border-gray-800 rounded-xl focus:border-cyan-500 focus:outline-none font-mono text-[#00E5FF]"
              />
            </div>

            {/* Table Spreadsheet */}
            <div className="flex-1 overflow-auto max-h-[250px] border border-gray-800 rounded-xl bg-gray-950/50">
              <table className="w-full text-left border-collapse text-[11px] font-mono">
                <thead>
                  <tr className="bg-gray-900 border-b border-gray-800 text-gray-400 uppercase text-[9px] tracking-wider stick top-0">
                    {activeDbTable === 'repartidores' && (
                      <>
                        <th className="p-2">id</th>
                        <th className="p-2">nombre/apellido</th>
                        <th className="p-2">vehículo</th>
                        <th className="p-2">patente</th>
                        <th className="p-2">disponible</th>
                        <th className="p-2">calif</th>
                      </>
                    )}
                    {activeDbTable === 'turnos' && (
                      <>
                        <th className="p-2">id</th>
                        <th className="p-2">comercio</th>
                        <th className="p-2">horario</th>
                        <th className="p-2">monto</th>
                        <th className="p-2">estado</th>
                      </>
                    )}
                    {activeDbTable === 'entregas_unicas' && (
                      <>
                        <th className="p-2">id</th>
                        <th className="p-2">emprendedor</th>
                        <th className="p-2">origen / destino</th>
                        <th className="p-2">monto (80%)</th>
                        <th className="p-2">estado</th>
                      </>
                    )}
                    {activeDbTable === 'billeteras' && (
                      <>
                        <th className="p-2">id</th>
                        <th className="p-2">detalle_cuenta</th>
                        <th className="p-2">rol</th>
                        <th className="p-2">saldo_actual</th>
                      </>
                    )}
                    {activeDbTable === 'transacciones' && (
                      <>
                        <th className="p-2">id</th>
                        <th className="p-2">tipo</th>
                        <th className="p-2">monto</th>
                        <th className="p-2">anterior</th>
                        <th className="p-2">posterior</th>
                        <th className="p-2">ref</th>
                      </>
                    )}
                    {activeDbTable === 'usuarios' && (
                      <>
                        <th className="p-2">id</th>
                        <th className="p-2">email</th>
                        <th className="p-2">rol</th>
                        <th className="p-2">activo</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-gray-300">
                  {filteredDbRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-500">
                        No se encontraron registros en la tabla.
                      </td>
                    </tr>
                  ) : (
                    filteredDbRows.map((row: any) => (
                      <tr key={row.id} className="hover:bg-gray-900 border-b border-gray-800/50">
                        {activeDbTable === 'repartidores' && (
                          <>
                            <td className="p-2 text-cyan-400 font-bold">#{row.id}</td>
                            <td className="p-2 text-white">{row.nombre} {row.apellido}</td>
                            <td className="p-2">{row.tipo_vehiculo}</td>
                            <td className="p-2 text-gray-400">{row.patente}</td>
                            <td className="p-2">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] ${row.disponible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {row.disponible ? '1' : '0'}
                              </span>
                            </td>
                            <td className="p-2 text-yellow-400">★{row.calificacion}</td>
                          </>
                        )}
                        {activeDbTable === 'turnos' && (
                          <>
                            <td className="p-2 text-cyan-400 font-bold">#{row.id}</td>
                            <td className="p-2 text-white font-bold">{row.comercio_nombre}</td>
                            <td className="p-2 text-gray-400 text-[10px]">{row.horario}</td>
                            <td className="p-2 text-emerald-400">${row.monto_repartidor} <span className="text-[9px] text-gray-500">(total: {row.monto_total})</span></td>
                            <td className="p-2">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] capitalize ${
                                row.estado === 'completado' ? 'bg-emerald-500/10 text-emerald-400' :
                                row.estado === 'confirmado' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
                              }`}>
                                {row.estado}
                              </span>
                            </td>
                          </>
                        )}
                        {activeDbTable === 'entregas_unicas' && (
                          <>
                            <td className="p-2 text-cyan-400 font-bold">#{row.id}</td>
                            <td className="p-2 text-white">{row.emprendedor_nombre}</td>
                            <td className="p-2 text-[9px] max-w-[100px] truncate text-gray-400" title={`${row.direccion_origen} → ${row.direccion_destino}`}>
                              {row.direccion_destino}
                            </td>
                            <td className="p-2 text-emerald-400">${row.monto_repartidor}</td>
                            <td className="p-2">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] capitalize ${
                                row.estado === 'entregado' ? 'bg-emerald-500/10 text-emerald-400' :
                                row.estado === 'asignado' || row.estado === 'en_camino' ? 'bg-pink-500/10 text-pink-400' : 'bg-orange-500/10 text-orange-400'
                              }`}>
                                {row.estado}
                              </span>
                            </td>
                          </>
                        )}
                        {activeDbTable === 'billeteras' && (
                          <>
                            <td className="p-2 text-cyan-400 font-bold">#{row.id}</td>
                            <td className="p-2 text-white font-bold">
                              {row.propietario}
                              <span className="text-[10px] text-gray-500 block">{row.email}</span>
                            </td>
                            <td className="p-2 text-[9px] text-gray-400">{row.email === 'repartidor@test.com' ? '80% reparto' : '20% plataforma'}</td>
                            <td className="p-2 text-emerald-400 font-bold">${row.saldo.toLocaleString()}</td>
                          </>
                        )}
                        {activeDbTable === 'transacciones' && (
                          <>
                            <td className="p-2 text-cyan-400 font-bold">#{row.id}</td>
                            <td className="p-2 text-gray-300">{row.tipo}</td>
                            <td className={`p-2 font-bold ${row.monto < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                              {row.monto < 0 ? '-' : '+'}${Math.abs(row.monto)}
                            </td>
                            <td className="p-2 text-gray-500">${row.saldo_anterior}</td>
                            <td className="p-2 text-gray-400">${row.saldo_posterior}</td>
                            <td className="p-2 text-cyan-300 font-bold">{row.referencia}</td>
                          </>
                        )}
                        {activeDbTable === 'usuarios' && (
                          <>
                            <td className="p-2 text-cyan-400 font-bold">#{row.id}</td>
                            <td className="p-2 text-white">{row.email}</td>
                            <td className="p-2 text-gray-400">{row.rol}</td>
                            <td className="p-2">
                              <span className={`px-1 rounded text-[8px] ${row.activo ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {row.activo ? 'ACTIVO' : 'BAJA'}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        )}

        {/* ================= GORGEOUS HIGH-FIDELITY B2B MODULES PRESENTATION SCREEN (8 COLS) ================= */}
        {activeWorkspaceTab === 'modulos' && (
          <section className="lg:col-span-8 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-100px)] pr-2 text-left relative z-10 select-none no-scrollbar">
            
            {/* Top Interactive Flow Explanation Header */}
            <div className="bg-gradient-to-r from-[#141B25] to-[#1A2534] rounded-2xl p-6 border border-orange-500/20 shadow-[0_0_25px_rgba(255,107,53,0.06)] relative overflow-hidden shrink-0">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="flex items-center gap-2.5 mb-2">
                <Sparkles className="w-5 h-5 text-orange-400" />
                <h2 className="text-base font-extrabold text-white tracking-tight uppercase">Módulos Interconectados de DeliveryPlus B2B</h2>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed max-w-3xl">
                DeliveryPlus es un ecosistema logístico de última milla optimizado para operaciones corporativas y residenciales. Conecta comercios y emprendimientos de manera segura, con división automática de tarifas <strong>80/20</strong> y cálculo tarifario dinámico por clima de IA. Usa las herramientas interactivas de cada módulo para sincronizar el teléfono de entrega en el acto.
              </p>

              {/* Graphical CSS visualizer of B2B Core Pipeline */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 text-center text-[10.5px] font-mono select-none">
                <div className="bg-[#121922] border border-orange-500/20 p-3 rounded-xl flex flex-col justify-center items-center gap-1 shadow-md">
                  <span className="text-orange-400 font-bold block">🏢 COMERCIOS</span>
                  <span className="text-[9px] text-gray-400">Publican bloques fijos 4h</span>
                </div>
                <div className="bg-[#121922] border border-emerald-500/20 p-3 rounded-xl flex flex-col justify-center items-center gap-1 shadow-md">
                  <span className="text-emerald-400 font-bold block">📦 EMPRENDEDORES</span>
                  <span className="text-[9px] text-gray-400">Despachan envíos sueltos</span>
                </div>
                <div className="bg-[#121922] border border-indigo-500/20 p-3 rounded-xl flex flex-col justify-center items-center gap-1 shadow-md">
                  <span className="text-indigo-400 font-bold block">💵 SPLIT AUTOMÁTICO</span>
                  <span className="text-[9px] text-gray-400">80% Chofer netos / 20% SaaS</span>
                </div>
              </div>
            </div>

            {/* Core Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* MODULE 1: COMERCIOS */}
              <div className="bg-[#121820]/80 border border-gray-800/85 hover:border-orange-500/25 transition-all duration-300 rounded-2xl p-5 flex flex-col h-full shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors pointer-events-none" />
                <div className="flex items-center justify-between mb-3.5 border-b border-gray-800/60 pb-2.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">Módulo Comercios B2B</span>
                  </div>
                  <span className="text-[9px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                    Turnos Fijos
                  </span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed mb-4 flex-1">
                  Los comercios de alta demanda contratan bloques de asistencia exclusivos de <strong>4 horas</strong>. Así cubren sus jornadas críticas de delivery sin arriesgar ausentismo de mensajeros. Tarifas fijadas transparentemente en la base de datos entregando directo el 80% neto al repartidor.
                </p>

                {/* Sub-table active turnos */}
                <div className="bg-gray-950/40 border border-gray-900 rounded-xl p-3 mb-4 space-y-2 shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider font-mono">Turnos en base de datos:</span>
                  <div className="max-h-[110px] overflow-y-auto space-y-1.5 pr-1 font-mono">
                    {turnos.map((t) => (
                      <div key={t.id} className="text-[10px] flex items-center justify-between bg-black/30 p-1.5 rounded-lg border border-gray-900">
                        <span className="text-white font-bold truncate max-w-[120px]">{t.comercio_nombre}</span>
                        <span className="text-gray-400">{t.horario}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider ${
                          t.estado === 'completado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          t.estado === 'en_progreso' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                        }`}>
                          {t.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSimulatedOrder('turno')}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/10 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Publicar Alerta de Turno (Burger House)
                </button>
              </div>

              {/* MODULE 2: EMPRENDEDORES */}
              <div className="bg-[#121820]/80 border border-gray-800/85 hover:border-orange-500/25 transition-all duration-300 rounded-2xl p-5 flex flex-col h-full shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                <div className="flex items-center justify-between mb-3.5 border-b border-gray-800/60 pb-2.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">Módulo Emprendedores</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                    Por Demanda
                  </span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed mb-4 flex-1">
                  Pequeños negocios locales disparan encomiendas individuales on-demand. El sistema estima la tarifa según kilometraje, peso del paquete (`pequeño`, `mediano`, `grande`), y el <strong>Multiplicador Clínico de IA Activa</strong> para amparar el valor logístico del repartidor en días de lluvia o tormenta.
                </p>

                {/* Sub-table active unic deliveries */}
                <div className="bg-gray-950/40 border border-gray-900 rounded-xl p-3 mb-4 space-y-2 shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider font-mono">Pedidos rápidos on-demand:</span>
                  <div className="max-h-[110px] overflow-y-auto space-y-1.5 pr-1 font-mono">
                    {entregas.map((e) => (
                      <div key={e.id} className="text-[10px] flex items-center justify-between bg-black/30 p-1.5 rounded-lg border border-gray-900">
                        <span className="text-white font-bold truncate max-w-[120px]">{e.emprendedor_nombre}</span>
                        <span className="text-emerald-400 font-bold">${e.monto_repartidor}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider ${
                          e.estado === 'entregado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          e.estado === 'en_camino' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/20'
                        }`}>
                          {e.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSimulatedOrder('entrega')}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/10 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Despachar Encomienda (Pastas de la Nona)
                </button>
              </div>

              {/* MODULE 3: REPARTIDOR PROFILE DETAILED CARD */}
              <div className="bg-[#121820]/80 border border-gray-800/85 hover:border-orange-500/25 transition-all duration-300 rounded-2xl p-5 flex flex-col h-full shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
                <div className="flex items-center justify-between mb-3.5 border-b border-gray-800/60 pb-2.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Bike className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">Módulo Repartidores</span>
                  </div>
                  <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                    App Choferes
                  </span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed mb-4 flex-1 col-span-1">
                  Los repartidores operan mediante una aplicación móvil híbrida desarrollada en <strong>Flutter</strong> (puedes probarla en el emulador simulado). Incluye geolocalización satelital de rutas, chat de coordinación con comercios y cobro financiero de liquidación express en 24 horas.
                </p>

                {/* Rider Card Profile Details */}
                <div className="bg-gradient-to-br from-indigo-950/20 to-[#10151E] border border-gray-900 p-4 rounded-2xl space-y-2.5 shrink-0 mt-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-gray-500 block font-mono">REPARTIDOR DETECTADO</span>
                      <strong className="text-white font-bold text-sm tracking-tight">{repartidor.nombre} {repartidor.apellido}</strong>
                    </div>
                    <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2 py-0.5 rounded text-[8px] font-mono font-extrabold tracking-wide">
                      VERIFICADO
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-2.5 border-t border-gray-900 font-mono text-[10px]">
                    <div className="bg-black/30 p-2 rounded-xl border border-gray-950/80">
                      <span className="text-gray-500 block text-[8px] uppercase">Vehículo</span>
                      <span className="text-white font-bold uppercase">{repartidor.tipo_vehiculo}</span>
                    </div>
                    <div className="bg-black/30 p-2 rounded-xl border border-gray-950/80">
                      <span className="text-gray-500 block text-[8px] uppercase">Cumplimiento</span>
                      <span className="text-emerald-400 font-bold">98%</span>
                    </div>
                    <div className="bg-black/30 p-2 rounded-xl border border-gray-950/80">
                      <span className="text-gray-500 block text-[8px] uppercase">Calificación</span>
                      <span className="text-yellow-400 font-bold">★ {repartidor.calificacion}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODULE 4: PLATFORM ADMIN SLIT ENGINE */}
              <div className="bg-[#121820]/80 border border-gray-800/85 hover:border-orange-500/25 transition-all duration-300 rounded-2xl p-5 flex flex-col h-full shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors pointer-events-none" />
                <div className="flex items-center justify-between mb-3.5 border-b border-gray-800/60 pb-2.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">Módulo Admin & Core Split</span>
                  </div>
                  <span className="text-[9px] bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                    Split Financiero
                  </span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed mb-4 flex-1">
                  DeliveryPlus funciona sin tarifas abusivas. El sistema de split aplica un <strong>80 / 20</strong> matemático: de cada cobro, 80% transfiere directo a la cuenta del mensajero (Carlos Gómez) y un 20% es absorbido para servidores Cloud Run y administración tecnológica global.
                </p>

                {/* Comparable balances column grids */}
                <div className="grid grid-cols-2 gap-3 mb-4 shrink-0 font-mono">
                  <div className="bg-gradient-to-b from-black/20 to-black/50 border border-gray-900 rounded-xl p-3.5 text-center">
                    <span className="text-[8px] text-gray-500 block uppercase">Billetera Carlos (80%)</span>
                    <strong className="text-sm font-extrabold text-orange-400 block mt-0.5">
                      {walletSaldo.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}
                    </strong>
                  </div>
                  <div className="bg-gradient-to-b from-black/20 to-black/50 border border-gray-900 rounded-xl p-3.5 text-center">
                    <span className="text-[8px] text-gray-500 block uppercase">SaaS DeliveryPlus (20%)</span>
                    <strong className="text-sm font-extrabold text-cyan-400 block mt-0.5">
                      {adminSaldo.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setWalletAmountInput('10000');
                    setCashierModal('retiro');
                    logEvent('Billetera: Carlos inicia liquidación instantánea de balance a cuenta bancaria', 'info');
                  }}
                  className="w-full bg-[#1A2534] hover:bg-[#233144] border border-orange-500/30 text-orange-400 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <ArrowUpRight className="w-4 h-4 text-orange-500" />
                  Simular Retiro Inmediato de Carlos
                </button>
              </div>

            </div>

            {/* MODULE 5: INTELLECTUAL AI BOOKING CHAT ASSISTANT (TEXT & AUDIO) */}
            <div className="bg-[#121820]/80 border border-blue-brand/20 rounded-2xl p-6 space-y-4 shadow-xl relative z-10 transition-all">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-blue-brand animate-pulse" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">⚡ Módulo IA de Reserva Conversacional Directa (Voz y Texto)</h3>
                </div>
                <p className="text-xs text-gray-400">Prueba el despachador automático asistido por voz. El procesamiento cognitivo extrae la ubicación y tarifa, y actualiza el ecosistema en vivo.</p>
              </div>
              <AIChatAssistant 
                turnos={turnos}
                setTurnos={setTurnos}
                entregas={entregas}
                setEntregas={setEntregas}
                logEvent={logEvent}
                triggerNotification={triggerNotification}
                weatherCondition={weatherCondition}
                multiplier={multiplier}
                role="comercio"
              />
            </div>
          </section>
        )}

        {/* ================= CENTER COLUMN: THE FLUTTER SMARTPHONE EMULATOR (35% WIDTH) ================= */}
        {activeWorkspaceTab !== 'mockups' && (
          <section className="lg:col-span-4 flex items-center justify-center">
          
          <div className={`relative w-full max-w-[340px] aspect-[9/18.5] bg-black rounded-[40px] p-2.5 shadow-[0_25px_110px_-15px_rgba(162,0,255,0.15)] border-4 border-gray-800 ring-12 ring-gray-800/40 flex flex-col overflow-hidden transition-all duration-300 ${isShaking ? 'animate-shakeDevice border-indigo-500' : ''}`}>
            
            {/* Top Speaker / Camera Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-black z-50 flex items-center justify-center">
              <div className="w-20 h-4 bg-black rounded-b-xl flex items-center justify-around px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-950/70"></div>
                <div className="w-8 h-1 rounded-full bg-gray-800"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-950"></div>
              </div>
            </div>

            {/* Simulated Live Alert Slider inside Phone */}
            {phoneNotification && (
              <div className="absolute top-8 inset-x-3 bg-[#1B252F] text-white p-3 rounded-2xl z-50 shadow-2xl border border-orange-500/40 text-[11px] animate-bounce">
                <div className="flex gap-2 items-start">
                  <div className="bg-orange-500 p-1 rounded-lg text-white">
                    <Bike className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-orange-500 text-[11px]">{phoneNotification.title}</h4>
                    <p className="text-gray-200 mt-0.5 leading-tight">{phoneNotification.body}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Screen background viewport wrapper */}
            <div className={`w-full h-full flex flex-col rounded-[32px] overflow-hidden relative ${
              phoneTheme === 'dark' ? 'bg-[#12181E] text-[#ECEFF1]' : 'bg-[#F5F7FA] text-[#2D3436]'
            }`}>
              
              {/* Phone Status bar */}
              <div className={`pt-6 pb-2 px-4 flex justify-between items-center text-[10px] uppercase tracking-wide font-semibold shrink-0 z-10 ${
                phoneTheme === 'dark' ? 'bg-[#151D25] text-gray-400' : 'bg-white text-gray-600 border-b border-gray-100'
              }`}>
                <span>04:37 CET</span>
                <div className="flex gap-1 items-center">
                  <span className="font-mono">LTE</span>
                  <div className="w-4 h-2.5 border border-current rounded-sm p-0.5 flex items-center">
                    <div className="h-full w-full bg-current rounded-2xs"></div>
                  </div>
                </div>
                         {/* 1. SPLASH SCREEN */}
                {phoneScreen === 'splash' && (
                  <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-brand-black to-[#0E131F]">
                    <div></div>
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-5 animate-pulse">
                        <BrandLogo variant="repartidor" size="lg" animated={true} />
                      </div>
                      <h2 className="text-2xl font-extrabold text-white tracking-tight font-display">Delivery<span className="text-blue-brand">Plus</span></h2>
                      <span className="text-[10px] bg-blue-brand/10 text-blue-brand px-3 py-1 rounded-full mt-2 font-mono font-bold border border-blue-brand/20">
                        IA MULTI-PORTAL B2B
                      </span>
                    </div>
                    <div className="w-full">
                      <button
                        onClick={() => setPhoneScreen('login')}
                        className="w-full bg-blue-brand hover:bg-[#0062CC] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-brand/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                      >
                        Iniciar Sistema B2B
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. LOGIN SCREEN */}
                {phoneScreen === 'login' && (
                  <div className="flex-1 p-5 flex flex-col justify-between bg-[#0A0A0A]">
                    <div>
                      <div className="flex justify-between items-center mt-3 mb-6">
                        <span className="text-xs font-bold text-blue-brand font-display">ACCESO REPARTIDOR</span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => {
                              setLoginEmail('repartidor@test.com');
                              setLoginPassword('123456');
                            }}
                            className="bg-blue-brand/10 text-blue-brand px-2.5 py-1 rounded-lg text-[9px] hover:bg-blue-brand/20 font-semibold"
                          >
                            Demo creds
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xl font-extrabold tracking-tight text-white mb-2 font-display">Ingresa tus datos</h3>
                      <p className="text-xs text-gray-400 mb-6 leading-relaxed">Conéctate a tu panel DeliveryPlus B2B para aceptar turnos y entregas directas.</p>

                      <div className="space-y-3.5">
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Email</label>
                          <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full bg-[#1F1F1F] border border-gray-brand rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-brand"
                            placeholder="repartidor@test.com"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Password</label>
                          <input
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full bg-[#1F1F1F] border border-gray-brand rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-brand"
                            placeholder="••••••"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      <button
                        onClick={handlePhoneLogin}
                        className="w-full bg-blue-brand hover:bg-[#0062CC] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        Iniciar Sesión
                      </button>
                      <button
                        onClick={() => setPhoneScreen('register')}
                        className="w-full bg-transparent hover:bg-gray-brand text-gray-400 py-1.5 text-xs text-center rounded-xl transition-all"
                      >
                        Crear perfil nuevo
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. REGISTER SCREEN */}
                {phoneScreen === 'register' && (
                  <div className="flex-1 p-5 flex flex-col justify-between overflow-y-auto bg-[#0A0A0A]">
                    <div className="space-y-3.5">
                      <div className="mt-2">
                        <span className="text-[10px] bg-blue-brand/10 border border-blue-brand/20 text-blue-brand px-2 py-0.5 rounded-full font-mono font-bold">
                          REGISTRO B2B
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white font-display">Únete a la Red</h3>

                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="text-[9px] text-gray-400 block mb-0.5 font-bold">Nombre</label>
                          <input
                            type="text"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            className="w-full bg-[#1F1F1F] border border-gray-brand rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-brand"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-400 block mb-0.5 font-bold">Apellido</label>
                          <input
                            type="text"
                            value={regSurname}
                            onChange={(e) => setRegSurname(e.target.value)}
                            className="w-full bg-[#1F1F1F] border border-gray-brand rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-brand"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-400 block mb-0.5 font-bold">Vehículo</label>
                          <select
                            value={regVehicle}
                            onChange={(e: any) => setRegVehicle(e.target.value)}
                            className="w-full bg-[#1F1F1F] border border-gray-brand rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-brand"
                          >
                            <option value="bicicleta">Bicicleta</option>
                            <option value="moto">Moto</option>
                            <option value="auto">Auto</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-400 block mb-0.5 font-bold">Patente / Matrícula</label>
                          <input
                            type="text"
                            value={regPatent}
                            onChange={(e) => setRegPatent(e.target.value)}
                            className="w-full bg-[#1F1F1F] border border-gray-brand rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-brand"
                            placeholder="Ej: 99A-XYZ8"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-400 block mb-0.5 font-bold">Correo B2B</label>
                          <input
                            type="email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="w-full bg-[#1F1F1F] border border-gray-brand rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-brand"
                            placeholder="correo@test.com"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-400 block mb-0.5 font-bold">Contraseña</label>
                          <input
                            type="password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full bg-[#1F1F1F] border border-gray-brand rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-brand"
                            placeholder="••••••"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 shrink-0">
                      <button
                        onClick={handlePhoneRegister}
                        className="w-full bg-blue-brand hover:bg-[#0062CC] text-white py-2.5 rounded-lg font-bold text-xs uppercase cursor-pointer"
                      >
                        Crear Cuenta
                      </button>
                      <button
                        onClick={() => setPhoneScreen('login')}
                        className="w-full bg-transparent text-gray-400 text-xs py-1"
                      >
                        Ya tengo cuenta
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. HOME SCREEN (DASHBOARD) */}
                {phoneScreen === 'home' && (
                  <div className="flex-1 p-4 flex flex-col gap-3">
                    
                    {/* Header bar within smartphone screen */}
                    <div className="flex items-center justify-between mt-1 mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          onClick={() => setPhoneScreen('perfil')}
                          className="w-8 h-8 rounded-full border border-orange-500 overflow-hidden cursor-pointer active:scale-90 transition-transform"
                        >
                          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="avatar" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="block text-[11px] font-bold text-white leading-none">Carlos Gómez</span>
                          <span className="text-[9px] text-gray-400 leading-none">Moto • {repartidor.patente}</span>
                        </div>
                      </div>

                      {/* State switch */}
                      <button
                        onClick={toggleAvailability}
                        className={`text-[9px] px-2.5 py-1 rounded-full font-bold transition-colors ${
                          repartidor.disponible 
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
                            : 'bg-gray-800 border border-gray-700 text-gray-400'
                        }`}
                      >
                        {repartidor.disponible ? '● CONECTADO' : '○ AUSENTE'}
                      </button>
                    </div>

                    {/* Integrated dynamic Weather card */}
                    <div className="bg-gradient-to-tr from-[#2B5876] to-[#4E4376] rounded-2xl p-3.5 text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-white/70 font-semibold block leading-tight">Buenos Aires Centro</span>
                          <span className="text-xl font-black block mt-0.5 leading-none">{temperature}°C</span>
                        </div>
                        <div className="bg-orange-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded flex flex-col items-center">
                          <span className="text-[7px] leading-3 uppercase text-white/80">TARIFA IA</span>
                          <span>+{Math.round((multiplier - 1) * 100)}%</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2 bg-black/15 p-2 rounded-lg text-[9.5px]">
                        {weatherCondition === 'tormenta' || weatherCondition === 'lluvia' ? (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                            <span className="leading-tight text-white/90">Lluvia activa. +10 de bonificación por turno. Recorridos con precaución.</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                            <span className="leading-tight text-white/90">Clima normal. Ofertas estables. ¡Éxitos en tu jornada!</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#151D25] p-3 rounded-xl border border-gray-800">
                        <span className="text-gray-400 text-[9px] block">Saldo de Billetera</span>
                        <span className="text-base font-bold text-emerald-400 block">${walletSaldo.toLocaleString()}</span>
                        <span className="text-[8px] text-gray-500 block">80% neto de comisiones</span>
                      </div>

                      <div className="bg-[#151D25] p-3 rounded-xl border border-gray-800">
                        <span className="text-gray-400 text-[9px] block">Calificación</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-bold text-white">{repartidor.calificacion}</span>
                        </div>
                        <span className="text-[8px] text-gray-500 block">Total: {repartidor.total_entregas} entregas</span>
                      </div>
                    </div>

                    {/* AI Predictions alerts panel inside phone app */}
                    <div className="space-y-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">IA Sugerencias B2B</span>
                      
                      {weatherCondition === 'tormenta' || weatherCondition === 'lluvia' ? (
                        <div className="bg-[#1D252E] border border-orange-500/20 p-2.5 rounded-xl text-[10px] leading-snug">
                          <div className="flex gap-1.5 items-start">
                            <span className="text-xs">⛈️</span>
                            <div>
                              <span className="font-bold text-white block">Zonas calientes con lluvia</span>
                              <p className="text-gray-400">Hay más oferta de pedidos en Palermo Centro. Sugerencia: activa Turno de 4h en La Trattoria para consolidar ganancias climáticas.</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#1D252E] border border-gray-800 p-2.5 rounded-xl text-[10px] leading-snug">
                          <div className="flex gap-1.5 items-start">
                            <span className="text-xs">🔥</span>
                            <div>
                              <span className="font-bold text-white block">Belgrano Residencial Caliente</span>
                              <p className="text-gray-400">La predictive IA espera alta demanda entre las 19:30 y 21:00. Consumo gastronómico en alza.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. MAPA & ZONAS CALIENTES - ARGENTINA */}
                {phoneScreen === 'mapa' && (
                  <ArgentinaMap gpsSimulating={gpsSimulating} gpsProgress={gpsProgress} markers={mapMarkers} />
                )}

                {/* 6. TURNOS (Bloques de 4 horas) */}
                {phoneScreen === 'turnos' && (
                  <div className="flex-1 flex flex-col">
                    <div className="bg-[#151D25] px-4 py-2 border-b border-gray-800 flex justify-around shrink-0 text-xs">
                      <button
                        onClick={() => setActiveTurnoTab('disponibles')}
                        className={`pb-1.5 font-bold border-b-2 transition-colors ${
                          activeTurnoTab === 'disponibles' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'
                        }`}
                      >
                        Disponibles
                      </button>
                      <button
                        onClick={() => setActiveTurnoTab('contratados')}
                        className={`pb-1.5 font-bold border-b-2 transition-colors ${
                          activeTurnoTab === 'contratados' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'
                        }`}
                      >
                        Mis Turnos ({turnos.filter((t) => t.estado === 'confirmado').length})
                      </button>
                    </div>

                    <div className="flex-1 p-3 space-y-3">
                      {activeTurnoTab === 'disponibles' ? (
                        turnos.filter((t) => t.estado === 'disponible').length === 0 ? (
                          <div className="text-center py-12 text-gray-500 text-xs">
                            No hay turnos disponibles para hoy. Pruebe pidiendo uno en el panel simulador lateral.
                          </div>
                        ) : (
                          turnos
                            .filter((t) => t.estado === 'disponible')
                            .map((t) => (
                              <div key={t.id} className="bg-[#151D25] rounded-2xl p-4 border border-gray-800 text-left relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-orange-500/10 text-orange-400 text-[8px] px-2 py-0.5 rounded-bl-xl font-bold uppercase tracking-wider">
                                  Bloque 4 hs
                                </div>
                                <h4 className="font-bold text-white text-xs">{t.comercio_nombre}</h4>
                                <span className="text-[10px] text-gray-400 block mt-0.5">{t.direccion}</span>
                                
                                <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-300">
                                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                                  <span>{t.fecha} • {t.horario}</span>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
                                  <div>
                                    <span className="text-[9px] text-gray-400 block leading-tight">Ganancia (80%):</span>
                                    <span className="text-emerald-400 font-bold text-xs">${t.monto_repartidor.toLocaleString()}</span>
                                  </div>
                                  <button
                                    onClick={() => acceptShift(t.id)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg font-sans transition-colors active:scale-95"
                                  >
                                    Aceptar Bloque
                                  </button>
                                </div>
                              </div>
                            ))
                        )
                      ) : (
                        turnos.filter((t) => t.estado === 'confirmado' || t.estado === 'completado').length === 0 ? (
                          <div className="text-center py-12 text-gray-500 text-xs">
                            No has tomado ningún bloque de turno.
                          </div>
                        ) : (
                          turnos
                            .filter((t) => t.estado === 'confirmado' || t.estado === 'completado')
                            .map((t) => (
                              <div key={t.id} className="bg-[#151D25] rounded-2xl p-4 border border-gray-800 text-left relative overflow-hidden">
                                <h4 className="font-bold text-white text-xs">{t.comercio_nombre}</h4>
                                <span className="text-[10px] text-gray-400 block mt-0.5">{t.direccion}</span>

                                <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-300">
                                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                                  <span>{t.fecha} • {t.horario}</span>
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-bold uppercase">
                                    {t.estado === 'completado' ? 'Completado' : 'Asignado'}
                                  </span>
                                  <span className="text-emerald-400 font-bold text-xs">${t.monto_repartidor.toLocaleString()}</span>
                                </div>
                              </div>
                            ))
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* 7. PEDIDOS / ENTREGAS (Tabs: disponibles, activa, hist) */}
                {phoneScreen === 'pedidos' && (
                  <div className="flex-1 flex flex-col">
                    <div className="bg-[#151D25] px-2 py-2 border-b border-gray-800 flex justify-around shrink-0 text-xs">
                      <button
                        onClick={() => setActiveTab('disponibles')}
                        className={`pb-1.5 font-bold border-b-2 transition-all ${
                          activeTab === 'disponibles' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'
                        }`}
                      >
                        Entregas
                      </button>
                      <button
                        onClick={() => setActiveTab('mision')}
                        className={`pb-1.5 font-bold border-b-2 transition-all ${
                          activeTab === 'mision' ? 'border-orange-500 text-orange-500 animate-pulse' : 'border-transparent text-gray-400'
                        }`}
                      >
                        Activa {activeDeliveryId ? '●' : ''}
                      </button>
                      <button
                        onClick={() => setActiveTab('historial')}
                        className={`pb-1.5 font-bold border-b-2 transition-all ${
                          activeTab === 'historial' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'
                        }`}
                      >
                        Historial
                      </button>
                    </div>

                    <div className="flex-1 p-3 space-y-3">
                      
                      {activeTab === 'disponibles' && (
                        entregas.filter((e) => e.estado === 'disponible').length === 0 ? (
                          <div className="text-center py-12 text-gray-500 text-xs">
                            No hay entregas disponibles. Prueba pidiendo una en el panel simulador lateral.
                          </div>
                        ) : (
                          entregas
                            .filter((e) => e.estado === 'disponible')
                            .map((e) => (
                              <div key={e.id} className="bg-[#151D25] rounded-2xl p-4 border border-gray-800 text-left relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 text-[8px] px-2 py-0.5 rounded-bl-xl font-bold uppercase">
                                  Despacho único
                                </div>
                                <h4 className="font-bold text-white text-xs">{e.emprendedor_nombre}</h4>
                                <div className="mt-2 space-y-1 text-[10px] text-gray-400 leading-tight">
                                  <p><span className="text-[8px] text-gray-500 uppercase block">Origen:</span> {e.direccion_origen}</p>
                                  <p><span className="text-[8px] text-gray-500 uppercase block">Destino:</span> {e.direccion_destino}</p>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
                                  <div>
                                    <span className="text-[9px] text-gray-400 block leading-tight">Tarifa (80%):</span>
                                    <span className="text-emerald-400 font-bold text-xs">${e.monto_repartidor.toLocaleString()}</span>
                                  </div>
                                  <button
                                    onClick={() => acceptDelivery(e.id)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg font-sans transition-colors active:scale-95"
                                  >
                                    Asignarme
                                  </button>
                                </div>
                              </div>
                            ))
                        )
                      )}

                      {activeTab === 'mision' && (
                        !activeDeliveryId ? (
                          <div className="text-center py-12 text-gray-500 text-xs leading-relaxed">
                            No tienes ninguna entrega en curso activa.<br />
                            toma una entrega en la pestaña "Disponibles".
                          </div>
                        ) : (
                          (() => {
                            const activeDelObj = entregas.find((e) => e.id === activeDeliveryId);
                            if (!activeDelObj) return null;
                            return (
                              <div className="space-y-3.5 text-left">
                                <div className="bg-[#151D25] rounded-2xl p-4 border border-orange-500/20">
                                  <h4 className="font-bold text-white text-xs">{activeDelObj.emprendedor_nombre}</h4>
                                  <span className="text-[10px] text-gray-400 block mt-0.5">{activeDelObj.direccion_destino}</span>

                                  <div className="mt-4 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2.5 h-2.5 rounded-full ${activeDelObj.estado === 'asignado' || activeDelObj.estado === 'recolectado' || activeDelObj.estado === 'en_camino' || activeDelObj.estado === 'entregado' ? 'bg-orange-500 shadow-md shadow-orange-500/50' : 'bg-gray-800'}`} />
                                      <span className="text-[10px] text-white">Retirar de local</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2.5 h-2.5 rounded-full ${activeDelObj.estado === 'recolectado' || activeDelObj.estado === 'en_camino' || activeDelObj.estado === 'entregado' ? 'bg-orange-500 shadow-md shadow-orange-500/50' : 'bg-gray-800'}`} />
                                      <span className="text-[10px] text-white">Retirado del local (Recolectado)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2.5 h-2.5 rounded-full ${activeDelObj.estado === 'en_camino' || activeDelObj.estado === 'entregado' ? 'bg-orange-500' : 'bg-gray-800'}`} />
                                      <span className="text-[10px] text-white">Viajando en Ruta GPS</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2.5 h-2.5 rounded-full ${activeDelObj.estado === 'entregado' ? 'bg-emerald-500' : 'bg-gray-800'}`} />
                                      <span className="text-[10px] text-white font-bold">Llegada y pago split (80/20)</span>
                                    </div>
                                  </div>

                                  <div className="mt-4">
                                    <button
                                      disabled={gpsSimulating}
                                      onClick={startGpsTracking}
                                      className="w-full bg-[#1F2E3D] border border-orange-500/30 text-orange-400 font-bold text-[11px] py-1.5 rounded-lg hover:bg-[#25394C] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                      {gpsSimulating ? 'Simulando Ruta GPS...' : 'Simular Ruta Completa'}
                                    </button>
                                  </div>
                                </div>

                                {/* CHAT WITH MERCHANTS SECTION inside smartphone screen */}
                                <div className="bg-[#151D25] rounded-2xl border border-gray-800 flex flex-col h-[260px]">
                                  <div className="bg-gray-900 px-3 py-2 border-b border-gray-800 flex justify-between items-center shrink-0 rounded-t-2xl">
                                    <span className="text-[10px] font-bold text-white flex items-center gap-1.5">
                                      <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                                      Chat: {activeDelObj.emprendedor_nombre}
                                    </span>
                                    <span className="text-[9px] text-emerald-400">En Línea</span>
                                  </div>

                                  {/* Message thread viewport */}
                                  <div className="flex-1 p-2 overflow-y-auto space-y-2 text-[10px]">
                                    {chatMessages.map((msg) => (
                                      <div key={msg.id} className={`flex flex-col ${msg.sender === 'repartidor' ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                                          msg.sender === 'repartidor'
                                            ? 'bg-orange-500 text-white rounded-tr-none'
                                            : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                                        }`}>
                                          {msg.tipo === 'audio' ? (
                                            <div className="flex items-center gap-2">
                                              <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" />
                                              <span className="font-bold">Mensaje de Voz ({msg.audio_segundos}s)</span>
                                            </div>
                                          ) : (
                                            msg.contenido
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Chat controls and push to talk */}
                                  <div className="p-1.5 border-t border-gray-800 bg-[#12181E] rounded-b-2xl flex items-center gap-1">
                                    <input
                                      type="text"
                                      placeholder="Enviar mensaje..."
                                      value={newMsgText}
                                      onChange={(e) => setNewMsgText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') sendChatMessage();
                                      }}
                                      className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1 text-[10px] text-white focus:outline-none"
                                    />
                                    {newMsgText ? (
                                      <button 
                                        onClick={sendChatMessage}
                                        className="bg-orange-500 p-1.5 rounded-lg text-white"
                                      >
                                        <Send className="w-3.5 h-3.5" />
                                      </button>
                                    ) : (
                                      <button
                                        onMouseDown={startRecordingAudio}
                                        onMouseUp={stopRecordingAudio}
                                        onTouchStart={startRecordingAudio}
                                        onTouchEnd={stopRecordingAudio}
                                        className={`p-1.5 rounded-lg text-white select-none ${
                                          isRecordingAudio ? 'bg-red-600 animate-pulse' : 'bg-gray-800'
                                        }`}
                                        title="Mantén pulsado para simular audio"
                                      >
                                        <Volume2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })()
                        )
                      )}

                      {activeTab === 'historial' && (
                        entregas.filter((e) => e.estado === 'entregado').length === 0 ? (
                          <div className="text-center py-12 text-gray-500 text-xs">
                            No has completado entregas en esta sesión.
                          </div>
                        ) : (
                          entregas
                            .filter((e) => e.estado === 'entregado')
                            .map((e) => (
                              <div key={e.id} className="bg-[#151D25] rounded-2xl p-4 border border-gray-800 text-left">
                                <h4 className="font-bold text-white text-xs">{e.emprendedor_nombre}</h4>
                                <span className="text-[10px] text-gray-400 block mt-0.5">{e.direccion_destino}</span>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-md font-bold uppercase">
                                    Entregado
                                  </span>
                                  <span className="text-emerald-400 font-bold text-xs">${e.monto_repartidor.toLocaleString()}</span>
                                </div>
                              </div>
                            ))
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* 8. BILLETERA SCREEN */}
                {phoneScreen === 'billetera' && (
                  <div className="flex-1 p-4 flex flex-col gap-4 text-left">
                    
                    {/* Balanced funds representation card */}
                    <div className="bg-[#151D25] rounded-2xl p-4 border border-[#2D3436] space-y-4">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Saldo de Reparto (80%)</span>
                        <span className="text-2xl font-black text-white mt-1 block">${walletSaldo.toLocaleString()}.00</span>
                        <span className="text-[9px] text-[#00B894] block mt-1 leading-none font-bold">100% Retirable de inmediato</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 shrink-0">
                        <button
                          onClick={() => setCashierModal('retiro')}
                          className="bg-gray-800 hover:bg-gray-700/80 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors border border-gray-700"
                        >
                          <Upload className="w-3.5 h-3.5 text-orange-500" />
                          Retirar
                        </button>
                        <button
                          onClick={() => setCashierModal('deposito')}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Cargar
                        </button>
                      </div>
                    </div>

                    {/* Historical Transactions log */}
                    <div className="space-y-2 flex-1 overflow-y-auto">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Movimientos de Caja</span>
                      
                      <div className="space-y-1.5">
                        {transacciones.map((t) => (
                          <div key={t.id} className="bg-[#1C232B] p-2.5 rounded-xl border border-gray-800 flex justify-between items-center text-[10px]">
                            <div>
                              <span className="font-bold text-white block capitalize">{t.tipo.replace('_', ' ')}</span>
                              <span className="text-gray-500 text-[8px]">{t.fecha}</span>
                            </div>
                            <span className={`font-bold ${t.monto < 0 ? 'text-red-400' : 'text-[#00B894]'}`}>
                              {t.monto < 0 ? '-' : '+'}${Math.abs(t.monto).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. PERFIL PÚBLICO SCREEN */}
                {phoneScreen === 'perfil' && (
                  <div className="flex-1 p-4 flex flex-col gap-4 text-center">
                    
                    <div className="flex flex-col items-center">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500 mb-2">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Carlos Gómez" className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-bold text-white text-sm">Carlos Gómez</h4>
                      <span className="text-[10px] text-gray-400 block mt-0.5">Moto • Patente: {repartidor.patente}</span>
                      
                      {/* Rating Stars score board */}
                      <div className="flex gap-1 items-center mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        ))}
                        <span className="text-[10px] font-bold text-white ml-1">({repartidor.calificacion})</span>
                      </div>
                    </div>

                    {/* Stats metrics layout */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-[#151D25] p-2.5 rounded-xl border border-gray-800">
                        <span className="text-orange-500 font-bold text-sm block">4.92</span>
                        <span className="text-[8px] text-gray-500">Calificación</span>
                      </div>
                      <div className="bg-[#151D25] p-2.5 rounded-xl border border-gray-800">
                        <span className="text-orange-500 font-bold text-sm block">420</span>
                        <span className="text-[8px] text-gray-500">Total viajes</span>
                      </div>
                      <div className="bg-[#151D25] p-2.5 rounded-xl border border-gray-800">
                        <span className="text-orange-500 font-bold text-sm block">98%</span>
                        <span className="text-[8px] text-gray-500">A tiempo</span>
                      </div>
                    </div>

                    {/* Hardware Sensor Simulator Panel */}
                    <div className="space-y-1.5 text-left bg-black/45 border border-indigo-500/20 p-3 rounded-2xl">
                      <span className="text-[9px] font-black text-indigo-400 tracking-wider uppercase block">
                        🛰️ Sensores de Hardware (Simulación)
                      </span>

                      {/* GPS & Gyro Live Indicators */}
                      <div className="grid grid-cols-2 gap-1.5 font-mono text-[8px] bg-[#10171e]/90 p-2 rounded-xl text-gray-300">
                        <div>
                          <span className="text-gray-500 block uppercase font-bold text-[6.5px]">GPS Satelital</span>
                          <span className="text-cyan-400 font-bold block mt-0.5">Lat: {gpsCoords.lat.toFixed(5)}</span>
                          <span className="text-cyan-400 font-bold block">Lng: {gpsCoords.lng.toFixed(5)}</span>
                        </div>
                        <div className="border-l border-gray-800 pl-2">
                          <span className="text-gray-500 block uppercase font-bold text-[6.5px]">Acelerómetro</span>
                          <span className="text-emerald-400 font-bold block mt-0.5">X: {gyroForces.x > 0 ? `+${gyroForces.x}` : gyroForces.x}G</span>
                          <span className="text-emerald-400 font-bold block">Y: {gyroForces.y > 0 ? `+${gyroForces.y}` : gyroForces.y}G</span>
                        </div>
                      </div>

                      {/* Interactive Buttons */}
                      <div className="space-y-1.5 mt-2">
                        {/* Biometric Camera QR Scanner */}
                        <div>
                          <button
                            onClick={() => {
                              setCameraActive(!cameraActive);
                              setCameraScanned(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              cameraActive 
                                ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' 
                                : 'bg-slate-900/50 border-slate-800 text-gray-300 hover:bg-slate-900'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <Camera className="w-3 h-3 text-orange-500" />
                              Cámara Biométrica QR
                            </span>
                            <span className="text-[7px] font-mono px-1.5 bg-black/35 rounded-md text-gray-400">
                              {cameraActive ? 'Activo' : 'Escanear'}
                            </span>
                          </button>

                          {/* Scanner Simulated Viewfinder Overlay */}
                          {cameraActive && (
                            <div className="mt-1.5 bg-black/85 border border-orange-500/30 rounded-xl p-2 text-center relative overflow-hidden animate-miniFadeIn">
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />
                              
                              {/* Glowing Scan Bar */}
                              <div className="absolute left-0 top-0 w-full h-0.5 bg-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-scanUpDown pointer-events-none" />
                              
                              {cameraScanned ? (
                                <div className="p-3 text-center animate-fadeIn">
                                  <span className="text-[10px] text-emerald-400 font-bold">✓ QR VALIDADO POR IA</span>
                                  <span className="block text-[8px] text-gray-400 mt-1">ID Misión: #{activeDeliveryId || '1042'}</span>
                                  <span className="text-[7.5px] text-emerald-450 text-emerald-400 block uppercase tracking-tight mt-0.5">Firma: GUSTAVO BETTIOL</span>
                                </div>
                              ) : (
                                <div className="py-4 flex flex-col items-center justify-center space-y-2">
                                  {/* Mock QR box for scanning */}
                                  <div 
                                    onClick={() => {
                                      setCameraScanned(true);
                                      try {
                                        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                                        const osc = ctx.createOscillator();
                                        const g = ctx.createGain();
                                        osc.connect(g);
                                        g.connect(ctx.destination);
                                        osc.frequency.setValueAtTime(1000, ctx.currentTime);
                                        g.gain.setValueAtTime(0.03, ctx.currentTime);
                                        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
                                        osc.start();
                                        osc.stop(ctx.currentTime + 0.12);
                                      } catch (e) {}
                                      logEvent("[Cámara] QR biométrico escaneado con éxito. Firma digital estampada.", "success");
                                    }}
                                    className="w-12 h-12 bg-gray-900 border-2 border-indigo-400/40 p-1 rounded-lg cursor-pointer hover:border-emerald-400/80 transition-all flex flex-col justify-between items-center"
                                  >
                                    <div className="w-full flex justify-between">
                                      <span className="w-1.5 h-1.5 border-t border-l border-cyan-400"></span>
                                      <span className="w-1.5 h-1.5 border-t border-r border-cyan-400"></span>
                                    </div>
                                    <span className="text-[6px] font-mono text-cyan-400/70 text-center uppercase tracking-tighter leading-none select-none">Toque QR<br/>Scanner</span>
                                    <div className="w-full flex justify-between">
                                      <span className="w-1.5 h-1.5 border-b border-l border-cyan-400"></span>
                                      <span className="w-1.5 h-1.5 border-b border-r border-cyan-400"></span>
                                    </div>
                                  </div>
                                  <span className="text-[7px] text-gray-500 uppercase tracking-widest block animate-pulse">Buscando patrón QR...</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Acoustic Mic Dictation */}
                        <div>
                          <button
                            onClick={() => {
                              if (micRecording) return;
                              setMicRecording(true);
                              setMicResult('');
                              logEvent("[Acoustic Mic] Iniciando dictado por voz de dirección.", "info");
                              setTimeout(() => {
                                setMicRecording(false);
                                setMicResult("Entregar en P.B. depto B (Vincular a Gustavo Bettiol)");
                                logEvent("[Acoustic Mic] Transcripción completada: 'Entregar en P.B. depto B (Vincular a Gustavo Bettiol)'", "success");
                              }, 2000);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              micRecording 
                                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' 
                                : 'bg-slate-900/50 border-slate-800 text-gray-300 hover:bg-slate-900'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <Mic className="w-3 h-3 text-indigo-400" />
                              Dictar Nota de Voz
                            </span>
                            <span className="text-[7px] font-mono px-1.5 bg-black/35 rounded-md text-gray-400">
                              {micRecording ? 'Dictando...' : 'Grabar'}
                            </span>
                          </button>

                          {micRecording && (
                            <div className="mt-1.5 bg-black/50 border border-indigo-500/20 rounded-xl p-2 text-center">
                              <div className="flex justify-center items-center gap-1 py-1.5">
                                <span className="w-0.5 h-2 bg-indigo-500 rounded-full animate-bounce1"></span>
                                <span className="w-0.5 h-4 bg-indigo-500 rounded-full animate-bounce2"></span>
                                <span className="w-0.5 h-1 bg-indigo-500 rounded-full animate-bounce3"></span>
                                <span className="w-0.5 h-3 bg-indigo-400 rounded-full animate-bounce2"></span>
                                <span className="w-0.5 h-0.5 bg-indigo-500 rounded-full"></span>
                              </div>
                              <span className="text-[7px] text-gray-500 uppercase tracking-widest block">Escuchando audio...</span>
                            </div>
                          )}

                          {micResult && (
                            <div className="mt-1 bg-black/40 border border-indigo-950/40 rounded-xl p-2 text-[8px] text-gray-400 font-mono tracking-wide leading-tight">
                              <strong className="text-gray-300 block text-[7px] uppercase mb-0.5">Nota de voz transcrita:</strong>
                              "{micResult}"
                            </div>
                          )}
                        </div>

                        {/* Accelerometer Shake */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => {
                              setIsShaking(true);
                              logEvent("[Acelerómetro] Sacudida física manual de 1.5G detectada.", "warn");
                              triggerNotification("Acelerómetro GPS", "Alerón de velocidad recalibrado: 0.15s.");
                              setTimeout(() => setIsShaking(false), 500);
                            }}
                            className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 text-[8.5px] font-bold py-1.5 px-1 rounded-xl text-gray-300 uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Compass className="w-3 h-3 text-emerald-400" />
                            Sacudir G-Force
                          </button>

                          <button
                            onClick={() => {
                              triggerNotification("Entrega Gustavo Bettiol", "Su reparto de champú canino de $5.200 ARS ha salido de ruta.");
                            }}
                            className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 text-[8.5px] font-bold py-1.5 px-1 rounded-xl text-gray-300 uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <BellRing className="w-3 h-3 text-cyan-400" />
                            Probar Push Sound
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Logout button */}
                    <div className="mt-auto pt-4 border-t border-gray-800 shrink-0">
                      <button
                        onClick={() => {
                          setIsLoggedIn(false);
                          setPhoneScreen('login');
                          logEvent(`POST /api/auth/logout - Token cleared. Carlos disconnected.`, 'success');
                        }}
                        className="w-full bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 text-red-400 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Cerrar Sesión B2B
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Navigation dock bottom status bar */}
              {isLoggedIn && (
                <div className={`absolute bottom-0 inset-x-0 h-14 flex items-center justify-around text-center shrink-0 z-10 select-none ${
                  phoneTheme === 'dark' ? 'bg-[#151D25] border-t border-gray-900 text-gray-400' : 'bg-white border-t border-gray-100 text-gray-600'
                }`}>
                  <button
                    onClick={() => setPhoneScreen('home')}
                    className={`flex flex-col items-center gap-0.5 ${phoneScreen === 'home' ? 'text-blue-brand' : 'hover:text-white-brand'}`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="text-[8px] font-mono leading-none font-semibold">Home</span>
                  </button>

                  <button
                    onClick={() => setPhoneScreen('mapa')}
                    className={`flex flex-col items-center gap-0.5 ${phoneScreen === 'mapa' ? 'text-blue-brand' : 'hover:text-white-brand'}`}
                  >
                    <Map className="w-4 h-4" />
                    <span className="text-[8px] font-mono leading-none font-semibold">Map</span>
                  </button>

                  <button
                    onClick={() => setPhoneScreen('turnos')}
                    className={`flex flex-col items-center gap-0.5 ${phoneScreen === 'turnos' ? 'text-blue-brand' : 'hover:text-white-brand'}`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-[8px] font-mono leading-none font-semibold">Turnos</span>
                  </button>

                  <button
                    onClick={() => setPhoneScreen('pedidos')}
                    className={`flex flex-col items-center gap-0.5 ${phoneScreen === 'pedidos' ? 'text-blue-brand' : 'hover:text-white-brand'}`}
                  >
                    <Bike className="w-4 h-4" />
                    <span className="text-[8px] font-mono leading-none font-semibold">Pedidos</span>
                  </button>

                  <button
                    onClick={() => setPhoneScreen('billetera')}
                    className={`flex flex-col items-center gap-0.5 ${phoneScreen === 'billetera' ? 'text-blue-brand' : 'hover:text-white-brand'}`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="text-[8px] font-mono leading-none font-semibold">Billetera</span>
                  </button>
                </div>
              )}

            </div>

          </div>

        </section>
        )}

        {/* ================= RIGHT COLUMN: LIVE API EXPRESS LOGS & SOURCE CODE HUB (35% WIDTH) ================= */}
        {activeWorkspaceTab === 'consola' && (
          <section className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-100px)] pl-1">
          
          {/* Live scrolling REST API logger */}
          <div className="bg-[#151D25] rounded-2xl p-5 border border-gray-800 shadow-md flex flex-col h-[230px]">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h2 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="text-orange-500 w-4 h-4" />
                Express API Server Logs
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/20 text-orange-400 text-[10px] font-mono animate-pulse">
                • ONLINE
              </span>
            </div>

            {/* Logs Thread Viewport */}
            <div className="flex-1 overflow-y-auto bg-[#0A0F14] rounded-xl p-3.5 border border-gray-950 font-mono text-[10.5px] space-y-1.5 text-left">
              {consoleLogs.map((log) => (
                <div key={log.id} className="flex gap-2">
                  <span className="text-gray-500 select-none">[{log.time}]</span>
                  <span className={
                    log.type === 'success' ? 'text-emerald-400' :
                    log.type === 'error' ? 'text-red-400 font-bold' :
                    log.type === 'warn' ? 'text-yellow-400' : 'text-gray-300'
                  }>
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Source Code Explorer sidebar & Viewer */}
          <div className="bg-[#151D25] rounded-2xl p-5 border border-gray-800 shadow-md flex-1 flex flex-col min-h-[400px]">
            <h2 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-3 mb-4 shrink-0">
              <FileCode className="text-indigo-400 w-5 h-5" />
              Source Code Vault B2B
            </h2>

            {/* Folder Module Select Tab */}
            <div className="grid grid-cols-3 gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 mb-4 shrink-0">
              <button
                onClick={() => setActiveCodeModule('flutter')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeCodeModule === 'flutter' ? 'bg-[#FF6B35] text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                App Flutter
              </button>
              <button
                onClick={() => setActiveCodeModule('backend')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeCodeModule === 'backend' ? 'bg-[#FF6B35] text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Backend Express
              </button>
              <button
                onClick={() => setActiveCodeModule('sql')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeCodeModule === 'sql' ? 'bg-[#FF6B35] text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                database.sql
              </button>
            </div>

            {/* Code Explorer Files and Code Editor Frame combined */}
            <div className="flex-1 flex flex-col min-h-0 gap-3">
              
              {/* Files sidebar row */}
              {activeCodeModule !== 'sql' && (
                <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar shrink-0 text-xs text-left">
                  {activeCodeFilesList.map((file) => (
                    <button
                      key={file.name}
                      onClick={() => setSelectedCodeFile(file.name)}
                      className={`px-3 py-1.5 rounded-xl border font-mono transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                        selectedCodeFile === file.name
                          ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 font-bold'
                          : 'bg-[#1A2530] border-transparent text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      {file.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Code Editor */}
              <div className="flex-1 flex flex-col min-h-0 border border-gray-800 rounded-xl relative overflow-hidden bg-gray-950">
                <div className="bg-gray-900/80 px-4 py-2 border-b border-gray-800 flex justify-between items-center text-xs shrink-0 select-none">
                  <span className="font-mono text-gray-400">{activeFileContent.path}</span>
                  <button
                    onClick={() => copyToClipboard(activeFileContent.content)}
                    className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 font-bold px-2.5 py-1 rounded"
                  >
                    {copiedNotification ? '¡Copiado!' : 'Copiar Código'}
                  </button>
                </div>

                <div className="flex-1 p-4 overflow-auto font-mono text-[10.5px] leading-relaxed text-left">
                  <pre className="text-[#A5B4FC]">
                    <code>{activeFileContent.content}</code>
                  </pre>
                </div>

                <div className="bg-gray-900 px-4 py-2 border-t border-gray-850/80 text-[10.5px] leading-relaxed text-gray-400 shrink-0 select-none">
                  <span className="font-bold text-white block">Archivo: {activeFileContent.name}</span>
                  {activeFileContent.description}
                </div>
              </div>

            </div>
          </div>
        </section>
        )}

        {/* ================= PREMIUM WORKSPACE TARGET: FUTURISTIC SHOWCASE MOCKUPS ================= */}
        {activeWorkspaceTab === 'mockups' && (
          <div className="lg:col-span-12 w-full overflow-y-auto max-h-[calc(100vh-120px)] pr-1 text-left">
          </div>
        )}

      </main>
      )}

      {/* --- MODALS (CASHIER AND OTHER STUFFS) --- */}
      {cashierModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-fade-in text-left">
          <div className="bg-[#151D25] rounded-3xl border border-gray-800 p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Wallet className="text-orange-500" />
              {cashierModal === 'retiro' ? 'Retirar Saldo' : 'Cargar Fondos'}
            </h3>
            <p className="text-xs text-gray-400 leading-normal">
              {cashierModal === 'retiro'
                ? 'Simula transferir el saldo de tu billetera del reparto virtual (el cual representa tu 80% de ganancias netas) a tu cuenta bancaria.'
                : 'Simula cargar saldo B2B para fondear transacciones de prueba utilizando pasarelas virtuales.'}
            </p>

            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Monto en pesos ($)</label>
              <input
                type="number"
                value={walletAmountInput}
                onChange={(e) => setWalletAmountInput(e.target.value)}
                className="w-full bg-[#1A2530] border border-gray-850 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-orange-500 text-sm font-bold font-mono"
              />
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={() => setCashierModal(null)}
                className="flex-1 bg-transparent border border-gray-700 hover:bg-gray-800 text-gray-400 font-bold text-xs py-2 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCashierSubmit}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2 rounded-xl transition-all active:scale-95 shadow-md"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Corporate Watermark - Peluquería Canina Gustavo Bettiol */}
      <div className="fixed bottom-12 right-4 z-[9999] pointer-events-auto select-none scale-90 sm:scale-100 hover:scale-105 active:scale-95 transition-all">
        <div className="flex items-center gap-2.5 bg-[#030712]/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-indigo-500/45 text-white shadow-[0_8px_30px_rgba(99,102,241,0.25)]">
          <div className="flex flex-col text-right leading-none">
            <span className="text-[6.5px] text-indigo-400 uppercase tracking-widest font-black block mb-0.5">Peluquería Canina</span>
            <span className="text-[10px] font-black text-white tracking-tight font-sans block">
              Gustavo Bettiol
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-600 to-purple-600 flex items-center justify-center p-0.5 border border-cyan-400/45">
            {/* Paw SVG Icon */}
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-white" fill="currentColor">
              <path d="M12,14c-1.66,0-3,1.34-3,3s1.34,3,3,3s3-1.34,3-3S13.66,14,12,14z M12,9c0.83,0,1.5-0.67,1.5-1.5S12.83,6,12,6 S10.5,6.67,10.5,7.5S11.17,9,12,9z M5.5,12.5c0.83,0,1.5-0.67,1.5-1.5S6.33,9.5,5.5,9.5S4,10.17,4,11S4.67,12.5,5.5,12.5z M18.5,12.5 c0.83,0,1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5s-1.5,0.67-1.5,1.5S17.67,12.5,18.5,12.5z M7.75,8C8.44,8,9,7.44,9,6.75S8.44,5.5,7.75,5.5 S6.5,6.06,6.5,6.75S7.06,8,7.75,8z M16.25,8c0.69,0,1.25-0.56,1.25-1.25S16.94,5.5,16.25,5.5s-1.25,0.56-1.25,1.25S15.56,8,16.25,8z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* --- FOOTER LOGS --- */}
      <footer className="bg-[#151D25]/30 text-center py-3 border-t border-gray-850 shrink-0 text-gray-500 text-[10px] select-none">
        DeliveryPlus B2B Deliveries System • Sandbox Visual e interactivo 2026. Todas las licencias reservadas.
      </footer>
    </div>
  );
}
