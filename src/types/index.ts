export type LanguageMode = 'auto' | 'hinglish' | 'hindi' | 'english';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskCategory = 
  | 'College' 
  | 'Coding' 
  | 'Job Preparation' 
  | 'Project' 
  | 'Personal' 
  | 'Social Media' 
  | 'Other';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  priority: Priority;
  category: TaskCategory;
  status: TaskStatus;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  completedAt?: string;
}

export interface Reminder {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'recurring' | 'custom';
  category: string;
  isCompleted: boolean;
  notified?: boolean;
  notes?: string;
  createdAt: string;
}

export type RoutinePeriod = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

export interface RoutineItem {
  id: string;
  period: RoutinePeriod;
  title: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  days: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] or ['Daily']
  category: string;
  isCompletedToday: boolean;
  enabled: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location?: string;
  category: string;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  reminderMinutesBefore?: number;
}

export interface MemoryItem {
  id: string;
  content: string;
  category: 'Preferences' | 'Routine' | 'Career' | 'Family' | 'Coding' | 'General';
  importance: 'normal' | 'high';
  createdAt: string;
  updatedAt?: string;
}

export type ContactPriority = 'Normal' | 'Important' | 'Very Important' | 'Emergency';

export interface ImportantContact {
  id: string;
  name: string;
  relation: string; // e.g. "Papa", "Mummy", "Brother", "Sister", "Friend"
  phoneNumber: string;
  priority: ContactPriority;
  avatar?: string;
  incomingAction: 'ring_loudly' | 'special_banner' | 'auto_forward' | 'standard';
  unansweredAction: 'voice_reply' | 'record_message' | 'sms_alert' | 'standard';
  forwardingNumber?: string;
  isSpecialRule?: boolean; // For Papa special rule
}

export interface CallRecord {
  id: string;
  contactName: string;
  phoneNumber: string;
  timestamp: string;
  type: 'incoming' | 'outgoing' | 'missed';
  status: 'answered' | 'missed' | 'forwarded' | 'auto_answered';
  durationSeconds: number;
  messageReceived?: string;
  followUpReminderCreated?: boolean;
  notes?: string;
}

export interface CallMessage {
  id: string;
  callerName: string;
  phoneNumber: string;
  timestamp: string;
  message: string;
  status: 'new' | 'reviewed' | 'called_back';
  languageDetected?: string;
}

export type SocialPlatform = 'linkedin' | 'instagram' | 'facebook';

export interface SocialDraft {
  id: string;
  platform: SocialPlatform;
  topic: string;
  content: string;
  caption?: string;
  hashtags: string[];
  status: 'draft' | 'ready' | 'published';
  createdAt: string;
  publishedAt?: string;
}

export interface AssistantSettings {
  userName: string;
  userEmail: string;
  assistantName: string;
  languageMode: LanguageMode;
  voiceGender: 'female';
  responseStyle: 'caring_concise' | 'professional' | 'calm';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  telephonyConnected: boolean;
  telephonyMode: 'companion_ready' | 'simulated' | 'disconnected';
  unansweredTimeoutSeconds: number;
  autoVoiceReplyEnabled: boolean;
  autoForwardingEnabled: boolean;
  defaultForwardingNumber: string;
  socialIntegrations: {
    linkedin: { connected: boolean; username?: string };
    instagram: { connected: boolean; username?: string };
    facebook: { connected: boolean; username?: string };
  };
  supabaseConfig: {
    enabled: boolean;
    url: string;
    anonKey: string;
    connected: boolean;
    lastSynced?: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionTaken?: {
    type: 'task_created' | 'reminder_set' | 'memory_saved' | 'routine_updated' | 'event_created' | 'social_drafted' | 'schedule_queried' | 'call_logged';
    label: string;
    details?: string;
    data?: any;
  };
  audioBase64?: string;
}
