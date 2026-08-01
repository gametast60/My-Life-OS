import JSZip from "jszip";
import {
  UserSettings,
  CharacterStatus,
  LifeJourneyPhase,
  TodayMission,
  JournalEntry,
  GoalItem,
  HabitItem,
  ChecklistItem,
  VisionCategoryItem,
  AffirmationItem,
  AIChatMessage,
  TimelineEvent,
  DailyCheckin,
  BrainCard,
  ReminderItem,
  PendingAITask,
  NoteItem,
  BrainTreeType,
  BrainTreeDimension,
  BrainTreeTag,
  BrainEvidence,
  BrainConfiguration,
  EvidenceKind,
  TreeGrowthStatus,
  EmbeddingRecord,
  PendingLearning,
} from "../types";
import type { GraphNode, GraphEdge, IdentityRow, InsightRow } from "../pie/bie/types";
import { seedDefaultTemplateIfEmpty, recalcAndPersistTagGrowth } from "./brainTree/brainTreeService";

// ── Storage Keys ─────────────────────────────────────────────────
const KEYS = {
  // Core (v2 — unchanged)
  SETTINGS: "mylifeos_settings_v2",
  CHARACTER: "mylifeos_character_v2",
  JOURNEY: "mylifeos_journey_v2",
  MISSIONS: "mylifeos_missions_v2",
  JOURNALS: "mylifeos_journals_v2",
  GOALS: "mylifeos_goals_v2",
  HABITS: "mylifeos_habits_v2",
  CHECKLIST: "mylifeos_checklist_v2",
  VISION: "mylifeos_vision_v2",
  AFFIRMATIONS: "mylifeos_affirmations_v2",
  MESSAGES: "mylifeos_messages_v2",
  TIMELINE: "mylifeos_timeline_v2",
  CHECKINS: "mylifeos_checkins_v2",
  PRESET_TAGS: "mylifeos_preset_tags_v2",
  PRESET_MOODS: "mylifeos_preset_moods_v2",
  // v2.0 NEW (LEGACY after BrainTree V1 — keep for Soft Migration)
  BRAIN_CARDS: "mylifeos_brain_cards_v1",
  REMINDERS: "mylifeos_reminders_v1",
  PENDING_TASKS: "mylifeos_pending_tasks_v1",
  NOTES: "mylifeos_notes_v1",
  // Brain Tree Engine V1 (NEW)
  BRAIN_TREE_TYPES: "mylifeos_bt_types_v1",
  BRAIN_TREE_DIMS: "mylifeos_bt_dims_v1",
  BRAIN_TREE_TAGS: "mylifeos_bt_tags_v1",
  BRAIN_EVIDENCE: "mylifeos_bt_evidence_v1",
  BRAIN_CONFIG: "mylifeos_bt_config_v1",
  BRAIN_MIGRATION_V1_DONE: "mylifeos_bt_migration_v1_done",
  // ── BIE — Brain Intelligence Engine (Phase 4) ────────────────────
  // Table DEFINITIONS only (S1). Namespaced `bie_*` so the entire BIE
  // dataset can be wiped/backed-up independently of the Core Brain Tree.
  // Per DECISIONS.md "BIE Storage Location" (CONFIRMED 2026-07-30):
  // RoomDatabase is the sole persistent backend for BIE; localStorage
  // is NOT used for BIE persistent data. These keys live in the same
  // master snapshot as Core tables (single Export/Import).
  //
  // Query/migration/business logic land in later sub-phases (S4+).
  BIE_EMBEDDINGS: "mylifeos_bie_embeddings_v1", // Persistent embedding cache (contentHash-keyed)
  BIE_GRAPH_NODES: "mylifeos_bie_graph_nodes_v1", // Knowledge graph nodes (Phase 4B)
  BIE_GRAPH_EDGES: "mylifeos_bie_graph_edges_v1", // Knowledge graph edges, applied=false until HITL (Phase 4B)
  BIE_IDENTITY: "mylifeos_bie_identity_v1", // Identity profile singleton, applied=false until HITL (Phase 4D)
  BIE_INSIGHTS: "mylifeos_bie_insights_v1", // Insights FIFO 100, applied=false until HITL (Phase 4D)
  BIE_TIMELINE: "mylifeos_bie_timeline_v1", // Timeline cache (contentHash-invalidated, rebuildable)
  BIE_PENDING_QUEUE: "mylifeos_bie_pending_queue_v1", // HITL pending structural suggestions (applied=false by definition)
};

// ── Default Brain Configuration ──────────────────────────────────
export const DEFAULT_BRAIN_CONFIG: BrainConfiguration = {
  evidenceWeights: {
    journal: 2,
    habit_completed: 5,
    reminder_completed: 3,
    goal_progress: 10,
    daily_checkin: 1,
    ai_memory: 1,
    brain_card_legacy: 2,
  } satisfies Record<EvidenceKind, number>,
  growthLevelConstant: 100, // Level n score = 100 * n^2
  statusThresholds: {
    seedling: 20,
    growing: 50,
    strong: 80,
    mastery: 100,
  } satisfies Record<TreeGrowthStatus, number>,
  aiSuggest: {
    maxCandidates: 4,
    minLinkConfidence: 55,
  },
  decay: {
    enabled: false, // V1 disabled; V2 will enable
    daysUntilStart: 30,
    perDayPctDrop: 0.5,
  },
  updatedAt: Date.now(),
};

// ── Defaults ─────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: UserSettings = {
  userName: "ผู้ใช้งาน",
  userEmail: "",
  avatarUrl: "",
  theme: "dark",
  language: "th",
  notificationsEnabled: true,
  securityPinEnabled: false,
  smallTalkLanguage: "th",
  // Legacy (kept for migration)
  aiApiKey: "",
  aiModel: "gemini-2.5-flash",
  aiTemperature: 0.7,
  aiMaxTokens: 2048,
  // Multi-provider
  apiProviders: [],
};

export const DEFAULT_CHARACTER: CharacterStatus = {
  discipline: 0,
  health: 0,
  mindset: 0,
  knowledge: 0,
  finance: 0,
  relationships: 0,
  confidence: 0,
  energy: 0,
  focus: 0,
  stress: 0,
  wisdom: 0,
  creativity: 0,
  courage: 0,
  social: 0,
  selfAwareness: 0,
  lastActiveAt: {},
};

export const DEFAULT_CHECKINS: DailyCheckin[] = [];

export const DEFAULT_PRESET_TAGS: string[] = [
  "การทำงาน",
  "พัฒนาตนเอง",
  "สุขภาพ",
  "การเงิน",
  "ความสัมพันธ์",
  "ครอบครัว",
  "เป้าหมาย",
  "ไอเดีย",
  "Gratitude",
];

export interface PresetMood {
  id: string;
  emoji: string;
  label: string;
}

export const DEFAULT_PRESET_MOODS: PresetMood[] = [
  { id: "happy", emoji: "😊", label: "มีความสุข" },
  { id: "energetic", emoji: "🤩", label: "กระปรี้กระเปร่า" },
  { id: "neutral", emoji: "😐", label: "ปกติ" },
  { id: "sad", emoji: "😫", label: "เหนื่อยล้า" },
  { id: "grateful", emoji: "🙏", label: "ขอบคุณ" },
  { id: "anxious", emoji: "😰", label: "กังวล" },
  { id: "calm", emoji: "😌", label: "สงบ" },
  { id: "excited", emoji: "🥳", label: "ตื่นเต้น" },
];

export const DEFAULT_JOURNEY: LifeJourneyPhase[] = [
  {
    id: "phase-1",
    phaseNumber: 1,
    title: "Start",
    titleTh: "เริ่มต้น",
    subtitle: "ก้าวแรกของการปรับเปลี่ยนมุมมองและกำหนดทิศทางชีวิต",
    status: "current",
    progressPercent: 0,
    nextMilestone: "สร้างฐานความคิดตั้งต้น",
    estimatedCompletion: "กำลังเริ่มต้น",
    stats: [{ name: "ระเบียบวินัยพื้นฐาน", valuePercent: 0, color: "#6B9361" }],
  },
  {
    id: "phase-2",
    phaseNumber: 2,
    title: "Habits",
    titleTh: "นิสัย",
    subtitle: "การสร้างและรักษารูปแบบพฤติกรรมเชิงบวกอย่างต่อเนื่อง",
    status: "locked",
    progressPercent: 0,
    nextMilestone: "ทำ Habit Streak ครบ 21 วัน",
    estimatedCompletion: "เฟสถัดไป",
    stats: [{ name: "ความสม่ำเสมอ", valuePercent: 0, color: "#6B9361" }],
  },
  {
    id: "phase-3",
    phaseNumber: 3,
    title: "Identity",
    titleTh: "ตัวตน",
    subtitle: "การสลักตัวตนใหม่ ชัดเจนในคุณค่า และการตัดสินใจที่มีพลัง",
    status: "locked",
    progressPercent: 0,
    nextMilestone: "สร้างวินัยส่วนบุคคลสำเร็จ",
    estimatedCompletion: "เฟสถัดไป",
    stats: [{ name: "วินัยส่วนบุคคล", valuePercent: 0, color: "#6B9361" }],
  },
  {
    id: "phase-4",
    phaseNumber: 4,
    title: "Momentum",
    titleTh: "แรงขับเคลื่อน",
    subtitle: "การเร่งความเร็ว ผลลัพธ์จากการทำงานเชิงลึกอย่างมีกลยุทธ์",
    status: "locked",
    progressPercent: 0,
    nextMilestone: "บรรลุเป้าหมายการเงินขั้นแรก",
    estimatedCompletion: "เฟสถัดไป",
    stats: [{ name: "ศักยภาพการสร้างรายได้", valuePercent: 0, color: "#6B9361" }],
  },
  {
    id: "phase-5",
    phaseNumber: 5,
    title: "Freedom",
    titleTh: "อิสรภาพ",
    subtitle: "อิสรภาพทางเวลา การเงิน และจิตใจ ยินดีต้อนรับสู่ Dream Life",
    status: "locked",
    progressPercent: 0,
    nextMilestone: "ใช้ชีวิตแบบคุมระบบสมบูรณ์แบบ",
    estimatedCompletion: "เป้าหมายสูงสุด",
    stats: [{ name: "อิสรภาพที่แท้จริง", valuePercent: 0, color: "#6B9361" }],
  },
];

export const DEFAULT_MISSIONS: TodayMission[] = [];
export const DEFAULT_JOURNALS: JournalEntry[] = [];
export const DEFAULT_GOALS: GoalItem[] = [];
export const DEFAULT_HABITS: HabitItem[] = [];
export const DEFAULT_CHECKLIST: ChecklistItem[] = [];
export const DEFAULT_VISION: VisionCategoryItem[] = [];
export const DEFAULT_AFFIRMATIONS: AffirmationItem[] = [];
export const DEFAULT_MESSAGES: AIChatMessage[] = [];
export const DEFAULT_TIMELINE: TimelineEvent[] = [];
export const DEFAULT_BRAIN_CARDS: BrainCard[] = [];
export const DEFAULT_REMINDERS: ReminderItem[] = [];
export const DEFAULT_PENDING_TASKS: PendingAITask[] = [];
export const DEFAULT_BIE_EMBEDDINGS: EmbeddingRecord[] = [];
export const DEFAULT_BIE_PENDING_QUEUE: PendingLearning[] = [];
export const DEFAULT_BIE_GRAPH_NODES: GraphNode[] = [];
export const DEFAULT_BIE_GRAPH_EDGES: GraphEdge[] = [];

// ── RoomDatabase ──────────────────────────────────────────────────
export class RoomDatabase {
  private static get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Storage save error:", e);
    }
  }

  // ── Migration ───────────────────────────────────────────────────

  static runMigrations(): void {
    // v2 migration (wipe old v1 mock data)
    if (!localStorage.getItem("mylifeos_migrated_v2")) {
      const oldKeys = [
        "mylifeos_settings", "mylifeos_character", "mylifeos_journey",
        "mylifeos_missions", "mylifeos_journals", "mylifeos_goals",
        "mylifeos_habits", "mylifeos_checklist", "mylifeos_vision",
        "mylifeos_affirmations", "mylifeos_messages", "mylifeos_timeline",
      ];
      oldKeys.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem("mylifeos_migrated_v2", "true");
    }

    // v3 migration — migrate legacy aiApiKey into apiProviders if not done
    if (!localStorage.getItem("mylifeos_migrated_v3")) {
      const settings = this.getSettings();
      if (settings.aiApiKey && settings.apiProviders.length === 0) {
        settings.apiProviders = [
          {
            id: "gemini-default",
            name: "Gemini",
            apiKey: settings.aiApiKey,
            model: settings.aiModel || "gemini-2.5-flash",
            enabled: true,
            priority: 1,
          },
        ];
        this.saveSettings(settings);
      }
      // Migrate reminders from HomeView localStorage key
      const oldReminders = localStorage.getItem("mylifeos_reminders");
      if (oldReminders) {
        try {
          const parsed = JSON.parse(oldReminders) as string[];
          const migrated: ReminderItem[] = parsed.map((text, i) => ({
            id: `rem-migrated-${i}`,
            text,
            isRead: false,
            createdAt: Date.now() - i * 1000,
          }));
          this.saveReminders(migrated);
          localStorage.removeItem("mylifeos_reminders");
        } catch { /* ignore */ }
      }
      localStorage.setItem("mylifeos_migrated_v3", "true");
    }

    // v4 migration — Brain Tree Engine V1 Smart Migration
    if (!localStorage.getItem(KEYS.BRAIN_MIGRATION_V1_DONE)) {
      RoomDatabase.BrainTreeMigration.migrateLegacyBrainCards();
      localStorage.setItem(KEYS.BRAIN_MIGRATION_V1_DONE, String(Date.now()));
    }

    // v4b — ensure default template exists for new users (empty tree)
    seedDefaultTemplateIfEmpty();

    // always normalize denormalized tag growth snapshots on startup
    recalcAndPersistTagGrowth();
  }

  // ──────────────────────────────────────────────────────────────
  // Brain Tree Engine V1 — CRUD
  // ──────────────────────────────────────────────────────────────

  // Brain Tree Configuration
  static getBrainConfig(): BrainConfiguration {
    const saved = this.get<Partial<BrainConfiguration>>(KEYS.BRAIN_CONFIG, {});
    return {
      ...DEFAULT_BRAIN_CONFIG,
      ...saved,
      evidenceWeights: {
        ...DEFAULT_BRAIN_CONFIG.evidenceWeights,
        ...(saved.evidenceWeights || {}),
      },
      statusThresholds: {
        ...DEFAULT_BRAIN_CONFIG.statusThresholds,
        ...(saved.statusThresholds || {}),
      },
      aiSuggest: {
        ...DEFAULT_BRAIN_CONFIG.aiSuggest,
        ...(saved.aiSuggest || {}),
      },
      decay: {
        ...DEFAULT_BRAIN_CONFIG.decay,
        ...(saved.decay || {}),
      },
    };
  }
  static saveBrainConfig(cfg: BrainConfiguration) {
    this.set(KEYS.BRAIN_CONFIG, { ...cfg, updatedAt: Date.now() });
  }

  // BrainTreeType (🌳 ต้นไม้)
  static getBrainTreeTypes(): BrainTreeType[] {
    return this.get<BrainTreeType[]>(KEYS.BRAIN_TREE_TYPES, []);
  }
  static saveBrainTreeTypes(list: BrainTreeType[]) {
    this.set(KEYS.BRAIN_TREE_TYPES, list);
  }
  static addBrainTreeType(t: BrainTreeType) {
    const list = this.getBrainTreeTypes();
    list.push(t);
    this.saveBrainTreeTypes(list);
  }
  static updateBrainTreeType(id: string, patch: Partial<BrainTreeType>) {
    const list = this.getBrainTreeTypes();
    const idx = list.findIndex((x) => x.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...patch, updatedAt: Date.now() };
      this.saveBrainTreeTypes(list);
    }
  }
  static deleteBrainTreeType(id: string) {
    const types = this.getBrainTreeTypes().filter((x) => x.id !== id);
    this.saveBrainTreeTypes(types);
    // cascade: delete dims/tags under this type
    const dims = this.getBrainTreeDimensions().filter((d) => d.brainTreeTypeId !== id);
    this.saveBrainTreeDimensions(dims);
    const tagIdsRemoved = new Set(
      this.getBrainTreeTags().filter((t) => t.brainTreeTypeId === id).map((t) => t.id)
    );
    const tags = this.getBrainTreeTags().filter((t) => t.brainTreeTypeId !== id);
    this.saveBrainTreeTags(tags);
    // also clean evidence tagIds referencing removed tags
    const allEv = this.getBrainEvidence();
    let changed = false;
    const cleaned = allEv.map((e) => {
      if (e.brainTreeTagIds.some((tid) => tagIdsRemoved.has(tid))) {
        changed = true;
        return { ...e, brainTreeTagIds: e.brainTreeTagIds.filter((tid) => !tagIdsRemoved.has(tid)) };
      }
      return e;
    });
    if (changed) this.saveBrainEvidence(cleaned);
  }

  // BrainTreeDimension (🌿 กิ่ง)
  static getBrainTreeDimensions(): BrainTreeDimension[] {
    return this.get<BrainTreeDimension[]>(KEYS.BRAIN_TREE_DIMS, []);
  }
  static saveBrainTreeDimensions(list: BrainTreeDimension[]) {
    this.set(KEYS.BRAIN_TREE_DIMS, list);
  }
  static addBrainTreeDimension(d: BrainTreeDimension) {
    const list = this.getBrainTreeDimensions();
    list.push(d);
    this.saveBrainTreeDimensions(list);
  }
  static updateBrainTreeDimension(id: string, patch: Partial<BrainTreeDimension>) {
    const list = this.getBrainTreeDimensions();
    const idx = list.findIndex((x) => x.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...patch, updatedAt: Date.now() };
      this.saveBrainTreeDimensions(list);
    }
  }
  static deleteBrainTreeDimension(id: string) {
    const dims = this.getBrainTreeDimensions().filter((d) => d.id !== id);
    this.saveBrainTreeDimensions(dims);
    // cascade delete tags (or re-parent: by default delete)
    const tagIdsRemoved = new Set(
      this.getBrainTreeTags().filter((t) => t.brainTreeDimensionId === id).map((t) => t.id)
    );
    const tags = this.getBrainTreeTags().filter((t) => t.brainTreeDimensionId !== id);
    this.saveBrainTreeTags(tags);
    // clean evidence references
    const allEv = this.getBrainEvidence();
    let changed = false;
    const cleaned = allEv.map((e) => {
      if (e.brainTreeTagIds.some((tid) => tagIdsRemoved.has(tid))) {
        changed = true;
        return { ...e, brainTreeTagIds: e.brainTreeTagIds.filter((tid) => !tagIdsRemoved.has(tid)) };
      }
      return e;
    });
    if (changed) this.saveBrainEvidence(cleaned);
  }

  // BrainTreeTag (🍃 ใบไม้)
  static getBrainTreeTags(): BrainTreeTag[] {
    return this.get<BrainTreeTag[]>(KEYS.BRAIN_TREE_TAGS, []);
  }
  static saveBrainTreeTags(list: BrainTreeTag[]) {
    this.set(KEYS.BRAIN_TREE_TAGS, list);
  }
  static addBrainTreeTag(t: BrainTreeTag) {
    const list = this.getBrainTreeTags();
    list.push(t);
    this.saveBrainTreeTags(list);
  }
  static updateBrainTreeTag(id: string, patch: Partial<BrainTreeTag>) {
    const list = this.getBrainTreeTags();
    const idx = list.findIndex((x) => x.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...patch, updatedAt: Date.now() };
      this.saveBrainTreeTags(list);
    }
  }
  /**
   * Merge tag A into tag B. All Evidence hanging from A is re-hung on B, then A deleted.
   * Returns B id (or new tag id target).
   */
  static mergeBrainTreeTag(idA: string, idB: string): string {
    if (idA === idB) return idA;
    const list = this.getBrainTreeTags();
    const tagA = list.find((t) => t.id === idA);
    const tagB = list.find((t) => t.id === idB);
    if (!tagA || !tagB) return idB;
    // move evidence tagIds
    const ev = this.getBrainEvidence().map((e) => {
      if (e.brainTreeTagIds.includes(idA)) {
        const next = e.brainTreeTagIds.filter((t) => t !== idA);
        if (!next.includes(idB)) next.push(idB);
        return { ...e, brainTreeTagIds: next, updatedAt: Date.now() };
      }
      return e;
    });
    this.saveBrainEvidence(ev);
    // delete tag A
    this.saveBrainTreeTags(list.filter((t) => t.id !== idA));
    return idB;
  }
  static deleteBrainTreeTag(id: string) {
    const tags = this.getBrainTreeTags().filter((t) => t.id !== id);
    this.saveBrainTreeTags(tags);
    // clean evidence references
    const allEv = this.getBrainEvidence();
    let changed = false;
    const cleaned = allEv.map((e) => {
      if (e.brainTreeTagIds.includes(id)) {
        changed = true;
        return { ...e, brainTreeTagIds: e.brainTreeTagIds.filter((tid) => tid !== id) };
      }
      return e;
    });
    if (changed) this.saveBrainEvidence(cleaned);
  }

  // BrainEvidence (🍎 ผลไม้)
  static getBrainEvidence(): BrainEvidence[] {
    return this.get<BrainEvidence[]>(KEYS.BRAIN_EVIDENCE, []);
  }
  static saveBrainEvidence(list: BrainEvidence[]) {
    this.set(KEYS.BRAIN_EVIDENCE, list);
  }
  static addBrainEvidence(ev: BrainEvidence) {
    const list = this.getBrainEvidence();
    list.push(ev);
    this.saveBrainEvidence(list);
  }
  static updateBrainEvidence(id: string, patch: Partial<BrainEvidence>) {
    const list = this.getBrainEvidence();
    const idx = list.findIndex((x) => x.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...patch, updatedAt: Date.now() };
      this.saveBrainEvidence(list);
    }
  }
  static deleteBrainEvidence(id: string) {
    this.saveBrainEvidence(this.getBrainEvidence().filter((e) => e.id !== id));
  }
  /**
   * Attach a source (journal, habit_completed, etc.) to one or more brainTreeTagIds.
   * Multi-label: one source may hang from many tags.
   * Returns the BrainEvidence row it created/updated.
   */
  static attachEvidenceToTags(params: {
    kind: EvidenceKind;
    sourceId: string;
    preview: string;
    occurredAt?: number;
    tagIds: string[];
    legacyBrainCardId?: string;
  }): BrainEvidence {
    const evs = this.getBrainEvidence();
    const existing = evs.find((e) => e.kind === params.kind && e.sourceId === params.sourceId);
    const now = Date.now();
    if (existing) {
      // union tagIds to avoid duplicates
      const union = Array.from(new Set([...existing.brainTreeTagIds, ...params.tagIds]));
      const patched = {
        ...existing,
        brainTreeTagIds: union,
        preview: params.preview || existing.preview,
        updatedAt: now,
      };
      this.updateBrainEvidence(existing.id, patched);
      return patched;
    }
    const newRow: BrainEvidence = {
      id: `ev-${now}-${Math.random().toString(36).slice(2, 7)}`,
      kind: params.kind,
      sourceId: params.sourceId,
      preview: params.preview,
      brainTreeTagIds: params.tagIds,
      legacyBrainCardId: params.legacyBrainCardId,
      occurredAt: params.occurredAt || now,
      createdAt: now,
      updatedAt: now,
    };
    this.addBrainEvidence(newRow);
    return newRow;
  }

  // ──────────────────────────────────────────────────────────────
  // Brain Tree V1 Smart Migration (Legacy BrainCard → Tree+Evidence)
  // ──────────────────────────────────────────────────────────────

  private static BrainTreeMigration = {
    /**
     * For each legacy BrainCard:
     * 1. Upsert BrainType (using card.brainType)
     * 2. Upsert BrainDimension (using card.dimension → mapped via LIFE_DIMENSIONS.label)
     * 3. Upsert Tag for each card.tag (under dimension of step 2)
     * 4. Create Legacy Evidence pointing to the card description.
     * 5. Hang evidence on ALL tags (multi-label).
     */
    migrateLegacyBrainCards(): void {
      const cards: BrainCard[] = RoomDatabase.getBrainCards();
      if (cards.length === 0) return;

      const existingTypes = new Map<string, BrainTreeType>();
      RoomDatabase.getBrainTreeTypes().forEach((t) => existingTypes.set(t.name, t));

      const existingDimsByKey = new Map<string, BrainTreeDimension>();
      RoomDatabase.getBrainTreeDimensions().forEach((d) =>
        existingDimsByKey.set(`${d.brainTreeTypeId}::${d.name}`, d)
      );

      const existingTagsByKey = new Map<string, BrainTreeTag>();
      RoomDatabase.getBrainTreeTags().forEach((t) =>
        existingTagsByKey.set(`${t.brainTreeDimensionId}::${t.name.toLowerCase()}`, t)
      );

      const lifeDimToLabel: Record<string, string> = {};
      (
        [
          { id: "work", label: "การงาน" },
          { id: "finance", label: "การเงิน" },
          { id: "relationship", label: "ความสัมพันธ์" },
          { id: "health", label: "สุขภาพ" },
          { id: "mindset", label: "ความคิด" },
          { id: "learning", label: "การเรียนรู้" },
          { id: "emotion", label: "อารมณ์" },
          { id: "goal", label: "เป้าหมาย" },
          { id: "lifestyle", label: "การใช้ชีวิต" },
          { id: "values", label: "คุณค่าและความเชื่อ" },
          { id: "hobby", label: "งานอดิเรก" },
          { id: "identity", label: "ตัวตน" },
        ] as { id: string; label: string }[]
      ).forEach((d) => (lifeDimToLabel[d.id] = d.label));

      const dimColorMap: Record<string, string> = {
        work: "#6B9361",
        finance: "#B8860B",
        relationship: "#B07070",
        health: "#4E8080",
        mindset: "#7B68EE",
        learning: "#4682B4",
        emotion: "#CD853F",
        goal: "#8FBC8F",
        lifestyle: "#708090",
        values: "#9370DB",
        hobby: "#DA70D6",
        identity: "#5F9EA0",
      };
      const typeColorMap: Record<string, string> = {
        Goal: "#4E7345",
        Habit: "#6B9361",
        Knowledge: "#4682B4",
        Belief: "#9370DB",
        Identity: "#5F9EA0",
        Preference: "#CD853F",
        Skill: "#4E8080",
        Strength: "#8FBC8F",
        Weakness: "#B07070",
        Decision: "#708090",
        Relationship: "#B07070",
      };
      const typeIconMap: Record<string, string> = {
        Goal: "Target",
        Habit: "Repeat",
        Knowledge: "BookOpen",
        Belief: "Heart",
        Identity: "User",
        Preference: "ThumbsUp",
        Skill: "Zap",
        Strength: "ShieldCheck",
        Weakness: "AlertTriangle",
        Decision: "Scale",
        Relationship: "Users",
      };

      const finalTypes = new Map(existingTypes);
      const finalDims = new Map(existingDimsByKey);
      const finalTags = new Map(existingTagsByKey);

      const now = Date.now();

      for (const card of cards) {
        // Step 1: Upsert Type
        let typeObj = finalTypes.get(card.brainType);
        if (!typeObj) {
          const id = `bt-type-${card.brainType.toLowerCase()}-${now + Math.random()
            .toString(36)
            .slice(2, 5)}`;
          typeObj = {
            id,
            name: card.brainType,
            color: typeColorMap[card.brainType] || "#4E7345",
            icon: typeIconMap[card.brainType] || "Brain",
            priority: finalTypes.size + 1,
            createdAt: now,
            updatedAt: now,
          };
          finalTypes.set(typeObj.name, typeObj);
        }

        // Step 2: Upsert Dimension (use card.dimension id → label)
        const dimLabel = lifeDimToLabel[card.dimension] || card.dimension;
        const dimKey = `${typeObj.id}::${dimLabel}`;
        let dimObj = finalDims.get(dimKey);
        if (!dimObj) {
          const id = `bt-dim-${card.dimension}-${now + Math.random().toString(36).slice(2, 5)}`;
          dimObj = {
            id,
            brainTreeTypeId: typeObj.id,
            name: dimLabel,
            color: dimColorMap[card.dimension] || "#6B9361",
            priority: Array.from(finalDims.values()).filter((d) => d.brainTreeTypeId === typeObj.id).length + 1,
            createdAt: now,
            updatedAt: now,
          };
          finalDims.set(dimKey, dimObj);
        }

        // Step 3: Upsert Tags (one tag per card.tags[] entry — each entry under the same dim)
        const tagIds: string[] = [];
        const tagNames = card.tags && card.tags.length > 0 ? card.tags : [card.title.slice(0, 24)];
        for (const rawName of tagNames) {
          const name = rawName.trim();
          if (!name) continue;
          const tagKey = `${dimObj.id}::${name.toLowerCase()}`;
          let tag = finalTags.get(tagKey);
          if (!tag) {
            const id = `bt-tag-${now + Math.random().toString(36).slice(2, 8)}`;
            tag = {
              id,
              brainTreeTypeId: typeObj.id,
              brainTreeDimensionId: dimObj.id,
              name,
              growthScore: 0,
              level: 0,
              progressPct: 0,
              priority: Array.from(finalTags.values()).filter(
                (t) => t.brainTreeDimensionId === dimObj!.id
              ).length + 1,
              createdAt: now,
              updatedAt: now,
            };
            finalTags.set(tagKey, tag);
          }
          if (!tagIds.includes(tag.id)) tagIds.push(tag.id);
        }

        // Step 4+5: Create Legacy Evidence + Hang on ALL tags (multi-label)
        const preview = `${card.title}: ${card.description}`.slice(0, 140);
        RoomDatabase.attachEvidenceToTags({
          kind: "brain_card_legacy",
          sourceId: card.id,
          preview,
          occurredAt: card.createdAt,
          tagIds,
          legacyBrainCardId: card.id,
        });
      }

      // Persist final state (sorted by priority ascending, then name)
      const typesList = Array.from(finalTypes.values()).sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
      const dimsList = Array.from(finalDims.values()).sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
      const tagsList = Array.from(finalTags.values()).sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));

      RoomDatabase.saveBrainTreeTypes(typesList);
      RoomDatabase.saveBrainTreeDimensions(dimsList);
      RoomDatabase.saveBrainTreeTags(tagsList);
    },
  };

  // ── Clear All ───────────────────────────────────────────────────
  static clearAllData(): void {
    try {
      Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
      localStorage.clear();
    } catch (e) {
      console.error("Clear storage error:", e);
    }
  }

  // ── Settings ────────────────────────────────────────────────────
  static getSettings(): UserSettings {
    const saved = this.get<Partial<UserSettings>>(KEYS.SETTINGS, {});
    return { ...DEFAULT_SETTINGS, ...saved };
  }
  static saveSettings(settings: UserSettings) {
    this.set(KEYS.SETTINGS, settings);
  }

  // ── Character ───────────────────────────────────────────────────
  static getCharacter(): CharacterStatus {
    return this.get<CharacterStatus>(KEYS.CHARACTER, DEFAULT_CHARACTER);
  }
  static saveCharacter(character: CharacterStatus) {
    this.set(KEYS.CHARACTER, character);
  }

  // ── Journey ─────────────────────────────────────────────────────
  static getJourney(): LifeJourneyPhase[] {
    return this.get<LifeJourneyPhase[]>(KEYS.JOURNEY, DEFAULT_JOURNEY);
  }
  static saveJourney(journey: LifeJourneyPhase[]) {
    this.set(KEYS.JOURNEY, journey);
  }

  // ── Missions ─────────────────────────────────────────────────────
  static getMissions(): TodayMission[] {
    return this.get<TodayMission[]>(KEYS.MISSIONS, DEFAULT_MISSIONS);
  }
  static saveMissions(missions: TodayMission[]) {
    this.set(KEYS.MISSIONS, missions);
  }

  // ── Journals ─────────────────────────────────────────────────────
  static getJournals(): JournalEntry[] {
    return this.get<JournalEntry[]>(KEYS.JOURNALS, DEFAULT_JOURNALS);
  }
  static saveJournals(journals: JournalEntry[]) {
    this.set(KEYS.JOURNALS, journals);
  }

  // ── Goals ────────────────────────────────────────────────────────
  static getGoals(): GoalItem[] {
    return this.get<GoalItem[]>(KEYS.GOALS, DEFAULT_GOALS);
  }
  static saveGoals(goals: GoalItem[]) {
    this.set(KEYS.GOALS, goals);
  }

  // ── Habits ───────────────────────────────────────────────────────
  static getHabits(): HabitItem[] {
    return this.get<HabitItem[]>(KEYS.HABITS, DEFAULT_HABITS);
  }
  static saveHabits(habits: HabitItem[]) {
    this.set(KEYS.HABITS, habits);
  }

  // ── Checklist ────────────────────────────────────────────────────
  static getChecklist(): ChecklistItem[] {
    return this.get<ChecklistItem[]>(KEYS.CHECKLIST, DEFAULT_CHECKLIST);
  }
  static saveChecklist(checklist: ChecklistItem[]) {
    this.set(KEYS.CHECKLIST, checklist);
  }

  // ── Vision ───────────────────────────────────────────────────────
  static getVision(): VisionCategoryItem[] {
    return this.get<VisionCategoryItem[]>(KEYS.VISION, DEFAULT_VISION);
  }
  static saveVision(vision: VisionCategoryItem[]) {
    this.set(KEYS.VISION, vision);
  }

  // ── Affirmations ──────────────────────────────────────────────────
  static getAffirmations(): AffirmationItem[] {
    return this.get<AffirmationItem[]>(KEYS.AFFIRMATIONS, DEFAULT_AFFIRMATIONS);
  }
  static saveAffirmations(affirmations: AffirmationItem[]) {
    this.set(KEYS.AFFIRMATIONS, affirmations);
  }

  // ── Messages ─────────────────────────────────────────────────────
  static getMessages(): AIChatMessage[] {
    return this.get<AIChatMessage[]>(KEYS.MESSAGES, DEFAULT_MESSAGES);
  }
  static saveMessages(messages: AIChatMessage[]) {
    this.set(KEYS.MESSAGES, messages);
  }

  // ── Timeline ─────────────────────────────────────────────────────
  static getTimeline(): TimelineEvent[] {
    return this.get<TimelineEvent[]>(KEYS.TIMELINE, DEFAULT_TIMELINE);
  }
  static saveTimeline(timeline: TimelineEvent[]) {
    this.set(KEYS.TIMELINE, timeline);
  }

  // ── Checkins ─────────────────────────────────────────────────────
  static getCheckins(): DailyCheckin[] {
    return this.get<DailyCheckin[]>(KEYS.CHECKINS, DEFAULT_CHECKINS);
  }
  static saveCheckins(checkins: DailyCheckin[]) {
    this.set(KEYS.CHECKINS, checkins);
  }

  // ── Preset Tags ──────────────────────────────────────────────────
  static getPresetTags(): string[] {
    return this.get<string[]>(KEYS.PRESET_TAGS, DEFAULT_PRESET_TAGS);
  }
  static savePresetTags(tags: string[]) {
    this.set(KEYS.PRESET_TAGS, tags);
  }

  // ── Preset Moods ─────────────────────────────────────────────────
  static getPresetMoods(): PresetMood[] {
    return this.get<PresetMood[]>(KEYS.PRESET_MOODS, DEFAULT_PRESET_MOODS);
  }
  static savePresetMoods(moods: PresetMood[]) {
    this.set(KEYS.PRESET_MOODS, moods);
  }

  // ── Brain Cards (v2.0 NEW) ───────────────────────────────────────
  static getBrainCards(): BrainCard[] {
    return this.get<BrainCard[]>(KEYS.BRAIN_CARDS, DEFAULT_BRAIN_CARDS);
  }
  static saveBrainCards(cards: BrainCard[]) {
    this.set(KEYS.BRAIN_CARDS, cards);
  }

  // ── Reminders (v2.0 NEW) ─────────────────────────────────────────
  static getReminders(): ReminderItem[] {
    return this.get<ReminderItem[]>(KEYS.REMINDERS, DEFAULT_REMINDERS);
  }
  static saveReminders(reminders: ReminderItem[]) {
    this.set(KEYS.REMINDERS, reminders);
  }

  // ── Pending AI Tasks (v2.0 NEW) ──────────────────────────────────
  static getPendingTasks(): PendingAITask[] {
    return this.get<PendingAITask[]>(KEYS.PENDING_TASKS, DEFAULT_PENDING_TASKS);
  }
  static savePendingTasks(tasks: PendingAITask[]) {
    this.set(KEYS.PENDING_TASKS, tasks);
  }

  // ── Notes (Quick Notes) ──────────────────────────────────────────
  static getNotes(): NoteItem[] {
    return this.get<NoteItem[]>(KEYS.NOTES, []);
  }
  static saveNotes(notes: NoteItem[]) {
    this.set(KEYS.NOTES, notes);
  }

  // ── BIE: Embedding Cache (bie_embeddings) ────────────────────────
  // Phase 4A: Persistent embedding cache keyed by id (nodeId) +
  // contentHash for invalidation. Never regenerate when hash matches (P4-10).
  static getBieEmbeddings(): EmbeddingRecord[] {
    return this.get<EmbeddingRecord[]>(KEYS.BIE_EMBEDDINGS, DEFAULT_BIE_EMBEDDINGS);
  }
  static saveBieEmbeddings(list: EmbeddingRecord[]) {
    this.set(KEYS.BIE_EMBEDDINGS, list);
  }

  // ── BIE: Pending Queue (bie_pending_queue) ───────────────────────
  // Phase 4A/4B/4C/4D shared: HITL structural-change suggestions
  // (applied=false by definition). Repository is responsible for FIFO cap.
  static getBiePendingQueue(): PendingLearning[] {
    return this.get<PendingLearning[]>(KEYS.BIE_PENDING_QUEUE, DEFAULT_BIE_PENDING_QUEUE);
  }
  static saveBiePendingQueue(list: PendingLearning[]) {
    this.set(KEYS.BIE_PENDING_QUEUE, list);
  }

  // ── BIE: Knowledge Graph Nodes (bie_graph_nodes) ─────────────────
  // Phase 4B: Persistent graph node storage. Non-structural (nodes
  // describe existing tags); no HITL required for node upserts.
  static getBieGraphNodes(): GraphNode[] {
    return this.get<GraphNode[]>(KEYS.BIE_GRAPH_NODES, DEFAULT_BIE_GRAPH_NODES);
  }
  static saveBieGraphNodes(list: GraphNode[]) {
    this.set(KEYS.BIE_GRAPH_NODES, list);
  }

  // ── BIE: Knowledge Graph Edges (bie_graph_edges) ─────────────────
  // Phase 4B: Persistent graph edge storage. All AI-detected edges
  // start with applied=false (P4-12 HITL). applyGraphEdge() flips
  // the flag only from the Confirm UI.
  static getBieGraphEdges(): GraphEdge[] {
    return this.get<GraphEdge[]>(KEYS.BIE_GRAPH_EDGES, DEFAULT_BIE_GRAPH_EDGES);
  }
  static saveBieGraphEdges(list: GraphEdge[]) {
    this.set(KEYS.BIE_GRAPH_EDGES, list);
  }

  // ── BIE: Identity Singleton (bie_identity) ────────────────────────
  // Phase 4D: Singleton identity profile row (id="singleton").
  // AI writes with applied=false (P4-12 HITL). Confirm UI flips to true.
  static getBieIdentity(): IdentityRow | undefined {
    return this.get<IdentityRow | undefined>(KEYS.BIE_IDENTITY, undefined);
  }
  static saveBieIdentity(row: IdentityRow) {
    this.set(KEYS.BIE_IDENTITY, row);
  }

  // ── BIE: Insights (bie_insights) ─────────────────────────────────
  // Phase 4D: FIFO 100 insight rows. AI writes applied=false (P4-12).
  // Repository enforces FIFO cap before calling saveBieInsights.
  static getBieInsights(): InsightRow[] {
    return this.get<InsightRow[]>(KEYS.BIE_INSIGHTS, []);
  }
  static saveBieInsights(list: InsightRow[]) {
    this.set(KEYS.BIE_INSIGHTS, list);
  }

  // ── Backup & Restore ─────────────────────────────────────────────
  static async exportBackupZip(): Promise<Blob> {
    const zip = new JSZip();
    const backupData = {
      version: "2.1",
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      character: this.getCharacter(),
      journey: this.getJourney(),
      missions: this.getMissions(),
      journals: this.getJournals(),
      goals: this.getGoals(),
      habits: this.getHabits(),
      checklist: this.getChecklist(),
      vision: this.getVision(),
      affirmations: this.getAffirmations(),
      messages: this.getMessages(),
      timeline: this.getTimeline(),
      checkins: this.getCheckins(),
      brainCards: this.getBrainCards(),
      reminders: this.getReminders(),
      pendingTasks: this.getPendingTasks(),
      notes: this.getNotes(),
      presetTags: this.getPresetTags(),
      presetMoods: this.getPresetMoods(),
      brainTreeTypes: this.getBrainTreeTypes(),
      brainTreeDimensions: this.getBrainTreeDimensions(),
      brainTreeTags: this.getBrainTreeTags(),
      brainEvidence: this.getBrainEvidence(),
      brainConfig: this.getBrainConfig(),
      bieEmbeddings: this.getBieEmbeddings(),
      biePendingQueue: this.getBiePendingQueue(),
      bieGraphNodes: this.getBieGraphNodes(),
      bieGraphEdges: this.getBieGraphEdges(),
    };
    zip.file("backup.json", JSON.stringify(backupData, null, 2));
    return await zip.generateAsync({ type: "blob" });
  }

  static async importBackupZip(file: File): Promise<boolean> {
    try {
      const zip = await JSZip.loadAsync(file);
      const backupFile = zip.file("backup.json");
      if (!backupFile) return false;

      const content = await backupFile.async("text");
      const data = JSON.parse(content);

      if (data.settings) this.saveSettings(data.settings);
      if (data.character) this.saveCharacter(data.character);
      if (data.journey) this.saveJourney(data.journey);
      if (data.missions) this.saveMissions(data.missions);
      if (data.journals) this.saveJournals(data.journals);
      if (data.goals) this.saveGoals(data.goals);
      if (data.habits) this.saveHabits(data.habits);
      if (data.checklist) this.saveChecklist(data.checklist);
      if (data.vision) this.saveVision(data.vision);
      if (data.affirmations) this.saveAffirmations(data.affirmations);
      if (data.messages) this.saveMessages(data.messages);
      if (data.timeline) this.saveTimeline(data.timeline);
      if (data.checkins) this.saveCheckins(data.checkins);
      if (data.brainCards) this.saveBrainCards(data.brainCards);
      if (data.reminders) this.saveReminders(data.reminders);
      if (data.pendingTasks) this.savePendingTasks(data.pendingTasks);
      if (data.notes) this.saveNotes(data.notes);
      if (data.presetTags) this.savePresetTags(data.presetTags);
      if (data.presetMoods) this.savePresetMoods(data.presetMoods);
      if (data.brainTreeTypes) this.saveBrainTreeTypes(data.brainTreeTypes);
      if (data.brainTreeDimensions) this.saveBrainTreeDimensions(data.brainTreeDimensions);
      if (data.brainTreeTags) this.saveBrainTreeTags(data.brainTreeTags);
      if (data.brainEvidence) this.saveBrainEvidence(data.brainEvidence);
      if (data.brainConfig) this.saveBrainConfig(data.brainConfig);
      if (data.bieEmbeddings) this.saveBieEmbeddings(data.bieEmbeddings);
      if (data.biePendingQueue) this.saveBiePendingQueue(data.biePendingQueue);
      if (data.bieGraphNodes) this.saveBieGraphNodes(data.bieGraphNodes);
      if (data.bieGraphEdges) this.saveBieGraphEdges(data.bieGraphEdges);

      return true;
    } catch (e) {
      console.error("Import backup error:", e);
      return false;
    }
  }

  // ── Storage Stats ─────────────────────────────────────────────────
  static getStorageSize(): string {
    let total = 0;
    for (const x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        total += (localStorage[x].length + x.length) * 2;
      }
    }
    return (total / 1024).toFixed(2) + " KB";
  }
}
