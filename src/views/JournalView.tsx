import React, { useState, useRef } from "react";
import { JournalEntry, UserSettings } from "../types";
import { Plus, Edit2, Trash2, X, Tag, Settings2, Smile, BookOpen, ChevronRight, Brain, Sparkles } from "lucide-react";

import { ManageTagsModal } from "../components/ManageTagsModal";
import { ManageMoodsModal } from "../components/ManageMoodsModal";
import { PresetMood } from "../lib/db";

interface JournalViewProps {
  journals: JournalEntry[];
  settings: UserSettings;
  presetTags: string[];
  presetMoods: PresetMood[];
  onAddJournal: (entry: JournalEntry) => void;
  onEditJournal?: (entry: JournalEntry) => void;
  onDeleteJournal?: (id: string) => void;
  onSavePresetTags: (tags: string[]) => void;
  onSavePresetMoods: (moods: PresetMood[]) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  journals,
  presetTags,
  presetMoods,
  onAddJournal,
  onEditJournal,
  onDeleteJournal,
  onSavePresetTags,
  onSavePresetMoods,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [moodId, setMoodId] = useState<string>(presetMoods[0]?.id ?? "happy");
  const [tags, setTags] = useState<string[]>(presetTags.slice(0, 2));
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);
  const [isManageMoodsOpen, setIsManageMoodsOpen] = useState(false);
  const [isAllJournalsOpen, setIsAllJournalsOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper: today's date string for comparison (YYYY-MM-DD)
  const todayKey = new Date().toISOString().split("T")[0];

  // Filter: only today's entries for the right column feed
  const todayJournals = journals.filter((j) => {
    // timestamp-based comparison
    if (j.timestamp) {
      const d = new Date(j.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return key === todayKey;
    }
    return false;
  });

  // Get selected mood object
  const selectedMood = presetMoods.find((m) => m.id === moodId) ?? presetMoods[0];

  // Start Editing
  const handleStartEdit = (j: JournalEntry) => {
    setEditingId(j.id);
    setContent(j.content);
    // Map stored mood to presetMoods id
    const matchedMood = presetMoods.find((m) => m.id === j.mood || m.emoji === j.mood || m.label === j.mood);
    setMoodId(matchedMood?.id ?? presetMoods[0]?.id ?? "happy");
    setTags(j.tags || []);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const len = j.content.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    }, 50);
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setContent("");
    setMoodId(presetMoods[0]?.id ?? "happy");
    setTags(presetTags.slice(0, 2));
  };

  // Toggle Preset Tag
  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  // Remove Selected Tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Handle Form Submit (Add or Edit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (editingId) {
      const existing = journals.find((j) => j.id === editingId);
      if (existing && onEditJournal) {
        onEditJournal({
          ...existing,
          content: content.trim(),
          mood: moodId as any,
          tags,
        });
      }
      handleCancelEdit();
    } else {
      const newEntry: JournalEntry = {
        id: "j-" + Date.now(),
        date: new Date().toLocaleDateString("th-TH", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        timestamp: Date.now(),
        content: content.trim(),
        mood: moodId as any,
        tags,
        title: "",
        mode: "Normal Diary",
        emotion: selectedMood?.label ?? "",
        favorite: false,
        pinned: false,
      };
      onAddJournal(newEntry);
      setContent("");
    }
  };

  const handleDelete = (id: string) => {
    if (editingId === id) handleCancelEdit();
    if (onDeleteJournal) onDeleteJournal(id);
  };

  // Get mood display for a journal entry
  const getMoodDisplay = (j: JournalEntry) => {
    const matched = presetMoods.find(
      (m) => m.id === j.mood || m.emoji === j.mood || m.label === j.mood
    );
    if (matched) return <span className="text-base">{matched.emoji}</span>;
    // Fallback: treat as raw emoji or string
    return <span className="text-base">{j.mood}</span>;
  };

  // Journal card component (reused in both main view and popup)
  const JournalCard = ({ j, inPopup = false }: { j: JournalEntry; inPopup?: boolean; key?: string }) => (

    <div
      key={j.id}
      className={`bg-[#131913] rounded-3xl p-5 border shadow-lg space-y-3 transition-all ${
        editingId === j.id ? "border-[#4E7345] ring-2 ring-[#4E7345]/30" : "border-[#1F2B1F]"
      }`}
    >
      <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-3">
        <div className="flex items-center gap-2">
          {getMoodDisplay(j)}
          <span className="text-xs font-bold text-[#EBF1EA]">{j.date}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 flex-wrap">
            {j.tags?.map((t) => (
              <span
                key={t}
                className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#182218] text-[#6B9361] border border-[#273727] font-mono"
              >
                #{t}
              </span>
            ))}
          </div>

          {/* Action Buttons: Edit & Delete */}
          {!inPopup && (
            <div className="flex items-center gap-1 ml-2 border-l border-[#1F2B1F] pl-2">
              <button
                onClick={() => handleStartEdit(j)}
                className="p-1.5 rounded-lg text-[#869883] hover:text-[#EBF1EA] hover:bg-[#182218] transition-colors"
                title="แก้ไขบันทึกนี้"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              {onDeleteJournal && (
                <button
                  onClick={() => handleDelete(j.id)}
                  className="p-1.5 rounded-lg text-[#869883] hover:text-red-400 hover:bg-[#2A1818] transition-colors"
                  title="ลบบันทึกนี้"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs sm:text-sm text-[#EBF1EA] leading-relaxed whitespace-pre-wrap">
        {j.content}
      </p>
    </div>
  );

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EBF1EA]">Daily</h2>
          <p className="text-xs text-[#869883]">ทบทวนบทเรียน ความรู้สึก และไอเดียใหม่ประจำวัน</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Create or Edit Journal Entry */}
        <div className="md:col-span-5 space-y-4">
          <form
            onSubmit={handleSubmit}
            className="bg-[#131913] rounded-3xl p-6 border border-[#1F2B1F] shadow-lg space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#EBF1EA] flex items-center gap-2">
                {editingId ? <Edit2 className="w-4 h-4 text-[#6B9361]" /> : <Plus className="w-4 h-4 text-[#6B9361]" />}
                <span>{editingId ? "แก้ไขบันทึก" : "เพิ่มบันทึกใหม่"}</span>
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-[#869883] hover:text-[#EBF1EA] flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> ยกเลิก
                </button>
              )}
            </div>

            {/* Mood Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-[#869883]">อารมณ์ความรู้สึกวันนี้</label>
                <button
                  type="button"
                  onClick={() => setIsManageMoodsOpen(true)}
                  className="text-[11px] text-[#6B9361] hover:underline flex items-center gap-1 font-medium transition-all"
                >
                  <Settings2 className="w-3 h-3" />
                  <span>จัดการอารมณ์</span>
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {presetMoods.map((item) => {
                  const isSelected = moodId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMoodId(item.id)}
                      className={`flex-1 min-w-[60px] p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                        isSelected
                          ? "bg-[#3F5C3A] border-[#4E7345] text-white shadow-sm"
                          : "bg-[#182018] border-[#223022] text-[#869883] hover:border-[#273727]"
                      }`}
                    >
                      <span className="text-base leading-none">{item.emoji}</span>
                      <span className="text-[9px] font-medium text-center leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Textarea */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs text-[#869883] block">เนื้อหาบันทึก</label>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full border transition-colors ${
                    content.trim() && content.trim().split(/\s+/).length >= 100
                      ? "bg-[#233523] border-[#4E7345] text-[#6B9361] font-bold"
                      : "bg-[#182018] border-[#223022] text-[#869883]"
                  }`}
                >
                  {content.trim() ? content.trim().split(/\s+/).length : 0}/100 คำ
                </span>
              </div>
              <textarea
                ref={textareaRef}
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="วันนี้มีเรื่องอะไรน่าจดจำ หรือมีบทเรียนอะไรที่อยากบันทึกไว้..."
                className="w-full p-3.5 rounded-2xl bg-[#182018] border border-[#223022] text-xs sm:text-sm text-[#EBF1EA] placeholder-[#697A66] focus:outline-none focus:border-[#4E7345] resize-none"
              />
              <p className="text-[10px] text-[#697A66] mt-1.5 flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-[#6B9361] flex-shrink-0" />
                <span>ยิ่งเขียนมากกว่า 100 คำ AI จะยิ่งเข้าใจตัวคุณได้ลึกซึ้งและแม่นยำยิ่งขึ้น</span>
              </p>
            </div>


            {/* Custom Tag Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#869883] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#6B9361]" />
                  <span>เลือก / เพิ่มแท็ก (Tags)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsManageTagsOpen(true)}
                  className="text-[11px] text-[#6B9361] hover:underline flex items-center gap-1 font-medium transition-all"
                >
                  <Settings2 className="w-3 h-3" />
                  <span>จัดการแท็ก</span>
                </button>
              </div>

              {/* Selected Tags Badge List */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-[#3F5C3A] text-white border border-[#4E7345] font-mono"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-red-300 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Preset Tags Chips */}
              <div className="flex flex-wrap gap-1.5">
                {presetTags.map((pt) => {
                  const isSelected = tags.includes(pt);
                  return (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => handleToggleTag(pt)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border font-mono transition-all ${
                        isSelected
                          ? "bg-[#233523] border-[#4E7345] text-[#6B9361]"
                          : "bg-[#182018] border-[#223022] text-[#869883] hover:border-[#273727]"
                      }`}
                    >
                      +{pt}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={!content.trim()}
              className="w-full py-3 rounded-2xl bg-[#3F5C3A] hover:bg-[#4E7345] text-white font-bold text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-40 shadow-sm"
            >
              {editingId ? "บันทึกการแก้ไข" : "บันทึก Daily"}
            </button>
          </form>
        </div>

        {/* Right Column: Today's Journal Feed */}
        <div className="md:col-span-7 space-y-4">
          {/* Section Header */}
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-xs text-[#869883] uppercase tracking-widest">
              บันทึกวันนี้ ({todayJournals.length})
            </h3>
            {journals.length > 0 && (
              <button
                onClick={() => setIsAllJournalsOpen(true)}
                className="flex items-center gap-1 text-[11px] text-[#6B9361] hover:underline font-semibold transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>ดูทั้งหมด ({journals.length})</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {todayJournals.length === 0 ? (
              <div className="text-center py-10 bg-[#131913] rounded-3xl border border-[#1F2B1F] text-[#869883] text-sm">
                ยังไม่มีบันทึกวันนี้ เขียน Daily แรกของวันนี้ในช่องด้านซ้ายได้เลย!
              </div>
            ) : (
              todayJournals.map((j) => <JournalCard key={j.id} j={j} />)
            )}
          </div>
        </div>
      </div>

      {/* Manage Tags Modal */}
      <ManageTagsModal
        isOpen={isManageTagsOpen}
        onClose={() => setIsManageTagsOpen(false)}
        presetTags={presetTags}
        onSavePresetTags={onSavePresetTags}
      />

      {/* Manage Moods Modal */}
      <ManageMoodsModal
        isOpen={isManageMoodsOpen}
        onClose={() => setIsManageMoodsOpen(false)}
        presetMoods={presetMoods}
        onSavePresetMoods={onSavePresetMoods}
      />

      {/* All Journals Popup */}
      {isAllJournalsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto"
          style={{ backgroundColor: "rgba(0,0,0,0.80)", backdropFilter: "blur(8px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAllJournalsOpen(false);
          }}
        >
          <div className="w-full max-w-2xl bg-[#0F160F] rounded-3xl border border-[#1F2B1F] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 mb-8">
            {/* Popup Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2B1F] sticky top-0 bg-[#0F160F] z-10">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#6B9361]" />
                <h3 className="font-bold text-base text-[#EBF1EA]">บันทึกทั้งหมด</h3>
                <span className="text-xs text-[#869883] bg-[#182018] px-2 py-0.5 rounded-full border border-[#223022]">
                  {journals.length} รายการ
                </span>
              </div>
              <button
                onClick={() => setIsAllJournalsOpen(false)}
                className="p-1.5 rounded-xl text-[#869883] hover:text-[#EBF1EA] hover:bg-[#182218] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Popup Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {journals.length === 0 ? (
                <div className="text-center py-16 text-[#869883] text-sm">
                  ยังไม่มีบันทึกเลย เริ่มเขียน Daily แรกได้เลย!
                </div>
              ) : (
                journals.map((j) => <JournalCard key={j.id} j={j} inPopup={true} />)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
