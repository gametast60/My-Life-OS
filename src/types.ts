export type AIMode =
  | "Therapist"
  | "Life Coach"
  | "Goal Coach"
  | "Decision Helper"
  | "Weekly Reflection"
  | "Monthly Reflection"
  | "Future Self"
  | "General Chat";

export type JournalMode =
  | "Normal Diary"
  | "Gratitude"
  | "Brain Dump"
  | "Affirmation"
  | "Negative Thought Release"
  | "CBT Reflection";

export type MoodType = "😫" | "😕" | "😐" | "😊" | "🤩";

// ── Intelligence Layer Types ─────────────────────────────────

export type MemoryCategory =
  | "value"
  | "fear"
  | "dream"
  | "strength"
  | "weakness"
  | "lesson"
  | "pattern"
  | "belief";

export type KnowledgeChangeType =
  | "none"
  | "merged"
  | "conflict"
  | "evolution"
  | "temporary_state";

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  content: string;
  extractedFrom: string; // journal id, checkin, or "Brain Interview"
  timestamp: number;
  
  // Dual Metrics V1.1
  confidence: number;      // 0.0 – 1.0 (AI มั่นใจแค่ไหนว่าข้อมูลนี้ถูกต้อง)
  importance: number;      // 0.0 – 1.0 (สำคัญต่อเป้าหมายและชีวิตผู้ใช้แค่ไหน)
  
  // Evidence & Temporal Metadata
  mentionCount: number;    // จำนวนครั้งที่ถูกพูดถึง
  lastMentionedAt: number; // timestamp ล่าสุดที่ถูกกล่าวถึง
  confirmedBy: string[];   // แหล่งข้อมูลที่ยืนยัน เช่น ["Journal Entry", "Daily Check-in"]
  
  // Status & Knowledge Evolution Tracking
  status: "active" | "weakening" | "conflicted" | "evolved";
  changeType?: KnowledgeChangeType;
  changeNote?: string;
  pinned?: boolean;
}

export interface AILearningFeedback {
  patternObservations: string[]; // ข้อสังเกตเชิงพฤติกรรม & เทรนด์
  evolutionShifts: string[];     // พัฒนาการและการเปลี่ยนแปลงมิติด้านเวลา
  newDiscoveries: string[];      // ข้อมูลใหม่ที่ค้นพบ
  followupQuestion?: string;     // AI มีคำถามสงสัยต่อ
}

export interface QuestionHistoryItem {
  questionId: string;
  category: string;
  lastAskedTimestamp: number;
  answerLength: number; // ความยาวคำตอบเพื่อประเมินความลึก
}


export interface DailyCheckin {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  mood: MoodType;
  answers: {
    wentWell: string;   // วันนี้อะไรดี?
    challenge: string;  // วันนี้อะไรยาก?
    learned: string;    // วันนี้เรียนรู้อะไร?
    grateful: string;   // วันนี้ขอบคุณอะไร?
    tomorrow: string;   // พรุ่งนี้จะปรับอะไร?
  };
  aiSummary?: string;
}

/**
 * Personality vector built and updated by AI over time.
 * Used as rich context for every AI conversation.
 */
export interface UserProfileVector {
  personality: {
    riskTaking: "low" | "medium" | "high";
    thinkingStyle: "analytical" | "creative" | "balanced" | "intuitive";
    motivation: "future-self" | "achievement" | "connection" | "growth" | "freedom";
    workStyle: "systems" | "spontaneous" | "collaborative" | "solo";
  };
  values: string[];        // e.g. ["freedom", "growth", "discipline"]
  patterns: string[];      // e.g. ["works better with systems", "likes measurable progress"]
  coreStrengths: string[];
  growthAreas: string[];
  lastUpdated: number;     // timestamp
  updateCount: number;
}

// ── Core Types ───────────────────────────────────────────────

export interface UserSettings {
  userName: string;
  userEmail: string;
  avatarUrl: string;
  theme: "dark" | "light" | "system";
  language: "th" | "en";
  notificationsEnabled: boolean;
  securityPinEnabled: boolean;
  securityPin?: string;
  aiProvider: "Gemini" | "OpenAI" | "Claude" | "OpenRouter" | "Custom";
  aiApiKey: string;
  aiModel: string;
  aiTemperature: number;
  aiMaxTokens: number;
  customEndpoint?: string;
}

export interface CharacterStatus {
  // ── Original 5 ──
  discipline: number;    // 0-100 — mission completion
  health: number;        // exercise + habit
  mindset: number;       // journal mood + CBT
  knowledge: number;
  finance: number;       // money goals
  relationships: number;
  confidence: number;    // achievement streaks
  energy: number;
  focus: number;
  stress: number;
  // ── Intelligence Layer — New 5 ──
  wisdom: number;        // Journal reflections + lessons AI extracted
  creativity: number;   // Vision board items + new ideas
  courage: number;      // High-priority goals completed + challenges faced
  social: number;       // Relationship journal + social goals
  selfAwareness: number; // Daily check-in streak + emotion tracking + CBT entries
  /**
   * Tracks last time each stat was "earned" — used for RPG decay.
   * Keys match stat names. Value = Unix timestamp (ms).
   * Stat decays -1 point per 30 days of inactivity.
   */
  lastActiveAt?: Record<string, number>;
}

export interface LifeJourneyPhase {
  id: string;
  phaseNumber: number;
  title: string;
  titleTh: string;
  subtitle: string;
  status: "completed" | "current" | "locked";
  progressPercent: number;
  nextMilestone: string;
  estimatedCompletion: string;
  stats: {
    name: string;
    valuePercent: number;
    color: string;
  }[];
}

export interface TodayMission {
  id: string;
  title: string;
  subtitle?: string;
  category: "Workout" | "Gratitude" | "Journal" | "Reading" | "Meditation" | "Language" | "Trading" | "Sleep" | "Water";
  completed: boolean;
  xpValue: number;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO date string
  timestamp: number;
  title: string;
  content: string;
  mode: JournalMode;
  mood: MoodType;
  emotion: string;
  photoUrl?: string;
  audioUrl?: string;
  audioDuration?: string;
  tags: string[];
  favorite: boolean;
  pinned: boolean;
  location?: string;
  aiReflection?: string;
  wordCount?: number;        // cached word count — used to trigger memory extraction (>100)
  memoryExtracted?: boolean; // true once AI has extracted memories from this entry
}

export interface GoalItem {
  id: string;
  title: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  progressPercent: number;
  deadline: string;
  milestones: { id: string; title: string; completed: boolean }[];
  vision: string;
  aiSuggestions: string[];
  completed: boolean;
  archived: boolean;
  createdAt: string;
}

export interface HabitItem {
  id: string;
  title: string;
  category: string;
  repeatSchedule: string;
  reminderTime: string;
  currentStreak: number;
  bestStreak: number;
  completedDates: string[]; // ['2026-07-24', ...]
  completionRate: number;
  aiAnalysis?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  deadline: string;
  completed: boolean;
  category: string;
  notes?: string;
  aiSuggestion?: string;
}

export interface VisionCategoryItem {
  id: string;
  category: "Health" | "Career" | "Business" | "Finance" | "Languages" | "Family" | "Travel" | "Trading" | "Dream House" | "Dream Life";
  title: string;
  imageUrl: string;
  notes: string;
  progressPercent: number;
}

export interface AffirmationItem {
  id: string;
  text: string;
  category: "Morning" | "Night" | "Custom";
  favorite: boolean;
  audioUrl?: string;
}

export interface AIChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: number;
  mode?: AIMode;
}

export interface TimelineEvent {
  id: string;
  timestamp: number;
  dateStr: string;
  type: "journal" | "photo" | "voice" | "goal" | "achievement" | "checkin" | "memory";
  title: string;
  description: string;
  imageUrl?: string;
  audioUrl?: string;
  badge?: string;
}

export interface ReminderItem {
  id: string;
  text: string;
  createdAt: number;
}
