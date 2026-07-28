import React, { useState, useRef } from "react";
import { JournalEntry, LifeDimension, LIFE_DIMENSIONS, UserSettings } from "../types";
import { Plus, Edit2, Trash2, X, Tag, BookOpen, Brain, Search, AlertCircle, Calendar } from "lucide-react";
import { ManageTagsModal } from "../components/ManageTagsModal";
import { ManageMoodsModal } from "../components/ManageMoodsModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PresetMood } from "../lib/db";
import { useAutoResizeTextarea } from "../hooks/useAutoResizeTextarea";

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
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dimension, setDimension] = useState<LifeDimension | "">("");
  const [moodId, setMoodId] = useState<string>(presetMoods[0]?.id ?? "happy");
  const [tags, setTags] = useState<string[]>([]);
  const [emotion, setEmotion] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDimensionError, setShowDimensionError] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);
  const [isManageMoodsOpen, setIsManageMoodsOpen] = useState(false);

  const contentField = useAutoResizeTextarea(content, { minRows: 3, maxRows: 10 });

  const selectedMood = presetMoods.find((m) => m.id === moodId) ?? presetMoods[0];

  const handleStartEdit = (j: JournalEntry) => {
    setEditingId(j.id);
    setTitle(j.title || "");
    setContent(j.content);
    setDimension(j.dimension || "mindset");
    setEmotion(j.emotion || "");
    const matchedMood = presetMoods.find((m) => m.id === j.mood || m.emoji === j.mood || m.label === j.mood);
    setMoodId(matchedMood?.id ?? presetMoods[0]?.id ?? "happy");
    setTags(j.tags || []);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setDimension("");
    setEmotion("");
    setMoodId(presetMoods[0]?.id ?? "happy");
    setTags([]);
    setShowDimensionError(false);
  };

  const handleToggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!dimension) {
      setShowDimensionError(true);
      return;
    }
    setShowDimensionError(false);

    const now = Date.now();
    const entryDate = new Date(now).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    if (editingId && onEditJournal) {
      const existing = journals.find((j) => j.id === editingId);
      if (existing) {
        onEditJournal({
          ...existing,
          title: title.trim() || entryDate,
          content: content.trim(),
          mood: selectedMood?.emoji as any || "😊",
          dimension: dimension as LifeDimension,
          tags,
          emotion,
        });
      }
    } else {
      const newEntry: JournalEntry = {
        id: `journal-${now}`,
        date: entryDate,
        timestamp: now,
        title: title.trim() || `บันทึก ${entryDate}`,
        content: content.trim(),
        mode: "Normal Diary",
        mood: selectedMood?.emoji as any || "😊",
        emotion: emotion || selectedMood?.label || "ปกติ",
        tags,
        favorite: false,
        pinned: false,
        dimension: dimension as LifeDimension,
        linkedBrainCardIds: [],
      };
      onAddJournal(newEntry);
    }

    handleCancelEdit();
  };

  // Filter journals across Title, Content, Tag, and Dimension
  const filteredJournals = journals.filter((j) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = j.title?.toLowerCase().includes(q);
    const matchContent = j.content?.toLowerCase().includes(q);
    const matchTag = j.tags?.some((t) => t.toLowerCase().includes(q));
    const matchDim = j.dimension?.toLowerCase().includes(q);
    return matchTitle || matchContent || matchTag || matchDim;
  });

  // Date Grouping logic (Today, Yesterday, This Month, Earlier)
  const now = new Date();
  const todayKey = new Intl.DateTimeFormat("sv-SE", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }).format(now);
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = new Intl.DateTimeFormat("sv-SE", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }).format(yesterday);

  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const groups: { label: string; items: JournalEntry[] }[] = [
    { label: "วันนี้ (Today)", items: [] },
    { label: "เมื่อวาน (Yesterday)", items: [] },
    { label: "เดือนนี้ (This Month)", items: [] },
    { label: "เดือนก่อนหน้า (Earlier)", items: [] },
  ];

  filteredJournals.forEach((j) => {
    const d = new Date(j.timestamp || Date.now());
    const dateKey = new Intl.DateTimeFormat("sv-SE", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }).format(d);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    if (dateKey === todayKey) {
      groups[0].items.push(j);
    } else if (dateKey === yesterdayKey) {
      groups[1].items.push(j);
    } else if (ym === currentYearMonth) {
      groups[2].items.push(j);
    } else {
      groups[3].items.push(j);
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4 pb-28 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#EBF1EA]">Journal & Reflection</h1>
          <p className="text-xs text-[#869883]">บันทึกความคิด อารมณ์ และบทเรียนชีวิต</p>
        </div>

        {/* Global Search Bar */}
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-[#697A66] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหา Title, Content, Tag, Topic..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#131913] border border-[#1F2B1F] text-xs text-[#EBF1EA] placeholder-[#556653] focus:outline-none focus:border-[#4E7345]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor (Left Column) */}
        <div className="lg:col-span-7 bg-[#131913] border border-[#1F2B1F] rounded-2xl p-5 space-y-4 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="หัวข้อบันทึก..."
                className="w-full bg-[#182018] border border-[#223022] rounded-xl px-4 py-2.5 text-xs text-[#EBF1EA] outline-none focus:border-[#4E7345]"
              />
            </div>

            {/* Primary Life Dimension Picker (REQUIRED) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#869883]">
                  เลือก Primary Dimension <span className="text-red-400">*</span>
                </label>
                {showDimensionError && (
                  <span className="text-[11px] text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} /> กรุณาเลือก Dimension ก่อนบันทึก
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {LIFE_DIMENSIONS.map((dim) => {
                  const isSelected = dimension === dim.id;
                  return (
                    <button
                      type="button"
                      key={dim.id}
                      onClick={() => {
                        setDimension(dim.id);
                        setShowDimensionError(false);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 border ${
                        isSelected
                          ? "bg-[#3F5C3A] text-white border-[#4E7345] shadow-md"
                          : "bg-[#182018] text-[#869883] border-[#223022] hover:border-[#273727]"
                      }`}
                    >
                      <span>{dim.emoji}</span>
                      <span>{dim.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mood Picker */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#869883] block mb-1">เลือก Mood</label>
                <div className="flex items-center gap-1 bg-[#182018] p-1.5 rounded-xl border border-[#223022] overflow-x-auto">
                  {presetMoods.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMoodId(m.id)}
                      className={`p-1.5 rounded-lg text-base transition-all ${
                        moodId === m.id ? "bg-[#273727] border border-[#6B9361] scale-110" : "opacity-60 hover:opacity-100"
                      }`}
                      title={m.label}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#869883] block mb-1">ความรู้สึกละเอียด</label>
                <input
                  type="text"
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                  placeholder="เช่น ผ่อนคลาย, ภูมิใจ"
                  className="w-full bg-[#182018] border border-[#223022] rounded-xl px-3 py-2 text-xs text-[#EBF1EA] outline-none"
                />
              </div>
            </div>

            {/* Content Textarea */}
            <div>
              <textarea
                {...contentField.textAreaProps}
                ref={contentField.ref}
                onChange={(e) => setContent(e.target.value)}
                placeholder="เขียนความรู้สึก ความคิด หรือสิ่งที่ได้เรียนรู้วันนี้..."
                className="w-full bg-[#182018] border border-[#223022] rounded-xl p-4 text-xs text-[#EBF1EA] outline-none focus:border-[#4E7345] resize-none leading-relaxed overflow-hidden"
              />
            </div>

            {/* Tags Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[#869883]">แท็กที่เกี่ยวข้อง:</span>
                <button
                  type="button"
                  onClick={() => setIsManageTagsOpen(true)}
                  className="text-[11px] text-[#6B9361] hover:underline"
                >
                  + จัดการแท็ก
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {presetTags.map((t) => {
                  const active = tags.includes(t);
                  return (
                    <button
                      type="button"
                      key={t}
                      onClick={() => handleToggleTag(t)}
                      className={`px-2 py-1 rounded-md text-[11px] transition-all ${
                        active
                          ? "bg-[#3F5C3A] text-white border border-[#4E7345]"
                          : "bg-[#182018] text-[#869883] border border-[#223022] hover:text-[#EBF1EA]"
                      }`}
                    >
                      #{t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-700 hover:bg-gray-600 text-white"
                >
                  ยกเลิก
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #4E7345, #6B9361)" }}
              >
                {editingId ? "อัปเดตบันทึก" : "บันทึก Journal"}
              </button>
            </div>
          </form>
        </div>

        {/* Grouped Feed List (Right Column) */}
        <div className="lg:col-span-5 space-y-6">
          {groups.every((g) => g.items.length === 0) ? (
            <div className="p-8 text-center bg-[#131913] border border-[#1F2B1F] rounded-2xl text-[#869883] text-xs">
              ไม่พบบันทึกที่ตรงกับคำค้นหา
            </div>
          ) : (
            groups.map((group) => {
              if (group.items.length === 0) return null;

              return (
                <div key={group.label} className="space-y-3">
                  <h3 className="text-xs font-bold text-[#6B9361] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#1F2B1F] pb-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {group.label} ({group.items.length})
                  </h3>

                  <div className="space-y-3">
                    {group.items.map((j) => {
                      const dim = LIFE_DIMENSIONS.find((d) => d.id === j.dimension);

                      return (
                        <div
                          key={j.id}
                          className="p-4 rounded-xl bg-[#131913] border border-[#1F2B1F] hover:border-[#273727] transition-all space-y-2 relative group shadow-sm"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{j.mood}</span>
                              <h4 className="font-bold text-xs text-[#EBF1EA] truncate max-w-[180px]">
                                {j.title}
                              </h4>
                            </div>

                            {/* Action Buttons: Edit = White, Delete = Red */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(j)}
                                className="p-1 rounded-lg text-white hover:bg-[#182218] transition-colors"
                                title="แก้ไข"
                              >
                                <Edit2 size={13} className="text-white" />
                              </button>
                              {onDeleteJournal && (
                                <button
                                  type="button"
                                  onClick={() => setDeletingId(j.id)}
                                  className="p-1 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors"
                                  title="ลบ"
                                >
                                  <Trash2 size={13} className="text-red-400" />
                                </button>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-[#869883] line-clamp-3 leading-relaxed whitespace-pre-wrap">
                            {j.content}
                          </p>

                          <div className="flex items-center justify-between pt-1 text-[11px] text-[#556653]">
                            <div className="flex items-center gap-1.5">
                              {dim && (
                                <span className="px-1.5 py-0.5 rounded bg-[#182218] text-[#6B9361]">
                                  {dim.emoji} {dim.label}
                                </span>
                              )}
                              {j.emotion && <span>• {j.emotion}</span>}
                            </div>
                            <span>{new Date(j.timestamp).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Global Confirm Dialog for Delete */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        title="ยืนยันการลบบันทึก Journal"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบบันทึกนี้? ข้อมูลจะถูกลบถาวร"
        confirmText="ยืนยันลบ"
        cancelText="ยกเลิก"
        variant="danger"
        onConfirm={() => {
          if (deletingId && onDeleteJournal) onDeleteJournal(deletingId);
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />

      {/* Modals */}
      <ManageTagsModal
        isOpen={isManageTagsOpen}
        onClose={() => setIsManageTagsOpen(false)}
        tags={presetTags}
        onSaveTags={onSavePresetTags}
      />
      <ManageMoodsModal
        isOpen={isManageMoodsOpen}
        onClose={() => setIsManageMoodsOpen(false)}
        moods={presetMoods}
        onSaveMoods={onSavePresetMoods}
      />
    </div>
  );
};
