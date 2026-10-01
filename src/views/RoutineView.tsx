import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sun,
  Coffee,
  Sunset,
  Moon,
  Sparkles,
  Edit2,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';
import { RoutineItem, RoutinePeriod } from '../types';

export const RoutineView: React.FC = () => {
  const { routine, toggleRoutineCompleted, updateRoutineItem, addRoutineItem } = useAssistant();

  const [activePeriod, setActivePeriod] = useState<RoutinePeriod | 'All'>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState<RoutinePeriod>('Morning');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('08:00');
  const [category, setCategory] = useState('Coding');

  const periods: { name: RoutinePeriod; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { name: 'Morning', icon: Sun, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { name: 'Afternoon', icon: Coffee, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
    { name: 'Evening', icon: Sunset, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { name: 'Night', icon: Moon, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addRoutineItem({
      title: title.trim(),
      period,
      startTime,
      endTime,
      category,
      days: ['Daily'],
      enabled: true,
    });

    setTitle('');
    setShowAddModal(false);
  };

  const completedCount = routine.filter((r) => r.isCompletedToday).length;
  const progressPercent = routine.length > 0 ? Math.round((completedCount / routine.length) * 100) : 0;

  const filteredRoutine = routine.filter((r) => activePeriod === 'All' || r.period === activePeriod);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Repeat className="w-7 h-7 text-emerald-400" />
            <span>Daily Routine Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Morning, Afternoon, Evening, and Night routines for discipline & consistency.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-600/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Routine Block</span>
        </button>
      </div>

      {/* Progress tracker banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Today's Routine Completion</h2>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {completedCount} / {routine.length} done ({progressPercent}%)
          </span>
        </div>

        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          onClick={() => setActivePeriod('All')}
          className={`py-2.5 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activePeriod === 'All'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <span>All Routine ({routine.length})</span>
        </button>

        {periods.map((p) => {
          const Icon = p.icon;
          const count = routine.filter((r) => r.period === p.name).length;
          const isActive = activePeriod === p.name;
          return (
            <button
              key={p.name}
              onClick={() => setActivePeriod(p.name)}
              className={`py-2.5 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{p.name} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Routine Blocks List */}
      <div className="space-y-3">
        {filteredRoutine.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleRoutineCompleted(item.id)}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
              item.isCompletedToday
                ? 'bg-emerald-950/20 border-emerald-500/20 text-slate-400'
                : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600 text-slate-200 shadow-md'
            }`}
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <button
                type="button"
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition shrink-0 ${
                  item.isCompletedToday
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-600 hover:border-emerald-400'
                }`}
              >
                {item.isCompletedToday && <CheckCircle2 className="w-4 h-4" />}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3
                    className={`text-sm font-semibold truncate ${
                      item.isCompletedToday ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {item.period}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                    {item.category}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-medium">
                    ⏰ {item.startTime} - {item.endTime}
                  </span>
                  <span>•</span>
                  <span>{item.days.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              {item.isCompletedToday ? 'Completed Today ✓' : 'Tap to mark done'}
            </div>
          </div>
        ))}
      </div>

      {/* Add Routine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Add Routine Block</h3>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Activity Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Java Practice / Yoga / Revision"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Period</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as RoutinePeriod)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Coding">Coding</option>
                    <option value="College">College</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
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
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30"
                >
                  Save Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
