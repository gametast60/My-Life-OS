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
  Plus,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  Bell,
  X,
  Edit2,
  Check,
  Trash2,
} from "lucide-react";

interface HomeViewProps {
  settings: UserSettings;
  character: CharacterStatus;
  journey: LifeJourneyPhase[];
  missions: TodayMission[];
  recentJournals: JournalEntry[];
  todayCheckin?: DailyCheckin;
  presetTags: string[];
  reminders: ReminderItem[];
  onAddReminder: (text: string) => void;
  onEditReminder: (id: string, newText: string) => void;
  onDeleteReminder: (id: string) => void;
  onCompleteReminder: (item: ReminderItem) => void;
  onToggleMission: (id: string) => void;
  onNavigateTab: (tab: "home" | "journey" | "coach" | "journal" | "progress") => void;
  onOpenQuickAction: (action: string) => void;
  onOpenCheckinModal: () => void;
  onAddJournal: (entry: JournalEntry) => void;
  onSavePresetTags: (tags: string[]) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  settings,
  todayCheckin,
  reminders,
  onAddReminder,
  onEditReminder,
  onDeleteReminder,
  onCompleteReminder,
  onOpenCheckinModal,
}) => {
  const [inputText, setInputText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "สวัสดีตอนเช้า";
    if (h < 17) return "สวัสดีตอนบ่าย";
    return "สวัสดีตอนเย็น";
  };

  const handleAdd = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onAddReminder(trimmed);
    setInputText("");
  };

  const handleStartEdit = (r: ReminderItem) => {
    setEditingId(r.id);
    setEditingText(r.text);
  };

  const handleSaveEdit = (id: string) => {
    const trimmed = editingText.trim();
    if (trimmed) {
      onEditReminder(id, trimmed);
    }
    setEditingId(null);
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

      {/* 3. เตือนความจำ Section */}
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
              if (e.key === "Enter") handleAdd();
            }}
            placeholder="จดสิ่งที่กลัวลืม..."
            className="flex-1 px-3.5 py-2.5 rounded-2xl bg-[#182018] border border-[#223022] text-sm text-[#EBF1EA] placeholder-[#556653] focus:outline-none focus:border-[#4E7345] transition-colors"
          />
          <button
            onClick={handleAdd}
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
                {/* Circle-check button — triggers complete/journal modal */}
                <button
                  onClick={() => onCompleteReminder(r)}
                  className="w-5 h-5 rounded-full border-2 border-[#374E37] flex items-center justify-center flex-shrink-0 hover:border-[#6B9361] hover:bg-[#1F2B1F] transition-all"
                  title="ทำเสร็จแล้ว — บันทึกเข้าไดอารี่"
                >
                  <span className="sr-only">ทำเสร็จแล้ว</span>
                </button>

                {/* Inline Edit or Text */}
                {editingId === r.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(r.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-[#131913] border border-[#4E7345] text-sm text-[#EBF1EA] outline-none"
                    />
                    <button
                      onClick={() => handleSaveEdit(r.id)}
                      className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-950/40"
                      title="บันทึก"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-white/5"
                      title="ยกเลิก"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p
                      onClick={() => handleStartEdit(r)}
                      className="flex-1 text-sm text-[#EBF1EA] leading-relaxed cursor-pointer hover:text-emerald-300 transition-colors"
                      title="คลิกเพื่อแก้ไข"
                    >
                      {r.text}
                    </p>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleStartEdit(r)}
                        className="p-1.5 rounded-lg text-white bg-[#1F2B1F] hover:bg-[#273727] transition-all"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-white" />
                      </button>
                      <button
                        onClick={() => onDeleteReminder(r.id)}
                        className="p-1.5 rounded-lg text-red-400 bg-[#2A1818] hover:bg-[#3D1D1D] transition-all"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
