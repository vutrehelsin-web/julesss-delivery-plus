import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Search, 
  ArrowUpRight, 
  Clock, 
  Sparkles, 
  CloudRain, 
  Sun, 
  Flame, 
  MapPin, 
  AlertCircle, 
  ArrowDownLeft, 
  DollarSign, 
  Briefcase, 
  Layers, 
  Repeat,
  Lock,
  Unlock,
  Globe,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

// Play a synthesized futuristic push alert sound chime via Web Audio API
const playLocalBeepChime = (type: 'success' | 'warning' | 'info') => {
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
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.3); // A5
      
      osc2.frequency.setValueAtTime(659.25, now); // E5
      osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3); // C6
      
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      
      osc1.start(now);
      osc2.start(now);
      
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } else if (type === 'warning') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(293.66, now + 0.25); // D4
      
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(554.37, now + 0.1); // C#5
      
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (err) {
    console.warn("Audio Context not supported or allowed yet.", err);
  }
};

// ================= COMPONENT 1: PERFORMANCE CHARTS =================
export const AdminChartsCard: React.FC = () => {
  const [chartMode, setChartMode] = useState<'ingresos' | 'ordenes'>('ingresos');
  const [selectedBar, setSelectedBar] = useState<number | null>(null);

  const monthsData = [
    { name: 'Ene', ingresos: 145000, ordenes: 52 },
    { name: 'Feb', ingresos: 189000, ordenes: 68 },
    { name: 'Mar', ingresos: 264000, ordenes: 85 },
    { name: 'Abr', ingresos: 328000, ordenes: 94 },
    { name: 'May', ingresos: 410000, ordenes: 112 },
    { name: 'Jun', ingresos: 582900, ordenes: 142 }
  ];

  const totalIngresos = monthsData.reduce((acc, m) => acc + m.ingresos, 0);
  const totalOrdenes = monthsData.reduce((acc, m) => acc + m.ordenes, 0);

  return (
    <div className="bg-gradient-to-b from-[#0b0d19] to-[#04050a] border border-purple-500/15 p-5 rounded-2xl relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-[60px] pointer-events-none" />
      
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-800/80 pb-3 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400 animate-pulse" />
          <span className="text-sm font-extrabold text-white uppercase tracking-wider font-sans">Métricas de Crecimiento Comercial</span>
        </div>
        
        {/* Toggle controls */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-gray-800 self-end">
          <button
            onClick={() => { setChartMode('ingresos'); setSelectedBar(null); }}
            className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${chartMode === 'ingresos' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-gray-400 hover:text-white'}`}
          >
            💰 Ingresos
          </button>
          <button
            onClick={() => { setChartMode('ordenes'); setSelectedBar(null); }}
            className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${chartMode === 'ordenes' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-gray-400 hover:text-white'}`}
          >
            📦 Órdenes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-[#05060F] p-3 rounded-xl border border-gray-800/50">
          <span className="text-gray-500 text-[9px] block uppercase tracking-wider font-bold">Total Acumulado</span>
          <span className="text-md font-extrabold text-[#00f0ff] block mt-0.5">
            {chartMode === 'ingresos' 
              ? `$${totalIngresos.toLocaleString()}` 
              : `${totalOrdenes} órdenes`
            }
          </span>
        </div>
        <div className="bg-[#05060F] p-3 rounded-xl border border-gray-800/50">
          <span className="text-gray-500 text-[9px] block uppercase tracking-wider font-bold">Promedio Mensual</span>
          <span className="text-md font-extrabold text-white block mt-0.5">
            {chartMode === 'ingresos'
              ? `$${Math.round(totalIngresos / monthsData.length).toLocaleString()}`
              : `${Math.round(totalOrdenes / monthsData.length)} órdenes`
            }
          </span>
        </div>
        <div className="bg-[#05060F] p-3 rounded-xl border border-gray-800/50">
          <span className="text-gray-500 text-[9px] block uppercase tracking-wider font-bold">Mes Pico</span>
          <span className="text-md font-extrabold text-purple-400 block mt-0.5">Junio (Pico)</span>
        </div>
        <div className="bg-[#05060F] p-3 rounded-xl border border-gray-800/50">
          <span className="text-gray-500 text-[9px] block uppercase tracking-wider font-bold">Tasa de Conversión</span>
          <span className="text-sm font-black text-emerald-400 block mt-1">98.2% (Óptimo)</span>
        </div>
      </div>

      {/* SVG Neon Chart Frame */}
      <div className="relative bg-[#05060F]/60 border border-gray-850 p-4 rounded-xl shadow-inner mb-2 select-none h-56 flex flex-col justify-end">
        {chartMode === 'ingresos' ? (
          /* BAR CHART: Ingresos Mensuales */
          <div className="w-full h-full flex items-end justify-between px-4 pb-2 relative z-10 pt-4">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-6 pointer-events-none opacity-10">
              <div className="w-full h-[1px] bg-cyan-400" />
              <div className="w-full h-[1px] bg-cyan-400" />
              <div className="w-full h-[1px] bg-cyan-400" />
              <div className="w-full h-[1px] bg-cyan-400" />
            </div>

            {monthsData.map((m, idx) => {
              const maxVal = Math.max(...monthsData.map(item => item.ingresos));
              const heightPercent = `${Math.round((m.ingresos / maxVal) * 80)}%`;
              return (
                <div 
                  key={idx} 
                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative"
                  onClick={() => setSelectedBar(idx)}
                >
                  {/* Neon active indicator tooltip on bar hover/activation */}
                  {selectedBar === idx && (
                    <div className="absolute bottom-[90%] bg-slate-900 border border-cyan-400/50 p-2 rounded-xl text-center leading-tight z-30 shadow-[0_0_15px_rgba(0,240,255,0.4)] max-w-[120px] pointer-events-none">
                      <span className="text-[7.5px] text-gray-400 block uppercase font-bold tracking-wider">{m.name} 2026</span>
                      <strong className="text-[10px] text-[#00f0ff] block mt-0.5">${m.ingresos.toLocaleString()}</strong>
                      <span className="text-[7px] text-gray-500 block">+{Math.round((m.ingresos / 145000 - 1) * 100)}% Gt</span>
                    </div>
                  )}

                  {/* Bar block with gradient */}
                  <div 
                    className={`w-10 sm:w-12 rounded-t-lg transition-all duration-300 relative ${
                      selectedBar === idx
                        ? 'bg-gradient-to-t from-purple-600 via-cyan-400 to-[#00f0ff] shadow-[0_0_18px_rgba(0,240,255,0.5)] scale-105'
                        : 'bg-gradient-to-t from-purple-800/40 to-cyan-500/40 hover:to-cyan-405 hover:bg-gradient-to-t hover:from-purple-800/80 hover:to-cyan-400/80 hover:shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                    }`}
                    style={{ height: heightPercent }}
                  />

                  {/* Month Label */}
                  <span className={`text-[10px] uppercase font-bold font-mono ${selectedBar === idx ? 'text-cyan-300' : 'text-gray-500 group-hover:text-gray-300'}`}>
                    {m.name}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* SPLINE CHART: Órdenes Completadas */
          <div className="w-full h-full flex flex-col justify-between p-2 relative z-10 pt-4">
            {/* Grid Line lines background for graph */}
            <div className="absolute inset-0 flex flex-col justify-between py-6 pointer-events-none opacity-10">
              <div className="w-full h-[1px] bg-purple-400" />
              <div className="w-full h-[1px] bg-purple-400" />
              <div className="w-full h-[1px] bg-purple-400" />
              <div className="w-full h-[1px] bg-purple-400" />
            </div>

            {/* Glowing spline mockup */}
            <div className="relative w-full h-[140px] flex items-end">
              <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="splineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#a200ff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#a200ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Under Fill gradient */}
                <path 
                  d="M 10 90 Q 80 80 150 55 T 290 35 T 390 15 L 390 120 L 10 120 Z" 
                  fill="url(#splineGrad)" 
                />
                {/* Main line Spline path */}
                <path 
                  d="M 10 90 Q 80 80 150 55 T 290 35 T 390 15" 
                  fill="none" 
                  stroke="#a200ff" 
                  strokeWidth="3.5" 
                  className="drop-shadow-[0_0_8px_#a200ff]"
                />
                
                {/* Node Points on Spline */}
                {[
                  { x: 10, y: 90, name: 'Ene', val: 52 },
                  { x: 80, y: 80, name: 'Feb', val: 68 },
                  { x: 150, y: 55, name: 'Mar', val: 85 },
                  { x: 230, y: 44, name: 'Abr', val: 94 },
                  { x: 310, y: 32, name: 'May', val: 112 },
                  { x: 390, y: 15, name: 'Jun', val: 142 }
                ].map((pt, idx) => (
                  <g key={idx} className="cursor-pointer group" onClick={() => setSelectedBar(idx)}>
                    <circle 
                      cx={pt.x} 
                      cy={pt.y} 
                      r={selectedBar === idx ? "6.5" : "4.5"} 
                      fill={selectedBar === idx ? "#00f0ff" : "#a200ff"} 
                      stroke="#FFFFFF" 
                      strokeWidth="1.5"
                    />
                  </g>
                ))}
              </svg>

              {/* Tooltip Overlay */}
              {selectedBar !== null && (
                <div className="absolute top-[5%] left-1/2 -translate-x-1/2 bg-slate-900 border border-purple-500/50 p-2.5 rounded-xl text-center leading-tight shadow-[0_0_15px_rgba(162,0,255,0.4)] z-40">
                  <span className="text-[7.5px] text-gray-400 block uppercase font-bold tracking-wider">{monthsData[selectedBar]?.name} 2026</span>
                  <strong className="text-[10px] text-purple-300 block mt-0.5">{monthsData[selectedBar]?.ordenes} órdenes completadas</strong>
                  <span className="text-[7px] text-[#00f0ff] block font-mono">Eficiencia del 99.1%</span>
                </div>
              )}
            </div>

            {/* Labels under spline */}
            <div className="flex justify-between px-2 pt-2 border-t border-gray-800/40 select-none">
              {monthsData.map((m, idx) => (
                <span key={idx} className={`text-[10px] font-bold font-mono tracking-wider ${selectedBar === idx ? 'text-purple-300' : 'text-gray-500'}`}>
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <p className="text-[9.5px] text-gray-500 font-semibold tracking-wide uppercase text-right leading-none pr-1 mt-1">
        Pulse sobre cualquier indicador mensual para explorar datos específicos.
      </p>
    </div>
  );
};

// ================= COMPONENT 2: MERCADOPAGO WALLET =================
interface WalletProps {
  adminMpSaldo: number;
  setAdminMpSaldo: React.Dispatch<React.SetStateAction<number>>;
  mpHistorial: { id: number; tipo: 'ingreso' | 'retiro' | 'transferencia'; desc: string; monto: number; fecha: string }[];
  setMpHistorial: React.Dispatch<React.SetStateAction<{ id: number; tipo: 'ingreso' | 'retiro' | 'transferencia'; desc: string; monto: number; fecha: string }[]>>;
  triggerNotification: (title: string, body: string) => void;
}

export const MPWalletCard: React.FC<WalletProps> = ({
  adminMpSaldo,
  setAdminMpSaldo,
  mpHistorial,
  setMpHistorial,
  triggerNotification
}) => {
  const [activeAction, setActiveAction] = useState<'none' | 'ingresar' | 'retirar' | 'transferir'>('none');
  const [amountInput, setAmountInput] = useState<string>('25000');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // OAuth Linked State
  const [isMpLinked, setIsMpLinked] = useState<boolean>(false);
  const [showOauthModal, setShowOauthModal] = useState<boolean>(false);
  const [oauthStep, setOauthStep] = useState<'idle' | 'login' | 'authorizing' | 'success'>('idle');
  const [oauthPassword, setOauthPassword] = useState<string>('betiol-repartos-2026');

  // Launch OAuth simulation
  const handleStartOauth = () => {
    setOauthStep('login');
    setShowOauthModal(true);
    playLocalBeepChime('info');
  };

  const handleConfirmOauth = () => {
    setOauthStep('authorizing');
    playLocalBeepChime('info');
    
    // Simulate multi-step handshake latency
    setTimeout(() => {
      setOauthStep('success');
      playLocalBeepChime('success');
      
      setTimeout(() => {
        setIsMpLinked(true);
        setShowOauthModal(false);
        setOauthStep('idle');
        setAdminMpSaldo(450000); // Initial synchronized personal balance
        
        // Add audit history
        const newMove = {
          id: mpHistorial.length + 1,
          tipo: 'ingreso' as const,
          desc: 'Conexión OAuth Segura Mercado Pago Autorizada',
          monto: 0,
          fecha: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
        setMpHistorial(prev => [newMove, ...prev]);
        triggerNotification("Mercado Pago", "Cuenta vinculada con éxito vía OAuth de Administrador.");
      }, 1500);
    }, 2000);
  };

  const handleConfirmAction = () => {
    const rawVal = parseInt(amountInput, 10);
    if (isNaN(rawVal) || rawVal <= 0) {
      alert("Por favor ingrese un monto válido.");
      return;
    }

    const todayStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    if (activeAction === 'ingresar') {
      setAdminMpSaldo(prev => prev + rawVal);
      const newId = mpHistorial.length + 1;
      const newMove = {
        id: newId,
        tipo: 'ingreso' as const,
        desc: 'Carga de fondos autorizada por Admin',
        monto: rawVal,
        fecha: todayStr
      };
      setMpHistorial(prev => [newMove, ...prev]);
      playLocalBeepChime('success');
      triggerNotification("Mercado Pago", `Ingreso de $${rawVal.toLocaleString()} ARS procesado correctamente.`);
    } else if (activeAction === 'retirar') {
      if (rawVal > adminMpSaldo) {
        playLocalBeepChime('warning');
        alert("Fondos insuficientes en Mercado Pago para retirar esta suma.");
        return;
      }
      setAdminMpSaldo(prev => prev - rawVal);
      const newId = mpHistorial.length + 1;
      const newMove = {
        id: newId,
        tipo: 'retiro' as const,
        desc: 'Retiro inmediato a CBU Personal',
        monto: rawVal,
        fecha: todayStr
      };
      setMpHistorial(prev => [newMove, ...prev]);
      playLocalBeepChime('success');
      triggerNotification("Mercado Pago", `Egreso de $${rawVal.toLocaleString()} ARS procesado correctamente.`);
    } else if (activeAction === 'transferir') {
      if (rawVal > adminMpSaldo) {
        playLocalBeepChime('warning');
        alert("Fondos insuficientes en Mercado Pago para transferir esta suma.");
        return;
      }
      setAdminMpSaldo(prev => prev - rawVal);
      const newId = mpHistorial.length + 1;
      const newMove = {
        id: newId,
        tipo: 'transferencia' as const,
        desc: 'Giro programado a Cooperativa Logística',
        monto: rawVal,
        fecha: todayStr
      };
      setMpHistorial(prev => [newMove, ...prev]);
      playLocalBeepChime('success');
      triggerNotification("Mercado Pago", `Transferencia de $${rawVal.toLocaleString()} ARS enviada.`);
    }

    setAmountInput('25000');
    setActiveAction('none');
  };

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return mpHistorial;
    return mpHistorial.filter(m => 
      m.desc.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.tipo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mpHistorial, searchQuery]);

  return (
    <div className="bg-gradient-to-b from-[#111720] to-[#090d14] border border-purple-500/15 p-5 rounded-2xl relative shadow-xl text-left overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-[60px] pointer-events-none" />
      
      {/* Wallet Header */}
      <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center justify-between border-b border-gray-800 pb-2.5 mb-3.5">
        <span className="flex items-center gap-1.5 font-sans">
          <DollarSign className="w-4 h-4 text-purple-400" />
          Billetera Mercado Pago
        </span>
        <span className="text-[10px] text-purple-400 font-mono tracking-wide font-normal flex items-center gap-1">
          {isMpLinked ? (
            <>
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              SINC  ACTIVA
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-rose-500" />
              CONECTAR
            </>
          )}
        </span>
      </h3>

      {/* Conditional Linked State View */}
      {!isMpLinked ? (
        <div className="bg-[#05060F]/60 border border-dashed border-purple-500/20 p-5 rounded-xl text-center space-y-4 relative z-10 my-1">
          <div className="w-11 h-11 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto border border-purple-500/20">
            <Lock className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h4 className="text-white text-xs font-bold leading-tight uppercase">Vinculación de Billetera Requerida</h4>
            <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
              Consolide el saldo y administre transferencias nacionales vinculando su cuenta personal de Mercado Pago de forma segura mediante OAuth.
            </p>
          </div>
          <button
            onClick={handleStartOauth}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-extrabold text-xs py-2 px-4 rounded-xl transition-all shadow-[0_4px_12px_rgba(168,85,247,0.3)] active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            Conectar Mercado Pago
          </button>
        </div>
      ) : (
        <>
          {/* Styled Central Balance Card with Mercado Pago aesthetic */}
          <div className="bg-gradient-to-r from-indigo-900/40 via-purple-950/40 to-indigo-900/40 border border-purple-500/25 p-4 rounded-xl text-left bg-black/40 relative overflow-hidden mb-4 animate-fade-in">
            <div className="absolute -right-2 top-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <div>
                <span className="text-gray-400 text-[9.5px] uppercase font-bold tracking-wider leading-none block">Saldo disponible</span>
                <span className="text-2xl font-black text-white block mt-1.5 font-sans">
                  {adminMpSaldo.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}
                </span>
                <span className="text-[8.5px] text-emerald-400 font-mono block mt-1 leading-relaxed flex items-center gap-1 font-bold">
                  ● Sincronizado: sperdutialberto9@gmail.com
                </span>
              </div>
              <button 
                onClick={() => { setIsMpLinked(false); playLocalBeepChime('warning'); }} 
                className="text-[8.5px] bg-red-600/10 border border-red-650/20 text-red-400 px-2 py-0.5 rounded-lg hover:bg-red-600/20"
              >
                Desconectar
              </button>
            </div>
          </div>

          {/* Fast Interactive Actions Row */}
          <div className="grid grid-cols-3 gap-2 mb-4 animate-fadeIn">
            <button
              onClick={() => { setActiveAction(activeAction === 'ingresar' ? 'none' : 'ingresar'); playLocalBeepChime('info'); }}
              className={`py-1.5 px-1.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none text-center border ${
                activeAction === 'ingresar' 
                  ? 'bg-[#00f0ff]/10 border-[#00f0ff]/40 text-[#00f0ff]' 
                  : 'bg-slate-900 hover:bg-slate-900/80 border-gray-800 text-gray-300'
              }`}
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Ingresar</span>
            </button>
            <button
              onClick={() => { setActiveAction(activeAction === 'retirar' ? 'none' : 'retirar'); playLocalBeepChime('info'); }}
              className={`py-1.5 px-1.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none text-center border ${
                activeAction === 'retirar' 
                  ? 'bg-purple-600/20 border-purple-500/40 text-purple-300' 
                  : 'bg-slate-900 hover:bg-slate-900/80 border-gray-800 text-gray-300'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 shrink-0" />
              <span>Retirar</span>
            </button>
            <button
              onClick={() => { setActiveAction(activeAction === 'transferir' ? 'none' : 'transferir'); playLocalBeepChime('info'); }}
              className={`py-1.5 px-1.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none text-center border ${
                activeAction === 'transferir' 
                  ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' 
                  : 'bg-slate-900 hover:bg-slate-900/80 border-gray-800 text-gray-300'
              }`}
            >
              <Repeat className="w-4 h-4 shrink-0" />
              <span>Transferir</span>
            </button>
          </div>

          {/* Embedded Drawer Input Flow inside Card */}
          {activeAction !== 'none' && (
            <div className="bg-[#05060F] border border-gray-800 rounded-xl p-3.5 mb-4 space-y-3.5 animate-fadeIn">
              <div className="flex justify-between items-center pb-1">
                <span className="text-[10px] text-[#00f0ff] uppercase tracking-wider font-extrabold">
                  💵 {activeAction === 'ingresar' && "CONFIGURAR INGRESO"}
                  {activeAction === 'retirar' && "CONFIGURAR RETIRO AUTOMÁTICO"}
                  {activeAction === 'transferir' && "CONFIGURAR GIRO DIRECTO"}
                </span>
                <button 
                  onClick={() => setActiveAction('none')}
                  className="text-gray-500 hover:text-white text-[10px] font-mono leading-none font-bold"
                >
                  Cancelar
                </button>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-black block mb-1">Monto de Operación ($ ARS)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-gray-800 text-white rounded-xl py-2 px-3 pl-7 text-xs outline-none focus:border-cyan-400 font-mono"
                      placeholder="25000"
                    />
                    <span className="absolute left-3 top-2.5 text-[11px] text-gray-500 font-bold">$</span>
                  </div>
                </div>

                {/* Quick buttons helper */}
                <div className="flex gap-1.5 py-1 text-[9px] font-mono">
                  {['10000', '25000', '50000', '100000'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAmountInput(v)}
                      className={`bg-slate-900 hover:bg-slate-800 py-1 px-2 border border-gray-850 rounded text-gray-300 font-black cursor-pointer ${amountInput === v ? 'border-purple-500 text-white font-extrabold bg-purple-950/20' : ''}`}
                    >
                      ${parseInt(v).toLocaleString()}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleConfirmAction}
                  className="w-full bg-gradient-to-r from-purple-500 to-[#00f0ff] text-white py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_2px_10px_rgba(162,0,255,0.25)] cursor-pointer"
                >
                  Confirmar Operación
                </button>
              </div>
            </div>
          )}

          {/* Movements history section with custom search filter */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-sans">Historial de Movimientos</span>
              <div className="relative">
                <Search className="absolute left-2.5 top-1.5 w-3 h-3 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar movimiento..."
                  className="bg-slate-900 border border-gray-800 text-white rounded-lg pl-7 pr-2 py-0.5 text-[9.5px] outline-none focus:border-purple-400 w-full sm:w-36"
                />
              </div>
            </div>

            {/* Scroll list */}
            <div className="space-y-2 overflow-y-auto max-h-[178px] pr-0.5 scrollbar-none select-none">
              {filteredHistory.map((move) => (
                <div key={move.id} className="bg-[#0b0c16]/50 border border-gray-850 p-2.5 rounded-xl transition-all hover:bg-[#121326]/40 flex justify-between items-center text-left">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      move.tipo === 'ingreso' 
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                        : move.tipo === 'retiro'
                          ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                          : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                    }`}>
                      {move.tipo === 'ingreso' && <Plus className="w-3.5 h-3.5" />}
                      {move.tipo === 'retiro' && <ArrowDownLeft className="w-3.5 h-3.5" />}
                      {move.tipo === 'transferencia' && <Repeat className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0 text-[10px]">
                      <h4 className="font-extrabold text-white truncate max-w-[160px] leading-tight" title={move.desc}>{move.desc}</h4>
                      <span className="text-[8px] text-gray-500 font-mono">{move.fecha}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-[10.5px] font-extrabold font-mono ${
                      move.tipo === 'ingreso' ? 'text-emerald-400' : 'text-gray-300'
                    }`}>
                      {move.tipo === 'ingreso' ? '+' : '-'}${move.monto.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              ))}

              {filteredHistory.length === 0 && (
                <div className="text-center py-6 text-[10.5px] text-gray-500">
                  No se hallaron movimientos coincidentes.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Mercado Pago OAuth Login Modal */}
      {showOauthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans text-left">
          <div className="bg-[#0A1020] rounded-3xl border border-blue-500/30 p-6 max-w-sm w-full space-y-5 shadow-[0_0_50px_rgba(59,130,246,0.3)] select-none">
            
            {/* Modal header with brand */}
            <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black text-white text-base">
                MP
              </div>
              <div>
                <h4 className="text-white text-sm font-black uppercase font-display leading-tight">Mercado Pago Connect</h4>
                <span className="text-[9.5px] text-blue-400 uppercase font-mono font-bold">Autorización de Terceros (OAuth)</span>
              </div>
            </div>

            {/* Steps Rendering */}
            {oauthStep === 'login' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-300 leading-normal">
                  La aplicación <strong>Delivery Plus</strong> solicita permiso permanente para leer el saldo, registrar ingresos y automatizar retiros inmediatos.
                </p>

                <div className="space-y-2.5 bg-black/40 p-3.5 rounded-xl border border-gray-850 text-xs">
                  <div>
                    <span className="text-[8.5px] text-gray-500 uppercase font-bold block mb-0.5">Correo del Administrador</span>
                    <strong className="text-white">sperdutialberto9@gmail.com</strong>
                  </div>
                  <div>
                    <span className="text-[8.5px] text-gray-500 uppercase font-bold block mb-1">Clave de Integración</span>
                    <input
                      type="password"
                      value={oauthPassword}
                      onChange={(e) => setOauthPassword(e.target.value)}
                      className="w-full bg-[#151D25] border border-gray-800 text-white rounded-lg py-1 px-2 font-mono text-xs focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => { setShowOauthModal(false); setOauthStep('idle'); }}
                    className="flex-1 bg-transparent border border-gray-800 hover:bg-gray-900 text-gray-400 py-2.5 rounded-xl text-xs font-bold font-sans cursor-pointer text-center"
                  >
                    Denegar
                  </button>
                  <button
                    onClick={handleConfirmOauth}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center"
                  >
                    Autorizar Acceso
                  </button>
                </div>
              </div>
            )}

            {oauthStep === 'authorizing' && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 border-t-4 border-t-blue-500 animate-spin" />
                  <Lock className="w-5 h-5 text-blue-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">Verificando credenciales Secure API...</span>
                  <span className="text-[9.5px] text-gray-500 block mt-0.5">Sincronizando sesión en Mercado Pago Argentina...</span>
                </div>
              </div>
            )}

            {oauthStep === 'success' && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-white uppercase tracking-widest block">¡CONEXIÓN EXITOSA!</span>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-[220px]">
                    Access Token persistido de manera correcta con alcance de liquidador automático. Redirigiendo...
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

// ================= COMPONENT 3: IA RECOMMENDS LOGISITICS RECOMMENDER =================
interface IAProps {
  temperature: number;
  weatherCondition: string;
  multiplier: number;
  setMultiplier: React.Dispatch<React.SetStateAction<number>>;
  triggerNotification: (title: string, body: string) => void;
}

interface GeminiRecommendation {
  recommendations: string[];
  multiplier: number;
  behaviorAnalysis: string;
  heading: string;
  isSimulation?: boolean;
}

export const IARecommendsCard: React.FC<IAProps> = ({
  temperature,
  weatherCondition,
  multiplier,
  setMultiplier,
  triggerNotification
}) => {
  const [simulationContext, setSimulationContext] = useState<'normal' | 'lluvia' | 'alto' | 'live'>('live');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [geminiResult, setGeminiResult] = useState<GeminiRecommendation | null>(null);

  // Custom parameters to make live queries even more rich!
  const [customBehavior, setCustomBehavior] = useState<string>('Búsqueda nocturna activa, pedidos rápidos y dispersos');
  const [customHistory, setCustomHistory] = useState<string>('Usuarios recurrentes de fin de semana con predilección por promos');

  // Trigger real-time Gemini recommendations from backend /api/gemini/recommend
  const fetchLiveGeminiRecommendation = async (weatherOverride?: string) => {
    setIsLoading(true);
    playLocalBeepChime('info');
    try {
      const activeWeather = weatherOverride || weatherCondition;
      const response = await fetch("/api/gemini/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          weather: activeWeather,
          behavior: customBehavior,
          historyState: customHistory
        })
      });

      if (!response.ok) {
        throw new Error("API Route failure");
      }

      const data: GeminiRecommendation = await response.json();
      setGeminiResult(data);
      setSimulationContext('live');
    } catch (err) {
      console.error("Gemini live request failed. Serving smart visual fail-safe.", err);
      // Fail-safe mock matching layout
      setGeminiResult({
        recommendations: [
          `⚠️ Clima ${weatherCondition.toUpperCase()} detectado: Ofrecer promociones de platos templados o sopas rápidas con 15% de descuento.`,
          "Sugerencia VIP: Disparar alerta flotante notificando recarga por alta demanda para Riders de guardia.",
          "Giro: Reservar un clúster de 8 repartidores fijos en el nodo Palermo Soho."
        ],
        multiplier: weatherCondition === 'tormenta' ? 1.5 : (weatherCondition === 'lluvia' ? 1.3 : 1.1),
        behaviorAnalysis: "Análisis offline: Se nota un incremento estacional por clima nocturno fresco.",
        heading: "IA Sugerencia Meteorológica",
        isSimulation: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial call when component is fully ready
  useEffect(() => {
    fetchLiveGeminiRecommendation();
  }, [weatherCondition]);

  const handleApplyPolicy = (mult: number, desc: string) => {
    setMultiplier(mult);
    playLocalBeepChime('success');
    triggerNotification("IA Recomendación Aplicada", `Nuevo multiplicador regional: ${mult}x. Repartidores alertados.`);
  };

  return (
    <div className="bg-gradient-to-b from-[#111720] to-[#090d14] border border-cyan-500/15 p-5 rounded-2xl relative shadow-xl text-left">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/5 rounded-full blur-[60px] pointer-events-none" />
      
      {/* Title */}
      <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center justify-between border-b border-gray-800 pb-2.5 mb-3.5">
        <span className="flex items-center gap-1.5 font-sans">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          IA Control de Logística
        </span>
        <span className="text-[10px] text-cyan-400 font-mono tracking-wider animate-pulse flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 animate-spin" />
          GEMINI LIVE
        </span>
      </h3>

      <div className="space-y-4">
        <p className="text-[11px] text-gray-400 leading-normal">
          El módulo de IA extrae variables climatológicas de sensores físicos y analiza el historial semanal de pedidos vía API de Gemini para sugerir multiplicadores y despachos.
        </p>

        {/* Custom Input controls for live prompt refinement */}
        <div className="bg-black/40 border border-gray-850 p-3 rounded-xl space-y-2 text-[10px]">
          <span className="text-[8px] font-mono font-black text-cyan-400 block uppercase tracking-widest">⚙️ Refinar Variables del Modelo cognoscitivo</span>
          
          <div>
            <label className="text-gray-500 font-bold block mb-0.5">Comportamiento del Usuario</label>
            <input
              type="text"
              value={customBehavior}
              onChange={(e) => setCustomBehavior(e.target.value)}
              className="w-full bg-[#131922] border border-gray-800 rounded-lg p-1.5 text-white text-[9.5px] outline-none focus:border-cyan-400"
              placeholder="Ej: usuarios buscando promos de hamburguesas"
            />
          </div>

          <div>
            <label className="text-gray-500 font-bold block mb-0.5">Historial / Preferencias de Red</label>
            <input
              type="text"
              value={customHistory}
              onChange={(e) => setCustomHistory(e.target.value)}
              className="w-full bg-[#131922] border border-gray-800 rounded-lg p-1.5 text-white text-[9.5px] outline-none focus:border-cyan-400"
              placeholder="Ej: recurrencia alta de envíos nocturnos"
            />
          </div>

          <div className="flex justify-end pt-1 bg-transparent">
            <button
              onClick={() => fetchLiveGeminiRecommendation()}
              disabled={isLoading}
              className="bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 font-extrabold py-1 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50 text-[9px] uppercase tracking-wider"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  Preguntar a Gemini
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Selector simulation (Normal, Lluvia, Pico, o Gemini Live) */}
        <div className="grid grid-cols-4 gap-1 select-none text-center">
          {['normal', 'lluvia', 'alto', 'live'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                if (tab === 'live') {
                  setSimulationContext('live');
                  if (!geminiResult) fetchLiveGeminiRecommendation();
                } else {
                  setSimulationContext(tab as any);
                }
                playLocalBeepChime('info');
              }}
              className={`py-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                simulationContext === tab 
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 font-extrabold' 
                  : 'bg-slate-900 border-transparent text-gray-500'
              }`}
            >
              {tab === 'normal' && '☀️ Normal'}
              {tab === 'lluvia' && '⛈️ Lluvia'}
              {tab === 'alto' && '🔥 Pico'}
              {tab === 'live' && '✨ Gemini'}
            </button>
          ))}
        </div>

        {/* Detailed recommendations display */}
        <div className="space-y-3 min-h-[140px] flex flex-col justify-center">
          
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 bg-[#05060F]/40 border border-gray-850 rounded-xl">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400/25 border-t-2 border-t-cyan-400 animate-spin" />
              <span className="text-[10px] text-cyan-400 font-mono animate-pulse uppercase tracking-wider">
                Llamando a Gemini 3.5 Flash...
              </span>
            </div>
          ) : (
            <>
              {simulationContext === 'live' && geminiResult && (
                <div className="bg-[#0A101C]/60 border border-cyan-500/25 p-3.5 rounded-xl space-y-3 animate-fadeIn text-xs">
                  
                  {/* Model header */}
                  <div className="flex justify-between items-center border-b border-cyan-950 pb-1.5">
                    <span className="text-[8px] font-mono text-cyan-400 uppercase font-black tracking-widest flex items-center gap-1">
                      🛰️ {geminiResult.heading || "Análisis de Red"}
                    </span>
                    <span className="text-[7.5px] bg-cyan-500/15 text-cyan-400 px-1.5 py-0.5 rounded font-bold uppercase">
                      {geminiResult.isSimulation ? 'Local Cache' : 'Gemini 3.5 API'}
                    </span>
                  </div>

                  {/* Recommendations core list */}
                  <div className="space-y-2">
                    {geminiResult.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex gap-2 items-start text-[10px] text-gray-300 leading-relaxed font-sans">
                        <span className="text-cyan-400 mt-0.5 shrink-0 font-bold select-none">•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>

                  {/* Behavior Analysis summary */}
                  {geminiResult.behaviorAnalysis && (
                    <div className="border-t border-cyan-950/40 pt-2 text-[9px] text-gray-400 leading-normal font-mono bg-black/10 p-2 rounded-lg">
                      <strong className="text-gray-200 block mb-0.5 uppercase tracking-wider">Análisis cognitivo de comportamiento:</strong>
                      {geminiResult.behaviorAnalysis}
                    </div>
                  )}

                  {/* Fast action to trigger policy update */}
                  <div className="flex justify-between items-center pt-1 bg-transparent">
                    <div className="text-[9.5px] text-gray-400 font-mono">
                      Multiplicador sugerido: <strong className="text-purple-400 font-extrabold">{geminiResult.multiplier}x</strong>
                    </div>
                    <button
                      onClick={() => handleApplyPolicy(geminiResult.multiplier, "Fijado por IA Gemini")}
                      className="bg-gradient-to-r from-cyan-400 to-indigo-500 text-white font-extrabold py-1 px-3 rounded-lg text-[9px] uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Aplicar {geminiResult.multiplier}x
                    </button>
                  </div>

                </div>
              )}

              {simulationContext === 'normal' && (
                <div className="bg-[#05060F]/60 border border-gray-850 p-3.5 rounded-xl block text-xs animate-fadeIn space-y-2">
                  <span className="text-[7.5px] text-emerald-400 font-black uppercase tracking-widest block">☀️ Finanzas B2B</span>
                  <h4 className="text-[10.5px] font-black text-white leading-tight">Optimización Tarifaria Base lógicas</h4>
                  <p className="text-[9px] text-gray-400 mt-1 leading-relaxed">Condiciones estándar a nivel nacional. Se sugiere mantener el multiplicador base a 1.0x para incentivar consumo gastronómico.</p>
                  <button 
                    onClick={() => handleApplyPolicy(1.0, "Multiplicador normal")}
                    className="mt-2.5 bg-slate-900 hover:bg-slate-800 text-[8.5px] text-emerald-400 font-extrabold px-3 py-1 rounded-lg border border-emerald-500/25 uppercase transition-colors pointer-events-auto cursor-pointer"
                  >
                    Aplicar Multiplicador 1.0x
                  </button>
                </div>
              )}

              {simulationContext === 'lluvia' && (
                <div className="bg-[#1D252E]/40 border border-[#00f0ff]/20 p-3.5 rounded-xl block text-xs animate-fadeIn space-y-2">
                  <span className="text-[7.5px] text-[#00f0ff] font-black uppercase tracking-widest block">⛈️ Clima Crítico</span>
                  <h4 className="text-[10.5px] font-black text-[#00f0ff] leading-tight">Alerta Clima GBA AMBA (+35% Demanda)</h4>
                  <p className="text-[9px] text-gray-300 mt-1 leading-relaxed">Se detectan frentes de tormentas en Buenos Aires. Recomendación: Elevar instantáneamente tarifa a 1.5x AMBA para compensar a Riders por riesgos.</p>
                  <button 
                    onClick={() => handleApplyPolicy(1.5, "Alta tarifa por severidad climática")}
                    className="mt-2.5 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[8.5px] text-[#00f0ff] font-mono font-black px-3 py-1 rounded-lg border border-[#00f0ff]/30 uppercase transition-colors pointer-events-auto cursor-pointer"
                  >
                    Ejecutar tarifa clima 1.5x
                  </button>
                </div>
              )}

              {simulationContext === 'alto' && (
                <div className="bg-[#1C152F]/40 border border-purple-500/20 p-3.5 rounded-xl block text-xs animate-fadeIn space-y-2">
                  <span className="text-[7.5px] text-purple-400 font-black uppercase tracking-widest block">🔥 Pico Demanda</span>
                  <h4 className="text-[10.5px] font-black text-purple-300 leading-tight">Córdoba Capital & Palermo saturado</h4>
                  <p className="text-[9px] text-gray-300 mt-1 leading-relaxed">Pico histórico reportado. Sugerencia: Programar 15 bloques fijos de fleteros de 4 hs de reparto para cubrir de forma inmediata restaurantes de alta demanda.</p>
                  <button 
                    onClick={() => handleApplyPolicy(1.3, "Exceso histórico Córdoba")}
                    className="mt-2.5 bg-purple-900/20 hover:bg-purple-900/30 text-[8.5px] text-purple-300 font-black px-3 py-1 rounded-lg border border-purple-500/25 uppercase transition-colors pointer-events-auto cursor-pointer"
                  >
                    Aplicar Multiplicador 1.3x
                  </button>
                </div>
              )}

            </>
          )}

        </div>
      </div>
    </div>
  );
};
