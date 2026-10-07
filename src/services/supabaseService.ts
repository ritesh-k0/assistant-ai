import {
  createClient,
  SupabaseClient,
  User,
  Session,
} from '@supabase/supabase-js';

import {
  Task,
  Reminder,
  RoutineItem,
  MemoryItem,
  Contact,
  CallRecord,
  CallMessage,
  SocialDraft,
  ChatMessage,
} from '../types';

import {
  DEFAULT_SUPABASE_PROJECT_ID,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
} from './db';

class SupabaseService {
  private client!: SupabaseClient;
  private currentUrl: string = DEFAULT_SUPABASE_URL;
  private currentKey: string = DEFAULT_SUPABASE_ANON_KEY;
  private currentSession: Session | null = null;
  private currentUser: User | null = null;

  constructor() {
    this.init(this.currentUrl, this.currentKey);
    this.initFromStoredConfig();
  }

  // =====================================================
  // INITIALIZATION & SHARED CLIENT SINGLETON
  // =====================================================

  getClient(): SupabaseClient {
    return this.client;
  }

  init(url?: string, key?: string) {
    const targetUrl = DEFAULT_SUPABASE_URL;
    const targetKey = key || this.currentKey || DEFAULT_SUPABASE_ANON_KEY;

    if (!targetUrl || !targetKey) {
      console.error(
        '❌ Supabase URL or key is missing'
      );
      return;
    }

    // Preserve single shared client instance if already initialized with current credentials
    if (this.client && this.currentUrl === targetUrl && this.currentKey === targetKey) {
      return;
    }

    try {
      this.currentUrl = targetUrl;
      this.currentKey = targetKey;

      this.client = createClient(
        this.currentUrl,
        this.currentKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
            storageKey: `sb-${DEFAULT_SUPABASE_PROJECT_ID}-auth-token`,
          },
        }
      );

      // Keep in-memory session and user synchronized
      this.client.auth.onAuthStateChange((_event, session) => {
        this.currentSession = session;
        this.currentUser = session?.user ?? null;
      });

      // Hydrate initial auth session asynchronously
      this.client.auth.getSession().then(({ data }) => {
        if (data?.session) {
          this.currentSession = data.session;
          this.currentUser = data.session.user;
        }
      }).catch(() => {
        // Handled silently
      });

      console.log(
        '✅ Shared Supabase client initialized:',
        this.currentUrl
      );
    } catch (error) {
      console.error(
        '❌ Supabase init failed:',
        error
      );
    }
  }

  private initFromStoredConfig() {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }

      const stored = localStorage.getItem(
        'ritesh_assistant_settings_v1'
      );

      if (!stored) return;

      const parsed = JSON.parse(stored);

      // Enforce the current project URL so outdated configurations cannot override it
      const url = DEFAULT_SUPABASE_URL;

      const anonKey =
        (parsed?.supabaseConfig?.anonKey && !parsed.supabaseConfig.anonKey.includes('MK4bTSrWsCx1GV9HzEEKIA'))
          ? parsed.supabaseConfig.anonKey
          : DEFAULT_SUPABASE_ANON_KEY;

      // Sanitize stored config if it had an outdated URL or old key
      if (parsed?.supabaseConfig && (parsed.supabaseConfig.url !== DEFAULT_SUPABASE_URL || parsed.supabaseConfig.anonKey?.includes('MK4bTSrWsCx1GV9HzEEKIA'))) {
        parsed.supabaseConfig.url = DEFAULT_SUPABASE_URL;
        parsed.supabaseConfig.anonKey = DEFAULT_SUPABASE_ANON_KEY;
        try {
          localStorage.setItem('ritesh_assistant_settings_v1', JSON.stringify(parsed));
        } catch {
          // Ignore write failure
        }
      }

      if (anonKey && anonKey !== this.currentKey) {
        this.init(url, anonKey);
      }
    } catch (error) {
      console.warn(
        '⚠️ Unable to load stored Supabase config:',
        error
      );
    }
  }

  // =====================================================
  // AUTH
  // =====================================================

  async getAuthSession(): Promise<Session | null> {
    if (!this.client) return null;
    try {
      if (this.currentSession?.user) {
        return this.currentSession;
      }

      const { data, error } =
        await this.client.auth.getSession();

      if (error) {
        if (
          error.name !== 'AuthSessionMissingError' &&
          !error.message?.includes('Auth session missing')
        ) {
          console.warn('getAuthSession:', error.message);
        }
        return null;
      }

      if (data?.session) {
        this.currentSession = data.session;
        this.currentUser = data.session.user;
        return data.session;
      }

      return null;
    } catch {
      return null;
    }
  }

  async getAuthUser(): Promise<User | null> {
    if (!this.client) return null;
    try {
      // 1. Fast path: return in-memory cached user
      if (this.currentUser?.id) {
        return this.currentUser;
      }

      // 2. Read from active session
      const session = await this.getAuthSession();
      if (session?.user?.id) {
        this.currentUser = session.user;
        return session.user;
      }

      // 3. Query getUser() from Supabase Auth
      const { data, error } =
        await this.client.auth.getUser();

      if (!error && data?.user?.id) {
        this.currentUser = data.user;
        return data.user;
      }

      // 4. Fallback: inspect localStorage directly if storage reader is in-flight
      if (typeof window !== 'undefined' && window.localStorage) {
        const storageKeys = [
          `sb-${DEFAULT_SUPABASE_PROJECT_ID}-auth-token`,
          'sb-fupgnszofujkaslbawgq-auth-token',
        ];
        for (const sk of storageKeys) {
          const raw = localStorage.getItem(sk);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              const user = parsed?.user || parsed?.currentSession?.user;
              if (user?.id) {
                this.currentUser = user;
                return user;
              }
            } catch {
              // Ignore
            }
          }
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  async getActiveUserId(): Promise<string | null> {
    const user = await this.getAuthUser();
    if (user?.id) {
      console.log('SUPABASE AUTH:', {
        userId: user.id,
        email: user.email,
      });
      return user.id;
    }
    return null;
  }

  async signInWithPassword(
    email: string,
    password: string
  ) {
    const res = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    if (res.data?.session) {
      this.currentSession = res.data.session;
      this.currentUser = res.data.user;
    }
    return res;
  }

  async signUpWithPassword(
    email: string,
    password: string,
    fullName?: string
  ) {
    const res = await this.client.auth.signUp({
      email,
      password,
      options: fullName ? { data: { full_name: fullName } } : undefined,
    });
    if (res.data?.session) {
      this.currentSession = res.data.session;
      this.currentUser = res.data.user;
    }
    return res;
  }

  async signOut() {
    this.currentSession = null;
    this.currentUser = null;
    return await this.client.auth.signOut();
  }

  onAuthStateChange(
    callback: (
      event: string,
      session: Session | null
    ) => void
  ) {
    return this.client.auth.onAuthStateChange(
      (event, session) => {
        callback(event, session);
      }
    );
  }

  // =====================================================
  // TEST CONNECTION
  // =====================================================

  async testConnection(): Promise<boolean> {
    try {
      const { error } =
        await this.client
          .from('tasks')
          .select('id')
          .limit(1);

      if (error) {
        console.error(
          '❌ Supabase connection error:',
          error
        );
        return false;
      }

      console.log(
        '✅ Supabase connection successful'
      );

      return true;
    } catch (error) {
      console.error(
        '❌ Supabase connection exception:',
        error
      );
      return false;
    }
  }

  // =====================================================
  // PROFILES / USER SETTINGS
  // =====================================================

  async getProfile(): Promise<any | null> {
    try {
      const userId = await this.getActiveUserId();
      if (!userId) return null;

      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('SUPABASE READ FAILED', {
          table: 'profiles',
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        return null;
      }
      return data ?? null;
    } catch (error: any) {
      console.error('❌ getProfile exception:', error?.message || error);
      return null;
    }
  }

  async syncProfile(profileData: {
    userName?: string;
    userEmail?: string;
    assistantName?: string;
    languageMode?: string;
  }): Promise<boolean> {
    try {
      const userId = await this.getActiveUserId();
      if (!userId) {
        console.log('ℹ️ syncProfile skipped: No authenticated user (profiles table requires an authenticated Supabase user account)');
        return true;
      }

      const user = await this.getAuthUser();
      const payload = {
        id: userId,
        email: profileData.userEmail || user?.email || 'user@example.com',
        full_name: profileData.userName || 'Ritesh Kumar',
        assistant_name: profileData.assistantName || 'Lakshmi',
        language_mode: profileData.languageMode || 'auto',
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.client
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (error) {
        console.error('SUPABASE WRITE FAILED', {
          table: 'profiles',
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          payload,
        });
        console.error(`❌ Profile sync failed: ${error.message}`);
        return false;
      }

      console.log('DATABASE WRITE RESULT [profiles]:', { data, error: null });
      console.log('✅ Profile synced successfully');
      return true;
    } catch (error: any) {
      console.error('❌ syncProfile exception:', error?.message || error);
      return false;
    }
  }

  // =====================================================
  // TASKS
  // =====================================================

  async getTasks(): Promise<Task[]> {
    try {
      const userId = await this.getActiveUserId();
      let query = this.client
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true });

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ getTasks error:', error);
        return [];
      }

      return (data ?? []).map((row: any) => ({
        id: row.id,
        title: row.title ?? '',
        description: row.description ?? '',
        category: row.category ?? 'Coding',
        status: row.status ?? 'pending',
        date: row.date ?? '',
        time: row.time ?? '',
        priority: row.priority ?? 'medium',
        recurring: row.recurring ?? 'none',
        createdAt: row.created_at ?? new Date().toISOString(),
        completedAt: row.status === 'completed' ? (row.updated_at ?? row.created_at) : undefined,
      })) as Task[];
    } catch (error) {
      console.error('❌ getTasks exception:', error);
      return [];
    }
  }

  async syncTask(task: Task): Promise<boolean> {
    try {
      const userId = await this.getActiveUserId();
      const payload = {
        id: task.id,
        user_id: userId || null,
        title: task.title?.trim() || 'Untitled Task',
        description: task.description?.trim() || null,
        category: task.category || 'Coding',
        status: task.status || 'pending',
        date: task.date || new Date().toISOString().split('T')[0],
        time: task.time?.trim() || null,
        priority: task.priority || 'medium',
        recurring: task.recurring || 'none',
        created_at: task.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await this.client
        .from('tasks')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('❌ syncTask error:', error);
        return false;
      }

      console.log(`✅ [tasks] row synced to Supabase (id=${payload.id}, user_id=${payload.user_id || 'anon'})`);
      return true;
    } catch (error) {
      console.error('❌ syncTask exception:', error);
      return false;
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      const userId = await this.getActiveUserId();
      let query = this.client.from('tasks').delete().eq('id', id);
      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { error } = await query;
      if (error) {
        console.error('❌ deleteTask error:', error);
        return false;
      }

      console.log(`✅ [tasks] row deleted from Supabase (id=${id})`);
      return true;
    } catch (error) {
      console.error('❌ deleteTask exception:', error);
      return false;
    }
  }

  // =====================================================
  // REMINDERS
  // =====================================================

  async getReminders(): Promise<Reminder[]> {
    try {
      const userId = await this.getActiveUserId();
      let query = this.client
        .from('reminders')
        .select('*')
        .order('created_at', { ascending: true });

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ getReminders error:', error);
        return [];
      }

      return (data ?? []).map((row: any) => ({
        id: row.id,
        title: row.title ?? '',
        date: row.date ?? '',
        time: row.time ?? '',
        type: row.type ?? 'one-time',
        category: row.category ?? 'General',
        isCompleted: row.is_completed ?? false,
        notes: row.description ?? '',
        createdAt: row.created_at ?? new Date().toISOString(),
      })) as Reminder[];
    } catch (error) {
      console.error('❌ getReminders exception:', error);
      return [];
    }
  }

  async syncReminder(reminder: Reminder): Promise<boolean> {
    try {
      const userId = await this.getActiveUserId();
      const payload = {
        id: reminder.id,
        user_id: userId || null,
        title: reminder.title?.trim() || 'Reminder',
        description: reminder.notes?.trim() || null,
        date: reminder.date || new Date().toISOString().split('T')[0],
        time: reminder.time || '09:00',
        type: reminder.type || 'one-time',
        category: reminder.category || 'General',
        is_completed: reminder.isCompleted ?? false,
        created_at: reminder.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await this.client
        .from('reminders')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('❌ syncReminder error:', error);
        return false;
      }

      console.log(`✅ [reminders] row synced to Supabase (id=${payload.id}, user_id=${payload.user_id || 'anon'})`);
      return true;
    } catch (error) {
      console.error('❌ syncReminder exception:', error);
      return false;
    }
  }

  async deleteReminder(id: string): Promise<boolean> {
    try {
      const userId = await this.getActiveUserId();
      let query = this.client.from('reminders').delete().eq('id', id);
      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { error } = await query;
      if (error) {
        console.error('❌ deleteReminder error:', error);
        return false;
      }

      console.log(`✅ [reminders] row deleted from Supabase (id=${id})`);
      return true;
    } catch (error) {
      console.error('❌ deleteReminder exception:', error);
      return false;
    }
  }

  // =====================================================
  // ROUTINE
  // =====================================================

  async getRoutineItems(): Promise<RoutineItem[]> {
    try {
      const userId = await this.getActiveUserId();
      let query = this.client
        .from('routine_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ getRoutineItems error:', error);
        return [];
      }

      return (data ?? []).map((row: any) => ({
        id: row.id,
        period: row.period ?? 'Morning',
        title: row.title ?? '',
        startTime: row.start_time ?? '',
        endTime: row.end_time ?? '',
        days: Array.isArray(row.days) ? row.days : ['Daily'],
        category: row.category ?? 'General',
        enabled: row.enabled ?? true,
        isCompletedToday: row.is_completed_today ?? false,
      })) as RoutineItem[];
    } catch (error) {
      console.error('❌ getRoutineItems exception:', error);
      return [];
    }
  }

  async syncRoutineItem(item: RoutineItem): Promise<boolean> {
    try {
      const userId = await this.getActiveUserId();
      const payload = {
        id: item.id,
        user_id: userId || null,
        period: item.period || 'Morning',
        title: item.title?.trim() || 'Routine Item',
        start_time: item.startTime?.trim() || '07:00',
        end_time: item.endTime?.trim() || '08:00',
        days: item.days?.length ? item.days : ['Daily'],
        category: item.category ?? 'General',
        enabled: item.enabled ?? true,
        is_completed_today: item.isCompletedToday ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await this.client
        .from('routine_items')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('❌ syncRoutineItem error:', error);
        return false;
      }

      console.log(`✅ [routine_items] row synced to Supabase (id=${payload.id}, user_id=${payload.user_id || 'anon'})`);
      return true;
    } catch (error) {
      console.error('❌ syncRoutineItem exception:', error);
      return false;
    }
  }

  async deleteRoutineItem(id: string): Promise<boolean> {
    try {
      const userId = await this.getActiveUserId();
      let query = this.client.from('routine_items').delete().eq('id', id);
      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { error } = await query;
      if (error) {
        console.error('❌ deleteRoutineItem error:', error);
        return false;
      }

      console.log(`✅ [routine_items] row deleted from Supabase (id=${id})`);
      return true;
    } catch (error) {
      console.error('❌ deleteRoutineItem exception:', error);
      return false;
    }
  }

  // =====================================================
  // MEMORY
  // =====================================================

  async getMemories(): Promise<MemoryItem[]> {
    try {
      const userId = await this.getActiveUserId();
      let query = this.client
        .from('memories')
        .select('*')
        .order('created_at', { ascending: true });

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ getMemories error:', error);
        return [];
      }

      return (data ?? []).map((row: any) => ({
        id: row.id,
        content: row.content ?? '',
        category: row.category ?? 'General',
        importance: row.importance ?? 'normal',
        createdAt: row.created_at ?? new Date().toISOString(),
        updatedAt: row.updated_at ?? new Date().toISOString(),
      })) as MemoryItem[];
    } catch (error) {
      console.error('❌ getMemories exception:', error);
      return [];
    }
  }

  async syncMemory(memory: MemoryItem): Promise<boolean> {
    try {
      const userId = await this.getActiveUserId();
      const payload = {
        id: memory.id,
        user_id: userId || null,
        content: memory.content?.trim() || '',
        category: memory.category || 'General',
        importance: memory.importance || 'normal',
        created_at: memory.createdAt ?? new Date().toISOString(),
        updated_at: memory.updatedAt ?? new Date().toISOString(),
      };

      const { error } = await this.client
        .from('memories')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('❌ syncMemory error:', error);
        return false;
      }

      console.log(`✅ [memories] row synced to Supabase (id=${payload.id}, user_id=${payload.user_id || 'anon'})`);
      return true;
    } catch (error) {
      console.error('❌ syncMemory exception:', error);
      return false;
    }
  }

  async deleteMemory(id: string): Promise<boolean> {
    try {
      const userId = await this.getActiveUserId();
      let query = this.client.from('memories').delete().eq('id', id);
      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { error } = await query;
      if (error) {
        console.error('❌ deleteMemory error:', error);
        return false;
      }

      console.log(`✅ [memories] row deleted from Supabase (id=${id})`);
      return true;
    } catch (error) {
      console.error('❌ deleteMemory exception:', error);
      return false;
    }
  }

  // =====================================================
  // CONTACTS
  // =====================================================

  async getContacts(): Promise<Contact[]> {
    try {
      const userId = await this.getActiveUserId();
      let query = this.client
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: true });

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ getContacts error:', error);
        return [];
      }

      return (data ?? []).map((row: any) => ({
        id: row.id,
        name: row.name ?? '',
        relation: row.relation ?? '',
        phoneNumber: row.phone_number ?? '',
        priority: row.priority ?? 'Important',
        incomingAction: row.incoming_action ?? 'standard',
        unansweredAction: row.unanswered_action ?? 'voice_reply',
        forwardingNumber: row.forwarding_number ?? undefined,
        isSpecialRule: row.is_special_rule ?? false,
      })) as Contact[];
    } catch (error) {
      console.error('❌ getContacts exception:', error);
      return [];
    }
  }

  async syncContact(contact: Contact): Promise<boolean> {
    try {
      const userId = await this.getActiveUserId();
      const payload = {
        id: contact.id,
        user_id: userId || null,
        name: contact.name?.trim() || 'Contact',
        relation: contact.relation?.trim() || null,
        phone_number: contact.phoneNumber?.trim() || '',
        priority: contact.priority || 'Important',
        incoming_action: contact.incomingAction || 'standard',
        unanswered_action: contact.unansweredAction || 'voice_reply',
        forwarding_number: contact.forwardingNumber?.trim() || null,
        is_special_rule: contact.isSpecialRule ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await this.client
        .from('contacts')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('❌ syncContact error:', error);
        return false;
      }

      console.log(`✅ [contacts] row synced to Supabase (id=${payload.id}, user_id=${payload.user_id || 'anon'})`);
      return true;
    } catch (error) {
      console.error('❌ syncContact exception:', error);
      return false;
    }
  }

  async deleteContact(id: string): Promise<boolean> {
    try {
      const userId = await this.getActiveUserId();
      let query = this.client.from('contacts').delete().eq('id', id);
      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { error } = await query;
      if (error) {
        console.error('❌ deleteContact error:', error);
        return false;
      }

      console.log(`✅ [contacts] row deleted from Supabase (id=${id})`);
      return true;
    } catch (error) {
      console.error('❌ deleteContact exception:', error);
      return false;
    }
  }

  // =====================================================
  // CALL HISTORY
  // =====================================================

  async getCallHistory(): Promise<CallRecord[]> {
    try {
      const userId = await this.getActiveUserId();
      let query = this.client
        .from('call_history')
        .select('*')
        .order('timestamp', { ascending: false });

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ getCallHistory error:', error);
        return [];
      }

      return (data ?? []).map((row: any) => ({
        id: row.id,
        contactName: row.contact_name ?? '',
        phoneNumber: row.phone_number ?? '',
        timestamp: row.timestamp ?? new Date().toISOString(),
        type: row.type ?? 'incoming',
        status: row.status ?? 'missed',
        durationSeconds: row.duration_seconds ?? 0,
        messageReceived: row.message_received ?? undefined,
        notes: row.notes ?? undefined,
      })) as CallRecord[];
    } catch (error) {
      console.error('❌ getCallHistory exception:', error);
      return [];
    }
  }

  async syncCallRecord(record: CallRecord): Promise<boolean> {
    try {
      const userId = await this.getActiveUserId();
      const payload = {
        id: record.id,
        user_id: userId || null,
        contact_name: record.contactName?.trim() || 'Unknown',
        phone_number: record.phoneNumber?.trim() || '',
        timestamp: record.timestamp || new Date().toISOString(),
        type: record.type || 'incoming',
        status: record.status || 'missed',
        duration_seconds: record.durationSeconds ?? 0,
        message_received: record.messageReceived ? String(record.messageReceived) : null,
        notes: record.notes?.trim() || null,
        created_at: new Date().toISOString(),
      };

      const { error } = await this.client
        .from('call_history')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('❌ syncCallRecord error:', error);
        return false;
      }

      console.log(`✅ [call_history] row synced to Supabase (id=${payload.id}, user_id=${payload.user_id || 'anon'})`);
      return true;
    } catch (error) {
      console.error('❌ syncCallRecord exception:', error);
      return false;
    }
  }

  async deleteCallRecord(id: string): Promise<boolean> {
    try {
      const userId = await this.getActiveUserId();
      let query = this.client.from('call_history').delete().eq('id', id);
      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { error } = await query;
      if (error) {
        console.error('❌ deleteCallRecord error:', error);
        return false;
      }

      console.log(`✅ [call_history] row deleted from Supabase (id=${id})`);
      return true;
    } catch (error) {
      console.error('❌ deleteCallRecord exception:', error);
      return false;
    }
  }

  // =====================================================
  // CALL MESSAGES
  // =====================================================

  async getCallMessages(): Promise<CallMessage[]> {
    try {
      const userId = await this.getActiveUserId();
      let query = this.client
        .from('call_messages')
        .select('*')
        .order('timestamp', { ascending: false });

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ getCallMessages error:', error);
        return [];
      }

      return (data ?? []).map((row: any) => ({
        id: row.id,
        callerName: row.caller_name ?? '',
        phoneNumber: row.phone_number ?? '',
        timestamp: row.timestamp ?? new Date().toISOString(),
        message: row.message ?? '',
        status: row.status ?? 'new',
        languageDetected: row.language_detected ?? 'auto',
      })) as CallMessage[];
    } catch (error) {
      console.error('❌ getCallMessages exception:', error);
      return [];
    }
  }

  async syncCallMessage(message: CallMessage): Promise<boolean> {
    try {
      const userId = await this.getActiveUserId();
      const payload = {
        id: message.id,
        user_id: userId || null,
        caller_name: message.callerName?.trim() || 'Unknown',
        phone_number: message.phoneNumber?.trim() || '',
        timestamp: message.timestamp || new Date().toISOString(),
        message: message.message?.trim() || '',
        status: message.status || 'new',
        language_detected: message.languageDetected || 'Hindi / Hinglish',
        created_at: new Date().toISOString(),
      };

      const { error } = await this.client
        .from('call_messages')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('❌ syncCallMessage error:', error);
        return false;
      }

      console.log(`✅ [call_messages] row synced to Supabase (id=${payload.id}, user_id=${payload.user_id || 'anon'})`);
      return true;
    } catch (error) {
      console.error('❌ syncCallMessage exception:', error);
      return false;
    }
  }

  async deleteCallMessage(id: string): Promise<boolean> {
    try {
      const userId = await this.getActiveUserId();
      let query = this.client.from('call_messages').delete().eq('id', id);
      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { error } = await query;
      if (error) {
        console.error('❌ deleteCallMessage error:', error);
        return false;
      }

      console.log(`✅ [call_messages] row deleted from Supabase (id=${id})`);
      return true;
    } catch (error) {
      console.error('❌ deleteCallMessage exception:', error);
      return false;
    }
  }

  // =====================================================
  // SOCIAL DRAFTS
  // =====================================================

  async getSocialDrafts(): Promise<SocialDraft[]> {
    try {
      const userId = await this.getActiveUserId();
      let query = this.client
        .from('social_drafts')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ getSocialDrafts error:', error);
        return [];
      }

      return (data ?? []).map((row: any) => ({
        id: row.id,
        platform: row.platform ?? '',
        topic: row.topic ?? '',
        content: row.content ?? '',
        caption: row.caption ?? '',
        hashtags: Array.isArray(row.hashtags) ? row.hashtags : [],
        status: row.status ?? 'draft',
        publishedAt: row.published_at ?? undefined,
        createdAt: row.created_at ?? new Date().toISOString(),
      })) as SocialDraft[];
    } catch (error) {
      console.error('❌ getSocialDrafts exception:', error);
      return [];
    }
  }

  async syncSocialDraft(draft: SocialDraft): Promise<boolean> {
    try {
      const userId = await this.getActiveUserId();
      const payload = {
        id: draft.id,
        user_id: userId || null,
        platform: draft.platform || 'linkedin',
        topic: draft.topic?.trim() || '',
        content: draft.content?.trim() || '',
        caption: draft.caption?.trim() || null,
        hashtags: Array.isArray(draft.hashtags) ? draft.hashtags : [],
        status: draft.status || 'draft',
        published_at: draft.publishedAt || null,
        created_at: draft.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await this.client
        .from('social_drafts')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('❌ syncSocialDraft error:', error);
        return false;
      }

      console.log(`✅ [social_drafts] row synced to Supabase (id=${payload.id}, user_id=${payload.user_id || 'anon'})`);
      return true;
    } catch (error) {
      console.error('❌ syncSocialDraft exception:', error);
      return false;
    }
  }

  async deleteSocialDraft(id: string): Promise<boolean> {
    try {
      const userId = await this.getActiveUserId();
      let query = this.client.from('social_drafts').delete().eq('id', id);
      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { error } = await query;
      if (error) {
        console.error('❌ deleteSocialDraft error:', error);
        return false;
      }

      console.log(`✅ [social_drafts] row deleted from Supabase (id=${id})`);
      return true;
    } catch (error) {
      console.error('❌ deleteSocialDraft exception:', error);
      return false;
    }
  }

  // =====================================================
  // CHAT HISTORY
  // =====================================================

  async getChatHistory(): Promise<ChatMessage[]> {
    try {
      const userId = await this.getActiveUserId();
      let query = this.client
        .from('chat_history')
        .select('*')
        .order('timestamp', { ascending: true });

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ getChatHistory error:', error);
        return [];
      }

      return (data ?? []).map((row: any) => ({
        id: row.id,
        sender: row.sender ?? 'user',
        text: row.text ?? '',
        actionTaken: row.action_taken ?? undefined,
        timestamp: row.timestamp ?? new Date().toISOString(),
      })) as ChatMessage[];
    } catch (error) {
      console.error('❌ getChatHistory exception:', error);
      return [];
    }
  }

  async syncChatMessage(message: ChatMessage): Promise<boolean> {
    try {
      const userId = await this.getActiveUserId();
      const payload = {
        id: message.id,
        user_id: userId || null,
        sender: message.sender || 'user',
        text: message.text || '',
        action_taken: message.actionTaken ?? null,
        timestamp: message.timestamp || new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      const { error } = await this.client
        .from('chat_history')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('❌ syncChatMessage error:', error);
        return false;
      }

      console.log(`✅ [chat_history] row synced to Supabase (id=${payload.id}, user_id=${payload.user_id || 'anon'})`);
      return true;
    } catch (error) {
      console.error('❌ syncChatMessage exception:', error);
      return false;
    }
  }

  // =====================================================
  // BULK SYNC
  // =====================================================

  async syncAllData(data: {
    tasks?: Task[];
    reminders?: Reminder[];
    routine?: RoutineItem[];
    routineItems?: RoutineItem[];
    memories?: MemoryItem[];
    contacts?: Contact[];
    callHistory?: CallRecord[];
    callMessages?: CallMessage[];
    socialDrafts?: SocialDraft[];
    chatHistory?: ChatMessage[];
    chatMessages?: ChatMessage[];
  }) {
    if (!this.client) {
      this.init();
    }
    if (!this.client) {
      return {
        success: false,
        totalSynced: 0,
        failed: 0,
      };
    }

    let totalSynced = 0;
    let failed = 0;

    for (const item of data.tasks ?? []) {
      if (await this.syncTask(item)) {
        totalSynced++;
      } else {
        failed++;
      }
    }

    for (const item of data.reminders ?? []) {
      if (await this.syncReminder(item)) {
        totalSynced++;
      } else {
        failed++;
      }
    }

    for (const item of (data.routineItems ?? data.routine ?? [])) {
      if (await this.syncRoutineItem(item)) {
        totalSynced++;
      } else {
        failed++;
      }
    }

    for (const item of data.memories ?? []) {
      if (await this.syncMemory(item)) {
        totalSynced++;
      } else {
        failed++;
      }
    }

    for (const item of data.contacts ?? []) {
      if (await this.syncContact(item)) {
        totalSynced++;
      } else {
        failed++;
      }
    }

    for (const item of data.callHistory ?? []) {
      if (await this.syncCallRecord(item)) {
        totalSynced++;
      } else {
        failed++;
      }
    }

    for (const item of data.callMessages ?? []) {
      if (await this.syncCallMessage(item)) {
        totalSynced++;
      } else {
        failed++;
      }
    }

    for (const item of data.socialDrafts ?? []) {
      if (await this.syncSocialDraft(item)) {
        totalSynced++;
      } else {
        failed++;
      }
    }

    for (const item of (data.chatMessages ?? data.chatHistory ?? [])) {
      if (await this.syncChatMessage(item)) {
        totalSynced++;
      } else {
        failed++;
      }
    }

    return {
      success: failed === 0,
      totalSynced,
      failed,
    };
  }

  // =====================================================
  // HYDRATE
  // =====================================================

  async hydrateFromSupabase() {
    if (!this.client) {
      this.init();
    }
    if (!this.client) {
      return {
        tasks: [],
        reminders: [],
        routineItems: [],
        memories: [],
        contacts: [],
        callHistory: [],
        callMessages: [],
        socialDrafts: [],
        chatHistory: [],
      };
    }

    const [
      tasks,
      reminders,
      routineItems,
      memories,
      contacts,
      callHistory,
      callMessages,
      socialDrafts,
      chatHistory,
    ] = await Promise.all([
      this.getTasks(),
      this.getReminders(),
      this.getRoutineItems(),
      this.getMemories(),
      this.getContacts(),
      this.getCallHistory(),
      this.getCallMessages(),
      this.getSocialDrafts(),
      this.getChatHistory(),
    ]);

    return {
      tasks,
      reminders,
      routineItems,
      memories,
      contacts,
      callHistory,
      callMessages,
      socialDrafts,
      chatHistory,
    };
  }
}

// =====================================================
// SINGLETON
// =====================================================

export const supabaseService =
  new SupabaseService();

export default supabaseService;