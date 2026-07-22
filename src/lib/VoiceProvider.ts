export type VoiceEngine = 'kokoro' | 'piper' | 'google' | 'openai' | 'elevenlabs';

export interface VoiceProviderOptions {
  engine?: VoiceEngine;
  voiceProfile?: 'mateo' | 'valentina';
  text: string;
}

export class VoiceProvider {
  static async speak(options: VoiceProviderOptions): Promise<void> {
    const { text, engine = 'kokoro', voiceProfile = 'valentina' } = options;
    console.log(`[VoiceProvider] Speaking via ${engine} [Profile: ${voiceProfile}]: "${text.substring(0, 50)}..."`);

    // Clean text of markdown or special chars
    const cleanText = text
      .replace(/\s\*/g, '')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/#\d+/g, 'número')
      .replace(/[\*\#\@\_]/g, '')
      .trim();

    if (!cleanText) return;

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
        console.warn("[VoiceProvider] ElevenLabs failed or not configured, falling back to Kokoro...", err);
      }
    }

    // Default: Kokoro / WebSpeech Fallback
    // Ensure high-fidelity local Argentine voice settings
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.pitch = voiceProfile === 'valentina' ? 1.05 : 0.85; // Mateo is deeper and technical, Valentina is bright and commercial
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
