import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  PhoneCall,
  Share2,
  Send,
  Mic,
  ArrowRight,
  TrendingUp,
  Heart,
  Repeat,
  AlertCircle,
  Sun,
  Moon,
  Coffee,
  CheckSquare,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';

export const DashboardView: React.FC = () => {
  const {
    settings,
    tasks,
    toggleTaskStatus,
    reminders,
    toggleReminder,
    routine,
    toggleRoutineCompleted,
    calendarEvents,
    callMessages,
    socialDrafts,
    chatMessages,
    sendUserMessage,
    isAiThinking,
    setActiveTab,
    simulateIncomingCall,
  } = useAssistant();

  const [quickInput, setQuickInput] = useState('');

  // Determine greeting based on current time
  const hour = new Date().getHours();
  let greeting = 'Good Morning';
  let GreetingIcon = Sun;
  if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon';
    GreetingIcon = Coffee;
  } else if (hour >= 17) {
    greeting = 'Good Evening';
    GreetingIcon = Moon;
  }

  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const activeReminders = reminders.filter((r) => !r.isCompleted);
  const completedRoutineItems = routine.filter((r) => r.isCompletedToday).length;
  const routineProgress = routine.length > 0 ? Math.round((completedRoutineItems / routine.length) * 100) : 0;
  const newMessages = callMessages.filter((m) => m.status === 'new');

  const handleQuickChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    sendUserMessage(quickInput);
    setQuickInput('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-indigo-950/60 border border-rose-500/20 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 text-rose-400 font-semibold text-sm mb-2">
              <GreetingIcon className="w-4 h-4 text-rose-400" />
              <span>{greeting}, Ritesh Kumar 👋</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 text-xs font-normal">{currentDateFormatted}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Lakshmi is here to assist you today.
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Hindi, English aur Hinglish me baat karein. Aapki routine, tasks, reminders, Papa ke calls aur coding goals sab monitor ho rahe hain.
            </p>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                onClick={() => setActiveTab('voice')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-rose-600/30 transition active:scale-95"
              >
                <Mic className="w-4 h-4" />
                <span>Talk to Lakshmi</span>
              </button>
              <button
                onClick={() => simulateIncomingCall('contact-papa')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-medium transition active:scale-95"
              >
                <Heart className="w-4 h-4 text-rose-400 fill-rose-500/20" />
                <span>Simulate Papa Call Rule</span>
              </button>
            </div>
          </div>

          {/* Assistant Widget Mini Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:w-80 shrink-0 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                  ल
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Lakshmi Status</div>
                  <div className="text-[10px] text-slate-400">Personal AI Active</div>
                </div>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Daily Routine Done:</span>
                <span className="font-semibold text-emerald-400">{routineProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${routineProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-slate-300 pt-1">
                <span className="text-slate-400">Pending Tasks:</span>
                <span className="font-semibold text-indigo-400">{pendingTasks.length} tasks</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Unread Call Notes:</span>
                <span className="font-semibold text-rose-400">{newMessages.length} msgs</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                <span className="text-slate-400">Supabase Storage:</span>
                <span
                  onClick={() => setActiveTab('settings')}
                  className="font-semibold text-emerald-400 cursor-pointer hover:underline"
                >
                  {settings.supabaseConfig.connected ? 'Connected ✓' : 'Key Ready (sb_pub...)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Night Summary Card (if after 21:00) */}
      {hour >= 21 && (
        <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-slate-200">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm mb-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>Lakshmi's Daily Night Summary</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block">Completed Routine</span>
              <span className="text-base font-bold text-emerald-400">{completedRoutineItems} / {routine.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block">Pending Tasks</span>
              <span className="text-base font-bold text-amber-400">{pendingTasks.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block">Missed / Handled Calls</span>
              <span className="text-base font-bold text-rose-400">{newMessages.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block">Tomorrow's Schedule</span>
              <span className="text-base font-bold text-indigo-400">Ready</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Tasks & Routine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-base text-white">Today's Tasks</h2>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>View All ({tasks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {pendingTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Aapke aaj ke sabhi tasks complete hain! Bohat badhiya, Ritesh! 🎉
              </div>
            ) : (
              pendingTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTaskStatus(task.id)}
                  className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-start gap-3 cursor-pointer transition group"
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                      task.status === 'completed'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-600 group-hover:border-indigo-400'
                    }`}
                  >
                    {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                        {task.title}
                      </h4>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          task.priority === 'urgent'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : task.priority === 'high'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {task.category}
                      </span>
                      {task.time && <span>⏰ {task.time}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Routine */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Repeat className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-base text-white">Daily Routine Progress</h2>
            </div>
            <button
              onClick={() => setActiveTab('routine')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <span>Manage Routine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
            {routine.slice(0, 5).map((item) => (
              <div
                key={item.id}
                onClick={() => toggleRoutineCompleted(item.id)}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                  item.isCompletedToday
                    ? 'bg-emerald-950/20 border-emerald-500/20 text-slate-400 line-through'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                      item.isCompletedToday
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-600'
                    }`}
                  >
                    {item.isCompletedToday && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium">{item.title}</h4>
                    <span className="text-[10px] text-slate-500">
                      {item.period} • {item.startTime} - {item.endTime}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Upcoming Reminders, Calendar & Important Calls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upcoming Reminders */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Smart Reminders</h3>
            </div>
            <button
              onClick={() => setActiveTab('reminders')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              All
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {activeReminders.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">No active reminders.</div>
            ) : (
              activeReminders.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  onClick={() => toggleReminder(r.id)}
                  className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{r.title}</div>
                    <div className="text-[10px] text-amber-400 mt-0.5">
                      ⏰ {r.time} ({r.type})
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-slate-600 hover:text-amber-400 transition shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Calendar Events */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Today's Schedule</h3>
            </div>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Calendar
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {calendarEvents.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">No events scheduled.</div>
            ) : (
              calendarEvents.slice(0, 3).map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60"
                >
                  <div className="text-xs font-semibold text-slate-200">{ev.title}</div>
                  <div className="text-[10px] text-indigo-400 mt-0.5">
                    {ev.startTime} - {ev.endTime} {ev.location ? `• ${ev.location}` : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Important Calls & Messages Captured */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-rose-400" />
              <h3 className="font-bold text-sm text-white">Call Messages</h3>
            </div>
            <button
              onClick={() => setActiveTab('calls')}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium"
            >
              History
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {callMessages.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">No unanswered messages.</div>
            ) : (
              callMessages.slice(0, 2).map((msg) => (
                <div
                  key={msg.id}
                  className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-300 flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                      {msg.callerName}
                    </span>
                    <span className="text-[10px] text-slate-500">Auto-saved</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 italic leading-relaxed">
                    "{msg.message}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Ask Lakshmi Chat Input */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <h3 className="font-bold text-sm text-white">Quick AI Command for Lakshmi</h3>
          </div>
          <span className="text-xs text-slate-400">Hindi • English • Hinglish</span>
        </div>

        <form onSubmit={handleQuickChat} className="flex gap-2">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder='Try: "Kal 7 baje Java practice yaad dila dena" or "Aaj kya routine hai?"'
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
          />
          <button
            type="submit"
            disabled={isAiThinking}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-rose-600/30 flex items-center gap-2 transition disabled:opacity-50"
          >
            {isAiThinking ? (
              <span className="animate-spin text-sm">⏳</span>
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => sendUserMessage('Aaj mera schedule kya hai?')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
          >
            "Aaj mera schedule kya hai?"
          </button>
          <button
            type="button"
            onClick={() => sendUserMessage('Kal 7 baje Java practice reminder set karo')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
          >
            "Kal 7 baje Java practice reminder"
          </button>
          <button
            type="button"
            onClick={() => sendUserMessage('Mere LinkedIn ke liye ek post banaiye')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
          >
            "LinkedIn post draft"
          </button>
        </div>
      </div>
    </div>
  );
};
