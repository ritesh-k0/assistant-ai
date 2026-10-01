import React, { useState } from 'react';
import {
  Brain,
  Plus,
  Trash2,
  Edit2,
  Search,
  Sparkles,
  AlertTriangle,
  Save,
  X,
  Filter,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';
import { MemoryItem } from '../types';

export const MemoryView: React.FC = () => {
  const { memories, addMemory, updateMemory, deleteMemory, clearAllMemories } = useAssistant();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryItem['category']>('General');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const categories: MemoryItem['category'][] = [
    'Routine',
    'Family',
    'Coding',
    'Career',
    'Preferences',
    'General',
  ];

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    addMemory(newContent.trim(), newCategory, 'high');
    setNewContent('');
    setShowAddModal(false);
  };

  const handleStartEdit = (item: MemoryItem) => {
    setEditingId(item.id);
    setEditContent(item.content);
  };

  const handleSaveEdit = (id: string) => {
    if (!editContent.trim()) return;
    updateMemory(id, editContent.trim());
    setEditingId(null);
  };

  const filteredMemories = memories.filter((m) => {
    const matchesSearch = m.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Brain className="w-7 h-7 text-rose-400" />
            <span>Personal Memory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explicit long-term memories remembered by Lakshmi only when Ritesh instructs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {memories.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Kya aap Lakshmi ki saari memories delete karna chahte hain?')) {
                  clearAllMemories();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs font-semibold transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-rose-600/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Save New Memory</span>
          </button>
        </div>
      </div>

      {/* Info Notice on Explicit Consent */}
      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/25 flex items-start gap-3 text-xs text-slate-300">
        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p leading-relaxed>
          <span className="font-semibold text-white">Explicit Memory Rule: </span>
          Lakshmi only retains information when told commands like: <em>"Remember this"</em>, <em>"Isko yaad rakhna"</em>, or <em>"Save this in memory"</em>. Temporary chat details are never mixed with long-term memory.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved memories..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            All ({memories.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Memories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemories.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-500 text-sm">
            Koi memory nahi mili. Chat me Lakshmi se kahein: "Lakshmi, yaad rakhna ki..."
          </div>
        ) : (
          filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 space-y-3 shadow-md flex flex-col justify-between group transition"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 uppercase tracking-wider">
                    {mem.category}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(mem.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>

                {editingId === mem.id ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      rows={3}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-rose-500/50 text-xs text-white focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(mem.id)}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                    "{mem.content}"
                  </p>
                )}
              </div>

              {editingId !== mem.id && (
                <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-800/60 opacity-80 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleStartEdit(mem)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Edit memory"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteMemory(mem.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Delete memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Save Personal Memory</h3>

            <form onSubmit={handleAddMemory} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Information to Remember</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="e.g. Ritesh practices Java every evening from 7 PM to 8:30 PM..."
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                />
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
                  Save in Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
