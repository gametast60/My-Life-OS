import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { BottomNav, NavTab } from "./components/BottomNav";
import { GlobalSearchModal } from "./components/GlobalSearchModal";
import { useKeyboardOpen } from "./hooks/useKeyboardOpen";
import { useKeyboardScrollFix } from "./hooks/useKeyboardScrollFix";

import { HomeView } from "./views/HomeView";
import { JourneyView } from "./views/JourneyView";
import { AICoachView } from "./views/AICoachView";
import { JournalView } from "./views/JournalView";
import { ProgressView } from "./views/ProgressView";
import { LifeBrainView } from "./views/LifeBrainView";

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
  findPlacementCandidatesByKeyword,
  buildFullTree,
  recalcAndPersistTagGrowth,
} from "./lib/brainTree/brainTreeService";
import {
  suggestJournalBrainPlacement,
  AIBrainPlacementSuggestion,
} from "./lib/aiService";

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>("home");
  const isKeyboardOpen = useKeyboardOpen();
  useKeyboardScrollFix();

  // Run migrations on start
  useEffect(() => {
    RoomDatabase.runMigrations();
  }, []);

  // Core State
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

  // v2.0 NEW State
  const [brainCards, setBrainCards] = useState<BrainCard[]>(() => RoomDatabase.getBrainCards());
  const [reminders, setReminders] = useState<ReminderItem[]>(() => RoomDatabase.getReminders());
  const [notes, setNotes] = useState<NoteItem[]>(() => RoomDatabase.getNotes());
  const [suggestedCard, setSuggestedCard] = useState<Partial<BrainCard> | null>(null);
  const [popupReminder, setPopupReminder] = useState<ReminderItem | null>(null);

  // Brain Tree Engine V1 State
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

  // Pending Journal → Brain placement (for future confirmation UI)
  const [pendingJournalPlacement, setPendingJournalPlacement] = useState<{
    journalId: string;
    suggestion: AIBrainPlacementSuggestion;
    autoAppliedTagIds: string[];
  } | null>(null);

  const priorHabitsRef = useRef<HabitItem[]>([]);
  const priorGoalsRef = useRef<GoalItem[]>([]);

  // Modals
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
  const [isLifeBrainOpen, setIsLifeBrainOpen] = useState(false);

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
    // Brain Tree Engine V1 reload
    setBrainTreeTypes(RoomDatabase.getBrainTreeTypes());
    setBrainTreeDims(RoomDatabase.getBrainTreeDimensions());
    setBrainTreeTags(RoomDatabase.getBrainTreeTags());
    setBrainEvidence(RoomDatabase.getBrainEvidence());
    setBrainConfig(RoomDatabase.getBrainConfig());
    buildFullTree(); // ensures consistency noop
  };

  const reloadBrainTreeSnapshots = () => {
    recalcAndPersistTagGrowth();
    setBrainTreeTags(RoomDatabase.getBrainTreeTags());
    setBrainEvidence(RoomDatabase.getBrainEvidence());
    setBrainTreeTypes(RoomDatabase.getBrainTreeTypes());
    setBrainTreeDims(RoomDatabase.getBrainTreeDimensions());
  };

  // Seed prior refs for Habit/Goal delta detection
  useEffect(() => {
    priorHabitsRef.current = habits;
  }, [habits]);
  useEffect(() => {
    priorGoalsRef.current = goals;
  }, [goals]);

  // Notes Handlers
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

  // Reminder Handlers
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

  // Journal Handler — Save Immediately + AI Brain Tree Placement in Background
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

    // ── Brain Tree Engine V1: Background AI Placement ──────────────
    const latestTypes = RoomDatabase.getBrainTreeTypes();
    const latestDims = RoomDatabase.getBrainTreeDimensions();
    const latestTags = RoomDatabase.getBrainTreeTags();
    if (latestTags.length > 0) {
      // Non-blocking: AI analyzes + returns suggestion
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
          if (!placement || placement.candidates.length === 0) return;
          const AUTO_CONFIDENCE_THRESHOLD = 65;
          const top = placement.candidates[0];
          // Auto-apply only if confidence is strong (AI ≥65 or fallback found match)
          const shouldAuto =
            top.score >= AUTO_CONFIDENCE_THRESHOLD || placement.usedFallback === false;
          let appliedTagIds: string[] = [];
          if (shouldAuto) {
            const ev = createJournalEvidence(entry, [top.tag.id]);
            if (ev) {
              appliedTagIds = [...ev.brainTreeTagIds];
              reloadBrainTreeSnapshots();
            }
          }
          // Persist suggestion for future confirmation UI
          setPendingJournalPlacement({
            journalId: entry.id,
            suggestion: placement,
            autoAppliedTagIds: appliedTagIds,
          });
        })
        .catch((err) => {
          console.warn("[handleAddJournal] placement analysis failed:", err);
          // Last resort: keyword fallback, then try silent attach
          const kw = findPlacementCandidatesByKeyword(`${entry.title} ${entry.content}`, 1, 1);
          if (kw.length > 0) {
            const ev = createJournalEvidence(entry, [kw[0].tag.id]);
            if (ev) reloadBrainTreeSnapshots();
          }
        });
    }
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

  // Checkin Handler — Save + auto-attach as Brain Evidence by keyword
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

    // ── Brain Tree Engine V1: attach checkin to matching tags
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
  };

  // Brain Card Handlers (User-Managed)
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
      handleDeleteReminder(popupReminder.id);
    }
    setPopupReminder(null);
  };

  const handleClearAllReminders = () => {
    setReminders([]);
    RoomDatabase.saveReminders([]);
  };

  // ── Brain Tree Engine V1: Habits / Goals delta evidence attachers ──
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
    if (action === "brain") setIsLifeBrainOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0E0A] text-[#EBF1EA] font-sans antialiased selection:bg-[#4E7345]/30 selection:text-[#6B9361]">
      {/* Top Header */}
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
        onOpenAIQuick={() => setCurrentTab("coach")}
        onOpenManageAPI={() => setIsManageAPIOpen(true)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-12">
        {isLifeBrainOpen ? (
          <LifeBrainView
            brainCards={brainCards}
            journals={journals}
            onAddCard={handleAddBrainCard}
            onEditCard={handleEditBrainCard}
            onDeleteCard={handleDeleteBrainCard}
            onEditJournal={handleEditJournal}
            onClose={() => setIsLifeBrainOpen(false)}
          />
        ) : (
          <>
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

            {currentTab === "journey" && (
              <JourneyView
                brainCards={brainCards}
                journals={journals}
                settings={settings}
                onOpenLifeBrain={() => setIsLifeBrainOpen(true)}
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
                onOpenLifeBrain={() => setIsLifeBrainOpen(true)}
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
              <ProgressView
                notes={notes}
                onAddNote={handleAddNote}
                onEditNote={handleEditNote}
                onDeleteNote={handleDeleteNote}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNav
        currentTab={currentTab}
        hidden={isKeyboardOpen}
        onTabChange={(tab) => {
          setIsLifeBrainOpen(false);
          setCurrentTab(tab);
        }}
      />

      {/* Modals & Overlays */}
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
        onSelectBrainCard={() => setIsLifeBrainOpen(true)}
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
