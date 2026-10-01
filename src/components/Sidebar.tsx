import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Mic,
  Calendar,
  Clock,
  CheckSquare,
  Repeat,
  Brain,
  Phone,
  Heart,
  Share2,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';
import { ActiveTab, useAssistant } from '../context/AssistantContext';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, tasks, reminders, callMessages, routine } = useAssistant();

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const activeRemindersCount = reminders.filter((r) => !r.isCompleted).length;
  const newCallMessagesCount = callMessages.filter((m) => m.status === 'new').length;
  const remainingRoutineCount = routine.filter((r) => !r.isCompletedToday && r.enabled).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Ask Lakshmi', icon: MessageSquare },
    { id: 'voice', label: 'Voice Assistant', icon: Mic },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    {
      id: 'reminders',
      label: 'Reminders',
      icon: Clock,
      badge: activeRemindersCount > 0 ? activeRemindersCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'routine',
      label: 'Daily Routine',
      icon: Repeat,
      badge: remainingRoutineCount > 0 ? `${remainingRoutineCount} left` : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    { id: 'memory', label: 'Memory', icon: Brain },
    {
      id: 'calls',
      label: 'Calls',
      icon: Phone,
      badge: newCallMessagesCount > 0 ? newCallMessagesCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    { id: 'contacts', label: 'Important Contacts', icon: Heart },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow">
              ल
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">Lakshmi</div>
              <div className="text-[11px] text-slate-400">Personal AI</div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-rose-600/15 text-rose-300 border border-rose-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-rose-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: Quick status */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-xs text-slate-300 font-medium">Assistant Active</div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">v1.0</span>
          </div>
          <div className="mt-2 text-[11px] text-center text-slate-500">
            Dedicated to Ritesh Kumar
          </div>
        </div>
      </aside>
    </>
  );
};
