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

export const apiService = {
  // Send message to Lakshmi AI
  sendMessage: async (payload: ChatPayload): Promise<ChatResponse> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      console.error('API sendMessage error:', err);
      return {
        reply: 'Ji Ritesh, network me thodi samasya lag rahi hai. Lekin main yahan hoon, bataiye!',
        error: err.message,
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
      return await response.json();
    } catch (err: any) {
      console.warn('API getGeminiTTS error:', err);
      return { audioBase64: null, error: err.message };
    }
  },

  // Generate Social Media post
  generateSocialPost: async (payload: SocialGenPayload): Promise<SocialGenResponse> => {
    const response = await fetch('/api/social/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Social generation failed with status ${response.status}`);
    }

    return await response.json();
  },

  // Check Telephony Status
  getTelephonyStatus: async () => {
    const response = await fetch('/api/telephony/status');
    return await response.json();
  },

  // Call Forwarding action verification
  verifyCallForwarding: async (contactName: string, targetNumber: string, isTelephonyConnected: boolean) => {
    const response = await fetch('/api/telephony/forward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactName, targetNumber, isTelephonyConnected }),
    });
    return await response.json();
  },

  // Test Supabase connection
  testSupabase: async (url: string, anonKey: string) => {
    const response = await fetch('/api/supabase/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, anonKey }),
    });
    return await response.json();
  },
};
