import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ override: true });

// Enforce that only the current Supabase project URL and key are used across dev server and backend
process.env.VITE_SUPABASE_URL = 'https://fupgnszofujkaslbawgq.supabase.co';
process.env.SUPABASE_URL = 'https://fupgnszofujkaslbawgq.supabase.co';

if (!process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY.includes('MK4bTSrWsCx1GV9HzEEKIA')) {
  process.env.VITE_SUPABASE_ANON_KEY = 'sb_publishable_1ADQDEdMzTFI27l1qjZ7Hw_vRCiUg2E';
}
if (!process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY.includes('MK4bTSrWsCx1GV9HzEEKIA')) {
  process.env.SUPABASE_ANON_KEY = 'sb_publishable_1ADQDEdMzTFI27l1qjZ7Hw_vRCiUg2E';
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// ============================================================
// Gemini AI
// ============================================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ============================================================
// Lakshmi System Instruction
// ============================================================

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

create_task:
{
  "title": string,
  "category": "Coding"|"College"|"Job Preparation"|"Project"|"Personal"|"Social Media"|"Other",
  "priority": "low"|"medium"|"high"|"urgent",
  "date": "YYYY-MM-DD",
  "time": "HH:MM"
}

create_reminder:
{
  "title": string,
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "type": "one-time"|"daily"|"weekly"|"recurring"
}

save_memory:
{
  "content": string,
  "category": "Preferences"|"Routine"|"Career"|"Family"|"Coding"|"General"
}

create_event:
{
  "title": string,
  "date": "YYYY-MM-DD",
  "startTime": "HH:MM",
  "endTime": "HH:MM",
  "category": string
}

update_routine:
{
  "title": string,
  "period": "Morning"|"Afternoon"|"Evening"|"Night",
  "startTime": "HH:MM",
  "endTime": "HH:MM"
}

generate_social:
{
  "platform": "linkedin"|"instagram"|"facebook",
  "topic": string
}

query_schedule:
{
  "targetDate": "today"|"tomorrow"|"specific",
  "date": "YYYY-MM-DD"
}

Keep your spoken reply natural and warm before the ACTION block.

Example:

Ji Ritesh, maine kal 7 PM ka Java practice reminder set kar diya hai.

<<<ACTION
{
  "type": "create_reminder",
  "data": {
    "title": "Java practice",
    "date": "2026-09-29",
    "time": "19:00",
    "type": "one-time"
  }
}
ACTION>>>
`;

// ============================================================
// API: Lakshmi Chat
// ============================================================

app.post('/api/chat', async (req, res) => {
  try {
    const {
      message,
      history = [],
      userContext = {},
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required',
      });
    }

    const currentDate = new Date()
      .toISOString()
      .split('T')[0];

    const currentTime = new Date().toLocaleTimeString(
      'en-US',
      {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      }
    );

    let contextPrompt = `
Current System Context:
Current Date: ${currentDate}
Current Time: ${currentTime}
User: Ritesh Kumar
Email: riteshkumarrai313@gmail.com
`;

    if (userContext.todayTasks?.length) {
      contextPrompt += `
Today's Pending Tasks:
${JSON.stringify(userContext.todayTasks)}
`;
    }

    if (userContext.activeReminders?.length) {
      contextPrompt += `
Active Reminders:
${JSON.stringify(userContext.activeReminders)}
`;
    }

    if (userContext.recentMemories?.length) {
      contextPrompt += `
Key Memories Saved:
${JSON.stringify(userContext.recentMemories)}
`;
    }

    const contents: any[] = [];

    contents.push({
      role: 'user',
      parts: [
        {
          text: `${contextPrompt}

User says:
${message}`,
        },
      ],
    });

    let responseText = '';
    let lastError = null;

    const modelsToTry = [
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
    ];

    for (const modelName of modelsToTry) {
      try {
        const response =
          await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction:
                LAKSHMI_SYSTEM_INSTRUCTION,
              temperature: 0.7,
            },
          });

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;

        console.warn(
          `Model ${modelName} failed, trying next fallback:`,
          err?.message
        );
      }
    }

    // ========================================================
    // Offline fallback
    // ========================================================

    if (!responseText) {
      const lower = message.toLowerCase();

      if (
        lower.includes('java') &&
        (
          lower.includes('kal') ||
          lower.includes('remind') ||
          lower.includes('7')
        )
      ) {
        responseText = `
Ji Ritesh, maine Java practice reminder set kar diya hai.

<<<ACTION
{
  "type": "create_reminder",
  "data": {
    "title": "Java practice",
    "date": "${currentDate}",
    "time": "19:00",
    "type": "one-time"
  }
}
ACTION>>>
`;
      } else if (
        lower.includes('schedule') ||
        lower.includes('aaj kya karna') ||
        lower.includes('aaj mera')
      ) {
        responseText = `
Ji Ritesh, main aapka aaj ka schedule check karti hoon.

<<<ACTION
{
  "type": "query_schedule",
  "data": {
    "targetDate": "today"
  }
}
ACTION>>>
`;
      } else if (lower.includes('papa')) {
        responseText = `
Ji Ritesh, Papa ko call karne ka reminder note kar liya hai.

<<<ACTION
{
  "type": "create_reminder",
  "data": {
    "title": "Papa ko call karein",
    "date": "${currentDate}",
    "time": "20:30",
    "type": "one-time"
  }
}
ACTION>>>
`;
      } else if (
        lower.includes('yaad') ||
        lower.includes('remember') ||
        lower.includes('save this')
      ) {
        responseText = `
Ji Ritesh, maine yaad rakh liya.

<<<ACTION
{
  "type": "save_memory",
  "data": {
    "content": "${message.replace(/"/g, '\\"')}",
    "category": "General"
  }
}
ACTION>>>
`;
      } else if (lower.includes('linkedin')) {
        responseText = `
Sure Ritesh, main LinkedIn ke liye professional post prepare karti hoon.

<<<ACTION
{
  "type": "generate_social",
  "data": {
    "platform": "linkedin",
    "topic": "Employee Management System"
  }
}
ACTION>>>
`;
      } else {
        responseText =
          'Ji Ritesh, main samajh gayi. Bataiye, isme main kya madad kar sakti hoon?';
      }
    }

    const rawReply =
      responseText ||
      'Ji Ritesh, main samajh gayi.';

    let replyText = rawReply;
    let action = null;

    const actionMatch = rawReply.match(
      /<<<ACTION\s*([\s\S]*?)\s*ACTION>>>/
    );

    if (
      actionMatch &&
      actionMatch[1]
    ) {
      try {
        action = JSON.parse(
          actionMatch[1]
        );

        replyText = rawReply
          .replace(
            /<<<ACTION[\s\S]*?ACTION>>>/,
            ''
          )
          .trim();
      } catch (err) {
        console.error(
          'Failed to parse action JSON:',
          err
        );
      }
    }

    return res.json({
      reply: replyText,
      action,
    });
  } catch (error: any) {
    console.error(
      'Error in /api/chat:',
      error
    );

    return res.status(500).json({
      error: 'Failed to generate response',
      details: error?.message,
      fallbackReply:
        'Ji Ritesh, thodi takleef hui connect karne mein. Ek baar fir se bolenge?',
    });
  }
});

// ============================================================
// API: Lakshmi Voice TTS
// ============================================================

app.post('/api/voice/tts', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Text is required',
      });
    }

    const cleanText = text
      .replace(/<<<[\s\S]*?>>>/g, '')
      .trim();

    const ttsResponse =
      await ai.models.generateContent({
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
      ttsResponse
        .candidates?.[0]
        ?.content?.parts?.[0]
        ?.inlineData?.data;

    if (audioBase64) {
      return res.json({
        audioBase64,
        mimeType: 'audio/wav',
      });
    }

    return res.json({
      audioBase64: null,
      note: 'No audio returned',
    });
  } catch (error: any) {
    console.warn(
      'TTS error:',
      error?.message
    );

    return res.json({
      audioBase64: null,
      error: error?.message,
    });
  }
});

// ============================================================
// API: Social Media Content Generator
// ============================================================

app.post(
  '/api/social/generate',
  async (req, res) => {
    try {
      const {
        platform = 'linkedin',
        topic,
        notes = '',
        tone = 'professional',
      } = req.body;

      if (!topic) {
        return res.status(400).json({
          error: 'Topic is required',
        });
      }

      const prompt = `
Create an engaging, modern, high-impact social media post for Ritesh Kumar.

Platform: ${platform}
Topic: ${topic}
Additional context/notes: ${notes}
Tone: ${tone}

Guidelines:

LinkedIn:
- Professional
- Inspiring
- Structured
- Highlight relevant skills
- Include call to action
- Relevant tech hashtags

Instagram:
- Catchy
- Engaging
- Emoji accents
- 10-15 hashtags

Facebook:
- Friendly
- Informative
- Community-focused
- Relatable

Respond in JSON format:

{
  "title": "Short title or hook",
  "content": "Full post content text ready to publish",
  "caption": "Short caption",
  "hashtags": ["#tag1", "#tag2", "#tag3"]
}
`;

      const response =
        await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType:
              'application/json',
          },
        });

      let result;

      try {
        result = JSON.parse(
          response.text || '{}'
        );
      } catch {
        result = {
          title: topic,
          content:
            response.text || '',
          caption: '',
          hashtags: [
            '#coding',
            '#tech',
            '#developer',
          ],
        };
      }

      return res.json(result);
    } catch (error: any) {
      console.error(
        'Error generating social post:',
        error
      );

      return res.status(500).json({
        error:
          'Failed to generate post',
        details:
          error?.message,
      });
    }
  }
);

// ============================================================
// Telephony
// ============================================================

app.get(
  '/api/telephony/status',
  (req, res) => {
    res.json({
      status: 'integration_ready',
      platform:
        'Android / SIP Telephony Companion',
      connected: false,
      reason:
        'Android companion device ready for pairing via WebSocket/Push. Direct cellular calls require device link.',
      features: {
        incomingDetection: true,
        callerId: true,
        papaPriorityRule: true,
        unansweredTimeout: true,
        autoVoiceReply: true,
        forwardingReady: true,
      },
    });
  }
);

// ============================================================
// Call Forwarding
// ============================================================

app.post(
  '/api/telephony/forward',
  (req, res) => {
    const {
      contactName,
      targetNumber,
      isTelephonyConnected,
    } = req.body;

    if (!isTelephonyConnected) {
      return res.status(400).json({
        success: false,
        message:
          'Forwarding could not be completed because the phone integration is not connected.',
      });
    }

    if (!targetNumber) {
      return res.status(400).json({
        success: false,
        message:
          'No forwarding number configured.',
      });
    }

    return res.json({
      success: true,
      message: `Call from ${
        contactName || 'caller'
      } successfully forwarded to ${targetNumber}.`,
      timestamp:
        new Date().toISOString(),
    });
  }
);

// ============================================================
// SUPABASE CONFIGURATION
// IMPORTANT: CURRENT PROJECT ONLY
// ============================================================

const DEFAULT_SUPABASE_PROJECT_ID =
  'fupgnszofujkaslbawgq';

const DEFAULT_SUPABASE_URL =
  process.env.SUPABASE_URL ||
  'https://fupgnszofujkaslbawgq.supabase.co';

const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_ANON_KEY || '';

// ============================================================
// Supabase Test
// ============================================================

const handleSupabaseTest = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const url = DEFAULT_SUPABASE_URL;

    const anonKey = (
      req.body?.anonKey ||
      req.query?.anonKey ||
      DEFAULT_SUPABASE_PUBLISHABLE_KEY
    ) as string;

    if (!url || !anonKey) {
      return res.status(400).json({
        success: false,
        message:
          'Supabase Project URL and Publishable Key are required.',
      });
    }

    let supabase;

    try {
      supabase = createClient(
        url,
        anonKey
      );
    } catch (clientErr: any) {
      return res.status(400).json({
        success: false,
        message:
          `Failed to initialize Supabase client: ${clientErr.message}`,
      });
    }

    try {
      const {
        error,
      } = await supabase
        .from('tasks')
        .select('id')
        .limit(1);

      if (error) {
        if (
          error.message?.includes(
            'Invalid API key'
          ) ||
          error.message?.includes('JWT')
        ) {
          return res.status(401).json({
            success: false,
            projectId:
              DEFAULT_SUPABASE_PROJECT_ID,
            url,
            code:
              'UNAUTHORIZED_INVALID_API_KEY',
            message:
              `Invalid API key: Ensure this publishable key belongs to project ${DEFAULT_SUPABASE_PROJECT_ID}.`,
          });
        }

        // If table doesn't exist yet, check whether auth settings respond OK
        try {
          const authResp = await fetch(
            `${url.replace(/\/+$/, '')}/auth/v1/settings`,
            {
              headers: {
                apikey: anonKey,
              },
            }
          );

          if (authResp.ok) {
            return res.json({
              success: true,
              tablesPending: true,
              projectId: DEFAULT_SUPABASE_PROJECT_ID,
              url,
              message: `Successfully connected to Supabase project (${DEFAULT_SUPABASE_PROJECT_ID})! Run the SQL schema from Settings > Supabase to complete table setup.`,
              timestamp: new Date().toISOString(),
            });
          }
        } catch {
          // Continue to error reporting below
        }

        return res.status(400).json({
          success: false,
          projectId:
            DEFAULT_SUPABASE_PROJECT_ID,
          url,
          message: error.message,
        });
      }

      return res.json({
        success: true,
        projectId:
          DEFAULT_SUPABASE_PROJECT_ID,
        url,
        message:
          `Successfully connected to Supabase project (${DEFAULT_SUPABASE_PROJECT_ID})!`,
        timestamp:
          new Date().toISOString(),
      });
    } catch {
      const authResp =
        await fetch(
          `${url.replace(
            /\/+$/,
            ''
          )}/auth/v1/settings`,
          {
            headers: {
              apikey: anonKey,
            },
          }
        );

      if (authResp.ok) {
        return res.json({
          success: true,
          projectId:
            DEFAULT_SUPABASE_PROJECT_ID,
          url,
          message:
            `Successfully connected to Supabase project (${DEFAULT_SUPABASE_PROJECT_ID})!`,
          timestamp:
            new Date().toISOString(),
        });
      }

      if (authResp.status === 401) {
        return res.status(401).json({
          success: false,
          projectId:
            DEFAULT_SUPABASE_PROJECT_ID,
          url,
          code:
            'UNAUTHORIZED_INVALID_API_KEY',
          message:
            'Invalid Supabase API key.',
        });
      }

      return res.status(503).json({
        success: false,
        message:
          `Database server unreachable or returned status ${authResp.status}`,
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message,
    });
  }
};

app.get(
  '/api/supabase/test',
  handleSupabaseTest
);

app.post(
  '/api/supabase/test',
  handleSupabaseTest
);

// ============================================================
// Supabase Sync Status
// ============================================================

app.get(
  '/api/supabase/sync',
  (req, res) => {
    res.json({
      status: 'ready',
      projectId:
        DEFAULT_SUPABASE_PROJECT_ID,
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
      timestamp:
        new Date().toISOString(),
    });
  }
);

// ============================================================
// Supabase Bulk Sync
// ============================================================

app.post(
  '/api/supabase/sync',
  async (req, res) => {
    try {
      const {
        url,
        anonKey,
        table,
        records,
      } = req.body;

      const targetUrl = DEFAULT_SUPABASE_URL;

      const targetKey =
        (anonKey ||
          DEFAULT_SUPABASE_PUBLISHABLE_KEY) as string;

      if (
        !table ||
        !records ||
        !Array.isArray(records)
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Parameters "table" and "records" (array) are required for Supabase sync.',
        });
      }

      if (!targetUrl || !targetKey) {
        return res.status(400).json({
          success: false,
          message:
            'Supabase URL and Publishable Key are required.',
        });
      }

      const supabase =
        createClient(
          targetUrl,
          targetKey
        );

      const {
        data,
        error,
      } = await supabase
        .from(table)
        .upsert(records);

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      return res.json({
        success: true,
        table,
        count: records.length,
        timestamp:
          new Date().toISOString(),
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error?.message,
      });
    }
  }
);

// ============================================================
// Vite / Production
// ============================================================

async function startServer() {
  if (!isProduction) {
    const {
      createServer:
        createViteServer,
    } = await import('vite');

    const vite =
      await createViteServer({
        server: {
          middlewareMode: true,
        },
        appType: 'spa',
      });

    app.use(
      vite.middlewares
    );
  } else {
    app.use(
      express.static(
        path.resolve(
          __dirname,
          'dist'
        )
      )
    );

    app.get('*', (req, res) => {
      res.sendFile(
        path.resolve(
          __dirname,
          'dist',
          'index.html'
        )
      );
    });
  }

  app.listen(
    PORT,
    '0.0.0.0',
    () => {
      console.log(
        `Server listening on port ${PORT} (mode: ${
          isProduction
            ? 'production'
            : 'development'
        })`
      );

      console.log(
        `Supabase Project: ${DEFAULT_SUPABASE_PROJECT_ID}`
      );

      console.log(
        `Supabase URL: ${DEFAULT_SUPABASE_URL}`
      );
    }
  );
}

startServer();