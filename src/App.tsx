import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { BottomNav, NavTab } from "./components/BottomNav";
import { GlobalSearchModal } from "./components/GlobalSearchModal";
import { useKeyboardOpen } from "./hooks/useKeyboardOpen";
import { useKeyboardScrollFix } from "./hooks/useKeyboardScrollFix";

import { HomeView } from "./views/HomeView";
import { AICoachView } from "./views/AICoachView";
import { JournalView } from "./views/JournalView";
import { ProgressView } from "./views/ProgressView";
import { LifeBrainView } from "./views/LifeBrainView";
import { PersonalIntelligenceView } from "./views/PersonalIntelligenceView";

import { SettingsModal } from "./views/SettingsModal";
import { ManageAPIModal } from "./components/ManageAPIModal";
import { AISuggestPopup } from "./components/AISuggestPopup";
import { ReminderJournalModal } from "./components/ReminderJournalModal";
import { GoalsModal } from "./views/GoalsModal";
import { HabitsModal } from "./views/HabitsModal";
import { ChecklistModal } from "./views/ChecklistModal";
import { VisionBoardModal } from "./views/VisionBoardModal";
import { AffirmationsModal } from "./views/AffirmationsModal";
import { TimelineModal } from "./views/TimelineModal";
import { DailyCheckinModal } from "./views/DailyCheckinModal";
import { JournalPlacementBottomSheet } from "./components/JournalPlacementBottomSheet";

import { RoomDatabase } from "./lib/db";
import { PresetMood } from "./lib/db";
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
  BrainCard,
  ReminderItem,
  DailyCheckin,
  NoteItem,
  BrainTreeType,
  BrainTreeDimension,
  BrainTreeTag,
  BrainEvidence,
  BrainConfiguration,
} from "./types";
import {
  createJournalEvidence,
  createCheckinEvidence,
  createGoalProgressEvidence,
  createHabitCompletedEvidence,
  createReminderCompletedEvidence,
  findPlacementCandidatesByKeyword,
  buildFullTree,
  recalcAndPersistTagGrowth,
  seedDefaultTemplateIfEmpty,
} from "./lib/brainTree/brainTreeService";
import type { FullTree } from "./lib/brainTree/brainTreeService";
import {
  suggestJournalBrainPlacement,
  AIBrainPlacementSuggestion,
} from "./lib/aiService";

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>("home");
  const isKeyboardOpen = useKeyboardOpen();
  useKeyboardScrollFix();

  useEffect(() => {
    RoomDatabase.runMigrations();
    seedDefaultTemplateIfEmpty();
  }, []);

  const [settings, setSettings] = useState<UserSettings>(() => RoomDatabase.getSettings());
  const [character, setCharacter] = useState<CharacterStatus>(() => RoomDatabase.getCharacter());
  const [journey, setJourney] = useState<LifeJourneyPhase[]>(() => RoomDatabase.getJourney());
  const [missions, setMissions] = useState<TodayMission[]>(() => RoomDatabase.getMissions());
  const [journals, setJournals] = useState<JournalEntry[]>(() => RoomDatabase.getJournals());
  const [goals, setGoals] = useState<GoalItem[]>(() => RoomDatabase.getGoals());
  const [habits, setHabits] = useState<HabitItem[]>(() => RoomDatabase.getHabits());
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => RoomDatabase.getChecklist());
  const [vision, setVision] = useState<VisionCategoryItem[]>(() => RoomDatabase.getVision());
  const [affirmations, setAffirmations] = useState<AffirmationItem[]>(() => RoomDatabase.getAffirmations());
  const [messages, setMessages] = useState<AIChatMessage[]>(() => RoomDatabase.getMessages());
  const [timeline, setTimeline] = useState<TimelineEvent[]>(() => RoomDatabase.getTimeline());
  const [checkins, setCheckins] = useState<DailyCheckin[]>(() => RoomDatabase.getCheckins());
  const [presetTags, setPresetTags] = useState<string[]>(() => RoomDatabase.getPresetTags());
  const [presetMoods, setPresetMoods] = useState<PresetMood[]>(() => RoomDatabase.getPresetMoods());

  const [brainCards, setBrainCards] = useState<BrainCard[]>(() => RoomDatabase.getBrainCards());
  const [reminders, setReminders] = useState<ReminderItem[]>(() => RoomDatabase.getReminders());
  const [notes, setNotes] = useState<NoteItem[]>(() => RoomDatabase.getNotes());
  const [suggestedCard, setSuggestedCard] = useState<Partial<BrainCard> | null>(null);
  const [popupReminder, setPopupReminder] = useState<ReminderItem | null>(null);

  const [brainTreeTypes, setBrainTreeTypes] = useState<BrainTreeType[]>(() =>
    RoomDatabase.getBrainTreeTypes()
  );
  const [brainTreeDims, setBrainTreeDims] = useState<BrainTreeDimension[]>(() =>
    RoomDatabase.getBrainTreeDimensions()
  );
  const [brainTreeTags, setBrainTreeTags] = useState<BrainTreeTag[]>(() =>
    RoomDatabase.getBrainTreeTags()
  );
  const [brainEvidence, setBrainEvidence] = useState<BrainEvidence[]>(() =>
    RoomDatabase.getBrainEvidence()
  );
  const [brainConfig, setBrainConfig] = useState<BrainConfiguration>(() =>
    RoomDatabase.getBrainConfig()
  );
  const [brainFullTree, setBrainFullTree] = useState<FullTree>(() => buildFullTree());

  const [pendingJournalPlacement, setPendingJournalPlacement] = useState<{
    journalId: string;
    suggestion: AIBrainPlacementSuggestion;
    autoAppliedTagIds: string[];
  } | null>(null);

  const priorHabitsRef = useRef<HabitItem[]>([]);
  const priorGoalsRef = useRef<GoalItem[]>([]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isManageAPIOpen, setIsManageAPIOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [isHabitsOpen, setIsHabitsOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isVisionOpen, setIsVisionOpen] = useState(false);
  const [isAffirmationOpen, setIsAffirmationOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [isBieDiscoveryOpen, setIsBieDiscoveryOpen] = useState(false);
  const [isIdentityReviewOpen, setIsIdentityReviewOpen] = useState(false);
  const [isInsightCenterOpen, setIsInsightCenterOpen] = useState(false);
  const [isTimelineViewerOpen, setIsTimelineViewerOpen] = useState(false);


  const handleSavePresetTags = (tags: string[]) => {
    setPresetTags(tags);
    RoomDatabase.savePresetTags(tags);
  };

  const handleSavePresetMoods = (moods: PresetMood[]) => {
    setPresetMoods(moods);
    RoomDatabase.savePresetMoods(moods);
  };

  const handleReloadData = () => {
    setSettings(RoomDatabase.getSettings());
    setCharacter(RoomDatabase.getCharacter());
    setJourney(RoomDatabase.getJourney());
    setMissions(RoomDatabase.getMissions());
    setJournals(RoomDatabase.getJournals());
    setGoals(RoomDatabase.getGoals());
    setHabits(RoomDatabase.getHabits());
    setChecklist(RoomDatabase.getChecklist());
    setVision(RoomDatabase.getVision());
    setAffirmations(RoomDatabase.getAffirmations());
    setMessages(RoomDatabase.getMessages());
    setTimeline(RoomDatabase.getTimeline());
    setCheckins(RoomDatabase.getCheckins());
    setPresetTags(RoomDatabase.getPresetTags());
    setPresetMoods(RoomDatabase.getPresetMoods());
    setBrainCards(RoomDatabase.getBrainCards());
    setReminders(RoomDatabase.getReminders());
    setNotes(RoomDatabase.getNotes());
    setBrainTreeTypes(RoomDatabase.getBrainTreeTypes());
    setBrainTreeDims(RoomDatabase.getBrainTreeDimensions());
    setBrainTreeTags(RoomDatabase.getBrainTreeTags());
    setBrainEvidence(RoomDatabase.getBrainEvidence());
    setBrainConfig(RoomDatabase.getBrainConfig());
    setBrainFullTree(buildFullTree());
  };

  const reloadBrainTreeSnapshots = () => {
    recalcAndPersistTagGrowth();
    setBrainTreeTags(RoomDatabase.getBrainTreeTags());
    setBrainEvidence(RoomDatabase.getBrainEvidence());
    setBrainTreeTypes(RoomDatabase.getBrainTreeTypes());
    setBrainTreeDims(RoomDatabase.getBrainTreeDimensions());
    setBrainFullTree(buildFullTree());
  };

  useEffect(() => {
    priorHabitsRef.current = habits;
  }, [habits]);
  useEffect(() => {
    priorGoalsRef.current = goals;
  }, [goals]);

  const handleAddNote = (note: NoteItem) => {
    const updated = [note, ...notes];
    setNotes(updated);
    RoomDatabase.saveNotes(updated);
  };

  const handleEditNote = (updatedNote: NoteItem) => {
    const updated = notes.map((n) => (n.id === updatedNote.id ? updatedNote : n));
    setNotes(updated);
    RoomDatabase.saveNotes(updated);
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    RoomDatabase.saveNotes(updated);
  };

  const handleAddReminder = (text: string, dueDate?: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newItem: ReminderItem = {
      id: "r-" + Date.now(),
      text: trimmed,
      dueDate,
      isRead: false,
      createdAt: Date.now(),
    };
    const updated = [newItem, ...reminders];
    setReminders(updated);
    RoomDatabase.saveReminders(updated);
  };

  const handleEditReminder = (id: string, newText: string, dueDate?: string) => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    const updated = reminders.map((r) =>
      r.id === id
        ? { ...r, text: trimmed, dueDate: dueDate !== undefined ? dueDate : r.dueDate }
        : r
    );
    setReminders(updated);
    RoomDatabase.saveReminders(updated);
  };

  const todayStr = new Intl.DateTimeFormat("sv-SE", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(new Date());

  const todayCheckin = checkins.find((c) => c.date === todayStr);

  const handleToggleMission = (id: string) => {
    const updated = missions.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m));
    setMissions(updated);
    RoomDatabase.saveMissions(updated);

    const completedCount = updated.filter((m) => m.completed).length;
    const newDiscipline = Math.min(100, 60 + completedCount * 5);
    const updatedCharacter = { ...character, discipline: newDiscipline };
    setCharacter(updatedCharacter);
    RoomDatabase.saveCharacter(updatedCharacter);
  };

  const handleAddJournal = (entry: JournalEntry) => {
    const updated = [entry, ...journals];
    setJournals(updated);
    RoomDatabase.saveJournals(updated);

    const newTimelineEvent: TimelineEvent = {
      id: "t-" + Date.now(),
      timestamp: Date.now(),
      dateStr: "วันนี้ " + new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      type: entry.photoUrl ? "photo" : "journal",
      title: entry.title,
      description: entry.content.slice(0, 100),
      imageUrl: entry.photoUrl,
      badge: "บันทึก",
    };
    const updatedTimeline = [newTimelineEvent, ...timeline];
    setTimeline(updatedTimeline);
    RoomDatabase.saveTimeline(updatedTimeline);

    const newWisdom = Math.min(100, (character.wisdom || 0) + 2);
    const updatedChar = { ...character, wisdom: newWisdom };
    setCharacter(updatedChar);
    RoomDatabase.saveCharacter(updatedChar);

    const latestTypes = RoomDatabase.getBrainTreeTypes();
    const latestDims = RoomDatabase.getBrainTreeDimensions();
    const latestTags = RoomDatabase.getBrainTreeTags();
    if (latestTags.length === 0) return;

    Promise.resolve()
      .then(() =>
        suggestJournalBrainPlacement({
          title: entry.title,
          content: entry.content,
          allTypes: latestTypes,
          allDimensions: latestDims,
          allTags: latestTags,
          settings,
        })
      )
      .then((placement) => {
        if (placement) {
          setPendingJournalPlacement({
            journalId: entry.id,
            suggestion: placement,
            autoAppliedTagIds: [],
          });
          return;
        }
        const kw = findPlacementCandidatesByKeyword(`${entry.title} ${entry.content}`, 4, 1);
        if (kw.length === 0) return;
        const fallbackSuggestion: AIBrainPlacementSuggestion = {
          candidates: kw,
          missingNodeProposals: [],
          usedFallback: true,
        };
        setPendingJournalPlacement({
          journalId: entry.id,
          suggestion: fallbackSuggestion,
          autoAppliedTagIds: [],
        });
      })
      .catch((err) => {
        console.warn("[handleAddJournal] placement analysis failed:", err);
        const kw = findPlacementCandidatesByKeyword(`${entry.title} ${entry.content}`, 4, 1);
        if (kw.length === 0) return;
        const fallbackSuggestion: AIBrainPlacementSuggestion = {
          candidates: kw,
          missingNodeProposals: [],
          usedFallback: true,
        };
        setPendingJournalPlacement({
          journalId: entry.id,
          suggestion: fallbackSuggestion,
          autoAppliedTagIds: [],
        });
      });
  };

  const handleConfirmJournalPlacement = (journalId: string, tagIds: string[]) => {
    const journal = journals.find((j) => j.id === journalId);
    if (!journal || tagIds.length === 0) {
      setPendingJournalPlacement(null);
      return;
    }
    createJournalEvidence(journal, tagIds);
    reloadBrainTreeSnapshots();
    setPendingJournalPlacement(null);
  };

  const handleDismissJournalPlacement = () => setPendingJournalPlacement(null);

  const handleCreateMissingBrainNode = async (proposal: {
    typeName: string;
    dimensionName: string;
    tagName: string;
    reasoning: string;
  }): Promise<{ tagId: string } | null> => {
    const existingTypes = RoomDatabase.getBrainTreeTypes();
    let type = existingTypes.find(
      (t) => t.name.toLowerCase() === proposal.typeName.toLowerCase()
    );

    if (!type) {
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
        Memory: "#CD853F",
        Fear: "#B07070",
        Idea: "#8FBC8F",
      };
      const iconMap: Record<string, string> = {
        Goal: "Target",
        Habit: "Repeat",
        Knowledge: "BookOpen",
        Belief: "Heart",
        Identity: "User",
        Skill: "Zap",
        Memory: "Calendar",
        Fear: "AlertTriangle",
        Idea: "Lightbulb",
      };
      const now = Date.now();
      const typeId = `bt-type-${proposal.typeName.toLowerCase()}-${now}-${Math.random()
        .toString(36)
        .slice(2, 4)}`;
      const color = typeColorMap[proposal.typeName] ?? "#6B9361";
      const icon = iconMap[proposal.typeName] ?? "TreeDeciduous";
      type = {
        id: typeId,
        name: proposal.typeName,
        color,
        icon,
        priority: existingTypes.length + 1,
        createdAt: now,
        updatedAt: now,
      };
      RoomDatabase.addBrainTreeType(type);
    }

    const existingDims = RoomDatabase.getBrainTreeDimensions().filter(
      (d) => d.brainTreeTypeId === type!.id
    );
    let dim = existingDims.find(
      (d) => d.name.toLowerCase() === proposal.dimensionName.toLowerCase()
    );
    if (!dim) {
      const now = Date.now();
      const dimId = `bt-dim-${proposal.dimensionName
        .toLowerCase()
        .replace(/\s+/g, "-")}-${now}-${Math.random().toString(36).slice(2, 4)}`;
      dim = {
        id: dimId,
        brainTreeTypeId: type!.id,
        name: proposal.dimensionName,
        color: type!.color,
        priority: existingDims.length + 1,
        createdAt: now,
        updatedAt: now,
      };
      RoomDatabase.addBrainTreeDimension(dim);
    }

    const existingTags = RoomDatabase.getBrainTreeTags().filter(
      (t) => t.brainTreeDimensionId === dim!.id
    );
    let tag = existingTags.find(
      (t) => t.name.toLowerCase() === proposal.tagName.toLowerCase()
    );
    if (!tag) {
      const now = Date.now();
      const tagId = `bt-tag-${now}-${Math.random().toString(36).slice(2, 8)}`;
      tag = {
        id: tagId,
        brainTreeTypeId: type!.id,
        brainTreeDimensionId: dim!.id,
        name: proposal.tagName,
        growthScore: 0,
        level: 0,
        progressPct: 0,
        priority: existingTags.length + 1,
        createdAt: now,
        updatedAt: now,
      };
      RoomDatabase.addBrainTreeTag(tag);
    }

    reloadBrainTreeSnapshots();
    return { tagId: tag.id };
  };

  const handleAddBrainTreeType = (name: string, color: string, icon: string, priority: number) => {
    const now = Date.now();
    const id = `bt-type-${now}-${Math.random().toString(36).slice(2, 6)}`;
    RoomDatabase.addBrainTreeType({
      id,
      name,
      color,
      icon,
      priority,
      createdAt: now,
      updatedAt: now,
    });
    reloadBrainTreeSnapshots();
  };

  const handleUpdateBrainTreeType = (id: string, patch: Partial<BrainTreeType>) => {
    RoomDatabase.updateBrainTreeType(id, { ...patch, updatedAt: Date.now() });
    reloadBrainTreeSnapshots();
  };

  const handleDeleteBrainTreeType = (id: string) => {
    RoomDatabase.deleteBrainTreeType(id);
    reloadBrainTreeSnapshots();
  };

  const handleAddBrainTreeDimension = (
    brainTreeTypeId: string,
    name: string,
    color?: string,
    priority?: number
  ) => {
    const types = RoomDatabase.getBrainTreeTypes();
    const parent = types.find((t) => t.id === brainTreeTypeId);
    const siblings = RoomDatabase.getBrainTreeDimensions().filter(
      (d) => d.brainTreeTypeId === brainTreeTypeId
    );
    const now = Date.now();
    const id = `bt-dim-${now}-${Math.random().toString(36).slice(2, 6)}`;
    RoomDatabase.addBrainTreeDimension({
      id,
      brainTreeTypeId,
      name,
      priority: priority ?? siblings.length + 1,
      color: color ?? parent?.color ?? "#6B9361",
      createdAt: now,
      updatedAt: now,
    });
    reloadBrainTreeSnapshots();
  };

  const handleUpdateBrainTreeDimension = (id: string, patch: Partial<BrainTreeDimension>) => {
    RoomDatabase.updateBrainTreeDimension(id, { ...patch, updatedAt: Date.now() });
    reloadBrainTreeSnapshots();
  };

  const handleDeleteBrainTreeDimension = (id: string) => {
    RoomDatabase.deleteBrainTreeDimension(id);
    reloadBrainTreeSnapshots();
  };

  const handleAddBrainTreeTag = (
    brainTreeTypeId: string,
    brainTreeDimensionId: string,
    name: string,
    priority?: number
  ) => {
    const siblings = RoomDatabase.getBrainTreeTags().filter(
      (t) => t.brainTreeDimensionId === brainTreeDimensionId
    );
    const now = Date.now();
    const id = `bt-tag-${now}-${Math.random().toString(36).slice(2, 8)}`;
    RoomDatabase.addBrainTreeTag({
      id,
      brainTreeTypeId,
      brainTreeDimensionId,
      name,
      growthScore: 0,
      level: 0,
      progressPct: 0,
      priority: priority ?? siblings.length + 1,
      createdAt: now,
      updatedAt: now,
    });
    reloadBrainTreeSnapshots();
  };

  const handleUpdateBrainTreeTag = (id: string, patch: Partial<BrainTreeTag>) => {
    RoomDatabase.updateBrainTreeTag(id, { ...patch, updatedAt: Date.now() });
    reloadBrainTreeSnapshots();
  };

  const handleDeleteBrainTreeTag = (id: string) => {
    RoomDatabase.deleteBrainTreeTag(id);
    reloadBrainTreeSnapshots();
  };

  const handleEditJournal = (updatedEntry: JournalEntry) => {
    const updated = journals.map((j) => (j.id === updatedEntry.id ? updatedEntry : j));
    setJournals(updated);
    RoomDatabase.saveJournals(updated);
  };

  const handleDeleteJournal = (id: string) => {
    const updated = journals.filter((j) => j.id !== id);
    setJournals(updated);
    RoomDatabase.saveJournals(updated);
  };

  const handleSaveCheckin = (checkin: DailyCheckin) => {
    const updatedCheckins = [checkin, ...checkins];
    setCheckins(updatedCheckins);
    RoomDatabase.saveCheckins(updatedCheckins);

    const timelineEvt: TimelineEvent = {
      id: "t-chk-" + Date.now(),
      timestamp: Date.now(),
      dateStr: "วันนี้ " + new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      type: "checkin",
      title: "Daily Check-in สำเร็จ",
      description: checkin.aiSummary || `Mood: ${checkin.mood}`,
      badge: "Check-in",
    };
    const updatedTimeline = [timelineEvt, ...timeline];
    setTimeline(updatedTimeline);
    RoomDatabase.saveTimeline(updatedTimeline);

    const newSelfAwareness = Math.min(100, (character.selfAwareness || 0) + 3);
    const updatedChar = { ...character, selfAwareness: newSelfAwareness };
    setCharacter(updatedChar);
    RoomDatabase.saveCharacter(updatedChar);

    const blob = [
      checkin.answers.wentWell,
      checkin.answers.challenge,
      checkin.answers.learned,
      checkin.answers.grateful,
      checkin.answers.tomorrow,
    ].join(" ");
    const kw = findPlacementCandidatesByKeyword(blob, 2, 1);
    if (kw.length > 0) {
      createCheckinEvidence(checkin, kw.map((k) => k.tag.id));
      reloadBrainTreeSnapshots();
    }

    // ── Trigger Point B: Auto-run BIE orchestrator after check-in save (fire-and-forget)
    // Throttle: skip if last run was within 6 hours (21600000 ms)
    const now = Date.now();
    const lastRun = settings.bieLastRunAt ?? 0;
    const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
    if (now - lastRun >= SIX_HOURS_MS) {
      // Update throttle timestamp immediately to prevent duplicate triggers
      const updatedSettings = { ...settings, bieLastRunAt: now };
      setSettings(updatedSettings);
      RoomDatabase.saveSettings(updatedSettings);

      // Fire-and-forget: non-blocking, errors don't propagate (P4-11 pattern)
      Promise.resolve().then(async () => {
        try {
          const repo = new (await import("./pie/bie/RoomBrainIntelligenceRepository")).RoomBrainIntelligenceRepository();
          const evidences: BrainEvidence[] = RoomDatabase.getBrainEvidence();
          const tags: BrainTreeTag[] = RoomDatabase.getBrainTreeTags();
          const dimensions: BrainTreeDimension[] = RoomDatabase.getBrainTreeDimensions();
          const graphNodes = RoomDatabase.getBieGraphNodes().map((n) => ({
            id: n.id,
            label: n.label,
            nodeType: n.kind as any,
            createdAt: n.createdAt,
            updatedAt: n.updatedAt,
            dimension: n.dimension,
            metadata: undefined,
          }));

          await (await import("./pie/bie/bieOrchestrator")).runBieAnalysisOrchestrator({
            evidences,
            tags,
            dimensions,
            graphNodes,
            bieRepo: repo,
          });
        } catch (err) {
          console.warn("[handleSaveCheckin] BIE orchestrator auto-trigger failed (non-fatal):", err);
        }
      });
    }
  };

  const handleAddBrainCard = (card: BrainCard) => {
    const updated = [card, ...brainCards];
    setBrainCards(updated);
    RoomDatabase.saveBrainCards(updated);
  };

  const handleEditBrainCard = (updatedCard: BrainCard) => {
    const updated = brainCards.map((b) => (b.id === updatedCard.id ? updatedCard : b));
    setBrainCards(updated);
    RoomDatabase.saveBrainCards(updated);
  };

  const handleDeleteBrainCard = (id: string) => {
    const updated = brainCards.filter((b) => b.id !== id);
    setBrainCards(updated);
    RoomDatabase.saveBrainCards(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    RoomDatabase.saveReminders(updated);
  };

  const handleCompleteReminder = (item: ReminderItem) => {
    setPopupReminder(item);
  };

  const handleConfirmReminderJournal = (entry: JournalEntry) => {
    handleAddJournal(entry);
    if (popupReminder) {
      const kw = findPlacementCandidatesByKeyword(popupReminder.text, 2, 1);
      if (kw.length > 0) {
        createReminderCompletedEvidence(popupReminder, kw.map((k) => k.tag.id));
        reloadBrainTreeSnapshots();
      }
      handleDeleteReminder(popupReminder.id);
    }
    setPopupReminder(null);
  };

  const handleClearAllReminders = () => {
    setReminders([]);
    RoomDatabase.saveReminders([]);
  };

  const handleSaveHabitsWithEvidence = (updated: HabitItem[]) => {
    const priorMap: Map<string, HabitItem> = new Map(priorHabitsRef.current.map((h) => [h.id, h]));
    setHabits(updated);
    RoomDatabase.saveHabits(updated);

    let needsReload = false;
    for (const h of updated) {
      const prior = priorMap.get(h.id);
      const priorDates = new Set<string>(prior?.completedDates ?? []);
      const newDates = (h.completedDates ?? []).filter((d) => !priorDates.has(d));
      if (newDates.length > 0) {
        const kw = findPlacementCandidatesByKeyword(`${h.title} ${h.category}`, 2, 1);
        for (const d of newDates) {
          if (kw.length > 0) {
            createHabitCompletedEvidence(h, d, kw.map((k) => k.tag.id));
            needsReload = true;
          }
        }
      }
    }
    if (needsReload) reloadBrainTreeSnapshots();
    priorHabitsRef.current = updated;
  };

  const handleSaveGoalsWithEvidence = (updated: GoalItem[]) => {
    const priorMap: Map<string, GoalItem> = new Map(priorGoalsRef.current.map((g) => [g.id, g]));
    setGoals(updated);
    RoomDatabase.saveGoals(updated);

    let needsReload = false;
    for (const g of updated) {
      const prior = priorMap.get(g.id);
      const priorProgress = prior?.progressPercent ?? 0;
      if (g.progressPercent > 0 && g.progressPercent !== priorProgress) {
        const kw = findPlacementCandidatesByKeyword(`${g.title} ${g.category}`, 2, 1);
        if (kw.length > 0) {
          createGoalProgressEvidence(g, kw.map((k) => k.tag.id));
          needsReload = true;
        }
      }
    }
    if (needsReload) reloadBrainTreeSnapshots();
    priorGoalsRef.current = updated;
  };

  const handleConfirmSuggestedCard = (partial: Partial<BrainCard>) => {
    const now = Date.now();
    const newCard: BrainCard = {
      id: `brain-${now}-${Math.random().toString(36).slice(2, 7)}`,
      title: partial.title || "Brain Card",
      description: partial.description || "",
      dimension: partial.dimension || "goal",
      brainType: partial.brainType || "Knowledge",
      tags: partial.tags || [],
      linkedJournalIds: partial.linkedJournalIds || [],
      createdAt: now,
      updatedAt: now,
    };
    handleAddBrainCard(newCard);
    setSuggestedCard(null);
  };

  const handleSaveMessage = (msg: AIChatMessage) => {
    setMessages((prev) => {
      const updated = [...prev, msg];
      RoomDatabase.saveMessages(updated);
      return updated;
    });
  };

  const handleClearChatSession = () => {
    setMessages([]);
    RoomDatabase.saveMessages([]);
  };

  const handleQuickAction = (action: string) => {
    if (action === "journal") setCurrentTab("journal");
    if (action === "goal") setIsGoalsOpen(true);
    if (action === "habit") setIsHabitsOpen(true);
    if (action === "vision") setIsVisionOpen(true);
    if (action === "affirmation") setIsAffirmationOpen(true);
    if (action === "checklist") setIsChecklistOpen(true);
    if (action === "checkin") setIsCheckinOpen(true);
    if (action === "brain") setCurrentTab("brain");
  };

  const pendingJournal = pendingJournalPlacement
    ? journals.find((j) => j.id === pendingJournalPlacement.journalId) ?? null
    : null;

  return (
    <div className="min-h-screen bg-[#0A0E0A] text-[#EBF1EA] font-sans antialiased selection:bg-[#4E7345]/30 selection:text-[#6B9361]">
      <Header
        settings={settings}
        reminders={reminders}
        onAddReminder={handleAddReminder}
        onEditReminder={handleEditReminder}
        onDeleteReminder={handleDeleteReminder}
        onCompleteReminder={handleCompleteReminder}
        onClearAllReminders={handleClearAllReminders}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenManageAPI={() => setIsManageAPIOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-12">
        {currentTab === "home" && (
          <HomeView
            settings={settings}
            character={character}
            journey={journey}
            missions={missions}
            recentJournals={journals}
            todayCheckin={todayCheckin}
            presetTags={presetTags}
            reminders={reminders}
            onAddReminder={handleAddReminder}
            onEditReminder={handleEditReminder}
            onDeleteReminder={handleDeleteReminder}
            onCompleteReminder={handleCompleteReminder}
            onToggleMission={handleToggleMission}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenQuickAction={handleQuickAction}
            onOpenCheckinModal={() => setIsCheckinOpen(true)}
            onAddJournal={handleAddJournal}
            onSavePresetTags={handleSavePresetTags}
          />
        )}

        {currentTab === "pi" && (
          <PersonalIntelligenceView bieEnabled={true} />
        )}

        {(currentTab === "brain" || currentTab === "journey") && (
          <LifeBrainView
            brainCards={brainCards}
            journals={journals}
            brainFullTree={brainFullTree}
            brainTreeTypes={brainTreeTypes}
            brainTreeDimensions={brainTreeDims}
            brainTreeTags={brainTreeTags}
            notes={notes}
            onAddCard={handleAddBrainCard}
            onEditCard={handleEditBrainCard}
            onDeleteCard={handleDeleteBrainCard}
            onEditJournal={handleEditJournal}
            onAddNote={handleAddNote}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
            onAddType={handleAddBrainTreeType}
            onUpdateType={handleUpdateBrainTreeType}
            onDeleteType={handleDeleteBrainTreeType}
            onAddDimension={handleAddBrainTreeDimension}
            onUpdateDimension={handleUpdateBrainTreeDimension}
            onDeleteDimension={handleDeleteBrainTreeDimension}
            onAddTag={handleAddBrainTreeTag}
            onUpdateTag={handleUpdateBrainTreeTag}
            onDeleteTag={handleDeleteBrainTreeTag}
          />
        )}

        {currentTab === "coach" && (
          <AICoachView
            settings={settings}
            character={character}
            messages={messages}
            brainCards={brainCards}
            journals={journals}
            habits={habits}
            goals={goals}
            onSaveMessage={handleSaveMessage}
            onClearSession={handleClearChatSession}
            onOpenManageAPI={() => setIsManageAPIOpen(true)}
            onOpenLifeBrain={() => setCurrentTab("brain")}
            onSuggestCard={(card) => setSuggestedCard(card)}
          />
        )}

        {currentTab === "journal" && (
          <JournalView
            journals={journals}
            settings={settings}
            presetTags={presetTags}
            presetMoods={presetMoods}
            onAddJournal={handleAddJournal}
            onEditJournal={handleEditJournal}
            onDeleteJournal={handleDeleteJournal}
            onSavePresetTags={handleSavePresetTags}
            onSavePresetMoods={handleSavePresetMoods}
          />
        )}

        {currentTab === "progress" && (
          <LifeBrainView
            brainCards={brainCards}
            journals={journals}
            brainFullTree={brainFullTree}
            brainTreeTypes={brainTreeTypes}
            brainTreeDimensions={brainTreeDims}
            brainTreeTags={brainTreeTags}
            notes={notes}
            onAddCard={handleAddBrainCard}
            onEditCard={handleEditBrainCard}
            onDeleteCard={handleDeleteBrainCard}
            onEditJournal={handleEditJournal}
            onAddNote={handleAddNote}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
            onAddType={handleAddBrainTreeType}
            onUpdateType={handleUpdateBrainTreeType}
            onDeleteType={handleDeleteBrainTreeType}
            onAddDimension={handleAddBrainTreeDimension}
            onUpdateDimension={handleUpdateBrainTreeDimension}
            onDeleteDimension={handleDeleteBrainTreeDimension}
            onAddTag={handleAddBrainTreeTag}
            onUpdateTag={handleUpdateBrainTreeTag}
            onDeleteTag={handleDeleteBrainTreeTag}
          />
        )}
      </main>

      <BottomNav
        currentTab={currentTab}
        hidden={isKeyboardOpen}
        onTabChange={(tab) => {
          setCurrentTab(tab);
        }}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        journals={journals}
        goals={goals}
        habits={habits}
        affirmations={affirmations}
        timeline={timeline}
        brainCards={brainCards}
        onSelectJournal={() => setCurrentTab("journal")}
        onSelectGoal={() => setIsGoalsOpen(true)}
        onSelectBrainCard={() => setCurrentTab("brain")}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(s) => {
          setSettings(s);
          RoomDatabase.saveSettings(s);
        }}
        onReloadApp={handleReloadData}
        onOpenManageAPI={() => setIsManageAPIOpen(true)}
      />

      <ManageAPIModal
        isOpen={isManageAPIOpen}
        onClose={() => setIsManageAPIOpen(false)}
        settings={settings}
        onSaveSettings={(s) => {
          setSettings(s);
          RoomDatabase.saveSettings(s);
        }}
      />

      <AISuggestPopup
        card={suggestedCard}
        onConfirm={handleConfirmSuggestedCard}
        onDismiss={() => setSuggestedCard(null)}
      />

      <JournalPlacementBottomSheet
        isOpen={pendingJournalPlacement !== null}
        journal={pendingJournal}
        suggestion={pendingJournalPlacement?.suggestion ?? null}
        existingTypes={brainTreeTypes}
        existingDimensions={brainTreeDims}
        existingTags={brainTreeTags}
        onConfirm={(selectedTagIds) => {
          if (pendingJournalPlacement) {
            handleConfirmJournalPlacement(pendingJournalPlacement.journalId, selectedTagIds);
          }
        }}
        onDismiss={handleDismissJournalPlacement}
        onRequestCreateMissing={handleCreateMissingBrainNode}
      />

      {popupReminder && (
        <ReminderJournalModal
          item={popupReminder}
          presetTags={presetTags}
          presetMoods={presetMoods}
          onConfirm={handleConfirmReminderJournal}
          onClose={() => setPopupReminder(null)}
        />
      )}

      <GoalsModal
        isOpen={isGoalsOpen}
        onClose={() => setIsGoalsOpen(false)}
        goals={goals}
        onSaveGoals={handleSaveGoalsWithEvidence}
      />

      <HabitsModal
        isOpen={isHabitsOpen}
        onClose={() => setIsHabitsOpen(false)}
        habits={habits}
        onSaveHabits={handleSaveHabitsWithEvidence}
      />

      <ChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
        checklist={checklist}
        onSaveChecklist={(c) => {
          setChecklist(c);
          RoomDatabase.saveChecklist(c);
        }}
      />

      <VisionBoardModal
        isOpen={isVisionOpen}
        onClose={() => setIsVisionOpen(false)}
        visionItems={vision}
        onSaveVision={(v) => {
          setVision(v);
          RoomDatabase.saveVision(v);
        }}
      />

      <AffirmationsModal
        isOpen={isAffirmationOpen}
        onClose={() => setIsAffirmationOpen(false)}
        affirmations={affirmations}
        onSaveAffirmations={(a) => {
          setAffirmations(a);
          RoomDatabase.saveAffirmations(a);
        }}
      />

      <TimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        timeline={timeline}
      />

      <DailyCheckinModal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
        onSaveCheckin={handleSaveCheckin}
        settings={settings}
      />
    </div>
  );
}
