import React, { useState } from 'react';
import {
  Phone,
  PhoneOff,
  PhoneForwarded,
  Heart,
  Volume2,
  Mic,
  Clock,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Sparkles,
  Send,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';

export const IncomingCallModal: React.FC = () => {
  const {
    activeCall,
    answerIncomingCall,
    rejectIncomingCall,
    forwardIncomingCall,
    triggerVoiceAutoReply,
    submitCallerMessage,
    settings,
  } = useAssistant();

  const [simulatedCallerText, setSimulatedCallerText] = useState(
    'Unse college assignment aur project ke baare mein baat karni thi.'
  );

  if (!activeCall) return null;

  const isPapa = activeCall.isSpecialPapaRule;
  const secondsLeft = Math.max(0, activeCall.unansweredTimeout - activeCall.secondsRinging);
  const ringProgress = Math.min(
    100,
    (activeCall.secondsRinging / activeCall.unansweredTimeout) * 100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden text-white relative">
        {/* Top Status Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            isPapa
              ? 'bg-rose-950/60 border-rose-900/60'
              : 'bg-slate-800/80 border-slate-700/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-rose-400">
              {activeCall.status === 'ringing'
                ? 'Incoming Call Detected'
                : activeCall.status === 'connected_voice_reply'
                ? 'Lakshmi Answering Call'
                : 'Call Forwarding'}
            </span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
            Priority: {activeCall.priority}
          </span>
        </div>

        {/* Main Caller Card */}
        <div className="p-6 text-center space-y-4">
          {/* Avatar / Icon */}
          <div className="mx-auto relative w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 via-pink-600 to-indigo-600 shadow-xl shadow-rose-600/30">
            {isPapa ? (
              <Heart className="w-12 h-12 text-white animate-pulse" />
            ) : (
              <Phone className="w-12 h-12 text-white animate-bounce" />
            )}
            {activeCall.status === 'ringing' && (
              <div className="absolute inset-0 rounded-full border-4 border-rose-400/40 animate-ping pointer-events-none" />
            )}
          </div>

          {/* Caller Details */}
          <div>
            {isPapa ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-sm font-bold mb-2">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>❤️ Papa is calling</span>
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                {activeCall.relation || 'Incoming Caller'}
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {activeCall.contactName}
            </h2>
            <p className="text-sm font-mono text-slate-400 mt-1">{activeCall.phoneNumber}</p>
          </div>

          {/* Ringing Timer & Auto-Reply Progress Bar */}
          {activeCall.status === 'ringing' && (
            <div className="pt-2 pb-1 space-y-2 max-w-sm mx-auto">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Auto-response timer:
                </span>
                <span className="font-mono font-bold text-amber-300">
                  {secondsLeft}s remaining
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-rose-500 h-2 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${ringProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 italic">
                If unanswered in {activeCall.unansweredTimeout}s, Lakshmi will answer with: "Namaste, Ritesh abhi phone nahi utha pa rahe hain. Aap batayein, kya kaam hai?"
              </p>
            </div>
          )}

          {/* Forwarding Status Warning if not connected */}
          {activeCall.forwardingStatus && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2 text-left">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <span className="font-semibold">Forwarding Notice: </span>
                {activeCall.forwardingStatus}
              </div>
            </div>
          )}

          {/* Connected Voice Reply View (Lakshmi speaking with caller) */}
          {activeCall.status === 'connected_voice_reply' && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-left space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
                <span>Lakshmi Automated Call Response Active</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200">
                <span className="font-bold text-rose-400">Lakshmi (Spoken): </span>
                "Namaste, Ritesh abhi phone nahi utha pa rahe hain. Aap batayein, kya kaam hai?"
              </div>

              {/* Caller response simulation input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400">
                  Caller's response message (Simulated speech):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={simulatedCallerText}
                    onChange={(e) => setSimulatedCallerText(e.target.value)}
                    placeholder="Enter caller message..."
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={() => submitCallerMessage(simulatedCallerText)}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save Message</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons for Normal Ringing */}
          {activeCall.status === 'ringing' && (
            <div className="grid grid-cols-3 gap-3 pt-3">
              {/* Answer */}
              <button
                onClick={answerIncomingCall}
                className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/30 transition active:scale-95 group"
              >
                <Phone className="w-6 h-6 mb-1 text-white group-hover:scale-110 transition" />
                <span className="text-xs sm:text-sm">Answer</span>
              </button>

              {/* Reject */}
              <button
                onClick={rejectIncomingCall}
                className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-600/30 transition active:scale-95 group"
              >
                <PhoneOff className="w-6 h-6 mb-1 text-white group-hover:scale-110 transition" />
                <span className="text-xs sm:text-sm">Reject</span>
              </button>

              {/* Forward */}
              <button
                onClick={forwardIncomingCall}
                className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold shadow transition active:scale-95 group"
                title="Forward call to configured number"
              >
                <PhoneForwarded className="w-6 h-6 mb-1 text-indigo-400 group-hover:scale-110 transition" />
                <span className="text-xs sm:text-sm">Forward</span>
              </button>
            </div>
          )}

          {/* Quick Manual Voice Trigger */}
          {activeCall.status === 'ringing' && (
            <div className="pt-2">
              <button
                onClick={triggerVoiceAutoReply}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                Let Lakshmi answer now with "Aap batayein, kya kaam hai?"
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
