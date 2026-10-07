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
} from '../types';

const STORAGE_KEYS = {
  TASKS: 'ritesh_assistant_tasks_v1',
  REMINDERS: 'ritesh_assistant_reminders_v1',
  ROUTINE: 'ritesh_assistant_routine_v1',
  CALENDAR: 'ritesh_assistant_calendar_v1',
  MEMORIES: 'ritesh_assistant_memories_v1',
  CONTACTS: 'ritesh_assistant_contacts_v1',
  CALL_HISTORY: 'ritesh_assistant_call_history_v1',
  CALL_MESSAGES: 'ritesh_assistant_call_messages_v1',
  SOCIAL_DRAFTS: 'ritesh_assistant_social_drafts_v1',
  SETTINGS: 'ritesh_assistant_settings_v1',
};

// Clean up any stale Supabase auth tokens or outdated URLs from previous projects in localStorage
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('sb-') && !k.includes('fupgnszofujkaslbawgq')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (rawSettings) {
      const parsed = JSON.parse(rawSettings);
      if (parsed?.supabaseConfig) {
        if (!parsed.supabaseConfig.url || !parsed.supabaseConfig.url.includes('fupgnszofujkaslbawgq')) {
          parsed.supabaseConfig.url = 'https://fupgnszofujkaslbawgq.supabase.co';
        }
        if (!parsed.supabaseConfig.anonKey || parsed.supabaseConfig.anonKey.includes('MK4bTSrWsCx1GV9HzEEKIA')) {
          parsed.supabaseConfig.anonKey = 'sb_publishable_1ADQDEdMzTFI27l1qjZ7Hw_vRCiUg2E';
        }
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
      }
    }
  } catch {
    // Ignore storage errors
  }
}

/* =========================================================
   SUPABASE CONFIG
   ========================================================= */

export const DEFAULT_SUPABASE_PROJECT_ID =
  'fupgnszofujkaslbawgq';

const rawEnvUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
export const DEFAULT_SUPABASE_URL =
  (rawEnvUrl && rawEnvUrl.includes('fupgnszofujkaslbawgq'))
    ? rawEnvUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
    : 'https://fupgnszofujkaslbawgq.supabase.co';

/*
 * IMPORTANT:
 * Only the publishable/anon key should be used in frontend.
 * Never put the Supabase service-role key here.
 */
const rawEnvKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
export const DEFAULT_SUPABASE_ANON_KEY =
  (rawEnvKey && !rawEnvKey.includes('MK4bTSrWsCx1GV9HzEEKIA'))
    ? rawEnvKey
    : 'sb_publishable_1ADQDEdMzTFI27l1qjZ7Hw_vRCiUg2E';

/*
 * Backward compatibility.
 * Some existing code may still use the old name.
 */
export const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  DEFAULT_SUPABASE_ANON_KEY;

/* =========================================================
   DEFAULT SETTINGS
   ========================================================= */

export const DEFAULT_SETTINGS: AssistantSettings = {
  userName: 'Ritesh Kumar',
  userEmail: 'riteshkumarrai313@gmail.com',
  assistantName: 'Lakshmi',
  languageMode: 'auto',
  voiceGender: 'female',
  responseStyle: 'caring_concise',
  notificationsEnabled: true,
  soundEnabled: true,
  telephonyConnected: false,
  telephonyMode: 'companion_ready',
  unansweredTimeoutSeconds: 20,
  autoVoiceReplyEnabled: true,
  autoForwardingEnabled: false,
  defaultForwardingNumber: '+91 98765 43210',

  socialIntegrations: {
    linkedin: {
      connected: false,
      username: 'ritesh-kumar',
    },
    instagram: {
      connected: false,
      username: '@ritesh.codes',
    },
    facebook: {
      connected: false,
    },
  },

  supabaseConfig: {
    enabled: true,
    url: DEFAULT_SUPABASE_URL,
    anonKey: DEFAULT_SUPABASE_ANON_KEY,
    connected: false,
  },
};

/* =========================================================
   INITIAL CONTACTS
   ========================================================= */

export const INITIAL_CONTACTS: ImportantContact[] = [
  {
    id: 'contact-papa',
    name: 'Papa',
    relation: 'Papa',
    phoneNumber: '+91 94150 12345',
    priority: 'Very Important',
    incomingAction: 'special_banner',
    unansweredAction: 'voice_reply',
    forwardingNumber: '+91 98765 43210',
    isSpecialRule: true,
  },
  {
    id: 'contact-mummy',
    name: 'Mummy',
    relation: 'Mummy',
    phoneNumber: '+91 94150 67890',
    priority: 'Very Important',
    incomingAction: 'ring_loudly',
    unansweredAction: 'voice_reply',
  },
  {
    id: 'contact-bhai',
    name: 'Aman (Brother)',
    relation: 'Brother',
    phoneNumber: '+91 98390 11223',
    priority: 'Important',
    incomingAction: 'standard',
    unansweredAction: 'record_message',
  },
  {
    id: 'contact-rahul',
    name: 'Rahul (College Project)',
    relation: 'Friend',
    phoneNumber: '+91 99112 33445',
    priority: 'Important',
    incomingAction: 'standard',
    unansweredAction: 'standard',
  },
];

/* =========================================================
   INITIAL ROUTINE
   ========================================================= */

export const INITIAL_ROUTINE: RoutineItem[] = [
  {
    id: 'rt-1',
    period: 'Morning',
    title: 'Wake up & Morning Refresh',
    startTime: '06:30',
    endTime: '07:15',
    days: ['Daily'],
    category: 'Health',
    isCompletedToday: true,
    enabled: true,
  },
  {
    id: 'rt-2',
    period: 'Morning',
    title: 'Exercise & Yoga / Light Workout',
    startTime: '07:15',
    endTime: '08:00',
    days: ['Daily'],
    category: 'Fitness',
    isCompletedToday: true,
    enabled: true,
  },
  {
    id: 'rt-3',
    period: 'Morning',
    title: 'Healthy Breakfast & News',
    startTime: '08:00',
    endTime: '08:45',
    days: ['Daily'],
    category: 'Personal',
    isCompletedToday: true,
    enabled: true,
  },
  {
    id: 'rt-4',
    period: 'Morning',
    title: 'College Lectures & Labs',
    startTime: '09:00',
    endTime: '12:30',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    category: 'College',
    isCompletedToday: true,
    enabled: true,
  },
  {
    id: 'rt-5',
    period: 'Afternoon',
    title: 'College Work & Group Discussion',
    startTime: '13:00',
    endTime: '14:30',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    category: 'College',
    isCompletedToday: false,
    enabled: true,
  },
  {
    id: 'rt-6',
    period: 'Afternoon',
    title: 'Lunch & Quick Rest',
    startTime: '14:30',
    endTime: '15:30',
    days: ['Daily'],
    category: 'Personal',
    isCompletedToday: false,
    enabled: true,
  },
  {
    id: 'rt-7',
    period: 'Afternoon',
    title: 'Full-Stack Project Development',
    startTime: '15:30',
    endTime: '17:30',
    days: ['Daily'],
    category: 'Project',
    isCompletedToday: false,
    enabled: true,
  },
  {
    id: 'rt-8',
    period: 'Evening',
    title: 'Cricket / Outdoor Walk with Friends',
    startTime: '17:30',
    endTime: '18:45',
    days: ['Daily'],
    category: 'Fitness',
    isCompletedToday: false,
    enabled: true,
  },
  {
    id: 'rt-9',
    period: 'Evening',
    title: 'Java Practice & Problem Solving',
    startTime: '19:00',
    endTime: '20:30',
    days: ['Daily'],
    category: 'Coding',
    isCompletedToday: false,
    enabled: true,
  },
  {
    id: 'rt-10',
    period: 'Night',
    title: 'Dinner & Family Call',
    startTime: '20:30',
    endTime: '21:30',
    days: ['Daily'],
    category: 'Personal',
    isCompletedToday: false,
    enabled: true,
  },
  {
    id: 'rt-11',
    period: 'Night',
    title: 'Revision & Next-Day Planning',
    startTime: '21:30',
    endTime: '22:30',
    days: ['Daily'],
    category: 'College',
    isCompletedToday: false,
    enabled: true,
  },
  {
    id: 'rt-12',
    period: 'Night',
    title: 'Wind down & Sleep',
    startTime: '23:00',
    endTime: '06:30',
    days: ['Daily'],
    category: 'Health',
    isCompletedToday: false,
    enabled: true,
  },
];

/* =========================================================
   INITIAL TASKS
   ========================================================= */

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Java OOPs & Multithreading Practice',
    description:
      'Solve 3 LeetCode problems on Java Concurrency and revision notes',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    priority: 'high',
    category: 'Coding',
    status: 'pending',
    recurring: 'daily',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Complete React Assistant Dashboard UI',
    description:
      'Finalize Tailwind responsive layout and Voice button integration',
    date: new Date().toISOString().split('T')[0],
    time: '16:00',
    priority: 'urgent',
    category: 'Project',
    status: 'in_progress',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Submit Database Management Assignment',
    description:
      'Normalized 3NF relational schema writeup for Prof. Sharma',
    date: new Date(Date.now() + 86400000)
      .toISOString()
      .split('T')[0],
    time: '11:00',
    priority: 'high',
    category: 'College',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Update Resume for Summer Internship Applications',
    description:
      'Add Employee Management System & React AI Assistant projects',
    date: new Date(Date.now() + 2 * 86400000)
      .toISOString()
      .split('T')[0],
    time: '18:00',
    priority: 'medium',
    category: 'Job Preparation',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

/* =========================================================
   INITIAL REMINDERS
   ========================================================= */

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    title: 'Call Papa regarding college fees & check on health',
    date: new Date().toISOString().split('T')[0],
    time: '20:45',
    type: 'daily',
    category: 'Family',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-2',
    title: 'Java coding practice session starts',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    type: 'recurring',
    category: 'Coding',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-3',
    title: 'Check college assignment deadline',
    date: new Date(Date.now() + 86400000)
      .toISOString()
      .split('T')[0],
    time: '10:00',
    type: 'one-time',
    category: 'College',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
];

/* =========================================================
   INITIAL MEMORIES
   ========================================================= */

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    content:
      'Ritesh practices Java every evening around 7:00 PM to 8:30 PM.',
    category: 'Routine',
    importance: 'high',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'mem-2',
    content:
      'Papa is highest priority; if Papa calls, always alert prominently and handle with utmost care.',
    category: 'Family',
    importance: 'high',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'mem-3',
    content:
      'Currently working on a full-stack Employee Management System and learning React with TypeScript.',
    category: 'Coding',
    importance: 'normal',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'mem-4',
    content:
      'Prefers concise Hindi/Hinglish updates like "Ji Ritesh, maine save kar diya".',
    category: 'Preferences',
    importance: 'high',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

/* =========================================================
   INITIAL CALL HISTORY
   ========================================================= */

export const INITIAL_CALL_HISTORY: CallRecord[] = [
  {
    id: 'call-1',
    contactName: 'Papa',
    phoneNumber: '+91 94150 12345',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    type: 'missed',
    status: 'auto_answered',
    durationSeconds: 24,
    messageReceived:
      'Unse college ke baare mein baat karni thi. Free hokar call karein.',
    followUpReminderCreated: true,
    notes:
      'Auto-answered by Lakshmi after 20s timeout. Caller message saved.',
  },
  {
    id: 'call-2',
    contactName: 'Mummy',
    phoneNumber: '+91 94150 67890',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    type: 'incoming',
    status: 'answered',
    durationSeconds: 310,
    notes:
      'Talked about evening dinner and weekend plans.',
  },
  {
    id: 'call-3',
    contactName: 'Rahul (College Project)',
    phoneNumber: '+91 99112 33445',
    timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
    type: 'missed',
    status: 'missed',
    durationSeconds: 0,
    notes: 'Missed call during class.',
  },
];

/* =========================================================
   INITIAL CALL MESSAGES
   ========================================================= */

export const INITIAL_CALL_MESSAGES: CallMessage[] = [
  {
    id: 'msg-1',
    callerName: 'Papa',
    phoneNumber: '+91 94150 12345',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    message:
      'Unse college ke baare mein baat karni thi. Free hokar call karein.',
    status: 'new',
    languageDetected: 'Hindi / Hinglish',
  },
];

/* =========================================================
   INITIAL CALENDAR EVENTS
   ========================================================= */

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Data Structures & Algorithms Lab',
    description:
      'Binary Search Trees & Graph Traversal experiments',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '12:00',
    location: 'Lab 4, CS Block',
    category: 'College',
  },
  {
    id: 'event-2',
    title: 'Web Dev Project Standup with Team',
    description:
      'Discussing API integrations & backend routes',
    date: new Date().toISOString().split('T')[0],
    startTime: '16:00',
    endTime: '16:45',
    location: 'Google Meet',
    category: 'Project',
  },
  {
    id: 'event-3',
    title: 'Weekly Coding Contest',
    description: 'Weekly contest practice round',
    date: new Date(Date.now() + 86400000)
      .toISOString()
      .split('T')[0],
    startTime: '20:00',
    endTime: '21:30',
    location: 'LeetCode / Codeforces',
    category: 'Coding',
  },
];

/* =========================================================
   INITIAL SOCIAL DRAFTS
   ========================================================= */

export const INITIAL_SOCIAL_DRAFTS: SocialDraft[] = [
  {
    id: 'draft-1',
    platform: 'linkedin',
    topic:
      'Building a Full-Stack Employee Management System with Java & React',
    content: `Excited to share my latest full-stack project: an Employee Management System built with Java, Spring Boot, and React! 🚀

Key Features:
- Secure JWT-based authentication & Role-Based Access Control (RBAC)
- Optimized PostgreSQL database schema with automated migration
- Clean, responsive React UI powered by Tailwind CSS
- Real-time department metrics and employee lifecycle tracking

Building this gave me hands-on experience in designing robust microservices and managing state effectively.

Looking forward to hearing feedback from fellow developers!

#Java #SpringBoot #ReactJS #FullStackDevelopment #WebDevelopment #SoftwareEngineering #CodingJourney`,
    hashtags: [
      '#Java',
      '#SpringBoot',
      '#ReactJS',
      '#FullStackDevelopment',
      '#WebDevelopment',
    ],
    status: 'draft',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'draft-2',
    platform: 'instagram',
    topic: 'Daily Coding Grind & Java Practice',
    caption:
      'Every line of code is a step closer to the goal 💻✨ Evening Java grind with Lakshmi keeping my schedule on track.',
    content:
      'Every line of code is a step closer to the goal 💻✨ Evening Java grind with Lakshmi keeping my schedule on track. Consistent daily routines > intense bursts.',
    hashtags: [
      '#developer',
      '#codinglife',
      '#programmer',
      '#java',
      '#reactjs',
      '#techstudent',
      '#consistency',
    ],
    status: 'draft',
    createdAt: new Date().toISOString(),
  },
];

/* =========================================================
   LOCAL STORAGE HELPERS
   ========================================================= */

function loadFromStorage<T>(
  key: string,
  defaultValue: T
): T {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return defaultValue;
    }

    return JSON.parse(raw);
  } catch (err) {
    console.warn(
      `Error reading ${key} from localStorage:`,
      err
    );

    return defaultValue;
  }
}

function saveToStorage<T>(
  key: string,
  value: T
): void {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch (err) {
    console.error(
      `Error saving ${key} to localStorage:`,
      err
    );
  }
}

/* =========================================================
   DATABASE SERVICE
   ========================================================= */

export const dbService = {
  /* -------------------------------------------------------
     SETTINGS
     ------------------------------------------------------- */

  getSettings: (): AssistantSettings => {
    const loaded = loadFromStorage(
      STORAGE_KEYS.SETTINGS,
      DEFAULT_SETTINGS
    );

    if (!loaded.supabaseConfig) {
      loaded.supabaseConfig =
        DEFAULT_SETTINGS.supabaseConfig;
    } else {
      loaded.supabaseConfig.url =
        DEFAULT_SUPABASE_URL;

      /*
       * Do not overwrite a valid saved key.
       * If no key exists or if old key exists, use the environment key.
       */
      if (!loaded.supabaseConfig.anonKey || loaded.supabaseConfig.anonKey.includes('MK4bTSrWsCx1GV9HzEEKIA')) {
        loaded.supabaseConfig.anonKey =
          DEFAULT_SUPABASE_ANON_KEY;
      }

      loaded.supabaseConfig.enabled = true;
    }

    return loaded;
  },

  saveSettings: (
    settings: AssistantSettings
  ) => {
    if (settings.supabaseConfig) {
      settings.supabaseConfig.url = DEFAULT_SUPABASE_URL;
    }
    return saveToStorage(
      STORAGE_KEYS.SETTINGS,
      settings
    );
  },

  /* -------------------------------------------------------
     TASKS
     ------------------------------------------------------- */

  getTasks: (): Task[] =>
    loadFromStorage(
      STORAGE_KEYS.TASKS,
      INITIAL_TASKS
    ),

  saveTasks: (tasks: Task[]) =>
    saveToStorage(
      STORAGE_KEYS.TASKS,
      tasks
    ),

  /* -------------------------------------------------------
     REMINDERS
     ------------------------------------------------------- */

  getReminders: (): Reminder[] =>
    loadFromStorage(
      STORAGE_KEYS.REMINDERS,
      INITIAL_REMINDERS
    ),

  saveReminders: (reminders: Reminder[]) =>
    saveToStorage(
      STORAGE_KEYS.REMINDERS,
      reminders
    ),

  /* -------------------------------------------------------
     ROUTINE
     ------------------------------------------------------- */

  getRoutine: (): RoutineItem[] =>
    loadFromStorage(
      STORAGE_KEYS.ROUTINE,
      INITIAL_ROUTINE
    ),

  saveRoutine: (routine: RoutineItem[]) =>
    saveToStorage(
      STORAGE_KEYS.ROUTINE,
      routine
    ),

  /* -------------------------------------------------------
     CALENDAR
     ------------------------------------------------------- */

  getCalendar: (): CalendarEvent[] =>
    loadFromStorage(
      STORAGE_KEYS.CALENDAR,
      INITIAL_CALENDAR_EVENTS
    ),

  saveCalendar: (
    events: CalendarEvent[]
  ) =>
    saveToStorage(
      STORAGE_KEYS.CALENDAR,
      events
    ),

  /* -------------------------------------------------------
     MEMORIES
     ------------------------------------------------------- */

  getMemories: (): MemoryItem[] =>
    loadFromStorage(
      STORAGE_KEYS.MEMORIES,
      INITIAL_MEMORIES
    ),

  saveMemories: (
    memories: MemoryItem[]
  ) =>
    saveToStorage(
      STORAGE_KEYS.MEMORIES,
      memories
    ),

  /* -------------------------------------------------------
     CONTACTS
     ------------------------------------------------------- */

  getContacts: (): ImportantContact[] =>
    loadFromStorage(
      STORAGE_KEYS.CONTACTS,
      INITIAL_CONTACTS
    ),

  saveContacts: (
    contacts: ImportantContact[]
  ) =>
    saveToStorage(
      STORAGE_KEYS.CONTACTS,
      contacts
    ),

  /* -------------------------------------------------------
     CALL HISTORY
     ------------------------------------------------------- */

  getCallHistory: (): CallRecord[] =>
    loadFromStorage(
      STORAGE_KEYS.CALL_HISTORY,
      INITIAL_CALL_HISTORY
    ),

  saveCallHistory: (
    records: CallRecord[]
  ) =>
    saveToStorage(
      STORAGE_KEYS.CALL_HISTORY,
      records
    ),

  /* -------------------------------------------------------
     CALL MESSAGES
     ------------------------------------------------------- */

  getCallMessages: (): CallMessage[] =>
    loadFromStorage(
      STORAGE_KEYS.CALL_MESSAGES,
      INITIAL_CALL_MESSAGES
    ),

  saveCallMessages: (
    messages: CallMessage[]
  ) =>
    saveToStorage(
      STORAGE_KEYS.CALL_MESSAGES,
      messages
    ),

  /* -------------------------------------------------------
     SOCIAL DRAFTS
     ------------------------------------------------------- */

  getSocialDrafts: (): SocialDraft[] =>
    loadFromStorage(
      STORAGE_KEYS.SOCIAL_DRAFTS,
      INITIAL_SOCIAL_DRAFTS
    ),

  saveSocialDrafts: (
    drafts: SocialDraft[]
  ) =>
    saveToStorage(
      STORAGE_KEYS.SOCIAL_DRAFTS,
      drafts
    ),

  /* -------------------------------------------------------
     RESET
     ------------------------------------------------------- */

  resetAll: () => {
    Object.values(STORAGE_KEYS).forEach(
      (key) =>
        localStorage.removeItem(key)
    );
  },

  /* =======================================================
     SUPABASE SQL SCHEMA
     ======================================================= */

  getSupabaseSQLSchema: (): string => {
    return `-- =========================================================================
-- LAKSHMI ASSISTANT - FINAL STRICT UUID RLS MIGRATION SCRIPT
-- Supabase Project: fupgnszofujkaslbawgq
-- User: riteshkumarrai313@gmail.com
-- UID: 19df4d16-0c84-4291-8303-dc6aba0f8b00
-- =========================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =========================================================================
-- PROFILES
-- =========================================================================

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text default 'Ritesh Kumar',
  assistant_name text default 'Lakshmi',
  language_mode text default 'auto',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =========================================================================
-- TASKS
-- =========================================================================

create table if not exists public.tasks (
  id text primary key,
  user_id uuid default auth.uid(),
  title text not null,
  description text,
  category text default 'Coding',
  status text default 'pending',
  date text not null,
  time text,
  priority text default 'medium',
  recurring text default 'none',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =========================================================================
-- REMINDERS
-- =========================================================================

create table if not exists public.reminders (
  id text primary key,
  user_id uuid default auth.uid(),
  title text not null,
  description text,
  date text not null,
  time text not null,
  type text default 'one-time',
  category text default 'General',
  is_completed boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =========================================================================
-- ROUTINE
-- =========================================================================

create table if not exists public.routine_items (
  id text primary key,
  user_id uuid default auth.uid(),
  period text not null,
  title text not null,
  start_time text not null,
  end_time text not null,
  days jsonb default '["Daily"]'::jsonb,
  category text,
  enabled boolean default true,
  is_completed_today boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =========================================================================
-- MEMORIES
-- =========================================================================

create table if not exists public.memories (
  id text primary key,
  user_id uuid default auth.uid(),
  content text not null,
  category text default 'General',
  importance text default 'normal',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =========================================================================
-- CONTACTS
-- =========================================================================

create table if not exists public.contacts (
  id text primary key,
  user_id uuid default auth.uid(),
  name text not null,
  relation text,
  phone_number text not null,
  priority text default 'Important',
  incoming_action text default 'standard',
  unanswered_action text default 'voice_reply',
  forwarding_number text,
  is_special_rule boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =========================================================================
-- CALL HISTORY
-- =========================================================================

create table if not exists public.call_history (
  id text primary key,
  user_id uuid default auth.uid(),
  contact_name text not null,
  phone_number text not null,
  timestamp text not null,
  type text not null,
  status text not null,
  duration_seconds integer default 0,
  message_received text,
  notes text,
  created_at timestamptz default now() not null
);

-- =========================================================================
-- CALL MESSAGES
-- =========================================================================

create table if not exists public.call_messages (
  id text primary key,
  user_id uuid default auth.uid(),
  caller_name text not null,
  phone_number text not null,
  timestamp text not null,
  message text not null,
  status text default 'new',
  language_detected text default 'Hindi / Hinglish',
  created_at timestamptz default now() not null
);

-- =========================================================================
-- SOCIAL DRAFTS
-- =========================================================================

create table if not exists public.social_drafts (
  id text primary key,
  user_id uuid default auth.uid(),
  platform text not null,
  topic text not null,
  content text not null,
  caption text,
  hashtags jsonb default '[]'::jsonb,
  status text default 'draft',
  published_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =========================================================================
-- CHAT HISTORY
-- =========================================================================

create table if not exists public.chat_history (
  id text primary key,
  user_id uuid default auth.uid(),
  sender text not null,
  text text not null,
  action_taken jsonb,
  timestamp text not null,
  created_at timestamptz default now() not null
);

-- =========================================================================
-- USER ID DEFAULTS
-- =========================================================================

alter table public.tasks
  alter column user_id set default auth.uid();

alter table public.reminders
  alter column user_id set default auth.uid();

alter table public.routine_items
  alter column user_id set default auth.uid();

alter table public.memories
  alter column user_id set default auth.uid();

alter table public.contacts
  alter column user_id set default auth.uid();

alter table public.call_history
  alter column user_id set default auth.uid();

alter table public.call_messages
  alter column user_id set default auth.uid();

alter table public.social_drafts
  alter column user_id set default auth.uid();

alter table public.chat_history
  alter column user_id set default auth.uid();

-- =========================================================================
-- INDEXES
-- =========================================================================

create index if not exists idx_tasks_user_id
  on public.tasks (user_id);

create index if not exists idx_tasks_status
  on public.tasks (status);

create index if not exists idx_tasks_date
  on public.tasks (date);

create index if not exists idx_tasks_category
  on public.tasks (category);

create index if not exists idx_reminders_user_id
  on public.reminders (user_id);

create index if not exists idx_reminders_date_time
  on public.reminders (date, time);

create index if not exists idx_reminders_completed
  on public.reminders (is_completed);

create index if not exists idx_routine_user_id
  on public.routine_items (user_id);

create index if not exists idx_routine_period
  on public.routine_items (period);

create index if not exists idx_memories_user_id
  on public.memories (user_id);

create index if not exists idx_memories_category
  on public.memories (category);

create index if not exists idx_contacts_user_id
  on public.contacts (user_id);

create index if not exists idx_contacts_name
  on public.contacts (name);

create index if not exists idx_call_history_user_id
  on public.call_history (user_id);

create index if not exists idx_call_history_timestamp
  on public.call_history (timestamp);

create index if not exists idx_call_messages_user_id
  on public.call_messages (user_id);

create index if not exists idx_social_drafts_user_id
  on public.social_drafts (user_id);

create index if not exists idx_social_drafts_platform
  on public.social_drafts (platform);

create index if not exists idx_chat_history_user_id
  on public.chat_history (user_id);

create index if not exists idx_chat_history_created
  on public.chat_history (created_at);

-- =========================================================================
-- RLS
-- =========================================================================

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own"
  on public.profiles;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_update_own"
  on public.profiles;

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- TASKS

alter table public.tasks enable row level security;

drop policy if exists "tasks_select_own"
  on public.tasks;

create policy "tasks_select_own"
  on public.tasks
  for select
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "tasks_insert_own"
  on public.tasks;

create policy "tasks_insert_own"
  on public.tasks
  for insert
  to anon, authenticated
  with check (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "tasks_update_own"
  on public.tasks;

create policy "tasks_update_own"
  on public.tasks
  for update
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid())
  with check (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "tasks_delete_own"
  on public.tasks;

create policy "tasks_delete_own"
  on public.tasks
  for delete
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid());

-- REMINDERS

alter table public.reminders enable row level security;

drop policy if exists "reminders_select_own"
  on public.reminders;

create policy "reminders_select_own"
  on public.reminders
  for select
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "reminders_insert_own"
  on public.reminders;

create policy "reminders_insert_own"
  on public.reminders
  for insert
  to anon, authenticated
  with check (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "reminders_update_own"
  on public.reminders;

create policy "reminders_update_own"
  on public.reminders
  for update
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid())
  with check (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "reminders_delete_own"
  on public.reminders;

create policy "reminders_delete_own"
  on public.reminders
  for delete
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid());

-- ROUTINE

alter table public.routine_items enable row level security;

drop policy if exists "routine_select_own"
  on public.routine_items;

create policy "routine_select_own"
  on public.routine_items
  for select
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "routine_insert_own"
  on public.routine_items;

create policy "routine_insert_own"
  on public.routine_items
  for insert
  to anon, authenticated
  with check (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "routine_update_own"
  on public.routine_items;

create policy "routine_update_own"
  on public.routine_items
  for update
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid())
  with check (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "routine_delete_own"
  on public.routine_items;

create policy "routine_delete_own"
  on public.routine_items
  for delete
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid());

-- MEMORIES

alter table public.memories enable row level security;

drop policy if exists "memories_select_own"
  on public.memories;

create policy "memories_select_own"
  on public.memories
  for select
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "memories_insert_own"
  on public.memories;

create policy "memories_insert_own"
  on public.memories
  for insert
  to anon, authenticated
  with check (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "memories_update_own"
  on public.memories;

create policy "memories_update_own"
  on public.memories
  for update
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid())
  with check (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "memories_delete_own"
  on public.memories;

create policy "memories_delete_own"
  on public.memories
  for delete
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid());

-- CONTACTS

alter table public.contacts enable row level security;

drop policy if exists "contacts_select_own"
  on public.contacts;

create policy "contacts_select_own"
  on public.contacts
  for select
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "contacts_insert_own"
  on public.contacts;

create policy "contacts_insert_own"
  on public.contacts
  for insert
  to anon, authenticated
  with check (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "contacts_update_own"
  on public.contacts;

create policy "contacts_update_own"
  on public.contacts
  for update
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid())
  with check (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "contacts_delete_own"
  on public.contacts;

create policy "contacts_delete_own"
  on public.contacts
  for delete
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid());

-- CALL HISTORY

alter table public.call_history enable row level security;

drop policy if exists "call_history_select_own"
  on public.call_history;

create policy "call_history_select_own"
  on public.call_history
  for select
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "call_history_insert_own"
  on public.call_history;

create policy "call_history_insert_own"
  on public.call_history
  for insert
  to anon, authenticated
  with check (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "call_history_update_own"
  on public.call_history;

create policy "call_history_update_own"
  on public.call_history
  for update
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid())
  with check (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "call_history_delete_own"
  on public.call_history;

create policy "call_history_delete_own"
  on public.call_history
  for delete
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid());

-- CALL MESSAGES

alter table public.call_messages enable row level security;

drop policy if exists "call_messages_select_own"
  on public.call_messages;

create policy "call_messages_select_own"
  on public.call_messages
  for select
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "call_messages_insert_own"
  on public.call_messages;

create policy "call_messages_insert_own"
  on public.call_messages
  for insert
  to anon, authenticated
  with check (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "call_messages_update_own"
  on public.call_messages;

create policy "call_messages_update_own"
  on public.call_messages
  for update
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid())
  with check (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "call_messages_delete_own"
  on public.call_messages;

create policy "call_messages_delete_own"
  on public.call_messages
  for delete
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid());

-- SOCIAL DRAFTS

alter table public.social_drafts enable row level security;

drop policy if exists "social_drafts_select_own"
  on public.social_drafts;

create policy "social_drafts_select_own"
  on public.social_drafts
  for select
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "social_drafts_insert_own"
  on public.social_drafts;

create policy "social_drafts_insert_own"
  on public.social_drafts
  for insert
  to anon, authenticated
  with check (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "social_drafts_update_own"
  on public.social_drafts;

create policy "social_drafts_update_own"
  on public.social_drafts
  for update
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid())
  with check (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "social_drafts_delete_own"
  on public.social_drafts;

create policy "social_drafts_delete_own"
  on public.social_drafts
  for delete
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid());

-- CHAT HISTORY

alter table public.chat_history enable row level security;

drop policy if exists "chat_history_select_own"
  on public.chat_history;

create policy "chat_history_select_own"
  on public.chat_history
  for select
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "chat_history_insert_own"
  on public.chat_history;

create policy "chat_history_insert_own"
  on public.chat_history
  for insert
  to anon, authenticated
  with check (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "chat_history_update_own"
  on public.chat_history;

create policy "chat_history_update_own"
  on public.chat_history
  for update
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid())
  with check (auth.uid() is null or user_id is null or user_id = auth.uid());

drop policy if exists "chat_history_delete_own"
  on public.chat_history;

create policy "chat_history_delete_own"
  on public.chat_history
  for delete
  to anon, authenticated
  using (auth.uid() is null or user_id is null or user_id = auth.uid());

-- =========================================================================
-- AUTH PROFILE TRIGGER
-- =========================================================================

create or replace function public.handle_new_user()
returns trigger
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    assistant_name
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      'Ritesh Kumar'
    ),
    'Lakshmi'
  )
  on conflict (id)
  do update set
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$
language plpgsql
security definer;

drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert
on auth.users
for each row
execute function public.handle_new_user();

-- =========================================================================
-- BACKFILL EXISTING AUTH USERS
-- =========================================================================

insert into public.profiles (
  id,
  email,
  full_name,
  assistant_name
)
select
  id,
  email,
  coalesce(
    raw_user_meta_data->>'full_name',
    'Ritesh Kumar'
  ),
  'Lakshmi'
from auth.users
on conflict (id)
do nothing;
`;
  },
};