import React, { useState } from "react";
import { NoteItem } from "../types";
import { Plus, Edit2, Trash2, Search, StickyNote, Check, X } from "lucide-react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useAutoResizeTextarea } from "../hooks/useAutoResizeTextarea";

interface ProgressViewProps {
  notes: NoteItem[];
  onAddNote: (note: NoteItem) => void;
  onEditNote: (note: NoteItem) => void;
  onDeleteNote: (id: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");

  const contentField = useAutoResizeTextarea(content, { minRows: 3, maxRows: 9 });
  const editContentField = useAutoResizeTextarea(editingContent, { minRows: 4, maxRows: 9 });

  // Confirm delete dialog state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !title.trim()) return;

    const now = Date.now();
    const newNote: NoteItem = {
      id: "note-" + now,
      title: title.trim() || "โน้ตด่วน " + new Date(now).toLocaleDateString("th-TH"),
      content: content.trim(),
      createdAt: now,
      updatedAt: now,
    };
    onAddNote(newNote);
    setTitle("");
    setContent("");
  };

  const handleStartEdit = (n: NoteItem) => {
    setEditingId(n.id);
    setEditingTitle(n.title);
    setEditingContent(n.content);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const existing = notes.find((n) => n.id === editingId);
    if (existing) {
      onEditNote({
        ...existing,
        title: editingTitle.trim() || existing.title,
        content: editingContent.trim(),
        updatedAt: Date.now(),
      });
    }
    setEditingId(null);
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EBF1EA] flex items-center gap-2">
            <StickyNote className="w-6 h-6 text-[#6B9361]" /> โน้ตด่วน (Quick Notes)
          </h2>
          <p className="text-xs text-[#869883]">
            บันทึกความทรงจำ ไอเดีย ข้อคิด หรือสิ่งที่นึกขึ้นได้ทันที (แยกจาก Journal)
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-[#6B9361] bg-[#182218] px-3 py-1 rounded-xl border border-[#273727]">
          {notes.length} โน้ต
        </span>
      </div>

      {/* Note Creation Form */}
      <form onSubmit={handleAdd} className="bg-[#131913] rounded-3xl p-5 border border-[#1F2B1F] shadow-lg space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="หัวข้อโน้ต..."
          className="w-full px-4 py-2.5 rounded-xl bg-[#182018] border border-[#223022] text-sm text-[#EBF1EA] placeholder-[#556653] focus:outline-none focus:border-[#4E7345]"
        />
        <textarea
          {...contentField.textAreaProps}
          ref={contentField.ref}
          onChange={(e) => setContent(e.target.value)}
          placeholder="จดสิ่งที่นึกขึ้นได้ ไอเดีย ความคิด..."
          className="w-full px-4 py-3 rounded-xl bg-[#182018] border border-[#223022] text-sm text-[#EBF1EA] placeholder-[#556653] focus:outline-none focus:border-[#4E7345] resize-none overflow-hidden"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!content.trim() && !title.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#3F5C3A] hover:bg-[#4E7345] text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> เพิ่มโน้ต
          </button>
        </div>
      </form>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#697A66] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาในโน้ต..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#131913] border border-[#1F2B1F] text-xs text-[#EBF1EA] placeholder-[#556653] focus:outline-none focus:border-[#4E7345]"
        />
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 bg-[#131913] rounded-3xl border border-[#1F2B1F] text-[#869883] space-y-2">
          <p className="text-sm font-semibold">ยังไม่มีโน้ต</p>
          <p className="text-xs text-[#556653]">พิมพ์ในช่องด้านบนเพื่อสร้างโน้ตใหม่ได้ทันที</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredNotes.map((n) => {
            const isEditing = editingId === n.id;

            return (
              <div
                key={n.id}
                className="p-5 rounded-2xl bg-[#131913] border border-[#1F2B1F] hover:border-[#273727] transition-all space-y-3 shadow-md group flex flex-col justify-between"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#182018] border border-[#4E7345] text-sm text-[#EBF1EA] outline-none"
                    />
                    <textarea
                      {...editContentField.textAreaProps}
                      ref={editContentField.ref}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#182018] border border-[#4E7345] text-xs text-[#EBF1EA] outline-none resize-none overflow-hidden"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-xs text-white"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
                      >
                        บันทึก
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm text-[#EBF1EA] leading-snug">{n.title}</h3>
                        <div className="flex items-center gap-1.5">
                          {/* Edit action — White style */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(n)}
                            className="p-1.5 rounded-lg text-white hover:bg-[#182218] transition-colors"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-white" />
                          </button>

                          {/* Delete action — Red style */}
                          <button
                            type="button"
                            onClick={() => setDeletingId(n.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-[#869883] leading-relaxed whitespace-pre-wrap">
                        {n.content}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#1F2B1F] flex justify-between items-center text-[10px] font-mono text-[#556653]">
                      <span>{new Date(n.updatedAt).toLocaleDateString("th-TH")}</span>
                      <span>{new Date(n.updatedAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Global Confirm Dialog for Delete */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        title="ยืนยันการลบโน้ต"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบโน้ตนี้? ข้อมูลจะถูกลบถาวร"
        confirmText="ยืนยันลบ"
        cancelText="ยกเลิก"
        variant="danger"
        onConfirm={() => {
          if (deletingId) onDeleteNote(deletingId);
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
