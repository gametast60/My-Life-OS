import React, { useState } from "react";
import { JournalEntry, NoteItem, LifeDimension, LIFE_DIMENSIONS, UserSettings } from "../types";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  BookOpen,
  Zap,
  Search,
  AlertCircle,
  Calendar,
  ChevronRight,
  ListFilter,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { ManageMoodsModal } from "../components/ManageMoodsModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PresetMood } from "../lib/db";
import { useAutoResizeTextarea } from "../hooks/useAutoResizeTextarea";

interface JournalViewProps {
  journals: JournalEntry[];
  notes?: NoteItem[];
  settings: UserSettings;
  presetTags: string[];
  presetMoods: PresetMood[];
  onAddJournal: (entry: JournalEntry) => void;
  onEditJournal?: (entry: JournalEntry) => void;
  onDeleteJournal?: (id: string) => void;
  onAddNote?: (note: NoteItem) => void;
  onEditNote?: (note: NoteItem) => void;
  onDeleteNote?: (id: string) => void;
  onSavePresetTags: (tags: string[]) => void;
  onSavePresetMoods: (moods: PresetMood[]) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  journals,
  notes = [],
  presetMoods,
  onAddJournal,
  onEditJournal,
  onDeleteJournal,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onSavePresetMoods,
}) => {
  // Navigation & View Mode state: "hub" | "all_journals" | "all_notes"
  const [viewMode, setViewMode] = useState<"hub" | "all_journals" | "all_notes">("hub");

  // Modal control states
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isModeSelectModalOpen, setIsModeSelectModalOpen] = useState(false);
  const [isManageMoodsOpen, setIsManageMoodsOpen] = useState(false);

  // Journal Editor Form State
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [journalDimension, setJournalDimension] = useState<LifeDimension | "">("");
  const [journalMoodId, setJournalMoodId] = useState<string>(presetMoods[0]?.id ?? "happy");
  const [journalEmotion, setJournalEmotion] = useState("");
  const [showDimensionError, setShowDimensionError] = useState(false);

  // Quick Note Editor Form State
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  // Deleting State
  const [deletingJournalId, setDeletingJournalId] = useState<string | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState("");

  // Textarea auto-resize hooks
  const journalContentField = useAutoResizeTextarea(journalContent, { minRows: 4, maxRows: 12 });
  const noteContentField = useAutoResizeTextarea(noteContent, { minRows: 3, maxRows: 8 });

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

  // Reset Quick Note Form
  const resetNoteForm = () => {
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
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

  // Open Note Modal for Create/Edit
  const handleOpenNoteModal = (noteToEdit?: NoteItem) => {
    if (noteToEdit) {
      setEditingNoteId(noteToEdit.id);
      setNoteTitle(noteToEdit.title || "");
      setNoteContent(noteToEdit.content || "");
    } else {
      resetNoteForm();
    }
    setIsNoteModalOpen(true);
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
        tags: [], // AI suggestion flow will handle tag generation & placement suggestion
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

  // Handle Quick Note Submit
  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() && !noteTitle.trim()) return;

    const now = Date.now();
    if (editingNoteId && onEditNote) {
      const existing = notes.find((n) => n.id === editingNoteId);
      if (existing) {
        onEditNote({
          ...existing,
          title: noteTitle.trim() || existing.title,
          content: noteContent.trim(),
          updatedAt: now,
        });
      }
    } else if (onAddNote) {
      const newNote: NoteItem = {
        id: "note-" + now,
        title: noteTitle.trim() || "บันทึกด่วน " + new Date(now).toLocaleDateString("th-TH"),
        content: noteContent.trim(),
        createdAt: now,
        updatedAt: now,
      };
      onAddNote(newNote);
    }

    setIsNoteModalOpen(false);
    resetNoteForm();
  };

  // Recent 4–5 items for Hub View
  const recentJournals = journals.slice(0, 5);
  const recentNotes = notes.slice(0, 5);

  // Search filtered lists for All Views
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

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 pt-4 pb-28 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1F2B1F] pb-4">
        <div>
          <div className="flex items-center gap-2">
            {viewMode !== "hub" && (
              <button
                type="button"
                onClick={() => setViewMode("hub")}
                className="p-1.5 rounded-lg bg-[#182018] text-[#869883] hover:text-white transition-colors"
                title="ย้อนกลับ"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <h1 className="text-2xl font-bold text-[#EBF1EA]">
              {viewMode === "hub" && "บันทึก"}
              {viewMode === "all_journals" && "Journal ทั้งหมด"}
              {viewMode === "all_notes" && "บันทึกด่วน ทั้งหมด"}
            </h1>
          </div>
          <p className="text-xs text-[#869883] mt-1">
            {viewMode === "hub" && "ศูนย์รวมการบันทึกทบทวนชีวิต (Journal) และโน้ตบันทึกด่วน (Quick Note)"}
            {viewMode === "all_journals" && `รายการบันทึกเรื่องราว ความคิด และประสบการณ์ (${journals.length} รายการ)`}
            {viewMode === "all_notes" && `รายการโน้ตด่วน ไอเดีย และความทรงจำ (${notes.length} รายการ)`}
          </p>
        </div>

        {/* Action Header Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#131913] border border-[#1F2B1F] hover:border-[#273727] text-xs font-semibold text-[#869883] hover:text-[#EBF1EA] flex items-center gap-1.5 transition-all"
          >
            <ListFilter size={14} className="text-[#6B9361]" />
            <span>แสดงรายการ</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModeSelectModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #3F5C3A, #4E7345)" }}
          >
            <Plus size={15} />
            <span>สร้างใหม่</span>
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* VIEW MODE 1: HUB VIEW                                      */}
      {/* ────────────────────────────────────────────────────────── */}
      {viewMode === "hub" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Mode Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mode Card 1: Journal */}
            <div
              onClick={() => handleOpenJournalModal()}
              className="p-5 rounded-2xl bg-[#131913] border border-[#1F2B1F] hover:border-[#3F5C3A] cursor-pointer transition-all duration-200 group shadow-md space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3F5C3A]/20 border border-[#3F5C3A]/40 flex items-center justify-center text-[#6B9361] group-hover:scale-110 transition-transform">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#EBF1EA] group-hover:text-white transition-colors">
                      Journal
                    </h2>
                    <p className="text-[11px] text-[#869883]">บันทึกเรื่องราวชีวิต</p>
                  </div>
                </div>
                <span className="text-xs text-[#6B9361] bg-[#182218] px-2.5 py-1 rounded-lg border border-[#273727] font-mono">
                  {journals.length} รายการ
                </span>
              </div>
              <p className="text-xs text-[#869883] leading-relaxed">
                บันทึกเรื่องราว ความคิด ความรู้สึก ประสบการณ์อย่างละเอียด พร้อมการสะท้อนตัวตนและ AI วิเคราะห์
              </p>
              <div className="pt-2 flex items-center justify-between text-xs text-[#6B9361] font-semibold">
                <span>เขียน Journal ใหม่</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Mode Card 2: Quick Note */}
            <div
              onClick={() => handleOpenNoteModal()}
              className="p-5 rounded-2xl bg-[#131913] border border-[#1F2B1F] hover:border-[#D97706]/60 cursor-pointer transition-all duration-200 group shadow-md space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D97706]/20 border border-[#D97706]/40 flex items-center justify-center text-[#F59E0B] group-hover:scale-110 transition-transform">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#EBF1EA] group-hover:text-white transition-colors">
                      บันทึกด่วน
                    </h2>
                    <p className="text-[11px] text-[#869883]">จดเร็ว สั้น กระชับ</p>
                  </div>
                </div>
                <span className="text-xs text-[#F59E0B] bg-[#291E0A] px-2.5 py-1 rounded-lg border border-[#45300B] font-mono">
                  {notes.length} โน้ต
                </span>
              </div>
              <p className="text-xs text-[#869883] leading-relaxed">
                จดสิ่งที่นึกขึ้นได้ทันที ไอเดีย หรือข้อความสั้นก่อนลืม ทำได้อย่างรวดเร็วในไม่กี่วินาที
              </p>
              <div className="pt-2 flex items-center justify-between text-xs text-[#F59E0B] font-semibold">
                <span>สร้างบันทึกด่วน</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* ── Separate Recent Lists Section ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Journal ล่าสุด */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#1F2B1F] pb-2">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-[#6B9361]" />
                  <h3 className="text-sm font-bold text-[#EBF1EA]">Journal ล่าสุด</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode("all_journals")}
                  className="text-xs font-semibold text-[#6B9361] hover:underline flex items-center gap-0.5"
                >
                  ดูทั้งหมด ({journals.length}) <ChevronRight size={14} />
                </button>
              </div>

              {recentJournals.length === 0 ? (
                <div className="p-6 text-center bg-[#131913] border border-[#1F2B1F] rounded-2xl text-[#869883] text-xs space-y-2">
                  <p className="font-semibold">ยังไม่มี Journal</p>
                  <button
                    type="button"
                    onClick={() => handleOpenJournalModal()}
                    className="text-[11px] text-[#6B9361] hover:underline"
                  >
                    + เริ่มเขียน Journal แรก
                  </button>
                </div>
              ) : (
                <div className="max-h-[360px] overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-[#1F2B1F]">
                  {recentJournals.map((j) => {
                    const dim = LIFE_DIMENSIONS.find((d) => d.id === j.dimension);
                    return (
                      <div
                        key={j.id}
                        className="p-3.5 rounded-xl bg-[#131913] border border-[#1F2B1F] hover:border-[#273727] transition-all space-y-2 group shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{j.mood}</span>
                            <h4 className="font-bold text-xs text-[#EBF1EA] truncate max-w-[180px]">
                              {j.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenJournalModal(j)}
                              className="p-1 rounded-lg text-white hover:bg-[#182218] transition-colors"
                              title="แก้ไข"
                            >
                              <Edit2 size={13} className="text-white" />
                            </button>
                            {onDeleteJournal && (
                              <button
                                type="button"
                                onClick={() => setDeletingJournalId(j.id)}
                                className="p-1 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors"
                                title="ลบ"
                              >
                                <Trash2 size={13} className="text-red-400" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-[#869883] line-clamp-2 leading-relaxed whitespace-pre-wrap">
                          {j.content}
                        </p>

                        <div className="flex items-center justify-between pt-1 text-[11px] text-[#556653]">
                          <div className="flex items-center gap-1.5">
                            {dim && (
                              <span className="px-1.5 py-0.5 rounded bg-[#182218] text-[#6B9361] font-medium">
                                {dim.emoji} {dim.label}
                              </span>
                            )}
                          </div>
                          <span>
                            {new Date(j.timestamp).toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* บันทึกด่วน ล่าสุด */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#1F2B1F] pb-2">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-[#F59E0B]" />
                  <h3 className="text-sm font-bold text-[#EBF1EA]">บันทึกด่วน ล่าสุด</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode("all_notes")}
                  className="text-xs font-semibold text-[#F59E0B] hover:underline flex items-center gap-0.5"
                >
                  ดูทั้งหมด ({notes.length}) <ChevronRight size={14} />
                </button>
              </div>

              {recentNotes.length === 0 ? (
                <div className="p-6 text-center bg-[#131913] border border-[#1F2B1F] rounded-2xl text-[#869883] text-xs space-y-2">
                  <p className="font-semibold">ยังไม่มีบันทึกด่วน</p>
                  <button
                    type="button"
                    onClick={() => handleOpenNoteModal()}
                    className="text-[11px] text-[#F59E0B] hover:underline"
                  >
                    + สร้างบันทึกด่วนแรก
                  </button>
                </div>
              ) : (
                <div className="max-h-[360px] overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-[#1F2B1F]">
                  {recentNotes.map((n) => (
                    <div
                      key={n.id}
                      className="p-3.5 rounded-xl bg-[#131913] border border-[#1F2B1F] hover:border-[#3D2D10] transition-all space-y-2 group shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Zap size={14} className="text-[#F59E0B]" />
                          <h4 className="font-bold text-xs text-[#EBF1EA] truncate max-w-[180px]">
                            {n.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenNoteModal(n)}
                            className="p-1 rounded-lg text-white hover:bg-[#251D0D] transition-colors"
                            title="แก้ไข"
                          >
                            <Edit2 size={13} className="text-white" />
                          </button>
                          {onDeleteNote && (
                            <button
                              type="button"
                              onClick={() => setDeletingNoteId(n.id)}
                              className="p-1 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors"
                              title="ลบ"
                            >
                              <Trash2 size={13} className="text-red-400" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-[#869883] line-clamp-2 leading-relaxed whitespace-pre-wrap">
                        {n.content}
                      </p>

                      <div className="flex items-center justify-end pt-1 text-[11px] text-[#556653]">
                        <span>
                          {new Date(n.updatedAt || n.createdAt).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* VIEW MODE 2: ALL JOURNALS                                  */}
      {/* ────────────────────────────────────────────────────────── */}
      {viewMode === "all_journals" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Search bar */}
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

          {filteredJournals.length === 0 ? (
            <div className="p-8 text-center bg-[#131913] border border-[#1F2B1F] rounded-2xl text-[#869883] text-xs">
              ไม่พบบันทึก Journal ที่ตรงกับการค้นหา
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
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{j.mood}</span>
                          <h3 className="font-bold text-xs text-[#EBF1EA] leading-snug">{j.title}</h3>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenJournalModal(j)}
                            className="p-1 rounded-lg text-white hover:bg-[#182218] transition-colors"
                            title="แก้ไข"
                          >
                            <Edit2 size={13} className="text-white" />
                          </button>
                          {onDeleteJournal && (
                            <button
                              type="button"
                              onClick={() => setDeletingJournalId(j.id)}
                              className="p-1 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors"
                              title="ลบ"
                            >
                              <Trash2 size={13} className="text-red-400" />
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
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* VIEW MODE 3: ALL QUICK NOTES                               */}
      {/* ────────────────────────────────────────────────────────── */}
      {viewMode === "all_notes" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#697A66] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาในบันทึกด่วน..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#131913] border border-[#1F2B1F] text-xs text-[#EBF1EA] placeholder-[#556653] focus:outline-none focus:border-[#4E7345]"
            />
          </div>

          {filteredNotes.length === 0 ? (
            <div className="p-8 text-center bg-[#131913] border border-[#1F2B1F] rounded-2xl text-[#869883] text-xs">
              ไม่พบรายการบันทึกด่วนที่ตรงกับการค้นหา
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredNotes.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-xl bg-[#131913] border border-[#1F2B1F] hover:border-[#3D2D10] transition-all space-y-2.5 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-[#F59E0B]" />
                        <h3 className="font-bold text-xs text-[#EBF1EA] leading-snug">{n.title}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenNoteModal(n)}
                          className="p-1 rounded-lg text-white hover:bg-[#251D0D] transition-colors"
                          title="แก้ไข"
                        >
                          <Edit2 size={13} className="text-white" />
                        </button>
                        {onDeleteNote && (
                          <button
                            type="button"
                            onClick={() => setDeletingNoteId(n.id)}
                            className="p-1 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors"
                            title="ลบ"
                          >
                            <Trash2 size={13} className="text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#869883] leading-relaxed whitespace-pre-wrap">
                      {n.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-[#182018] text-[11px] text-[#556653]">
                    <span>
                      {new Date(n.updatedAt || n.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 1: MODE SELECTION POPUP                             */}
      {/* ────────────────────────────────────────────────────────── */}
      {isModeSelectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-[#131913] border border-[#1F2B1F] rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsModeSelectModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full bg-[#182018] text-[#869883] hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-[#EBF1EA]">สร้างบันทึกใหม่</h3>
              <p className="text-xs text-[#869883]">เลือกโหมดการบันทึกที่คุณต้องการ</p>
            </div>

            <div className="space-y-3">
              {/* Option 1: Journal */}
              <button
                type="button"
                onClick={() => {
                  setIsModeSelectModalOpen(false);
                  handleOpenJournalModal();
                }}
                className="w-full p-4 rounded-2xl bg-[#182018] border border-[#273727] hover:border-[#3F5C3A] text-left transition-all flex items-start gap-3 group"
              >
                <div className="p-2.5 rounded-xl bg-[#3F5C3A]/20 text-[#6B9361] group-hover:scale-105 transition-transform">
                  <BookOpen size={20} />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#EBF1EA] group-hover:text-white">
                      บันทึกแบบ Journal
                    </span>
                    <ChevronRight size={16} className="text-[#6B9361]" />
                  </div>
                  <p className="text-xs text-[#869883]">
                    บันทึกเรื่องราว ความคิด ประสบการณ์อย่างละเอียด พร้อม AI วิเคราะห์
                  </p>
                </div>
              </button>

              {/* Option 2: Quick Note */}
              <button
                type="button"
                onClick={() => {
                  setIsModeSelectModalOpen(false);
                  handleOpenNoteModal();
                }}
                className="w-full p-4 rounded-2xl bg-[#182018] border border-[#291E0A] hover:border-[#D97706] text-left transition-all flex items-start gap-3 group"
              >
                <div className="p-2.5 rounded-xl bg-[#D97706]/20 text-[#F59E0B] group-hover:scale-105 transition-transform">
                  <Zap size={20} />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#EBF1EA] group-hover:text-white">
                      บันทึกด่วน (Quick Note)
                    </span>
                    <ChevronRight size={16} className="text-[#F59E0B]" />
                  </div>
                  <p className="text-xs text-[#869883]">
                    จดบันทึกสั้นๆ รวดเร็ว ไม่ต้องจัดรูปแบบ บันทึกเสร็จในไม่กี่วินาที
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 2: JOURNAL CREATION / EDITING EDITOR                 */}
      {/* ────────────────────────────────────────────────────────── */}
      {isJournalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-[#131913] border border-[#1F2B1F] rounded-3xl p-5 md:p-6 max-w-2xl w-full my-8 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1F2B1F] pb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-[#6B9361]" />
                <h3 className="text-base font-bold text-[#EBF1EA]">
                  {editingJournalId ? "แก้ไข Journal" : "สร้าง Journal ใหม่"}
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
              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-[#869883] block mb-1">หัวข้อบันทึก (ไม่บังคับ)</label>
                <input
                  type="text"
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  placeholder="วันนี้เกิดอะไรขึ้นบ้าง..."
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
                    const isSelected = journalDimension === dim.id;
                    return (
                      <button
                        type="button"
                        key={dim.id}
                        onClick={() => {
                          setJournalDimension(dim.id);
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

              {/* Mood & Emotion */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#869883] block mb-1">เลือก Mood</label>
                  <div className="flex items-center gap-1 bg-[#182018] p-1.5 rounded-xl border border-[#223022] overflow-x-auto">
                    {presetMoods.map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setJournalMoodId(m.id)}
                        className={`p-1.5 rounded-lg text-base transition-all ${
                          journalMoodId === m.id
                            ? "bg-[#273727] border border-[#6B9361] scale-110"
                            : "opacity-60 hover:opacity-100"
                        }`}
                        title={m.label}
                      >
                        {m.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#869883] block mb-1">ความรู้สึกรายละเอียด</label>
                  <input
                    type="text"
                    value={journalEmotion}
                    onChange={(e) => setJournalEmotion(e.target.value)}
                    placeholder="เช่น ผ่อนคลาย, ภูมิใจ"
                    className="w-full bg-[#182018] border border-[#223022] rounded-xl px-3 py-2 text-xs text-[#EBF1EA] outline-none focus:border-[#4E7345]"
                  />
                </div>
              </div>

              {/* Content Textarea */}
              <div>
                <label className="text-xs font-semibold text-[#869883] block mb-1">เนื้อหาบันทึก</label>
                <textarea
                  {...journalContentField.textAreaProps}
                  ref={journalContentField.ref}
                  onChange={(e) => setJournalContent(e.target.value)}
                  placeholder="เขียนความรู้สึก ความคิด ประสบการณ์ หรือสิ่งที่ได้เรียนรู้วันนี้..."
                  className="w-full bg-[#182018] border border-[#223022] rounded-xl p-3.5 text-xs text-[#EBF1EA] outline-none focus:border-[#4E7345] resize-none leading-relaxed overflow-hidden"
                />
              </div>

              {/* AI Auto-Tagging Notice */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#182218] border border-[#273727] text-[11px] text-[#6B9361]">
                <Sparkles size={14} className="shrink-0" />
                <span>AI จะช่วยเสนอแนะแท็กและตำแหน่งจัดเก็บใน Brain Tree ให้อัตโนมัติหลังบันทึก</span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#1F2B1F]">
                <button
                  type="button"
                  onClick={() => {
                    setIsJournalModalOpen(false);
                    resetJournalForm();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!journalContent.trim()}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #3F5C3A, #4E7345)" }}
                >
                  {editingJournalId ? "อัปเดตบันทึก" : "บันทึก Journal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 3: QUICK NOTE CREATION / EDITING EDITOR              */}
      {/* ────────────────────────────────────────────────────────── */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-[#131913] border border-[#1F2B1F] rounded-3xl p-5 md:p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1F2B1F] pb-3">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-[#F59E0B]" />
                <h3 className="text-base font-bold text-[#EBF1EA]">
                  {editingNoteId ? "แก้ไขบันทึกด่วน" : "สร้างบันทึกด่วน"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNoteModalOpen(false);
                  resetNoteForm();
                }}
                className="p-1.5 rounded-full bg-[#182018] text-[#869883] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleNoteSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#869883] block mb-1">หัวข้อโน้ต (ไม่บังคับ)</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="หัวข้อ..."
                  className="w-full bg-[#182018] border border-[#223022] rounded-xl px-4 py-2.5 text-xs text-[#EBF1EA] outline-none focus:border-[#D97706]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#869883] block mb-1">ข้อความโน้ต</label>
                <textarea
                  {...noteContentField.textAreaProps}
                  ref={noteContentField.ref}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="จดสิ่งที่นึกขึ้นได้ ไอเดีย ความคิด..."
                  className="w-full bg-[#182018] border border-[#223022] rounded-xl p-3.5 text-xs text-[#EBF1EA] outline-none focus:border-[#D97706] resize-none leading-relaxed overflow-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1F2B1F]">
                <button
                  type="button"
                  onClick={() => {
                    setIsNoteModalOpen(false);
                    resetNoteForm();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!noteContent.trim() && !noteTitle.trim()}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all disabled:opacity-40 bg-[#D97706] hover:bg-[#B45309]"
                >
                  {editingNoteId ? "อัปเดตโน้ต" : "บันทึกโน้ตด่วน"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 4: LIST FILTER POPUP (แสดงรายการ)                     */}
      {/* ────────────────────────────────────────────────────────── */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-[#131913] border border-[#1F2B1F] rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1F2B1F] pb-3">
              <h3 className="text-base font-bold text-[#EBF1EA]">แสดงรายการ</h3>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1.5 rounded-full bg-[#182018] text-[#869883] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              {/* Option 1: Hub */}
              <button
                type="button"
                onClick={() => {
                  setViewMode("hub");
                  setIsFilterModalOpen(false);
                }}
                className={`w-full p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                  viewMode === "hub"
                    ? "bg-[#3F5C3A]/20 border-[#3F5C3A] text-white"
                    : "bg-[#182018] border-[#223022] text-[#869883] hover:text-[#EBF1EA]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={15} className="text-[#6B9361]" />
                  <span>หน้าหลักบันทึก (Hub)</span>
                </div>
                {viewMode === "hub" && <span className="w-2 h-2 rounded-full bg-[#6B9361]" />}
              </button>

              {/* Option 2: Journal ทั้งหมด */}
              <button
                type="button"
                onClick={() => {
                  setViewMode("all_journals");
                  setIsFilterModalOpen(false);
                }}
                className={`w-full p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                  viewMode === "all_journals"
                    ? "bg-[#3F5C3A]/20 border-[#3F5C3A] text-white"
                    : "bg-[#182018] border-[#223022] text-[#869883] hover:text-[#EBF1EA]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={15} className="text-[#6B9361]" />
                  <span>Journal ทั้งหมด ({journals.length})</span>
                </div>
                {viewMode === "all_journals" && <span className="w-2 h-2 rounded-full bg-[#6B9361]" />}
              </button>

              {/* Option 3: บันทึกด่วน ทั้งหมด */}
              <button
                type="button"
                onClick={() => {
                  setViewMode("all_notes");
                  setIsFilterModalOpen(false);
                }}
                className={`w-full p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                  viewMode === "all_notes"
                    ? "bg-[#D97706]/20 border-[#D97706] text-white"
                    : "bg-[#182018] border-[#223022] text-[#869883] hover:text-[#EBF1EA]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap size={15} className="text-[#F59E0B]" />
                  <span>บันทึกด่วน ทั้งหมด ({notes.length})</span>
                </div>
                {viewMode === "all_notes" && <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialogs for Delete */}
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

      <ConfirmDialog
        isOpen={deletingNoteId !== null}
        title="ยืนยันการลบบันทึกด่วน"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบโน้ตนี้? ข้อมูลจะถูกลบถาวร"
        confirmText="ยืนยันลบ"
        cancelText="ยกเลิก"
        variant="danger"
        onConfirm={() => {
          if (deletingNoteId && onDeleteNote) onDeleteNote(deletingNoteId);
          setDeletingNoteId(null);
        }}
        onCancel={() => setDeletingNoteId(null)}
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
