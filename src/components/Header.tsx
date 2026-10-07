import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Bell,
  PhoneCall,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Menu,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    settings,
    isMuted,
    setIsMuted,
    isSpeaking,
    isListening,
    notifications,
    removeNotification,
    simulateIncomingCall,
    activeCall,
    requestNotificationPermission,
    contacts,
  } = useAssistant();

  const specialContact =
    contacts.find((c) => c.isSpecialRule) ||
    contacts.find((c) => c.name.toLowerCase().includes('papa'));

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & App Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 text-slate-400 hover:text-white rounded-lg lg:hidden hover:bg-slate-800 transition"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-500 text-white font-bold shadow-md shadow-rose-500/20">
              <span className="text-lg">ल</span>
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Ritesh's Assistant
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Sparkles className="w-3 h-3" />
                  Lakshmi
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <span>Lakshmi</span>
                <span className="text-slate-600">•</span>
                <span>Personal AI Assistant</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Date & Time */}
        <div className="hidden md:flex flex-col items-center">
          <div className="text-sm font-semibold text-slate-200 tracking-wide">
            {formattedTime}
          </div>
          <div className="text-xs text-slate-400">{formattedDate}</div>
        </div>

        {/* Right: Telephony Status, Mute toggle, Quick Papa Call Test, Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Telephony Status Pill */}
          <div
            className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              settings.telephonyConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/25'
            }`}
            title="Telephony Companion connection state"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>
              {settings.telephonyConnected ? 'Telephony Active' : 'Companion Ready'}
            </span>
          </div>

          {/* Quick Papa incoming call simulator button */}
          {!activeCall && (
            <button
              onClick={() =>
                simulateIncomingCall(
                  specialContact
                    ? specialContact.phoneNumber || specialContact.id
                    : undefined
                )
              }
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition shadow-sm active:scale-95"
              title={`Test incoming call flow for ${specialContact?.name || 'important contact'} (with 20s unanswered voice reply rule)`}
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>{specialContact ? `Test ${specialContact.name} Call` : 'Test Call'}</span>
            </button>
          )}

          {/* Mute / Audio toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-lg transition border ${
              isMuted
                ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                : 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600/30'
            }`}
            title={isMuted ? 'Lakshmi is muted (click to unmute)' : 'Audio voice output enabled'}
            aria-label="Toggle mute"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-rose-400" />
                    <span className="font-semibold text-sm text-white">Lakshmi Alerts</span>
                  </div>
                  <button
                    onClick={() => requestNotificationPermission()}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Enable Browser Popups
                  </button>
                </div>

                <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto mt-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      Koi naya alert nahi hai. Sab shant hai! ✨
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="py-3 flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                n.type === 'call'
                                  ? 'bg-rose-500'
                                  : n.type === 'success'
                                  ? 'bg-emerald-400'
                                  : 'bg-indigo-400'
                              }`}
                            />
                            <h4 className="text-xs font-semibold text-slate-200">{n.title}</h4>
                            <span className="text-[10px] text-slate-500 ml-auto">{n.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                          {n.actionLabel && (
                            <button
                              onClick={() => {
                                if (n.onAction) n.onAction();
                                removeNotification(n.id);
                              }}
                              className="mt-2 text-[11px] font-semibold px-2 py-1 rounded bg-rose-600 text-white hover:bg-rose-500 transition"
                            >
                              {n.actionLabel}
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => removeNotification(n.id)}
                          className="text-slate-500 hover:text-slate-300 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
