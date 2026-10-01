import React from 'react';
import { Mic, MicOff, Volume2, Sparkles } from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';

export const FloatingVoiceButton: React.FC = () => {
  const {
    isListening,
    isSpeaking,
    startVoiceListening,
    stopVoiceListening,
    voiceTranscript,
    activeTab,
    setActiveTab,
  } = useAssistant();

  // If already on the dedicated voice view, hide floating button to avoid duplicate controls
  if (activeTab === 'voice') return null;

  const handleClick = () => {
    if (isListening) {
      stopVoiceListening();
    } else {
      startVoiceListening();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* Transcript tooltip bubble */}
      {(isListening || voiceTranscript) && (
        <div className="max-w-xs px-3.5 py-2 rounded-2xl bg-slate-900 border border-rose-500/40 shadow-xl text-xs text-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-1">
            <Sparkles className="w-3 h-3 animate-spin" />
            <span>Lakshmi Listening...</span>
          </div>
          <p className="italic text-slate-300">
            {voiceTranscript || 'Bolye Ritesh, sun rahi hoon...'}
          </p>
        </div>
      )}

      {/* Main Floating Button */}
      <button
        onClick={handleClick}
        className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 transform active:scale-95 group ${
          isListening
            ? 'bg-gradient-to-tr from-rose-600 to-pink-600 text-white shadow-rose-600/50 scale-105'
            : isSpeaking
            ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-emerald-600/50'
            : 'bg-gradient-to-tr from-indigo-600 via-rose-600 to-pink-600 text-white shadow-rose-600/30 hover:scale-105'
        }`}
        title={isListening ? 'Click to stop listening' : 'Talk to Lakshmi'}
        aria-label="Talk to Lakshmi"
      >
        {/* Pulse ripple rings when listening or speaking */}
        {isListening && (
          <span className="absolute inset-0 rounded-full border-4 border-rose-400 opacity-75 animate-ping pointer-events-none" />
        )}
        {isSpeaking && (
          <span className="absolute inset-0 rounded-full border-4 border-emerald-400 opacity-75 animate-pulse pointer-events-none" />
        )}

        {isListening ? (
          <MicOff className="w-6 h-6" />
        ) : isSpeaking ? (
          <Volume2 className="w-6 h-6 animate-bounce" />
        ) : (
          <Mic className="w-6 h-6 group-hover:scale-110 transition" />
        )}
      </button>
    </div>
  );
};
