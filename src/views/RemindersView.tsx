import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Bell,
  Sparkles,
  Calendar,
  AlertCircle,
  Volume2,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';
import { Reminder } from '../types';

export const RemindersView: React.FC = () => {
  const {
    reminders,
    addReminder,
    toggleReminder,
    deleteReminder,
    requestNotificationPermission,
    speakLakshmiText,
  } = useAssistant();

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:00');
  const [type, setType] = useState<Reminder['type']>('one-time');
  const [category, setCategory] = useState('Personal');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addReminder({
      title: title.trim(),
      date,
      time,
      type,
      category,
    });

    setTitle('');
    setShowAddModal(false);
  };

  const filteredReminders = reminders.filter((r) => {
    if (filter === 'active') return !r.isCompleted;
    if (filter === 'completed') return r.isCompleted;
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-amber-400" />
            <span>Smart Reminders</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            One-time, daily, weekly, monthly and recurring reminders with browser alarms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => requestNotificationPermission()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Enable Popups</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-rose-600/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Set Reminder</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        {(['active', 'completed', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
              filter === tab
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-500 text-sm">
            Koi reminders nahi hain. Ask Lakshmi: "Kal 10 baje assignment yaad dila dena"
          </div>
        ) : (
          filteredReminders.map((rem) => (
            <div
              key={rem.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                rem.isCompleted
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-500'
                  : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600 text-slate-200 shadow-md'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => toggleReminder(rem.id)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition shrink-0 ${
                    rem.isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-600 hover:border-amber-400'
                  }`}
                >
                  {rem.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div className="min-w-0 flex-1">
                  <h3
                    className={`text-sm font-semibold truncate ${
                      rem.isCompleted ? 'line-through text-slate-500' : 'text-white'
                    }`}
                  >
                    {rem.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span className="font-mono text-amber-400 font-medium">⏰ {rem.time}</span>
                    <span>•</span>
                    <span>📅 {rem.date}</span>
                    <span>•</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">
                      {rem.type}
                    </span>
                    <span className="text-slate-500">{rem.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => speakLakshmiText(`Ritesh, aapka reminder hai: ${rem.title}`)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Test Lakshmi audio alert"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteReminder(rem.id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Delete reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create Smart Reminder</h3>

            <form onSubmit={handleAddReminder} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Reminder Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Kal 7 baje Java practice"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Time</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Recurrence</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="one-time">One-Time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="recurring">Recurring</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Family">Family</option>
                    <option value="Coding">Coding</option>
                    <option value="College">College</option>
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
