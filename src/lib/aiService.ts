import { AIMode, UserSettings, MemoryItem, DailyCheckin, UserProfileVector, JournalEntry } from "../types";

export interface AIChatOptions {
  prompt: string;
  mode?: AIMode;
  userContext?: any;
  settings?: UserSettings;
}

const MODE_PROMPTS: Record<string, string> = {
  "Therapist": "You are an empathetic, compassionate, CBT-focused AI Therapist for 'My Life OS'. Help the user process emotions, reframe negative thoughts, and maintain mental clarity. Be gentle, warm, and non-judgmental. Respond in Thai by default.",
  "Life Coach": "You are a high-agency, insightful, empowering AI Life Coach for 'My Life OS'. Guide the user to turn their life goals into small 15-minute actionable pebbles. Help them focus on who they are becoming. Respond in Thai by default.",
  "Goal Coach": "You are a strategic, performance-driven Goal Coach. Help the user break down complex milestones, establish clear deadlines, prioritize, and stay accountable. Respond in Thai by default.",
  "Decision Helper": "You are a clear-headed Decision Coach. Help the user think through choices using pros/cons, second-order effects, and alignment with their values. Ask clarifying questions. Respond in Thai by default.",
  "Weekly Reflection": "You are a Weekly Reflection Guide. Help the user review the past 7 days: wins, struggles, patterns, and one key lesson. Be structured but warm. Respond in Thai by default.",
  "Monthly Reflection": "You are a Monthly Reflection Guide. Help the user review the past month holistically — habits, goals, emotions, relationships, and growth trajectory. Respond in Thai by default.",
  "Future Self": "You are the user's Future Self — 5 years from now. You have achieved the goals they dream of. Speak from that perspective with wisdom, compassion and specificity. Respond in Thai by default.",
  "General Chat": "You are a supportive, friendly AI assistant for My Life OS. Help the user with anything they need. Respond in Thai by default.",
  "Custom": "You are an AI Assistant for My Life OS. Help the user optimize their daily routines, habits, and productivity. Respond in Thai by default.",
};

/**
 * Direct REST API fetch to Google Gemini API
 */
async function callGeminiRestApi(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const cleanKey = apiKey.trim();
  const activeModel = model && model.trim() ? model.trim() : "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${encodeURIComponent(cleanKey)}`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: userPrompt }
        ]
      }
    ],
    systemInstruction: systemPrompt ? {
      parts: [
        { text: systemPrompt }
      ]
    } : undefined
  };

  console.log(`[Gemini REST API Call] Requesting ${activeModel}...`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("[Gemini REST API Error Log]:", {
      status: response.status,
      statusText: response.statusText,
      url: `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent`,
      errorBody: responseBody
    });

    const errorMsg = responseBody?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  const generatedText = responseBody?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!generatedText) {
    console.warn("[Gemini REST API Warning] Empty response text received:", responseBody);
    throw new Error("API ส่งคืนโครงสร้างว่างเปล่า ไม่พบข้อความใน candidates");
  }

  return generatedText;
}

export async function sendAIChatRequest({
  prompt,
  mode = "Life Coach",
  userContext,
  settings,
}: AIChatOptions): Promise<string> {
  const apiKey = settings?.aiApiKey?.trim();

  if (!apiKey) {
    return `⚠️ ยังไม่ได้ใส่ Google AI Studio API Key\n\nกรุณาไปที่เมนู "ตั้งค่า" (Settings) และใส่ API Key เพื่อเปิดใช้งาน AI Life Coach แบบสดครับ\n\n💡 รับ API Key ฟรีได้ที่: https://aistudio.google.com/app/apikey`;
  }

  try {
    const systemPrompt = MODE_PROMPTS[mode] || MODE_PROMPTS["Life Coach"];
    const fullUserPrompt = userContext
      ? `[บริบทผู้ใช้ปัจจุบัน]: ${JSON.stringify(userContext)}\n\n[ข้อความจากผู้ใช้]: ${prompt}`
      : prompt;

    const model = settings?.aiModel || "gemini-2.5-flash";
    return await callGeminiRestApi(apiKey, model, systemPrompt, fullUserPrompt);
  } catch (err: any) {
    console.error("sendAIChatRequest failure:", err);

    if (mode === "Therapist") {
      return `[ข้อผิดพลาดการเชื่อมต่อ API]: ${err.message}\n\n[โหมดออฟไลน์] ความรู้สึกของคุณมีความหมายอย่างยิ่ง ลองใช้เวลาหายใจเข้าลึกๆ 3 ครั้ง แล้วเขียนสิ่งที่ติดอยู่ในใจออกมาทั้งหมดในโหมด Brain Dump ครับ`;
    }
    return `[ข้อผิดพลาดการเชื่อมต่อ API]: ${err.message}\n\nกรุณาตรวจสอบว่า API Key และชื่อ Model ในหน้าตั้งค่าถูกต้องตรงกับที่เปิดใช้งานใน Google AI Studio ครับ`;
  }
}

export async function generateAIReflection(
  entries: any[],
  characterStats: any,
  settings?: UserSettings
): Promise<string> {
  const apiKey = settings?.aiApiKey?.trim();
  if (!apiKey) {
    return "จากการบันทึกของคุณในวันนี้ ระดับความมีวินัยของคุณพุ่งสูงขึ้นในช่วงเช้า สิ่งที่ควรทำ: วางแผนพักผ่อนและใส่ API Key เพื่อรับบทวิเคราะห์ AI แบบเจาะลึก";
  }

  try {
    const systemPrompt = "คุณคือ AI Life Coach สรุปวิเคราะห์พัฒนาการผู้ใช้ในภาษาไทย ให้กระชับ ได้ใจความ และสร้างแรงบันดาลใจ";
    const userPrompt = `กรุณาวิเคราะห์บันทึกรายวันและสถานะตัวละครต่อไปนี้ แล้วให้ข้อคิดสั้นๆ 2-3 ประโยคเพื่อพัฒนาตนเอง:\nEntries: ${JSON.stringify(entries)}\nStats: ${JSON.stringify(characterStats)}`;
    const model = settings?.aiModel || "gemini-2.5-flash";
    return await callGeminiRestApi(apiKey, model, systemPrompt, userPrompt);
  } catch {
    return "จากการบันทึกของคุณในวันนี้ ระดับความมีวินัยของคุณพุ่งสูงขึ้นในช่วงเช้า แต่มีรูปแบบความเครียดเล็กน้อย สิ่งที่ควรทำ: วางแผนค่ำคืนแห่งการพักผ่อนเพื่อฟื้นฟูพลัง";
  }
}

export async function testAIConnection(
  apiKey: string,
  model: string = "gemini-2.5-flash"
): Promise<{ success: boolean; message: string }> {
  const cleanKey = apiKey?.trim();
  if (!cleanKey) {
    return { success: false, message: "กรุณากรอก API Key จาก Google AI Studio" };
  }

  const activeModel = model && model.trim() ? model.trim() : "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${encodeURIComponent(cleanKey)}`;

  console.log(`[Test Connection] Testing ${url.replace(cleanKey, "HIDDEN_KEY")}...`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: "Respond with the single word 'CONNECTED'" }]
          }
        ]
      })
    });

    const responseBody = await response.json().catch(() => null);

    if (response.ok && responseBody?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return {
        success: true,
        message: `เชื่อมต่อ Google AI Studio REST API (${activeModel}) สำเร็จ! (HTTP 200 OK)`
      };
    }

    console.error("[Test Connection Error Response]:", {
      status: response.status,
      statusText: response.statusText,
      body: responseBody
    });

    const errorMsg = responseBody?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    return {
      success: false,
      message: `การเชื่อมต่อล้มเหลว (${errorMsg})`
    };
  } catch (err: any) {
    console.error("[Test Connection Exception]:", err);
    return {
      success: false,
      message: `ไม่สามารถส่ง Request ได้: ${err.message || "Network Error"}`
    };
  }
}

// ══════════════════════════════════════════════════════════
// Intelligence Layer Functions
// ══════════════════════════════════════════════════════════

/**
 * Semi-auto memory extraction from a journal entry.
 * Only triggers when entry.wordCount > 100.
 * Returns only memories with confidence >= 0.75.
 */
export async function extractMemoryFromJournal(
  entry: JournalEntry,
  settings?: UserSettings
): Promise<MemoryItem[]> {
  const apiKey = settings?.aiApiKey?.trim();
  if (!apiKey) return [];

  try {
    const systemPrompt = `คุณคือ Memory Extractor AI สำหรับ My Life OS
งานของคุณ: วิเคราะห์บันทึกส่วนตัวและสกัด "ความทรงจำสำคัญ" ออกมาเป็น JSON array
แต่ละ memory ต้องมี: category, content, confidence (0.0-1.0)
categories ที่ใช้ได้: value, fear, dream, strength, weakness, lesson, pattern, belief

ตัวอย่าง output ที่ถูกต้อง:
[
  {"category":"dream","content":"ต้องการเป็น trader เต็มเวลาภายใน 3 ปี","confidence":0.92},
  {"category":"strength","content":"ทำงานดีที่สุดเมื่อมีระบบที่ชัดเจน","confidence":0.85}
]

กฎ:
- ถ้าไม่พบ memory ที่มีนัยสำคัญ ให้ return []
- อย่า extract ข้อมูลที่ไม่สำคัญ (กินข้าว, เดินทาง)
- confidence < 0.75 = ไม่มีนัยสำคัญพอ
- ตอบด้วย JSON array เท่านั้น ห้ามมีข้อความอื่น`;

    const userPrompt = `Journal Entry:\nTitle: ${entry.title}\nMode: ${entry.mode}\nMood: ${entry.mood}\nContent: ${entry.content}`;
    const model = settings?.aiModel || "gemini-2.5-flash";

    const raw = await callGeminiRestApi(apiKey, model, systemPrompt, userPrompt);

    // Parse JSON from response (may have markdown code fences)
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]) as { category: string; content: string; confidence: number }[];
    const now = Date.now();

    return parsed
      .filter(m => m.confidence >= 0.75)
      .map(m => ({
        id: "mem-" + now + "-" + Math.random().toString(36).slice(2, 7),
        category: m.category as MemoryItem["category"],
        content: m.content,
        extractedFrom: entry.id,
        timestamp: now,
        confidence: m.confidence,
        pinned: false,
      }));
  } catch (err) {
    console.error("[extractMemoryFromJournal] error:", err);
    return [];
  }
}

/**
 * Generate a personalized Life Context greeting for AI Coach.
 * Uses recent journals, habits, goals, memories, and character stats.
 */
export async function generateLifeContextGreeting(
  context: {
    userName: string;
    recentJournals: Pick<JournalEntry, "title" | "mood" | "content" | "date">[];
    goals: { title: string; progressPercent: number; priority: string }[];
    habits: { title: string; currentStreak: number }[];
    memories: Pick<MemoryItem, "category" | "content">[];
    profileVector: UserProfileVector;
    character: Record<string, number>;
  },
  settings?: UserSettings
): Promise<string> {
  const apiKey = settings?.aiApiKey?.trim();
  if (!apiKey) {
    return `สวัสดี ${context.userName} 👋 พร้อมเริ่มวันใหม่แล้วหรือยัง?`;
  }

  try {
    const systemPrompt = `คุณคือ Personal AI ของ My Life OS
สร้างข้อความทักทายที่เป็นส่วนตัวและลึกซึ้ง 2-4 ประโยค
ใช้ข้อมูลจากบริบทที่ได้รับ — อ้างอิงเหตุการณ์จริงในชีวิตผู้ใช้
อย่าพูดทั่วๆ ไป ต้องแสดงว่าคุณรู้จักเจ้าของแอพอย่างลึกซึ้ง
วันที่วันนี้: ${new Date().toLocaleDateString("th-TH", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
ตอบภาษาไทย เป็นธรรมชาติ ไม่เป็นทางการเกินไป`;

    const userPrompt = `ผู้ใช้: ${context.userName}
Journal 7 วันล่าสุด: ${JSON.stringify(context.recentJournals.slice(0, 5))}
Habits ที่กำลังทำ: ${JSON.stringify(context.habits.slice(0, 5))}
Goals หลัก: ${JSON.stringify(context.goals.slice(0, 3))}
Memory ที่ AI รู้: ${JSON.stringify(context.memories.slice(0, 8))}
Profile: ${JSON.stringify(context.profileVector.personality)}
Values: ${context.profileVector.values.join(", ")}
Character Stats: ${JSON.stringify(context.character)}`;

    const model = settings?.aiModel || "gemini-2.5-flash";
    return await callGeminiRestApi(apiKey, model, systemPrompt, userPrompt);
  } catch (err) {
    console.error("[generateLifeContextGreeting] error:", err);
    return `สวัสดี ${context.userName} 👋 วันนี้อยากคุยเรื่องอะไรครับ?`;
  }
}

/**
 * Summarize a Daily Check-in's 5 answers into a short AI insight.
 */
export async function summarizeDailyCheckin(
  checkin: Omit<DailyCheckin, "id" | "aiSummary">,
  settings?: UserSettings
): Promise<string> {
  const apiKey = settings?.aiApiKey?.trim();
  if (!apiKey) {
    return "วันนี้คุณสำรวจตัวเองอย่างมีสติ — นั่นคือก้าวแรกของการเติบโต";
  }

  try {
    const systemPrompt = `คุณคือ Daily Reflection AI สรุปคำตอบ Check-in รายวันเป็นข้อความ insight 2-3 ประโยค
ให้กระชับ อบอุ่น และสร้างแรงบันดาลใจ ชี้ให้เห็น pattern หรือ insight ที่ผู้ใช้อาจมองข้าม
ตอบภาษาไทย`;

    const userPrompt = `Mood วันนี้: ${checkin.mood}
วันนี้อะไรดี: ${checkin.answers.wentWell}
วันนี้อะไรยาก: ${checkin.answers.challenge}
วันนี้เรียนรู้อะไร: ${checkin.answers.learned}
วันนี้ขอบคุณอะไร: ${checkin.answers.grateful}
พรุ่งนี้จะปรับอะไร: ${checkin.answers.tomorrow}`;

    const model = settings?.aiModel || "gemini-2.5-flash";
    return await callGeminiRestApi(apiKey, model, systemPrompt, userPrompt);
  } catch {
    return "วันนี้คุณสำรวจตัวเองอย่างมีสติ — นั่นคือก้าวแรกของการเติบโต";
  }
}

/**
 * Incrementally update User Profile Vector based on accumulated memories and checkins.
 * Should be called periodically (e.g. after every 5 new memories).
 */
export async function updateProfileVector(
  currentVector: UserProfileVector,
  recentMemories: MemoryItem[],
  recentCheckins: DailyCheckin[],
  settings?: UserSettings
): Promise<UserProfileVector | null> {
  const apiKey = settings?.aiApiKey?.trim();
  if (!apiKey || recentMemories.length === 0) return null;

  try {
    const systemPrompt = `คุณคือ Personality Profiler AI สำหรับ My Life OS
วิเคราะห์ Memory และ Check-in ที่ได้รับ แล้วอัปเดต User Profile Vector
ตอบด้วย JSON object ตามโครงสร้างที่กำหนดเท่านั้น ห้ามมีข้อความอื่น
ต้องรักษาค่าเดิมที่ยังสมเหตุสมผล และอัปเดตเฉพาะส่วนที่มีหลักฐานชัดเจน`;

    const userPrompt = `Profile ปัจจุบัน: ${JSON.stringify(currentVector)}
Memory ล่าสุด: ${JSON.stringify(recentMemories.slice(-20))}
Check-in ล่าสุด: ${JSON.stringify(recentCheckins.slice(-7).map(c => c.answers))}

ตอบ JSON ตาม schema:
{
  "personality": {
    "riskTaking": "low"|"medium"|"high",
    "thinkingStyle": "analytical"|"creative"|"balanced"|"intuitive",
    "motivation": "future-self"|"achievement"|"connection"|"growth"|"freedom",
    "workStyle": "systems"|"spontaneous"|"collaborative"|"solo"
  },
  "values": ["string", ...],
  "patterns": ["string", ...],
  "coreStrengths": ["string", ...],
  "growthAreas": ["string", ...]
}`;

    const model = settings?.aiModel || "gemini-2.5-flash";
    const raw = await callGeminiRestApi(apiKey, model, systemPrompt, userPrompt);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      ...parsed,
      lastUpdated: Date.now(),
      updateCount: currentVector.updateCount + 1,
    } as UserProfileVector;
  } catch (err) {
    console.error("[updateProfileVector] error:", err);
    return null;
  }
}

