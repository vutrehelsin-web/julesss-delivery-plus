export type VoiceEngine = 'kokoro' | 'chatterbox' | 'piper' | 'google' | 'openai' | 'elevenlabs';

export interface VoiceProviderOptions {
  engine?: VoiceEngine;
  voiceProfile?: 'mateo' | 'valentina';
  text: string;
}

export class VoiceProvider {
  static async speak(options: VoiceProviderOptions): Promise<void> {
    const { text, engine = 'kokoro', voiceProfile = 'valentina' } = options;
    console.log(`[VoiceProvider] Speaking via ${engine} [Profile: ${voiceProfile}]: "${text.substring(0, 50)}..."`);

    const cleanText = text
      .replace(/\s\*/g, '')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/#\d+/g, 'número')
      .replace(/[\*\#\@\_]/g, '')
      .trim();

    if (!cleanText) return;

    // Chatterbox TTS implementation using Hugging Face (via our backend POST /api/voice/chatterbox)
    if (engine === 'chatterbox') {
      try {
        const response = await fetch('/api/voice/chatterbox', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: cleanText,
            voice: voiceProfile,
            language: 'es-AR'
          })
        });
        if (response.ok) {
          const data = await response.json();
          const audio = new Audio(data.audioUrl);
          await audio.play();
          return;
        }
      } catch (err) {
        console.warn("[VoiceProvider] Chatterbox failed, falling back to Kokoro...", err);
      }
    }

    if (engine === 'elevenlabs') {
      try {
        const response = await fetch('/api/elevenlabs/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: cleanText,
            voiceProfile
          })
        });
        if (response.ok) {
          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          await audio.play();
          return;
        }
      } catch (err) {
        console.warn("[VoiceProvider] ElevenLabs failed, falling back to Kokoro...", err);
      }
    }

    // Default: Kokoro / WebSpeech Fallback with high-fidelity local Argentine voice settings
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.pitch = voiceProfile === 'valentina' ? 1.05 : 0.85; 
      utterance.rate = 0.95;

      const availableVoices = window.speechSynthesis.getVoices();
      let selectedVoice = availableVoices.find(v => v.lang.startsWith('es') && v.name.toLowerCase().includes('argentina'));
      if (!selectedVoice) {
        selectedVoice = availableVoices.find(v => v.lang.startsWith('es-AR')) || 
                        availableVoices.find(v => v.lang.startsWith('es')) || 
                        availableVoices[0];
      }
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("[VoiceProvider] Local speech fallback failed:", e);
    }
  }
}
