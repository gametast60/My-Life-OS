import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { BottomNav, NavTab } from "./components/BottomNav";
import { FloatingAIButton } from "./components/FloatingAIButton";
import { GlobalSearchModal } from "./components/GlobalSearchModal";

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
} from "./types";

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>("home");

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
  };

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
    const updated = reminders.map((r) => (r.id === id ? { ...r, text: trimmed, dueDate } : r));
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

  // Journal Handler (No auto AI call — Save Local Only)
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

  // Checkin Handler (No auto memory extraction — Save Local Only)
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

      {/* Floating AI Button */}
      <FloatingAIButton
        onOpenAICoach={() => setCurrentTab("coach")}
        onQuickAction={handleQuickAction}
      />

      {/* Bottom Nav */}
      <BottomNav
        currentTab={currentTab}
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
        onSaveGoals={(g) => {
          setGoals(g);
          RoomDatabase.saveGoals(g);
        }}
      />

      <HabitsModal
        isOpen={isHabitsOpen}
        onClose={() => setIsHabitsOpen(false)}
        habits={habits}
        onSaveHabits={(h) => {
          setHabits(h);
          RoomDatabase.saveHabits(h);
        }}
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
