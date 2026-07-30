import React, { useState, useEffect, useRef } from "react";
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
  Clock,
  Moon,
} from "lucide-react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { DateTimePicker } from "../components/DateTimePicker";

interface HomeViewProps {
  settings: UserSettings;
  character: CharacterStatus;
  journey: LifeJourneyPhase[];
  missions: TodayMission[];
  recentJournals: JournalEntry[];
  todayCheckin?: DailyCheckin;
  presetTags: string[];
  reminders: ReminderItem[];
  onAddReminder: (text: string, dueDate?: string) => void;
  onEditReminder: (id: string, newText: string, dueDate?: string) => void;
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
  const [inputDueDate, setInputDueDate] = useState("");
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");
  const [isEditDateModalOpen, setIsEditDateModalOpen] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const mainTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-expanding textarea: starts at 4 lines, grows up to 6 lines, then scrolls
  const TEXTAREA_MIN_LINES = 3;
  const TEXTAREA_MAX_LINES = 5;
  const TEXTAREA_LINE_HEIGHT = 20; // px, matches text-sm leading-5
  const TEXTAREA_VERTICAL_PADDING = 20; // px, matches py-2.5 (10px top + 10px bottom)

  const autoResizeTextarea = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    const minHeight = TEXTAREA_MIN_LINES * TEXTAREA_LINE_HEIGHT + TEXTAREA_VERTICAL_PADDING;
    const maxHeight = TEXTAREA_MAX_LINES * TEXTAREA_LINE_HEIGHT + TEXTAREA_VERTICAL_PADDING;
    const newHeight = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  useEffect(() => {
    autoResizeTextarea(mainTextareaRef.current);
  }, [inputText]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "สวัสดีตอนเช้า";
    if (h < 17) return "สวัสดีตอนบ่าย";
    return "สวัสดีตอนเย็น";
  };

  const handleAdd = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onAddReminder(trimmed, inputDueDate || undefined);
    setInputText("");
    setInputDueDate("");
  };

  const handleStartEdit = (r: ReminderItem) => {
    setEditingId(r.id);
    setEditingText(r.text);
    setEditingDueDate(r.dueDate || "");
  };

  const handleSaveEdit = (id: string) => {
    const trimmed = editingText.trim();
    if (trimmed) {
      onEditReminder(id, trimmed, editingDueDate || undefined);
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* 1. Greeting Section */}
      <section className="space-y-3 pt-2 px-1">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#EBF1EA]">
              {greeting()}, {settings.userName || "ผู้ใช้งาน"} 👋
            </h1>
            <p className="text-xs text-[#869883] mt-1">ยินดีต้อนรับกลับสู่ My Life OS</p>
          </div>
        </div>
      </section>

      {/* 2. Daily Check-in Card (with Bedtime Reminder Prompt) */}
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
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-[#182018] border border-[#223022]">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-[#EBF1EA] flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-amber-400" /> ทำ Daily Check-in ก่อนนอน
                </p>
                <p className="text-[11px] text-[#869883]">
                  แนะนำให้ทำ Check-in ก่อนนอนเพื่อทบทวนวันของคุณ (ใช้เวลา ~2 นาที)
                </p>
              </div>
              <button
                onClick={onOpenCheckinModal}
                className="px-4 py-2 rounded-xl bg-[#3F5C3A] hover:bg-[#4E7345] text-xs font-bold text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" /> เริ่ม Check-in
              </button>
            </div>
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

        {/* Input Controls - New Order: Input Field (own row) → Date Button + Add Button (row below) */}
        <div className="space-y-2">
          {/* 1. Input Text Field - auto-expands 4→6 lines, then scrolls */}
          <textarea
            ref={(el) => {
              mainTextareaRef.current = el;
              autoResizeTextarea(el);
            }}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              autoResizeTextarea(e.target);
            }}
            rows={TEXTAREA_MIN_LINES}
            placeholder="จดสิ่งที่กลัวลืม..."
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#182018] border border-[#223022] text-sm leading-5 text-[#EBF1EA] placeholder-[#556653] focus:outline-none focus:border-[#4E7345] transition-colors resize-none"
          />

          <div className="flex items-center gap-2">
            {/* 2. Date/Time Button - CalendarDays icon */}
            <button
              type="button"
              onClick={() => setIsDateModalOpen(true)}
              className={`p-2.5 rounded-2xl border transition-colors flex items-center justify-center gap-1.5 flex-shrink-0 ${
                inputDueDate ? "bg-[#3F5C3A] border-[#4E7345] text-white" : "bg-[#182018] border-[#223022] text-[#869883] hover:text-white"
              }`}
              title="กำหนด วัน/เวลา เตือน (Optional)"
            >
              <CalendarDays className="w-4 h-4" />
              {inputDueDate && <span className="text-xs text-white/80">ตั้งค่าแล้ว</span>}
            </button>

            {/* 3. Add Button - Plus icon */}
            <button
              onClick={handleAdd}
              disabled={!inputText.trim()}
              className="flex-1 h-10 flex items-center justify-center gap-1.5 rounded-2xl bg-[#3F5C3A] hover:bg-[#4E7345] text-white disabled:opacity-40 transition-colors text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> เพิ่ม
            </button>
          </div>

          {/* Optional Date / Time Selector - shown when date is selected */}
          {inputDueDate && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#182018] border border-[#223022] animate-in fade-in duration-200">
              <span className="text-xs text-[#869883] whitespace-nowrap">วัน/เวลาเตือน:</span>
              <span className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#131913] border border-[#4E7345] text-xs text-[#EBF1EA] truncate">
                <Clock className="w-3 h-3 text-[#6B9361] flex-shrink-0" />
                <span className="truncate">
                  {new Date(inputDueDate).toLocaleString("th-TH", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setInputDueDate("")}
                className="text-[11px] text-[#869883] hover:text-white underline whitespace-nowrap"
              >
                ลบ
              </button>
            </div>
          )}
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
                {/* Circle-check button */}
                <button
                  onClick={() => onCompleteReminder(r)}
                  className="w-5 h-5 rounded-full border-2 border-[#374E37] flex items-center justify-center flex-shrink-0 hover:border-[#6B9361] hover:bg-[#1F2B1F] transition-all"
                  title="ทำเสร็จแล้ว — บันทึกเข้าไดอารี่"
                >
                  <span className="sr-only">ทำเสร็จแล้ว</span>
                </button>

                {/* Inline Edit or Text */}
                {editingId === r.id ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <textarea
                      autoFocus
                      ref={(el) => autoResizeTextarea(el)}
                      value={editingText}
                      onChange={(e) => {
                        setEditingText(e.target.value);
                        autoResizeTextarea(e.target);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      rows={TEXTAREA_MIN_LINES}
                      className="w-full px-3 py-1.5 rounded-xl bg-[#131913] border border-[#4E7345] text-sm leading-5 text-[#EBF1EA] outline-none resize-none"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveEdit(r.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 p-1.5 rounded-lg text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40 text-xs font-semibold"
                        title="บันทึก"
                      >
                        <Check className="w-4 h-4" /> บันทึก
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 flex items-center justify-center gap-1.5 p-1.5 rounded-lg text-gray-400 bg-white/5 hover:bg-white/10 text-xs font-semibold"
                        title="ยกเลิก"
                      >
                        <X className="w-4 h-4" /> ยกเลิก
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditDateModalOpen(true)}
                        className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#131913] border border-[#4E7345] text-xs text-[#EBF1EA] hover:border-[#6B9361] transition-colors text-left"
                      >
                        <Clock className="w-3 h-3 text-[#6B9361] flex-shrink-0" />
                        <span className="truncate">
                          {editingDueDate
                            ? new Date(editingDueDate).toLocaleString("th-TH", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "กำหนดวัน/เวลา..."}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p
                        onClick={() => handleStartEdit(r)}
                        className="text-sm text-[#EBF1EA] leading-relaxed cursor-pointer hover:text-emerald-300 transition-colors break-words whitespace-pre-wrap"
                        title="คลิกเพื่อแก้ไข"
                      >
                        {r.text}
                      </p>
                      {r.dueDate && (
                        <span className="text-[10px] font-mono text-[#6B9361] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {new Date(r.dueDate).toLocaleString("th-TH")}
                        </span>
                      )}
                    </div>

                    {/* Actions: Edit = White, Delete = Red */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleStartEdit(r)}
                        className="p-1.5 rounded-lg text-white bg-[#1F2B1F] hover:bg-[#273727] transition-all"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-white" />
                      </button>
                      <button
                        onClick={() => setDeletingId(r.id)}
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

      {/* Global Confirm Dialog for Delete */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        title="ยืนยันการลบรายการเตือนความจำ"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
        confirmText="ยืนยันลบ"
        cancelText="ยกเลิก"
        variant="danger"
        onConfirm={() => {
          if (deletingId) onDeleteReminder(deletingId);
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />

      {/* DateTime Picker — for adding new reminder */}
      <DateTimePicker
        isOpen={isDateModalOpen}
        value={inputDueDate}
        onConfirm={(v) => {
          setInputDueDate(v);
          setIsDateModalOpen(false);
        }}
        onClose={() => setIsDateModalOpen(false)}
      />

      {/* DateTime Picker — for editing existing reminder */}
      <DateTimePicker
        isOpen={isEditDateModalOpen}
        value={editingDueDate}
        onConfirm={(v) => {
          setEditingDueDate(v);
          setIsEditDateModalOpen(false);
        }}
        onClose={() => setIsEditDateModalOpen(false)}
      />
    </div>
  );
};
