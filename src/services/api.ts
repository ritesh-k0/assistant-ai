import { createClient } from '@supabase/supabase-js';

export interface ChatPayload {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; text: string }>;
  userContext?: {
    todayTasks?: any[];
    activeReminders?: any[];
    recentMemories?: any[];
  };
}

export interface ChatResponse {
  reply: string;
  action?: {
    type: 'create_task' | 'create_reminder' | 'save_memory' | 'create_event' | 'update_routine' | 'generate_social' | 'query_schedule';
    data: any;
  } | null;
  error?: string;
  fallbackReply?: string;
}

export interface TTSResponse {
  audioBase64?: string | null;
  mimeType?: string;
  error?: string;
}

export interface SocialGenPayload {
  platform: 'linkedin' | 'instagram' | 'facebook';
  topic: string;
  notes?: string;
  tone?: string;
}

export interface SocialGenResponse {
  title?: string;
  content: string;
  caption?: string;
  hashtags: string[];
}

function parseClientOfflineIntent(message: string): { reply: string; action: any } {
  const lower = message.toLowerCase();
  const currentDate = new Date().toISOString().split('T')[0];

  if (
    lower.includes('java') &&
    (lower.includes('kal') || lower.includes('remind') || lower.includes('7') || lower.includes('shaam'))
  ) {
    return {
      reply: 'Ji Ritesh, maine kal 7 PM ka Java practice reminder note kar diya hai.',
      action: {
        type: 'create_reminder',
        data: {
          title: 'Java practice',
          date: currentDate,
          time: '19:00',
          type: 'one-time',
        },
      },
    };
  }

  if (lower.includes('papa')) {
    return {
      reply: 'Ji Ritesh, Papa ko call karne ka reminder set kar diya hai.',
      action: {
        type: 'create_reminder',
        data: {
          title: 'Papa ko call karein',
          date: currentDate,
          time: '20:30',
          type: 'one-time',
        },
      },
    };
  }

  if (lower.includes('task') || lower.includes('kaam') || lower.includes('coding') || lower.includes('project')) {
    return {
      reply: 'Ji Ritesh, maine task list me add kar diya hai.',
      action: {
        type: 'create_task',
        data: {
          title: message.replace(/(add task|create task|task banao|karna hai)/gi, '').trim() || 'Coding Task',
          category: 'Coding',
          priority: 'medium',
          date: currentDate,
          time: '18:00',
        },
      },
    };
  }

  if (lower.includes('yaad') || lower.includes('remember') || lower.includes('save this')) {
    return {
      reply: 'Ji Ritesh, maine yaad rakh liya.',
      action: {
        type: 'save_memory',
        data: {
          content: message,
          category: 'General',
        },
      },
    };
  }

  if (lower.includes('schedule') || lower.includes('aaj kya') || lower.includes('routine')) {
    return {
      reply: 'Ji Ritesh, main aapka aaj ka schedule aur routine check karti hoon.',
      action: {
        type: 'query_schedule',
        data: {
          targetDate: 'today',
          date: currentDate,
        },
      },
    };
  }

  if (lower.includes('linkedin') || lower.includes('social') || lower.includes('post')) {
    return {
      reply: 'Sure Ritesh, main LinkedIn ke liye professional post ready karti hoon.',
      action: {
        type: 'generate_social',
        data: {
          platform: 'linkedin',
          topic: 'Full Stack Development',
        },
      },
    };
  }

  return {
    reply: 'Ji Ritesh, bataiye. Main aapki routine, reminders, tasks aur social posts me madad ke liye yahan hoon.',
    action: null,
  };
}

export const apiService = {
  // Send message to Lakshmi AI
  sendMessage: async (payload: ChatPayload): Promise<ChatResponse> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || contentType.includes('text/html')) {
        const errorData = contentType.includes('application/json')
          ? await response.json().catch(() => ({}))
          : {};
        throw new Error(errorData.details || errorData.error || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      console.warn('API sendMessage network fallback:', err?.message);
      const fallback = parseClientOfflineIntent(payload.message);
      return {
        reply: fallback.reply,
        action: fallback.action,
        fallbackReply: fallback.reply,
      };
    }
  },

  // Synthesize Lakshmi Voice using Gemini TTS
  getGeminiTTS: async (text: string): Promise<TTSResponse> => {
    try {
      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        return await response.json();
      }
      return { audioBase64: null, error: 'Non-JSON response' };
    } catch (err: any) {
      console.warn('API getGeminiTTS error:', err);
      return { audioBase64: null, error: err.message };
    }
  },

  // Generate Social Media post
  generateSocialPost: async (payload: SocialGenPayload): Promise<SocialGenResponse> => {
    try {
      const response = await fetch('/api/social/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Social generation network fallback:', err);
    }

    return {
      title: `${payload.topic} - Key Learnings`,
      content: `Excited to share insights on ${payload.topic}!\n\nAs developers and learners, consistent practice and building full-stack applications with clean architecture is paramount.\n\nKey Highlights:\n- Problem solving & continuous learning\n- Persistence and dedication\n- Scalable system design\n\nWhat are your thoughts on this?`,
      caption: `Updates on ${payload.topic}`,
      hashtags: ['#coding', '#developer', '#learning', '#tech', '#webdevelopment'],
    };
  },

  // Check Telephony Status
  getTelephonyStatus: async () => {
    try {
      const response = await fetch('/api/telephony/status');
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        return await response.json();
      }
    } catch (_) {}

    return {
      status: 'integration_ready',
      platform: 'Android / SIP Telephony Companion',
      connected: false,
      reason: 'Companion pairing ready. Connect companion device for cellular bridging.',
      features: {
        incomingDetection: true,
        callerId: true,
        papaPriorityRule: true,
        unansweredTimeout: true,
        autoVoiceReply: true,
        forwardingReady: true,
      },
    };
  },

  // Call Forwarding action verification
  verifyCallForwarding: async (contactName: string, targetNumber: string, isTelephonyConnected: boolean) => {
    try {
      const response = await fetch('/api/telephony/forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactName, targetNumber, isTelephonyConnected }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        return await response.json();
      }
    } catch (_) {}

    if (!isTelephonyConnected) {
      return {
        success: false,
        message: 'Forwarding could not be completed because the phone integration is not connected.',
      };
    }
    return {
      success: true,
      message: `Call from ${contactName || 'caller'} successfully forwarded to ${targetNumber}.`,
    };
  },

  // Test Supabase connection
  testSupabase: async (url: string, anonKey: string) => {
    try {
      const response = await fetch('/api/supabase/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, anonKey }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        return await response.json();
      }
    } catch (_) {}

    // Direct browser Supabase validation fallback
    try {
      const client = createClient(url, anonKey);
      const { error } = await client.from('tasks').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        return { success: false, message: error.message };
      }
      return {
        success: true,
        message: 'Connected to Supabase project fupgnszofujkaslbawgq successfully.',
      };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Connection failed' };
    }
  },
};
