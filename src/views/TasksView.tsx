import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';
import { Task, Priority, TaskCategory, TaskStatus } from '../types';

export const TasksView: React.FC = () => {
  const { tasks, addTask, toggleTaskStatus, deleteTask } = useAssistant();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('18:00');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<TaskCategory>('Coding');
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

  const categories: TaskCategory[] = [
    'College',
    'Coding',
    'Job Preparation',
    'Project',
    'Personal',
    'Social Media',
    'Other',
  ];

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      time: time || undefined,
      priority,
      category,
      status: 'pending',
      recurring,
    });

    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-indigo-400" />
            <span>Task Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track Coding, College, Job Preparation and Project tasks for Ritesh.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-500 text-sm">
            Koi task match nahi hua. Ask Lakshmi: "Create a task for my React project"
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                task.status === 'completed'
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-500'
                  : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600 text-slate-200 shadow-md'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition shrink-0 ${
                    task.status === 'completed'
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-600 hover:border-indigo-400'
                  }`}
                >
                  {task.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={`text-sm font-semibold truncate ${
                        task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </h3>

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

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                      {task.category}
                    </span>

                    {task.recurring !== 'none' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {task.recurring}
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                    <span>📅 {task.date}</span>
                    {task.time && <span>⏰ {task.time}</span>}
                    {task.completedAt && (
                      <span className="text-emerald-400">
                        Done at {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition shrink-0"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New Task</h3>

            <form onSubmit={handleAddTask} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Java OOPs practice / React Revision"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional details..."
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Recurring</label>
                <select
                  value={recurring}
                  onChange={(e) => setRecurring(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
