import { AIMode, UserSettings, MemoryItem, MemoryCategory, DailyCheckin, UserProfileVector, JournalEntry, AILearningFeedback } from "../types";


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
  userPrompt: string,
  isRetry: boolean = false
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
      "Content-Type": "application/json",
      "x-goog-api-key": cleanKey
    },
    body: JSON.stringify(payload)
  });

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("[Gemini REST API Error Log]:", {
      status: response.status,
      statusText: response.statusText,
      model: activeModel,
      errorBody: responseBody
    });

    const googleErrorMsg = responseBody?.error?.message || `HTTP ${response.status}: ${response.statusText}`;

    // Auto-fallback to gemini-2.0-flash or gemini-1.5-flash if selected model is not found or unsupported
    if (!isRetry && (response.status === 404 || googleErrorMsg.includes("not found") || googleErrorMsg.includes("models/")) && activeModel !== "gemini-2.0-flash") {
      console.warn(`[Gemini REST API] Model ${activeModel} failed (${googleErrorMsg}). Retrying with gemini-2.0-flash...`);
      return callGeminiRestApi(apiKey, "gemini-2.0-flash", systemPrompt, userPrompt, true);
    }

    throw new Error(`[HTTP ${response.status}] ${googleErrorMsg}`);
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
    return { success: false, message: "กรุณากรอก API Key ในช่องด้านบน" };
  }

  const activeModel = model && model.trim() ? model.trim() : "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${encodeURIComponent(cleanKey)}`;

  console.log(`[Test Connection] Testing ${activeModel}...`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": cleanKey
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
      model: activeModel,
      body: responseBody
    });

    const googleErrorMsg = responseBody?.error?.message || `HTTP ${response.status}: ${response.statusText}`;

    // If activeModel is 404 or unsupported, attempt testing with gemini-2.0-flash automatically
    if ((response.status === 404 || googleErrorMsg.includes("not found")) && activeModel !== "gemini-2.0-flash") {
      console.warn(`[Test Connection] ${activeModel} returned 404, testing gemini-2.0-flash fallback...`);
      return testAIConnection(apiKey, "gemini-2.0-flash");
    }

    return {
      success: false,
      message: `การเชื่อมต่อล้มเหลว [HTTP ${response.status}]: ${googleErrorMsg}`
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
// ══════════════════════════════════════════════════════════
// Intelligence Layer Functions — Personal Intelligence Engine V1.1
// ══════════════════════════════════════════════════════════

export const CONFIDENCE_CONFIG = {
  BASE_CONFIDENCE: 0.15,
  FREQUENCY_WEIGHT: 0.25,  // Weight for number of mentions (up to 5 mentions = max)
  RECENCY_WEIGHT: 0.30,    // Weight for days since last mention (freshness)
  EVIDENCE_WEIGHT: 0.30,   // Weight for unique sources (Journal, Check-in, Interview)
  MAX_CONFIDENCE: 1.00,
};

/**
 * Calculates dynamic Confidence Score based on CONFIG parameters
 */
export function calculateConfidenceScore(
  mentionCount: number,
  lastMentionedAt: number,
  confirmedBy: string[]
): number {
  const now = Date.now();
  const daysOld = Math.max(0, (now - lastMentionedAt) / (1000 * 60 * 60 * 24));
  
  // Frequency score: 1 mention -> 0.05, 5+ mentions -> 0.25
  const frequencyScore = Math.min(CONFIDENCE_CONFIG.FREQUENCY_WEIGHT, Math.max(1, mentionCount) * 0.05);

  // Recency score: 0 days -> 0.30, decays slowly over 180 days
  const recencyScore = Math.max(0, CONFIDENCE_CONFIG.RECENCY_WEIGHT * (1 - daysOld / 180));

  // Evidence score: 1 source -> 0.10, 3+ sources -> 0.30
  const uniqueSources = new Set(confirmedBy).size;
  const evidenceScore = Math.min(CONFIDENCE_CONFIG.EVIDENCE_WEIGHT, uniqueSources * 0.10);

  const rawConfidence = CONFIDENCE_CONFIG.BASE_CONFIDENCE + frequencyScore + recencyScore + evidenceScore;
  return Math.min(CONFIDENCE_CONFIG.MAX_CONFIDENCE, Math.round(rawConfidence * 100) / 100);
}

/**
 * Multi-Tier Deduplication Matcher
 * Tier 1: Exact / Normalized Match
 * Tier 2: Lexical Keyphrase Overlap Heuristics
 * Tier 3: Architecture plug for future LLM / Vector Embeddings
 */
export function multiTierDedupMatch(
  rawContent: string,
  category: MemoryCategory,
  existingMemories: MemoryItem[]
): MemoryItem | null {
  const normRaw = rawContent.trim().toLowerCase();
  const categoryMemories = existingMemories.filter((m) => m.category === category);

  // Tier 1: Exact Match
  const exactMatch = categoryMemories.find((m) => m.content.trim().toLowerCase() === normRaw);
  if (exactMatch) return exactMatch;

  // Tier 2: Keyphrase / Lexical Overlap
  const rawWords = new Set(normRaw.split(/[\s,._-]+/).filter((w) => w.length > 2));
  if (rawWords.size > 0) {
    for (const mem of categoryMemories) {
      const memWords = new Set(mem.content.trim().toLowerCase().split(/[\s,._-]+/).filter((w) => w.length > 2));
      let overlapCount = 0;
      for (const word of rawWords) {
        if (memWords.has(word)) overlapCount++;
      }
      const jaccardOverlap = overlapCount / Math.max(rawWords.size, memWords.size);
      if (jaccardOverlap >= 0.35) {
        return mem;
      }
    }
  }

  // Tier 3: (Future Semantic Vector Matching Plug)
  return null;
}

export interface LearnFromTextResult {
  memories: MemoryItem[];
  feedback: AILearningFeedback;
}

/**
 * Universal Learning Function (Personal Intelligence Engine V1.1)
 * Takes text input, extracts raw insights, consolidates with existing knowledge,
 * computes dual metrics (Confidence & Importance), and classifies changes.
 */
export async function learnFromText(
  text: string,
  sourceContext: string, // e.g. "Journal Entry", "Brain Interview", "Daily Check-in"
  existingMemories: MemoryItem[],
  existingProfile: UserProfileVector,
  settings?: UserSettings
): Promise<LearnFromTextResult> {
  const apiKey = settings?.aiApiKey?.trim();
  const defaultFeedback: AILearningFeedback = {
    patternObservations: [],
    evolutionShifts: [],
    newDiscoveries: ["AI รับทราบข้อมูลแล้ว และเพิ่มเข้าสู่คลังความรู้ของคุณเรียบร้อยครับ"],
    followupQuestion: undefined,
  };

  if (!apiKey || !text.trim()) {
    return { memories: existingMemories, feedback: defaultFeedback };
  }

  try {
    const systemPrompt = `คุณคือ Personal Intelligence Engine (V1.1 Architecture) ของ My Life OS
หน้าที่ของคุณ: วิเคราะห์ข้อความสกัดความรู้เกี่ยวกับผู้ใช้ และแยกแยะ 2 มิติสำคัญ:
1. Confidence: ความแน่นอนของข้อมูล (0.0 - 1.0)
2. Importance: ความสำคัญต่อชีวิต/เป้าหมายของผู้ใช้ (0.0 - 1.0) (เช่น ชอบกินน้ำอัดลม = 0.1, อยากเป็น Trader = 0.9)

รวมทั้งแยกแยะรูปแบบการเปลี่ยนแปลงความรู้เทียบกับของเดิม:
- "none": ความรู้ใหม่ถอดด้าม
- "merged": ความรู้เดิมเรื่องเดียวกัน
- "conflict": ข้อมูลขัดแย้งกับเดิมโดยตรงในเวลาเดียวกัน
- "evolution": ความสนใจ/เป้าหมายพัฒนาหรือเปลี่ยนไปตามเวลา
- "temporary_state": อารมณ์/ความรู้สึกชั่วคราว ณ วันนั้น (ไม่ใช่เป้าหมายยาว)

กรุณาตอบเป็น JSON Object รูปแบบนี้เท่านั้น:
{
  "memories": [
    {
      "category": "value" | "fear" | "dream" | "strength" | "weakness" | "lesson" | "pattern" | "belief",
      "content": "ข้อความสรุปความรู้สั้นๆ ชัดเจน",
      "importance": 0.85,
      "confidence": 0.80,
      "changeType": "none" | "merged" | "conflict" | "evolution" | "temporary_state",
      "changeNote": "เหตุผลสั้นๆ ถ้าเป็น conflict/evolution/temporary_state"
    }
  ],
  "feedback": {
    "patternObservations": [
      "ข้อสังเกตเชิงพฤติกรรม/เทรนด์ (ภาษาคน อบอุ่น ไม่ใช้ศัพท์เทคนิค)"
    ],
    "evolutionShifts": [
      "พัฒนาการการเปลี่ยนแปลงมิติกาลเวลา หรือ Priority Shift"
    ],
    "newDiscoveries": [
      "สิ่งที่ AI เพิ่งเรียนรู้ใหม่เกี่ยวกับผู้ใช้"
    ],
    "followupQuestion": "คำถามสัมภาษณ์เจาะลึก 1 ข้อที่น่าสนใจต่อยอดจากเรื่องนี้"
  }
}`;

    const userPrompt = `[ประเภทข้อมูล]: ${sourceContext}
[ข้อความปัจจุบัน]:
${text}

[คลังความทรงจำเดิม (${existingMemories.length} รายการ)]:
${JSON.stringify(existingMemories.slice(-15).map((m) => ({ category: m.category, content: m.content, importance: m.importance, confidence: m.confidence, mentionCount: m.mentionCount, confirmedBy: m.confirmedBy })))}

[โปรไฟล์เดิม]:
Values: ${existingProfile.values.join(", ")}
Patterns: ${existingProfile.patterns.join(", ")}`;

    const model = settings?.aiModel || "gemini-2.5-flash";
    const raw = await callGeminiRestApi(apiKey, model, systemPrompt, userPrompt);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { memories: existingMemories, feedback: defaultFeedback };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const now = Date.now();

    // ── Consolidation Pipeline ──
    const updatedMemoriesList = [...existingMemories];

    const rawExtracted = parsed.memories || [];
    for (const rawItem of rawExtracted) {
      if (!rawItem.content) continue;

      const matchedExisting = multiTierDedupMatch(rawItem.content, rawItem.category, updatedMemoriesList);

      if (matchedExisting) {
        // MERGE / UPDATE EXISTING MEMORY
        matchedExisting.mentionCount = (matchedExisting.mentionCount || 1) + 1;
        matchedExisting.lastMentionedAt = now;

        if (!matchedExisting.confirmedBy) matchedExisting.confirmedBy = [matchedExisting.extractedFrom || sourceContext];
        if (!matchedExisting.confirmedBy.includes(sourceContext)) {
          matchedExisting.confirmedBy.push(sourceContext);
        }

        // Recalculate Confidence with CONFIDENCE_CONFIG
        matchedExisting.confidence = calculateConfidenceScore(
          matchedExisting.mentionCount,
          matchedExisting.lastMentionedAt,
          matchedExisting.confirmedBy
        );

        // Update Importance (take higher of existing vs newly assessed)
        matchedExisting.importance = Math.max(
          matchedExisting.importance || 0.5,
          typeof rawItem.importance === "number" ? rawItem.importance : 0.5
        );

        // Update status & change tracking
        const changeType = rawItem.changeType || "merged";
        matchedExisting.changeType = changeType;
        if (changeType === "conflict") matchedExisting.status = "conflicted";
        else if (changeType === "evolution") matchedExisting.status = "evolved";

        if (rawItem.changeNote) matchedExisting.changeNote = rawItem.changeNote;
      } else {
        // CREATE NEW MEMORY ITEM
        const initialSources = [sourceContext];
        const initialConfidence = calculateConfidenceScore(1, now, initialSources);

        const newMemory: MemoryItem = {
          id: "mem-" + now + "-" + Math.random().toString(36).slice(2, 7),
          category: rawItem.category as MemoryCategory,
          content: rawItem.content,
          extractedFrom: sourceContext,
          timestamp: now,
          confidence: Math.max(initialConfidence, rawItem.confidence || 0.7),
          importance: typeof rawItem.importance === "number" ? rawItem.importance : 0.5,
          mentionCount: 1,
          lastMentionedAt: now,
          confirmedBy: initialSources,
          status: rawItem.changeType === "temporary_state" ? "weakening" : "active",
          changeType: rawItem.changeType || "none",
          changeNote: rawItem.changeNote,
          pinned: false,
        };

        updatedMemoriesList.push(newMemory);
      }
    }

    const feedback: AILearningFeedback = {
      patternObservations: parsed.feedback?.patternObservations || [],
      evolutionShifts: parsed.feedback?.evolutionShifts || [],
      newDiscoveries: parsed.feedback?.newDiscoveries || [
        `AI ได้เรียนรู้เกี่ยวกับคุณเพิ่มขึ้นและปรับปรุงฐานข้อมูลเรียบร้อยแล้ว`,
      ],
      followupQuestion: parsed.feedback?.followupQuestion || undefined,
    };

    return { memories: updatedMemoriesList, feedback };
  } catch (err) {
    console.error("[learnFromText] error:", err);
    return { memories: existingMemories, feedback: defaultFeedback };
  }
}

/**
 * Backward compatibility wrapper for extractMemoryFromJournal
 */
export async function extractMemoryFromJournal(
  entry: JournalEntry,
  settings?: UserSettings
): Promise<MemoryItem[]> {
  const result = await learnFromText(
    entry.content,
    `Journal Entry (${entry.mode})`,
    [],
    {
      personality: { riskTaking: "medium", thinkingStyle: "balanced", motivation: "growth", workStyle: "systems" },
      values: [],
      patterns: [],
      coreStrengths: [],
      growthAreas: [],
      lastUpdated: Date.now(),
      updateCount: 0,
    },
    settings
  );
  return result.memories;
}

/**
 * Smart Question Generator for "สมองฉัน" (AI Self-Interview)
 * Mode A: Random life reflection questions
 * Mode B: Targeted follow-up / Gap questions based on user's existing knowledge & timeline
 */
export async function generateSmartQuestion(
  mode: "random" | "followup",
  existingMemories: MemoryItem[],
  existingProfile: UserProfileVector,
  settings?: UserSettings
): Promise<string> {
  const defaultRandomQuestions = [
    "อะไรคือค่านิยมหลักที่คุณจะยอมไม่เสียสละเด็ดขาด แม้เจอกับความท้าทาย?",
    "ถ้ามีโอกาสพูดกับตัวเองเมื่อ 5 ปีก่อน คุณอยากจะบอกอะไรกับเขาที่สุด?",
    "อะไรคือความกลัวที่ลึกที่สุดที่ยังคอยฉุดรั้งคุณอยู่ตอนนี้?",
    "เป้าหมายชีวิตชิ้นไหนที่คุณตั้งใจจะทำให้สำเร็จให้ได้ภายใน 3 ปีนี้?",
    "การตัดสินใจครั้งไหนในอดีตที่เปลี่ยนชีวิตคุณไปมากที่สุด และได้เรียนรู้อะไรจากมัน?",
    "รูปแบบการทำงานหรือสไตล์ชีวิตแบบไหนที่ทำให้คุณรู้สึกมีความสุขและมีพลังที่สุด?",
    "สิ่งไหนในชีวิตที่คุณรู้สึกขอบคุณมากที่สุดในตอนนี้?",
    "ถ้าชีวิตคุณสำเร็จตามความฝันแล้ว วันธรรมดาหนึ่งวันของคุณจะมีหน้าตาเป็นอย่างไร?"
  ];

  if (mode === "random" || !settings?.aiApiKey || existingMemories.length === 0) {
    const randomIndex = Math.floor(Math.random() * defaultRandomQuestions.length);
    return defaultRandomQuestions[randomIndex];
  }

  try {
    const apiKey = settings.aiApiKey.trim();
    const systemPrompt = `คุณคือ Personal Intelligence Engine สำหรับ My Life OS
หน้าที่ของคุณ: สร้างคำถามสัมภาษณ์เชิงลึก 1 ข้อ (ภาษาไทย) เพื่อช่วยให้ผู้ใช้ได้ทบทวนชีวิตและช่วยให้ AI เข้าใจมิติชีวิตของผู้ใช้ลึกซึ้งยิ่งขึ้น

แนวทาง:
- ใช้อ้างอิงจากข้อมูลความทรงจำเดิมที่มีอยู่ เพื่อถามเจาะลึกต่อ หรือถามว่าความคิดเปลี่ยนแปลงไปอย่างไรตามกาลเวลา
- ตั้งคำถามอย่างอบอุ่น ให้เกียรติ และกระตุ้นความคิดเชิงลึก (Self-Reflection)
- ตอบเฉพาะข้อความคำถาม 1 ประโยคเท่านั้น ห้ามมีคำเกริ่นอื่น`;

    const userPrompt = `ความทรงจำเดิมของผู้ใช้:
${JSON.stringify(existingMemories.slice(-10))}

ค่านิยมเดิม: ${existingProfile.values.join(", ")}
รูปแบบความคิด: ${existingProfile.personality.thinkingStyle}`;

    const model = settings?.aiModel || "gemini-2.5-flash";
    const question = await callGeminiRestApi(apiKey, model, systemPrompt, userPrompt);
    return question.trim() || defaultRandomQuestions[0];
  } catch {
    const randomIndex = Math.floor(Math.random() * defaultRandomQuestions.length);
    return defaultRandomQuestions[randomIndex];
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
 * Alias for updateProfileVector -> updateUserKnowledge
 */
export async function updateUserKnowledge(
  currentVector: UserProfileVector,
  recentMemories: MemoryItem[],
  recentCheckins: DailyCheckin[],
  settings?: UserSettings
): Promise<UserProfileVector | null> {
  return updateProfileVector(currentVector, recentMemories, recentCheckins, settings);
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


