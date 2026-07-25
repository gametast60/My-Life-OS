import React, { useState } from "react";
import {
  UserSettings,
  CharacterStatus,
  LifeJourneyPhase,
  TodayMission,
  JournalEntry,
  DailyCheckin,
  ReminderItem,
} from "../types";
import {
  Check,
  Zap,
  ChevronRight,
  Lock,
  Cog,
  Plus,
  Target,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  Bell,
  X,
  Tag,
  Smile,
  Frown,
  Meh,
  BookOpen,
} from "lucide-react";

interface HomeViewProps {
  settings: UserSettings;
  character: CharacterStatus;
  journey: LifeJourneyPhase[];
  missions: TodayMission[];
  recentJournals: JournalEntry[];
  todayCheckin?: DailyCheckin;
  onToggleMission: (id: string) => void;
  onNavigateTab: (tab: "home" | "journey" | "coach" | "journal" | "progress") => void;
  onOpenQuickAction: (action: string) => void;
  onOpenCheckinModal: () => void;
  onAddJournal: (entry: JournalEntry) => void;
}

const CHAR_STATS = [
  { key: "discipline" as keyof CharacterStatus, label: "วินัย", color: "#4E7345" },
  { key: "health" as keyof CharacterStatus, label: "สุขภาพ", color: "#6B9361" },
  { key: "finance" as keyof CharacterStatus, label: "การเงิน", color: "#B07A60" },
  { key: "mindset" as keyof CharacterStatus, label: "ความคิด", color: "#4E7345" },
  { key: "energy" as keyof CharacterStatus, label: "พลังงาน", color: "#7A9B61" },
  { key: "confidence" as keyof CharacterStatus, label: "ความมั่นใจ", color: "#6B9361" },
];

const PRESET_TAGS = [
  "การทำงาน",
  "พัฒนาตนเอง",
  "สุขภาพ",
  "การเงิน",
  "ความสัมพันธ์",
  "ครอบครัว",
  "เป้าหมาย",
  "ไอเดีย",
];

const MOODS = [
  { id: "😊", label: "มีความสุข", icon: Smile },
  { id: "🤩", label: "กระปรี้", icon: Zap },
  { id: "😐", label: "ปกติ", icon: Meh },
  { id: "😕", label: "เหนื่อย", icon: Frown },
  { id: "😫", label: "หนักใจ", icon: Frown },
] as const;

const REMINDERS_KEY = "mylifeos_reminders";

function loadReminders(): ReminderItem[] {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRemindersToStorage(items: ReminderItem[]) {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(items));
}

export const HomeView: React.FC<HomeViewProps> = ({
  settings,
  character,
  journey,
  todayCheckin,
  onNavigateTab,
  onOpenCheckinModal,
  onAddJournal,
}) => {
  // ── Reminder State ──
  const [reminders, setReminders] = useState<ReminderItem[]>(loadReminders);
  const [inputText, setInputText] = useState("");

  // ── Journal Popup State ──
  const [popupItem, setPopupItem] = useState<ReminderItem | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>("😊");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const journeySteps = [
    { label: "เริ่มต้น", status: "current", icon: Check },
    { label: "นิสัย", status: "upcoming", icon: Zap },
    { label: "ตัวตน", status: "upcoming", icon: Cog },
    { label: "แรงขับ", status: "locked", icon: Target },
    { label: "อิสรภาพ", status: "locked", icon: Lock },
  ];

  const steps =
    journey.length > 0
      ? journey.map((phase, idx) => {
          const iconMap = [Check, Zap, Cog, Target, Lock];
          return {
            label: phase.titleTh,
            status:
              phase.status === "completed"
                ? "completed"
                : phase.status === "current"
                ? "active"
                : "locked",
            icon: iconMap[idx] || Cog,
          };
        })
      : journeySteps;

  const hasCharacterData = Object.values(character).some(
    (v) => typeof v === "number" && v > 0
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "สวัสดีตอนเช้า";
    if (h < 17) return "สวัสดีตอนบ่าย";
    return "สวัสดีตอนเย็น";
  };

  // ── Reminder Handlers ──
  const handleAddReminder = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const newItem: ReminderItem = {
      id: "r-" + Date.now(),
      text: trimmed,
      createdAt: Date.now(),
    };
    const updated = [newItem, ...reminders];
    setReminders(updated);
    saveRemindersToStorage(updated);
    setInputText("");
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    saveRemindersToStorage(updated);
  };

  const handleOpenPopup = (item: ReminderItem) => {
    setPopupItem(item);
    setSelectedMood("😊");
    setSelectedTags([]);
  };

  const handleClosePopup = () => {
    setPopupItem(null);
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleConfirmJournal = () => {
    if (!popupItem) return;

    const newEntry: JournalEntry = {
      id: "j-" + Date.now(),
      date: new Date().toLocaleDateString("th-TH", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
      timestamp: Date.now(),
      title: popupItem.text.slice(0, 60),
      content: popupItem.text,
      mode: "Normal Diary",
      mood: selectedMood as any,
      emotion: selectedMood,
      tags: selectedTags,
      favorite: false,
      pinned: false,
    };

    onAddJournal(newEntry);

    const updated = reminders.filter((r) => r.id !== popupItem.id);
    setReminders(updated);
    saveRemindersToStorage(updated);
    setPopupItem(null);
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* 1. Welcome Section */}
      <section className="space-y-1.5 pt-2 px-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#EBF1EA]">
          {greeting()}, {settings.userName || "ผู้ใช้งาน"} 👋
        </h1>
        <p className="text-xs sm:text-sm text-[#869883] italic leading-relaxed">
          "หนทางเดียวที่จะทำงานที่ยิ่งใหญ่ได้ คือการรักในสิ่งที่คุณทำ"
          <span className="text-[#697A66] not-italic ml-1">— สตีฟ จ็อบส์</span>
        </p>
      </section>

      {/* 2. Daily Check-in Card */}
      <section className="bg-[#131913] rounded-3xl p-5 border border-[#1F2B1F] shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#6B9361] uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" /> Today's Reflection
          </span>
          {todayCheckin && (
            <span className="text-[10px] font-mono text-[#6B9361] bg-[#182218] border border-[#273727] px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> สำเร็จแล้ว
            </span>
          )}
        </div>

        {todayCheckin ? (
          <div className="p-3.5 rounded-2xl bg-[#182218] border border-[#273727] space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">{todayCheckin.mood}</span>
              <span className="text-xs font-semibold text-[#EBF1EA]">สภาวะจิตใจวันนี้</span>
            </div>
            {todayCheckin.aiSummary && (
              <p className="text-xs text-[#869883] italic leading-relaxed">
                "{todayCheckin.aiSummary}"
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-[#182018] border border-[#223022]">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#EBF1EA]">ทำ Daily Check-in วันนี้</p>
              <p className="text-[11px] text-[#869883]">ทบทวน 5 คำถามง่ายๆ (ใช้เวลา ~2 นาที)</p>
            </div>
            <button
              onClick={onOpenCheckinModal}
              className="px-4 py-2 rounded-xl bg-[#3F5C3A] hover:bg-[#4E7345] text-xs font-bold text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> เริ่ม Check-in
            </button>
          </div>
        )}
      </section>

      {/* 4. Life Journey Section */}
      <section className="bg-[#131913] rounded-3xl p-5 sm:p-6 border border-[#1F2B1F] shadow-lg space-y-6">
        <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-4">
          <h2 className="font-bold text-base sm:text-lg text-[#EBF1EA]">เส้นทางชีวิต</h2>
          <button
            onClick={() => onNavigateTab("journey")}
            className="text-xs text-[#6B9361] hover:underline flex items-center gap-1"
          >
            ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative flex items-center justify-between px-2 pt-2">
          <div className="absolute top-[28px] left-[32px] right-[32px] h-[2px] bg-[#1F2B1F] -z-0" />
          <div
            className="absolute top-[28px] left-[32px] h-[2px] bg-[#4E7345] -z-0 transition-all duration-500"
            style={{
              width: `${
                (steps.filter((s) => s.status === "completed").length /
                  Math.max(steps.length - 1, 1)) *
                100
              }%`,
            }}
          />

          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isCompleted = step.status === "completed";
            const isActive = step.status === "active" || step.status === "current";
            const isLocked = step.status === "locked";

            return (
              <div key={idx} className="flex flex-col items-center gap-2 z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-[#3F5C3A] text-white shadow-md border border-[#4E7345]"
                      : isActive
                      ? "bg-[#4E7345] text-white shadow-lg shadow-[#4E7345]/30 ring-4 ring-[#4E7345]/20 border border-[#6B9361]"
                      : isLocked
                      ? "bg-[#182018] text-[#556653] border border-[#223022]"
                      : "bg-[#182018] text-[#869883] border border-[#273727]"
                  }`}
                >
                  <StepIcon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] font-medium text-center ${
                    isActive || isCompleted ? "text-[#EBF1EA]" : "text-[#697A66]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. เตือนความจำ Section */}
      <section className="bg-[#131913] rounded-3xl p-5 sm:p-6 border border-[#1F2B1F] shadow-lg space-y-4">
        <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#6B9361]" />
            <h2 className="font-bold text-base sm:text-lg text-[#EBF1EA]">เตือนความจำ</h2>
            {reminders.length > 0 && (
              <span className="text-[10px] font-mono bg-[#273727] text-[#6B9361] px-2 py-0.5 rounded-full border border-[#354B35]">
                {reminders.length}
              </span>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddReminder();
            }}
            placeholder="จดสิ่งที่กลัวลืม..."
            className="flex-1 px-3.5 py-2.5 rounded-2xl bg-[#182018] border border-[#223022] text-sm text-[#EBF1EA] placeholder-[#556653] focus:outline-none focus:border-[#4E7345] transition-colors"
          />
          <button
            onClick={handleAddReminder}
            disabled={!inputText.trim()}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#3F5C3A] hover:bg-[#4E7345] text-white disabled:opacity-40 transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Reminder List */}
        {reminders.length === 0 ? (
          <div className="text-center py-5 space-y-1">
            <p className="text-[#869883] text-sm">ยังไม่มีรายการเตือนความจำ</p>
            <p className="text-[11px] text-[#556653]">พิมพ์สิ่งที่กลัวลืมในช่องด้านบน</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reminders.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#182018] border border-[#223022] hover:border-[#273727] transition-all group"
              >
                {/* Circle-check button — triggers popup */}
                <button
                  onClick={() => handleOpenPopup(r)}
                  className="w-5 h-5 rounded-full border-2 border-[#374E37] flex items-center justify-center flex-shrink-0 hover:border-[#6B9361] hover:bg-[#1F2B1F] transition-all"
                  title="ทำเสร็จแล้ว — บันทึกเข้าไดอารี่"
                >
                  <span className="sr-only">ทำเสร็จแล้ว</span>
                </button>

                <p className="flex-1 text-sm text-[#EBF1EA] leading-relaxed">{r.text}</p>

                {/* Delete without journaling */}
                <button
                  onClick={() => handleDeleteReminder(r.id)}
                  className="p-1 rounded-lg opacity-0 group-hover:opacity-100 text-[#869883] hover:text-red-400 hover:bg-[#2A1818] transition-all"
                  title="ลบโดยไม่บันทึก"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Character Stats Section */}
      <section className="bg-[#131913] rounded-3xl p-5 sm:p-6 border border-[#1F2B1F] shadow-lg space-y-5">
        <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-4">
          <h2 className="font-bold text-base sm:text-lg text-[#EBF1EA]">สถานะตัวละคร</h2>
          <button
            onClick={() => onNavigateTab("progress")}
            className="text-xs text-[#6B9361] hover:underline flex items-center gap-1"
          >
            ดูรายละเอียด <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {!hasCharacterData ? (
          <div className="text-center py-4 space-y-1">
            <p className="text-[#869883] text-sm">ยังไม่มีข้อมูลสถานะ</p>
            <p className="text-xs text-[#697A66]">
              สถานะจะอัปเดตอัตโนมัติเมื่อคุณทำภารกิจและบันทึกนิสัยต่างๆ
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {CHAR_STATS.map(({ key, label, color }) => {
              const val = character[key] ?? 0;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#EBF1EA]">{label}</span>
                    <span className="font-mono" style={{ color }}>
                      {val}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[#182018] rounded-full overflow-hidden border border-[#223022]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${val}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Journal Popup Modal ── */}
      {popupItem && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClosePopup();
          }}
        >
          <div className="w-full max-w-md bg-[#131913] rounded-3xl border border-[#1F2B1F] shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#6B9361]" />
                <h3 className="font-bold text-sm text-[#EBF1EA]">บันทึกเป็นไดอารี่</h3>
              </div>
              <button
                onClick={handleClosePopup}
                className="p-1.5 rounded-xl text-[#869883] hover:text-[#EBF1EA] hover:bg-[#182218] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reminder text preview */}
            <div className="p-3.5 rounded-2xl bg-[#182018] border border-[#223022]">
              <p className="text-[11px] text-[#869883] mb-1.5">บันทึกที่จะเพิ่มเข้าไดอารี่</p>
              <p className="text-sm text-[#EBF1EA] leading-relaxed">{popupItem.text}</p>
            </div>

            {/* Mood Picker */}
            <div className="space-y-2">
              <label className="text-xs text-[#869883] flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-[#6B9361]" />
                ใส่อารมณ์ไหน?
              </label>
              <div className="flex gap-2">
                {MOODS.map((m) => {
                  const isSelected = selectedMood === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMood(m.id)}
                      className={`flex-1 py-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                        isSelected
                          ? "bg-[#3F5C3A] border-[#4E7345] shadow-sm"
                          : "bg-[#182018] border-[#223022] hover:border-[#273727]"
                      }`}
                    >
                      <span className="text-lg leading-none">{m.id}</span>
                      <span
                        className={`text-[9px] font-medium leading-tight text-center ${
                          isSelected ? "text-white" : "text-[#869883]"
                        }`}
                      >
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tag Picker */}
            <div className="space-y-2">
              <label className="text-xs text-[#869883] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#6B9361]" />
                เลือกแท็ก (ไม่บังคับ)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleToggleTag(tag)}
                      className={`text-[11px] px-3 py-1 rounded-full border font-mono transition-all ${
                        isSelected
                          ? "bg-[#233523] border-[#4E7345] text-[#6B9361]"
                          : "bg-[#182018] border-[#223022] text-[#869883] hover:border-[#273727]"
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleClosePopup}
                className="flex-1 py-2.5 rounded-2xl border border-[#273727] text-xs text-[#869883] hover:text-[#EBF1EA] hover:border-[#374E37] transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmJournal}
                className="flex-1 py-2.5 rounded-2xl bg-[#3F5C3A] hover:bg-[#4E7345] text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" />
                บันทึกเข้าไดอารี่
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
