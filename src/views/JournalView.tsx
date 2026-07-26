import React, { useState, useRef } from "react";
import { JournalEntry, LifeDimension, LIFE_DIMENSIONS, UserSettings } from "../types";
import { Plus, Edit2, Trash2, X, Tag, Settings2, Smile, BookOpen, ChevronRight, Brain, Link, AlertCircle } from "lucide-react";
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
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dimension, setDimension] = useState<LifeDimension | "">("");
  const [moodId, setMoodId] = useState<string>(presetMoods[0]?.id ?? "happy");
  const [tags, setTags] = useState<string[]>([]);
  const [emotion, setEmotion] = useState("");
  const [showDimensionError, setShowDimensionError] = useState(false);

  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);
  const [isManageMoodsOpen, setIsManageMoodsOpen] = useState(false);
  const [isAllJournalsOpen, setIsAllJournalsOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Timezone-aware today date key comparison (YYYY-MM-DD)
  const todayKey = new Intl.DateTimeFormat("sv-SE", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(new Date());

  const todayJournals = journals.filter((j) => {
    if (j.timestamp) {
      const d = new Date(j.timestamp);
      const key = new Intl.DateTimeFormat("sv-SE", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }).format(d);
      return key === todayKey;
    }
    return false;
  });

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
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Journal & Reflection</h1>
          <p className="text-xs text-gray-400">บันทึกความคิด อารมณ์ และบทเรียนชีวิต (Offline First)</p>
        </div>
        <button
          onClick={() => setIsAllJournalsOpen(true)}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-900/40 transition-all flex items-center gap-1.5"
        >
          <BookOpen size={14} />
          ดูบันทึกทั้งหมด ({journals.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor (Left Column) */}
        <div className="lg:col-span-7 bg-emerald-950/10 border border-emerald-900/30 rounded-2xl p-5 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="หัวข้อบันทึก (ระบุหรือไม่ก็ได้)..."
                className="w-full bg-black/40 border border-emerald-900/40 rounded-xl px-4 py-2.5 text-xs text-gray-200 outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Life Dimension Picker (REQUIRED) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  เลือก Life Dimension <span className="text-red-400">*</span>
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
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                          : "bg-black/30 text-gray-400 border-emerald-950 hover:border-emerald-800"
                      }`}
                    >
                      <span>{dim.emoji}</span>
                      <span>{dim.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mood & Emotion */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">อารมณ์/ความรู้สึก</label>
                <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-xl border border-emerald-900/30 overflow-x-auto">
                  {presetMoods.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMoodId(m.id)}
                      className={`p-1.5 rounded-lg text-base transition-all ${
                        moodId === m.id ? "bg-emerald-700/60 scale-110" : "opacity-60 hover:opacity-100"
                      }`}
                      title={m.label}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">ความรู้สึกละเอียด</label>
                <input
                  type="text"
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                  placeholder="เช่น ผ่อนคลาย, ภูมิใจ"
                  className="w-full bg-black/40 border border-emerald-900/40 rounded-xl px-3 py-2 text-xs text-gray-200 outline-none"
                />
              </div>
            </div>

            {/* Content Area */}
            <div>
              <textarea
                ref={textareaRef}
                rows={7}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="เขียนความรู้สึก ความคิด หรือสิ่งที่ได้เรียนรู้วันนี้..."
                className="w-full bg-black/40 border border-emerald-900/40 rounded-xl p-4 text-xs text-gray-200 outline-none focus:border-emerald-500/50 resize-none leading-relaxed"
              />
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-400">แท็กที่เกี่ยวข้อง:</span>
                <button
                  type="button"
                  onClick={() => setIsManageTagsOpen(true)}
                  className="text-[11px] text-emerald-400 hover:underline"
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
                          ? "bg-emerald-800/60 text-emerald-200 border border-emerald-500/40"
                          : "bg-black/30 text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      #{t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-800 text-gray-300 hover:bg-gray-700"
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

        {/* Today's Feed (Right Column) */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-sm font-bold text-gray-300 flex items-center justify-between">
            <span>บันทึกวันนี้ ({todayJournals.length})</span>
            <span className="text-[11px] text-gray-500 font-normal">{todayKey}</span>
          </h2>

          {todayJournals.length === 0 ? (
            <div className="p-8 text-center bg-black/20 border border-emerald-900/20 rounded-2xl text-gray-500 text-xs">
              ยังไม่มีบันทึกสำหรับวันนี้ เขียนเลย! ✨
            </div>
          ) : (
            todayJournals.map((j) => {
              const dim = LIFE_DIMENSIONS.find((d) => d.id === j.dimension);
              return (
                <div
                  key={j.id}
                  className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30 space-y-2 relative group hover:border-emerald-700/40 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{j.mood}</span>
                      <h3 className="font-bold text-xs text-gray-200 truncate max-w-[180px]">
                        {j.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartEdit(j)}
                        className="p-1 text-gray-400 hover:text-emerald-400"
                      >
                        <Edit2 size={13} />
                      </button>
                      {onDeleteJournal && (
                        <button
                          onClick={() => onDeleteJournal(j.id)}
                          className="p-1 text-gray-400 hover:text-red-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                    {j.content}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-gray-400">
                    <div className="flex items-center gap-1.5">
                      {dim && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-300">
                          {dim.emoji} {dim.label}
                        </span>
                      )}
                      {j.emotion && <span className="text-gray-400">• {j.emotion}</span>}
                    </div>
                    <span>{new Date(j.timestamp).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

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
