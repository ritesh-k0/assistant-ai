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

export const DEFAULT_SUPABASE_PROJECT_ID = 'fupgnszofujkaslbawgq';
export const DEFAULT_SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://fupgnszofujkaslbawgq.supabase.co';
export const DEFAULT_SUPABASE_PUBLISHABLE_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MK4bTSrWsCx1GV9HzEEKIA__E-zFzJ8';

// Initial realistic seed data for Ritesh Kumar
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
    linkedin: { connected: false, username: 'ritesh-kumar' },
    instagram: { connected: false, username: '@ritesh.codes' },
    facebook: { connected: false },
  },
  supabaseConfig: {
    enabled: true,
    url: DEFAULT_SUPABASE_URL,
    anonKey: DEFAULT_SUPABASE_PUBLISHABLE_KEY,
    connected: false,
  },
};

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

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Java OOPs & Multithreading Practice',
    description: 'Solve 3 LeetCode problems on Java Concurrency and revision notes',
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
    description: 'Finalize Tailwind responsive layout and Voice button integration',
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
    description: 'Normalized 3NF relational schema writeup for Prof. Sharma',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '11:00',
    priority: 'high',
    category: 'College',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Update Resume for Summer Internship Applications',
    description: 'Add Employee Management System & React AI Assistant projects',
    date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    time: '18:00',
    priority: 'medium',
    category: 'Job Preparation',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

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
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '10:00',
    type: 'one-time',
    category: 'College',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    content: 'Ritesh practices Java every evening around 7:00 PM to 8:30 PM.',
    category: 'Routine',
    importance: 'high',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'mem-2',
    content: 'Papa is highest priority; if Papa calls, always alert prominently and handle with utmost care.',
    category: 'Family',
    importance: 'high',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'mem-3',
    content: 'Currently working on a full-stack Employee Management System and learning React with TypeScript.',
    category: 'Coding',
    importance: 'normal',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'mem-4',
    content: 'Prefers concise Hindi/Hinglish updates like "Ji Ritesh, maine save kar diya".',
    category: 'Preferences',
    importance: 'high',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const INITIAL_CALL_HISTORY: CallRecord[] = [
  {
    id: 'call-1',
    contactName: 'Papa',
    phoneNumber: '+91 94150 12345',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    type: 'missed',
    status: 'auto_answered',
    durationSeconds: 24,
    messageReceived: 'Unse college ke baare mein baat karni thi. Free hokar call karein.',
    followUpReminderCreated: true,
    notes: 'Auto-answered by Lakshmi after 20s timeout. Caller message saved.',
  },
  {
    id: 'call-2',
    contactName: 'Mummy',
    phoneNumber: '+91 94150 67890',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    type: 'incoming',
    status: 'answered',
    durationSeconds: 310,
    notes: 'Talked about evening dinner and weekend plans.',
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

export const INITIAL_CALL_MESSAGES: CallMessage[] = [
  {
    id: 'msg-1',
    callerName: 'Papa',
    phoneNumber: '+91 94150 12345',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    message: 'Unse college ke baare mein baat karni thi. Free hokar call karein.',
    status: 'new',
    languageDetected: 'Hindi / Hinglish',
  },
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Data Structures & Algorithms Lab',
    description: 'Binary Search Trees & Graph Traversal experiments',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '12:00',
    location: 'Lab 4, CS Block',
    category: 'College',
  },
  {
    id: 'event-2',
    title: 'Web Dev Project Standup with Team',
    description: 'Discussing API integrations & backend routes',
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
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '20:00',
    endTime: '21:30',
    location: 'LeetCode / Codeforces',
    category: 'Coding',
  },
];

export const INITIAL_SOCIAL_DRAFTS: SocialDraft[] = [
  {
    id: 'draft-1',
    platform: 'linkedin',
    topic: 'Building a Full-Stack Employee Management System with Java & React',
    content: `Excited to share my latest full-stack project: an Employee Management System built with Java, Spring Boot, and React! 🚀

Key Features:
- Secure JWT-based authentication & Role-Based Access Control (RBAC)
- Optimized PostgreSQL database schema with automated migration
- Clean, responsive React UI powered by Tailwind CSS
- Real-time department metrics and employee lifecycle tracking

Building this gave me hands-on experience in designing robust microservices and managing state effectively.

Looking forward to hearing feedback from fellow developers!

#Java #SpringBoot #ReactJS #FullStackDevelopment #WebDevelopment #SoftwareEngineering #CodingJourney`,
    hashtags: ['#Java', '#SpringBoot', '#ReactJS', '#FullStackDevelopment', '#WebDevelopment'],
    status: 'draft',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'draft-2',
    platform: 'instagram',
    topic: 'Daily Coding Grind & Java Practice',
    caption: 'Every line of code is a step closer to the goal 💻✨ Evening Java grind with Lakshmi keeping my schedule on track.',
    content: 'Every line of code is a step closer to the goal 💻✨ Evening Java grind with Lakshmi keeping my schedule on track. Consistent daily routines > intense bursts.',
    hashtags: ['#developer', '#codinglife', '#programmer', '#java', '#reactjs', '#techstudent', '#consistency'],
    status: 'draft',
    createdAt: new Date().toISOString(),
  },
];

// Helper to load or initialize from localStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

export const dbService = {
  getSettings: (): AssistantSettings => {
    const loaded = loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    if (!loaded.supabaseConfig) {
      loaded.supabaseConfig = DEFAULT_SETTINGS.supabaseConfig;
    } else {
      // Ensure the active project URL and publishable key match user's current project
      if (!loaded.supabaseConfig.url || loaded.supabaseConfig.url !== DEFAULT_SUPABASE_URL) {
        loaded.supabaseConfig.url = DEFAULT_SUPABASE_URL;
      }
      if (!loaded.supabaseConfig.anonKey) {
        loaded.supabaseConfig.anonKey = DEFAULT_SUPABASE_PUBLISHABLE_KEY;
      }
    }
    return loaded;
  },
  saveSettings: (settings: AssistantSettings) => saveToStorage(STORAGE_KEYS.SETTINGS, settings),

  getTasks: (): Task[] => loadFromStorage(STORAGE_KEYS.TASKS, INITIAL_TASKS),
  saveTasks: (tasks: Task[]) => saveToStorage(STORAGE_KEYS.TASKS, tasks),

  getReminders: (): Reminder[] => loadFromStorage(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS),
  saveReminders: (reminders: Reminder[]) => saveToStorage(STORAGE_KEYS.REMINDERS, reminders),

  getRoutine: (): RoutineItem[] => loadFromStorage(STORAGE_KEYS.ROUTINE, INITIAL_ROUTINE),
  saveRoutine: (routine: RoutineItem[]) => saveToStorage(STORAGE_KEYS.ROUTINE, routine),

  getCalendar: (): CalendarEvent[] => loadFromStorage(STORAGE_KEYS.CALENDAR, INITIAL_CALENDAR_EVENTS),
  saveCalendar: (events: CalendarEvent[]) => saveToStorage(STORAGE_KEYS.CALENDAR, events),

  getMemories: (): MemoryItem[] => loadFromStorage(STORAGE_KEYS.MEMORIES, INITIAL_MEMORIES),
  saveMemories: (memories: MemoryItem[]) => saveToStorage(STORAGE_KEYS.MEMORIES, memories),

  getContacts: (): ImportantContact[] => loadFromStorage(STORAGE_KEYS.CONTACTS, INITIAL_CONTACTS),
  saveContacts: (contacts: ImportantContact[]) => saveToStorage(STORAGE_KEYS.CONTACTS, contacts),

  getCallHistory: (): CallRecord[] => loadFromStorage(STORAGE_KEYS.CALL_HISTORY, INITIAL_CALL_HISTORY),
  saveCallHistory: (records: CallRecord[]) => saveToStorage(STORAGE_KEYS.CALL_HISTORY, records),

  getCallMessages: (): CallMessage[] => loadFromStorage(STORAGE_KEYS.CALL_MESSAGES, INITIAL_CALL_MESSAGES),
  saveCallMessages: (messages: CallMessage[]) => saveToStorage(STORAGE_KEYS.CALL_MESSAGES, messages),

  getSocialDrafts: (): SocialDraft[] => loadFromStorage(STORAGE_KEYS.SOCIAL_DRAFTS, INITIAL_SOCIAL_DRAFTS),
  saveSocialDrafts: (drafts: SocialDraft[]) => saveToStorage(STORAGE_KEYS.SOCIAL_DRAFTS, drafts),

  // Clear all data reset
  resetAll: () => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  },

  // Generates Supabase SQL schema with Row-Level Security and Safe Migration
  getSupabaseSQLSchema: (): string => {
    return `-- =========================================================================
-- LAKSHMI ASSISTANT - FINAL STRICT UUID RLS MIGRATION SCRIPT
-- Supabase Project: fupgnszofujkaslbawgq
-- User: riteshkumarrai313@gmail.com (UID: 19df4d16-0c84-4291-8303-dc6aba0f8b00)
-- Type Specification: user_id is UUID everywhere with default auth.uid()
-- =========================================================================

-- Enable required PostgreSQL extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =========================================================================
-- STEP 1: TABLES AND STRUCTURE (user_id uuid default auth.uid())
-- =========================================================================

-- 0. USER PROFILES TABLE (Linked directly to Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text default 'Ritesh Kumar',
  assistant_name text default 'Lakshmi',
  language_mode text default 'auto',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 1. TASKS TABLE
create table if not exists public.tasks (
  id text primary key,
  user_id uuid default auth.uid() not null,
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

-- 2. REMINDERS TABLE
create table if not exists public.reminders (
  id text primary key,
  user_id uuid default auth.uid() not null,
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

-- 3. DAILY ROUTINE TABLE
create table if not exists public.routine_items (
  id text primary key,
  user_id uuid default auth.uid() not null,
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

-- 4. PERSONAL MEMORIES TABLE
create table if not exists public.memories (
  id text primary key,
  user_id uuid default auth.uid() not null,
  content text not null,
  category text default 'General',
  importance text default 'normal',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 5. IMPORTANT CONTACTS TABLE
create table if not exists public.contacts (
  id text primary key,
  user_id uuid default auth.uid() not null,
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

-- 6. CALL HISTORY TABLE
create table if not exists public.call_history (
  id text primary key,
  user_id uuid default auth.uid() not null,
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

-- 7. CALL MESSAGES TABLE
create table if not exists public.call_messages (
  id text primary key,
  user_id uuid default auth.uid() not null,
  caller_name text not null,
  phone_number text not null,
  timestamp text not null,
  message text not null,
  status text default 'new',
  language_detected text default 'Hindi / Hinglish',
  created_at timestamptz default now() not null
);

-- 8. SOCIAL MEDIA DRAFTS TABLE
create table if not exists public.social_drafts (
  id text primary key,
  user_id uuid default auth.uid() not null,
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

-- 9. CHAT HISTORY TABLE
create table if not exists public.chat_history (
  id text primary key,
  user_id uuid default auth.uid() not null,
  sender text not null,
  text text not null,
  action_taken jsonb,
  timestamp text not null,
  created_at timestamptz default now() not null
);

-- =========================================================================
-- STEP 2: ENSURE COLUMN DEFAULTS USE PURE UUID (default auth.uid())
-- =========================================================================

alter table public.tasks alter column user_id set default auth.uid();
alter table public.reminders alter column user_id set default auth.uid();
alter table public.routine_items alter column user_id set default auth.uid();
alter table public.memories alter column user_id set default auth.uid();
alter table public.contacts alter column user_id set default auth.uid();
alter table public.call_history alter column user_id set default auth.uid();
alter table public.call_messages alter column user_id set default auth.uid();
alter table public.social_drafts alter column user_id set default auth.uid();
alter table public.chat_history alter column user_id set default auth.uid();

-- =========================================================================
-- STEP 3: MIGRATE OR BACKFILL UNASSIGNED RECORDS TO RITESH'S UID
-- User UID: 19df4d16-0c84-4291-8303-dc6aba0f8b00
-- =========================================================================

do $$
declare
  v_uid uuid;
begin
  -- Resolve UID for riteshkumarrai313@gmail.com
  select id into v_uid from auth.users where email = 'riteshkumarrai313@gmail.com' limit 1;
  if v_uid is null then
    v_uid := '19df4d16-0c84-4291-8303-dc6aba0f8b00'::uuid;
  end if;

  -- Backfill any rows where user_id is null
  update public.tasks set user_id = v_uid where user_id is null;
  update public.reminders set user_id = v_uid where user_id is null;
  update public.routine_items set user_id = v_uid where user_id is null;
  update public.memories set user_id = v_uid where user_id is null;
  update public.contacts set user_id = v_uid where user_id is null;
  update public.call_history set user_id = v_uid where user_id is null;
  update public.call_messages set user_id = v_uid where user_id is null;
  update public.social_drafts set user_id = v_uid where user_id is null;
  update public.chat_history set user_id = v_uid where user_id is null;
  
  raise notice 'Verified and migrated unassigned records to UID: %', v_uid;
end $$;

-- =========================================================================
-- STEP 4: INDEXES FOR PERFORMANCE
-- =========================================================================

create index if not exists idx_tasks_user_id on public.tasks (user_id);
create index if not exists idx_tasks_status on public.tasks (status);
create index if not exists idx_tasks_date on public.tasks (date);
create index if not exists idx_tasks_category on public.tasks (category);

create index if not exists idx_reminders_user_id on public.reminders (user_id);
create index if not exists idx_reminders_date_time on public.reminders (date, time);
create index if not exists idx_reminders_completed on public.reminders (is_completed);

create index if not exists idx_routine_user_id on public.routine_items (user_id);
create index if not exists idx_routine_period on public.routine_items (period);

create index if not exists idx_memories_user_id on public.memories (user_id);
create index if not exists idx_memories_category on public.memories (category);

create index if not exists idx_contacts_user_id on public.contacts (user_id);
create index if not exists idx_contacts_name on public.contacts (name);

create index if not exists idx_call_history_user_id on public.call_history (user_id);
create index if not exists idx_call_history_timestamp on public.call_history (timestamp);

create index if not exists idx_call_messages_user_id on public.call_messages (user_id);

create index if not exists idx_social_drafts_user_id on public.social_drafts (user_id);
create index if not exists idx_social_drafts_platform on public.social_drafts (platform);

create index if not exists idx_chat_history_user_id on public.chat_history (user_id);
create index if not exists idx_chat_history_created on public.chat_history (created_at);

-- =========================================================================
-- STEP 5: STRICT ROW-LEVEL SECURITY (RLS) POLICIES
-- Zero wildcards. Uses user_id = auth.uid() directly with UUID typing.
-- =========================================================================

-- PROFILES
alter table public.profiles enable row level security;
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- TASKS
alter table public.tasks enable row level security;
drop policy if exists "tasks_all_policy" on public.tasks;
drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own" on public.tasks
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own" on public.tasks
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own" on public.tasks
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own" on public.tasks
  for delete to authenticated
  using (user_id = auth.uid());

-- REMINDERS
alter table public.reminders enable row level security;
drop policy if exists "reminders_all_policy" on public.reminders;
drop policy if exists "reminders_select_own" on public.reminders;
create policy "reminders_select_own" on public.reminders
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "reminders_insert_own" on public.reminders;
create policy "reminders_insert_own" on public.reminders
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "reminders_update_own" on public.reminders;
create policy "reminders_update_own" on public.reminders
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "reminders_delete_own" on public.reminders;
create policy "reminders_delete_own" on public.reminders
  for delete to authenticated
  using (user_id = auth.uid());

-- ROUTINE
alter table public.routine_items enable row level security;
drop policy if exists "routine_all_policy" on public.routine_items;
drop policy if exists "routine_select_own" on public.routine_items;
create policy "routine_select_own" on public.routine_items
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "routine_insert_own" on public.routine_items;
create policy "routine_insert_own" on public.routine_items
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "routine_update_own" on public.routine_items;
create policy "routine_update_own" on public.routine_items
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "routine_delete_own" on public.routine_items;
create policy "routine_delete_own" on public.routine_items
  for delete to authenticated
  using (user_id = auth.uid());

-- MEMORIES
alter table public.memories enable row level security;
drop policy if exists "memories_all_policy" on public.memories;
drop policy if exists "memories_select_own" on public.memories;
create policy "memories_select_own" on public.memories
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "memories_insert_own" on public.memories;
create policy "memories_insert_own" on public.memories
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "memories_update_own" on public.memories;
create policy "memories_update_own" on public.memories
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "memories_delete_own" on public.memories;
create policy "memories_delete_own" on public.memories
  for delete to authenticated
  using (user_id = auth.uid());

-- CONTACTS
alter table public.contacts enable row level security;
drop policy if exists "contacts_all_policy" on public.contacts;
drop policy if exists "contacts_select_own" on public.contacts;
create policy "contacts_select_own" on public.contacts
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "contacts_insert_own" on public.contacts;
create policy "contacts_insert_own" on public.contacts
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "contacts_update_own" on public.contacts;
create policy "contacts_update_own" on public.contacts
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "contacts_delete_own" on public.contacts;
create policy "contacts_delete_own" on public.contacts
  for delete to authenticated
  using (user_id = auth.uid());

-- CALL HISTORY
alter table public.call_history enable row level security;
drop policy if exists "call_history_all_policy" on public.call_history;
drop policy if exists "call_history_select_own" on public.call_history;
create policy "call_history_select_own" on public.call_history
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "call_history_insert_own" on public.call_history;
create policy "call_history_insert_own" on public.call_history
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "call_history_update_own" on public.call_history;
create policy "call_history_update_own" on public.call_history
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "call_history_delete_own" on public.call_history;
create policy "call_history_delete_own" on public.call_history
  for delete to authenticated
  using (user_id = auth.uid());

-- CALL MESSAGES
alter table public.call_messages enable row level security;
drop policy if exists "call_messages_all_policy" on public.call_messages;
drop policy if exists "call_messages_select_own" on public.call_messages;
create policy "call_messages_select_own" on public.call_messages
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "call_messages_insert_own" on public.call_messages;
create policy "call_messages_insert_own" on public.call_messages
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "call_messages_update_own" on public.call_messages;
create policy "call_messages_update_own" on public.call_messages
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "call_messages_delete_own" on public.call_messages;
create policy "call_messages_delete_own" on public.call_messages
  for delete to authenticated
  using (user_id = auth.uid());

-- SOCIAL DRAFTS
alter table public.social_drafts enable row level security;
drop policy if exists "social_drafts_all_policy" on public.social_drafts;
drop policy if exists "social_drafts_select_own" on public.social_drafts;
create policy "social_drafts_select_own" on public.social_drafts
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "social_drafts_insert_own" on public.social_drafts;
create policy "social_drafts_insert_own" on public.social_drafts
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "social_drafts_update_own" on public.social_drafts;
create policy "social_drafts_update_own" on public.social_drafts
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "social_drafts_delete_own" on public.social_drafts;
create policy "social_drafts_delete_own" on public.social_drafts
  for delete to authenticated
  using (user_id = auth.uid());

-- CHAT HISTORY
alter table public.chat_history enable row level security;
drop policy if exists "chat_history_all_policy" on public.chat_history;
drop policy if exists "chat_history_select_own" on public.chat_history;
create policy "chat_history_select_own" on public.chat_history
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "chat_history_insert_own" on public.chat_history;
create policy "chat_history_insert_own" on public.chat_history
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "chat_history_update_own" on public.chat_history;
create policy "chat_history_update_own" on public.chat_history
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "chat_history_delete_own" on public.chat_history;
create policy "chat_history_delete_own" on public.chat_history
  for delete to authenticated
  using (user_id = auth.uid());

-- =========================================================================
-- STEP 6: AUTH TRIGGER & AUTO-PROVISIONING
-- =========================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, assistant_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Ritesh Kumar'),
    'Lakshmi'
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill any existing users from auth.users into profiles
insert into public.profiles (id, email, full_name, assistant_name)
select id, email, coalesce(raw_user_meta_data->>'full_name', 'Ritesh Kumar'), 'Lakshmi'
from auth.users
on conflict (id) do nothing;
`;
  },
};
