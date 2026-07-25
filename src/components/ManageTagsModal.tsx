import React, { useState } from "react";
import { Tag, Plus, Edit2, Trash2, X, Check, RotateCcw } from "lucide-react";
import { DEFAULT_PRESET_TAGS } from "../lib/db";

interface ManageTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetTags: string[];
  onSavePresetTags: (tags: string[]) => void;
}

export const ManageTagsModal: React.FC<ManageTagsModalProps> = ({
  isOpen,
  onClose,
  presetTags,
  onSavePresetTags,
}) => {
  const [newTagInput, setNewTagInput] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  if (!isOpen) return null;

  // Add new tag
  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, "");
    if (!trimmed) return;
    if (!presetTags.includes(trimmed)) {
      const updated = [...presetTags, trimmed];
      onSavePresetTags(updated);
    }
    setNewTagInput("");
  };

  // Start editing a tag
  const handleStartEdit = (index: number, text: string) => {
    setEditingIndex(index);
    setEditingText(text);
  };

  // Save edited tag
  const handleSaveEdit = (index: number) => {
    const trimmed = editingText.trim().replace(/^#/, "");
    if (!trimmed) {
      handleDeleteTag(index);
      return;
    }
    const updated = [...presetTags];
    updated[index] = trimmed;
    onSavePresetTags(updated);
    setEditingIndex(null);
    setEditingText("");
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingText("");
  };

  // Delete tag
  const handleDeleteTag = (index: number) => {
    const updated = presetTags.filter((_, idx) => idx !== index);
    onSavePresetTags(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingText("");
    }
  };

  // Reset to default
  const handleResetDefault = () => {
    onSavePresetTags(DEFAULT_PRESET_TAGS);
    setEditingIndex(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-[#131913] rounded-3xl border border-[#1F2B1F] shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F2B1F] pb-3.5">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#6B9361]" />
            <h3 className="font-bold text-base text-[#EBF1EA]">จัดการแท็ก (Preset Tags)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#869883] hover:text-[#EBF1EA] hover:bg-[#182218] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add New Tag Input */}
        <div className="space-y-1.5">
          <label className="text-xs text-[#869883] block">เพิ่มแท็กใหม่</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="พิมพ์ชื่อแท็ก เช่น #ออกกำลังกาย..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#182018] border border-[#223022] text-xs sm:text-sm text-[#EBF1EA] placeholder-[#556653] focus:outline-none focus:border-[#4E7345]"
            />
            <button
              onClick={handleAddTag}
              disabled={!newTagInput.trim()}
              className="px-3.5 py-2 rounded-xl bg-[#3F5C3A] hover:bg-[#4E7345] text-xs font-bold text-white disabled:opacity-40 transition-colors flex items-center gap-1 shadow-sm whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่ม</span>
            </button>
          </div>
        </div>

        {/* Tag List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#869883]">
              รายการแท็กที่มี ({presetTags.length})
            </span>
            <button
              onClick={handleResetDefault}
              className="text-[11px] text-[#6B9361] hover:underline flex items-center gap-1"
              title="คืนค่าแท็กเริ่มต้น"
            >
              <RotateCcw className="w-3 h-3" />
              <span>คืนค่าเริ่มต้น</span>
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {presetTags.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#869883]">
                ยังไม่มีแท็ก เพิ่มแท็กใหม่ได้เลย!
              </div>
            ) : (
              presetTags.map((tag, idx) => {
                const isEditing = editingIndex === idx;

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#182018] border border-[#223022] hover:border-[#273727] transition-all"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(idx);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          autoFocus
                          className="flex-1 px-2.5 py-1 rounded-lg bg-[#131913] border border-[#4E7345] text-xs text-[#EBF1EA] focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveEdit(idx)}
                          className="p-1 rounded-lg text-[#6B9361] hover:bg-[#233523] transition-colors"
                          title="บันทึก"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 rounded-lg text-[#869883] hover:bg-[#2A1818] transition-colors"
                          title="ยกเลิก"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs font-mono text-[#EBF1EA] px-2 py-0.5 rounded-md bg-[#131913] border border-[#223022]">
                          #{tag}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(idx, tag)}
                            className="p-1.5 rounded-lg text-[#869883] hover:text-[#EBF1EA] hover:bg-[#233523] transition-colors"
                            title="แก้ไขชื่อแท็ก"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTag(idx)}
                            className="p-1.5 rounded-lg text-[#869883] hover:text-red-400 hover:bg-[#2A1818] transition-colors"
                            title="ลบแท็กนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-[#3F5C3A] hover:bg-[#4E7345] text-white text-xs font-bold transition-colors shadow-sm"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
