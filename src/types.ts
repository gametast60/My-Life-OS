// ── Life Dimensions (12 มิติ — ใช้ทั้งระบบ) ─────────────────────
export const LIFE_DIMENSIONS = [
  { id: "work",         emoji: "💼", label: "การงาน" },
  { id: "finance",      emoji: "💰", label: "การเงิน" },
  { id: "relationship", emoji: "❤️", label: "ความสัมพันธ์" },
  { id: "health",       emoji: "🏃", label: "สุขภาพ" },
  { id: "mindset",      emoji: "🧠", label: "ความคิด" },
  { id: "learning",     emoji: "📚", label: "การเรียนรู้" },
  { id: "emotion",      emoji: "😊", label: "อารมณ์" },
  { id: "goal",         emoji: "🎯", label: "เป้าหมาย" },
  { id: "lifestyle",    emoji: "🏠", label: "การใช้ชีวิต" },
  { id: "values",       emoji: "🙏", label: "คุณค่าและความเชื่อ" },
  { id: "hobby",        emoji: "🎨", label: "งานอดิเรก" },
  { id: "identity",     emoji: "👤", label: "ตัวตน" },
] as const;

export type LifeDimension = typeof LIFE_DIMENSIONS[number]["id"];

// ── Brain Types (11 types) ────────────────────────────────────────
export const BRAIN_TYPES = [
  "Goal",
  "Habit",
  "Knowledge",
  "Belief",
  "Identity",
  "Preference",
  "Skill",
  "Strength",
  "Weakness",
  "Decision",
  "Relationship",
] as const;

export type BrainType = typeof BRAIN_TYPES[number];

// ─────────────────────────────────────────────────────────────────────
// BRAIN TREE ENGINE V1 (Knowledge Index)
// ─────────────────────────────────────────────────────────────────────

/** Brain Tree DB Type = 🌳 ต้นไม้ (Goal, Habit, Principle...) */
export interface BrainTreeType {
  id: string;
  /** Display name (unique user-facing). */
  name: string;
  color: string;
  /** Lucide icon name (e.g., "Target", "Brain", "Sparkles"). */
  icon: string;
  priority: number;
  createdAt: number;
  updatedAt: number;
}

/** Brain Tree DB Dimension = 🌿 กิ่ง (Finance/Health/Learning...) */
export interface BrainTreeDimension {
  id: string;
  brainTreeTypeId: string;
  name: string;
  /** Optional color override (inherited from type if empty) */
  color?: string;
  priority: number;
  createdAt: number;
  updatedAt: number;
}

/** Brain Tree DB Tag = 🍃 ใบไม้ (Korean, React, DCA...) */
export interface BrainTreeTag {
  id: string;
  brainTreeTypeId: string;
  brainTreeDimensionId: string;
  name: string;
  /** Growth score snapshot (denormalized) — recompute pass. */
  growthScore: number;
  /** Level snapshot from growth score. */
  level: number;
  /** 0-100 within current level. */
  progressPct: number;
  priority: number;
  createdAt: number;
  updatedAt: number;
}

/** Source types Evidence links to. Evidence = REFERENCE, never duplicated content. */
export type EvidenceKind =
  | "journal"
  | "habit_completed"
  | "reminder_completed"
  | "goal_progress"
  | "daily_checkin"
  | "ai_memory"
  | "brain_card_legacy";

/** Evidence = 🍎 ผลไม้. A single row of real user activity linked to MANY tags (multi-label). */
export interface BrainEvidence {
  id: string;
  kind: EvidenceKind;
  /** Id in the source table (journal / habit / reminder / goal etc). */
  sourceId: string;
  /** Short preview for UI display only. */
  preview: string;
  /** Multiple tags per evidence (multi-label) — Gmail style. */
  brainTreeTagIds: string[];
  /** For Smart Migration compat — points to the BrainCard we migrated from. */
  legacyBrainCardId?: string;
  /** When activity happened. */
  occurredAt: number;
  createdAt: number;
  updatedAt: number;
}

/** Threshold status band for growth progress. */
export type TreeGrowthStatus = "seedling" | "growing" | "strong" | "mastery";

/** Brain System Configuration — rules of the tree; NOT user preference. */
export interface BrainConfiguration {
  /** Weight per evidence kind when computing growth score. */
  evidenceWeights: Record<EvidenceKind, number>;
  /** Level n score = growthLevelConstant * level^2. */
  growthLevelConstant: number;
  /** Upper bound (%) for each status band. */
  statusThresholds: Record<TreeGrowthStatus, number>;
  /** AI multi-tag suggestion config. */
  aiSuggest: {
    maxCandidates: number;
    minLinkConfidence: number;
  };
  /** V2 decay (present to reserve key; disabled by default). */
  decay: { enabled: boolean; daysUntilStart: number; perDayPctDrop: number };
  updatedAt: number;
}

// ─────────────────────────────────────────────────────────────────────
// LEGACY Brain Card (List-style; kept for Soft Migration + AI compat)
// Remove table + UI usage only after V1 system stabilizes (V2).
// ─────────────────────────────────────────────────────────────────────

// ── Brain Card — user-managed, AI read-only ───────────────────────
export interface BrainCard {
  id: string;
  title: string;
  description: string;
  dimension: LifeDimension;
  brainType: BrainType;
  tags: string[];
  linkedJournalIds: string[]; // Journal ↔ Brain (two-way)
  createdAt: number;
  updatedAt: number;
}

// ── AI Provider ───────────────────────────────────────────────────
export interface APIProvider {
  id: string;
  name: "Gemini" | "Groq" | "OpenRouter";
  apiKey: string;
  model: string;
  enabled: boolean;
  priority: number; // 1 = highest (failover order)
  lastUsedAt?: number;
  status?: "ok" | "error" | "quota";
}

// ── Pending AI Task (Queue) ───────────────────────────────────────
export interface PendingAITask {
  id: string;
  type: "analyze_today" | "suggest_brain_card" | "reflection" | "secretary";
  payload: Record<string, unknown>;
  createdAt: number;
  status: "pending" | "processing" | "done" | "failed";
}

// ── AI Modes (simplified 7 modes) ────────────────────────────────
export type AIMode =
  | "Coach"
  | "Therapist"
  | "Decision"
  | "Future Self"
  | "Secretary"
  | "Reflection"
  | "Chat";

export type ReflectionPeriod = "today" | "week" | "month" | "year";

// ── Journal Modes ─────────────────────────────────────────────────
export type JournalMode =
  | "Normal Diary"
  | "Gratitude"
  | "Brain Dump"
  | "Affirmation"
  | "Negative Thought Release"
  | "CBT Reflection";

// ── Mood (legacy 5-level) ─────────────────────────────────────────
export type MoodType = "😫" | "😕" | "😐" | "😊" | "🤩";

// ── Core Types ────────────────────────────────────────────────────

export interface UserSettings {
  userName: string;
  userEmail: string;
  avatarUrl: string;
  theme: "dark" | "light" | "system";
  language: "th" | "en";
  notificationsEnabled: boolean;
  securityPinEnabled: boolean;
  securityPin?: string;
  smallTalkLanguage: "th" | "en" | "ko";
  // Legacy single-key (kept for migration, no longer shown in UI)
  aiApiKey: string;
  aiModel: string;
  aiTemperature: number;
  aiMaxTokens: number;
  customEndpoint?: string;
  // Multi-provider
  apiProviders: APIProvider[];
  // BIE orchestrator throttle timestamp (Unix ms)
  bieLastRunAt?: number;
}

export interface CharacterStatus {
  discipline: number;
  health: number;
  mindset: number;
  knowledge: number;
  finance: number;
  relationships: number;
  confidence: number;
  energy: number;
  focus: number;
  stress: number;
  wisdom: number;
  creativity: number;
  courage: number;
  social: number;
  selfAwareness: number;
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
  stats: { name: string; valuePercent: number; color: string }[];
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
  dimension: LifeDimension;       // required — chosen before save
  linkedBrainCardIds: string[];   // Journal ↔ Brain (two-way)
  linkedBrainTopicIds?: string[]; // Unlimited linked Brain topics
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
  dimension?: LifeDimension;
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
  dimension?: LifeDimension;
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
  type: "journal" | "photo" | "voice" | "goal" | "achievement" | "checkin";
  title: string;
  description: string;
  imageUrl?: string;
  audioUrl?: string;
  badge?: string;
}

export interface ReminderItem {
  id: string;
  text: string;
  dimension?: LifeDimension;
  scheduledAt?: number;
  dueDate?: string; // Optional YYYY-MM-DDTHH:mm date/time string
  isRead: boolean;
  createdAt: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface DailyCheckin {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  mood: MoodType;
  answers: {
    wentWell: string;
    challenge: string;
    learned: string;
    grateful: string;
    tomorrow: string;
  };
  aiSummary?: string;
}

// ── Guide System ──────────────────────────────────────────────────
export interface GuideResult {
  currentState: string;
  mainGoal: string;
  gap: string;
  nextMission: string;
  recommendedHabits: string[];
  checklist: string[];
}

// ── BIE (Brain Intelligence Engine) Type Re-exports ──────────────
// Phase 4A S1 types are canonical in `src/pie/bie/types.ts`; re-export
// here so that RoomDatabase / cross-module imports can access them from
// the central `../types` path without creating duplicate declarations.
// (Additive only — no existing exports modified.)
export type { EmbeddingRecord, PendingLearning } from "./pie/bie/types";

