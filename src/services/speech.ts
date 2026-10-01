// Speech service: Handles Speech Recognition, Web Speech Synthesis, and Gemini Audio

class SpeechService {
  private recognition: any = null;
  private isRecognizing: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      // Default to Indian English / Hinglish or Hindi
      this.recognition.lang = 'en-IN';
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  public isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  // Start listening
  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    language: 'en-IN' | 'hi-IN' = 'en-IN'
  ) {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.recognition) {
      onError('Speech recognition not supported in this browser.');
      return;
    }

    this.stopSpeaking();
    this.recognition.lang = language;

    this.recognition.onstart = () => {
      this.isRecognizing = true;
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        onResult(final, true);
      } else if (interim) {
        onResult(interim, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      this.isRecognizing = false;
      onError(event.error);
    };

    this.recognition.onend = () => {
      this.isRecognizing = false;
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition already started or error:', e);
    }
  }

  // Stop listening
  public stopListening() {
    if (this.recognition && this.isRecognizing) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isRecognizing = false;
    }
  }

  // Speak using Web Speech API (fallback or fast response)
  public speakBrowser(text: string, onEnd?: () => void, voiceGender: 'female' = 'female') {
    if (!this.isSpeechSynthesisSupported()) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();

    // Clean text (remove any JSON or markers)
    const cleanText = text.replace(/<<<[\s\S]*?>>>/g, '').replace(/[*_#]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // slightly higher pitch for female voice

    const voices = window.speechSynthesis.getVoices();
    // Try to find a female Indian English or Hindi voice
    const preferredVoice = voices.find(
      (v) =>
        (v.lang.includes('hi') || v.lang.includes('IN')) &&
        (v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('lekha') ||
          v.name.toLowerCase().includes('kalpana') ||
          v.name.toLowerCase().includes('aditi') ||
          v.name.toLowerCase().includes('google') ||
          v.name.toLowerCase().includes('zira') ||
          v.name.toLowerCase().includes('samantha'))
    ) || voices.find((v) => v.name.toLowerCase().includes('female')) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  // Play audio from base64 (Gemini TTS)
  public playBase64Audio(base64Data: string, mimeType: string = 'audio/wav', onEnd?: () => void): Promise<void> {
    return new Promise((resolve) => {
      this.stopSpeaking();
      try {
        const audioSrc = `data:${mimeType};base64,${base64Data}`;
        const audio = new Audio(audioSrc);
        this.currentAudio = audio;

        audio.onended = () => {
          this.currentAudio = null;
          if (onEnd) onEnd();
          resolve();
        };

        audio.onerror = (e) => {
          console.warn('Audio playback error:', e);
          this.currentAudio = null;
          if (onEnd) onEnd();
          resolve();
        };

        audio.play().catch((err) => {
          console.warn('Audio play failed (maybe autoplay restricted):', err);
          this.currentAudio = null;
          if (onEnd) onEnd();
          resolve();
        });
      } catch (err) {
        console.warn('Failed to play audio:', err);
        if (onEnd) onEnd();
        resolve();
      }
    });
  }

  // Stop any active speech or audio
  public stopSpeaking() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {
        // ignore
      }
      this.currentAudio = null;
    }

    if (this.isSpeechSynthesisSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
  }
}

export const speechService = new SpeechService();
