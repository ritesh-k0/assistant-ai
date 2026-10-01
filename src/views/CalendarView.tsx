import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';
import { CalendarEvent } from '../types';

export const CalendarView: React.FC = () => {
  const { calendarEvents, addCalendarEvent, deleteCalendarEvent } = useAssistant();

  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Event Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('College');
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addCalendarEvent({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      startTime,
      endTime,
      location: location.trim() || undefined,
      category,
      recurring,
    });

    setTitle('');
    setDescription('');
    setLocation('');
    setShowAddModal(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = calendarEvents.filter((e) => e.date === todayStr);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-7 h-7 text-indigo-400" />
            <span>Calendar & Schedule</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            College lectures, coding sessions, project meetings and daily schedule.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  viewMode === mode
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-rose-600/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Today's Schedule Highlight */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h2 className="text-sm font-bold text-white">Today's Schedule ({todayEvents.length} events)</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {todayEvents.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            Aaj ke liye koi calendar event schedule nahi hai.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2 relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-white leading-tight">{ev.title}</span>
                  <button
                    onClick={() => deleteCalendarEvent(ev.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {ev.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-2">{ev.description}</p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-indigo-300 font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    {ev.startTime} - {ev.endTime}
                  </span>
                  {ev.location && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3 h-3" />
                      {ev.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Upcoming Events List */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white">All Scheduled Events</h2>

        <div className="divide-y divide-slate-800">
          {calendarEvents.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">Koi event nahi hai.</div>
          ) : (
            calendarEvents.map((ev) => (
              <div
                key={ev.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{ev.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-indigo-300">
                      {ev.category}
                    </span>
                    {ev.recurring !== 'none' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {ev.recurring}
                      </span>
                    )}
                  </div>
                  {ev.description && (
                    <p className="text-xs text-slate-400">{ev.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>📅 {ev.date}</span>
                    <span>⏰ {ev.startTime} - {ev.endTime}</span>
                    {ev.location && <span>📍 {ev.location}</span>}
                  </div>
                </div>

                <button
                  onClick={() => deleteCalendarEvent(ev.id)}
                  className="self-end sm:self-center p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Delete event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Add New Event</h3>

            <form onSubmit={handleAddEvent} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Java Lab Exam / Team Standup"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes or agenda"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
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
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="College">College</option>
                    <option value="Coding">Coding</option>
                    <option value="Project">Project</option>
                    <option value="Personal">Personal</option>
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
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Location / Link</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Google Meet / Lab 4"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Recurring</label>
                <select
                  value={recurring}
                  onChange={(e) => setRecurring(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
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
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
