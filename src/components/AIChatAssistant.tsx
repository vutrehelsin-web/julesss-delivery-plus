import React, { useState, useRef, useEffect } from 'react';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Play, 
  Volume2, 
  VolumeX,
  CheckCircle2, 
  Command,
  MessageSquare,
  Activity,
  Sliders,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

import { Turno, EntregaUnica } from '../types';

interface AIChatAssistantProps {
  turnos: Turno[];
  setTurnos: React.Dispatch<React.SetStateAction<Turno[]>>;
  entregas: EntregaUnica[];
  setEntregas: React.Dispatch<React.SetStateAction<EntregaUnica[]>>;
  logEvent: (msg: string, type?: 'info' | 'success' | 'warn' | 'error') => void;
  triggerNotification: (title: string, desc: string, icon: string) => void;
  weatherCondition: string;
  multiplier: number;
  role: 'comercio' | 'emprendedor' | 'repartidor';
}

interface ChatMessage {
  id: number;
  sender: 'usuario' | 'ia';
  tipo: 'texto' | 'audio';
  contenido: string;
  transcription?: string;
  audioDuration?: string;
  entidadCreada?: { type: 'turno' | 'entrega'; id: number; nombre: string };
  timestamp: string;
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  turnos,
  setTurnos,
  entregas,
  setEntregas,
  logEvent,
  triggerNotification,
  weatherCondition,
  multiplier,
  role
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'ia',
      tipo: 'texto',
      contenido: '¡Hola! Bienvenido al **Despachador Inteligente** al estilo **Uber B2B**. 🤖✈️ Estoy lista para automatizar turnos y envíos de forma instantánea. Conversa conmigo de manera natural por **mensajes de texto** o utiliza la simulación de **notas de voz para activar el motor de voz clonada** para pruebas del vendedor IA.',
      timestamp: 'Ahora'
    }
  ]);
  
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [userRole, setUserRole] = useState<'comercio' | 'emprendedor' | 'repartidor'>(role);

  // Cloned Voice Custom State Options
  const [voicePitch, setVoicePitch] = useState<number>(0.85); // Deeper premium operator sound
  const [voiceRate, setVoiceRate] = useState<number>(0.95);  // Professional speed pace
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const [activeSpeechText, setActiveSpeechText] = useState<string>('');
  const [isFetchingVoice, setIsFetchingVoice] = useState<boolean>(false);
  const [customVoiceId, setCustomVoiceId] = useState<string>('ByVRQtaK1WDOvTmP1PKO');
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Dynamic ElevenLabs Override Credentials
  const [apiError, setApiError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const audioIntervalRef = useRef<any>(null);
  const [waves, setWaves] = useState<number[]>([15, 30, 10, 45, 20, 12, 35, 8]);

  // Handle Autoscroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // Audio recording simulation timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Animated sound waves visualizer loop
  useEffect(() => {
    if (isRecording || isPlayingVoice || isThinking) {
      audioIntervalRef.current = setInterval(() => {
        setWaves(Array.from({ length: 12 }, () => Math.floor(Math.random() * 40) + 5));
      }, 110);
    } else {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      setWaves([12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12]);
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isRecording, isPlayingVoice, isThinking]);

  // Speech synthesizer engine using browser native speech as stable fallback
  const speakClonedVoice = (textToVocalize: string) => {
    // Clean text
    const cleanText = textToVocalize
      .replace(/\s\*/g, '')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/#\d+/g, 'número')
      .replace(/[\*\#\@\_]/g, '')
      .trim();

    if (!cleanText) return;

    logEvent(`Iniciando síntesis de voz: "${cleanText.substring(0, 45)}..."`, 'info');
    
    const azureKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const azureRegion = import.meta.env.VITE_AZURE_SPEECH_REGION;

    if (azureKey && azureRegion) {
      speakWithAzure(cleanText, azureKey, azureRegion);
    } else {
      fallbackToWebSpeech(cleanText);
    }
  };

  const speakWithAzure = (text: string, key: string, region: string) => {
    try {
      setIsFetchingVoice(true);
      const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
      
      // Select appropriate voice based on selected options in the future, for now default to a nice Spanish voice
      speechConfig.speechSynthesisVoiceName = "es-AR-TomasNeural"; 
      
      const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
      
      let synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
      
      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            setIsFetchingVoice(false);
            setIsPlayingVoice(true);
            logEvent(`Azure Speech TTS sintetizado con éxito.`, 'success');
          } else {
            console.error("Speech synthesis canceled, " + result.errorDetails + "\nDid you set the speech resource key and region values?");
            setIsFetchingVoice(false);
            fallbackToWebSpeech(text);
          }
          synthesizer.close();
          synthesizer = null as any;
        },
        (error) => {
          console.error(error);
          setIsFetchingVoice(false);
          fallbackToWebSpeech(text);
          synthesizer.close();
          synthesizer = null as any;
        }
      );
      
      // Auto-turn off playing state (hacky timer, usually use events on Audio Context, but SDK handles output)
      // Since SDK plays it directly, we'll just guess duration or let it be.
      // Better way is to use synthesizeToAudioStream if we want full HTMLAudio control, but auto-speaker is easier.
      // Let's at least clear the fetching state.
      // Also we need to clear isPlayingVoice when done playback. 
      // Instead of manual AudioConfig, let's just let SDK play and rely on events. Unfortunately SDK doesn't easily emit "PlaybackCompleted".
      // We will estimate duration 1s per 15 chars ~ Roughly
      const durationMs = (text.length / 15) * 1000;
      setTimeout(() => setIsPlayingVoice(false), durationMs);

    } catch (e) {
      console.error("Error setting up Azure TTS", e);
      setIsFetchingVoice(false);
      fallbackToWebSpeech(text);
    }
  };

  // Resilient fallback speech engine using built-in high tracking TTS
  const fallbackToWebSpeech = (text: string) => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = voicePitch;
      utterance.rate = voiceRate;

      const availableVoices = window.speechSynthesis.getVoices();
      
      // Try to find better quality voices (Google/Microsoft preferred)
      let selectedVoice = availableVoices.find(v => v.lang.startsWith('es') && (v.name.includes('Google') || v.name.includes('Microsoft')) && v.name.toLowerCase().includes('argentina'));
      if (!selectedVoice) {
        selectedVoice = availableVoices.find(v => v.lang.startsWith('es') && (v.name.includes('Google') || v.name.includes('Microsoft')));
      }
      if (!selectedVoice) {
        selectedVoice = availableVoices.find(v => v.lang.startsWith('es') && v.name.toLowerCase().includes('argentina'));
      }
      
      if (!selectedVoice) {
        selectedVoice = availableVoices.find(v => v.lang.startsWith('es-AR')) || 
                        availableVoices.find(v => v.lang.startsWith('es')) || 
                        availableVoices[0];
      }
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsPlayingVoice(true);
        setActiveSpeechText(text);
        logEvent(`Límite / Modo Offline: Fallback de voz activo (Default)`, 'warn');
      };

      utterance.onend = () => {
        setIsPlayingVoice(false);
      };

      utterance.onerror = () => {
        setIsPlayingVoice(false);
        fallbackSoundBeep();
      };

      window.speechSynthesis.speak(utterance);
    } catch (_) {
      setIsPlayingVoice(false);
      fallbackSoundBeep();
    }
  };

  const stopSpeakingClonedVoice = () => {
    // 1. Stop HTMLAudio playing
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      } catch (_) {}
    }
    // 2. Stop WebSpeech synthesis
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
    
    setIsPlayingVoice(false);
    setIsFetchingVoice(false);
    logEvent('Síntesis de voz clonada detenida.', 'info');
  };

  // Beep sound indicator
  const fallbackSoundBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(520, audioCtx.currentTime); 
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Ignored
    }
  };

  // Preset operations
  const presets = {
    comercio: [
      {
        label: '🔑 Burger House Noche ($15.000)',
        text: 'Pedir turno de 4 horas para Burger House el bloque de 20:00 a 00:00. Pago $15000',
        audioTrans: 'Hola! Soy Juan de Burger House. Publico un nuevo turno de noche de ocho a doce por quince mil pesos. Repartidor Carlos, ¿te sirve?',
        ttsTarget: 'Hola! He publicado un nuevo turno fijo de asistencia para Burger House de ocho de la noche a doce. Presupuesto aprobado quince mil pesos.'
      },
      {
        label: '🍣 Sushi Club Almuerzo ($18.000)',
        text: 'Hola, necesito un bloque para local Sushi Club de 12:00 a 16:00, abonando $18000',
        audioTrans: 'Hola, habla Sushi Club. Necesitamos cobertura de mediodía de doce a dieciséis horas por un pago de dieciocho mil.',
        ttsTarget: 'Sushi Club Palermo confirma bloque de almuerzo disponible de doce a dieciséis horas. Tarifa garantizada de dieciocho mil pesos en el pool.'
      }
    ],
    emprendedor: [
      {
        label: '📦 Enviar Pastas de la Nona ($4.500)',
        text: 'Despachar un pedido mediano desde Pastas de la Nona de Urquiza 230 hacia Serrano 1100. Valor $4500',
        audioTrans: 'Buenas tardes, hablo de Pastas de la Nona. Necesito despachar un pedido mediano hacia Serrano mil cien. Tarifa cuatro mil quinientos.',
        ttsTarget: 'Despacho registrado para Pastas de la Nona hacia Serrano mil cien. El bulto posee tamaño mediano con tarifa asignada.'
      },
      {
        label: '🌿 Enviar Yerba Orgánica ($3.200)',
        text: 'Enviar paquete pequeño de Yerba Orgánica a Av Santa Fe 4000. Tarifa $3200',
        audioTrans: 'Hola, tengo una entrega rápida de Yerba Orgánica para retirar en Cabrera 3400 y llevar a Santa Fe cuatro mil por tres mil doscientos pesos.',
        ttsTarget: 'Yerba Orgánica despacha paquete pequeño hacia Avenida Santa Fe cuatro mil. Se ha programado alerta GPS para el pool de repartos.'
      }
    ],
    repartidor: [
      {
        label: '🛵 Tomar Turno Burger House',
        text: 'Aceptar el turno de Burger House a las 20:00.',
        audioTrans: 'Hola asistente, quiero reservar el turno fijo de Burger House de las 20 horas.',
        ttsTarget: 'Has aceptado el turno fijo para Burger House con inicio a las 20 horas.'
      },
      {
        label: '🛵 Aceptar Envío Pastas de la Nona',
        text: 'Tomar envío de Pastas de la Nona a Serrano 1100',
        audioTrans: 'Acepto el viaje pendiente de Pastas de la Nona hacia Serrano mil cien, voy en camino.',
        ttsTarget: 'Ruta confirmada para el viaje desde Pastas de la Nona. Que tengas buen viaje.'
      }
    ]
  };

  const executeCommandProcessing = (commandText: string, labelType: 'texto' | 'audio', voiceTextToSpeech?: string) => {
    setIsThinking(true);
    fallbackSoundBeep();
    
    setTimeout(() => {
      const phrase = commandText.toLowerCase();
      let responseText = '';
      let targetEntity: { type: 'turno' | 'entrega'; id: number; nombre: string } | undefined = undefined;
      let vocalicMonto = 0;
      
      const currentTimeString = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

      if (phrase.includes('turno') || phrase.includes('bloque') || userRole === 'comercio') {
        const commerce = phrase.includes('sushi') ? 'Sushi Club' : 'Burger House';
        const hours = phrase.includes('12') ? '12:00 - 16:00' : '20:00 - 00:00';
        const rawMonto = phrase.includes('18000') ? 18000 : 15000;
        
        const finalMonto = Math.round(rawMonto * multiplier);
        vocalicMonto = finalMonto;
        const driverShare = Math.round(finalMonto * 0.8);
        const platformShare = Math.round(finalMonto * 0.2);
        const newId = turnos.length + 101;

        const nuevoTurno: Turno = {
          id: newId,
          comercio_nombre: commerce,
          direccion: commerce === 'Sushi Club' ? 'Av. Cerviño 4400, Palermo' : 'Honduras 5600, Palermo',
          fecha: 'Hoy',
          horario: hours,
          monto_total: finalMonto,
          monto_repartidor: driverShare,
          monto_plataforma: platformShare,
          estado: 'disponible'
        };

        setTurnos(prev => [nuevoTurno, ...prev]);
        logEvent(`Turno B2B creado con IA: ${commerce} (${hours})`, 'success');
        triggerNotification(
          `IA ⚡ Turno Publicado`,
          `Nuevo bloque para ${commerce} de ${hours} publicado automáticamente en el ecosistema.`,
          'success'
        );

        responseText = `**VENTA DE TURNO AUTOMÁTICA EN DB**

Excelente. He analizado el requerimiento cognitivo por ${labelType === 'audio' ? 'nota de voz clonada 🎙️' : 'texto minimalista 💬'} y registré el turno fijo:

*   **Comercio**: ${commerce} 🏢
*   **Horarios**: ${hours} (4 horas de guardia)
*   **Tarifa Ajustada (${multiplier}x clima)**: **$${finalMonto} ARS**
*   **Repartidor Neto**: $${driverShare} (80%) 
*   **Comisión SaaS**: $${platformShare} (20%)

El operador autómata ya publicó la oferta GPS en el pool nacional y envió la alerta al repartidor Carlos.`;

        targetEntity = { type: 'turno', id: newId, nombre: commerce };

      } else {
        const emprendimiento = phrase.includes('pastas') ? 'Pastas de la Nona' : 'Yerba Orgánica';
        const origen = phrase.includes('pastas') ? 'Urquiza 230, Almagro' : 'Cabrera 3400, Palermo';
        const destino = phrase.includes('serrano') ? 'Serrano 1100, Palermo' : 'Av. Santa Fe 4000, Palermo';
        const size = phrase.includes('pequeño') ? 'pequeño' : 'mediano';
        const rawMonto = phrase.includes('3200') ? 3200 : 4500;
        
        const finalMonto = Math.round(rawMonto * multiplier);
        vocalicMonto = finalMonto;
        const driverShare = Math.round(finalMonto * 0.8);
        const platformShare = Math.round(finalMonto * 0.2);
        const newId = entregas.length + 201;

        const nuevaEntrega: EntregaUnica = {
          id: newId,
          emprendedor_nombre: emprendimiento,
          direccion_origen: origen,
          direccion_destino: destino,
          tamano: size,
          monto_total: finalMonto,
          monto_repartidor: driverShare,
          monto_plataforma: platformShare,
          estado: 'disponible'
        };

        setEntregas(prev => [nuevaEntrega, ...prev]);
        logEvent(`Entrega On-Demand creada con IA: ${emprendimiento} → ${size}`, 'success');
        triggerNotification(
          `IA ⚡ Pedido Publicado`,
          `Entrega rápida de ${emprendimiento} despachada automáticamente con IA.`,
          'success'
        );

        responseText = `**ENVÍO ON-DEMAND PUBLICADO CON IA**

He procesado la solicitud e ingresé la encomienda exprés de inmediato:

*   **Emprendimiento**: ${emprendimiento} 📦
*   **Trayecto**: ${origen} ➔ ${destino}
*   **Tamaño**: Paquete ${size.toUpperCase()}
*   **Valor Consolidado**: **$${finalMonto} ARS** (Monto neto de reparto: $${driverShare})

¡La geolocalización satelital ya activó la ruta sobre el mapa de Argentina!`;

        targetEntity = { type: 'entrega', id: newId, nombre: emprendimiento };
      }

      const aiResponse: ChatMessage = {
        id: messages.length + 2,
        sender: 'ia',
        tipo: 'texto',
        contenido: responseText,
        entidadCreada: targetEntity,
        timestamp: currentTimeString
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsThinking(false);

      // Trigger automatic Speech (Venda de Turno con voz clonada)
      const speakText = voiceTextToSpeech || `Operación completada de forma exitosa. Se ha publicado el elemento de ${targetEntity?.nombre} por un valor de ${vocalicMonto} pesos.`;
      speakClonedVoice(speakText);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!textInput.trim()) return;
    
    const userMsg: ChatMessage = {
      id: messages.length + 1,
      sender: 'usuario',
      tipo: 'texto',
      contenido: textInput,
      timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const memoText = textInput;
    setTextInput('');
    executeCommandProcessing(memoText, 'texto');
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      const seconds = recordingSeconds || 5;
      const index = Math.floor(Math.random() * presets[userRole].length);
      const chosenPreset = presets[userRole][index];
      
      const audioMsg: ChatMessage = {
        id: messages.length + 1,
        sender: 'usuario',
        tipo: 'audio',
        contenido: `Venta de Turno simulada por voz (${seconds}s)`,
        transcription: chosenPreset.audioTrans,
        audioDuration: `0:${seconds < 10 ? '0' + seconds : seconds}`,
        timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, audioMsg]);
      executeCommandProcessing(chosenPreset.text, 'audio', chosenPreset.ttsTarget);
    } else {
      setIsRecording(true);
    }
  };

  const handlePresetClick = (preset: { text: string; audioTrans: string; label: string; ttsTarget?: string }, type: 'texto' | 'audio') => {
    const timeStr = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    
    if (type === 'audio') {
      const audioMsg: ChatMessage = {
        id: messages.length + 1,
        sender: 'usuario',
        tipo: 'audio',
        contenido: `Venta de Turno por nota de voz (${preset.label})`,
        transcription: preset.audioTrans,
        audioDuration: '0:07',
        timestamp: timeStr
      };
      setMessages(prev => [...prev, audioMsg]);
      executeCommandProcessing(preset.text, 'audio', preset.ttsTarget);
    } else {
      const userMsg: ChatMessage = {
        id: messages.length + 1,
        sender: 'usuario',
        tipo: 'texto',
        contenido: preset.text,
        timestamp: timeStr
      };
      setMessages(prev => [...prev, userMsg]);
      executeCommandProcessing(preset.text, 'texto', preset.ttsTarget);
    }
  };

  return (
    <div className="bg-[#000000] border border-gray-brand rounded-2xl flex flex-col h-[580px] shadow-2xl relative overflow-hidden text-left text-white selection:bg-blue-brand/30">
      
      {/* Visual Header inspired by Uber Design System - Solid black background with high tracking font */}
      <div className="bg-black border-b border-gray-brand px-5 py-4 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-brand rounded-md p-2 text-white flex items-center justify-center animate-pulse">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs tracking-widest uppercase font-display leading-none text-white-brand">
              UBER B2B IA ENGINE
            </h4>
            <span className="text-[10px] text-gray-500 font-mono">CONVERSATIONAL VOICE PROCESSOR • DEEP CLONE</span>
          </div>
        </div>

        {/* Selected Role Slider & Custom Config Panel */}
        <div className="flex bg-[#111111] p-1 rounded-lg text-[9px] font-mono border border-gray-brand self-start sm:self-auto gap-1">
          <button 
             onClick={() => setUserRole('comercio')}
             className={`px-3 py-1 rounded transition-all cursor-pointer font-bold uppercase tracking-wider ${userRole === 'comercio' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
           >
             🏢 Comercio
           </button>
           <button 
             onClick={() => setUserRole('emprendedor')}
             className={`px-3 py-1 rounded transition-all cursor-pointer font-bold uppercase tracking-wider ${userRole === 'emprendedor' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
           >
             📦 Emprendedor
           </button>
           <button 
             onClick={() => setUserRole('repartidor')}
             className={`px-3 py-1 rounded transition-all cursor-pointer font-bold uppercase tracking-wider ${userRole === 'repartidor' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
           >
             🛵 Repartidor
           </button>
        </div>
      </div>

      {/* CLONED VOICE BIOMETRIC CONTROL PANEL (Uber minimalist parameters) */}
      <div className="bg-[#0A0A0A] border-b border-gray-brand px-5 py-3.5 z-10 grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-[10px]">
        
        {/* Control Panels */}
        {/* Pitch Control */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[8px] font-mono text-gray-500">
            <span className="font-bold uppercase tracking-widest">Tono Biométrico (Pitch):</span>
            <span className="text-white-brand font-bold">{voicePitch}x</span>
          </div>
          <input 
            type="range"
            min="0.5" 
            max="1.5" 
            step="0.05"
            value={voicePitch}
            onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-brand rounded-lg appearance-none cursor-pointer accent-blue-brand"
          />
        </div>

        {/* Rate Control */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[8px] font-mono text-gray-500">
            <span className="font-bold uppercase tracking-widest">Velocidad de Habla (Rate):</span>
            <span className="text-white-brand font-bold">{voiceRate}x</span>
          </div>
          <input 
            type="range"
            min="0.6" 
            max="1.5" 
            step="0.05"
            value={voiceRate}
            onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-brand rounded-lg appearance-none cursor-pointer accent-blue-brand"
          />
        </div>

      </div>


      {/* DIAGNÓSTICO DE ERROR DE AZURE SPEECH */}
      {apiError && (
        <div className="bg-[#1A0B0D] border-b border-red-950/40 p-4 z-10 flex gap-3 items-start text-xs select-none">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5 min-w-0 text-left">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-[8.5px] text-red-400 tracking-widest font-mono flex items-center gap-1 uppercase">
                ⚠️ DIAGNÓSTICO: Error de Azure Speech
              </span>
              <button 
                onClick={() => setApiError(null)}
                className="text-red-400 hover:text-white font-mono text-[9px] uppercase tracking-wider cursor-pointer font-bold px-1.5 py-0.5"
              >
                Ignorar [X]
              </button>
            </div>
            
            <p className="text-gray-300 font-mono text-[10.5px] leading-relaxed break-words">{apiError}</p>
          </div>
        </div>
      )}

      {/* SYSTEM AUDIO STATUS INDICATOR (Minimalist wave bar) */}
      {isFetchingVoice && (
        <div className="bg-[#0D0D0D] border-b border-blue-brand/20 px-5 py-2.5 z-10 flex items-center justify-between gap-3 text-[10px] text-blue-brand select-none animate-pulse">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-brand animate-spin" />
            <span className="font-bold font-mono uppercase tracking-widest text-[9px]">Azure TTS: Clonando voz y sintetizando audio...</span>
          </div>
          <span className="text-[8px] font-mono bg-blue-brand/10 border border-blue-brand/20 px-2 py-0.5 rounded text-blue-brand">STREAMING BUFFER</span>
        </div>
      )}

      {isPlayingVoice && (
        <div className="bg-[#111111] border-b border-blue-brand/20 px-5 py-2 z-10 flex items-center justify-between gap-3 text-[10px] text-blue-brand select-none animate-pulse">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-blue-brand animate-bounce" />
            <span className="font-bold font-mono uppercase tracking-widest text-[9px]">Vendedor de IA hablando con Voz Clonada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={stopSpeakingClonedVoice}
              className="bg-blue-brand/15 hover:bg-blue-brand/35 text-blue-brand text-[8px] font-bold px-2 py-0.5 rounded font-mono cursor-pointer border border-blue-brand/35 shrink-0"
            >
              Silenciar [X]
            </button>
            <div className="flex items-end gap-0.5 h-3">
              {waves.map((h, i) => (
                <span 
                  key={i} 
                  className="w-[1.5px] bg-blue-brand rounded-full transition-all duration-100" 
                  style={{ height: `${Math.min(h, 15)}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs no-scrollbar bg-[#050505] relative z-0" ref={scrollRef}>
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col max-w-[85%] ${
              msg.sender === 'usuario' ? 'ml-auto items-end' : 'mr-auto items-start'
            }`}
          >
            {/* Sender and time tag */}
            <span className="text-[9px] text-gray-500 font-mono mb-1 uppercase tracking-widest">
              {msg.sender === 'ia' ? '🤖 DeliveryPlus IA' : `OPERADOR B2B`} • {msg.timestamp}
            </span>

            {/* Bubble Contents */}
            <div 
              className={`rounded-xl p-3.5 shadow-md border leading-relaxed text-xs transition-all ${
                msg.sender === 'usuario' 
                  ? 'bg-white text-black border-white rounded-tr-none font-medium' 
                  : 'bg-[#121212] border-gray-brand text-gray-200 rounded-tl-none'
              }`}
            >
              {msg.tipo === 'audio' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        fallbackSoundBeep();
                        speakClonedVoice(msg.transcription || "Voz de prueba");
                      }}
                      className="w-8 h-8 rounded-full bg-white text-black hover:bg-gray-200 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                      title="Probar reproducción voice cloning"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                    
                    {/* Minimalist Audio representation */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-end gap-0.5 h-5 px-1.5 bg-black/40 rounded border border-gray-brand py-1">
                        {waves.slice(0, 8).map((h, i) => (
                          <span 
                            key={i} 
                            className="flex-1 bg-white rounded transition-all duration-100" 
                            style={{ height: `${Math.min(h, 18)}px` }}
                          />
                        ))}
                      </div>
                    </div>

                    <span className="font-mono text-[9px] text-gray-500">{msg.audioDuration || '0:07'}</span>
                  </div>

                  {msg.transcription && (
                    <div className="border-t border-gray-800 pt-2.5 text-[10.5px] italic text-gray-400 leading-normal">
                      &ldquo;{msg.transcription}&rdquo;
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => speakClonedVoice(msg.transcription || "")}
                      className="text-[9px] bg-[#1a1a1a] border border-gray-800 text-white hover:bg-[#2a2a2a] px-2 py-1 rounded font-mono uppercase tracking-widest cursor-pointer flex items-center gap-1.5"
                    >
                      <Volume2 className="w-3 h-3 text-blue-brand" />
                      Hacer que IA Clone hable esta frase
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className="space-y-2 break-words"
                  dangerouslySetInnerHTML={{ 
                    __html: msg.contenido
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br />')
                      .replace(/\*(.*?)\*/g, '<span class="text-blue-brand font-semibold">$1</span>')
                  }}
                />
              )}

              {/* Created entity badge */}
              {msg.entidadCreada && (
                <div className="mt-3.5 bg-black border border-gray-brand rounded-lg p-2.5 flex items-center justify-between text-[9px] font-mono shrink-0">
                  <div className="flex items-center gap-1.5 text-green-success font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-success" />
                    <span className="uppercase tracking-widest text-[8px]">Base de Datos (MariaDB): ONLINE</span>
                  </div>
                  <span className="text-gray-500">
                    {msg.entidadCreada.type === 'turno' ? '📌 Turno Fijo' : '📦 Encomienda'} #{msg.entidadCreada.id}
                  </span>
                </div>
              )}
            </div>

            {/* Speach utterance helper for text responses */}
            {msg.sender === 'ia' && msg.tipo === 'texto' && (
              <button 
                onClick={() => speakClonedVoice(msg.contenido)}
                className="mt-1 text-[8px] font-mono text-gray-500 hover:text-white uppercase tracking-wider flex items-center gap-1 transition-colors pl-2 self-start"
                title="Sintetizar respuesta con voz clonada configurada"
              >
                <Volume2 className="w-2.5 h-2.5 text-blue-brand" /> Escuchar con Voz Clonada (Azure Speech)
              </button>
            )}

          </div>
        ))}

        {/* AI Typing Thinking visualizer */}
        {isThinking && (
          <div className="flex flex-col items-start mr-auto max-w-[85%]">
            <span className="text-[9px] text-gray-500 font-mono mb-1 uppercase tracking-widest">procesando biometría de voz...</span>
            <div className="rounded-xl p-3 bg-[#121212] border border-gray-brand text-gray-400 rounded-tl-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* PRESETS WORKSHOP PANEL / COMANDOS RÁPIDOS MOCK IA */}
      <div className="px-5 py-3 bg-[#090909] border-t border-gray-brand z-10 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Command className="w-3 h-3 text-blue-brand" />
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest font-mono">Simulador Ventas B2B (Probar Voz)</span>
          </div>
          <span className="text-[8px] text-gray-500 italic block">Haz clic para enviar audio simulado y disparar venta automática</span>
        </div>
        
        <div className="flex flex-wrap gap-2 max-h-[62px] overflow-y-auto no-scrollbar">
          {presets[userRole].map((preset, idx) => (
            <div key={idx} className="flex bg-[#121212] hover:bg-[#1A1A1A] border border-gray-brand hover:border-white rounded p-1 transition-all items-center gap-2">
              <button 
                onClick={() => handlePresetClick(preset, 'texto')}
                className="text-[9px] font-bold text-gray-200 hover:text-white px-2 py-0.5 rounded transition-colors text-left"
              >
                {preset.label}
              </button>
              
              <div className="h-4 w-[1px] bg-gray-brand" />

              <button 
                onClick={() => handlePresetClick(preset, 'audio')}
                className="p-1 text-gray-500 hover:text-white rounded hover:bg-black/40 flex items-center gap-1 font-mono text-[8px] uppercase tracking-wider font-bold"
                title="Enviar por nota de voz simulated"
              >
                <Mic className="w-3 h-3 text-blue-brand animate-pulse" />
                Voz
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* INPUT PANEL FOOTER */}
      <div className="bg-black p-4 border-t border-gray-brand flex items-center gap-3.5 z-10 shrink-0">
        {isRecording ? (
          <div className="flex-1 flex items-center justify-between bg-white text-black rounded-lg px-4 py-3 transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-red-600">GRABANDO AUDIO OPERADOR...</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs font-black">
                0:{recordingSeconds < 10 ? '0' + recordingSeconds : recordingSeconds}
              </span>
              <button 
                onClick={handleToggleRecording}
                className="bg-black hover:bg-gray-900 text-white p-2.5 rounded-full select-none shadow-lg animate-pulse transition-all cursor-pointer flex items-center justify-center text-[9px] font-mono uppercase tracking-widest font-bold"
                title="Detener y Procesar"
              >
                <MicOff className="w-3.5 h-3.5 text-white mr-1 inline" /> Detener
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Minimalist Micro Button */}
            <button 
              onClick={handleToggleRecording}
              className="p-3 bg-[#111111] hover:bg-white text-gray-400 hover:text-black border border-gray-brand rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-md"
              title="Presiona para Simular Nota de Voz de B2B"
            >
              <Mic className="w-4 h-4 text-blue-brand" />
            </button>

            {/* Standard texts inputs */}
            <input 
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                userRole === 'comercio' 
                  ? "Pide un turno ej: 'Crea turno de Burger House, pago $15000'..."
                  : "Despacha pedido ej: 'Enviar de Pastas de la Nona Serrano 1100'..."
              }
              className="flex-1 bg-[#111111] border border-gray-brand rounded-lg px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white transition-all shadow-inner font-mono font-semibold"
            />

            {/* Send text button */}
            <button 
              onClick={handleSendMessage}
              disabled={!textInput.trim()}
              className="p-3 bg-white hover:bg-gray-200 text-black border border-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0 flex items-center justify-center font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

    </div>
  );
};
