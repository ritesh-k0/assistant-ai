import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import {
  Task,
  Reminder,
  RoutineItem,
  MemoryItem,
  ImportantContact,
  CallRecord,
  CallMessage,
  SocialDraft,
  ChatMessage,
} from '../types';
import {
  DEFAULT_SUPABASE_PROJECT_ID,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_PUBLISHABLE_KEY,
} from './db';

export {
  DEFAULT_SUPABASE_PROJECT_ID,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_PUBLISHABLE_KEY,
};

const DEFAULT_USER_EMAIL = 'riteshkumarrai313@gmail.com';

class SupabaseService {
  private client: SupabaseClient | null = null;
  private currentUrl: string = DEFAULT_SUPABASE_URL;
  private currentKey: string = DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  constructor() {
    this.init(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_PUBLISHABLE_KEY);
    this.initFromStoredConfig();
  }

  public init(url: string, key: string): boolean {
    const finalUrl = (url || DEFAULT_SUPABASE_URL).trim();
    const finalKey = (key || DEFAULT_SUPABASE_PUBLISHABLE_KEY).trim();

    try {
      this.client = createClient(finalUrl, finalKey);
      this.currentUrl = finalUrl;
      this.currentKey = finalKey;
      return true;
    } catch (err) {
      console.warn('Failed to init Supabase client:', err);
      this.client = null;
      return false;
    }
  }

  public initFromStoredConfig() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('ritesh_assistant_settings_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        const url = parsed.supabaseConfig?.url || DEFAULT_SUPABASE_URL;
        const key = parsed.supabaseConfig?.anonKey || DEFAULT_SUPABASE_PUBLISHABLE_KEY;
        this.init(url, key);
      } else {
        this.init(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_PUBLISHABLE_KEY);
      }
    } catch {
      this.init(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_PUBLISHABLE_KEY);
    }
  }

  public getUrl(): string {
    return this.currentUrl;
  }

  public getKey(): string {
    return this.currentKey;
  }

  public isConfigured(): boolean {
    return !!this.client && !!this.currentUrl;
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }

  // ==========================================
  // AUTHENTICATION SYSTEM INTEGRATION
  // ==========================================
  public async getAuthUser(): Promise<User | null> {
    if (!this.client) return null;
    try {
      const { data } = await this.client.auth.getUser();
      return data?.user || null;
    } catch {
      return null;
    }
  }

  public async getAuthSession(): Promise<Session | null> {
    if (!this.client) return null;
    try {
      const { data } = await this.client.auth.getSession();
      return data?.session || null;
    } catch {
      return null;
    }
  }

  public async signInWithPassword(email: string, password: string) {
    if (!this.client) throw new Error('Supabase client is not initialized.');
    return await this.client.auth.signInWithPassword({ email: email.trim(), password });
  }

  public async signUpWithPassword(email: string, password: string, fullName: string = 'Ritesh Kumar') {
    if (!this.client) throw new Error('Supabase client is not initialized.');
    return await this.client.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
  }

  public async signOut() {
    if (!this.client) return;
    return await this.client.auth.signOut();
  }

  public onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    if (!this.client) return { data: { subscription: { unsubscribe: () => {} } } };
    return this.client.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }

  private async getActiveUserId(): Promise<string | undefined> {
    const user = await this.getAuthUser();
    return user?.id;
  }

  /**
   * Tests Supabase connectivity and API key validity against the project gateway.
   */
  public async testConnection(
    url?: string,
    key?: string
  ): Promise<{ success: boolean; message: string; code?: string }> {
    const targetUrl = (url || this.currentUrl || DEFAULT_SUPABASE_URL).trim();
    const targetKey = (key || this.currentKey || DEFAULT_SUPABASE_PUBLISHABLE_KEY).trim();

    if (!targetUrl) {
      return {
        success: false,
        message: 'Supabase Project URL is required.',
      };
    }
    if (!targetKey) {
      return {
        success: false,
        message: 'Supabase Publishable Key is required.',
      };
    }

    try {
      const response = await fetch(`${targetUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          apikey: targetKey,
          Authorization: `Bearer ${targetKey}`,
        },
      });

      if (response.status === 401) {
        const errJson = await response.json().catch(() => ({}));
        return {
          success: false,
          code: 'UNAUTHORIZED_INVALID_API_KEY',
          message:
            errJson.message ||
            `Invalid API key. Double check the publishable key or verify it was generated for project ${DEFAULT_SUPABASE_PROJECT_ID} in Project Settings > API.`,
        };
      }

      this.init(targetUrl, targetKey);
      return {
        success: true,
        message: `Successfully connected to Supabase project (${DEFAULT_SUPABASE_PROJECT_ID})!`,
      };
    } catch {
      try {
        const tempClient = createClient(targetUrl, targetKey);
        const { error } = await tempClient.from('tasks').select('id').limit(1);
        if (error) {
          if (error.message.includes('Invalid API key')) {
            return {
              success: false,
              code: 'UNAUTHORIZED_INVALID_API_KEY',
              message:
                `Invalid API key: Double check for typos or ensure key was created for project ${DEFAULT_SUPABASE_PROJECT_ID}.`,
            };
          }
          if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
            this.init(targetUrl, targetKey);
            return {
              success: true,
              message:
                'Connected to Supabase! Tables need to be initialized via the SQL Schema script.',
            };
          }
          return { success: false, message: error.message };
        }
        this.init(targetUrl, targetKey);
        return { success: true, message: 'Successfully verified Supabase connection!' };
      } catch (sdkErr: any) {
        return {
          success: false,
          message: sdkErr.message || 'Network error connecting to Supabase.',
        };
      }
    }
  }

  // ==========================================
  // 1. TASKS
  // ==========================================
  public async getTasks(): Promise<Task[] | null> {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return null;
      return (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description || undefined,
        category: row.category,
        status: row.status,
        date: row.date,
        time: row.time || undefined,
        priority: row.priority,
        recurring: row.recurring || 'none',
        createdAt: row.created_at,
        completedAt: row.status === 'completed' ? row.updated_at : undefined,
      }));
    } catch {
      return null;
    }
  }

  public async syncTask(task: Task) {
    if (!this.client) return;
    try {
      const userId = await this.getActiveUserId();
      const payload: any = {
        id: task.id,
        title: task.title,
        description: task.description || null,
        category: task.category,
        status: task.status,
        date: task.date,
        time: task.time || null,
        priority: task.priority,
        recurring: task.recurring || 'none',
        user_email: DEFAULT_USER_EMAIL,
        created_at: task.createdAt,
        updated_at: new Date().toISOString(),
      };
      if (userId) {
        payload.user_id = userId;
      }
      await this.client.from('tasks').upsert(payload);
    } catch (e) {
      console.warn('Supabase syncTask error:', e);
    }
  }

  public async deleteTask(id: string) {
    if (!this.client) return;
    try {
      await this.client.from('tasks').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteTask error:', e);
    }
  }

  // ==========================================
  // 2. REMINDERS
  // ==========================================
  public async getReminders(): Promise<Reminder[] | null> {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('reminders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return null;
      return (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        date: row.date,
        time: row.time,
        type: row.type,
        category: row.category,
        isCompleted: row.is_completed,
        createdAt: row.created_at,
      }));
    } catch {
      return null;
    }
  }

  public async syncReminder(reminder: Reminder) {
    if (!this.client) return;
    try {
      const userId = await this.getActiveUserId();
      const payload: any = {
        id: reminder.id,
        title: reminder.title,
        date: reminder.date,
        time: reminder.time,
        type: reminder.type,
        category: reminder.category,
        is_completed: reminder.isCompleted,
        user_email: DEFAULT_USER_EMAIL,
        created_at: reminder.createdAt,
        updated_at: new Date().toISOString(),
      };
      if (userId) {
        payload.user_id = userId;
      }
      await this.client.from('reminders').upsert(payload);
    } catch (e) {
      console.warn('Supabase syncReminder error:', e);
    }
  }

  public async deleteReminder(id: string) {
    if (!this.client) return;
    try {
      await this.client.from('reminders').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteReminder error:', e);
    }
  }

  // ==========================================
  // 3. DAILY ROUTINE
  // ==========================================
  public async getRoutineItems(): Promise<RoutineItem[] | null> {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('routine_items')
        .select('*')
        .order('start_time', { ascending: true });
      if (error) return null;
      return (data || []).map((row: any) => ({
        id: row.id,
        period: row.period,
        title: row.title,
        startTime: row.start_time,
        endTime: row.end_time,
        days: row.days || ['Daily'],
        category: row.category,
        enabled: row.enabled,
        isCompletedToday: row.is_completed_today || false,
      }));
    } catch {
      return null;
    }
  }

  public async syncRoutineItem(item: RoutineItem) {
    if (!this.client) return;
    try {
      const userId = await this.getActiveUserId();
      const payload: any = {
        id: item.id,
        period: item.period,
        title: item.title,
        start_time: item.startTime,
        end_time: item.endTime,
        days: item.days,
        category: item.category,
        enabled: item.enabled,
        is_completed_today: item.isCompletedToday || false,
        user_email: DEFAULT_USER_EMAIL,
        updated_at: new Date().toISOString(),
      };
      if (userId) {
        payload.user_id = userId;
      }
      await this.client.from('routine_items').upsert(payload);
    } catch (e) {
      console.warn('Supabase syncRoutineItem error:', e);
    }
  }

  // ==========================================
  // 4. PERSONAL MEMORIES
  // ==========================================
  public async getMemories(): Promise<MemoryItem[] | null> {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return null;
      return (data || []).map((row: any) => ({
        id: row.id,
        content: row.content,
        category: row.category,
        importance: row.importance,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch {
      return null;
    }
  }

  public async syncMemory(memory: MemoryItem) {
    if (!this.client) return;
    try {
      const userId = await this.getActiveUserId();
      const payload: any = {
        id: memory.id,
        content: memory.content,
        category: memory.category,
        importance: memory.importance,
        user_email: DEFAULT_USER_EMAIL,
        created_at: memory.createdAt,
        updated_at: new Date().toISOString(),
      };
      if (userId) {
        payload.user_id = userId;
      }
      await this.client.from('memories').upsert(payload);
    } catch (e) {
      console.warn('Supabase syncMemory error:', e);
    }
  }

  public async deleteMemory(id: string) {
    if (!this.client) return;
    try {
      await this.client.from('memories').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteMemory error:', e);
    }
  }

  // ==========================================
  // 5. CONTACTS (Including Papa Rule)
  // ==========================================
  public async getContacts(): Promise<ImportantContact[] | null> {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client.from('contacts').select('*');
      if (error) return null;
      return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        relation: row.relation,
        phoneNumber: row.phone_number,
        priority: row.priority,
        incomingAction: row.incoming_action,
        unansweredAction: row.unanswered_action,
        forwardingNumber: row.forwarding_number || undefined,
        isSpecialRule: row.is_special_rule,
      }));
    } catch {
      return null;
    }
  }

  public async syncContact(contact: ImportantContact) {
    if (!this.client) return;
    try {
      const userId = await this.getActiveUserId();
      const payload: any = {
        id: contact.id,
        name: contact.name,
        relation: contact.relation,
        phone_number: contact.phoneNumber,
        priority: contact.priority,
        incoming_action: contact.incomingAction,
        unanswered_action: contact.unansweredAction,
        forwarding_number: contact.forwardingNumber || null,
        is_special_rule: contact.isSpecialRule || false,
        user_email: DEFAULT_USER_EMAIL,
        updated_at: new Date().toISOString(),
      };
      if (userId) {
        payload.user_id = userId;
      }
      await this.client.from('contacts').upsert(payload);
    } catch (e) {
      console.warn('Supabase syncContact error:', e);
    }
  }

  public async deleteContact(id: string) {
    if (!this.client) return;
    try {
      await this.client.from('contacts').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteContact error:', e);
    }
  }

  // ==========================================
  // 6. CALL HISTORY
  // ==========================================
  public async getCallHistory(): Promise<CallRecord[] | null> {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('call_history')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return null;
      return (data || []).map((row: any) => ({
        id: row.id,
        contactName: row.contact_name,
        phoneNumber: row.phone_number,
        timestamp: row.timestamp,
        type: row.type,
        status: row.status,
        durationSeconds: row.duration_seconds,
        messageReceived: row.message_received || undefined,
        notes: row.notes || undefined,
      }));
    } catch {
      return null;
    }
  }

  public async syncCallRecord(rec: CallRecord) {
    if (!this.client) return;
    try {
      const userId = await this.getActiveUserId();
      const payload: any = {
        id: rec.id,
        contact_name: rec.contactName,
        phone_number: rec.phoneNumber,
        timestamp: rec.timestamp,
        type: rec.type,
        status: rec.status,
        duration_seconds: rec.durationSeconds,
        message_received: rec.messageReceived || null,
        notes: rec.notes || null,
        user_email: DEFAULT_USER_EMAIL,
        created_at: new Date().toISOString(),
      };
      if (userId) {
        payload.user_id = userId;
      }
      await this.client.from('call_history').upsert(payload);
    } catch (e) {
      console.warn('Supabase syncCallRecord error:', e);
    }
  }

  // ==========================================
  // 7. CALL MESSAGES (Voicemails & Lakshmi responses)
  // ==========================================
  public async getCallMessages(): Promise<CallMessage[] | null> {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('call_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return null;
      return (data || []).map((row: any) => ({
        id: row.id,
        callerName: row.caller_name,
        phoneNumber: row.phone_number,
        timestamp: row.timestamp,
        message: row.message,
        status: row.status,
        languageDetected: row.language_detected,
      }));
    } catch {
      return null;
    }
  }

  public async syncCallMessage(msg: CallMessage) {
    if (!this.client) return;
    try {
      const userId = await this.getActiveUserId();
      const payload: any = {
        id: msg.id,
        caller_name: msg.callerName,
        phone_number: msg.phoneNumber,
        timestamp: msg.timestamp,
        message: msg.message,
        status: msg.status,
        language_detected: msg.languageDetected || 'Hindi / Hinglish',
        user_email: DEFAULT_USER_EMAIL,
        created_at: new Date().toISOString(),
      };
      if (userId) {
        payload.user_id = userId;
      }
      await this.client.from('call_messages').upsert(payload);
    } catch (e) {
      console.warn('Supabase syncCallMessage error:', e);
    }
  }

  // ==========================================
  // 8. SOCIAL MEDIA DRAFTS
  // ==========================================
  public async getSocialDrafts(): Promise<SocialDraft[] | null> {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('social_drafts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return null;
      return (data || []).map((row: any) => ({
        id: row.id,
        platform: row.platform,
        topic: row.topic,
        content: row.content,
        caption: row.caption || undefined,
        hashtags: row.hashtags || [],
        status: row.status,
        createdAt: row.created_at,
        publishedAt: row.published_at || undefined,
      }));
    } catch {
      return null;
    }
  }

  public async syncSocialDraft(draft: SocialDraft) {
    if (!this.client) return;
    try {
      const userId = await this.getActiveUserId();
      const payload: any = {
        id: draft.id,
        platform: draft.platform,
        topic: draft.topic,
        content: draft.content,
        caption: draft.caption || null,
        hashtags: draft.hashtags,
        status: draft.status,
        published_at: draft.publishedAt || null,
        user_email: DEFAULT_USER_EMAIL,
        created_at: draft.createdAt,
        updated_at: new Date().toISOString(),
      };
      if (userId) {
        payload.user_id = userId;
      }
      await this.client.from('social_drafts').upsert(payload);
    } catch (e) {
      console.warn('Supabase syncSocialDraft error:', e);
    }
  }

  public async deleteSocialDraft(id: string) {
    if (!this.client) return;
    try {
      await this.client.from('social_drafts').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteSocialDraft error:', e);
    }
  }

  // ==========================================
  // 9. CHAT HISTORY (Lakshmi Conversations)
  // ==========================================
  public async getChatHistory(): Promise<ChatMessage[] | null> {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);
      if (error) return null;
      return (data || []).map((row: any) => ({
        id: row.id,
        sender: row.sender,
        text: row.text,
        actionTaken: row.action_taken || undefined,
        timestamp: row.timestamp,
      }));
    } catch {
      return null;
    }
  }

  public async syncChatMessage(msg: ChatMessage) {
    if (!this.client) return;
    try {
      const userId = await this.getActiveUserId();
      const payload: any = {
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        action_taken: msg.actionTaken || null,
        timestamp: msg.timestamp,
        user_email: DEFAULT_USER_EMAIL,
        created_at: new Date().toISOString(),
      };
      if (userId) {
        payload.user_id = userId;
      }
      await this.client.from('chat_history').upsert(payload);
    } catch (e) {
      console.warn('Supabase syncChatMessage error:', e);
    }
  }

  // ==========================================
  // BULK SYNCHRONIZATION
  // ==========================================
  public async syncAllData(data: {
    tasks: Task[];
    reminders: Reminder[];
    routine: RoutineItem[];
    memories: MemoryItem[];
    contacts: ImportantContact[];
    callHistory: CallRecord[];
    callMessages: CallMessage[];
    socialDrafts: SocialDraft[];
    chatMessages: ChatMessage[];
  }): Promise<{ success: boolean; count: number; error?: string }> {
    if (!this.client) {
      return { success: false, count: 0, error: 'Supabase client is not connected.' };
    }

    try {
      let totalSynced = 0;

      for (const t of data.tasks) {
        await this.syncTask(t);
        totalSynced++;
      }
      for (const r of data.reminders) {
        await this.syncReminder(r);
        totalSynced++;
      }
      for (const ro of data.routine) {
        await this.syncRoutineItem(ro);
        totalSynced++;
      }
      for (const m of data.memories) {
        await this.syncMemory(m);
        totalSynced++;
      }
      for (const c of data.contacts) {
        await this.syncContact(c);
        totalSynced++;
      }
      for (const ch of data.callHistory) {
        await this.syncCallRecord(ch);
        totalSynced++;
      }
      for (const cm of data.callMessages) {
        await this.syncCallMessage(cm);
        totalSynced++;
      }
      for (const sd of data.socialDrafts) {
        await this.syncSocialDraft(sd);
        totalSynced++;
      }
      for (const msg of data.chatMessages.slice(-25)) {
        await this.syncChatMessage(msg);
        totalSynced++;
      }

      return { success: true, count: totalSynced };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message };
    }
  }

  // ==========================================
  // HYDRATE APPLICATION STATE ON STARTUP
  // ==========================================
  public async hydrateFromSupabase(): Promise<{
    tasks?: Task[];
    reminders?: Reminder[];
    routine?: RoutineItem[];
    memories?: MemoryItem[];
    contacts?: ImportantContact[];
    callHistory?: CallRecord[];
    callMessages?: CallMessage[];
    socialDrafts?: SocialDraft[];
    chatMessages?: ChatMessage[];
  } | null> {
    if (!this.client) return null;

    try {
      const [
        tasks,
        reminders,
        routine,
        memories,
        contacts,
        callHistory,
        callMessages,
        socialDrafts,
        chatMessages,
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
        tasks: tasks || undefined,
        reminders: reminders || undefined,
        routine: routine || undefined,
        memories: memories || undefined,
        contacts: contacts || undefined,
        callHistory: callHistory || undefined,
        callMessages: callMessages || undefined,
        socialDrafts: socialDrafts || undefined,
        chatMessages: chatMessages || undefined,
      };
    } catch (e) {
      console.warn('Error hydrating from Supabase:', e);
      return null;
    }
  }
}

export const supabaseService = new SupabaseService();
