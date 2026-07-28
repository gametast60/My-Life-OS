import {
  AIMode,
  APIProvider,
  BrainCard,
  DailyCheckin,
  GoalItem,
  GuideResult,
  HabitItem,
  JournalEntry,
  UserSettings,
  BrainTreeType,
  BrainTreeDimension,
  BrainTreeTag,
} from "../types";
import { AIRouter } from "./aiRouter";
import {
  PlacementCandidate,
  findPlacementCandidatesByKeyword,
} from "./brainTree/brainTreeService";

// ── Helper: get providers from settings (with legacy fallback) ────
export function getProviders(settings: UserSettings): APIProvider[] {
  // If multi-provider list exists, use it
  if (settings.apiProviders && settings.apiProviders.length > 0) {
    return settings.apiProviders;
  }
  // Legacy fallback: wrap single aiApiKey as Gemini provider
  if (settings.aiApiKey?.trim()) {
    return [
      {
        id: "legacy-gemini",
        name: "Gemini",
        apiKey: settings.aiApiKey,
        model: settings.aiModel || "gemini-2.5-flash",
        enabled: true,
        priority: 1,
      },
    ];
  }
  return [];
}

// ── Mode System Prompts ───────────────────────────────────────────
const MODE_PROMPTS: Record<AIMode, string> = {
  Coach: `คุณคือ AI Life Coach สำหรับ My Life OS ช่วยผู้ใช้พัฒนาชีวิต ตั้งเป้าหมาย และวางแผนการเติบโต
ใช้ข้อมูลจาก Life Brain ของผู้ใช้เพื่อให้คำแนะนำที่ตรงจุดและเป็นส่วนตัว
ตอบภาษาไทย เป็นธรรมชาติ กระตุ้นและให้กำลังใจ`,

  Therapist: `คุณคือ AI Therapist ที่เน้น CBT และจิตวิทยาเชิงบวก
ช่วยผู้ใช้วิเคราะห์ความรู้สึก เปลี่ยน Negative Thought Pattern และรักษาสุขภาพจิต
ใช้ข้อมูลจาก Life Brain เพื่อเข้าใจบริบทชีวิตผู้ใช้
ตอบภาษาไทย เป็นมิตร อบอุ่น ไม่ตัดสิน`,

  Decision: `คุณคือ AI Decision Coach ช่วยผู้ใช้วิเคราะห์ทางเลือกอย่างเป็นระบบ
ใช้ Pros/Cons, Second-Order Effects และ Value Alignment
ใช้ข้อมูลจาก Life Brain เพื่อเชื่อมโยงกับคุณค่าและเป้าหมายของผู้ใช้
ตอบภาษาไทย ชัดเจน มีโครงสร้าง`,

  "Future Self": `คุณคือตัวตนของผู้ใช้ในอีก 5 ปีข้างหน้า ที่ประสบความสำเร็จตามเป้าหมาย
พูดจากมุมมองนั้นด้วยความเป็นห่วง ปัญญา และความเฉพาะเจาะจง
ใช้ข้อมูลจาก Life Brain เพื่อ reference เป้าหมายและความฝันที่แท้จริง
ตอบภาษาไทย ลึกซึ้ง มีพลัง`,

  Secretary: `คุณคือ AI Secretary ผู้ช่วยส่วนตัวของผู้ใช้
ช่วยจัดการ Task, Checklist, Reminder, การวางแผน, จัดลำดับความสำคัญ, ติดตามงาน และสรุปงาน
ใช้ข้อมูลจาก Life Brain เพื่อเข้าใจบริบทงานและเป้าหมาย
ตอบภาษาไทย กระชับ เป็นระเบียบ action-oriented`,

  Reflection: `คุณคือ AI Reflection Guide ช่วยผู้ใช้ทบทวนและสรุปบทเรียนชีวิต
วิเคราะห์ Journal ที่ได้รับ สรุป Highlights, Patterns, Growth และ Actionable Insights
ใช้ข้อมูลจาก Life Brain เพื่อเชื่อมโยงกับเป้าหมายระยะยาว
ตอบภาษาไทย ลึกซึ้ง สร้างแรงบันดาลใจ`,

  Chat: `คุณคือ AI Assistant ของ My Life OS
ช่วยผู้ใช้ด้านการพัฒนาตนเองและชีวิตประจำวัน ใช้ข้อมูลจาก Life Brain เพื่อเข้าใจผู้ใช้
ตอบภาษาไทย เป็นธรรมชาติ เป็นกันเอง`,
};

// ── sendAIChatRequest ─────────────────────────────────────────────
export interface AIChatOptions {
  prompt: string;
  mode?: AIMode;
  brainCards?: BrainCard[];
  recentJournals?: Pick<JournalEntry, "title" | "mood" | "content" | "date">[];
  settings?: UserSettings;
}

export async function sendAIChatRequest({
  prompt,
  mode = "Chat",
  brainCards = [],
  recentJournals = [],
  settings,
}: AIChatOptions): Promise<string> {
  const providers = getProviders(settings!);

  if (providers.length === 0) {
    return `⚠️ ยังไม่ได้ตั้งค่า AI Provider\n\nกรุณาไปที่ 🔑 Manage AI เพื่อเพิ่ม API Key\n\nรับ Gemini API Key ฟรีได้ที่: https://aistudio.google.com/app/apikey`;
  }

  try {
    const systemPrompt = MODE_PROMPTS[mode];
    const contextualPrompt = AIRouter.buildContextualPrompt(
      prompt,
      brainCards,
      recentJournals.length > 0
        ? `[Journal ล่าสุด]: ${recentJournals
            .slice(0, 3)
            .map((j) => `${j.date} (${j.mood}): ${j.content.slice(0, 80)}`)
            .join("\n")}`
        : undefined
    );
    return await AIRouter.call(providers, systemPrompt, contextualPrompt);
  } catch (err: any) {
    console.error("[sendAIChatRequest] error:", err);
    if (mode === "Therapist") {
      return `[ไม่สามารถเชื่อมต่อ AI ได้] ${err.message}\n\n[โหมดออฟไลน์] ลองหายใจเข้าลึกๆ และเขียนสิ่งที่ติดอยู่ในใจลงใน Journal ก่อนนะครับ`;
    }
    return `[ไม่สามารถเชื่อมต่อ AI ได้] ${err.message}\n\nกรุณาตรวจสอบ API Key ใน Manage AI ครับ`;
  }
}

// ── generateGreeting ──────────────────────────────────────────────
export async function generateGreeting(
  context: {
    userName: string;
    brainCards: BrainCard[];
    recentJournals: Pick<JournalEntry, "title" | "mood" | "content" | "date">[];
  },
  settings?: UserSettings
): Promise<string> {
  const providers = getProviders(settings!);
  if (providers.length === 0) {
    return `สวัสดี ${context.userName} 👋 วันนี้อยากคุยเรื่องอะไรครับ?`;
  }

  try {
    const systemPrompt = `คุณคือ AI Life Coach ของ My Life OS
สร้างข้อความทักทายที่เป็นส่วนตัว 2-3 ประโยค อ้างอิงเป้าหมาย/ความฝันของผู้ใช้จาก Life Brain
วันที่วันนี้: ${new Date().toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
ตอบภาษาไทย เป็นธรรมชาติ ไม่ทางการเกินไป`;

    const dims = AIRouter.detectDimensions(context.recentJournals.map((j) => j.content).join(" "));
    const relevantCards = AIRouter.filterBrainCards(context.brainCards, dims, undefined, 6);
    const contextBlock = AIRouter.buildContextBlock(relevantCards);

    const userPrompt = `ผู้ใช้: ${context.userName}
${contextBlock}
Journal ล่าสุด: ${context.recentJournals
      .slice(0, 3)
      .map((j) => `${j.date} (${j.mood}): ${j.content.slice(0, 60)}`)
      .join("\n")}`;

    return await AIRouter.call(providers, systemPrompt, userPrompt);
  } catch {
    return `สวัสดี ${context.userName} 👋 วันนี้อยากคุยเรื่องอะไรครับ?`;
  }
}

// ── summarizeDailyCheckin ─────────────────────────────────────────
export async function summarizeDailyCheckin(
  checkin: Omit<DailyCheckin, "id" | "aiSummary">,
  settings?: UserSettings
): Promise<string> {
  const providers = getProviders(settings!);
  if (providers.length === 0) return "วันนี้คุณสำรวจตัวเองอย่างมีสติ — นั่นคือก้าวแรกของการเติบโต";

  try {
    const systemPrompt = `คุณคือ Daily Reflection AI สรุปคำตอบ Check-in รายวันเป็น Insight 2-3 ประโยค
กระชับ อบอุ่น สร้างแรงบันดาลใจ ชี้ให้เห็น Pattern ที่ผู้ใช้อาจมองข้าม ตอบภาษาไทย`;

    const userPrompt = `Mood: ${checkin.mood}
วันนี้อะไรดี: ${checkin.answers.wentWell}
วันนี้อะไรยาก: ${checkin.answers.challenge}
วันนี้เรียนรู้อะไร: ${checkin.answers.learned}
วันนี้ขอบคุณอะไร: ${checkin.answers.grateful}
พรุ่งนี้จะปรับอะไร: ${checkin.answers.tomorrow}`;

    return await AIRouter.call(providers, systemPrompt, userPrompt);
  } catch {
    return "วันนี้คุณสำรวจตัวเองอย่างมีสติ — นั่นคือก้าวแรกของการเติบโต";
  }
}

// ── analyzeTodayJournals ──────────────────────────────────────────
export async function analyzeTodayJournals(
  todayJournals: JournalEntry[],
  brainCards: BrainCard[],
  settings?: UserSettings
): Promise<string> {
  const providers = getProviders(settings!);
  if (providers.length === 0) return "กรุณาตั้งค่า AI Provider ก่อนใช้ฟีเจอร์นี้";
  if (todayJournals.length === 0) return "วันนี้ยังไม่มี Journal ที่บันทึกไว้ลองเขียนสักอย่างก่อนนะครับ 📝";

  try {
    const systemPrompt = `คุณคือ AI Reflection Coach
วิเคราะห์ Journal วันนี้และให้ผลลัพธ์ 4 ส่วน:
1. 🌟 Highlights — สิ่งที่โดดเด่นที่สุดวันนี้
2. 🔍 Patterns — รูปแบบหรือแนวโน้มที่สังเกตได้
3. 💭 Reflection — บทสรุปและความหมายของวันนี้
4. 🎯 Tomorrow — 1-2 สิ่งที่ควรทำพรุ่งนี้

ไม่ต้องสร้างหรือแนะนำให้บันทึกข้อมูลลง Brain
ตอบภาษาไทย กระชับ ลึกซึ้ง`;

    const journalText = todayJournals
      .map((j) => `[${j.mode}] ${j.title}: ${j.content.slice(0, 200)}`)
      .join("\n\n");

    // Get relevant brain context
    const dims = AIRouter.detectDimensions(journalText);
    const relevantCards = AIRouter.filterBrainCards(brainCards, dims, undefined, 5);
    const contextBlock = AIRouter.buildContextBlock(relevantCards);

    const userPrompt = `${contextBlock ? contextBlock + "\n\n" : ""}[Journal วันนี้]:\n${journalText}`;

    return await AIRouter.call(providers, systemPrompt, userPrompt);
  } catch (err: any) {
    return `[ไม่สามารถวิเคราะห์ได้] ${err.message}`;
  }
}

// ── suggestBrainCard ──────────────────────────────────────────────
export async function suggestBrainCard(
  text: string,
  existingCards: BrainCard[],
  settings?: UserSettings
): Promise<Partial<BrainCard> | null> {
  const providers = getProviders(settings!);
  if (providers.length === 0 || !text.trim()) return null;

  try {
    const systemPrompt = `คุณคือ AI Brain Scout ที่ช่วยระบุข้อมูลสำคัญเกี่ยวกับผู้ใช้
วิเคราะห์ข้อความว่ามีข้อมูลสำคัญควรบันทึกลง Life Brain หรือไม่
ถ้าพบ ตอบ JSON เท่านั้น (ไม่มีข้อความอื่น):
{
  "found": true,
  "title": "ชื่อข้อมูลสั้นๆ",
  "description": "รายละเอียดเพิ่มเติม",
  "dimension": "work|finance|relationship|health|mindset|learning|emotion|goal|lifestyle|values|hobby|identity",
  "brainType": "Goal|Habit|Knowledge|Belief|Identity|Preference|Skill|Strength|Weakness|Decision|Relationship",
  "tags": ["tag1", "tag2"]
}
ถ้าไม่พบ ตอบ: {"found": false}

สำคัญ: พบเฉพาะข้อมูลที่มีความสำคัญต่อชีวิตหรือเป้าหมายของผู้ใช้เท่านั้น ไม่ใช่ทุกประโยค`;

    const existingTitles = existingCards.map((c) => c.title).join(", ");
    const userPrompt = `[ข้อความ]: ${text.slice(0, 500)}
[Brain ที่มีอยู่แล้ว]: ${existingTitles.slice(0, 200) || "ยังไม่มี"}`;

    const raw = await AIRouter.call(providers, systemPrompt, userPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.found || !parsed.title) return null;

    // Don't suggest if very similar card already exists
    const alreadyExists = existingCards.some(
      (c) => c.title.toLowerCase() === parsed.title.toLowerCase()
    );
    if (alreadyExists) return null;

    return {
      title: parsed.title,
      description: parsed.description || "",
      dimension: parsed.dimension || "goal",
      brainType: parsed.brainType || "Knowledge",
      tags: parsed.tags || [],
      linkedJournalIds: [],
    };
  } catch {
    return null;
  }
}

// ── generateGuide (GPS ชีวิต) ─────────────────────────────────────
export async function generateGuide(
  brainCards: BrainCard[],
  goals: GoalItem[],
  habits: HabitItem[],
  settings?: UserSettings
): Promise<GuideResult> {
  const defaultResult: GuideResult = {
    currentState: "กำลังรวบรวมข้อมูล...",
    mainGoal: "ยังไม่ได้ตั้งเป้าหมาย",
    gap: "เริ่มเพิ่ม Brain Cards เพื่อให้ AI เข้าใจคุณมากขึ้น",
    nextMission: "เพิ่ม Brain Card อย่างน้อย 3 รายการ",
    recommendedHabits: [],
    checklist: [],
  };

  const providers = getProviders(settings!);
  if (providers.length === 0 || brainCards.length === 0) return defaultResult;

  try {
    const systemPrompt = `คุณคือ Life GPS AI วิเคราะห์สถานะปัจจุบันและให้ทิศทางชัดเจน
ตอบ JSON เท่านั้น:
{
  "currentState": "สรุปสถานะปัจจุบันของผู้ใช้",
  "mainGoal": "เป้าหมายหลักที่สำคัญที่สุด",
  "gap": "ช่องว่างระหว่างสถานะปัจจุบันกับเป้าหมาย",
  "nextMission": "Mission ถัดไปที่ควรทำ (action-oriented)",
  "recommendedHabits": ["Habit 1", "Habit 2", "Habit 3"],
  "checklist": ["งาน 1", "งาน 2", "งาน 3"]
}`;

    const contextBlock = AIRouter.buildContextBlock(brainCards.slice(0, 15));
    const activeGoals = goals
      .filter((g) => !g.completed && !g.archived)
      .slice(0, 5)
      .map((g) => `${g.title} (${g.progressPercent}%)`);
    const activeHabits = habits
      .slice(0, 5)
      .map((h) => `${h.title} (streak: ${h.currentStreak})`);

    const userPrompt = `${contextBlock}
Goals: ${activeGoals.join(", ") || "ยังไม่มี"}
Habits: ${activeHabits.join(", ") || "ยังไม่มี"}`;

    const raw = await AIRouter.call(providers, systemPrompt, userPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return defaultResult;

    return { ...defaultResult, ...JSON.parse(jsonMatch[0]) };
  } catch {
    return defaultResult;
  }
}

// ── testProviderConnection ────────────────────────────────────────
export async function testProviderConnection(
  provider: APIProvider
): Promise<{ success: boolean; message: string }> {
  return AIRouter.testProvider(provider);
}

// ── Legacy compatibility: testAIConnection ────────────────────────
export async function testAIConnection(
  apiKey: string,
  model = "gemini-2.5-flash"
): Promise<{ success: boolean; message: string }> {
  return testProviderConnection({
    id: "test",
    name: "Gemini",
    apiKey,
    model,
    enabled: true,
    priority: 1,
  });
}

// ─────────────────────────────────────────────────────────────────────
// Brain Tree Engine V1 — AI Journal Placement Suggestion
// ─────────────────────────────────────────────────────────────────────

export interface AIBrainPlacementSuggestion {
  candidates: PlacementCandidate[];
  missingNodeProposals: {
    typeName: string;
    dimensionName: string;
    tagName: string;
    reasoning: string;
  }[];
  usedFallback: boolean;
}

/**
 * Given a journal content + existing Brain Tree (Type[] + Dimension[] + Tag[]),
 * ask AI to suggest WHERE in the tree the journal should be "hung" as Evidence.
 *
 * AI returns:
 *  - candidate placements (Type → Dimension → Tag) from the EXISTING tree
 *  - proposals for NEW nodes if no existing node is a good match
 *
 * If AI fails → keyword fallback. If no keyword matches → empty candidates.
 */
export async function suggestJournalBrainPlacement(params: {
  title?: string;
  content: string;
  allTypes: BrainTreeType[];
  allDimensions: BrainTreeDimension[];
  allTags: BrainTreeTag[];
  settings?: UserSettings;
}): Promise<AIBrainPlacementSuggestion> {
  const { title = "", content, allTypes, allDimensions, allTags, settings } = params;
  const providers = getProviders(settings!);
  const fallbackCandidates = findPlacementCandidatesByKeyword(
    `${title} ${content}`,
    4,
    1
  );

  // Build a compact tree structure for the AI prompt — names + ids only, not too long
  const treeSummary: Record<string, Record<string, string[]>> = {};
  for (const t of allTypes) {
    const dimMap: Record<string, string[]> = {};
    const underT = allDimensions.filter((d) => d.brainTreeTypeId === t.id);
    for (const d of underT) {
      const tagNames = allTags
        .filter((tag) => tag.brainTreeDimensionId === d.id)
        .map((tag) => tag.name)
        .slice(0, 30);
      if (tagNames.length > 0) dimMap[d.name] = tagNames;
    }
    if (Object.keys(dimMap).length > 0) treeSummary[t.name] = dimMap;
  }

  const emptyResult: AIBrainPlacementSuggestion = {
    candidates: fallbackCandidates,
    missingNodeProposals: [],
    usedFallback: true,
  };

  if (providers.length === 0 || !content.trim() || allTags.length === 0) {
    return emptyResult;
  }

  try {
    const systemPrompt = `You are Brain Tree Scout AI for My Life OS.
Your job: analyze a user's journal entry and decide WHERE on their knowledge tree it should hang as Evidence.

The knowledge tree hierarchy is:
  Brain Type (like Goal, Habit, Knowledge, Belief, Identity, Skill, Memory, Fear, Idea, Principle, Vision)
    → Brain Dimension (category, e.g., Finance / Health / Learning / Career / Relationship)
      → Tag (specific topic, e.g., Korean / English / Flutter / React / Trading / DCA)

Given the EXISTING tree below and a journal entry, output a compact JSON response:

{
  "candidates": [
    {
      "typeName": "Goal",
      "dimensionName": "Learning",
      "tagName": "Korean",
      "confidencePct": 92
    }
  ],
  "missingNodes": [
    {
      "typeName": "Skill",
      "dimensionName": "Programming",
      "tagName": "Flutter",
      "reasoning": "Journal talks about starting to learn Flutter but no Flutter tag exists under any dimension."
    }
  ]
}

Rules:
- Only return existing typeName/dimensionName/tagName that EXIST in the provided tree.
- Prefer top 3-4 best candidates.
- If no existing nodes fit well, propose missing nodes in missingNodes.
- Confidence % for candidates is required.
- If nothing fits at all, return {"candidates":[],"missingNodes":[]}.
- Respond with ONLY JSON. No other text.`;

    const userPrompt = `[JOURNAL]:
Title: ${title || "(untitled)"}
Content: ${content.slice(0, 800)}

[EXISTING BRAIN TREE (Type → Dimension → [Tags])]:
${JSON.stringify(treeSummary, null, 2).slice(0, 3500)}`;

    const raw = await AIRouter.call(providers, systemPrompt, userPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return emptyResult;
    const parsed = JSON.parse(jsonMatch[0]);

    const nameToType = new Map<string, BrainTreeType>();
    allTypes.forEach((t) => nameToType.set(t.name.toLowerCase(), t));
    const dimsByTypeId = new Map<string, BrainTreeDimension[]>();
    allDimensions.forEach((d) => {
      const arr = dimsByTypeId.get(d.brainTreeTypeId) ?? [];
      arr.push(d);
      dimsByTypeId.set(d.brainTreeTypeId, arr);
    });
    const tagsByDimId = new Map<string, BrainTreeTag[]>();
    allTags.forEach((t) => {
      const arr = tagsByDimId.get(t.brainTreeDimensionId) ?? [];
      arr.push(t);
      tagsByDimId.set(t.brainTreeDimensionId, arr);
    });

    const resolvedCandidates: PlacementCandidate[] = [];
    const minConfidence = 55;
    if (Array.isArray(parsed.candidates)) {
      for (const c of parsed.candidates) {
        if (!c.typeName || !c.dimensionName || !c.tagName) continue;
        const confidence = Number(c.confidencePct) ?? 0;
        if (confidence < minConfidence) continue;
        const type = nameToType.get(String(c.typeName).toLowerCase());
        if (!type) continue;
        const dim = (dimsByTypeId.get(type.id) ?? []).find(
          (d) => d.name.toLowerCase() === String(c.dimensionName).toLowerCase()
        );
        if (!dim) continue;
        const tag = (tagsByDimId.get(dim.id) ?? []).find(
          (t) => t.name.toLowerCase() === String(c.tagName).toLowerCase()
        );
        if (!tag) continue;
        resolvedCandidates.push({
          type,
          dimension: dim,
          tag,
          score: confidence,
        });
      }
    }
    resolvedCandidates.sort((a, b) => b.score - a.score);

    const missingNodeProposals: AIBrainPlacementSuggestion["missingNodeProposals"] = [];
    if (Array.isArray(parsed.missingNodes)) {
      for (const m of parsed.missingNodes) {
        if (!m.typeName || !m.dimensionName || !m.tagName) continue;
        missingNodeProposals.push({
          typeName: String(m.typeName),
          dimensionName: String(m.dimensionName),
          tagName: String(m.tagName),
          reasoning: String(m.reasoning || ""),
        });
      }
    }

    // Merge with keyword fallback to ensure at least something is returned
    const finalCandidates =
      resolvedCandidates.length > 0 ? resolvedCandidates.slice(0, 4) : fallbackCandidates;

    return {
      candidates: finalCandidates,
      missingNodeProposals,
      usedFallback: finalCandidates === fallbackCandidates && fallbackCandidates.length > 0,
    };
  } catch (err) {
    console.error("[suggestJournalBrainPlacement] error:", err);
    return {
      candidates: fallbackCandidates,
      missingNodeProposals: [],
      usedFallback: true,
    };
  }
}
