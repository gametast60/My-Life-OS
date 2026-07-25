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

import { SettingsModal } from "./views/SettingsModal";
import { GoalsModal } from "./views/GoalsModal";
import { HabitsModal } from "./views/HabitsModal";
import { ChecklistModal } from "./views/ChecklistModal";
import { VisionBoardModal } from "./views/VisionBoardModal";
import { AffirmationsModal } from "./views/AffirmationsModal";
import { TimelineModal } from "./views/TimelineModal";
import { DailyCheckinModal } from "./views/DailyCheckinModal";
import { MemoryModal } from "./views/MemoryModal";

import { RoomDatabase } from "./lib/db";
import { extractMemoryFromJournal, updateProfileVector } from "./lib/aiService";
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
  MemoryItem,
  DailyCheckin,
  UserProfileVector,
} from "./types";

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>("home");

  // State Management — Core
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

  // State Management — Intelligence Layer
  const [memories, setMemories] = useState<MemoryItem[]>(() => RoomDatabase.getMemories());
  const [checkins, setCheckins] = useState<DailyCheckin[]>(() => RoomDatabase.getCheckins());
  const [profileVector, setProfileVector] = useState<UserProfileVector>(() => RoomDatabase.getProfileVector());
  const [presetTags, setPresetTags] = useState<string[]>(() => RoomDatabase.getPresetTags());
  const [presetMoods, setPresetMoods] = useState<PresetMood[]>(() => RoomDatabase.getPresetMoods());

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [isHabitsOpen, setIsHabitsOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isVisionOpen, setIsVisionOpen] = useState(false);
  const [isAffirmationOpen, setIsAffirmationOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);

  const handleSavePresetTags = (tags: string[]) => {
    setPresetTags(tags);
    RoomDatabase.savePresetTags(tags);
  };

  const handleSavePresetMoods = (moods: PresetMood[]) => {
    setPresetMoods(moods);
    RoomDatabase.savePresetMoods(moods);
  };

  // Reload handler after import or reset
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
    setMemories(RoomDatabase.getMemories());
    setCheckins(RoomDatabase.getCheckins());
    setProfileVector(RoomDatabase.getProfileVector());
    setPresetTags(RoomDatabase.getPresetTags());
    setPresetMoods(RoomDatabase.getPresetMoods());
  };

  // Auto-migrate: wipe old v1 keys that contain mock data
  useEffect(() => {
    const migrated = localStorage.getItem("mylifeos_migrated_v2");
    if (!migrated) {
      const oldKeys = [
        "mylifeos_settings", "mylifeos_character", "mylifeos_journey",
        "mylifeos_missions", "mylifeos_journals", "mylifeos_goals",
        "mylifeos_habits", "mylifeos_checklist", "mylifeos_vision",
        "mylifeos_affirmations", "mylifeos_messages", "mylifeos_timeline",
      ];
      oldKeys.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem("mylifeos_migrated_v2", "true");
      handleReloadData();
    }
  }, []);

  // Check today's checkin status
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCheckin = checkins.find((c) => c.date === todayStr);

  // Handlers — Missions & Character Stats
  const handleToggleMission = (id: string) => {
    const updated = missions.map((m) => {
      if (m.id !== id) return m;
      return { ...m, completed: !m.completed };
    });
    setMissions(updated);
    RoomDatabase.saveMissions(updated);

    // Recalculate character discipline
    const completedCount = updated.filter((m) => m.completed).length;
    const newDiscipline = Math.min(100, 60 + completedCount * 5);
    const updatedCharacter = { ...character, discipline: newDiscipline };
    setCharacter(updatedCharacter);
    RoomDatabase.saveCharacter(updatedCharacter);
  };

  // Handlers — Journal & Semi-auto Memory Extraction (>100 words)
  const handleAddJournal = async (entry: JournalEntry) => {
    const wordCount = entry.content.trim().split(/\s+/).length;
    const entryWithMeta: JournalEntry = { ...entry, wordCount };

    const updated = [entryWithMeta, ...journals];
    setJournals(updated);
    RoomDatabase.saveJournals(updated);

    // Add to timeline
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

    // Increment RPG Wisdom stat
    const newWisdom = Math.min(100, (character.wisdom || 0) + 2);
    const updatedChar = { ...character, wisdom: newWisdom };
    setCharacter(updatedChar);
    RoomDatabase.saveCharacter(updatedChar);

    // Semi-auto Memory Extraction: Trigger if content > 100 words
    if (wordCount > 100 && settings.aiApiKey) {
      try {
        const extracted = await extractMemoryFromJournal(entryWithMeta, settings);
        if (extracted.length > 0) {
          setMemories((prev) => {
            const newMemList = [...extracted, ...prev];
            RoomDatabase.saveMemories(newMemList);
            return newMemList;
          });

          // Trigger User Profile Vector update periodically
          const updatedVector = await updateProfileVector(profileVector, extracted, checkins, settings);
          if (updatedVector) {
            setProfileVector(updatedVector);
            RoomDatabase.saveProfileVector(updatedVector);
          }
        }
      } catch (err) {
        console.error("Memory extraction error:", err);
      }
    }
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

  // Handlers — Daily Checkin
  const handleSaveCheckin = (checkin: DailyCheckin) => {
    const updatedCheckins = [checkin, ...checkins];
    setCheckins(updatedCheckins);
    RoomDatabase.saveCheckins(updatedCheckins);

    // Timeline event
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

    // Update Self Awareness stat (+3)
    const newSelfAwareness = Math.min(100, (character.selfAwareness || 0) + 3);
    const updatedChar = { ...character, selfAwareness: newSelfAwareness };
    setCharacter(updatedChar);
    RoomDatabase.saveCharacter(updatedChar);
  };

  // Handlers — Memory Actions
  const handleDeleteMemory = (id: string) => {
    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    RoomDatabase.saveMemories(updated);
  };

  const handleTogglePinMemory = (id: string) => {
    const updated = memories.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m));
    setMemories(updated);
    RoomDatabase.saveMemories(updated);
  };

  const handleSaveMessage = (msg: AIChatMessage) => {
    setMessages((prev) => {
      const updated = [...prev, msg];
      RoomDatabase.saveMessages(updated);
      return updated;
    });
  };

  const handleClearChatSession = () => {
    const updated: AIChatMessage[] = [];
    setMessages(updated);
    RoomDatabase.saveMessages(updated);
  };

  const handleQuickAction = (action: string) => {
    if (action === "journal") setCurrentTab("journal");
    if (action === "goal") setIsGoalsOpen(true);
    if (action === "habit") setIsHabitsOpen(true);
    if (action === "vision") setIsVisionOpen(true);
    if (action === "affirmation") setIsAffirmationOpen(true);
    if (action === "checklist") setIsChecklistOpen(true);
    if (action === "checkin") setIsCheckinOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0E0A] text-[#EBF1EA] font-sans antialiased selection:bg-[#4E7345]/30 selection:text-[#6B9361]">
      {/* Global Application Top Bar */}
      <Header
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAIQuick={() => setCurrentTab("coach")}
      />

      {/* Main Content Area */}
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
            onToggleMission={handleToggleMission}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenQuickAction={handleQuickAction}
            onOpenCheckinModal={() => setIsCheckinOpen(true)}
            onAddJournal={handleAddJournal}
            onSavePresetTags={handleSavePresetTags}
          />
        )}

        {currentTab === "journey" && (
          <JourneyView journey={journey} settings={settings} />
        )}

        {currentTab === "coach" && (
          <AICoachView
            settings={settings}
            character={character}
            messages={messages}
            memories={memories}
            profileVector={profileVector}
            journals={journals}
            habits={habits}
            goals={goals}
            onSaveMessage={handleSaveMessage}
            onClearSession={handleClearChatSession}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenMemoryModal={() => setIsMemoryOpen(true)}
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
            habits={habits}
            goals={goals}
            character={character}
            checkins={checkins}
          />
        )}
      </main>

      {/* Floating Action Button */}
      <FloatingAIButton
        onOpenAICoach={() => setCurrentTab("coach")}
        onQuickAction={handleQuickAction}
      />

      {/* Navigation Shell */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
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
        onSelectJournal={() => setCurrentTab("journal")}
        onSelectGoal={() => setIsGoalsOpen(true)}
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
      />

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

      {/* Intelligence Layer Modals */}
      <DailyCheckinModal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
        onSaveCheckin={handleSaveCheckin}
        settings={settings}
      />

      <MemoryModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        memories={memories}
        profileVector={profileVector}
        onDeleteMemory={handleDeleteMemory}
        onTogglePin={handleTogglePinMemory}
      />
    </div>
  );
}
