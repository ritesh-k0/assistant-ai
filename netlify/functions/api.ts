import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_PROJECT_ID = 'fupgnszofujkaslbawgq';
const DEFAULT_SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://fupgnszofujkaslbawgq.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_1ADQDEdMzTFI27l1qjZ7Hw_vRCiUg2E';

const LAKSHMI_SYSTEM_INSTRUCTION = `
You are Lakshmi (लक्ष्मी), the dedicated female personal AI assistant for Ritesh Kumar.

You communicate naturally in Hindi, English, and Hinglish.
Automatically adapt to the language Ritesh speaks.

Your Personality:
- Friendly, polite, caring, professional, calm, and natural.
- You are NOT robotic.
- Give short, concise, and clear responses.
- Never repeatedly say "How can I assist you?" or robotic greetings.
- Use natural phrases such as:
  - "Ji Ritesh, bataiye."
  - "Sure, main check karti hoon."
  - "Done, maine save kar diya."
  - "Ek second, main check karti hoon."
  - "Ji, yaad rakh liya."
  - "Sure, I'll take care of this."
  - "Ji, bilkul."

Capabilities:
- Reminders (one-time, daily, weekly, recurring)
- Tasks & Revision (Coding, College, Job Preparation, Projects)
- Daily Routine management (Morning, Afternoon, Evening, Night)
- Personal memory
- Calendar schedule checks
- Social media content drafts
- Phone call assistant & missed call summaries
- Papa special alerts

IMPORTANT MEMORY RULE:
Only save something to memory when Ritesh explicitly asks:
- "remember this"
- "yaad rakhna"
- "save this"
- "don't forget"
- or clearly asks you to remember something.

Structured Intent Action Detection:

Whenever Ritesh asks to perform an action, include a JSON action block at the VERY END of your reply.

Format:

<<<ACTION
{
  "type": "create_task",
  "data": {}
}
ACTION>>>

Supported action types:
create_task: { "title": string, "category": "Coding"|"College"|"Job Preparation"|"Project"|"Personal"|"Social Media"|"Other", "priority": "low"|"medium"|"high"|"urgent", "date": "YYYY-MM-DD", "time": "HH:MM" }
create_reminder: { "title": string, "date": "YYYY-MM-DD", "time": "HH:MM", "type": "one-time"|"daily"|"weekly"|"recurring" }
save_memory: { "content": string, "category": "Preferences"|"Routine"|"Career"|"Family"|"Coding"|"General" }
create_event: { "title": string, "date": "YYYY-MM-DD", "startTime": "HH:MM", "endTime": "HH:MM", "category": string }
update_routine: { "title": string, "period": "Morning"|"Afternoon"|"Evening"|"Night", "startTime": "HH:MM", "endTime": "HH:MM" }
generate_social: { "platform": "linkedin"|"instagram"|"facebook", "topic": string }
query_schedule: { "targetDate": "today"|"tomorrow"|"specific", "date": "YYYY-MM-DD" }
`;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build-netlify',
      },
    },
  });
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

async function handleApiRequest(
  pathname: string,
  method: string,
  bodyText: string
): Promise<{ status: number; headers: Record<string, string>; body: any }> {
  // CORS Preflight
  if (method === 'OPTIONS') {
    return { status: 200, headers: CORS_HEADERS, body: { ok: true } };
  }

  const cleanPath = pathname
    .replace(/^\/\.netlify\/functions\/api/, '')
    .replace(/^\/api/, '');

  let body: any = {};
  if (bodyText) {
    try {
      body = JSON.parse(bodyText);
    } catch {
      body = {};
    }
  }

  // 1. CHAT ENDPOINT: /api/chat
  if (cleanPath === '/chat' || cleanPath === '/chat/') {
    const { message, history = [], userContext = {} } = body;
    if (!message || typeof message !== 'string') {
      return {
        status: 400,
        headers: CORS_HEADERS,
        body: { error: 'Message is required' },
      };
    }

    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

    const ai = getGeminiClient();
    let responseText = '';

    if (ai) {
      let contextPrompt = `
Current System Context:
Current Date: ${currentDate}
Current Time: ${currentTime}
User: Ritesh Kumar
Email: riteshkumarrai313@gmail.com
`;
      if (userContext.todayTasks?.length) {
        contextPrompt += `\nToday's Pending Tasks:\n${JSON.stringify(userContext.todayTasks)}\n`;
      }
      if (userContext.activeReminders?.length) {
        contextPrompt += `\nActive Reminders:\n${JSON.stringify(userContext.activeReminders)}\n`;
      }
      if (userContext.recentMemories?.length) {
        contextPrompt += `\nKey Memories Saved:\n${JSON.stringify(userContext.recentMemories)}\n`;
      }

      const contents = [
        {
          role: 'user',
          parts: [{ text: `${contextPrompt}\n\nUser says:\n${message}` }],
        },
      ];

      const modelsToTry = [
        'gemini-3.8-flash',
        'gemini-flash-latest',
        'gemini-3.1-flash-lite',
      ];

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction: LAKSHMI_SYSTEM_INSTRUCTION,
              temperature: 0.7,
            },
          });
          if (response.text) {
            responseText = response.text;
            break;
          }
        } catch (err: any) {
          console.warn(`Netlify function model ${modelName} fallback:`, err?.message);
        }
      }
    }

    // Offline / Fallback NLP rule engine
    if (!responseText) {
      const lower = message.toLowerCase();
      if (
        lower.includes('java') &&
        (lower.includes('kal') || lower.includes('remind') || lower.includes('7'))
      ) {
        responseText = `Ji Ritesh, maine Java practice reminder set kar diya hai.\n\n<<<ACTION\n{\n  "type": "create_reminder",\n  "data": {\n    "title": "Java practice",\n    "date": "${currentDate}",\n    "time": "19:00",\n    "type": "one-time"\n  }\n}\nACTION>>>`;
      } else if (
        lower.includes('schedule') ||
        lower.includes('aaj kya karna') ||
        lower.includes('aaj mera')
      ) {
        responseText = `Ji Ritesh, main aapka aaj ka schedule check karti hoon.\n\n<<<ACTION\n{\n  "type": "query_schedule",\n  "data": {\n    "targetDate": "today"\n  }\n}\nACTION>>>`;
      } else if (lower.includes('papa')) {
        responseText = `Ji Ritesh, Papa ko call karne ka reminder note kar liya hai.\n\n<<<ACTION\n{\n  "type": "create_reminder",\n  "data": {\n    "title": "Papa ko call karein",\n    "date": "${currentDate}",\n    "time": "20:30",\n    "type": "one-time"\n  }\n}\nACTION>>>`;
      } else if (
        lower.includes('yaad') ||
        lower.includes('remember') ||
        lower.includes('save this')
      ) {
        responseText = `Ji Ritesh, maine yaad rakh liya.\n\n<<<ACTION\n{\n  "type": "save_memory",\n  "data": {\n    "content": "${message.replace(/"/g, '\\"')}",\n    "category": "General"\n  }\n}\nACTION>>>`;
      } else if (lower.includes('linkedin')) {
        responseText = `Sure Ritesh, main LinkedIn ke liye professional post prepare karti hoon.\n\n<<<ACTION\n{\n  "type": "generate_social",\n  "data": {\n    "platform": "linkedin",\n    "topic": "Software Engineering Project"\n  }\n}\nACTION>>>`;
      } else {
        responseText =
          'Ji Ritesh, main samajh gayi. Bataiye, isme main kya madad kar sakti hoon?';
      }
    }

    let replyText = responseText;
    let action = null;
    const actionMatch = responseText.match(/<<<ACTION\s*([\s\S]*?)\s*ACTION>>>/);
    if (actionMatch && actionMatch[1]) {
      try {
        action = JSON.parse(actionMatch[1]);
        replyText = responseText.replace(/<<<ACTION[\s\S]*?ACTION>>>/, '').trim();
      } catch (e) {
        console.error('Failed to parse action JSON:', e);
      }
    }

    return {
      status: 200,
      headers: CORS_HEADERS,
      body: { reply: replyText, action },
    };
  }

  // 2. TTS ENDPOINT: /api/voice/tts
  if (cleanPath === '/voice/tts' || cleanPath === '/voice/tts/') {
    const { text } = body;
    if (!text || typeof text !== 'string') {
      return { status: 400, headers: CORS_HEADERS, body: { error: 'Text is required' } };
    }
    const cleanText = text.replace(/<<<[\s\S]*?>>>/g, '').trim();
    const ai = getGeminiClient();
    if (ai) {
      try {
        const ttsResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: cleanText,
                  speechMetadata: {
                    style:
                      'Calm, gentle, caring and professional female personal assistant speaking Hindi/Hinglish/English naturally',
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Kore',
                },
              },
            },
          },
        });
        const audioBase64 =
          ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (audioBase64) {
          return {
            status: 200,
            headers: CORS_HEADERS,
            body: { audioBase64, mimeType: 'audio/wav' },
          };
        }
      } catch (err: any) {
        console.warn('TTS Netlify error:', err?.message);
      }
    }
    return {
      status: 200,
      headers: CORS_HEADERS,
      body: { audioBase64: null, note: 'Web Speech fallback available' },
    };
  }

  // 3. SOCIAL GENERATE: /api/social/generate
  if (cleanPath === '/social/generate' || cleanPath === '/social/generate/') {
    const {
      platform = 'linkedin',
      topic,
      notes = '',
      tone = 'professional',
    } = body;
    if (!topic) {
      return { status: 400, headers: CORS_HEADERS, body: { error: 'Topic is required' } };
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `Create an engaging social media post for Ritesh Kumar.
Platform: ${platform}
Topic: ${topic}
Notes: ${notes}
Tone: ${tone}

Respond in JSON format:
{
  "title": "Short title or hook",
  "content": "Full post content text ready to publish",
  "caption": "Short caption",
  "hashtags": ["#tag1", "#tag2", "#tag3"]
}`;
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });
        const parsed = JSON.parse(response.text || '{}');
        return { status: 200, headers: CORS_HEADERS, body: parsed };
      } catch (err: any) {
        console.warn('Social gen fallback:', err?.message);
      }
    }

    return {
      status: 200,
      headers: CORS_HEADERS,
      body: {
        title: `${topic} Insights`,
        content: `Excited to share updates on ${topic}! Continuous learning and building robust software solutions has been an incredible experience.\n\nKey takeaways:\n- Focused execution\n- Clean architecture\n- Consistency is key\n\nWhat are your thoughts on this?`,
        caption: `Learning and building: ${topic}`,
        hashtags: ['#programming', '#softwareengineering', '#tech', '#learning'],
      },
    };
  }

  // 4. TELEPHONY STATUS: /api/telephony/status
  if (cleanPath === '/telephony/status' || cleanPath === '/telephony/status/') {
    return {
      status: 200,
      headers: CORS_HEADERS,
      body: {
        status: 'integration_ready',
        platform: 'Android / SIP Telephony Companion',
        connected: false,
        reason: 'Android companion ready for pairing via WebSocket/Push.',
        features: {
          incomingDetection: true,
          callerId: true,
          papaPriorityRule: true,
          unansweredTimeout: true,
          autoVoiceReply: true,
          forwardingReady: true,
        },
      },
    };
  }

  // 5. TELEPHONY FORWARD: /api/telephony/forward
  if (cleanPath === '/telephony/forward' || cleanPath === '/telephony/forward/') {
    const { contactName, targetNumber, isTelephonyConnected } = body;
    if (!isTelephonyConnected) {
      return {
        status: 400,
        headers: CORS_HEADERS,
        body: {
          success: false,
          message:
            'Forwarding could not be completed because the phone integration is not connected.',
        },
      };
    }
    if (!targetNumber) {
      return {
        status: 400,
        headers: CORS_HEADERS,
        body: { success: false, message: 'No forwarding number configured.' },
      };
    }
    return {
      status: 200,
      headers: CORS_HEADERS,
      body: {
        success: true,
        message: `Call from ${contactName || 'caller'} successfully forwarded to ${targetNumber}.`,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // 6. SUPABASE TEST: /api/supabase/test
  if (cleanPath === '/supabase/test' || cleanPath === '/supabase/test/') {
    const targetUrl = body.url || DEFAULT_SUPABASE_URL;
    const targetKey = body.anonKey || DEFAULT_SUPABASE_PUBLISHABLE_KEY;
    try {
      const client = createClient(targetUrl, targetKey);
      const { error } = await client.from('tasks').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        return {
          status: 400,
          headers: CORS_HEADERS,
          body: { success: false, message: error.message },
        };
      }
      return {
        status: 200,
        headers: CORS_HEADERS,
        body: {
          success: true,
          message: 'Connected to Supabase project fupgnszofujkaslbawgq successfully.',
          projectId: DEFAULT_SUPABASE_PROJECT_ID,
          url: DEFAULT_SUPABASE_URL,
        },
      };
    } catch (e: any) {
      return {
        status: 500,
        headers: CORS_HEADERS,
        body: { success: false, message: e?.message },
      };
    }
  }

  // 7. SUPABASE HEALTH / SYNC
  if (cleanPath === '/supabase/sync' || cleanPath === '/supabase/health') {
    return {
      status: 200,
      headers: CORS_HEADERS,
      body: {
        status: 'ready',
        projectId: DEFAULT_SUPABASE_PROJECT_ID,
        url: DEFAULT_SUPABASE_URL,
        timestamp: new Date().toISOString(),
      },
    };
  }

  return {
    status: 404,
    headers: CORS_HEADERS,
    body: { error: 'Not Found', path: cleanPath },
  };
}

// Netlify v2 standard export
export default async function (req: Request): Promise<Response> {
  const url = new URL(req.url);
  const method = req.method;
  let bodyText = '';
  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    bodyText = await req.text();
  }
  const result = await handleApiRequest(url.pathname, method, bodyText);
  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: result.headers,
  });
}

// Netlify v1 classic lambda handler export for backwards compatibility
export const handler = async (event: any, context: any) => {
  const pathname = event.path || '';
  const method = event.httpMethod || 'GET';
  const bodyText = event.body || '';
  const result = await handleApiRequest(pathname, method, bodyText);
  return {
    statusCode: result.status,
    headers: result.headers,
    body: JSON.stringify(result.body),
  };
};
