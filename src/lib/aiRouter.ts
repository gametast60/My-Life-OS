import { APIProvider, BrainCard, LifeDimension, BrainType, LIFE_DIMENSIONS } from "../types";

// ── Free models for OpenRouter fallback ──────────────────────────
const OPENROUTER_FREE_MODELS = [
  "openrouter/free",
  "google/gemma-4-31b-it:free",
  "openai/gpt-oss-20b:free",
  "google/gemma-2-9b-it:free",
];

// ── Dimension keyword mapping for intent detection ────────────────
const DIMENSION_KEYWORDS: Record<LifeDimension, string[]> = {
  work:         ["งาน", "อาชีพ", "ทำงาน", "ธุรกิจ", "career", "job", "work", "business", "boss", "นาย", "ลูกน้อง", "โปรเจค", "project"],
  finance:      ["เงิน", "การเงิน", "รายได้", "รายจ่าย", "ลงทุน", "หุ้น", "trading", "trader", "finance", "money", "invest", "debt", "หนี้", "ออม", "save"],
  relationship: ["ความสัมพันธ์", "แฟน", "เพื่อน", "ครอบครัว", "relationship", "friend", "family", "love", "รัก", "คู่"],
  health:       ["สุขภาพ", "ออกกำลัง", "กิน", "นอน", "health", "exercise", "workout", "diet", "gym", "น้ำหนัก", "weight"],
  mindset:      ["ความคิด", "จิตใจ", "มุมมอง", "mindset", "attitude", "belief", "ความเชื่อ", "สติ", "meditation"],
  learning:     ["เรียน", "รู้", "ศึกษา", "หนังสือ", "learn", "study", "book", "course", "skill", "ทักษะ"],
  emotion:      ["อารมณ์", "รู้สึก", "เศร้า", "ดีใจ", "เครียด", "emotion", "feel", "stress", "anxiety", "กังวล", "happy", "sad"],
  goal:         ["เป้าหมาย", "ฝัน", "อยากได้", "goal", "dream", "target", "plan", "แผน", "อนาคต", "future"],
  lifestyle:    ["ชีวิต", "วันนี้", "routine", "กิจวัตร", "lifestyle", "daily", "ที่พัก", "บ้าน", "home", "travel", "ท่องเที่ยว"],
  values:       ["คุณค่า", "ความเชื่อ", "ศาสนา", "หลักการ", "value", "principle", "ethics", "moral", "จริยธรรม"],
  hobby:        ["งานอดิเรก", "สนุก", "ชอบ", "hobby", "fun", "interest", "passion", "เพลง", "music", "ศิลปะ", "art"],
  identity:     ["ตัวตน", "ฉัน", "ตัวเอง", "identity", "who am i", "ฉันคือ", "ฉันเป็น", "character", "บุคลิก"],
};

// ── Provider call functions ───────────────────────────────────────

async function callGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const activeModel = model?.trim() || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = body?.error?.message || `HTTP ${response.status}`;
    // Detect quota errors
    if (response.status === 429 || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error(`QUOTA: ${msg}`);
    }
    throw new Error(msg);
  }

  const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

async function callGroq(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const activeModel = model?.trim() || "llama-3.3-70b-versatile";
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: activeModel,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2048,
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = body?.error?.message || `HTTP ${response.status}`;
    if (response.status === 429) throw new Error(`QUOTA: ${msg}`);
    throw new Error(msg);
  }

  const text = body?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from Groq");
  return text;
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  freeModelIndex = 0
): Promise<string> {
  const modelClean = model?.trim() || "";
  const activeModel =
    freeModelIndex > 0
      ? OPENROUTER_FREE_MODELS[freeModelIndex % OPENROUTER_FREE_MODELS.length]
      : (!modelClean || modelClean === "auto-free" ? "openrouter/free" : modelClean);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: activeModel,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: userPrompt },
      ],
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = body?.error?.message || `HTTP ${response.status}`;
    if (response.status === 429) throw new Error(`QUOTA: ${msg}`);
    // Try next free model if first model attempt fails
    if (freeModelIndex < OPENROUTER_FREE_MODELS.length - 1) {
      console.warn(`[AIRouter] OpenRouter model ${activeModel} failed (${msg}), trying backup free model...`);
      return callOpenRouter(apiKey, model, systemPrompt, userPrompt, freeModelIndex + 1);
    }
    throw new Error(msg);
  }

  const text = body?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from OpenRouter");
  return text;
}

// ── AI Router ─────────────────────────────────────────────────────

export class AIRouter {
  /**
   * Main entry point — calls providers in priority order with failover.
   * All AI calls must go through this method.
   */
  static async call(
    providers: APIProvider[],
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    const active = providers
      .filter((p) => p.enabled && p.apiKey?.trim())
      .sort((a, b) => a.priority - b.priority);

    if (active.length === 0) {
      throw new Error("ยังไม่ได้ตั้งค่า AI Provider กรุณาเพิ่ม API Key ในหน้า Manage AI");
    }

    let lastError: Error = new Error("No providers available");

    for (const provider of active) {
      try {
        let result: string;

        switch (provider.name) {
          case "Gemini":
            result = await callGemini(provider.apiKey, provider.model, systemPrompt, userPrompt);
            break;
          case "Groq":
            result = await callGroq(provider.apiKey, provider.model, systemPrompt, userPrompt);
            break;
          case "OpenRouter":
            result = await callOpenRouter(provider.apiKey, provider.model, systemPrompt, userPrompt);
            break;
          default:
            throw new Error(`Unknown provider: ${provider.name}`);
        }

        // Update provider status
        provider.status = "ok";
        provider.lastUsedAt = Date.now();
        return result;
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || "";
        if (msg.startsWith("QUOTA:")) {
          provider.status = "quota";
          console.warn(`[AIRouter] ${provider.name} quota exhausted, trying next provider...`);
        } else {
          provider.status = "error";
          console.warn(`[AIRouter] ${provider.name} failed: ${msg}, trying next provider...`);
        }
      }
    }

    throw lastError;
  }

  /**
   * Detect which Life Dimensions are relevant to the given text.
   * Returns top 3 dimensions based on keyword frequency.
   */
  static detectDimensions(text: string): LifeDimension[] {
    const lowerText = text.toLowerCase();
    const scores: Record<string, number> = {};

    for (const [dim, keywords] of Object.entries(DIMENSION_KEYWORDS)) {
      scores[dim] = keywords.filter((kw) => lowerText.includes(kw)).length;
    }

    return Object.entries(scores)
      .filter(([, score]) => score > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([dim]) => dim as LifeDimension);
  }

  /**
   * Filter Brain Cards by dimension(s) and optional brain type(s).
   * Returns up to `limit` most recently updated cards.
   */
  static filterBrainCards(
    cards: BrainCard[],
    dimensions: LifeDimension[],
    brainTypes?: BrainType[],
    limit = 10
  ): BrainCard[] {
    if (dimensions.length === 0 && !brainTypes?.length) {
      // No filter — return most recent
      return [...cards].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
    }

    return cards
      .filter((card) => {
        const dimMatch = dimensions.length === 0 || dimensions.includes(card.dimension);
        const typeMatch = !brainTypes?.length || brainTypes.includes(card.brainType);
        return dimMatch && typeMatch;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  }

  /**
   * Build a compact, token-efficient context block from Brain Cards.
   * Format: Type|Dimension: Title — Description #tag1 #tag2
   */
  static buildContextBlock(cards: BrainCard[]): string {
    if (cards.length === 0) return "";

    const lines = cards.map((card) => {
      const dim = LIFE_DIMENSIONS.find((d) => d.id === card.dimension);
      const tags = card.tags.map((t) => `#${t}`).join(" ");
      const desc = card.description ? ` — ${card.description}` : "";
      return `${card.brainType}|${dim?.label ?? card.dimension}: ${card.title}${desc} ${tags}`.trim();
    });

    return `[BRAIN]\n${lines.join("\n")}\n[/BRAIN]`;
  }

  /**
   * Build a full AI request with Brain context automatically retrieved
   * based on the user's message.
   */
  static buildContextualPrompt(
    userMessage: string,
    allCards: BrainCard[],
    extraContext?: string
  ): string {
    const dims = this.detectDimensions(userMessage);
    const relevantCards = this.filterBrainCards(allCards, dims);
    const contextBlock = this.buildContextBlock(relevantCards);

    const parts: string[] = [];
    if (contextBlock) parts.push(contextBlock);
    if (extraContext) parts.push(extraContext);
    parts.push(`[ข้อความ]: ${userMessage}`);

    return parts.join("\n\n");
  }

  /**
   * Test connection to a single provider.
   */
  static async testProvider(provider: APIProvider): Promise<{ success: boolean; message: string }> {
    try {
      await this.call([{ ...provider, priority: 1 }], "", "Respond with the single word CONNECTED");
      return { success: true, message: `✅ ${provider.name} เชื่อมต่อสำเร็จ` };
    } catch (err: any) {
      return { success: false, message: `❌ ${provider.name}: ${err.message}` };
    }
  }
}
