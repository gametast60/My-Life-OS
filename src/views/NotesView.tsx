import React, { useState, useRef, useEffect } from "react";
import { NoteItem } from "../types";
import { Search, Plus, Edit2, Trash2, Zap, X } from "lucide-react";
import { ConfirmDialog } from "../components/ConfirmDialog";

export interface NotesViewProps {
  notes: NoteItem[];
  onAddNote: (note: NoteItem) => void;
  onEditNote: (note: NoteItem) => void;
  onDeleteNote: (id: string) => void;
  onBack: () => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resetNoteForm = () => {
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
  };

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

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() && !noteTitle.trim()) return;

    const now = Date.now();
    if (editingNoteId) {
      const existing = notes.find((n) => n.id === editingNoteId);
      if (existing) {
        onEditNote({
          ...existing,
          title: noteTitle.trim() || existing.title,
          content: noteContent.trim(),
          updatedAt: now,
        });
      }
    } else {
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

  // Filter notes by search query
  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q);
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-[#0A0E0A] text-[#EBF1EA] rounded-2xl flex flex-col min-h-screen space-y-6">
      {/* Sticky Header */}
      <div
        className="sticky z-20 bg-[#0A0E0A] flex items-center justify-between pb-3 border-b border-[#1F2B1F] shrink-0"
        style={{ top: "var(--app-header-height)" }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="กลับ"
            onClick={onBack}
            className="p-2 rounded-xl text-[#869883] hover:text-[#EBF1EA] hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
          >
            <i className="ti ti-arrow-left text-lg" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#F59E0B]" />
            <h1 className="text-lg font-bold text-[#EBF1EA]">Notes</h1>
            <span className="text-xs text-[#869883] bg-[#182218] px-2.5 py-0.5 rounded-full border border-[#273727]">
              {notes.length} รายการ
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleOpenNoteModal()}
          className="bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-[#D97706]/20 cursor-pointer flex items-center gap-1.5"
        >
          <Plus size={15} />
          <span>เขียนโน้ตใหม่</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#697A66] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาในบันทึกด่วน..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#131913] border border-[#1F2B1F] text-xs text-[#EBF1EA] placeholder-[#556653] focus:outline-none focus:border-[#D97706]"
        />
      </div>

      {/* Notes List / Empty State */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 text-center bg-[#131913] border border-[#1F2B1F] rounded-2xl flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#182218] border border-[#273727] flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#F59E0B]/60" />
          </div>
          <h2 className="text-sm font-bold text-[#EBF1EA]">
            {searchQuery ? "ไม่พบโน้ตที่ตรงกับการค้นหา" : "ยังไม่มีบันทึกด่วน"}
          </h2>
          <p className="text-xs text-[#869883] max-w-xs">
            {searchQuery
              ? "ลองค้นหาด้วยคำอื่น หรือกดล้างการค้นหา"
              : "สร้างบันทึกด่วนหรือไอเดียย่อยได้ทันทีโดยกดปุ่มเขียนโน้ตใหม่"}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => handleOpenNoteModal()}
              className="bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            >
              เขียนโน้ตใหม่
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredNotes.map((n) => (
            <div
              key={n.id}
              className="p-4 rounded-xl bg-[#131913] border border-[#1F2B1F] hover:border-[#D97706]/40 transition-all space-y-2.5 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-[#F59E0B] shrink-0" />
                    <h3 className="font-bold text-xs text-[#EBF1EA] leading-snug">{n.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenNoteModal(n)}
                      className="p-1 rounded-lg text-[#869883] hover:text-white hover:bg-[#182218] transition-colors"
                      title="แก้ไข"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingNoteId(n.id)}
                      className="p-1 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors"
                      title="ลบ"
                    >
                      <Trash2 size={13} />
                    </button>
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

      {/* Note Create/Edit Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#131913] border border-[#1F2B1F] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1F2B1F] pb-3">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[#F59E0B]" />
                <h3 className="text-sm font-bold text-[#EBF1EA]">
                  {editingNoteId ? "แก้ไขบันทึกด่วน" : "สร้างบันทึกด่วน (Quick Note)"}
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
                <label className="block text-[11px] font-semibold text-[#869883] mb-1">
                  หัวข้อโน้ต (ไม่ใส่ก็ได้)
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="เช่น ไอเดียโปรเจกต์ใหม่..."
                  className="w-full bg-[#182018] border border-[#223022] rounded-xl px-3.5 py-2 text-xs text-[#EBF1EA] outline-none focus:border-[#D97706]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#869883] mb-1">
                  รายละเอียดโน้ต <span className="text-amber-500">*</span>
                </label>
                <textarea
                  ref={textareaRef}
                  rows={5}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="พิมพ์ข้อความโน้ตของคุณที่นี่..."
                  className="w-full bg-[#182018] border border-[#223022] rounded-xl p-3.5 text-xs text-[#EBF1EA] outline-none focus:border-[#D97706] resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1F2B1F]">
                <button
                  type="button"
                  onClick={() => {
                    setIsNoteModalOpen(false);
                    resetNoteForm();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#182018] hover:bg-[#223022] text-[#869883] hover:text-white transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!noteContent.trim() && !noteTitle.trim()}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all disabled:opacity-40 bg-[#D97706] hover:bg-[#B45309] cursor-pointer"
                >
                  {editingNoteId ? "อัปเดตโน้ต" : "บันทึกโน้ตด่วน"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deletingNoteId !== null}
        title="ยืนยันการลบบันทึกด่วน"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบโน้ตนี้? ข้อมูลจะถูกลบถาวร"
        confirmText="ยืนยันลบ"
        cancelText="ยกเลิก"
        variant="danger"
        onConfirm={() => {
          if (deletingNoteId) onDeleteNote(deletingNoteId);
          setDeletingNoteId(null);
        }}
        onCancel={() => setDeletingNoteId(null)}
      />
    </div>
  );
};
