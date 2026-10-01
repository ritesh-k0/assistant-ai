import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Settings2,
  CheckCircle,
  HelpCircle,
  Radio,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';

export const VoiceView: React.FC = () => {
  const {
    isListening,
    isSpeaking,
    isMuted,
    setIsMuted,
    startVoiceListening,
    stopVoiceListening,
    voiceTranscript,
    chatMessages,
    settings,
    updateSettings,
    stopSpeaking,
    speakLakshmiText,
  } = useAssistant();

  const [selectedLanguage, setSelectedLanguage] = useState<'auto' | 'hindi' | 'hinglish' | 'english'>(
    settings.languageMode || 'auto'
  );

  const lastAssistantMessage = [...chatMessages]
    .reverse()
    .find((m) => m.sender === 'assistant');

  const handleMicClick = () => {
    if (isListening) {
      stopVoiceListening();
    } else {
      startVoiceListening();
    }
  };

  const handleLanguageChange = (lang: 'auto' | 'hindi' | 'hinglish' | 'english') => {
    setSelectedLanguage(lang);
    updateSettings({ languageMode: lang });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time Voice Conversation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Talk to Lakshmi
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Natural Hindi, Hinglish and English female voice assistant. Press the mic and speak naturally.
        </p>
      </div>

      {/* Main Interactive Voice Visualizer Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 text-center shadow-2xl flex flex-col items-center justify-center min-h-[380px]">
        {/* Ambient background glow */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            isListening
              ? 'bg-rose-600/10'
              : isSpeaking
              ? 'bg-emerald-600/10'
              : 'bg-transparent'
          }`}
        />

        {/* Live Audio Waves Simulation */}
        <div className="h-16 flex items-center justify-center gap-1.5 mb-8">
          {[40, 70, 25, 90, 60, 30, 85, 50, 95, 35, 75, 45, 80, 20].map((h, i) => (
            <span
              key={i}
              className={`w-1.5 rounded-full transition-all duration-300 ${
                isListening
                  ? 'bg-rose-500 animate-pulse'
                  : isSpeaking
                  ? 'bg-emerald-400 animate-bounce'
                  : 'bg-slate-700/60'
              }`}
              style={{
                height: isListening || isSpeaking ? `${Math.max(12, h * (isListening ? 0.7 : 0.8))}px` : '8px',
                animationDelay: `${(i % 5) * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Big Interactive Mic Button */}
        <div className="relative my-4">
          {/* Animated concentric rings */}
          {isListening && (
            <>
              <div className="absolute -inset-4 rounded-full border-2 border-rose-500/30 animate-ping pointer-events-none" />
              <div className="absolute -inset-8 rounded-full border border-rose-500/20 animate-pulse pointer-events-none" />
            </>
          )}

          <button
            onClick={handleMicClick}
            className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-95 group ${
              isListening
                ? 'bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-rose-600/50 scale-105'
                : isSpeaking
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-600/50'
                : 'bg-gradient-to-tr from-rose-500 via-pink-600 to-indigo-600 text-white shadow-rose-600/30 hover:scale-105'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start speaking'}
          >
            {isListening ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : isSpeaking ? (
              <Volume2 className="w-12 h-12 text-white animate-bounce" />
            ) : (
              <Mic className="w-12 h-12 text-white group-hover:scale-110 transition" />
            )}
          </button>
        </div>

        {/* State Label */}
        <div className="mt-4">
          <span className="text-sm font-semibold text-white block">
            {isListening
              ? 'Listening to Ritesh... (Bolye)'
              : isSpeaking
              ? 'Lakshmi is speaking...'
              : 'Tap microphone to speak'}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">
            {isListening ? 'Press again when finished' : 'e.g. "Kal subah 8 baje uthne ka reminder do"'}
          </span>
        </div>

        {/* Live Transcript / Response display box */}
        {(voiceTranscript || isSpeaking || lastAssistantMessage) && (
          <div className="mt-6 w-full max-w-lg p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-left space-y-2">
            {voiceTranscript && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  Ritesh:
                </span>
                <p className="text-xs sm:text-sm text-slate-200 mt-0.5 italic">
                  "{voiceTranscript}"
                </p>
              </div>
            )}
            {lastAssistantMessage && !voiceTranscript && (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Lakshmi:
                  </span>
                  <button
                    onClick={() => speakLakshmiText(lastAssistantMessage.text)}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300"
                  >
                    Replay
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                  "{lastAssistantMessage.text}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Voice Controls: Mute, Speaker, Language, Pitch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Speaker & Audio controls */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              Lakshmi Voice Output
            </span>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                isMuted
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {isMuted ? 'Muted' : 'Sound ON'}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Natural Indian female voice configuration with automatic pitch balancing.
          </p>
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700"
            >
              Stop Current Speech
            </button>
          )}
        </div>

        {/* Language Selection */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-rose-400" />
            Language Mode
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {(['auto', 'hinglish', 'hindi', 'english'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`py-2 px-3 rounded-xl border capitalize font-medium transition ${
                  selectedLanguage === lang
                    ? 'bg-rose-600/20 text-rose-300 border-rose-500/50'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {lang === 'auto' ? 'Auto-Detect' : lang}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Lakshmi automatically adapts to Hindi, English, or Hinglish based on your speech.
          </p>
        </div>
      </div>
    </div>
  );
};
