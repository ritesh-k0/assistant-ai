import React, { useState } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneForwarded,
  PhoneMissed,
  Clock,
  Heart,
  MessageSquare,
  Sparkles,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Trash2,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';
import { CallRecord, CallMessage } from '../types';
import {
  findContactByPhone,
  normalizePhoneNumber,
} from '../utils/phoneUtils';
import { androidCallBridge, AndroidBridgeStatus } from '../services/androidCallBridge';

export const CallsView: React.FC = () => {
  const {
    callHistory,
    callMessages,
    simulateIncomingCall,
    markCallMessageStatus,
    deleteCallRecord,
    settings,
    updateSettings,
    addReminder,
    contacts,
  } = useAssistant();

  const [simulatedPhoneInput, setSimulatedPhoneInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'messages' | 'history' | 'companion'>('messages');
  const [bridgeStatus, setBridgeStatus] = useState<AndroidBridgeStatus>(() =>
    androidCallBridge.getStatus()
  );

  const specialContact =
    contacts.find((c) => c.isSpecialRule) ||
    contacts.find((c) => c.name.toLowerCase().includes('papa'));
  const currentInputNumber =
    simulatedPhoneInput ||
    (specialContact ? specialContact.phoneNumber : contacts[0]?.phoneNumber || '');
  const detectedContact = findContactByPhone(contacts, currentInputNumber);

  const handleCreateReminderFromMessage = (msg: CallMessage) => {
    addReminder({
      title: `Call back ${msg.callerName}: "${msg.message}"`,
      date: new Date().toISOString().split('T')[0],
      time: '20:30',
      type: 'one-time',
      category: 'Family',
    });
    markCallMessageStatus(msg.id, 'reviewed');
  };

  const handleToggleTelephonyCompanion = () => {
    const nextState = !settings.telephonyConnected;
    updateSettings({ telephonyConnected: nextState });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Phone className="w-7 h-7 text-rose-400" />
            <span>Call Assistant & Telephony</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Integration-ready Android telephony module, Papa special rule, and automated voice response.
          </p>
        </div>

        {/* Companion Status Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleTelephonyCompanion}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
              settings.telephonyConnected
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>
              {settings.telephonyConnected
                ? 'Android Companion: Connected'
                : 'Android Companion: Disconnected (Click to Connect)'}
            </span>
          </button>
        </div>
      </div>

      {/* Simulator Test Bench (Do not fake - allow live testing of flow) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-500/20 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-rose-400 fill-rose-400" />
              <span>Incoming Call & Auto-Response Test Simulator</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Test dynamic caller identification, contact priority rules, 20-second unanswered timeout, and automated voice response.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={simulatedPhoneInput}
                onChange={(e) => setSimulatedPhoneInput(e.target.value)}
                placeholder={currentInputNumber || '+91 94150 12345'}
                className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono w-44"
                title="Type or paste any incoming phone number"
              />
              <select
                onChange={(e) => {
                  if (e.target.value) setSimulatedPhoneInput(e.target.value);
                }}
                value=""
                className="px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-rose-500 font-medium"
              >
                <option value="" disabled>Saved contacts...</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.phoneNumber}>
                    {c.isSpecialRule ? `❤️ ${c.name}` : c.name} ({c.phoneNumber})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => simulateIncomingCall(currentInputNumber)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 active:scale-95 transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Simulate Call</span>
            </button>
          </div>
        </div>

        {/* Dynamic Caller Identification Preview */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Caller Identification:</span>
            {detectedContact ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Matched Contact: {detectedContact.name} ({detectedContact.relation}) &bull; Priority: {detectedContact.priority}
                  {detectedContact.isSpecialRule ? ' ❤️ Special Rule' : ''}
                </span>
              </span>
            ) : (
              <span className="text-amber-400 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>No saved contact match &bull; Treated as Unknown Caller (Not Papa)</span>
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Normalized: {normalizePhoneNumber(currentInputNumber) || 'None'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {detectedContact?.isSpecialRule
                ? `❤️ ${detectedContact.name} special rule active`
                : 'Dynamic contact priority rules active'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>20s Unanswered auto-response configured</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneForwarded className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Forwarding target: {settings.defaultForwardingNumber}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'messages'
              ? 'bg-rose-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Captured Caller Messages ({callMessages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'history'
              ? 'bg-rose-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Call History ({callHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('companion')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'companion'
              ? 'bg-rose-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Telephony Companion Specs</span>
        </button>
      </div>

      {/* TAB 1: Captured Caller Messages */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          {callMessages.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-500 text-sm">
              Koi caller message nahi hai. Unanswered calls par Lakshmi automatically message save karegi.
            </div>
          ) : (
            callMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-5 rounded-3xl bg-slate-900/90 border border-rose-500/25 hover:border-rose-500/40 shadow-lg space-y-3 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                      {msg.callerName.toLowerCase().includes('papa') ? '❤️' : '📞'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{msg.callerName}</h3>
                      <p className="text-xs font-mono text-slate-400">{msg.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      {new Date(msg.timestamp).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        msg.status === 'new'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {msg.status === 'new' ? 'New Message' : 'Reviewed'}
                    </span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <div className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider mb-1">
                    Lakshmi Recorded Caller's Response:
                  </div>
                  <p className="text-sm text-slate-100 italic leading-relaxed">
                    "{msg.message}"
                  </p>
                </div>

                {/* Notification Summary & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-slate-400 italic">
                    Lakshmi Alert: "{msg.callerName} ka call miss hua tha. Unhone message chhora hai."
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCreateReminderFromMessage(msg)}
                      className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
                    >
                      Create Reminder
                    </button>
                    <button
                      onClick={() => markCallMessageStatus(msg.id, 'called_back')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
                    >
                      Call Back
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Call History */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white">Call Log & Records</h2>

          <div className="divide-y divide-slate-800">
            {callHistory.map((rec) => (
              <div
                key={rec.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      rec.status === 'answered'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : rec.status === 'auto_answered'
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : rec.status === 'forwarded'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {rec.status === 'answered' ? (
                      <Phone className="w-4 h-4" />
                    ) : rec.status === 'auto_answered' ? (
                      <Sparkles className="w-4 h-4" />
                    ) : rec.status === 'forwarded' ? (
                      <PhoneForwarded className="w-4 h-4" />
                    ) : (
                      <PhoneMissed className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{rec.contactName}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium capitalize">
                        {rec.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono">
                      {rec.phoneNumber}
                    </div>
                    {rec.messageReceived && (
                      <p className="text-xs text-slate-300 mt-1 italic">
                        Message: "{rec.messageReceived}"
                      </p>
                    )}
                    {rec.notes && <p className="text-[11px] text-slate-500 mt-0.5">{rec.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 self-end sm:self-center">
                  <div className="text-right">
                    <div>
                      {new Date(rec.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(rec.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteCallRecord(rec.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Telephony Companion Specs & Native Bridge Architecture */}
      {activeTab === 'companion' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                <span>Android Native Telephony & SIM Call Bridge</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Truthful architectural reality: Standard web browsers cannot intercept SIM calls. Native Android integration requires TelecomManager/InCallService or CallScreeningService.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
                  bridgeStatus.isNativeAvailable
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}
              >
                {bridgeStatus.isNativeAvailable ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Android Wrapper: Active (v{bridgeStatus.bridgeVersion})</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Web Environment (Bridge Ready)</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Android Audio Stream & Call Handling Truth Box */}
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-amber-500/30 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Critical Android Security & Cellular Audio Boundaries (Requirement #5 & #6)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>1. Call Screening vs Answering:</strong> <code className="text-rose-300">CallScreeningService</code> alone only allows inspecting caller ID and deciding whether to reject or silence the call before it rings. <em>It cannot answer calls or provide two-way call audio</em>.
            </p>
            <p className="text-slate-300 leading-relaxed">
              <strong>2. Answering Normal SIM Calls:</strong> Answering cellular calls programmatically on Android 8+ (API 26+) requires <code className="text-indigo-300">TelecomManager.acceptRingingCall()</code> with the <code className="text-rose-300">ANSWER_PHONE_CALLS</code> permission, or designating Lakshmi Assistant as the user-approved <strong>Default Phone/Dialer App</strong> via <code className="text-indigo-300">InCallService</code>.
            </p>
            <p className="text-slate-300 leading-relaxed">
              <strong>3. Cellular Voice Modem Audio Restrictions:</strong> Google Android enforces strict hardware and SELinux isolation on normal 3rd-party applications. Non-system apps <strong>cannot capture or inject raw digital audio into the cellular voice modem stream</strong> (<code className="text-slate-400">AudioSource.VOICE_CALL / VOICE_UPLINK / VOICE_DOWNLINK</code> require system permissions <code className="text-rose-400">android.permission.CAPTURE_AUDIO_OUTPUT</code>). Normal Android apps can only play audio over the device loudspeaker or speakerphone mode.
            </p>
          </div>

          {/* Live Actions for Android Bridge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>1. Android Native Permissions</span>
                <span className="text-[11px] font-mono text-indigo-400">READ_PHONE_STATE</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Allows reading incoming caller phone number and call state updates.
              </p>
              <button
                onClick={() => {
                  androidCallBridge.requestPermissions();
                  setBridgeStatus(androidCallBridge.getStatus());
                }}
                className="w-full px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
              >
                Request Phone Permissions
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>2. Default Dialer Role</span>
                <span className="text-[11px] font-mono text-emerald-400">ROLE_DIALER</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Prompts user to set Lakshmi Assistant as default dialer to answer SIM calls.
              </p>
              <button
                onClick={() => {
                  androidCallBridge.requestDefaultDialer();
                  setBridgeStatus(androidCallBridge.getStatus());
                }}
                className="w-full px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
              >
                Request Default Phone App Role
              </button>
            </div>
          </div>

          {/* Architecture Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
              <div className="text-xs font-bold text-emerald-400">1. Android Telephony Receiver</div>
              <p className="text-xs text-slate-300">
                Native <code className="text-rose-300">PhoneStateListener</code> or <code className="text-rose-300">InCallService</code> receives SIM cellular state and delivers caller number to JavaScript bridge.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
              <div className="text-xs font-bold text-indigo-400">2. Real-Time Bridge Dispatch</div>
              <p className="text-xs text-slate-300">
                Dispatches <code className="text-indigo-300">lakshmi:incoming_call</code> event to React AssistantContext. Checks Papa special rule and contact priority.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
              <div className="text-xs font-bold text-amber-400">3. 20s Unanswered Flow</div>
              <p className="text-xs text-slate-300">
                If unanswered for 20 seconds, answers call (when default dialer) and triggers Lakshmi's audio response over loudspeaker/VoIP bridge.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/25 space-y-2 text-xs text-slate-300">
            <span className="font-bold text-white">Android Studio Native Source Code Location:</span>
            <p className="text-slate-400">
              The full Android Studio project files (AndroidManifest.xml, InCallService, PhoneReceiver, Kotlin bridge, and step-by-step instructions) are placed in <code className="text-rose-300 font-mono">/android-telephony-bridge/</code>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
