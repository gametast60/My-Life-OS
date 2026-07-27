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
  FABPosition,
} from "../types";

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
  // v2.0 NEW
  BRAIN_CARDS: "mylifeos_brain_cards_v1",
  REMINDERS: "mylifeos_reminders_v1",
  PENDING_TASKS: "mylifeos_pending_tasks_v1",
  NOTES: "mylifeos_notes_v1",
  FAB_POSITION: "mylifeos_fab_position_v1",
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
  }

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

  // ── FAB Position Persistence ─────────────────────────────────────
  static getFABPosition(): FABPosition | null {
    return this.get<FABPosition | null>(KEYS.FAB_POSITION, null);
  }
  static saveFABPosition(pos: FABPosition) {
    this.set(KEYS.FAB_POSITION, pos);
  }

  // ── Backup & Restore ─────────────────────────────────────────────
  static async exportBackupZip(): Promise<Blob> {
    const zip = new JSZip();
    const backupData = {
      version: "2.0",
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
