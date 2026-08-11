import React, { useState } from "react";
import { JournalEntry, LifeDimension, LIFE_DIMENSIONS, UserSettings } from "../types";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  BookOpen,
  Search,
  AlertCircle,
  Calendar,
  ChevronRight,
  ListFilter,
  Sparkles,
} from "lucide-react";
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
  presetMoods,
  onAddJournal,
  onEditJournal,
  onDeleteJournal,
  onSavePresetMoods,
}) => {
  // Modal control states
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isManageMoodsOpen, setIsManageMoodsOpen] = useState(false);

  // Journal Editor Form State
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [journalDimension, setJournalDimension] = useState<LifeDimension | "">("");
  const [journalMoodId, setJournalMoodId] = useState<string>(presetMoods[0]?.id ?? "happy");
  const [journalEmotion, setJournalEmotion] = useState("");
  const [showDimensionError, setShowDimensionError] = useState(false);

  // Deleting State
  const [deletingJournalId, setDeletingJournalId] = useState<string | null>(null);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState("");

  // Textarea auto-resize hook
  const journalContentField = useAutoResizeTextarea(journalContent, { minRows: 4, maxRows: 12 });

  const selectedMood = presetMoods.find((m) => m.id === journalMoodId) ?? presetMoods[0];

  // Reset Journal Form
  const resetJournalForm = () => {
    setEditingJournalId(null);
    setJournalTitle("");
    setJournalContent("");
    setJournalDimension("");
    setJournalEmotion("");
    setJournalMoodId(presetMoods[0]?.id ?? "happy");
    setShowDimensionError(false);
  };

  // Open Journal Modal for Create/Edit
  const handleOpenJournalModal = (journalToEdit?: JournalEntry) => {
    if (journalToEdit) {
      setEditingJournalId(journalToEdit.id);
      setJournalTitle(journalToEdit.title || "");
      setJournalContent(journalToEdit.content || "");
      setJournalDimension(journalToEdit.dimension || "mindset");
      setJournalEmotion(journalToEdit.emotion || "");
      const matchedMood = presetMoods.find(
        (m) => m.id === journalToEdit.mood || m.emoji === journalToEdit.mood || m.label === journalToEdit.mood
      );
      setJournalMoodId(matchedMood?.id ?? presetMoods[0]?.id ?? "happy");
    } else {
      resetJournalForm();
    }
    setIsJournalModalOpen(true);
  };

  // Handle Journal Submit
  const handleJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalContent.trim()) return;

    if (!journalDimension) {
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

    if (editingJournalId && onEditJournal) {
      const existing = journals.find((j) => j.id === editingJournalId);
      if (existing) {
        onEditJournal({
          ...existing,
          title: journalTitle.trim() || entryDate,
          content: journalContent.trim(),
          mood: (selectedMood?.emoji as any) || "😊",
          dimension: journalDimension as LifeDimension,
          emotion: journalEmotion,
        });
      }
    } else {
      const newEntry: JournalEntry = {
        id: `journal-${now}`,
        date: entryDate,
        timestamp: now,
        title: journalTitle.trim() || `บันทึก ${entryDate}`,
        content: journalContent.trim(),
        mode: "Normal Diary",
        mood: (selectedMood?.emoji as any) || "😊",
        emotion: journalEmotion || selectedMood?.label || "ปกติ",
        tags: [],
        favorite: false,
        pinned: false,
        dimension: journalDimension as LifeDimension,
        linkedBrainCardIds: [],
      };
      onAddJournal(newEntry);
    }

    setIsJournalModalOpen(false);
    resetJournalForm();
  };

  // Search filtered lists
  const filteredJournals = journals.filter((j) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      j.title?.toLowerCase().includes(q) ||
      j.content?.toLowerCase().includes(q) ||
      j.dimension?.toLowerCase().includes(q) ||
      j.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 pt-4 pb-28 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1F2B1F] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#6B9361]" />
            <h1 className="text-2xl font-bold text-[#EBF1EA]">Journal</h1>
          </div>
          <p className="text-xs text-[#869883] mt-1">
            รายการบันทึกเรื่องราว ความคิด และประสบการณ์ ({journals.length} รายการ)
          </p>
        </div>

        {/* Action Header Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setIsManageMoodsOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#131913] border border-[#1F2B1F] hover:border-[#273727] text-xs font-semibold text-[#869883] hover:text-[#EBF1EA] flex items-center gap-1.5 transition-all"
          >
            <Sparkles size={14} className="text-[#6B9361]" />
            <span>จัดการอารมณ์</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenJournalModal()}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #3F5C3A, #4E7345)" }}
          >
            <Plus size={15} />
            <span>เขียน Journal</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#697A66] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาใน Journal (หัวข้อ, เนื้อหา, Dimension...)"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#131913] border border-[#1F2B1F] text-xs text-[#EBF1EA] placeholder-[#556653] focus:outline-none focus:border-[#4E7345]"
        />
      </div>

      {/* Journal List / Empty State */}
      {filteredJournals.length === 0 ? (
        <div className="p-12 text-center bg-[#131913] border border-[#1F2B1F] rounded-2xl flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#182218] border border-[#273727] flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-[#6B9361]" />
          </div>
          <h2 className="text-sm font-bold text-[#EBF1EA]">
            {searchQuery ? "ไม่พบบันทึก Journal ที่ตรงกับการค้นหา" : "ยังไม่มีบันทึก Journal"}
          </h2>
          <p className="text-xs text-[#869883] max-w-xs">
            {searchQuery
              ? "ลองค้นหาด้วยคำอื่น หรือกดล้างการค้นหา"
              : "บันทึกเรื่องราว ความรู้สึก และทบทวนชีวิตของคุณได้โดยกดปุ่มเขียน Journal"}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => handleOpenJournalModal()}
              className="bg-[#4E7345] hover:bg-[#6B9361] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            >
              + เขียน Journal แรก
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJournals.map((j) => {
            const dim = LIFE_DIMENSIONS.find((d) => d.id === j.dimension);
            return (
              <div
                key={j.id}
                className="p-4 rounded-xl bg-[#131913] border border-[#1F2B1F] hover:border-[#273727] transition-all space-y-2.5 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{j.mood}</span>
                      <h3 className="font-bold text-xs text-[#EBF1EA] leading-snug">{j.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenJournalModal(j)}
                        className="p-1 rounded-lg text-[#869883] hover:text-white hover:bg-[#182218] transition-colors"
                        title="แก้ไข"
                      >
                        <Edit2 size={13} />
                      </button>
                      {onDeleteJournal && (
                        <button
                          type="button"
                          onClick={() => setDeletingJournalId(j.id)}
                          className="p-1 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors"
                          title="ลบ"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#869883] leading-relaxed whitespace-pre-wrap">
                    {j.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#182018] text-[11px] text-[#556653]">
                  <div className="flex items-center gap-1.5">
                    {dim && (
                      <span className="px-1.5 py-0.5 rounded bg-[#182218] text-[#6B9361] font-medium">
                        {dim.emoji} {dim.label}
                      </span>
                    )}
                    {j.emotion && <span>• {j.emotion}</span>}
                  </div>
                  <span>
                    {new Date(j.timestamp).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Journal Create/Edit Modal */}
      {isJournalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-[#131913] border border-[#1F2B1F] rounded-3xl p-5 md:p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1F2B1F] pb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-[#6B9361]" />
                <h3 className="text-base font-bold text-[#EBF1EA]">
                  {editingJournalId ? "แก้ไขบันทึก Journal" : "เขียน Journal ทบทวนชีวิต"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsJournalModalOpen(false);
                  resetJournalForm();
                }}
                className="p-1.5 rounded-full bg-[#182018] text-[#869883] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleJournalSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#869883] block mb-1">หัวข้อบันทึก</label>
                <input
                  type="text"
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  placeholder="เช่น สิ่งที่ได้เรียนรู้วันนี้, ความก้าวหน้า..."
                  className="w-full bg-[#182018] border border-[#223022] rounded-xl px-4 py-2.5 text-xs text-[#EBF1EA] outline-none focus:border-[#4E7345]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#869883]">
                      มิติชีวิต (Life Dimension) <span className="text-emerald-500">*</span>
                    </label>
                  </div>
                  <select
                    value={journalDimension}
                    onChange={(e) => {
                      setJournalDimension(e.target.value as LifeDimension);
                      if (e.target.value) setShowDimensionError(false);
                    }}
                    className={`w-full bg-[#182018] border rounded-xl px-3 py-2 text-xs text-[#EBF1EA] outline-none focus:border-[#4E7345] ${
                      showDimensionError ? "border-red-500" : "border-[#223022]"
                    }`}
                  >
                    <option value="">-- เลือกมิติชีวิต --</option>
                    {LIFE_DIMENSIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.emoji} {d.label}
                      </option>
                    ))}
                  </select>
                  {showDimensionError && (
                    <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={10} /> กรุณาเลือกมิติชีวิต
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#869883] block mb-1">ความรู้สึกหลัก</label>
                  <select
                    value={journalMoodId}
                    onChange={(e) => setJournalMoodId(e.target.value)}
                    className="w-full bg-[#182018] border border-[#223022] rounded-xl px-3 py-2 text-xs text-[#EBF1EA] outline-none focus:border-[#4E7345]"
                  >
                    {presetMoods.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.emoji} {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#869883] block mb-1">อารมณ์แบบเจาะจง (ไม่บังคับ)</label>
                <input
                  type="text"
                  value={journalEmotion}
                  onChange={(e) => setJournalEmotion(e.target.value)}
                  placeholder="เช่น ตื่นเต้น, รู้สึกสงบ, โล่งใจ..."
                  className="w-full bg-[#182018] border border-[#223022] rounded-xl px-4 py-2 text-xs text-[#EBF1EA] outline-none focus:border-[#4E7345]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#869883] block mb-1">
                  เนื้อหาบันทึก <span className="text-emerald-500">*</span>
                </label>
                <textarea
                  {...journalContentField.textAreaProps}
                  ref={journalContentField.ref}
                  onChange={(e) => setJournalContent(e.target.value)}
                  placeholder="เขียนเล่าเรื่องราว ความคิด ความรู้สึก ประสบการณ์..."
                  className="w-full bg-[#182018] border border-[#223022] rounded-xl p-3.5 text-xs text-[#EBF1EA] outline-none focus:border-[#4E7345] resize-none leading-relaxed overflow-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1F2B1F]">
                <button
                  type="button"
                  onClick={() => {
                    setIsJournalModalOpen(false);
                    resetJournalForm();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#182018] hover:bg-[#223022] text-[#869883] hover:text-white transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!journalContent.trim()}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all disabled:opacity-40 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #3F5C3A, #4E7345)" }}
                >
                  {editingJournalId ? "อัปเดตบันทึก" : "บันทึก Journal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog for Delete Journal */}
      <ConfirmDialog
        isOpen={deletingJournalId !== null}
        title="ยืนยันการลบบันทึก Journal"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบบันทึกนี้? ข้อมูลจะถูกลบถาวร"
        confirmText="ยืนยันลบ"
        cancelText="ยกเลิก"
        variant="danger"
        onConfirm={() => {
          if (deletingJournalId && onDeleteJournal) onDeleteJournal(deletingJournalId);
          setDeletingJournalId(null);
        }}
        onCancel={() => setDeletingJournalId(null)}
      />

      {/* Moods Management Modal */}
      <ManageMoodsModal
        isOpen={isManageMoodsOpen}
        onClose={() => setIsManageMoodsOpen(false)}
        moods={presetMoods}
        onSaveMoods={onSavePresetMoods}
      />
    </div>
  );
};
