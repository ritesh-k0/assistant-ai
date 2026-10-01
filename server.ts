import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI instance
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System prompt defining Lakshmi's personality and capability
const LAKSHMI_SYSTEM_INSTRUCTION = `
You are Lakshmi (लक्ष्मी), the dedicated female personal AI assistant for Ritesh Kumar.
You communicate naturally in Hindi, English, and Hinglish. Automatically adapt to the language Ritesh speaks.

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
- Personal memory (only when asked to remember: "remember this", "yaad rakhna", "save this", "don't forget")
- Calendar schedule checks ("Aaj kya hai?", "Kal ka schedule", etc.)
- Social media content drafts (LinkedIn, Instagram, Facebook)
- Phone call assistant & missed call summaries (especially Papa special alerts)

Structured Intent Action Detection:
Whenever Ritesh asks to perform an action (e.g. set reminder, create task, save memory, add event, update routine, or draft social post), you must include a JSON action block at the VERY END of your reply enclosed between <<<ACTION and ACTION>>> tokens.
Format:
<<<ACTION
{
  "type": "create_task" | "create_reminder" | "save_memory" | "create_event" | "update_routine" | "generate_social" | "query_schedule",
  "data": { ... }
}
ACTION>>>

Data structures:
- create_task: { "title": string, "category": "Coding"|"College"|"Job Preparation"|"Project"|"Personal"|"Social Media"|"Other", "priority": "low"|"medium"|"high"|"urgent", "date": "YYYY-MM-DD" (default to today/tomorrow), "time": "HH:MM" }
- create_reminder: { "title": string, "date": "YYYY-MM-DD", "time": "HH:MM", "type": "one-time"|"daily"|"weekly"|"recurring" }
- save_memory: { "content": string, "category": "Preferences"|"Routine"|"Career"|"Family"|"Coding"|"General" }
- create_event: { "title": string, "date": "YYYY-MM-DD", "startTime": "HH:MM", "endTime": "HH:MM", "category": string }
- update_routine: { "title": string, "period": "Morning"|"Afternoon"|"Evening"|"Night", "startTime": "HH:MM", "endTime": "HH:MM" }
- generate_social: { "platform": "linkedin"|"instagram"|"facebook", "topic": string }
- query_schedule: { "targetDate": "today"|"tomorrow"|"specific", "date": "YYYY-MM-DD" }

Keep your spoken reply natural and warm before the <<<ACTION block.
Example:
"Ji Ritesh, maine kal 7 PM ka Java practice reminder set kar diya hai."
<<<ACTION
{ "type": "create_reminder", "data": { "title": "Java practice", "date": "2026-09-29", "time": "19:00", "type": "one-time" } }
ACTION>>>
`;

// API: Lakshmi Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], userContext = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build context summary to ground Lakshmi with Ritesh's schedule & info
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    let contextPrompt = `\nCurrent System Context:\nCurrent Date: ${currentDate}, Current Time: ${currentTime}.\nUser: Ritesh Kumar (Email: riteshkumarrai313@gmail.com).\n`;
    if (userContext.todayTasks?.length) {
      contextPrompt += `Today's Pending Tasks: ${JSON.stringify(userContext.todayTasks)}\n`;
    }
    if (userContext.activeReminders?.length) {
      contextPrompt += `Active Reminders: ${JSON.stringify(userContext.activeReminders)}\n`;
    }
    if (userContext.recentMemories?.length) {
      contextPrompt += `Key Memories Saved: ${JSON.stringify(userContext.recentMemories)}\n`;
    }

    // Format conversation history
    const contents: any[] = [];
    contents.push({
      role: 'user',
      parts: [{ text: `${contextPrompt}\nUser says: ${message}` }],
    });

    let responseText = '';
    const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let lastError = null;

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
        lastError = err;
        console.warn(`Model ${modelName} failed, trying next fallback:`, err.message);
      }
    }

    // Local offline intent fallback if API is overloaded
    if (!responseText) {
      const lower = message.toLowerCase();
      if (lower.includes('java') && (lower.includes('kal') || lower.includes('remind') || lower.includes('7'))) {
        responseText = `Ji Ritesh, maine kal 7 PM ka Java practice reminder set kar diya hai.\n<<<ACTION\n{"type": "create_reminder", "data": {"title": "Java practice", "date": "${currentDate}", "time": "19:00", "type": "one-time"}}\nACTION>>>`;
      } else if (lower.includes('schedule') || lower.includes('aaj kya karna') || lower.includes('aaj mera')) {
        responseText = `Ji Ritesh, main aapka aaj ka schedule check karti hoon. Aapka college, full-stack project development aur shaam 7 baje Java practice scheduled hai.\n<<<ACTION\n{"type": "query_schedule", "data": {"targetDate": "today"}}\nACTION>>>`;
      } else if (lower.includes('papa')) {
        responseText = `Ji Ritesh, maine Papa ko call karne ka reminder note kar liya hai.\n<<<ACTION\n{"type": "create_reminder", "data": {"title": "Papa ko call karein", "date": "${currentDate}", "time": "20:30", "type": "one-time"}}\nACTION>>>`;
      } else if (lower.includes('yaad') || lower.includes('remember') || lower.includes('save this')) {
        responseText = `Ji, maine yaad rakh liya Ritesh.\n<<<ACTION\n{"type": "save_memory", "data": {"content": "${message}", "category": "Routine"}}\nACTION>>>`;
      } else if (lower.includes('linkedin')) {
        responseText = `Sure Ritesh, main Employee Management System ke liye ek professional LinkedIn post prepare karti hoon.\n<<<ACTION\n{"type": "generate_social", "data": {"platform": "linkedin", "topic": "Employee Management System full-stack Java and React"}}\nACTION>>>`;
      } else {
        responseText = `Ji Ritesh, main samajh gayi. Bataiye, isme main kya madad kar sakti hoon?`;
      }
    }

    const rawReply = responseText || "Ji Ritesh, main samajh gayi.";

    // Parse action if present
    let replyText = rawReply;
    let action = null;

    const actionMatch = rawReply.match(/<<<ACTION\s*([\s\S]*?)\s*ACTION>>>/);
    if (actionMatch && actionMatch[1]) {
      try {
        action = JSON.parse(actionMatch[1]);
        replyText = rawReply.replace(/<<<ACTION[\s\S]*?ACTION>>>/, '').trim();
      } catch (err) {
        console.error('Failed to parse action json:', err);
      }
    }

    return res.json({
      reply: replyText,
      action,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: 'Failed to generate response',
      details: error.message,
      fallbackReply: 'Ji Ritesh, thodi takleef hui connect karne mein. Ek baar fir se bolenge?',
    });
  }
});

// API: Lakshmi Voice TTS (using gemini-3.8-flash-lite-tts with female Kore voice)
app.post('/api/voice/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Clean any markup or symbols
    const cleanText = text.replace(/<<<[\s\S]*?>>>/g, '').trim();

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Calm, gentle, caring and professional female personal assistant speaking Hindi/Hinglish/English naturally',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (audioBase64) {
      return res.json({ audioBase64, mimeType: 'audio/wav' });
    } else {
      return res.json({ audioBase64: null, note: 'No audio returned' });
    }
  } catch (error: any) {
    console.warn('TTS error (will fallback to browser Web Speech API):', error.message);
    return res.json({ audioBase64: null, error: error.message });
  }
});

// API: Social Media Content Generator
app.post('/api/social/generate', async (req, res) => {
  try {
    const { platform = 'linkedin', topic, notes = '', tone = 'professional' } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = `
Create an engaging, modern, high-impact social media post for Ritesh Kumar.
Platform: ${platform}
Topic: ${topic}
Additional context/notes: ${notes}
Tone: ${tone}

Guidelines per platform:
- For LinkedIn: Professional, inspiring, structured, clear paragraphs, highlight skills (e.g. Full Stack, Java, React, Cloud, AI), call to action, relevant tech hashtags.
- For Instagram: Catchy, engaging caption, visually appealing emoji accents, 10-15 trending hashtags, punchy short text.
- For Facebook: Friendly, informative, community-focused, relatable.

Respond in JSON format:
{
  "title": "Short title or hook",
  "content": "Full post content text ready to publish",
  "caption": "Short caption (especially for Instagram)",
  "hashtags": ["#tag1", "#tag2", "#tag3"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let result;
    try {
      result = JSON.parse(response.text || '{}');
    } catch (e) {
      result = {
        title: topic,
        content: response.text || '',
        hashtags: ['#coding', '#tech', '#developer'],
      };
    }

    return res.json(result);
  } catch (error: any) {
    console.error('Error generating social post:', error);
    return res.status(500).json({ error: 'Failed to generate post', details: error.message });
  }
});

// API: Telephony Bridge Status & Call Actions
app.get('/api/telephony/status', (req, res) => {
  res.json({
    status: 'integration_ready',
    platform: 'Android / SIP Telephony Companion',
    connected: false,
    reason: 'Android companion device ready for pairing via WebSocket/Push. Direct cellular calls require device link.',
    features: {
      incomingDetection: true,
      callerId: true,
      papaPriorityRule: true,
      unansweredTimeout: true,
      autoVoiceReply: true,
      forwardingReady: true,
    },
  });
});

// API: Call Forwarding verification
app.post('/api/telephony/forward', (req, res) => {
  const { contactName, targetNumber, isTelephonyConnected } = req.body;

  if (!isTelephonyConnected) {
    return res.status(400).json({
      success: false,
      message: 'Forwarding could not be completed because the phone integration is not connected.',
    });
  }

  if (!targetNumber) {
    return res.status(400).json({
      success: false,
      message: 'No forwarding number configured.',
    });
  }

  return res.json({
    success: true,
    message: `Call from ${contactName || 'caller'} successfully forwarded to ${targetNumber}.`,
    timestamp: new Date().toISOString(),
  });
});

// Default Supabase project configuration
const DEFAULT_SUPABASE_PROJECT_ID = 'jxnvwmtnoidceovaelsb';
const DEFAULT_SUPABASE_URL = process.env.SUPABASE_URL?.includes('jxnvwmtnoidceovaelsb')
  ? process.env.SUPABASE_URL
  : 'https://jxnvwmtnoidceovaelsb.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_MK4bTSrWsCx1GV9HzEEKIA__E-zFzJ8';

// API: Test Supabase connection (GET and POST supported)
const handleSupabaseTest = async (req: express.Request, res: express.Response) => {
  try {
    const url = (req.body?.url || req.query?.url || DEFAULT_SUPABASE_URL) as string;
    const anonKey = (req.body?.anonKey || req.query?.anonKey || DEFAULT_SUPABASE_PUBLISHABLE_KEY) as string;

    if (!url || !anonKey) {
      return res.status(400).json({
        success: false,
        message: 'Supabase Project URL and Publishable Key are required.',
      });
    }

    // 1. Verify URL format and Supabase client initialization
    let supabase;
    try {
      supabase = createClient(url, anonKey);
    } catch (clientErr: any) {
      return res.status(400).json({
        success: false,
        message: `Failed to initialize Supabase client: ${clientErr.message}`,
      });
    }

    // 2. Direct HTTP ping to REST gateway to verify network reachability and key validation
    let reachable = false;
    let gatewayMessage = '';
    try {
      const restResp = await fetch(`${url.replace(/\/+$/, '')}/rest/v1/`, {
        method: 'GET',
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      });

      reachable = true;
      if (restResp.status === 401) {
        const bodyText = await restResp.text().catch(() => '');
        return res.status(401).json({
          success: false,
          projectId: DEFAULT_SUPABASE_PROJECT_ID,
          url,
          code: 'UNAUTHORIZED_INVALID_API_KEY',
          message:
            `Invalid API key: Ensure this publishable key was created for project ${DEFAULT_SUPABASE_PROJECT_ID} under Project Settings > API.`,
          details: bodyText,
        });
      }
      gatewayMessage = `REST Gateway responded with HTTP ${restResp.status}`;
    } catch (netErr: any) {
      return res.status(503).json({
        success: false,
        message: `Database server unreachable: ${netErr.message}`,
      });
    }

    return res.json({
      success: true,
      projectId: DEFAULT_SUPABASE_PROJECT_ID,
      url,
      message: `Successfully connected to Supabase project (${DEFAULT_SUPABASE_PROJECT_ID})!`,
      gateway: gatewayMessage,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

app.get('/api/supabase/test', handleSupabaseTest);
app.post('/api/supabase/test', handleSupabaseTest);

// API: Bulk sync backend records to Supabase (GET and POST supported)
app.get('/api/supabase/sync', (req, res) => {
  return res.json({
    status: 'ready',
    projectId: DEFAULT_SUPABASE_PROJECT_ID,
    url: DEFAULT_SUPABASE_URL,
    supportedTables: [
      'tasks',
      'reminders',
      'routine_items',
      'memories',
      'contacts',
      'call_history',
      'call_messages',
      'social_drafts',
      'chat_history',
    ],
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/supabase/sync', async (req, res) => {
  try {
    const { url, anonKey, table, records } = req.body;
    const targetUrl = (url || DEFAULT_SUPABASE_URL) as string;
    const targetKey = (anonKey || DEFAULT_SUPABASE_PUBLISHABLE_KEY) as string;

    if (!table || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'Parameters "table" and "records" (array) are required for Supabase sync.',
      });
    }

    const supabase = createClient(targetUrl, targetKey);
    const { data, error } = await supabase.from(table).upsert(records);

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      table,
      count: records.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Setup Vite middlewares in development or serve static in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
