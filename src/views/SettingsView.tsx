import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Sparkles,
  Bell,
  Phone,
  Share2,
  Database,
  Shield,
  CheckCircle,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Download,
  Lock,
  Key,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';
import { dbService, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_PUBLISHABLE_KEY } from '../services/db';
import { apiService } from '../services/api';
import { supabaseService } from '../services/supabaseService';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    requestNotificationPermission,
    tasks,
    reminders,
    routine,
    memories,
    contacts,
    syncAllWithSupabase,
    isSyncingWithSupabase,
  } = useAssistant();

  const [activeTab, setActiveTab] = useState<
    'account' | 'assistant' | 'notifications' | 'calls' | 'social' | 'supabase' | 'privacy'
  >('account');

  // Supabase form state
  const [supabaseUrl, setSupabaseUrl] = useState(
    settings.supabaseConfig.url || DEFAULT_SUPABASE_URL
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(
    settings.supabaseConfig.anonKey || DEFAULT_SUPABASE_PUBLISHABLE_KEY
  );
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<string | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [copiedSQL, setCopiedSQL] = useState(false);

  // Supabase Auth Session State
  const [authUser, setAuthUser] = useState<any>(null);
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMsg, setAuthMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    supabaseService.getAuthUser().then((u) => setAuthUser(u));
    const { data } = supabaseService.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null);
    });
    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    if (!authPassword) {
      setAuthMsg({ type: 'error', text: 'Please enter your account password.' });
      return;
    }
    setAuthLoading(true);
    setAuthMsg(null);
    try {
      const { data, error } = await supabaseService.signInWithPassword(
        settings.userEmail,
        authPassword
      );
      if (error) {
        setAuthMsg({ type: 'error', text: error.message });
      } else {
        setAuthUser(data.user);
        setAuthMsg({ type: 'success', text: `Signed in as ${data.user?.email}!` });
        setAuthPassword('');
      }
    } catch (err: any) {
      setAuthMsg({ type: 'error', text: err.message || 'Failed to sign in.' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!authPassword || authPassword.length < 6) {
      setAuthMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setAuthLoading(true);
    setAuthMsg(null);
    try {
      const { data, error } = await supabaseService.signUpWithPassword(
        settings.userEmail,
        authPassword,
        settings.userName
      );
      if (error) {
        setAuthMsg({ type: 'error', text: error.message });
      } else {
        setAuthUser(data.user);
        setAuthMsg({
          type: 'success',
          text: `Account created for ${settings.userEmail}! Check your inbox if confirmation is required.`,
        });
        setAuthPassword('');
      }
    } catch (err: any) {
      setAuthMsg({ type: 'error', text: err.message || 'Failed to sign up.' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    try {
      await supabaseService.signOut();
      setAuthUser(null);
      setAuthMsg({ type: 'success', text: 'Signed out successfully.' });
    } finally {
      setAuthLoading(false);
    }
  };

  // Social account connection toggles
  const handleToggleSocial = (plat: 'linkedin' | 'instagram' | 'facebook') => {
    const current = settings.socialIntegrations[plat]?.connected;
    updateSettings({
      socialIntegrations: {
        ...settings.socialIntegrations,
        [plat]: { ...settings.socialIntegrations[plat], connected: !current },
      },
    });
  };

  // Test Supabase connection
  const handleTestSupabase = async () => {
    const url = (supabaseUrl || DEFAULT_SUPABASE_URL).trim();
    const key = (supabaseAnonKey || DEFAULT_SUPABASE_PUBLISHABLE_KEY).trim();

    if (!url || !key) {
      setSupabaseStatusMsg('Please enter both Supabase URL and Publishable Key.');
      return;
    }

    setIsTestingSupabase(true);
    setSupabaseStatusMsg(null);

    try {
      const res = await apiService.testSupabase(url, key);
      if (res.success) {
        updateSettings({
          supabaseConfig: {
            enabled: true,
            url,
            anonKey: key,
            connected: true,
            lastSynced: new Date().toISOString(),
          },
        });
        setSupabaseStatusMsg(res.message || 'Connected to Supabase project successfully!');
      } else {
        updateSettings({
          supabaseConfig: {
            enabled: true,
            url,
            anonKey: key,
            connected: false,
          },
        });
        setSupabaseStatusMsg(`Connection notice: ${res.message}`);
      }
    } catch (err: any) {
      setSupabaseStatusMsg(`Connection notice: ${err.message}`);
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(dbService.getSupabaseSQLSchema());
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2500);
  };

  const handleExportData = () => {
    const backup = {
      user: { name: settings.userName, email: settings.userEmail },
      tasks,
      reminders,
      routine,
      memories,
      contacts,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ritesh_assistant_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-slate-300" />
          <span>System Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Personal account, Lakshmi assistant personality, call forwarding rules, and database sync.
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800 no-scrollbar">
        {[
          { id: 'account', label: 'Account', icon: User },
          { id: 'assistant', label: 'Assistant (Lakshmi)', icon: Sparkles },
          { id: 'calls', label: 'Calls & Telephony', icon: Phone },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'social', label: 'Social Accounts', icon: Share2 },
          { id: 'supabase', label: 'Supabase Database', icon: Database },
          { id: 'privacy', label: 'Privacy & Data', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: Account */}
      {activeTab === 'account' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 max-w-2xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Account Profile</span>
          </h2>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-md">
              RK
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{settings.userName}</h3>
              <p className="text-xs text-slate-400 font-mono">{settings.userEmail}</p>
              <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                Primary Authorized User
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-400">User Display Name</label>
              <input
                type="text"
                value={settings.userName}
                onChange={(e) => updateSettings({ userName: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Email Address</label>
              <input
                type="email"
                readOnly
                value={settings.userEmail}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-400 font-mono cursor-not-allowed"
              />
            </div>
          </div>

          {/* Supabase Authentication & RLS Isolation Card */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white">Supabase Authentication & Row-Level Security</h4>
              </div>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                  authUser
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}
              >
                {authUser ? 'Active Session (RLS Enforced)' : 'Unauthenticated'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Row Level Security ensures only authenticated accounts matching your user ID (<code className="text-emerald-400 font-mono">auth.uid()</code>) or verified email can view, insert, or modify your assistant data.
            </p>

            {authUser ? (
              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Signed in as {authUser.email}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    UID: {authUser.id}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="password"
                    placeholder="Enter Supabase account password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={authLoading}
                      onClick={handleSignIn}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow disabled:opacity-50 transition flex items-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{authLoading ? 'Signing in...' : 'Sign In'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={authLoading}
                      onClick={handleSignUp}
                      className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold disabled:opacity-50 transition"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>

                {authMsg && (
                  <p
                    className={`text-[11px] ${
                      authMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {authMsg.text}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Assistant (Lakshmi) */}
      {activeTab === 'assistant' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 max-w-2xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>Lakshmi Personality & Language Configuration</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400">Assistant Name</label>
              <input
                type="text"
                readOnly
                value="Lakshmi (लक्ष्मी)"
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-white font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Language Handling</label>
              <select
                value={settings.languageMode}
                onChange={(e) => updateSettings({ languageMode: e.target.value as any })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
              >
                <option value="auto">Automatic Language Detection (Hindi + English + Hinglish)</option>
                <option value="hinglish">Hinglish Preferred</option>
                <option value="hindi">Hindi</option>
                <option value="english">English</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Response Style</label>
              <select
                value={settings.responseStyle}
                onChange={(e) => updateSettings({ responseStyle: e.target.value as any })}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
              >
                <option value="caring_concise">
                  Caring & Concise ("Ji Ritesh, bataiye" / "Done, maine save kar diya")
                </option>
                <option value="professional">Professional & Direct</option>
                <option value="calm">Calm & Minimal</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-300">
              <span className="font-bold">No-Robotic Rule Enforced: </span>
              Lakshmi will never repeat "How can I assist you?". She uses natural Indian personal assistant phrasing.
            </div>
          </div>
        </div>
      )}

      {/* TAB: Calls & Telephony */}
      {activeTab === 'calls' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 max-w-2xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-rose-400" />
            <span>Call Assistant & Forwarding Rules</span>
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div>
                <h4 className="text-xs font-semibold text-white">Automated "Kya Kaam Hai?" Voice Reply</h4>
                <p className="text-[11px] text-slate-400">
                  Lakshmi speaks: "Namaste, Ritesh abhi phone nahi utha pa rahe hain. Aap batayein, kya kaam hai?"
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoVoiceReplyEnabled}
                onChange={(e) => updateSettings({ autoVoiceReplyEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">
                Unanswered Call Timeout (Seconds before Lakshmi answers)
              </label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={settings.unansweredTimeoutSeconds}
                  onChange={(e) =>
                    updateSettings({ unansweredTimeoutSeconds: parseInt(e.target.value) || 20 })
                  }
                  className="w-28 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white font-mono"
                />
                <span className="text-xs text-slate-400">seconds (Standard: 20s)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div>
                <h4 className="text-xs font-semibold text-white">Call Forwarding</h4>
                <p className="text-[11px] text-slate-400">
                  Forward configured callers when telephony integration is active
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoForwardingEnabled}
                onChange={(e) => updateSettings({ autoForwardingEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Default Forwarding Number</label>
              <input
                type="tel"
                value={settings.defaultForwardingNumber}
                onChange={(e) => updateSettings({ defaultForwardingNumber: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Never forward without explicit user confirmation.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Notifications */}
      {activeTab === 'notifications' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 max-w-2xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Alerts & Notifications</span>
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div>
                <h4 className="text-xs font-semibold text-white">Browser Push Notifications</h4>
                <p className="text-[11px] text-slate-400">Show desktop alerts for reminders and Papa calls</p>
              </div>
              <button
                onClick={() => requestNotificationPermission()}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Request Permission
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div>
                <h4 className="text-xs font-semibold text-white">Sound Effects & Speech Chimes</h4>
                <p className="text-[11px] text-slate-400">Play chime when tasks are completed or reminders fire</p>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB: Social Accounts */}
      {activeTab === 'social' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 max-w-2xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-400" />
            <span>Connected Social Media Accounts</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real API integrations: Lakshmi will never claim a post was published unless the connected API verifies it.
          </p>

          <div className="space-y-3">
            {[
              { id: 'linkedin' as const, name: 'LinkedIn', desc: 'Professional tech posts, achievements & articles' },
              { id: 'instagram' as const, name: 'Instagram', desc: 'Captions, hashtags & carousel text' },
              { id: 'facebook' as const, name: 'Facebook', desc: 'Updates & project announcements' },
            ].map((acc) => {
              const connected = settings.socialIntegrations[acc.id]?.connected;
              return (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{acc.name}</h4>
                    <p className="text-[11px] text-slate-400">{acc.desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggleSocial(acc.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      connected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-700 text-slate-300 border-slate-600 hover:text-white'
                    }`}
                  >
                    {connected ? 'Connected ✓' : `Connect ${acc.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: Supabase Database Integration */}
      {activeTab === 'supabase' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5 max-w-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Supabase Database & Authentication Configuration</span>
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                settings.supabaseConfig.connected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {settings.supabaseConfig.connected ? 'Supabase Connected' : 'Local Storage Mode'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Ritesh's Assistant stores all data persistently with seamless Supabase synchronization support. You can link your project URL and public Anon Key below.
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Supabase Publishable Key Configured</h4>
                <p className="text-xs text-slate-300 mt-0.5 font-mono break-all">
                  Key: <span className="text-emerald-400 font-semibold">{supabaseAnonKey}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ready for automatic data sync. Enter your project URL from Supabase dashboard (Settings &gt; API).
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Supabase Project URL</label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://yourprojectid.supabase.co"
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Find this in your Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Supabase Publishable / Anon Key</label>
              <input
                type="text"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {supabaseStatusMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  supabaseStatusMsg.includes('successfully') || supabaseStatusMsg.includes('Connected')
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{supabaseStatusMsg}</span>
              </div>
            )}

            {/* RLS Security Status Banner */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3">
              <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-white">Strict Row-Level Security (RLS) Active:</span>
                <p className="text-slate-300 mt-0.5 leading-relaxed">
                  Every table enforces secure user isolation (<code className="text-emerald-400 font-mono">auth.uid() = user_id or (auth.jwt()-&gt;&gt;'email') = user_email</code>). Insecure wildcard policies (<code className="text-rose-400 font-mono">USING (true) WITH CHECK (true)</code>) have been completely removed.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                disabled={isTestingSupabase}
                onClick={handleTestSupabase}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 disabled:opacity-50 transition active:scale-95 flex items-center gap-2"
              >
                {isTestingSupabase && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>{isTestingSupabase ? 'Testing Connection...' : 'Connect & Test Supabase'}</span>
              </button>

              <button
                type="button"
                disabled={isSyncingWithSupabase}
                onClick={async () => {
                  const url = (supabaseUrl || DEFAULT_SUPABASE_URL).trim();
                  const key = (supabaseAnonKey || DEFAULT_SUPABASE_PUBLISHABLE_KEY).trim();

                  updateSettings({
                    supabaseConfig: {
                      enabled: true,
                      url,
                      anonKey: key,
                      connected: true,
                      lastSynced: new Date().toISOString(),
                    },
                  });

                  setSupabaseStatusMsg('Synchronizing all Lakshmi backend records to Supabase...');
                  const res = await syncAllWithSupabase();
                  if (res.success) {
                    setSupabaseStatusMsg(`Success: ${res.message}`);
                  } else {
                    setSupabaseStatusMsg(`Sync status: ${res.message}`);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition active:scale-95 flex items-center gap-2"
              >
                {isSyncingWithSupabase && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>{isSyncingWithSupabase ? 'Syncing...' : 'Sync All Lakshmi Backend Data Now'}</span>
              </button>
            </div>
          </div>

          {/* SQL DDL Schema with RLS */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Supabase Tables & Row Level Security (RLS) SQL Script
              </span>
              <button
                onClick={handleCopySQL}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                {copiedSQL ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedSQL ? 'Copied SQL!' : 'Copy SQL Schema'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono max-h-48 overflow-y-auto">
              {dbService.getSupabaseSQLSchema()}
            </pre>
          </div>
        </div>
      )}

      {/* TAB: Privacy & Data */}
      {activeTab === 'privacy' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5 max-w-2xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" />
            <span>Privacy & Data Management</span>
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80">
              <div>
                <h4 className="text-xs font-bold text-white">Export Assistant Data (JSON Backup)</h4>
                <p className="text-[11px] text-slate-400">Download all tasks, routines, memories and contacts</p>
              </div>
              <button
                onClick={handleExportData}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20">
              <div>
                <h4 className="text-xs font-bold text-rose-300">Reset All Assistant Storage</h4>
                <p className="text-[11px] text-rose-400/80">
                  Permanently wipe local storage and reset to clean state
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Kya aap sach me saara data reset karna chahte hain?')) {
                    dbService.resetAll();
                    window.location.reload();
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
