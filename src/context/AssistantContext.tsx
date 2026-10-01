import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Task,
  Reminder,
  RoutineItem,
  CalendarEvent,
  MemoryItem,
  ImportantContact,
  CallRecord,
  CallMessage,
  SocialDraft,
  AssistantSettings,
  ChatMessage,
  Priority,
  TaskCategory,
  TaskStatus,
} from '../types';
import { dbService } from '../services/db';
import { apiService } from '../services/api';
import { speechService } from '../services/speech';
import { supabaseService } from '../services/supabaseService';

export type ActiveTab =
  | 'dashboard'
  | 'chat'
  | 'voice'
  | 'calendar'
  | 'reminders'
  | 'tasks'
  | 'routine'
  | 'memory'
  | 'calls'
  | 'contacts'
  | 'social'
  | 'settings';

export interface ActiveCallState {
  id: string;
  contactName: string;
  phoneNumber: string;
  relation?: string;
  isSpecialPapaRule?: boolean;
  priority: string;
  status: 'ringing' | 'connected_voice_reply' | 'recording_message' | 'message_saved' | 'forwarding' | 'ended';
  secondsRinging: number;
  callerResponse?: string;
  unansweredTimeout: number;
  forwardingStatus?: string;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'call';
  actionLabel?: string;
  onAction?: () => void;
  timestamp: string;
}

interface AssistantContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: AssistantSettings;
  updateSettings: (newSettings: Partial<AssistantSettings>) => void;
  
  // Chat
  chatMessages: ChatMessage[];
  sendUserMessage: (text: string) => Promise<void>;
  clearChat: () => void;
  isAiThinking: boolean;

  // Voice
  isListening: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  startVoiceListening: () => void;
  stopVoiceListening: () => void;
  speakLakshmiText: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  voiceTranscript: string;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  toggleTaskStatus: (id: string) => void;
  deleteTask: (id: string) => void;

  // Reminders
  reminders: Reminder[];
  addReminder: (rem: Omit<Reminder, 'id' | 'createdAt' | 'isCompleted'>) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;

  // Routine
  routine: RoutineItem[];
  toggleRoutineCompleted: (id: string) => void;
  updateRoutineItem: (item: RoutineItem) => void;
  addRoutineItem: (item: Omit<RoutineItem, 'id' | 'isCompletedToday'>) => void;

  // Calendar
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteCalendarEvent: (id: string) => void;

  // Memory
  memories: MemoryItem[];
  addMemory: (content: string, category?: MemoryItem['category'], importance?: 'normal' | 'high') => void;
  updateMemory: (id: string, content: string) => void;
  deleteMemory: (id: string) => void;
  clearAllMemories: () => void;

  // Contacts & Papa Rule
  contacts: ImportantContact[];
  addContact: (contact: Omit<ImportantContact, 'id'>) => void;
  updateContact: (contact: ImportantContact) => void;
  deleteContact: (id: string) => void;

  // Calls & Telephony
  callHistory: CallRecord[];
  callMessages: CallMessage[];
  activeCall: ActiveCallState | null;
  simulateIncomingCall: (contactIdOrName?: string) => void;
  answerIncomingCall: () => void;
  rejectIncomingCall: () => void;
  forwardIncomingCall: () => void;
  triggerVoiceAutoReply: () => void;
  submitCallerMessage: (messageText: string) => void;
  markCallMessageStatus: (id: string, status: CallMessage['status']) => void;
  deleteCallRecord: (id: string) => void;

  // Social
  socialDrafts: SocialDraft[];
  createSocialDraft: (draft: Omit<SocialDraft, 'id' | 'createdAt'>) => void;
  updateSocialDraft: (id: string, updates: Partial<SocialDraft>) => void;
  deleteSocialDraft: (id: string) => void;
  publishSocialDraft: (id: string) => Promise<{ success: boolean; message: string }>;

  // Notifications
  notifications: ToastNotification[];
  removeNotification: (id: string) => void;
  requestNotificationPermission: () => Promise<boolean>;

  // Supabase Backend Sync
  syncAllWithSupabase: () => Promise<{ success: boolean; count: number; message: string }>;
  isSyncingWithSupabase: boolean;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [settings, setSettings] = useState<AssistantSettings>(dbService.getSettings());
  const [tasks, setTasks] = useState<Task[]>(dbService.getTasks());
  const [reminders, setReminders] = useState<Reminder[]>(dbService.getReminders());
  const [routine, setRoutine] = useState<RoutineItem[]>(dbService.getRoutine());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(dbService.getCalendar());
  const [memories, setMemories] = useState<MemoryItem[]>(dbService.getMemories());
  const [contacts, setContacts] = useState<ImportantContact[]>(dbService.getContacts());
  const [callHistory, setCallHistory] = useState<CallRecord[]>(dbService.getCallHistory());
  const [callMessages, setCallMessages] = useState<CallMessage[]>(dbService.getCallMessages());
  const [socialDrafts, setSocialDrafts] = useState<SocialDraft[]>(dbService.getSocialDrafts());

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Ji Ritesh! Main Lakshmi hoon, aapki personal AI assistant. Aaj kya karna hai?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Voice state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');

  // Active incoming call state
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);
  const callRingTimerRef = useRef<any>(null);

  // Toasts
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  // Sync state to dbService
  useEffect(() => dbService.saveSettings(settings), [settings]);
  useEffect(() => dbService.saveTasks(tasks), [tasks]);
  useEffect(() => dbService.saveReminders(reminders), [reminders]);
  useEffect(() => dbService.saveRoutine(routine), [routine]);
  useEffect(() => dbService.saveCalendar(calendarEvents), [calendarEvents]);
  useEffect(() => dbService.saveMemories(memories), [memories]);
  useEffect(() => dbService.saveContacts(contacts), [contacts]);
  useEffect(() => dbService.saveCallHistory(callHistory), [callHistory]);
  useEffect(() => dbService.saveCallMessages(callMessages), [callMessages]);
  useEffect(() => dbService.saveSocialDrafts(socialDrafts), [socialDrafts]);

  // Request browser notification permission
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const addToast = (notification: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const newToast: ToastNotification = {
      ...notification,
      id: `toast-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications((prev) => [newToast, ...prev].slice(0, 8));

    // Also trigger browser notification if enabled
    if (settings.notificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`Lakshmi: ${notification.title}`, {
          body: notification.message,
          icon: '/favicon.ico',
        });
      }
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const [isSyncingWithSupabase, setIsSyncingWithSupabase] = useState(false);

  // Auto-init supabaseService if configured
  useEffect(() => {
    if (settings.supabaseConfig?.url && settings.supabaseConfig?.anonKey) {
      supabaseService.init(settings.supabaseConfig.url, settings.supabaseConfig.anonKey);
    }
  }, [settings.supabaseConfig?.url, settings.supabaseConfig?.anonKey]);

  // Startup Hydration: Read persisted Supabase records and hydrate state without losing local data
  useEffect(() => {
    let isMounted = true;

    async function hydrateAndSync() {
      try {
        const remoteData = await supabaseService.hydrateFromSupabase();
        if (!isMounted || !remoteData) return;

        if (remoteData.tasks && remoteData.tasks.length > 0) {
          setTasks((local) => {
            const remoteIds = new Set(remoteData.tasks!.map((t) => t.id));
            const localOnly = local.filter((t) => !remoteIds.has(t.id));
            return [...remoteData.tasks!, ...localOnly];
          });
        }

        if (remoteData.reminders && remoteData.reminders.length > 0) {
          setReminders((local) => {
            const remoteIds = new Set(remoteData.reminders!.map((r) => r.id));
            const localOnly = local.filter((r) => !remoteIds.has(r.id));
            return [...remoteData.reminders!, ...localOnly];
          });
        }

        if (remoteData.routine && remoteData.routine.length > 0) {
          setRoutine((local) => {
            const remoteIds = new Set(remoteData.routine!.map((ro) => ro.id));
            const localOnly = local.filter((ro) => !remoteIds.has(ro.id));
            return [...remoteData.routine!, ...localOnly];
          });
        }

        if (remoteData.memories && remoteData.memories.length > 0) {
          setMemories((local) => {
            const remoteIds = new Set(remoteData.memories!.map((m) => m.id));
            const localOnly = local.filter((m) => !remoteIds.has(m.id));
            return [...remoteData.memories!, ...localOnly];
          });
        }

        if (remoteData.contacts && remoteData.contacts.length > 0) {
          setContacts((local) => {
            const remoteIds = new Set(remoteData.contacts!.map((c) => c.id));
            const localOnly = local.filter((c) => !remoteIds.has(c.id));
            return [...remoteData.contacts!, ...localOnly];
          });
        }

        if (remoteData.callHistory && remoteData.callHistory.length > 0) {
          setCallHistory((local) => {
            const remoteIds = new Set(remoteData.callHistory!.map((ch) => ch.id));
            const localOnly = local.filter((ch) => !remoteIds.has(ch.id));
            return [...remoteData.callHistory!, ...localOnly];
          });
        }

        if (remoteData.callMessages && remoteData.callMessages.length > 0) {
          setCallMessages((local) => {
            const remoteIds = new Set(remoteData.callMessages!.map((cm) => cm.id));
            const localOnly = local.filter((cm) => !remoteIds.has(cm.id));
            return [...remoteData.callMessages!, ...localOnly];
          });
        }

        if (remoteData.socialDrafts && remoteData.socialDrafts.length > 0) {
          setSocialDrafts((local) => {
            const remoteIds = new Set(remoteData.socialDrafts!.map((sd) => sd.id));
            const localOnly = local.filter((sd) => !remoteIds.has(sd.id));
            return [...remoteData.socialDrafts!, ...localOnly];
          });
        }
      } catch (err) {
        console.warn('Initial Supabase hydration notice:', err);
      }
    }

    hydrateAndSync();

    const { data: authSub } = supabaseService.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        hydrateAndSync();
      }
    });

    return () => {
      isMounted = false;
      authSub?.subscription?.unsubscribe();
    };
  }, []);

  const updateSettings = (newSettings: Partial<AssistantSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (updated.supabaseConfig?.url && updated.supabaseConfig?.anonKey) {
        supabaseService.init(updated.supabaseConfig.url, updated.supabaseConfig.anonKey);
      }
      return updated;
    });
    addToast({
      title: 'Settings Updated',
      message: 'Aapki settings save ho gayi hain.',
      type: 'success',
    });
  };

  const syncAllWithSupabase = async (): Promise<{ success: boolean; count: number; message: string }> => {
    if (!settings.supabaseConfig?.url) {
      return {
        success: false,
        count: 0,
        message: 'Please provide your Supabase Project URL in Settings.',
      };
    }

    setIsSyncingWithSupabase(true);
    supabaseService.init(settings.supabaseConfig.url, settings.supabaseConfig.anonKey);

    const result = await supabaseService.syncAllData({
      tasks,
      reminders,
      routine,
      memories,
      contacts,
      callHistory,
      callMessages,
      socialDrafts,
      chatMessages,
    });

    setIsSyncingWithSupabase(false);

    if (result.success) {
      addToast({
        title: 'Supabase Synced',
        message: `Successfully saved ${result.count} Lakshmi assistant records to Supabase!`,
        type: 'success',
      });
      return {
        success: true,
        count: result.count,
        message: `Successfully synced ${result.count} records to Supabase!`,
      };
    } else {
      addToast({
        title: 'Supabase Notice',
        message: result.error || 'Sync encountered an issue. Ensure SQL schema is run in Supabase SQL editor.',
        type: 'warning',
      });
      return {
        success: false,
        count: 0,
        message: result.error || 'Failed to sync with Supabase.',
      };
    }
  };

  // Speak Lakshmi's response
  const speakLakshmiText = async (text: string) => {
    if (isMuted || !settings.soundEnabled) return;
    setIsSpeaking(true);

    try {
      // First try Gemini high-fidelity TTS
      const res = await apiService.getGeminiTTS(text);
      if (res.audioBase64) {
        await speechService.playBase64Audio(res.audioBase64, res.mimeType || 'audio/wav', () => {
          setIsSpeaking(false);
        });
        return;
      }
    } catch (e) {
      console.warn('Gemini TTS error, falling back to Web Speech:', e);
    }

    // Fallback to browser synthesis
    speechService.speakBrowser(text, () => {
      setIsSpeaking(false);
    }, 'female');
  };

  const stopSpeaking = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  };

  // Process Lakshmi Structured Action
  const executeLakshmiAction = (action: any) => {
    if (!action || !action.type) return;

    switch (action.type) {
      case 'create_task': {
        const { title, category = 'Coding', priority = 'medium', date, time } = action.data || {};
        if (title) {
          const newTask: Task = {
            id: `task-${Date.now()}`,
            title,
            category: (category as TaskCategory) || 'Coding',
            priority: (priority as Priority) || 'medium',
            date: date || new Date().toISOString().split('T')[0],
            time: time || '18:00',
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          setTasks((prev) => [newTask, ...prev]);
          addToast({
            title: 'Task Created',
            message: `Task "${title}" add kar diya gaya hai.`,
            type: 'success',
          });
        }
        break;
      }
      case 'create_reminder': {
        const { title, date, time = '19:00', type = 'one-time' } = action.data || {};
        if (title) {
          const newReminder: Reminder = {
            id: `rem-${Date.now()}`,
            title,
            date: date || new Date().toISOString().split('T')[0],
            time,
            type: type || 'one-time',
            category: 'Personal',
            isCompleted: false,
            createdAt: new Date().toISOString(),
          };
          setReminders((prev) => [newReminder, ...prev]);
          addToast({
            title: 'Reminder Set',
            message: `Reminder "${title}" set ho gaya (${time}).`,
            type: 'info',
          });
        }
        break;
      }
      case 'save_memory': {
        const { content, category = 'General' } = action.data || {};
        if (content) {
          addMemory(content, category, 'high');
          addToast({
            title: 'Memory Saved',
            message: 'Lakshmi ne ye jaankari yaad rakh li hai.',
            type: 'success',
          });
        }
        break;
      }
      case 'update_routine': {
        const { title, period = 'Evening', startTime = '19:00', endTime = '20:00' } = action.data || {};
        if (title) {
          addRoutineItem({
            period,
            title,
            startTime,
            endTime,
            days: ['Daily'],
            category: 'Coding',
            enabled: true,
          });
          addToast({
            title: 'Routine Updated',
            message: `Routine me "${title}" update ho gaya.`,
            type: 'success',
          });
        }
        break;
      }
      case 'create_event': {
        const { title, date, startTime = '10:00', endTime = '11:00', category = 'College' } = action.data || {};
        if (title) {
          addCalendarEvent({
            title,
            date: date || new Date().toISOString().split('T')[0],
            startTime,
            endTime,
            category,
          });
        }
        break;
      }
      case 'generate_social': {
        const { platform = 'linkedin', topic } = action.data || {};
        if (topic) {
          apiService.generateSocialPost({ platform, topic }).then((res) => {
            createSocialDraft({
              platform,
              topic,
              content: res.content,
              caption: res.caption,
              hashtags: res.hashtags,
              status: 'draft',
            });
            addToast({
              title: 'Social Draft Ready',
              message: `${platform.toUpperCase()} post draft create ho gaya.`,
              type: 'success',
            });
          });
        }
        break;
      }
      default:
        break;
    }
  };

  // Send user message in Chat or Voice
  const sendUserMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    supabaseService.syncChatMessage(userMsg);
    setIsAiThinking(true);

    try {
      const response = await apiService.sendMessage({
        message: text.trim(),
        userContext: {
          todayTasks: tasks.filter((t) => t.status !== 'completed').slice(0, 5),
          activeReminders: reminders.filter((r) => !r.isCompleted).slice(0, 5),
          recentMemories: memories.slice(0, 5),
        },
      });

      const assistantMsg: ChatMessage = {
        id: `msg-assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      if (response.action) {
        assistantMsg.actionTaken = {
          type: response.action.type as any,
          label: response.action.type.replace('_', ' ').toUpperCase(),
          data: response.action.data,
        };
        executeLakshmiAction(response.action);
      }

      setChatMessages((prev) => [...prev, assistantMsg]);
      supabaseService.syncChatMessage(assistantMsg);

      // Speak back
      speakLakshmiText(response.reply);
    } catch (err: any) {
      console.error('Error generating reply:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Ji Ritesh, main samajh gayi. Ek second me update karti hoon.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const clearChat = () => {
    setChatMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: 'Ji Ritesh, chat clear kar di gayi hai. Bataiye, kya kaam hai?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Voice recognition controls
  const startVoiceListening = () => {
    if (isListening) return;
    setIsListening(true);
    setVoiceTranscript('');

    const lang = settings.languageMode === 'hindi' ? 'hi-IN' : 'en-IN';

    speechService.startListening(
      (transcript, isFinal) => {
        setVoiceTranscript(transcript);
        if (isFinal && transcript.trim()) {
          setIsListening(false);
          sendUserMessage(transcript.trim());
          setVoiceTranscript('');
        }
      },
      (error) => {
        console.warn('Speech error:', error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      },
      lang
    );
  };

  const stopVoiceListening = () => {
    speechService.stopListening();
    setIsListening(false);
    if (voiceTranscript.trim()) {
      sendUserMessage(voiceTranscript.trim());
      setVoiceTranscript('');
    }
  };

  // Tasks actions
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    supabaseService.syncTask(newTask);
    addToast({
      title: 'Task Added',
      message: `"${newTask.title}" added to ${newTask.category}.`,
      type: 'success',
    });
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isNowCompleted = t.status !== 'completed';
          if (isNowCompleted) {
            confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
          }
          const updated = {
            ...t,
            status: (isNowCompleted ? 'completed' : 'pending') as TaskStatus,
            completedAt: isNowCompleted ? new Date().toISOString() : undefined,
          };
          supabaseService.syncTask(updated);
          return updated;
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    supabaseService.deleteTask(id);
  };

  // Reminders actions
  const addReminder = (remData: Omit<Reminder, 'id' | 'createdAt' | 'isCompleted'>) => {
    const newRem: Reminder = {
      ...remData,
      id: `rem-${Date.now()}`,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [newRem, ...prev]);
    supabaseService.syncReminder(newRem);
    addToast({
      title: 'Reminder Saved',
      message: `Reminder "${newRem.title}" set for ${newRem.time}.`,
      type: 'info',
    });
  };

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, isCompleted: !r.isCompleted };
          supabaseService.syncReminder(updated);
          return updated;
        }
        return r;
      })
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    supabaseService.deleteReminder(id);
  };

  // Routine actions
  const toggleRoutineCompleted = (id: string) => {
    setRoutine((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextVal = !item.isCompletedToday;
          if (nextVal) {
            confetti({ particleCount: 30, spread: 50 });
          }
          return { ...item, isCompletedToday: nextVal };
        }
        return item;
      })
    );
  };

  const updateRoutineItem = (updated: RoutineItem) => {
    setRoutine((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const addRoutineItem = (itemData: Omit<RoutineItem, 'id' | 'isCompletedToday'>) => {
    const newItem: RoutineItem = {
      ...itemData,
      id: `rt-${Date.now()}`,
      isCompletedToday: false,
    };
    setRoutine((prev) => [...prev, newItem]);
  };

  // Calendar actions
  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
    };
    setCalendarEvents((prev) => [...prev, newEvent]);
    addToast({
      title: 'Event Scheduled',
      message: `Event "${newEvent.title}" on ${newEvent.date}.`,
      type: 'success',
    });
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Memory actions
  const addMemory = (
    content: string,
    category: MemoryItem['category'] = 'General',
    importance: 'normal' | 'high' = 'normal'
  ) => {
    const newMem: MemoryItem = {
      id: `mem-${Date.now()}`,
      content,
      category,
      importance,
      createdAt: new Date().toISOString(),
    };
    setMemories((prev) => [newMem, ...prev]);
    supabaseService.syncMemory(newMem);
  };

  const updateMemory = (id: string, content: string) => {
    setMemories((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, content, updatedAt: new Date().toISOString() } : m
      )
    );
  };

  const deleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const clearAllMemories = () => {
    setMemories([]);
    addToast({
      title: 'Memories Cleared',
      message: 'All stored memories have been deleted.',
      type: 'warning',
    });
  };

  // Contacts actions
  const addContact = (contactData: Omit<ImportantContact, 'id'>) => {
    const newContact: ImportantContact = {
      ...contactData,
      id: `contact-${Date.now()}`,
    };
    setContacts((prev) => [...prev, newContact]);
  };

  const updateContact = (updated: ImportantContact) => {
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  // Call & Telephony actions
  const simulateIncomingCall = (contactIdOrName?: string) => {
    // Stop any existing call
    if (callRingTimerRef.current) {
      clearInterval(callRingTimerRef.current);
    }

    let caller = contacts.find((c) => c.id === contactIdOrName || c.name === contactIdOrName);
    if (!caller) {
      // Default to Papa for testing special rule
      caller = contacts.find((c) => c.isSpecialRule) || contacts[0];
    }

    const isPapa = caller.name.toLowerCase().includes('papa') || !!caller.isSpecialRule;

    const newCall: ActiveCallState = {
      id: `call-live-${Date.now()}`,
      contactName: caller.name,
      phoneNumber: caller.phoneNumber,
      relation: caller.relation,
      isSpecialPapaRule: isPapa,
      priority: caller.priority,
      status: 'ringing',
      secondsRinging: 0,
      unansweredTimeout: settings.unansweredTimeoutSeconds || 20,
    };

    setActiveCall(newCall);

    // Ring audio or notification
    addToast({
      title: isPapa ? '❤️ Papa is calling' : `Incoming Call: ${caller.name}`,
      message: `${caller.name} (${caller.phoneNumber}) is calling...`,
      type: 'call',
    });

    // Start 20-second timer countdown
    callRingTimerRef.current = setInterval(() => {
      setActiveCall((current) => {
        if (!current || current.status !== 'ringing') return current;

        const nextSeconds = current.secondsRinging + 1;

        // If reached unanswered timeout (default 20 seconds)
        if (nextSeconds >= current.unansweredTimeout) {
          clearInterval(callRingTimerRef.current);

          // If auto voice reply is supported
          if (settings.autoVoiceReplyEnabled) {
            // Trigger automatic voice reply
            setTimeout(() => triggerVoiceAutoReply(), 100);
            return {
              ...current,
              secondsRinging: nextSeconds,
              status: 'connected_voice_reply',
            };
          } else {
            // Missed call without voice support
            handleMissedCallWithoutVoice(current);
            return {
              ...current,
              secondsRinging: nextSeconds,
              status: 'ended',
            };
          }
        }

        return { ...current, secondsRinging: nextSeconds };
      });
    }, 1000);
  };

  // Ritesh answers incoming call
  const answerIncomingCall = () => {
    if (callRingTimerRef.current) clearInterval(callRingTimerRef.current);
    if (!activeCall) return;

    const callRecord: CallRecord = {
      id: `rec-${Date.now()}`,
      contactName: activeCall.contactName,
      phoneNumber: activeCall.phoneNumber,
      timestamp: new Date().toISOString(),
      type: 'incoming',
      status: 'answered',
      durationSeconds: 15,
      notes: 'Answered by Ritesh.',
    };

    setCallHistory((prev) => [callRecord, ...prev]);
    setActiveCall(null);
    addToast({
      title: 'Call Connected',
      message: `Call with ${activeCall.contactName} answered.`,
      type: 'success',
    });
  };

  // Ritesh rejects incoming call
  const rejectIncomingCall = () => {
    if (callRingTimerRef.current) clearInterval(callRingTimerRef.current);
    if (!activeCall) return;

    const callRecord: CallRecord = {
      id: `rec-${Date.now()}`,
      contactName: activeCall.contactName,
      phoneNumber: activeCall.phoneNumber,
      timestamp: new Date().toISOString(),
      type: 'missed',
      status: 'missed',
      durationSeconds: 0,
      notes: 'Declined by Ritesh.',
    };

    setCallHistory((prev) => [callRecord, ...prev]);
    setActiveCall(null);
    addToast({
      title: 'Call Declined',
      message: `Call from ${activeCall.contactName} rejected.`,
      type: 'info',
    });
  };

  // Forward incoming call
  const forwardIncomingCall = async () => {
    if (callRingTimerRef.current) clearInterval(callRingTimerRef.current);
    if (!activeCall) return;

    // Check contact forwarding number or default
    const contact = contacts.find((c) => c.phoneNumber === activeCall.phoneNumber);
    const targetNumber = contact?.forwardingNumber || settings.defaultForwardingNumber;

    // Call real verification endpoint
    const result = await apiService.verifyCallForwarding(
      activeCall.contactName,
      targetNumber,
      settings.telephonyConnected
    );

    if (result.success) {
      const callRecord: CallRecord = {
        id: `rec-${Date.now()}`,
        contactName: activeCall.contactName,
        phoneNumber: activeCall.phoneNumber,
        timestamp: new Date().toISOString(),
        type: 'incoming',
        status: 'forwarded',
        durationSeconds: 0,
        notes: `Forwarded to ${targetNumber}.`,
      };
      setCallHistory((prev) => [callRecord, ...prev]);
      setActiveCall(null);
      addToast({
        title: 'Call Forwarded',
        message: result.message,
        type: 'success',
      });
    } else {
      // Truthful confirmation: Never claim forwarding succeeded if telephony not connected!
      addToast({
        title: 'Forwarding Failed',
        message: result.message,
        type: 'warning',
      });
      // Keep modal open with feedback
      setActiveCall((prev) =>
        prev ? { ...prev, forwardingStatus: result.message } : null
      );
    }
  };

  // Trigger Lakshmi automated voice response: "Namaste, Ritesh abhi phone nahi utha pa rahe hain..."
  const triggerVoiceAutoReply = () => {
    if (!activeCall) return;

    const autoReplyText =
      settings.languageMode === 'english'
        ? 'Hello, Ritesh is unable to answer the call right now. May I know what the call is regarding?'
        : 'Namaste, Ritesh abhi phone nahi utha pa rahe hain. Aap batayein, kya kaam hai?';

    speakLakshmiText(autoReplyText);

    setActiveCall((prev) =>
      prev
        ? {
            ...prev,
            status: 'connected_voice_reply',
          }
        : null
    );
  };

  // Caller speaks and message is captured
  const submitCallerMessage = (messageText: string) => {
    if (!activeCall) return;

    const callerText = messageText.trim() || 'College work ke regarding call kiya tha.';
    const callerName = activeCall.contactName;

    // Save Call Message
    const newMsg: CallMessage = {
      id: `call-msg-${Date.now()}`,
      callerName,
      phoneNumber: activeCall.phoneNumber,
      timestamp: new Date().toISOString(),
      message: callerText,
      status: 'new',
      languageDetected: 'Hindi / Hinglish',
    };
    setCallMessages((prev) => [newMsg, ...prev]);
    supabaseService.syncCallMessage(newMsg);

    // Save to Call History
    const callRecord: CallRecord = {
      id: `rec-${Date.now()}`,
      contactName: callerName,
      phoneNumber: activeCall.phoneNumber,
      timestamp: new Date().toISOString(),
      type: 'missed',
      status: 'auto_answered',
      durationSeconds: 22,
      messageReceived: callerText,
      notes: 'Unanswered after 20s. Lakshmi took message.',
    };
    setCallHistory((prev) => [callRecord, ...prev]);
    supabaseService.syncCallRecord(callRecord);

    // Lakshmi acknowledges
    speakLakshmiText('Ji, main ye message Ritesh ko de dungi.');

    // Notify Ritesh
    const notifyText = `${callerName} ka call aaya tha. Unhone kaha ki: "${callerText}"`;
    addToast({
      title: `${callerName} ka Message`,
      message: notifyText,
      type: 'call',
      actionLabel: 'Call Back',
      onAction: () => {
        addToast({
          title: 'Calling',
          message: `Dialing ${callerName} (${activeCall.phoneNumber})...`,
          type: 'info',
        });
      },
    });

    // Close active call modal after brief delay
    setTimeout(() => {
      setActiveCall(null);
    }, 2500);
  };

  const handleMissedCallWithoutVoice = (call: ActiveCallState) => {
    const callRecord: CallRecord = {
      id: `rec-${Date.now()}`,
      contactName: call.contactName,
      phoneNumber: call.phoneNumber,
      timestamp: new Date().toISOString(),
      type: 'missed',
      status: 'missed',
      durationSeconds: 0,
      notes: 'Missed call (automatic voice reply was disabled).',
    };
    setCallHistory((prev) => [callRecord, ...prev]);

    addToast({
      title: `${call.contactName} ka call miss hua`,
      message: `${call.contactName} tried calling at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      type: 'warning',
    });
    setActiveCall(null);
  };

  const markCallMessageStatus = (id: string, status: CallMessage['status']) => {
    setCallMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const deleteCallRecord = (id: string) => {
    setCallHistory((prev) => prev.filter((c) => c.id !== id));
  };

  // Social actions
  const createSocialDraft = (draftData: Omit<SocialDraft, 'id' | 'createdAt'>) => {
    const newDraft: SocialDraft = {
      ...draftData,
      id: `draft-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSocialDrafts((prev) => [newDraft, ...prev]);
    supabaseService.syncSocialDraft(newDraft);
  };

  const updateSocialDraft = (id: string, updates: Partial<SocialDraft>) => {
    setSocialDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const deleteSocialDraft = (id: string) => {
    setSocialDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const publishSocialDraft = async (id: string): Promise<{ success: boolean; message: string }> => {
    const draft = socialDrafts.find((d) => d.id === id);
    if (!draft) return { success: false, message: 'Draft not found.' };

    const platformConnected = settings.socialIntegrations[draft.platform]?.connected;

    if (!platformConnected) {
      return {
        success: false,
        message: `${draft.platform.toUpperCase()} is not connected yet. Please connect your account in Settings.`,
      };
    }

    // If connected:
    updateSocialDraft(id, { status: 'published', publishedAt: new Date().toISOString() });
    return {
      success: true,
      message: `Published successfully to ${draft.platform.toUpperCase()}!`,
    };
  };

  return (
    <AssistantContext.Provider
      value={{
        activeTab,
        setActiveTab,
        settings,
        updateSettings,

        chatMessages,
        sendUserMessage,
        clearChat,
        isAiThinking,

        isListening,
        isSpeaking,
        isMuted,
        setIsMuted,
        startVoiceListening,
        stopVoiceListening,
        speakLakshmiText,
        stopSpeaking,
        voiceTranscript,

        tasks,
        addTask,
        toggleTaskStatus,
        deleteTask,

        reminders,
        addReminder,
        toggleReminder,
        deleteReminder,

        routine,
        toggleRoutineCompleted,
        updateRoutineItem,
        addRoutineItem,

        calendarEvents,
        addCalendarEvent,
        deleteCalendarEvent,

        memories,
        addMemory,
        updateMemory,
        deleteMemory,
        clearAllMemories,

        contacts,
        addContact,
        updateContact,
        deleteContact,

        callHistory,
        callMessages,
        activeCall,
        simulateIncomingCall,
        answerIncomingCall,
        rejectIncomingCall,
        forwardIncomingCall,
        triggerVoiceAutoReply,
        submitCallerMessage,
        markCallMessageStatus,
        deleteCallRecord,

        socialDrafts,
        createSocialDraft,
        updateSocialDraft,
        deleteSocialDraft,
        publishSocialDraft,

        notifications,
        removeNotification,
        requestNotificationPermission,

        syncAllWithSupabase,
        isSyncingWithSupabase,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};
