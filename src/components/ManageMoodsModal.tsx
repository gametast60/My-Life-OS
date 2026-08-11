import React, { useState } from "react";
import { Smile, Plus, Edit2, Trash2, X, Check, RotateCcw } from "lucide-react";
import { PresetMood, DEFAULT_PRESET_MOODS } from "../lib/db";

interface ManageMoodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetMoods: PresetMood[];
  onSavePresetMoods: (moods: PresetMood[]) => void;
}

const EMOJI_OPTIONS = [
  "😊","😄","😁","🥰","😍","🤩","😎","😌","😇","🤗",
  "😐","😑","😶","🙂","😏","😒","🤔","😕","😟","😔",
  "😫","😩","😢","😭","😰","😥","😓","🥺","😮","😲",
  "😴","🤯","🥳","🤑","😤","😠","😡","🥵","🥶","🤒",
  "🙏","💪","✨","🔥","💚","💛","💙","❤️","🫶","⭐",
];

export const ManageMoodsModal: React.FC<ManageMoodsModalProps> = ({
  isOpen,
  onClose,
  presetMoods,
  onSavePresetMoods,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newEmoji, setNewEmoji] = useState("😊");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [editingEmoji, setEditingEmoji] = useState("");
  const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(false);

  if (!isOpen) return null;

  // Add new mood
  const handleAddMood = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    const id = "mood-" + Date.now();
    const updated = [...presetMoods, { id, emoji: newEmoji, label: trimmed }];
    onSavePresetMoods(updated);
    setNewLabel("");
    setNewEmoji("😊");
    setShowAddForm(false);
    setShowEmojiPicker(false);
  };

  // Start editing
  const handleStartEdit = (mood: PresetMood) => {
    setEditingId(mood.id);
    setEditingLabel(mood.label);
    setEditingEmoji(mood.emoji);
    setShowEditEmojiPicker(false);
  };

  // Save edit
  const handleSaveEdit = () => {
    const trimmed = editingLabel.trim();
    if (!trimmed) return;
    const updated = presetMoods.map((m) =>
      m.id === editingId ? { ...m, label: trimmed, emoji: editingEmoji } : m
    );
    onSavePresetMoods(updated);
    setEditingId(null);
    setShowEditEmojiPicker(false);
  };

  // Delete mood
  const handleDeleteMood = (id: string) => {
    const updated = presetMoods.filter((m) => m.id !== id);
    onSavePresetMoods(updated);
    if (editingId === id) setEditingId(null);
  };

  // Reset to default
  const handleResetDefault = () => {
    onSavePresetMoods(DEFAULT_PRESET_MOODS);
    setEditingId(null);
    setShowAddForm(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/75 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-[#131913] rounded-3xl border border-[#1F2B1F] shadow-2xl p-5 md:p-6 my-auto max-h-[88vh] flex flex-col space-y-4 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header (Fixed at top of modal) */}
        <div className="flex items-center justify-between border-b border-[#1F2B1F] pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Smile className="w-4 h-4 text-[#6B9361]" />
            <h3 className="font-bold text-base text-[#EBF1EA]">จัดการอารมณ์ (Moods)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#869883] hover:text-[#EBF1EA] hover:bg-[#182218] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-[#1F2B1F]">
          {/* Add New Mood Button / Form */}
          {!showAddForm ? (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-[#4E7345] text-[#6B9361] text-xs font-semibold hover:bg-[#1A2E1A] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              เพิ่มอารมณ์ใหม่
            </button>
          ) : (
            <div className="space-y-3 p-3.5 rounded-2xl bg-[#182018] border border-[#273727]">
              <p className="text-xs font-semibold text-[#EBF1EA]">เพิ่มอารมณ์ใหม่</p>
              {/* Emoji Selector */}
              <div className="space-y-2">
                <label className="text-[11px] text-[#869883]">เลือก Emoji</label>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#131913] border border-[#223022] text-sm hover:border-[#4E7345] transition-colors cursor-pointer"
                >
                  <span className="text-xl">{newEmoji}</span>
                  <span className="text-xs text-[#869883]">เปลี่ยน Emoji</span>
                </button>
                {showEmojiPicker && (
                  <div className="grid grid-cols-10 gap-1 p-2.5 rounded-xl bg-[#0F160F] border border-[#223022] max-h-36 overflow-y-auto">
                    {EMOJI_OPTIONS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => { setNewEmoji(em); setShowEmojiPicker(false); }}
                        className={`text-lg p-1 rounded-lg hover:bg-[#1F2B1F] transition-colors cursor-pointer ${newEmoji === em ? "bg-[#233523]" : ""}`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Label Input */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#869883]">ชื่ออารมณ์</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddMood(); }}
                  placeholder="เช่น สดใส, เครียด, มุ่งมั่น..."
                  className="w-full px-3 py-2 rounded-xl bg-[#131913] border border-[#223022] text-xs text-[#EBF1EA] placeholder-[#556653] focus:outline-none focus:border-[#4E7345]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddMood}
                  disabled={!newLabel.trim()}
                  className="flex-1 py-2 rounded-xl bg-[#3F5C3A] hover:bg-[#4E7345] text-xs font-bold text-white disabled:opacity-40 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> เพิ่ม
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setShowEmojiPicker(false); setNewLabel(""); }}
                  className="px-4 py-2 rounded-xl text-xs text-[#869883] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}

          {/* Mood List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#869883]">
                รายการอารมณ์ ({presetMoods.length})
              </span>
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-[11px] text-[#6B9361] hover:underline flex items-center gap-1 cursor-pointer"
                title="คืนค่าอารมณ์เริ่มต้น"
              >
                <RotateCcw className="w-3 h-3" />
                <span>คืนค่าเริ่มต้น</span>
              </button>
            </div>

            <div className="space-y-2">
              {presetMoods.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#869883]">
                  ยังไม่มีอารมณ์ กด "เพิ่มอารมณ์ใหม่" ด้านบน
                </div>
              ) : (
                presetMoods.map((mood) => {
                  const isEditing = editingId === mood.id;
                  return (
                    <div
                      key={mood.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#182018] border border-[#223022] hover:border-[#273727] transition-all"
                    >
                      {isEditing ? (
                        <div className="flex flex-col gap-2 flex-1 mr-2">
                          {/* Edit Emoji */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowEditEmojiPicker(!showEditEmojiPicker)}
                              className="text-xl p-1.5 rounded-lg bg-[#131913] border border-[#223022] hover:border-[#4E7345] transition-colors cursor-pointer"
                            >
                              {editingEmoji}
                            </button>
                            <input
                              type="text"
                              value={editingLabel}
                              onChange={(e) => setEditingLabel(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveEdit();
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              autoFocus
                              className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#131913] border border-[#4E7345] text-xs text-[#EBF1EA] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleSaveEdit}
                              className="p-1.5 rounded-lg text-[#6B9361] hover:bg-[#233523] transition-colors cursor-pointer"
                              title="บันทึก"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => { setEditingId(null); setShowEditEmojiPicker(false); }}
                              className="p-1.5 rounded-lg text-[#869883] hover:bg-[#2A1818] transition-colors cursor-pointer"
                              title="ยกเลิก"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {showEditEmojiPicker && (
                            <div className="grid grid-cols-10 gap-1 p-2 rounded-xl bg-[#0F160F] border border-[#223022] max-h-28 overflow-y-auto">
                              {EMOJI_OPTIONS.map((em) => (
                                <button
                                  key={em}
                                  type="button"
                                  onClick={() => { setEditingEmoji(em); setShowEditEmojiPicker(false); }}
                                  className={`text-base p-1 rounded-lg hover:bg-[#1F2B1F] transition-colors cursor-pointer ${editingEmoji === em ? "bg-[#233523]" : ""}`}
                                >
                                  {em}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{mood.emoji}</span>
                            <span className="text-xs font-medium text-[#EBF1EA]">{mood.label}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(mood)}
                              className="p-1.5 rounded-lg text-[#869883] hover:text-[#EBF1EA] hover:bg-[#233523] transition-colors cursor-pointer"
                              title="แก้ไขอารมณ์"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMood(mood.id)}
                              className="p-1.5 rounded-lg text-[#869883] hover:text-red-400 hover:bg-[#2A1818] transition-colors cursor-pointer"
                              title="ลบอารมณ์นี้"
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
        </div>

        {/* Footer (Fixed at bottom of modal) */}
        <div className="pt-2 border-t border-[#1F2B1F] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-[#3F5C3A] hover:bg-[#4E7345] text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
