import type { IntentResult, MessageType, PipelineContext } from "../types";
import type { LifeDimension, BrainType, AIMode } from "../../types";

const DIMENSION_KEYWORDS: Record<LifeDimension, string[]> = {
  work: ["งาน", "อาชีพ", "ทำงาน", "ธุรกิจ", "career", "job", "work", "business", "boss", "นาย", "ลูกน้อง", "โปรเจค", "project", "office", "ทีม", "team", "บริษัท", "company"],
  finance: ["เงิน", "การเงิน", "รายได้", "รายจ่าย", "ลงทุน", "หุ้น", "trading", "trader", "finance", "money", "invest", "debt", "หนี้", "ออม", "save", "บัญชี", "account", "budget", "งบประมาณ", "ดอลลาร์", "บาท", "crypto", "คริปโต"],
  relationship: ["ความสัมพันธ์", "แฟน", "เพื่อน", "ครอบครัว", "relationship", "friend", "family", "love", "รัก", "คู่", "partner", "date", "เดท", "พ่อแม่", "พี่น้อง", "คนรัก", "เพื่อนสนิท", "แยกกัน", "ทะเลาะกัน"],
  health: ["สุขภาพ", "ออกกำลัง", "กิน", "นอน", "health", "exercise", "workout", "diet", "gym", "น้ำหนัก", "weight", "อาหาร", "ผอม", "อ้วน", "การวิ่ง", "โยคะ", "yoga", "น้ำ", "water", "sleep", "การนอน"],
  mindset: ["ความคิด", "จิตใจ", "มุมมอง", "mindset", "attitude", "belief", "ความเชื่อ", "สติ", "meditation", "จิตวิทยา", "psychology", "ความกดดัน", "stress", "วิตกกังวล", "anxiety", "ตัดสินใจ", "decision"],
  learning: ["เรียน", "รู้", "ศึกษา", "หนังสือ", "learn", "study", "book", "course", "skill", "ทักษะ", "ภาษา", "language", "อังกฤษ", "english", "เกาหลี", "korean", "programming", "โปรแกรม", "code", "โค้ด"],
  emotion: ["อารมณ์", "รู้สึก", "เศร้า", "ดีใจ", "เครียด", "emotion", "feel", "stress", "anxiety", "กังวล", "happy", "sad", "โกรธ", "angry", "มีความสุข", "depress", "เศร้าใจ", "ตกใจ", "หวัง", "ความหวัง"],
  goal: ["เป้าหมาย", "ฝัน", "อยากได้", "goal", "dream", "target", "plan", "แผน", "อนาคต", "future", "วางแผน", "บรรลุ", "achieve", "success", "สำเร็จ", "ปณิธาน", "vision", "วิสัยทัศน์"],
  lifestyle: ["ชีวิต", "วันนี้", "routine", "กิจวัตร", "lifestyle", "daily", "ที่พัก", "บ้าน", "home", "travel", "ท่องเที่ยว", "vacation", "วันหยุด", "ท่องเที่ยว", "trip", "hobby", "งานอดิเรก", "ชีวิตประจำวัน"],
  values: ["คุณค่า", "ความเชื่อ", "ศาสนา", "หลักการ", "value", "principle", "ethics", "moral", "จริยธรรม", "ศรัทธา", "faith", "honesty", "ความซื่อสัตย์", "ความรับผิดชอบ", "responsibility"],
  hobby: ["งานอดิเรก", "สนุก", "ชอบ", "hobby", "fun", "interest", "passion", "เพลง", "music", "ศิลปะ", "art", "เล่นเกม", "game", "วาดรูป", "ถ่ายรูป", "ดูหนัง", "movie", "อ่านหนังสือ"],
  identity: ["ตัวตน", "ฉัน", "ตัวเอง", "identity", "who am i", "ฉันคือ", "ฉันเป็น", "character", "บุคลิก", "personality", "คุณค่าของตัวเอง", "self-worth", "ความมั่นใจ", "confidence", "เชื่อในตัวเอง"],
};

const BRAIN_TYPE_KEYWORDS: Record<BrainType, string[]> = {
  Goal: ["เป้าหมาย", "goal", "target", "ตั้งเป้า", "บรรลุ", "achieve", "dream", "ฝัน", "อยากทำ", "วางแผนจะ", "plan"],
  Habit: ["นิสัย", "habit", "routine", "ทุกวัน", "everyday", "ฝึก", "practice", "กระบวนการ", "ต่อเนื่อง", "streak", "แผนการ"],
  Knowledge: ["รู้", "know", "knowledge", "เรียนรู้", "learn", "สิ่งที่รู้", "fact", "ข้อเท็จจริง", "สอน", "teach", "information", "ข้อมูล"],
  Belief: ["เชื่อว่า", "belief", "คิดว่า", "เห็นว่า", "ความเชื่อ", "ผมว่า", "ฉันว่า", "มองว่า", "ทัศนคติ", "attitude", "principle", "หลักการ"],
  Identity: ["ตัวตน", "identity", "ฉันคือ", "ผมคือ", "I am", "personality", "บุคลิก", "character", "คุณสมบัติ", "trait", "who am i"],
  Preference: ["ชอบ", "like", "prefer", "มักจะ", "usually", "ถูกชอบ", "favorite", "โปรด", "ดีกว่า", "better", "more than"],
  Skill: ["skill", "ทักษะ", "สามารถ", "can", "ability", "เก่ง", "good at", "expert", "เชี่ยวชาญ", "master", "ฝึกฝน", "ได้เรียนรู้"],
  Strength: ["strength", "จุดแข็ง", "เก่งเรื่อง", "ทำได้ดี", "advantage", "ข้อได้เปรียบ", "talent", "พรสวรรค์", "ความสามารถพิเศษ"],
  Weakness: ["weakness", "จุดอ่อน", "ไม่เก่ง", "แย่", "bad at", "fear", "กลัว", "ปัญหา", "problem", "disadvantage", "ข้อเสียเปรียบ"],
  Decision: ["ตัดสินใจ", "decision", "เลือก", "choose", "ต้องตัดสินใจ", "ทางเลือก", "option", "pros", "cons", "ควรทำอะไร", "what should"],
  Relationship: ["ความสัมพันธ์", "relationship", "คน", "เพื่อน", "ครอบครัว", "แฟน", "partner", "family", "friend", "การสื่อสาร", "communication"],
};

const QUESTION_WORDS = ["อะไร", "ไหน", "ใคร", "เมื่อไหร่", "ทำไม", "ยังไง", "หรือไม่", "ไหม", "มั้ย", "?", "？", "what", "why", "how", "when", "where", "who", "can you", "could you", "would you"];
const COMMAND_WORDS = ["ช่วย", "ให้", "จง", "กรุณา", "please", "ทำ", "สร้าง", "เขียน", "แปล", "เตือน", "บอก", "แสดง", "ให้ฉัน", "give me", "create", "write", "translate", "help", "plan", "แผน"];
const REFLECTION_WORDS = ["รู้สึก", "คิดถึง", "ทบทวน", "reflect", "think about", "วันนี้", "ชีวิต", "ตัวเอง", "myself", "เมื่อก่อน", "the past", "อนาคต", "future", "ประสบการณ์", "experience"];
const PLANNING_WORDS = ["วางแผน", "แผน", "plan", "จัดตาราง", "schedule", "ต้องทำ", "to do", "todo", "task", "งาน", "priority", "สำคัญ", "ลำดับ", "พรุ่งนี้", "สัปดาห์หน้า"];
const EMOTIONAL_WORDS = ["เศร้า", "ดีใจ", "เครียด", "กังวล", "หวัง", "โกรธ", "มีความสุข", "รัก", "เสียใจ", "ตกใจ", "happy", "sad", "stressed", "anxious", "angry", "depressed", "excited", "lonely", "เหงา"];
const URGENCY_WORDS = ["ด่วน", "เร่งด่วน", "ทันที", "now", "urgent", "asap", "ตอนนี้", "ใกล้เคียง", "ใกล้", "deadline", "วันกำหนด", "เร็ว", "quick"];
const GREETING_WORDS = ["สวัสดี", "หวัดดี", "ดีครับ", "ดีค่ะ", "hello", "hi", "hey", "good morning", "good night", "ฝันดี", "ราตรีสวัสดิ์", "ขอบคุณ", "thank"];

function detectMessageType(text: string): MessageType {
  const lower = text.toLowerCase().trim();
  if (!lower) return "unknown";

  const hasQuestion = QUESTION_WORDS.some((w) => lower.includes(w.toLowerCase()));
  const hasCommand = COMMAND_WORDS.some((w) => lower.includes(w.toLowerCase()));
  const hasEmotional = EMOTIONAL_WORDS.some((w) => lower.includes(w.toLowerCase()));
  const hasReflection = REFLECTION_WORDS.some((w) => lower.includes(w.toLowerCase()));
  const hasPlanning = PLANNING_WORDS.some((w) => lower.includes(w.toLowerCase()));
  const hasGreeting = GREETING_WORDS.some((w) => lower.includes(w.toLowerCase()));

  const scores: Record<MessageType, number> = {
    question: hasQuestion ? 3 : 0,
    command: hasCommand ? 3 : 0,
    reflection: hasReflection ? 2 : 0,
    planning: hasPlanning ? 2 : 0,
    emotional: hasEmotional ? 2 : 0,
    greeting: hasGreeting && lower.length < 30 ? 4 : 0,
    statement: 0,
    unknown: 0,
  };

  const lowerChars = lower.replace(/[\s\p{P}]/gu, "");
  if (lowerChars.length < 4 && hasGreeting) return "greeting";

  const ordered: MessageType[] = ["greeting", "emotional", "question", "planning", "reflection", "command"];
  for (const t of ordered) {
    if (scores[t] >= 2) return t;
  }

  return "statement";
}

function detectDimensions(text: string): LifeDimension[] {
  const lower = text.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [dim, keywords] of Object.entries(DIMENSION_KEYWORDS)) {
    scores[dim] = keywords.reduce((count, kw) => count + (lower.includes(kw.toLowerCase()) ? 1 : 0), 0);
  }

  return Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([dim]) => dim as LifeDimension);
}

function detectBrainTypes(text: string): BrainType[] {
  const lower = text.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [type, keywords] of Object.entries(BRAIN_TYPE_KEYWORDS)) {
    scores[type] = keywords.reduce((count, kw) => count + (lower.includes(kw.toLowerCase()) ? 1 : 0), 0);
  }

  return Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type as BrainType);
}

function detectUrgency(text: string): number {
  const lower = text.toLowerCase();
  const matches = URGENCY_WORDS.filter((w) => lower.includes(w.toLowerCase())).length;
  if (matches === 0) return 0;
  if (matches === 1) return 1;
  return 2;
}

function extractKeywords(text: string): string[] {
  const thaiWords = text.match(/[\u0E00-\u0E7F]{2,}/g) || [];
  const englishWords = text.match(/[A-Za-z]{3,}/g) || [];
  const combined = [...thaiWords, ...englishWords.map((w) => w.toLowerCase())];
  const unique = Array.from(new Set(combined));
  return unique.slice(0, 20);
}

export function analyzeIntent(input: string, roleLegacy?: AIMode): IntentResult {
  const messageType = detectMessageType(input);
  const dimensions = detectDimensions(input);
  const brainTypes = detectBrainTypes(input);
  const urgency = detectUrgency(input);
  const keywords = extractKeywords(input);

  let userGoal = "";
  switch (messageType) {
    case "question":
      userGoal = "ต้องการคำตอบหรือข้อมูล";
      break;
    case "command":
      userGoal = "ต้องการให้ดำเนินการตามคำสั่ง";
      break;
    case "planning":
      userGoal = "ต้องการวางแผนหรือจัดการงาน";
      break;
    case "reflection":
      userGoal = "ต้องการทบทวนหรือคิดถึงชีวิต";
      break;
    case "emotional":
      userGoal = "ต้องการสนับสนุนทางอารมณ์หรือคุยเรื่องความรู้สึก";
      break;
    case "greeting":
      userGoal = "ทักทายหรือเริ่มการสนทนา";
      break;
    case "statement":
      userGoal = "แชร์ข้อมูลหรือข้อความทั่วไป";
      break;
    default:
      userGoal = "อื่นๆ";
  }

  if (roleLegacy === "Therapist" && dimensions.includes("emotion")) {
    userGoal = "ต้องการพูดคุยและวิเคราะห์เรื่องอารมณ์/ความรู้สึก";
  } else if (roleLegacy === "Coach") {
    userGoal = `ต้องการคำแนะนำด้านการเติบโต: ${userGoal}`;
  } else if (roleLegacy === "Reflection") {
    userGoal = "ต้องการทบทวนและสรุปบทเรียนชีวิต";
  }

  const requiresContext = messageType !== "greeting" && input.length > 10;

  return {
    messageType,
    userGoal,
    detectedDimensions: dimensions,
    detectedBrainTypes: brainTypes,
    urgency,
    requiresContext,
    keywords,
  };
}

export function runIntentEngine(ctx: PipelineContext): PipelineContext {
  try {
    const intent = analyzeIntent(ctx.request.userInput, ctx.role.legacyAIMode);
    return { ...ctx, intent };
  } catch (err: any) {
    const fallback: IntentResult = {
      messageType: "unknown",
      userGoal: "",
      detectedDimensions: [],
      detectedBrainTypes: [],
      urgency: 0,
      requiresContext: false,
      keywords: [],
    };
    return {
      ...ctx,
      intent: fallback,
      errors: [...ctx.errors, { layer: "intent", message: err?.message ?? "Unknown error", stack: err?.stack }],
    };
  }
}
